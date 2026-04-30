import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
    logger.info({
        method: req.method,
        url: req.url,
        body: req.body,
        query: req.query
    }, "Request Received");
    next();
}
