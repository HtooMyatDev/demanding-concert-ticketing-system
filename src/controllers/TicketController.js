import {} from "express";
import { PurchaseSchema, ReserveSchema } from "../validation/zod.schema.js";
import { generateReservationId } from "../utils/generate.reservationID.js";
import { BadRequestError, NotFoundError } from "../errors/AppError.js";
import { TicketListResponseSchema } from "../dtos/ticket.schema.js";
import { AppDataSource } from "../data-source.js";
import { Concert } from "../entity/Concert.js";
import { Ticket } from "../entity/Ticket.js";
export default class TicketController {
    static async getAll(req, res) {
        const repo = AppDataSource.getRepository(Ticket);
        const rawTickets = await repo.find();
        // The Serialization Layer
        const data = TicketListResponseSchema.parse(rawTickets);
        return res.json({
            success: true,
            count: data.length,
            data: data
        });
    }
    static async purchase(req, res, next) {
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
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            next(error); // Sends it to your globalErrorMapper
        }
        finally {
            await queryRunner.release();
        }
    }
    static async reserve(req, res, next) {
        const result = ReserveSchema.safeParse(req.body);
        if (!result.success) {
            throw new BadRequestError(result.error.message);
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
            await queryRunner.manager.decrement(Concert, { id: concertId }, "availableStock", quantity);
            await queryRunner.manager.save(tickets);
            await queryRunner.commitTransaction();
            return res.json({
                success: true,
                message: "Ticket reserved for 5 minutes",
                reservationId: reservationId
            });
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            next(error);
        }
        finally {
            await queryRunner.release();
        }
    }
    static async manualCleanup(req, res) {
        const count = await TicketController.cleanupExpiredReservations();
        res.json({ success: true, message: `Cleaned up ${count} expired reservations.` });
    }
    static async cleanupExpiredReservations() {
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
            const concertStockToRestore = {};
            for (const ticket of expiredTickets) {
                ticket.status = "available";
                ticket.userId = null;
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
        }
        catch (error) {
            console.error("[CLEANUP ERROR]", error);
            await queryRunner.rollbackTransaction();
            return 0;
        }
        finally {
            await queryRunner.release();
        }
    }
}
//# sourceMappingURL=TicketController.js.map