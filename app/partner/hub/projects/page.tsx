import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HubModulePlaceholder } from "@/partner-app/hub/components/hub-module-placeholder";

export default function HubProjectsPage() {
  return (
    <PartnerAppShell>
      <HubModulePlaceholder
        title="Partner Projects Supplied"
        description="List of active project sites receiving material deliveries, recurring supply schedules, and project-specific pricing."
        actionLabel="Filter Projects"
        actionHref="/partner/hub/projects"
        metrics={[
          { label: "Active Project Sites", value: "12" },
          { label: "Total Materials Supplied", value: "₹92.4 L" },
          { label: "Zero-Defect Deliveries", value: "99.4%" },
        ]}
      />
    </PartnerAppShell>
  );
}
