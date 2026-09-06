import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { PartnerDashboardHub } from "@/partner-app/dashboards/partner-dashboard-hub";

export default function PartnerRootPage() {
  return (
    <PartnerAppShell>
      <PartnerDashboardHub />
    </PartnerAppShell>
  );
}
