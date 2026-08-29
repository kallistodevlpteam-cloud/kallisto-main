import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { BasicsModulePlaceholder } from "@/partner-app/basics/components/basics-module-placeholder";

export default function BasicsServicesPage() {
  return (
    <PartnerAppShell>
      <BasicsModulePlaceholder
        title="Specialist Service Catalog"
        description="Comprehensive directory of turnkey services, specialist diagnostic rates, warranty scopes, and package pricing."
        actionLabel="Create Service Package"
        actionHref="/partner/basics/services"
        metrics={[
          { label: "Active Services", value: "24" },
          { label: "Specialist Teams", value: "8" },
          { label: "Turnkey Packages", value: "12" },
        ]}
      />
    </PartnerAppShell>
  );
}
