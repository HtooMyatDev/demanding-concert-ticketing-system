import { type NextFunction, type Request, type Response } from "express";
import { BadRequestError, NotFoundError } from "../errors/AppError.js";
import { toConcertDTO } from "../dtos/concert.schema.js";
import { AppDataSource } from "../data-source.js";
import { Concert } from "../entity/Concert.js";

export default class ConcertController {
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const repo = AppDataSource.getRepository(Concert);
            const rawConcerts = await repo.find();

            if (!rawConcerts || rawConcerts.length === 0) {
                throw new NotFoundError("No concerts currently scheduled.");
            }

            // The Serialization Layer
            const data = rawConcerts.map(toConcertDTO);

            return res.json({
                success: true,
                count: data.length,
                data
            });
        } catch (error) {
            next(error);
        }
    }

    static async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            // 1. Validate that the ID is a number
            const concertId = parseInt(id as string, 10);
            if (isNaN(concertId)) {
                throw new BadRequestError("Invalid concert ID format.");
            }

            const repo = AppDataSource.getRepository(Concert);
            const rawConcert = await repo.findOne({
                where: { id: concertId }
            });

            // 2. Handle 404
            if (!rawConcert) {
                throw new NotFoundError(`Concert with ID ${concertId} not found.`);
            }

            // 3. Serialize and respond
            const data = toConcertDTO(rawConcert);

            return res.json({
                success: true,
                data
            });
        } catch (error) {
            next(error);
        }
    }

}
