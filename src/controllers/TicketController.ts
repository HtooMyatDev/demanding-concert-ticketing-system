
import { logger } from "../utils/logger.js";
import { type NextFunction, type Request, type Response } from "express"
import { PurchaseSchema, ReserveSchema } from "../validation/zod.schema.js";
import { generateReservationId } from "../utils/generate.reservationID.js";
import { BadRequestError, NotFoundError } from "../errors/AppError.js";
import { toTicketDTO } from "../dtos/ticket.schema.js";
import { AppDataSource } from "../data-source.js";
import { Concert } from "../entity/Concert.js";
import { Ticket } from "../entity/Ticket.js";

/**
 * @swagger
 * components:
 *   schemas:
 *     ReserveRequest:
 *       type: object
 *       required:
 *         - concertId
 *         - userId
 *         - category
 *         - quantity
 *       properties:
 *         concertId:
 *           type: integer
 *           description: ID of the concert
 *         userId:
 *           type: integer
 *           description: ID of the user reserving the tickets
 *         category:
 *           type: string
 *           enum: [VIP, GENERAL]
 *           description: Seat category
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Number of tickets to reserve
 *     ReserveResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         reservationId:
 *           type: string
 *           description: Unique reservation identifier
 *     ConflictError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         error:
 *           type: string
 *           example: CONCURRENCY_CONFLICT
 *         message:
 *           type: string
 *           example: Another user grabbed this seat. Please try again.
 */
export default class TicketController {
    static async getAll(req: Request, res: Response) {
        const repo = AppDataSource.getRepository(Ticket)

        const rawTickets = await repo.find();

        // The Serialization Layer
        const data = rawTickets.map(toTicketDTO)

        return res.json({
            success: true,
            count: data.length,
            data
        });
    }

    static async purchase(req: Request, res: Response, next: NextFunction) {
        const result = PurchaseSchema.safeParse(req.body);

        if (!result.success) {
            throw new BadRequestError("Invalid purchase data");
        }
        const { reservationId, concertId, userId } = result.data;
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {
            const now = new Date();
            const tickets = await queryRunner.manager.createQueryBuilder(Ticket, "ticket")
                .where("ticket.reservationId = :reservationId", { reservationId })
                .andWhere("ticket.concertId = :concertId", { concertId })
                .andWhere("ticket.userId = :userId", { userId })
                .andWhere("ticket.status = 'reserved'")
                .andWhere("ticket.reservedUntil > :now", { now })
                .getMany();

            if (tickets.length === 0) {
                throw new NotFoundError("Reservation not found or expired");
            }

            tickets.forEach(ticket => {
                ticket.status = "sold";
                ticket.reservedUntil = null;
            });

            await queryRunner.manager.save(tickets);
            await queryRunner.commitTransaction();

            return res.json({
                success: true,
                message: `Purchased ${tickets.length} ticket(s) successfully`,
                bookingReference: reservationId
            });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            next(error);
        } finally {
            await queryRunner.release();
        }
    }


