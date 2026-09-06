import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HandsModulePlaceholder } from "@/partner-app/hands/components/hands-module-placeholder";

export default function HandsDocumentsPage() {
  return (
    <PartnerAppShell>
      <HandsModulePlaceholder
        title="Compliance & Trade Documents"
        description="Worker KYC records, trade licenses, safety audit certificates, and partner operational agreements."
        actionLabel="Upload Certificate"
        actionHref="/partner/hands/documents"
        metrics={[
          { label: "Total Files", value: "84" },
          { label: "Verified Docs", value: "84" },
          { label: "Expiring Soon", value: "0" },
        ]}
      />
    </PartnerAppShell>
  );
}
