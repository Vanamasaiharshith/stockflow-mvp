"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import {
  TrendingUp,
  DollarSign,
  Boxes,
  PieChart as PieIcon,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Package,
} from "lucide-react";

interface InsightsData {
  summary: {
    totalProducts: number;
    totalStockUnits: number;
    totalCostValuation: number;
    totalSellingValuation: number;
    potentialProfit: number;
    overallMarginPercent: number;
    healthyCount: number;
    lowStockCount: number;
    outOfStockCount: number;
    healthyPercent: number;
    lowStockPercent: number;
    outOfStockPercent: number;
  };
  healthDistribution: Array<{
    name: string;
    value: number;
    percentage: number;
    color: string;
  }>;
  valuationComparison: Array<{
    name: string;
    costValue: number;
    sellingValue: number;
  }>;
  highestStockProducts: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    costValue: number;
    sellingValue: number;
  }>;
  lowestStockProducts: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    effectiveThreshold: number;
    status: string;
    statusLabel: string;
  }>;
  highestValueProducts: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    costPrice: number;
    sellingPrice: number;
    costValue: number;
    sellingValue: number;
    margin: number;
  }>;
}

interface InsightsViewProps {
  data: InsightsData;
  organization: {
    name: string;
    currency: string;
  };
}

export function InsightsView({ data, organization }: InsightsViewProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const {
    summary,
    healthDistribution,
    valuationComparison,
    highestStockProducts,
    lowestStockProducts,
    highestValueProducts,
  } = data;

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Inventory Intelligence & Insights
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Deep financial analysis of stock assets, catalog distribution, and profit margins.
        </p>
      </div>

      {/* 4 SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Invested Cost
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">
              {formatCurrency(summary.totalCostValuation, organization.currency)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Direct inventory purchase capital</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Potential Retail Sales
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-emerald-700 font-mono">
              {formatCurrency(summary.totalSellingValuation, organization.currency)}
            </div>
            <p className="text-[11px] text-emerald-600/80 mt-1">Gross sales if all sold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Potential Gross Profit
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-blue-600 font-mono">
              {formatCurrency(summary.potentialProfit, organization.currency)}
            </div>
            <p className="text-[11px] text-blue-600/80 mt-1">
              Estimated margin: {summary.overallMarginPercent}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              At-Risk / Low Stock %
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Boxes className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-amber-600 font-mono">
              {(summary.lowStockPercent + summary.outOfStockPercent).toFixed(1)}%
            </div>
            <p className="text-[11px] text-amber-600/80 mt-1">
              {summary.lowStockCount + summary.outOfStockCount} of {summary.totalProducts} catalog items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS ROW (RECHARTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: STOCK HEALTH DISTRIBUTION PIE CHART */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-blue-600" />
              <span>Stock Health Distribution</span>
            </CardTitle>
            <p className="text-xs text-slate-500">
              Proportion of in-stock, low-stock, and out-of-stock items
            </p>
          </CardHeader>
          <CardContent>
            {summary.totalProducts === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                No inventory data available to chart.
              </div>
            ) : isMounted ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={healthDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      label={(entry: any) => `${entry.name}`}
                    >
                      {healthDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [
                        `${val ?? 0} Products`,
                        "Count",
                      ]}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 w-full flex items-center justify-center text-xs text-slate-400">
                Loading interactive visualization...
              </div>
            )}
          </CardContent>
        </Card>

        {/* CHART 2: VALUATION COMPARISON (COST VS SELLING) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
              <span>Top Asset Valuation (Cost vs Retail Value)</span>
            </CardTitle>
            <p className="text-xs text-slate-500">
              Comparison of capital tied up vs potential gross revenue
            </p>
          </CardHeader>
          <CardContent>
            {valuationComparison.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                No inventory data available to chart.
              </div>
            ) : isMounted ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={valuationComparison}
                    margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip
                      formatter={(value: any) => [
                        formatCurrency(Number(value) || 0, organization.currency),
                        "",
                      ]}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Bar
                      dataKey="costValue"
                      name="Cost Value"
                      fill="#94a3b8"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="sellingValue"
                      name="Selling Value"
                      fill="#2563eb"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 w-full flex items-center justify-center text-xs text-slate-400">
                Loading interactive visualization...
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* DETAILED RANKING TABLES (HIGHEST STOCK, LOWEST STOCK, HIGHEST VALUE) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Highest Stock Products */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span>Highest Stock Units</span>
              <span className="text-xs font-normal text-slate-400">Top 5</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {highestStockProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No products found</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {highestStockProducts.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-xs text-slate-800">{p.name}</p>
                      <p className="font-mono text-[10px] text-slate-400">SKU: {p.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {formatNumber(p.quantity)} units
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Valuation: {formatCurrency(p.costValue, organization.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lowest Stock Products */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span>Lowest Stock Units</span>
              <span className="text-xs font-normal text-slate-400">Top 5</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowestStockProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No products found</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {lowestStockProducts.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-xs text-slate-800">{p.name}</p>
                      <p className="font-mono text-[10px] text-slate-400">SKU: {p.sku}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-mono font-bold text-xs ${
                          p.quantity === 0 ? "text-red-600" : "text-amber-600"
                        }`}
                      >
                        {p.quantity} units
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Threshold: {p.effectiveThreshold}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Highest Inventory Cost Value */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span>Highest Capital Value</span>
              <span className="text-xs font-normal text-slate-400">Top 5</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {highestValueProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No products found</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {highestValueProducts.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-xs text-slate-800">{p.name}</p>
                      <p className="font-mono text-[10px] text-slate-400">
                        {p.quantity} × {formatCurrency(p.costPrice, organization.currency)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {formatCurrency(p.costValue, organization.currency)}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-mono block">
                        +{formatCurrency(p.margin, organization.currency)} profit
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
