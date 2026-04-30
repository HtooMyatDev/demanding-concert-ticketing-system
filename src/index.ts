import "dotenv/config";
import "reflect-metadata";
import express from "express";
import cron from "node-cron";
import { correlationMiddleware } from "./middleware/correlation.middleware.js";
import { requestLogger } from "./middleware/request.logger.js";
import { globalErrorMapper } from "./middleware/error.middleware.js";

import TicketController from "./controllers/TicketController.js";

import { AppDataSource } from "./data-source.js"

import rootRouter from "./routes/index.js";

import { options } from "./swagger.js"

import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";


const app = express();
const PORT = 3001;

const swaggerOptions = options;
const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(express.json());

app.use(correlationMiddleware);
app.use(requestLogger);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
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

        //  --- Server ---
        const server = app.listen(PORT, () => {
            console.log(`[startup] Listening on port ${PORT}`);
        });

        // --- State ---
        let isShuttingDown = false;

        // --- Track connections for drain ---
        const connections = new Set<any>();
        server.on('connection', (socket: any) => {
            connections.add(socket);
            socket.on('close', () => connections.delete(socket));
        });

        async function gracefulShutdown(signal: string) {
            if (isShuttingDown) return;
            isShuttingDown = true;

            console.log(`\n${signal} received: Starting graceful shutdown`);

            // 1. Stop accepting new connections
            server.close(() => {
                console.log('HTTP server closed.');
            });

            // 2. Wait for at least 5 seconds for pending operations
            console.log('Waiting 5 seconds for pending operations to finish...');
            await new Promise((resolve) => setTimeout(resolve, 5000));

            // 3. Close database connection
            if (AppDataSource.isInitialized) {
                await AppDataSource.destroy();
                console.log('Database connection closed.');
            }

            console.log('Graceful shutdown completed. Exiting.');
            process.exit(0);
        }

        // --- Signal Listeners ---
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    })
    .catch((err: unknown) => {
        console.error("Database connection failed:", err);
        process.exit(1);
    });
