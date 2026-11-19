"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adjustStockAction } from "@/app/actions/stock.actions";
import { toast } from "sonner";
import { Plus, Minus, ArrowRight, AlertTriangle } from "lucide-react";

interface ProductQuickInfo {
  id: string;
  name: string;
  sku: string;
  quantity: number;
}

interface StockAdjustModalProps {
  product: ProductQuickInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function StockAdjustModal({
  product,
  isOpen,
  onClose,
  onSuccess,
}: StockAdjustModalProps) {
  const [mode, setMode] = React.useState<"increase" | "decrease">("increase");
  const [amount, setAmount] = React.useState<string>("1");
  const [reason, setReason] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setMode("increase");
      setAmount("1");
      setReason("");
    }
  }, [isOpen]);

  if (!product) return null;

  const parsedAmount = parseInt(amount, 10) || 0;
  const delta = mode === "increase" ? parsedAmount : -parsedAmount;
  const projectedQuantity = product.quantity + delta;
  const isInvalidReduction = mode === "decrease" && projectedQuantity < 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) {
      toast.error("Please enter a valid quantity greater than 0");
      return;
    }
    if (isInvalidReduction) {
      toast.error(`Cannot reduce stock below 0. Maximum reduction is ${product.quantity}.`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await adjustStockAction({
        productId: product.id,
        adjustmentAmount: delta,
        reason: reason.trim() || undefined,
      });

      if (res.success) {
        toast.success(res.message || "Stock adjusted successfully");
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.message || "Failed to adjust stock");
      }
    } catch {
      toast.error("An unexpected error occurred while adjusting stock");
    } finally {
      setIsLoading(false);
    }
  };

  const presetReasons =
    mode === "increase"
      ? ["Supplier restock", "Inventory count adjustment", "Customer return", "Stock transfer in"]
      : ["Damaged item / shrinkage", "Expired stock", "Inventory audit discrepancy", "Internal usage"];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Product Stock"
      description={`Record an audited inventory quantity change for ${product.name}`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product Quick Info Card */}
        <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm text-slate-900">{product.name}</p>
            <p className="text-xs font-mono text-slate-500">SKU: {product.sku}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Current Stock</span>
            <span className="text-lg font-bold text-slate-800 font-mono">
              {product.quantity}
            </span>
          </div>
        </div>

        {/* Increase / Decrease Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setMode("increase")}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === "increase"
                ? "bg-white text-emerald-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Plus className="h-4 w-4 text-emerald-600" />
            Add Stock (+)
          </button>
          <button
            type="button"
            onClick={() => setMode("decrease")}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === "decrease"
                ? "bg-white text-red-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Minus className="h-4 w-4 text-red-600" />
            Reduce Stock (-)
          </button>
        </div>

        {/* Quantity Input */}
        <div>
          <Input
            label="Adjustment Quantity"
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            helperText={`Enter units to ${mode}`}
          />
        </div>

        {/* Live Projection Box */}
        <div className="rounded-xl border border-slate-200 p-3 bg-white flex items-center justify-between">
          <div className="text-center flex-1">
            <span className="text-[11px] text-slate-400 font-medium block">Current</span>
            <span className="text-base font-semibold text-slate-700">{product.quantity}</span>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
          <div className="text-center flex-1">
            <span className="text-[11px] text-slate-400 font-medium block">Adjustment</span>
            <span
              className={`text-base font-semibold ${
                delta >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {delta > 0 ? `+${delta}` : delta}
            </span>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
          <div className="text-center flex-1">
            <span className="text-[11px] text-slate-400 font-medium block">New Quantity</span>
            <span
              className={`text-base font-bold ${
                isInvalidReduction ? "text-red-600 font-mono" : "text-slate-900 font-mono"
              }`}
            >
              {projectedQuantity}
            </span>
          </div>
        </div>

        {isInvalidReduction && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Stock cannot be reduced below 0 units.</span>
          </div>
        )}

        {/* Reason Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Adjustment Reason (Optional)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Received shipment, Physical audit variance"
            className="flex h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm shadow-xs placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          />
          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {presetReasons.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/60 transition-colors"
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={mode === "increase" ? "default" : "danger"}
            isLoading={isLoading}
            disabled={isInvalidReduction || parsedAmount <= 0}
          >
            Confirm Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
