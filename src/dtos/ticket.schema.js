import { z } from 'zod';
export const TicketResponseSchema = z.object({
    id: z.number(),
    concertId: z.number(),
    reservationId: z.string().nullable(),
    seatNumber: z.string(),
    status: z.enum(['available', 'reserved', 'sold']),
    category: z.string().nullable(),
    reservedUntil: z.date().nullable(),
    userId: z.number().nullable(),
});
export const TicketListResponseSchema = z.array(TicketResponseSchema);
//# sourceMappingURL=ticket.schema.js.map