import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { BasicsDashboard } from "@/partner-app/dashboards/basics-dashboard";

export default function PartnerBasicsPage() {
  return (
    <PartnerAppShell>
      <BasicsDashboard />
    </PartnerAppShell>
  );
}
