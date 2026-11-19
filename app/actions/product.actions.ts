"use server";

import { requireAuth } from "@/lib/auth/session";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/services/product.service";
import { productSchema, ProductInput } from "@/lib/validations/product";
import { revalidatePath } from "next/cache";

export type ProductActionResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

export async function createProductAction(
  values: ProductInput
): Promise<ProductActionResponse> {
  const auth = await requireAuth();
  const orgId = auth.organization.id;

  const validated = productSchema.safeParse(values);
  if (!validated.success) {
    return {
      success: false,
      message: "Please correct the form fields.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const product = await createProduct(orgId, validated.data);
    revalidatePath("/products");
    revalidatePath("/dashboard");
    revalidatePath("/inventory-insights");
    return {
      success: true,
      message: `Product "${product.name}" created successfully.`,
      data: product,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create product.";
    return {
      success: false,
      message: msg,
    };
  }
}

export async function updateProductAction(
  id: string,
  values: ProductInput
): Promise<ProductActionResponse> {
  const auth = await requireAuth();
  const orgId = auth.organization.id;

  const validated = productSchema.safeParse(values);
  if (!validated.success) {
    return {
      success: false,
      message: "Please correct the form fields.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const product = await updateProduct(orgId, id, validated.data);
    revalidatePath("/products");
    revalidatePath("/dashboard");
    revalidatePath("/inventory-insights");
    return {
      success: true,
      message: `Product "${product.name}" updated successfully.`,
      data: product,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update product.";
    return {
      success: false,
      message: msg,
    };
  }
}

export async function deleteProductAction(id: string): Promise<ProductActionResponse> {
  const auth = await requireAuth();
  const orgId = auth.organization.id;

  try {
    const deleted = await deleteProduct(orgId, id);
    revalidatePath("/products");
    revalidatePath("/dashboard");
    revalidatePath("/inventory-insights");
    return {
      success: true,
      message: `Product "${deleted.name}" deleted successfully.`,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete product.";
    return {
      success: false,
      message: msg,
    };
  }
}
