import storage from "../utils/context.js";
import { v4 as uuid } from "uuid";
export function correlationMiddleware(req, res, next) {
    const headerName = "X-Correlation-ID";
    const correlationId = req.get(headerName) || uuid();
    res.setHeader(headerName, correlationId);
    storage.run({ correlationId }, () => {
        next();
    });
}
//# sourceMappingURL=correlation.middleware.js.map