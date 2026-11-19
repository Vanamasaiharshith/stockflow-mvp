import { prisma } from "@/lib/db/prisma";
import { StockAdjustmentInput } from "@/lib/validations/stock";

export async function adjustStock(orgId: string, input: StockAdjustmentInput) {
  return prisma.$transaction(async (tx) => {
    // 1. Fetch product and verify organization scoping
    const product = await tx.product.findFirst({
      where: {
        id: input.productId,
        organizationId: orgId, // STRICT TENANT ISOLATION
      },
    });

    if (!product) {
      throw new Error("Product not found or access denied.");
    }

    const previousQuantity = product.quantity;
    const newQuantity = previousQuantity + input.adjustmentAmount;

    // Prevent negative stock
    if (newQuantity < 0) {
      throw new Error(
        `Cannot reduce stock by ${Math.abs(
          input.adjustmentAmount
        )} units. Available stock is only ${previousQuantity}.`
      );
    }

    // 2. Update product quantity
    const updatedProduct = await tx.product.update({
      where: { id: product.id },
      data: { quantity: newQuantity },
    });

    // 3. Create stock adjustment record
    const adjustment = await tx.stockAdjustment.create({
      data: {
        organizationId: orgId,
        productId: product.id,
        previousQuantity,
        newQuantity,
        adjustmentAmount: input.adjustmentAmount,
        reason: input.reason?.trim() || "Manual adjustment",
      },
    });

    return {
      product: updatedProduct,
      adjustment,
    };
  });
}

export async function getRecentStockAdjustments(orgId: string, limit: number = 10) {
  return prisma.stockAdjustment.findMany({
    where: {
      organizationId: orgId, // STRICT TENANT ISOLATION
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
}
