import { AppShell } from "@/components/layout/app-shell";
import { RoutePageContainer } from "@/components/ui/route-page-container";

export default function PaymentsPage() {
  return (
    <AppShell>
      <RoutePageContainer
        title="Payments"
        description="Track milestone settlements, financial records, and variation impacts."
        primaryActionLabel="View Invoices"
      />
    </AppShell>
  );
}
