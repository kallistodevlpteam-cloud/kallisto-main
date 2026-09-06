import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { BasicsModulePlaceholder } from "@/partner-app/basics/components/basics-module-placeholder";

export default function BasicsRequestsPage() {
  return (
    <PartnerAppShell>
      <BasicsModulePlaceholder
        title="Incoming Service Requests"
        description="Client and service provider enquiries for deep diagnostics, HVAC commissioning, waterproofing, and specialized turnkey maintenance."
        actionLabel="Review Requests"
        actionHref="/partner/basics/requests"
        metrics={[
          { label: "New Enquiries", value: "3" },
          { label: "Quoted Requests", value: "9" },
          { label: "Conversion Rate", value: "84%" },
        ]}
      />
    </PartnerAppShell>
  );
}
