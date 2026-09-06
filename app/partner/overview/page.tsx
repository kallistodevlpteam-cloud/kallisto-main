import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { PartnerDashboardHub } from "@/partner-app/dashboards/partner-dashboard-hub";

export default function PartnerOverviewPage() {
  return (
    <PartnerAppShell>
      <PartnerDashboardHub />
    </PartnerAppShell>
  );
}
