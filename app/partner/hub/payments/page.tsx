import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HubModulePlaceholder } from "@/partner-app/hub/components/hub-module-placeholder";

export default function HubPaymentsPage() {
  return (
    <PartnerAppShell>
      <HubModulePlaceholder
        title="Invoices & Material Settlements"
        description="Contractor invoice status, credit lines, milestone material drawdowns, and automated merchant payouts."
        actionLabel="Generate Invoice"
        actionHref="/partner/hub/payments"
        metrics={[
          { label: "Billed This Month", value: "₹24.8 L" },
          { label: "Pending Drawdowns", value: "₹4.2 L" },
          { label: "Credit Line Utilized", value: "34%" },
        ]}
      />
    </PartnerAppShell>
  );
}
