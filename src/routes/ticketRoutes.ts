import { Router } from "express";
import TicketController from "../controllers/TicketController.js";

const router = Router();


router.get('/', TicketController.getAll);
router.post('/reserve', TicketController.reserve);
router.post('/purchase', TicketController.purchase);
router.post('/cleanup', TicketController.manualCleanup);

export default router;
