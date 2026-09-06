import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HandsModulePlaceholder } from "@/partner-app/hands/components/hands-module-placeholder";

export default function HandsProjectsPage() {
  return (
    <PartnerAppShell>
      <HandsModulePlaceholder
        title="Partner Projects Directory"
        description="Active and upcoming Kallisto projects where your trade crews and specialists are contracted."
        actionLabel="Filter Projects"
        actionHref="/partner/hands/projects"
        metrics={[
          { label: "Active Sites", value: "8" },
          { label: "Completed Sites", value: "34" },
          { label: "Total Man-Hours", value: "14,200" },
        ]}
      />
    </PartnerAppShell>
  );
}
