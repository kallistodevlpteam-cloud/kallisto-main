import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HandsProjectsWorkspace } from "@/partner-app/hands/components/projects/hands-projects-workspace";

export default function HandsProjectsPage() {
  return (
    <PartnerAppShell>
      <HandsProjectsWorkspace />
    </PartnerAppShell>
  );
}