    /**
     * @swagger
     * /tickets/reserve/optimistic:
     *   post:
     *     summary: Reserve Ticket with Optimistic Locking (Method A)
     *     tags: [Tickets]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ReserveRequest'
     *     responses:
     *       200:
     *         description: Ticket reserved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ReserveResponse'
     *       409:
     *         description: Concurrency conflict detected
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ConflictError'
     */
    static async reserveOptimistic(req: Request, res: Response, next: NextFunction) {
        const result = ReserveSchema.safeParse(req.body);

        if (!result.success) {
            logger.warn({ errors: result.error.format() }, "Validation Error");
            const errorMessages = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            throw new BadRequestError(errorMessages);
        }
        const { concertId, userId, category, quantity } = result.data;
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {
            const tickets = await queryRunner.manager.createQueryBuilder(Ticket, "ticket")
                .where("ticket.concertId = :concertId", { concertId })
                .andWhere("ticket.status = 'available'")
                .limit(quantity)
                .getMany();

            if (tickets.length < quantity) {
                throw new Error("TICKETS_EXHAUSTED");
            }

            const expiry = new Date();
            expiry.setMinutes(expiry.getMinutes() + 5);
            const reservationId = generateReservationId();

            tickets.forEach(ticket => {
                ticket.status = "reserved";
                ticket.userId = userId;
                ticket.category = category;
                ticket.reservationId = reservationId;
                ticket.reservedUntil = expiry;
            });

            const stockUpdate = await queryRunner.manager.createQueryBuilder()
                .update(Concert)
                .set({ availableStock: () => `availableStock - ${quantity}` })
                .where("id = :id", { id: concertId })
                .andWhere("availableStock >= :quantity", { quantity })
                .execute();

            if (stockUpdate.affected === 0) {
                throw new Error("TICKETS_EXHAUSTED");
            }

            await queryRunner.manager.save(tickets);
            await queryRunner.commitTransaction();

            return res.json({
                success: true,
                message: "Ticket reserved for 5 minutes (Optimistic)",
                reservationId: reservationId
            });
        } catch (error: any) {
            await queryRunner.rollbackTransaction();
            next(error);
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * @swagger
     * /tickets/reserve/pessimistic:
     *   post:
     *     summary: Reserve Ticket with Pessimistic Locking (Method B)
     *     tags: [Tickets]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ReserveRequest'
     *     responses:
     *       200:
     *         description: Ticket reserved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ReserveResponse'
     *       409:
     *         description: Concurrency conflict detected
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ConflictError'
     */
    static async reservePessimistic(req: Request, res: Response, next: NextFunction) {
        const result = ReserveSchema.safeParse(req.body);

        if (!result.success) {
            logger.warn({ errors: result.error.format() }, "Validation Error");
            const errorMessages = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            throw new BadRequestError(errorMessages);
        }
        const { concertId, userId, category, quantity } = result.data;
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {
            const expiry = new Date();
            expiry.setMinutes(expiry.getMinutes() + 5);
            const reservationId = generateReservationId();

            // SQLite atomic update workaround using IN subquery
            const updateResult = await queryRunner.manager.createQueryBuilder()
                // .setLock("pessimistic_write") This doesn't work in SQLite
                .update(Ticket)
                .set({
                    status: "reserved",
                    userId: userId,
                    category: category,
                    reservationId: reservationId,
                    reservedUntil: expiry
                })
                .where(`id IN (SELECT id FROM ticket WHERE concertId = :concertId AND status = 'available' LIMIT :quantity)`, { concertId, quantity })
                .execute();

            if (updateResult.affected !== quantity) {
                throw new Error("TICKETS_EXHAUSTED");
            }

            const stockUpdate = await queryRunner.manager.createQueryBuilder()
                .update(Concert)
                .set({ availableStock: () => `availableStock - ${quantity}` })
                .where("id = :id", { id: concertId })
                .andWhere("availableStock >= :quantity", { quantity })
                .execute();

            if (stockUpdate.affected === 0) {
                throw new Error("TICKETS_EXHAUSTED");
            }

            await queryRunner.commitTransaction();

            return res.json({
                success: true,
                message: "Ticket reserved for 5 minutes (Atomic Update)",
                reservationId: reservationId
            });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            next(error);
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * @swagger
     * /tickets/reserve:
     *   post:
     *     summary: Standard Ticket Reservation
     *     tags: [Tickets]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ReserveRequest'
     *     responses:
     *       200:
     *         description: Ticket reserved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ReserveResponse'
     */
    static async reserve(req: Request, res: Response, next: NextFunction) {
        const result = ReserveSchema.safeParse(req.body);

        if (!result.success) {
            logger.warn({ errors: result.error.format() }, "Validation Error");
            const errorMessages = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            throw new BadRequestError(errorMessages);
        }

        const { concertId, userId, category, quantity } = result.data;
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const tickets = await queryRunner.manager.createQueryBuilder(Ticket, "ticket")
                .where("ticket.concertId = :concertId", { concertId })
                .andWhere("ticket.status = 'available'")
                .limit(quantity)
                .getMany();

            if (tickets.length < quantity) {
                throw new Error("TICKETS_EXHAUSTED");
            }

            const expiry = new Date();
            expiry.setMinutes(expiry.getMinutes() + 5);
            const reservationId = generateReservationId();

            tickets.forEach(ticket => {
                ticket.status = "reserved";
                ticket.userId = userId;
                ticket.category = category;
                ticket.reservationId = reservationId;
                ticket.reservedUntil = expiry;
            })

            const stockUpdate = await queryRunner.manager.createQueryBuilder()
                .update(Concert)
                .set({ availableStock: () => `availableStock - ${quantity}` })
                .where("id = :id", { id: concertId })
                .andWhere("availableStock >= :quantity", { quantity })
                .execute();

            if (stockUpdate.affected === 0) {
                throw new Error("TICKETS_EXHAUSTED");
            }

            await queryRunner.manager.save(tickets);
            await queryRunner.commitTransaction();
            return res.json({
                success: true,
                message: "Ticket reserved for 5 minutes",
                reservationId: reservationId
            });

        } catch (error: any) {
            await queryRunner.rollbackTransaction();
            next(error);
        } finally {
            await queryRunner.release();
        }
    }

    static async manualCleanup(req: Request, res: Response) {
        const count = await TicketController.cleanupExpiredReservations();
        res.json({ success: true, message: `Cleaned up ${count} expired reservations.` });
    }

    static async cleanupExpiredReservations(): Promise<number> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const expiredTickets = await queryRunner.manager.createQueryBuilder(Ticket, "ticket")
                .where("ticket.status = 'reserved'")
                .andWhere("ticket.reservedUntil <= :now", { now: new Date() })
                .getMany();

            if (expiredTickets.length === 0) {
                await queryRunner.rollbackTransaction();
                return 0;
            }

            const concertStockToRestore: Record<number, number> = {};

            for (const ticket of expiredTickets) {
                ticket.status = "available";
                ticket.userId = null as unknown as number;
                ticket.reservedUntil = null;
                ticket.reservationId = null;

                concertStockToRestore[ticket.concertId] = (concertStockToRestore[ticket.concertId] ?? 0) + 1;
            }

            for (const [concertId, amount] of Object.entries(concertStockToRestore)) {
                await queryRunner.manager.increment(Concert, { id: Number(concertId) }, "availableStock", amount);
            }

            await queryRunner.manager.save(expiredTickets);

            await queryRunner.commitTransaction();
            console.log(`[CLEANUP] Released ${expiredTickets.length} expired reservations.`);
            return expiredTickets.length;
        } catch (error) {
            console.error("[CLEANUP ERROR]", error);
            await queryRunner.rollbackTransaction();
            return 0;
        } finally {
            await queryRunner.release();
        }
    }
}
