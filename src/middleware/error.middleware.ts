import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import storage from "../utils/context.js";
import { logger } from "../utils/logger.js";

interface IAsyncLocalStorage {
    correlationId?: string;
}

export function globalErrorMapper(err: any, req: Request, res: Response, next: NextFunction) {
    const store = storage.getStore() as IAsyncLocalStorage | undefined;
    const correlationId = store?.correlationId || "INTERNAL-GENERIC";

    let statusCode = err.status || 500;
    let errorCode = err.code || "INTERNAL_SERVER_ERROR";
    let message = err.message;

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        errorCode = err.errorCode;
        message = err.message;
    } else if (err.name === "OptimisticLockVersionMismatchError") {
        statusCode = 409;
        errorCode = "CONCURRENCY_CONFLICT";
        message = "Another user grabbed this seat. Please try again.";
    } else if (err.message === "TICKETS_EXHAUSTED") {
        statusCode = 400;
        errorCode = "OUT_OF_STOCK";
        message = "Sorry, all seats for this concert have been taken.";
    } else if (
        err.message?.toLowerCase().includes("database is locked") || 
        err.message?.toLowerCase().includes("cannot start a transaction") ||
        err.code === "SQLITE_BUSY" ||
        err.name === "QueryFailedError" && err.message?.includes("busy")
    ) {
        statusCode = 503;
        errorCode = "DATABASE_BUSY";
        message = "The server is currently busy handling other reservations. Please try again in a few seconds.";
    }

    // Log 5xx errors as ERROR, and 4xx as WARN to reduce noise
    const logData = { err, correlationId, url: req.url, method: req.method };
    if (statusCode >= 500) {
        logger.error(logData, "Global Error Caught");
    } else {
        logger.warn(logData, "Client-side or Logic Error");
    }

    res.status(statusCode).json({
        success: false,
        error: errorCode,
        message: message,
        ref: `[${correlationId}]`
    });
}
