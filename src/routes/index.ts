import { Router } from "express";
import ticketRoutes from "./ticketRoutes.js";
import concertRoutes from "./concertRoutes.js";
import { ConcurrencyError } from "../errors/AppError.js";

const rootRouter = Router();

rootRouter.use("/tickets", ticketRoutes);
rootRouter.use("/concerts", concertRoutes);

// Sentry Debug Route
rootRouter.get("/debug-sentry", (req, res) => {
    throw new ConcurrencyError("Manual Trigger: Concurrency conflict detected!");
});

rootRouter.get("/", (req, res) => {
    res.json({
        "name": "High-Demand Ticket Reservation Backend",
        "status": "ok",
        "endpoints": {
            "health": "GET /health",
            "healthV1": "GET /api/v1/health",
            "concerts": "GET /concerts",
            "concertsV1": "GET /api/v1/concerts",
            "tickets": "GET /tickets",
            "ticketsV1": "GET /api/v1/tickets",
            "reserve": "POST /reserve",
            "reserveV1": "POST /api/v1/reserve",
            "createTicket": "POST /tickets",
            "createTicketV1": "POST /api/v1/tickets",
            "purchase": "POST /purchase",
            "purchaseV1": "POST /api/v1/purchase",
            "purchaseOptimistic": "POST /tickets/:ticketId/purchase-optimistic",
            "purchaseOptimisticV1": "POST /api/v1/tickets/:ticketId/purchase-optimistic",
            "purchasePessimistic": "POST /tickets/:ticketId/purchase-pessimistic",
            "purchasePessimisticV1": "POST /api/v1/tickets/:ticketId/purchase-pessimistic",
            "cleanup": "POST /cleanup",
            "cleanupV1": "POST /api/v1/cleanup",
            "docs": "GET /api-docs",
            "docsV1": "GET /api/v1/docs"
        }
    });
});

export default rootRouter;
