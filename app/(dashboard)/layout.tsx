import { requireAuth } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, organization } = await requireAuth();

  return (
    <DashboardShell user={user} organization={organization}>
      {children}
    </DashboardShell>
  );
}
