import {} from "express";
import { AppDataSource } from "../data-source.js";
import { Concert } from "../entity/Concert.js";
import { NotFoundError } from "../errors/AppError.js";
import { ConcertListResponseSchema } from "../dtos/concert.schema.js";
export default class ConcertController {
    static async getAll(req, res, next) {
        try {
            const repo = AppDataSource.getRepository(Concert);
            const rawConcerts = await repo.find();
            if (!rawConcerts || rawConcerts.length === 0) {
                throw new NotFoundError("No concerts currently scheduled.");
            }
            const data = ConcertListResponseSchema.parse(rawConcerts);
            return res.json({
                success: true,
                count: data.length,
                data: data
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getOne(req, res, next) {
        try {
            const repo = AppDataSource.getRepository(Concert);
            const rawConcert = await repo.findOne({ where: { id: req.params.id } });
            if (!rawConcert) {
                throw new NotFoundError("No concerts currently scheduled.");
            }
            const data = ConcertResponseSchema.parse(rawConcert);
            return res.json({
                success: true,
                data: data
            });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=ConcertController.js.map