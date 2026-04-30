import { z } from 'zod';
export declare const ConcertResponseSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    venue: z.ZodString;
    date: z.ZodString;
    availableStock: z.ZodNumber;
}, z.core.$strip>;
export declare const ConcertListResponseSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    venue: z.ZodString;
    date: z.ZodString;
    availableStock: z.ZodNumber;
}, z.core.$strip>>;
//# sourceMappingURL=concert.schema.d.ts.map