import { requireAuth } from "@/lib/auth/session";
import { getInventoryInsights } from "@/lib/services/insights.service";
import { InsightsView } from "@/components/charts/insights-view";

export default async function InventoryInsightsPage() {
  const { organization } = await requireAuth();

  const insights = await getInventoryInsights(
    organization.id,
    organization.defaultThreshold
  );

  return (
    <InsightsView
      data={insights}
      organization={{
        name: organization.name,
        currency: organization.currency,
      }}
    />
  );
}
