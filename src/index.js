import "dotenv/config";
import "reflect-metadata";
import express from "express";
import cron from "node-cron";
import { correlationMiddleware } from "./middleware/correlation.middleware.js";
import { globalErrorMapper } from "./middleware/error.middleware.js";
import TicketController from "./controllers/TicketController.js";
import { AppDataSource } from "./data-source.js";
import rootRouter from "./routes/index.js";
const app = express();
const PORT = 3001;
app.use(express.json());
app.use(correlationMiddleware);
app.use('/api', rootRouter);
app.use(globalErrorMapper);
AppDataSource.initialize()
    .then(() => {
    console.log("Database connected");
    // Set up the cleanup cron job (runs every minute)
    cron.schedule("* * * * *", async () => {
        await TicketController.cleanupExpiredReservations();
    });
    console.log("Cleanup cron job scheduled.");
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
})
    .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map