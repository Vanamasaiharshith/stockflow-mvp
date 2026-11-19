import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(150, "Product name is too long"),
  sku: z
    .string()
    .min(1, "SKU is required")
    .max(50, "SKU must be under 50 characters")
    .regex(/^[a-zA-Z0-9-_.]+$/, "SKU may only contain letters, numbers, hyphens, and underscores"),
  description: z.string().max(1000, "Description must be under 1000 characters").optional().nullable(),
  quantity: z.number().int("Quantity must be a whole number").min(0, "Quantity cannot be negative"),
  costPrice: z.number().min(0, "Cost price cannot be negative"),
  sellingPrice: z.number().min(0, "Selling price cannot be negative"),
  lowStockThreshold: z.number().int("Threshold must be a whole number").min(0, "Threshold cannot be negative").nullable().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

export const productQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["ALL", "IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"]).default("ALL"),
  sortBy: z.enum(["name", "quantity", "sellingPrice", "updatedAt"]).default("updatedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type ProductQueryParams = z.infer<typeof productQuerySchema>;
