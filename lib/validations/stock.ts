import { z } from "zod";

export const stockAdjustmentSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  adjustmentAmount: z.coerce
    .number()
    .int("Adjustment must be a whole number")
    .refine((val) => val !== 0, "Adjustment amount cannot be zero"),
  reason: z.string().max(255, "Reason cannot exceed 255 characters").optional().nullable(),
});

export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
