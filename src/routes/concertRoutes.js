import { Router } from "express";
import concertController from "../controllers/ConcertController.js";
const router = Router();
router.get("/", concertController.getAll);
export default router;
//# sourceMappingURL=concertRoutes.js.map