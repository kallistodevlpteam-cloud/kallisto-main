import { AppShell } from "@/components/layout/app-shell";
import { RoutePageContainer } from "@/components/ui/route-page-container";

export default function ClientPaymentsPage() {
  return (
    <AppShell>
      <RoutePageContainer
        title="Payments"
        category="Client Portal"
        description="View milestone invoices, approve stage releases, and track escrow settlements."
      >
        <div style={{ padding: "8px 0" }}>
          {/* Foundation placeholder - features to be developed */}
        </div>
      </RoutePageContainer>
    </AppShell>
  );
}
