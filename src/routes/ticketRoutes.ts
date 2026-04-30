import { Router } from "express";
import TicketController from "../controllers/TicketController.js";
import { reserveLimiter } from "../middleware/redis.middleware.js";

const router = Router();

router.get('/', TicketController.getAll);

router.post('/purchase', TicketController.purchase);

router.post('/cleanup', TicketController.manualCleanup);

router.post('/reserve', reserveLimiter, TicketController.reserve);

router.post('/reserve/optimistic', reserveLimiter, TicketController.reserveOptimistic);
router.post('/reserve/pessimistic', reserveLimiter, TicketController.reservePessimistic);

export default router;
