import { requireAuth } from "@/lib/auth/session";
import { getDashboardMetrics } from "@/lib/services/dashboard.service";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage() {
  const { organization } = await requireAuth();

  const metrics = await getDashboardMetrics(
    organization.id,
    organization.defaultThreshold
  );

  return (
    <DashboardView
      data={metrics}
      organization={{
        name: organization.name,
        currency: organization.currency,
        defaultThreshold: organization.defaultThreshold,
      }}
    />
  );
}
