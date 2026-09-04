import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HandsWorkersWorkspace } from "@/partner-app/hands/components/workers/hands-workers-workspace";

export default function HandsWorkersPage() {
  return (
    <PartnerAppShell>
      <HandsWorkersWorkspace />
    </PartnerAppShell>
  );
}
