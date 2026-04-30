import { type NextFunction, type Request, type Response } from "express";
export default class TicketController {
    static getAll(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static purchase(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    static reserve(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    static manualCleanup(req: Request, res: Response): Promise<void>;
    static cleanupExpiredReservations(): Promise<number>;
}
//# sourceMappingURL=TicketController.d.ts.map