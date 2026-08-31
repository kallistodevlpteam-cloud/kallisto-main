import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HandsAssignmentsWorkspace } from "@/partner-app/hands/components/assignments/hands-assignments-workspace";

export default function HandsAssignmentsPage() {
  return (
    <PartnerAppShell>
      <HandsAssignmentsWorkspace />
    </PartnerAppShell>
  );
}
