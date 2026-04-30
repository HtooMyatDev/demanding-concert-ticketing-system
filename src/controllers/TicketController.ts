import { type Request, type Response, Router } from "express"
import { AppDataSource } from "../data-source.js";
import { Ticket } from "../entity/Ticket.js";
import { Concert } from "../entity/Concert.js";

export default class TicketController {
    static async getAll(req: Request, res: Response) {
        const tickets = await AppDataSource.getRepository(Ticket).find();

        // Format the dates to Thailand time (Asia/Bangkok)
        const formattedTickets = tickets.map(ticket => ({
            ...ticket,
            reservedUntil: ticket.reservedUntil
                ? ticket.reservedUntil.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })
                : null
        }));

        res.json(formattedTickets);
    }

    static async purchase(req: Request, res: Response) {
        const { ticketId, userId } = req.body as { ticketId: number, userId: string }
        const repo = AppDataSource.getRepository(Ticket);

        const ticket = await repo.findOneBy({ id: ticketId, status: "reserved" });

        if (!ticket) return res.status(404).json({ message: "Reservation not found or expired" });

        ticket.status = "sold";
        await repo.save(ticket);

        res.json({ success: true, message: "Ticket purchased successfully" });
    }

    static async reserve(req: Request, res: Response) {
        const { concertId, userId, category} = req.body;

        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {
            const ticket = await queryRunner.manager.createQueryBuilder(Ticket, "ticket")
                .where("ticket.concertId = :concertId", { concertId })
                .andWhere("ticket.status = 'available'")
                .getOne();

            if (!ticket) {
                throw new Error("NO_TICKETS");
            }

            const expiry = new Date();
            expiry.setMinutes(expiry.getMinutes() + 5);

            ticket.status = "reserved";
            ticket.userId = userId;
            ticket.category = category;
            ticket.reservedUntil = expiry;

            await queryRunner.manager.decrement(Concert, { id: concertId }, "availableStock", 1);

            await queryRunner.manager.save(ticket);

            await queryRunner.commitTransaction();

            return res.json({ success: true, message: "Ticket reserved for 5 minutes", ticketId: ticket.id });

        } catch (error: any) {
            console.error("[LOG] Transaction failed, rolling back changes:", error.message);
            await queryRunner.rollbackTransaction();

            if (error.name === "OptimisticLockVersionMismatchError") {
                return res.status(409).json({ message: "Ticket was grabbed by someone else! Please try again." });
            }
            if (error.message === "NO_TICKETS") {
                return res.status(400).json({ message: "No tickets left" });
            }
            console.error("Reservation Error:", error);
            return res.status(500).json({ message: "Internal server error" });
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
