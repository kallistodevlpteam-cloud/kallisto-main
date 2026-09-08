import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HandsPaymentsDashboard } from "@/partner-app/hands/components/payments/hands-payments-dashboard";

export default function HandsPaymentsPage() {
  return (
    <PartnerAppShell>
      <HandsPaymentsDashboard />
    </PartnerAppShell>
  );
}
