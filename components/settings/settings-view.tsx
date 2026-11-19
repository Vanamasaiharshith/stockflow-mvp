"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  organizationSettingsSchema,
  inventorySettingsSchema,
  accountSettingsSchema,
  OrganizationSettingsInput,
  InventorySettingsInput,
  AccountSettingsInput,
} from "@/lib/validations/settings";
import {
  updateOrgSettingsAction,
  updateInventorySettingsAction,
  updateAccountSettingsAction,
} from "@/app/actions/settings.actions";
import { logoutAction } from "@/app/actions/auth.actions";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Building2, Sliders, User, LogOut, ShieldCheck } from "lucide-react";

interface SettingsViewProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  organization: {
    id: string;
    name: string;
    defaultThreshold: number;
    currency: string;
    createdAt: Date | string;
  };
}

export function SettingsView({ user, organization }: SettingsViewProps) {
  // Org Form
  const [orgLoading, setOrgLoading] = React.useState(false);
  const {
    register: registerOrg,
    handleSubmit: handleOrgSubmit,
    formState: { errors: orgErrors },
  } = useForm<OrganizationSettingsInput>({
    resolver: zodResolver(organizationSettingsSchema),
    defaultValues: {
      name: organization.name,
    },
  });

  const onSaveOrg = async (values: OrganizationSettingsInput) => {
    setOrgLoading(true);
    try {
      const res = await updateOrgSettingsAction(values);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to update organization settings.");
    } finally {
      setOrgLoading(false);
    }
  };

  // Inventory Form
  const [invLoading, setInvLoading] = React.useState(false);
  const {
    register: registerInv,
    handleSubmit: handleInvSubmit,
    formState: { errors: invErrors },
  } = useForm<InventorySettingsInput>({
    resolver: zodResolver(inventorySettingsSchema),
    defaultValues: {
      defaultThreshold: organization.defaultThreshold,
      currency: organization.currency,
    },
  });

  const onSaveInventory = async (values: InventorySettingsInput) => {
    setInvLoading(true);
    try {
      const res = await updateInventorySettingsAction(values);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to update inventory settings.");
    } finally {
      setInvLoading(false);
    }
  };

  // Account Form
  const [accLoading, setAccLoading] = React.useState(false);
  const {
    register: registerAcc,
    handleSubmit: handleAccSubmit,
    formState: { errors: accErrors },
  } = useForm<AccountSettingsInput>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: {
      name: user.name,
    },
  });

  const onSaveAccount = async (values: AccountSettingsInput) => {
    setAccLoading(true);
    try {
      const res = await updateAccountSettingsAction(values);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to update account settings.");
    } finally {
      setAccLoading(false);
    }
  };

  const currencyOptions = [
    { code: "USD", symbol: "$", label: "USD - US Dollar" },
    { code: "EUR", symbol: "€", label: "EUR - Euro" },
    { code: "GBP", symbol: "£", label: "GBP - British Pound" },
    { code: "CAD", symbol: "$", label: "CAD - Canadian Dollar" },
    { code: "INR", symbol: "₹", label: "INR - Indian Rupee" },
    { code: "AUD", symbol: "$", label: "AUD - Australian Dollar" },
    { code: "JPY", symbol: "¥", label: "JPY - Japanese Yen" },
  ];

  return (
    <div className="space-y-8 max-w-4xl pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Settings & Preferences
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your organization workspace, inventory threshold defaults, and personal profile.
        </p>
      </div>

      {/* 1. ORGANIZATION SETTINGS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <span>Organization Workspace</span>
          </CardTitle>
          <CardDescription>
            Workspace branding and multi-tenant identifiers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOrgSubmit(onSaveOrg)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Organization / Store Name"
                required
                {...registerOrg("name")}
                error={orgErrors.name?.message}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Tenant Organization ID
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={organization.id}
                  className="flex h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-xs text-slate-500 cursor-not-allowed select-all"
                />
                <p className="text-[11px] text-slate-400">
                  Unique cryptographic identifier for tenant data isolation
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={orgLoading} className="text-xs">
                Save Organization
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 2. INVENTORY SETTINGS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sliders className="h-5 w-5 text-blue-600" />
            <span>Inventory Configuration & Thresholds</span>
          </CardTitle>
          <CardDescription>
            Organization-wide default threshold and display currency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvSubmit(onSaveInventory)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Default Low-Stock Threshold"
                type="number"
                min="0"
                required
                {...registerInv("defaultThreshold", { valueAsNumber: true })}
                error={invErrors.defaultThreshold?.message}
                helperText="Used when an individual product does not have a custom threshold override."
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Catalog Currency
                </label>
                <select
                  className="flex h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                  {...registerInv("currency")}
                >
                  {currencyOptions.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label} ({c.symbol})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Currency symbol formatted across dashboard valuation cards and tables
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={invLoading} className="text-xs">
                Save Inventory Settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 3. ACCOUNT PROFILE */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <span>Account Profile</span>
          </CardTitle>
          <CardDescription>
            Your user credentials and personal account details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAccSubmit(onSaveAccount)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                required
                {...registerAcc("name")}
                error={accErrors.name?.message}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  readOnly
                  disabled
                  value={user.email}
                  className="flex h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-500 cursor-not-allowed"
                />
                <p className="text-[11px] text-slate-400">
                  Primary sign-in and security notifications address
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <form action={logoutAction}>
                <Button
                  type="submit"
                  variant="outline"
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 gap-1.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out of Account
                </Button>
              </form>

              <Button type="submit" isLoading={accLoading} className="text-xs">
                Save Account Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security & Multi-Tenancy Note */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 flex items-start gap-3 text-xs text-blue-900">
        <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-950">Multi-Tenant Data Isolation Verified</p>
          <p className="mt-0.5 text-blue-800 leading-relaxed">
            All database operations, product queries, stock adjustments, and settings are strictly
            scoped to your verified organization identifier ({organization.id}). No other tenant
            can access or modify this workspace.
          </p>
        </div>
      </div>
    </div>
  );
}
