import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HubModulePlaceholder } from "@/partner-app/hub/components/hub-module-placeholder";

export default function HubDocumentsPage() {
  return (
    <PartnerAppShell>
      <HubModulePlaceholder
        title="Delivery Challans & Material Test Certificates"
        description="E-way bills, quality test reports (MTCs), ISO compliance documentation, and signed gate passes."
        actionLabel="Upload MTC Report"
        actionHref="/partner/hub/documents"
        metrics={[
          { label: "Total Documents", value: "312" },
          { label: "Verified MTCs", value: "100%" },
          { label: "E-Way Bills Active", value: "5" },
        ]}
      />
    </PartnerAppShell>
  );
}
