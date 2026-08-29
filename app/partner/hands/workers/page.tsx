import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HandsModulePlaceholder } from "@/partner-app/hands/components/hands-module-placeholder";

export default function HandsWorkersPage() {
  return (
    <PartnerAppShell>
      <HandsModulePlaceholder
        title="Individual Workers Directory"
        description="Search, filter, and inspect verified worker profiles, trade certifications, daily rates, and site badges."
        actionLabel="Add Worker"
        actionHref="/partner/hands/workers"
        metrics={[
          { label: "KYC Verified", value: "100%" },
          { label: "Safety Certified", value: "162" },
          { label: "Average Experience", value: "6.4 Yrs" },
        ]}
      />
    </PartnerAppShell>
  );
}
