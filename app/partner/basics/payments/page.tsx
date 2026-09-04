import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { BasicsModulePlaceholder } from "@/partner-app/basics/components/basics-module-placeholder";

export default function BasicsPaymentsPage() {
  return (
    <PartnerAppShell>
      <BasicsModulePlaceholder
        title="Service Settlements & Customer Invoices"
        description="Service charge reconciliation, specialist contractor earnings, client payment receipts, and automated settlement logs."
        actionLabel="View Statement"
        actionHref="/partner/basics/payments"
        metrics={[
          { label: "Settled This Month", value: "₹9.2 L" },
          { label: "Pending Sign-Off", value: "₹1.8 L" },
          { label: "Average Job Value", value: "₹24,500" },
        ]}
      />
    </PartnerAppShell>
  );
}
