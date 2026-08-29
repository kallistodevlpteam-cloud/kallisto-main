import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HandsModulePlaceholder } from "@/partner-app/hands/components/hands-module-placeholder";

export default function HandsPerformancePage() {
  return (
    <PartnerAppShell>
      <HandsModulePlaceholder
        title="Fleet Performance & Quality Analytics"
        description="Shift punctuality benchmarks, site supervisor rating trends, safety scorecards, and fulfillment velocity."
        actionLabel="Export Report"
        actionHref="/partner/hands/performance"
        metrics={[
          { label: "Overall Quality", value: "4.8 ★" },
          { label: "On-Time Dispatch", value: "97.8%" },
          { label: "Safety Incidents", value: "0" },
        ]}
      />
    </PartnerAppShell>
  );
}
