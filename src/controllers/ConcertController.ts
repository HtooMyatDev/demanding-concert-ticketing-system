import { type Request, type Response, Router } from "express"
import { AppDataSource } from "../data-source.js";
import { Concert } from "../entity/Concert.js";


export default class ConcertController {
    static async getAll(req: Request, res: Response) {
        const concerts = await AppDataSource.getRepository(Concert).find();
        res.json(concerts);
    }
}
