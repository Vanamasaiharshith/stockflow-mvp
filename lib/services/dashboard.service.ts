import { prisma } from "@/lib/db/prisma";
import { getStockStatus } from "@/lib/utils/format";

export async function getDashboardMetrics(orgId: string, defaultThreshold: number) {
  // Query all products for this organization (TENANT ISOLATED)
  const products = await prisma.product.findMany({
    where: {
      organizationId: orgId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // Calculate metrics
  let totalStockUnits = 0;
  let totalCostValue = 0;
  let totalSellingValue = 0;
  let healthyCount = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  const lowStockAlerts: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    effectiveThreshold: number;
    status: "OUT_OF_STOCK" | "LOW_STOCK";
    statusLabel: string;
    sellingPrice: number;
    costPrice: number;
  }> = [];

  for (const p of products) {
    totalStockUnits += p.quantity;
    totalCostValue += p.quantity * p.costPrice;
    totalSellingValue += p.quantity * p.sellingPrice;

    const { status, label, effectiveThreshold } = getStockStatus(
      p.quantity,
      p.lowStockThreshold,
      defaultThreshold
    );

    if (status === "OUT_OF_STOCK") {
      outOfStockCount++;
      lowStockAlerts.push({
        id: p.id,
        name: p.name,
        sku: p.sku,
        quantity: p.quantity,
        effectiveThreshold,
        status,
        statusLabel: label,
        sellingPrice: p.sellingPrice,
        costPrice: p.costPrice,
      });
    } else if (status === "LOW_STOCK") {
      lowStockCount++;
      lowStockAlerts.push({
        id: p.id,
        name: p.name,
        sku: p.sku,
        quantity: p.quantity,
        effectiveThreshold,
        status,
        statusLabel: label,
        sellingPrice: p.sellingPrice,
        costPrice: p.costPrice,
      });
    } else {
      healthyCount++;
    }
  }

  // Sort low stock alerts so out of stock (0) is first, then ascending by quantity
  lowStockAlerts.sort((a, b) => a.quantity - b.quantity);

  const totalProducts = products.length;
  const potentialMargin = totalSellingValue - totalCostValue;
  const marginPercentage =
    totalSellingValue > 0 ? (potentialMargin / totalSellingValue) * 100 : 0;

  // Recent Stock Adjustments
  const recentAdjustments = await prisma.stockAdjustment.findMany({
    where: {
      organizationId: orgId,
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
    take: 6,
  });

  // Recent Products
  const recentProducts = products.slice(0, 5).map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    quantity: p.quantity,
    sellingPrice: p.sellingPrice,
    costPrice: p.costPrice,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));

  return {
    kpis: {
      totalProducts,
      totalStockUnits,
      totalCostValue,
      totalSellingValue,
      lowStockCount,
      outOfStockCount,
      potentialMargin,
      marginPercentage,
    },
    inventoryHealth: {
      healthyCount,
      lowStockCount,
      outOfStockCount,
      healthyPercent: totalProducts > 0 ? Math.round((healthyCount / totalProducts) * 100) : 0,
      lowStockPercent: totalProducts > 0 ? Math.round((lowStockCount / totalProducts) * 100) : 0,
      outOfStockPercent: totalProducts > 0 ? Math.round((outOfStockCount / totalProducts) * 100) : 0,
    },
    lowStockAlerts: lowStockAlerts.slice(0, 8),
    recentAdjustments,
    recentProducts,
  };
}
