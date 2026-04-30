import { z } from 'zod';
export declare const TicketResponseSchema: z.ZodObject<{
    id: z.ZodNumber;
    concertId: z.ZodNumber;
    reservationId: z.ZodNullable<z.ZodString>;
    seatNumber: z.ZodString;
    status: z.ZodEnum<{
        available: "available";
        reserved: "reserved";
        sold: "sold";
    }>;
    category: z.ZodNullable<z.ZodString>;
    reservedUntil: z.ZodNullable<z.ZodDate>;
    userId: z.ZodNullable<z.ZodNumber>;
}, z.core.$strip>;
export declare const TicketListResponseSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodNumber;
    concertId: z.ZodNumber;
    reservationId: z.ZodNullable<z.ZodString>;
    seatNumber: z.ZodString;
    status: z.ZodEnum<{
        available: "available";
        reserved: "reserved";
        sold: "sold";
    }>;
    category: z.ZodNullable<z.ZodString>;
    reservedUntil: z.ZodNullable<z.ZodDate>;
    userId: z.ZodNullable<z.ZodNumber>;
}, z.core.$strip>>;
export type TicketDTO = z.infer<typeof TicketResponseSchema>;
//# sourceMappingURL=ticket.schema.d.ts.map