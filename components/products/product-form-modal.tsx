"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { productSchema, ProductInput } from "@/lib/validations/product";
import { createProductAction, updateProductAction } from "@/app/actions/product.actions";
import { toast } from "sonner";
import { Info } from "lucide-react";

export interface EditableProduct {
  id: string;
  name: string;
  sku: string;
  description?: string | null;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  lowStockThreshold?: number | null;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: EditableProduct | null;
  defaultOrgThreshold: number;
  currency: string;
  onSuccess?: () => void;
}

export function ProductFormModal({
  isOpen,
  onClose,
  product,
  defaultOrgThreshold,
  currency,
  onSuccess,
}: ProductFormModalProps) {
  const isEditing = Boolean(product);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      quantity: 0,
      costPrice: 0,
      sellingPrice: 0,
      lowStockThreshold: null,
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      setServerError(null);
      if (product) {
        reset({
          name: product.name,
          sku: product.sku,
          description: product.description || "",
          quantity: product.quantity,
          costPrice: product.costPrice,
          sellingPrice: product.sellingPrice,
          lowStockThreshold: product.lowStockThreshold ?? null,
        });
      } else {
        reset({
          name: "",
          sku: "",
          description: "",
          quantity: 0,
          costPrice: 0,
          sellingPrice: 0,
          lowStockThreshold: null,
        });
      }
    }
  }, [isOpen, product, reset]);

  const onSubmit = async (values: ProductInput) => {
    setIsLoading(true);
    setServerError(null);

    try {
      if (isEditing && product) {
        const res = await updateProductAction(product.id, values);
        if (res.success) {
          toast.success(res.message || "Product updated successfully");
          onSuccess?.();
          onClose();
        } else {
          setServerError(res.message || "Failed to update product");
          toast.error(res.message || "Update failed");
        }
      } else {
        const res = await createProductAction(values);
        if (res.success) {
          toast.success(res.message || "Product created successfully");
          onSuccess?.();
          onClose();
        } else {
          setServerError(res.message || "Failed to create product");
          toast.error(res.message || "Creation failed");
        }
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Product" : "Create New Product"}
      description={
        isEditing
          ? `Modify product attributes and inventory parameters`
          : `Add a new item to your organization's inventory catalog`
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Product Name"
            placeholder="e.g. Ergonomic Office Chair"
            required
            {...register("name")}
            error={errors.name?.message}
          />

          <Input
            label="SKU (Stock Keeping Unit)"
            placeholder="e.g. CHR-ERG-001"
            required
            {...register("sku")}
            error={errors.sku?.message}
            helperText="Uppercase alphanumeric, dashes or underscores"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Description (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Brief product notes, supplier details, or specifications..."
            className="flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
            {...register("description")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Quantity On Hand"
            type="number"
            min="0"
            required
            {...register("quantity", { valueAsNumber: true })}
            error={errors.quantity?.message}
          />

          <Input
            label={`Cost Price (${currency})`}
            type="number"
            step="0.01"
            min="0"
            required
            {...register("costPrice", { valueAsNumber: true })}
            error={errors.costPrice?.message}
          />

          <Input
            label={`Selling Price (${currency})`}
            type="number"
            step="0.01"
            min="0"
            required
            {...register("sellingPrice", { valueAsNumber: true })}
            error={errors.sellingPrice?.message}
          />
        </div>

        <div>
          <Input
            label="Custom Low-Stock Threshold (Optional)"
            type="number"
            min="0"
            placeholder={`Default org threshold (${defaultOrgThreshold})`}
            {...register("lowStockThreshold", {
              setValueAs: (v) => (v === "" || v === undefined || isNaN(v) ? null : Number(v)),
            })}
            error={errors.lowStockThreshold?.message}
            helperText={`Leave empty to inherit organization default threshold (${defaultOrgThreshold} units)`}
          />
        </div>

        <div className="rounded-lg bg-blue-50/70 border border-blue-200/60 p-2.5 flex items-start gap-2 text-xs text-blue-800">
          <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
          <span>
            Stock statuses are automatically categorized into <strong>In Stock</strong>,{" "}
            <strong>Low Stock</strong>, or <strong>Out of Stock</strong> based on these thresholds.
          </span>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="default" isLoading={isLoading}>
            {isEditing ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
