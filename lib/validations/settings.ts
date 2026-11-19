import { z } from "zod";

export const organizationSettingsSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters").max(100),
});

export const inventorySettingsSchema = z.object({
  defaultThreshold: z.number().int("Threshold must be a whole number").min(0, "Threshold cannot be negative"),
  currency: z.string().min(1, "Currency is required").max(5),
});

export const accountSettingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
});

export type OrganizationSettingsInput = z.infer<typeof organizationSettingsSchema>;
export type InventorySettingsInput = z.infer<typeof inventorySettingsSchema>;
export type AccountSettingsInput = z.infer<typeof accountSettingsSchema>;
