import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HandsModulePlaceholder } from "@/partner-app/hands/components/hands-module-placeholder";

export default function HandsPaymentsPage() {
  return (
    <PartnerAppShell>
      <HandsModulePlaceholder
        title="Partner Payments & Settlements"
        description="Weekly contractor disbursements, milestone payouts, wage escrows, and audited banking settlement logs."
        actionLabel="View Statement"
        actionHref="/partner/hands/payments"
        metrics={[
          { label: "Settled This Month", value: "₹6.8 L" },
          { label: "Pending Escrow", value: "₹1.4 L" },
          { label: "Next Payout Cycle", value: "Friday" },
        ]}
      />
    </PartnerAppShell>
  );
}
