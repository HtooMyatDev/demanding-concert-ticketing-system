import { Ticket } from "../entity/Ticket.js"

export interface TicketDTO {
    id: number
    concertId: number
    reservationId: string | null
    seatNumber: string
    status: 'available' | 'reserved' | 'sold'
    category: string | null
    reservedUntil: Date | null
    userId: number | null
}

export function toTicketDTO(ticket: Ticket): TicketDTO {
    return {
        id: ticket.id,
        concertId: ticket.concertId,
        reservationId: ticket.reservationId,
        seatNumber: ticket.seatNumber,
        status: ticket.status,
        category: ticket.category,
        reservedUntil: ticket.reservedUntil,
        userId: ticket.userId,
    }
}
