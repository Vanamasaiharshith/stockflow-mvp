import { prisma } from "@/lib/db/prisma";
import {
  OrganizationSettingsInput,
  InventorySettingsInput,
  AccountSettingsInput,
} from "@/lib/validations/settings";

export async function updateOrganizationSettings(
  orgId: string,
  input: OrganizationSettingsInput
) {
  return prisma.organization.update({
    where: { id: orgId },
    data: {
      name: input.name.trim(),
    },
  });
}

export async function updateInventorySettings(
  orgId: string,
  input: InventorySettingsInput
) {
  return prisma.organization.update({
    where: { id: orgId },
    data: {
      defaultThreshold: input.defaultThreshold,
      currency: input.currency,
    },
  });
}

export async function updateAccountSettings(
  userId: string,
  input: AccountSettingsInput
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name.trim(),
    },
  });
}
