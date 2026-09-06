import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HandsModulePlaceholder } from "@/partner-app/hands/components/hands-module-placeholder";

export default function PartnerHelpPage() {
  return (
    <PartnerAppShell>
      <HandsModulePlaceholder
        title="Partner Help & Documentation"
        description="Operational manuals, SLA guidelines, dispatch protocols, and Virtual Office integration guides."
      />
    </PartnerAppShell>
  );
}
