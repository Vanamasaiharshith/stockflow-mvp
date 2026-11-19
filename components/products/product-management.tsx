"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  ArrowUpDown,
  Edit2,
  Trash2,
  TrendingUp,
  Package,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Boxes,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { formatDistanceToNow } from "date-fns";
import {
  ProductFormModal,
  EditableProduct,
} from "@/components/products/product-form-modal";
import { StockAdjustModal } from "@/components/products/stock-adjust-modal";
import { DeleteProductModal } from "@/components/products/delete-confirm-modal";

export interface EnrichedProductItem {
  id: string;
  name: string;
  sku: string;
  description?: string | null;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  lowStockThreshold?: number | null;
  stockStatus: "OUT_OF_STOCK" | "LOW_STOCK" | "HEALTHY";
  stockStatusLabel: string;
  effectiveThreshold: number;
  costValue: number;
  sellingValue: number;
  updatedAt: Date | string;
}

interface ProductManagementProps {
  products: EnrichedProductItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  organization: {
    defaultThreshold: number;
    currency: string;
  };
  currentParams: {
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export function ProductManagement({
  products,
  pagination,
  organization,
  currentParams,
}: ProductManagementProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Modal states
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<EditableProduct | null>(null);

  const [isAdjustOpen, setIsAdjustOpen] = React.useState(false);
  const [adjustingProduct, setAdjustingProduct] = React.useState<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
  } | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [deletingProduct, setDeletingProduct] = React.useState<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
  } | null>(null);

  // Local search input
  const [searchTerm, setSearchTerm] = React.useState(currentParams.search || "");

