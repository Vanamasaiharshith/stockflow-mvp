import { prisma } from "@/lib/db/prisma";
import { getStockStatus } from "@/lib/utils/format";

export async function getInventoryInsights(orgId: string, defaultThreshold: number) {
  const products = await prisma.product.findMany({
    where: {
      organizationId: orgId, // STRICT TENANT ISOLATION
    },
    include: {
      _count: {
        select: { stockAdjustments: true },
      },
    },
  });

  const totalProducts = products.length;

  let totalStockUnits = 0;
  let totalCostValuation = 0;
  let totalSellingValuation = 0;
  let healthyCount = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  const enriched = products.map((p) => {
    const { status, label, effectiveThreshold } = getStockStatus(
      p.quantity,
      p.lowStockThreshold,
      defaultThreshold
    );
    const costValue = p.quantity * p.costPrice;
    const sellingValue = p.quantity * p.sellingPrice;
    const margin = sellingValue - costValue;

    if (status === "HEALTHY") healthyCount++;
    else if (status === "LOW_STOCK") lowStockCount++;
    else outOfStockCount++;

    totalStockUnits += p.quantity;
    totalCostValuation += costValue;
    totalSellingValuation += sellingValue;

    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      quantity: p.quantity,
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      costValue,
      sellingValue,
      margin,
      status,
      statusLabel: label,
      effectiveThreshold,
      adjustmentsCount: p._count.stockAdjustments,
    };
  });

  const potentialProfit = totalSellingValuation - totalCostValuation;
  const overallMarginPercent =
    totalSellingValuation > 0
      ? Number(((potentialProfit / totalSellingValuation) * 100).toFixed(1))
      : 0;

  const lowStockPercent =
    totalProducts > 0 ? Number(((lowStockCount / totalProducts) * 100).toFixed(1)) : 0;
  const outOfStockPercent =
    totalProducts > 0 ? Number(((outOfStockCount / totalProducts) * 100).toFixed(1)) : 0;
  const healthyPercent =
    totalProducts > 0 ? Number(((healthyCount / totalProducts) * 100).toFixed(1)) : 0;

  // Highest stock products (top 5)
  const highestStockProducts = [...enriched]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Lowest stock products (top 5)
  const lowestStockProducts = [...enriched]
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 5);

  // Products with the highest inventory cost value (top 5)
  const highestValueProducts = [...enriched]
    .sort((a, b) => b.costValue - a.costValue)
    .slice(0, 5);

  // Health distribution chart data
  const healthDistribution = [
    { name: "In Stock", value: healthyCount, percentage: healthyPercent, color: "#16a34a" },
    { name: "Low Stock", value: lowStockCount, percentage: lowStockPercent, color: "#f59e0b" },
    { name: "Out of Stock", value: outOfStockCount, percentage: outOfStockPercent, color: "#ef4444" },
  ];

  // Stock Valuation Comparison chart data (top 6 highest value products)
  const valuationComparison = highestValueProducts.map((p) => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + "..." : p.name,
    costValue: Math.round(p.costValue),
    sellingValue: Math.round(p.sellingValue),
  }));

  return {
    summary: {
      totalProducts,
      totalStockUnits,
      totalCostValuation,
      totalSellingValuation,
      potentialProfit,
      overallMarginPercent,
      healthyCount,
      lowStockCount,
      outOfStockCount,
      healthyPercent,
      lowStockPercent,
      outOfStockPercent,
    },
    healthDistribution,
    valuationComparison,
    highestStockProducts,
    lowestStockProducts,
    highestValueProducts,
  };
}
