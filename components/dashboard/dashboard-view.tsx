"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Boxes,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { formatDistanceToNow } from "date-fns";
import { StockAdjustModal } from "@/components/products/stock-adjust-modal";
import { ProductFormModal } from "@/components/products/product-form-modal";

interface DashboardMetrics {
  kpis: {
    totalProducts: number;
    totalStockUnits: number;
    totalCostValue: number;
    totalSellingValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    potentialMargin: number;
    marginPercentage: number;
  };
  inventoryHealth: {
    healthyCount: number;
    lowStockCount: number;
    outOfStockCount: number;
    healthyPercent: number;
    lowStockPercent: number;
    outOfStockPercent: number;
  };
  lowStockAlerts: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    effectiveThreshold: number;
    status: "OUT_OF_STOCK" | "LOW_STOCK";
    statusLabel: string;
    sellingPrice: number;
    costPrice: number;
  }>;
  recentAdjustments: Array<{
    id: string;
    adjustmentAmount: number;
    previousQuantity: number;
    newQuantity: number;
    reason: string | null;
    createdAt: Date | string;
    product: {
      id: string;
      name: string;
      sku: string;
    };
  }>;
  recentProducts: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    sellingPrice: number;
    costPrice: number;
    createdAt: Date | string;
  }>;
}

interface DashboardViewProps {
  data: DashboardMetrics;
  organization: {
    name: string;
    currency: string;
    defaultThreshold: number;
  };
}

