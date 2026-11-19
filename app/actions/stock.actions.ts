"use server";

import { requireAuth } from "@/lib/auth/session";
import { adjustStock } from "@/lib/services/stock.service";
import { stockAdjustmentSchema, StockAdjustmentInput } from "@/lib/validations/stock";
import { revalidatePath } from "next/cache";

export type StockActionResponse = {
  success: boolean;
  message?: string;
  data?: unknown;
};

export async function adjustStockAction(
  values: StockAdjustmentInput
): Promise<StockActionResponse> {
  const auth = await requireAuth();
  const orgId = auth.organization.id;

  const validated = stockAdjustmentSchema.safeParse(values);
  if (!validated.success) {
    return {
      success: false,
      message: validated.error.issues[0]?.message || "Invalid stock adjustment data.",
    };
  }

  try {
    const result = await adjustStock(orgId, validated.data);
    revalidatePath("/dashboard");
    revalidatePath("/products");
    revalidatePath("/inventory-insights");

    const changeSign = result.adjustment.adjustmentAmount > 0 ? "+" : "";
    return {
      success: true,
      message: `Stock for "${result.product.name}" adjusted by ${changeSign}${result.adjustment.adjustmentAmount}. New quantity: ${result.product.quantity}`,
      data: result,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to adjust stock.";
    return {
      success: false,
      message: msg,
    };
  }
}
