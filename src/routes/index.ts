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

export default rootRouter;
