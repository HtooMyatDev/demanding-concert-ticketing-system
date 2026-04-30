import { Router } from "express";
import ticketRoutes from "./ticketRoutes.js";
import concertRoutes from "./concertRoutes.js";

const rootRouter = Router();

rootRouter.use("/tickets", ticketRoutes);
rootRouter.use("/concerts", concertRoutes);


export default rootRouter;