export function DashboardView({ data, organization }: DashboardViewProps) {
  const router = useRouter();

  // Modals
  const [isAdjustOpen, setIsAdjustOpen] = React.useState(false);
  const [adjustingProduct, setAdjustingProduct] = React.useState<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
  } | null>(null);

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  const { kpis, inventoryHealth, lowStockAlerts, recentAdjustments } = data;

  return (
    <div className="space-y-8 pb-10">
      {/* Top Banner / Welcome Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome to {organization.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time business inventory metrics, valuation analysis, and stock levels.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
          <Link href="/products">
            <Button variant="outline" className="gap-1.5">
              <span>View Products</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Total Products */}
        <Card className="hover:border-slate-300 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Products
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {formatNumber(kpis.totalProducts)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Active items in catalog</p>
          </CardContent>
        </Card>

        {/* 2. Total Stock Units */}
        <Card className="hover:border-slate-300 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Stock Units
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Boxes className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {formatNumber(kpis.totalStockUnits)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Total physical inventory</p>
          </CardContent>
        </Card>

        {/* 3. Inventory Cost Value */}
        <Card className="hover:border-slate-300 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cost Valuation
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {formatCurrency(kpis.totalCostValue, organization.currency)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Total capital invested</p>
          </CardContent>
        </Card>

        {/* 4. Potential Selling Value */}
        <Card className="hover:border-slate-300 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Retail Valuation
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-emerald-700 font-mono">
              {formatCurrency(kpis.totalSellingValue, organization.currency)}
            </div>
            <p className="text-[11px] text-emerald-600/80 mt-1">Potential gross sales</p>
          </CardContent>
        </Card>

        {/* 5. Low Stock Products */}
        <Card className="hover:border-slate-300 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Low Stock
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-amber-600 font-mono">
              {formatNumber(kpis.lowStockCount)}
            </div>
            <p className="text-[11px] text-amber-600/80 mt-1">At or below threshold</p>
          </CardContent>
        </Card>

        {/* 6. Out of Stock */}
        <Card className="hover:border-slate-300 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Out of Stock
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-red-600 font-mono">
              {formatNumber(kpis.outOfStockCount)}
            </div>
            <p className="text-[11px] text-red-600/80 mt-1">Zero quantity on hand</p>
          </CardContent>
        </Card>
      </div>

      {/* SECTION D: INVENTORY VALUATION & MARGIN SUMMARY BAR */}
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
              Cost Valuation
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono mt-1 block">
              {formatCurrency(kpis.totalCostValue, organization.currency)}
            </span>
            <span className="text-[11px] text-slate-400">Total acquisition cost</span>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
              Retail Potential
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono mt-1 text-emerald-400 block">
              {formatCurrency(kpis.totalSellingValue, organization.currency)}
            </span>
            <span className="text-[11px] text-slate-400">Total selling value</span>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
              Estimated Margin
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono mt-1 text-blue-400 block">
              {formatCurrency(kpis.potentialMargin, organization.currency)}
            </span>
            <span className="text-[11px] text-slate-400">Net potential profit</span>
          </div>

          <div className="rounded-xl bg-slate-800/80 border border-slate-700/60 p-4">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span>Potential Margin %</span>
              <span className="font-mono text-emerald-400 font-bold">
                {kpis.marginPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(0, kpis.marginPercentage))}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Based on active inventory unit pricing
            </span>
          </div>
        </div>
      </div>

      {/* 2 COLUMN GRID: INVENTORY HEALTH & LOW STOCK ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION A: INVENTORY HEALTH DISTRIBUTION */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span>Inventory Health</span>
              <span className="text-xs font-normal text-slate-500">
                {kpis.totalProducts} products
              </span>
            </CardTitle>
            <p className="text-xs text-slate-500">
              Distribution of stock availability across catalog
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Multi-segment Progress Bar */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${inventoryHealth.healthyPercent}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`In Stock: ${inventoryHealth.healthyPercent}%`}
              />
              <div
                style={{ width: `${inventoryHealth.lowStockPercent}%` }}
                className="bg-amber-500 transition-all duration-500"
                title={`Low Stock: ${inventoryHealth.lowStockPercent}%`}
              />
              <div
                style={{ width: `${inventoryHealth.outOfStockPercent}%` }}
                className="bg-red-500 transition-all duration-500"
                title={`Out of Stock: ${inventoryHealth.outOfStockPercent}%`}
              />
            </div>

            {/* Health Breakdown Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-950">In Stock (Healthy)</p>
                    <p className="text-[11px] text-emerald-700">Above low-stock threshold</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-emerald-800">
                    {inventoryHealth.healthyCount}
                  </span>
                  <span className="text-[11px] text-emerald-600 block">
                    {inventoryHealth.healthyPercent}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <div>
                    <p className="text-xs font-semibold text-amber-950">Low Stock Warning</p>
                    <p className="text-[11px] text-amber-700">At or below threshold</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-amber-800">
                    {inventoryHealth.lowStockCount}
                  </span>
                  <span className="text-[11px] text-amber-600 block">
                    {inventoryHealth.lowStockPercent}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/60 border border-red-100">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <div>
                    <p className="text-xs font-semibold text-red-950">Out of Stock</p>
                    <p className="text-[11px] text-red-700">0 units remaining</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-red-800">
                    {inventoryHealth.outOfStockCount}
                  </span>
                  <span className="text-[11px] text-red-600 block">
                    {inventoryHealth.outOfStockPercent}%
                  </span>
                </div>
              </div>
            </div>

            <Link href="/inventory-insights" className="block pt-1">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Deep Dive in Inventory Insights
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* SECTION B: LOW STOCK ALERTS */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Low Stock & Critical Alerts</span>
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Immediate attention required to avoid fulfillment disruption
              </p>
            </div>
            <Link href="/products?status=LOW_STOCK">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600">
                View all ({kpis.lowStockCount + kpis.outOfStockCount})
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {lowStockAlerts.length === 0 ? (
              <div className="py-8 text-center text-slate-500 flex flex-col items-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
                <p className="font-semibold text-slate-800">Inventory Levels Optimal</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  No products are currently at or below their stock thresholds.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {lowStockAlerts.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">
                          {item.name}
                        </span>
                        <Badge
                          variant={
                            item.status === "OUT_OF_STOCK" ? "destructive" : "warning"
                          }
                          className="text-[10px] px-2 py-0"
                        >
                          {item.statusLabel}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="font-mono">SKU: {item.sku}</span>
                        <span>•</span>
                        <span>Threshold: {item.effectiveThreshold} units</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Available</span>
                        <span
                          className={`font-mono font-bold text-sm ${
                            item.quantity === 0 ? "text-red-600" : "text-amber-600"
                          }`}
                        >
                          {item.quantity} units
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAdjustingProduct({
                            id: item.id,
                            name: item.name,
                            sku: item.sku,
                            quantity: item.quantity,
                          });
                          setIsAdjustOpen(true);
                        }}
                        className="text-xs h-8 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700"
                      >
                        Adjust Stock
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SECTION C: RECENT AUDITED STOCK ACTIVITY */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <span>Recent Inventory Adjustments</span>
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Audited transaction log of recent stock additions and reductions
            </p>
          </div>
          <Link href="/products">
            <Button variant="ghost" size="sm" className="text-xs text-blue-600">
              Manage Catalog
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentAdjustments.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs">
              No stock adjustments recorded yet. Changes made via the Adjust Stock modal will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3 text-right">Adjustment</th>
                    <th className="py-2.5 px-3 text-right">Previous</th>
                    <th className="py-2.5 px-3 text-right">New Quantity</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentAdjustments.map((adj) => {
                    const isPositive = adj.adjustmentAmount > 0;
                    const adjDate = new Date(adj.createdAt);
                    const timeAgo = !isNaN(adjDate.getTime())
                      ? formatDistanceToNow(adjDate, { addSuffix: true })
                      : "Recently";

                    return (
                      <tr key={adj.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-semibold text-slate-800 text-xs">
                          {adj.product.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-xs text-slate-500">
                          {adj.product.sku}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-xs">
                          <span
                            className={
                              isPositive ? "text-emerald-600" : "text-red-600"
                            }
                          >
                            {isPositive ? `+${adj.adjustmentAmount}` : adj.adjustmentAmount}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-xs text-slate-500">
                          {adj.previousQuantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-xs font-semibold text-slate-800">
                          {adj.newQuantity}
                        </td>
                        <td className="py-2.5 px-3 text-xs text-slate-600">
                          {adj.reason || "Manual update"}
                        </td>
                        <td className="py-2.5 px-3 text-right text-xs text-slate-400">
                          {timeAgo}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Adjust Modal */}
      <StockAdjustModal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        product={adjustingProduct}
        onSuccess={() => router.refresh()}
      />

      {/* Product Form Modal (Create) */}
      <ProductFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        defaultOrgThreshold={organization.defaultThreshold}
        currency={organization.currency}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
