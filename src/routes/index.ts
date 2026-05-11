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
        success: true,
        message: "Concert Ticketing API v1 is operational",
        documentation: "/docs"
    });
});

export default rootRouter;
