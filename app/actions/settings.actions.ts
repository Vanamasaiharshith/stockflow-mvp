"use server";

import { requireAuth } from "@/lib/auth/session";
import {
  updateOrganizationSettings,
  updateInventorySettings,
  updateAccountSettings,
} from "@/lib/services/organization.service";
import {
  organizationSettingsSchema,
  inventorySettingsSchema,
  accountSettingsSchema,
  OrganizationSettingsInput,
  InventorySettingsInput,
  AccountSettingsInput,
} from "@/lib/validations/settings";
import { revalidatePath } from "next/cache";

export type SettingsActionResponse = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function updateOrgSettingsAction(
  values: OrganizationSettingsInput
): Promise<SettingsActionResponse> {
  const auth = await requireAuth();
  const orgId = auth.organization.id;

  const validated = organizationSettingsSchema.safeParse(values);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    await updateOrganizationSettings(orgId, validated.data);
    revalidatePath("/", "layout");
    return {
      success: true,
      message: "Organization settings updated successfully.",
    };
  } catch {
    return {
      success: false,
      message: "Failed to update organization settings.",
    };
  }
}

export async function updateInventorySettingsAction(
  values: InventorySettingsInput
): Promise<SettingsActionResponse> {
  const auth = await requireAuth();
  const orgId = auth.organization.id;

  const validated = inventorySettingsSchema.safeParse(values);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    await updateInventorySettings(orgId, validated.data);
    revalidatePath("/", "layout");
    return {
      success: true,
      message: "Inventory threshold and currency settings updated.",
    };
  } catch {
    return {
      success: false,
      message: "Failed to update inventory settings.",
    };
  }
}

export async function updateAccountSettingsAction(
  values: AccountSettingsInput
): Promise<SettingsActionResponse> {
  const auth = await requireAuth();
  const userId = auth.user.id;

  const validated = accountSettingsSchema.safeParse(values);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    await updateAccountSettings(userId, validated.data);
    revalidatePath("/", "layout");
    return {
      success: true,
      message: "Account profile updated successfully.",
    };
  } catch {
    return {
      success: false,
      message: "Failed to update account profile.",
    };
  }
}
