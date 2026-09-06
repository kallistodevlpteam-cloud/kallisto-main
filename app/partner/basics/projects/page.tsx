import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { BasicsModulePlaceholder } from "@/partner-app/basics/components/basics-module-placeholder";

export default function BasicsProjectsPage() {
  return (
    <PartnerAppShell>
      <BasicsModulePlaceholder
        title="Partner Projects Serviced"
        description="Comprehensive view of projects where specialist diagnostics, bespoke carpentry, and turnkey handovers are active."
        actionLabel="Filter Projects"
        actionHref="/partner/basics/projects"
        metrics={[
          { label: "Active Sites", value: "9" },
          { label: "Completed Handovers", value: "41" },
          { label: "Turnkey CSAT", value: "4.9 ★" },
        ]}
      />
    </PartnerAppShell>
  );
}
