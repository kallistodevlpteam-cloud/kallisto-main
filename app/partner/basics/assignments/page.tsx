import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { BasicsModulePlaceholder } from "@/partner-app/basics/components/basics-module-placeholder";

export default function BasicsAssignmentsPage() {
  return (
    <PartnerAppShell>
      <BasicsModulePlaceholder
        title="Specialist Team Assignments"
        description="Active site assignments, lead specialist dispatches, milestone checklists, and inspection sign-offs."
        actionLabel="Assign Specialist"
        actionHref="/partner/basics/assignments"
        metrics={[
          { label: "Active Assignments", value: "18" },
          { label: "Sites Covered", value: "9" },
          { label: "Avg Resolution Time", value: "3.2 Hrs" },
        ]}
      />
    </PartnerAppShell>
  );
}
