import pino from "pino";
import storage from "./context.js";
export const logger = pino({
    level: process.env.NODE_ENV === "development" ? "trace" : "info",
    mixin() {
        const store = storage.getStore();
        return store ? { correlationId: store.correlationId } : {};
    }
});
//# sourceMappingURL=logger.js.map