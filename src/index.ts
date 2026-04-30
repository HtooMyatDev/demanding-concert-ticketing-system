import "reflect-metadata";
import express from "express";
import cron from "node-cron";
import { AppDataSource } from "./data-source.js";
import rootRouter from "./routes/index.js";
import TicketController from "./controllers/TicketController.js";

const app = express();
app.use(express.json());

const PORT = 3001;

app.use('/api', rootRouter)

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
    .catch((err: unknown) => {
        console.error("Database connection failed:", err);
        process.exit(1);
    });
