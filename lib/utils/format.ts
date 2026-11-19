export function formatCurrency(amount: number, currency: string = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export type StockStatus = "OUT_OF_STOCK" | "LOW_STOCK" | "HEALTHY";

export function getStockStatus(
  quantity: number,
  productThreshold: number | null | undefined,
  orgDefaultThreshold: number = 10
): { status: StockStatus; label: string; effectiveThreshold: number } {
  const effectiveThreshold =
    productThreshold !== null && productThreshold !== undefined
      ? productThreshold
      : orgDefaultThreshold;

  if (quantity === 0) {
    return { status: "OUT_OF_STOCK", label: "Out of Stock", effectiveThreshold };
  }
  if (quantity > 0 && quantity <= effectiveThreshold) {
    return { status: "LOW_STOCK", label: "Low Stock", effectiveThreshold };
  }
  return { status: "HEALTHY", label: "In Stock", effectiveThreshold };
}
