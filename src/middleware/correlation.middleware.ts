import type { NextFunction, Request, Response } from "express";
import storage from "../utils/context.js";
import { v4 as uuid } from "uuid";

export function correlationMiddleware(req: Request, res: Response, next: NextFunction) {
    const headerName = "X-Correlation-ID"
    const correlationId = req.get(headerName) || uuid();
    res.setHeader(headerName, correlationId);
    storage.run({ correlationId }, () => {
        next();
    });
}
