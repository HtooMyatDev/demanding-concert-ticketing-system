import * as z from "zod";
const quantitySchema = z
    .number()
    .int({ message: "Quantity must be a whole number" })
    .min(1, { message: "Quantity must be at least 1" })
    .max(5, { message: "Quantity cannot exceed 5" });
export const ReserveSchema = z.object({
    concertId: z.number().min(1, "Concert ID is required"),
    userId: z.number(),
    category: z.enum(["VIP", "GENERAL"]),
    quantity: quantitySchema,
}).strict();
export const PurchaseSchema = z.object({
    reservationId: z.string(),
    concertId: z.number().min(1, "Concert ID is required"),
    userId: z.number(),
}).strict();
//# sourceMappingURL=zod.schema.js.map