import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HandsDashboard } from "@/partner-app/dashboards/hands-dashboard";

export default function PartnerHandsPage() {
  return (
    <PartnerAppShell>
      <HandsDashboard />
    </PartnerAppShell>
  );
}
