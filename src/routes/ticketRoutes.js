import { Router } from "express";
import TicketController from "../controllers/TicketController.js";
import { reserveLimiter } from "../middleware/redis.middleware.js";
const router = Router();
router.get('/', TicketController.getAll);
router.post('/reserve', reserveLimiter, TicketController.reserve);
router.post('/purchase', TicketController.purchase);
router.post('/cleanup', TicketController.manualCleanup);
export default router;
//# sourceMappingURL=ticketRoutes.js.map