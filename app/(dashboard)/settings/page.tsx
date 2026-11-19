import { requireAuth } from "@/lib/auth/session";
import { SettingsView } from "@/components/settings/settings-view";

export default async function SettingsPage() {
  const { user, organization } = await requireAuth();

  return (
    <SettingsView
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
      }}
      organization={{
        id: organization.id,
        name: organization.name,
        defaultThreshold: organization.defaultThreshold,
        currency: organization.currency,
        createdAt: organization.createdAt,
      }}
    />
  );
}