  // Update URL helper
  const updateQuery = (updates: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === undefined || val === "" || (key === "page" && val === 1)) {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    });
    router.push(`/products?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery({ search: searchTerm.trim() || undefined, page: 1 });
  };

  const handleStatusFilter = (status: string) => {
    updateQuery({ status: status === "ALL" ? undefined : status, page: 1 });
  };

  const handleSort = (field: string) => {
    const isCurrent = currentParams.sortBy === field;
    const newOrder = isCurrent && currentParams.sortOrder === "asc" ? "desc" : "asc";
    updateQuery({ sortBy: field, sortOrder: newOrder, page: 1 });
  };

  const getStatusBadge = (status: string, label: string) => {
    if (status === "HEALTHY") {
      return (
        <Badge variant="success" className="gap-1.5 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {label}
        </Badge>
      );
    }
    if (status === "LOW_STOCK") {
      return (
        <Badge variant="warning" className="gap-1.5 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {label}
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="gap-1.5 font-medium">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Catalog Products ({pagination.total})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Default org low-stock threshold is {organization.defaultThreshold} units
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setSelectedProduct(null);
              setIsFormOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Search, Filter & Controls Toolbar */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by name, SKU, or description..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50/50 pl-9 pr-20 py-2 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  updateQuery({ search: undefined, page: 1 });
                }}
                className="absolute right-14 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold bg-slate-900 text-white px-2.5 py-1 rounded-md hover:bg-slate-800"
            >
              Search
            </button>
          </form>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filter:
            </span>
            {[
              { label: "All Products", value: "ALL" },
              { label: "In Stock", value: "IN_STOCK" },
              { label: "Low Stock", value: "LOW_STOCK" },
              { label: "Out of Stock", value: "OUT_OF_STOCK" },
            ].map((f) => {
              const active =
                (!currentParams.status && f.value === "ALL") ||
                currentParams.status === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => handleStatusFilter(f.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    active
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th
                  onClick={() => handleSort("name")}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Product Name</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">SKU</th>
                <th
                  onClick={() => handleSort("quantity")}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Quantity</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Cost Price</th>
                <th
                  onClick={() => handleSort("sellingPrice")}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Selling Price</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Status</th>
                <th
                  onClick={() => handleSort("updatedAt")}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800 transition-colors hidden lg:table-cell"
                >
                  <div className="flex items-center gap-1">
                    <span>Last Updated</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                        <Package className="h-6 w-6" />
                      </div>
                      <p className="font-semibold text-slate-800 text-base">No products found</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {currentParams.search || currentParams.status
                          ? "Try adjusting your search criteria or filter tags."
                          : "Start building your inventory catalog by adding your first product."}
                      </p>
                      <Button
                        onClick={() => {
                          setSelectedProduct(null);
                          setIsFormOpen(true);
                        }}
                        size="sm"
                        className="mt-4 bg-slate-900 text-white"
                      >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Create Product
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const updatedDate = new Date(p.updatedAt);
                  const timeAgo = !isNaN(updatedDate.getTime())
                    ? formatDistanceToNow(updatedDate, { addSuffix: true })
                    : "Recently";

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 text-sm">
                            {p.name}
                          </span>
                          {p.description && (
                            <span className="text-xs text-slate-400 truncate max-w-xs mt-0.5">
                              {p.description}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600 font-semibold">
                        {p.sku}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex flex-col items-end">
                          <span
                            className={`font-mono font-bold text-sm ${
                              p.quantity === 0
                                ? "text-red-600"
                                : p.quantity <= p.effectiveThreshold
                                ? "text-amber-600"
                                : "text-slate-800"
                            }`}
                          >
                            {formatNumber(p.quantity)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Threshold: {p.effectiveThreshold}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs text-slate-500 font-mono">
                        {formatCurrency(p.costPrice, organization.currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-sm font-semibold text-slate-800 font-mono">
                        {formatCurrency(p.sellingPrice, organization.currency)}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(p.stockStatus, p.stockStatusLabel)}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-400 hidden lg:table-cell">
                        {timeAgo}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Adjust Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            title="Adjust Stock (+ / -)"
                            onClick={() => {
                              setAdjustingProduct({
                                id: p.id,
                                name: p.name,
                                sku: p.sku,
                                quantity: p.quantity,
                              });
                              setIsAdjustOpen(true);
                            }}
                            className="h-8 px-2.5 text-xs text-blue-700 bg-blue-50/50 border-blue-200 hover:bg-blue-100 hover:text-blue-800 font-medium"
                          >
                            <TrendingUp className="h-3.5 w-3.5 mr-1" />
                            Adjust
                          </Button>

                          {/* Edit Button */}
                          <button
                            title="Edit Product"
                            onClick={() => {
                              setSelectedProduct({
                                id: p.id,
                                name: p.name,
                                sku: p.sku,
                                description: p.description,
                                quantity: p.quantity,
                                costPrice: p.costPrice,
                                sellingPrice: p.sellingPrice,
                                lowStockThreshold: p.lowStockThreshold,
                              });
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            title="Delete Product"
                            onClick={() => {
                              setDeletingProduct({
                                id: p.id,
                                name: p.name,
                                sku: p.sku,
                                quantity: p.quantity,
                              });
                              setIsDeleteOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-200/80 bg-slate-50/50 text-xs text-slate-600">
            <div>
              Showing page <span className="font-semibold">{pagination.page}</span> of{" "}
              <span className="font-semibold">{pagination.totalPages}</span> (
              {pagination.total} total items)
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => updateQuery({ page: pagination.page - 1 })}
                className="h-8 gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => updateQuery({ page: pagination.page + 1 })}
                className="h-8 gap-1"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Product Form Modal (Create / Edit) */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        product={selectedProduct}
        defaultOrgThreshold={organization.defaultThreshold}
        currency={organization.currency}
        onSuccess={() => router.refresh()}
      />

      {/* Stock Adjust Modal */}
      <StockAdjustModal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        product={adjustingProduct}
        onSuccess={() => router.refresh()}
      />

      {/* Delete Confirmation Modal */}
      <DeleteProductModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        product={deletingProduct}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
