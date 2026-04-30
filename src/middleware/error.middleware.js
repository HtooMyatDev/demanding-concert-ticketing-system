import { AppError } from "../errors/AppError.js";
import storage from "../utils/context.js";
export function globalErrorMapper(err, req, res, next) {
    const store = storage.getStore();
    const correlationId = store?.correlationId || "INTERNAL-GENERIC";
    console.log(`[Error - ${correlationId}] Stack: `, err.stack);
    let statusCode = err.status || 500;
    let errorCode = err.code || "INTERNAL_SERVER_ERROR";
    let message = err.message;
    if (err instanceof AppError) {
        // Handle your custom classes (NotFoundError, BadRequestError, etc.)
        statusCode = err.statusCode;
        errorCode = err.errorCode;
        message = err.message;
    }
    else if (err.name === "OptimisticLockVersionMismatchError") {
        // Method A: Race Condition handler
        statusCode = 409;
        errorCode = "CONCURRENCY_CONFLICT";
        message = "Another user grabbed this seat. Please try again.";
    }
    else if (err.message === "TICKETS_EXHAUSTED") {
        statusCode = 400;
        errorCode = "OUT_OF_STOCK";
        message = "Sorry, all seats for this concert have been taken.";
    }
    else if (err.status && typeof err.status === 'number') {
        // Fallback for generic errors that might have a status attached
        statusCode = err.status;
        message = err.message;
    }
    // 4. Send Response
    res.status(statusCode).json({
        success: false,
        error: errorCode,
        message: message,
        ref: `[${correlationId}]`
    });
}
//# sourceMappingURL=error.middleware.js.map