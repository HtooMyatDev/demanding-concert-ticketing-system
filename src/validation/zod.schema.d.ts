import * as z from "zod";
export declare const ReserveSchema: z.ZodObject<{
    concertId: z.ZodNumber;
    userId: z.ZodNumber;
    category: z.ZodEnum<{
        VIP: "VIP";
        GENERAL: "GENERAL";
    }>;
    quantity: z.ZodNumber;
}, z.core.$strict>;
export declare const PurchaseSchema: z.ZodObject<{
    reservationId: z.ZodString;
    concertId: z.ZodNumber;
    userId: z.ZodNumber;
}, z.core.$strict>;
//# sourceMappingURL=zod.schema.d.ts.map