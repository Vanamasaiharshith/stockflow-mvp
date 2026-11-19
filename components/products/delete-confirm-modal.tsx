"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { deleteProductAction } from "@/app/actions/product.actions";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface DeleteProductModalProps {
  product: {
    id: string;
    name: string;
    sku: string;
    quantity: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteProductModal({
  product,
  isOpen,
  onClose,
  onSuccess,
}: DeleteProductModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  if (!product) return null;

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const res = await deleteProductAction(product.id);
      if (res.success) {
        toast.success(res.message || "Product deleted successfully");
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.message || "Failed to delete product");
      }
    } catch {
      toast.error("An unexpected error occurred while deleting product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Product"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200/80 p-3.5 text-red-900">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <p className="font-semibold">Are you sure you want to delete this product?</p>
            <p className="mt-1 text-red-700">
              This will permanently remove <strong>{product.name}</strong> ({product.sku})
              with its {product.quantity} units and associated audit history. This action
              cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            isLoading={isLoading}
          >
            Delete Product
          </Button>
        </div>
      </div>
    </Modal>
  );
}
