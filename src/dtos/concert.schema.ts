import { Concert } from "../entity/Concert.js"

export interface ConcertDTO {
    id: number
    name: string
    venue: string
    date: string
    availableStock: number
}

export function toConcertDTO(concert: Concert): ConcertDTO {
    return {
        id: concert.id,
        name: concert.name,
        venue: concert.venue,
        date: concert.date,
        availableStock: concert.availableStock,
    }
}
