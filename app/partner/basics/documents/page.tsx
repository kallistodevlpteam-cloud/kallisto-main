import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { BasicsModulePlaceholder } from "@/partner-app/basics/components/basics-module-placeholder";

export default function BasicsDocumentsPage() {
  return (
    <PartnerAppShell>
      <BasicsModulePlaceholder
        title="Service Reports & Warranty Certificates"
        description="Diagnostic test reports, warranty certificates, client handover sign-off sheets, and specialist licenses."
        actionLabel="Upload Service Report"
        actionHref="/partner/basics/documents"
        metrics={[
          { label: "Total Reports", value: "142" },
          { label: "Active Warranties", value: "39" },
          { label: "Signed Handovers", value: "100%" },
        ]}
      />
    </PartnerAppShell>
  );
}
