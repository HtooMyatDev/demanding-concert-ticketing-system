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
        "name": "Concert Ticketing API",
        "version": "v1",
        "status": "operational",
        "endpoints": {
            "concerts": "GET /api/v1/concerts",
            "tickets": "GET /api/v1/tickets",
            "reserve": "POST /api/v1/tickets/reserve",
            "reserveOptimistic": "POST /api/v1/tickets/reserve/optimistic",
            "reservePessimistic": "POST /api/v1/tickets/reserve/pessimistic",
            "purchase": "POST /api/v1/tickets/purchase",
            "cleanup": "POST /api/v1/tickets/cleanup",
            "debugSentry": "GET /api/v1/debug-sentry",
            "docs": "GET /docs"
        }
    });
});

export default rootRouter;
