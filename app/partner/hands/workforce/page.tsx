import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HandsModulePlaceholder } from "@/partner-app/hands/components/hands-module-placeholder";

export default function HandsWorkforcePage() {
  return (
    <PartnerAppShell>
      <HandsModulePlaceholder
        title="Workforce Management"
        description="Comprehensive directory of trade crews, skill matrices, contractor teams, and verification statuses."
        actionLabel="Register Trade Crew"
        actionHref="/partner/hands/workforce"
        metrics={[
          { label: "Total Fleet", value: "170" },
          { label: "Active On Site", value: "128" },
          { label: "Available Today", value: "42" },
        ]}
      />
    </PartnerAppShell>
  );
}
