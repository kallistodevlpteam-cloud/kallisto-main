import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HandsModulePlaceholder } from "@/partner-app/hands/components/hands-module-placeholder";

export default function HandsAssignmentsPage() {
  return (
    <PartnerAppShell>
      <HandsModulePlaceholder
        title="Live Crew Assignments"
        description="Active project site allocations, team lead assignments, shift timelines, and supervisor check-ins."
        actionLabel="Assign Crew"
        actionHref="/partner/hands/assignments"
        metrics={[
          { label: "Active Deployments", value: "14" },
          { label: "Sites Covered", value: "8" },
          { label: "Shift Completion", value: "98.2%" },
        ]}
      />
    </PartnerAppShell>
  );
}
