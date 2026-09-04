import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HubDashboard } from "@/partner-app/dashboards/hub-dashboard";

export default function PartnerHubPage() {
  return (
    <PartnerAppShell>
      <HubDashboard />
    </PartnerAppShell>
  );
}
