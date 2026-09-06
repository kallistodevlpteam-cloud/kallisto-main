import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { BasicsModulePlaceholder } from "@/partner-app/basics/components/basics-module-placeholder";

export default function BasicsPerformancePage() {
  return (
    <PartnerAppShell>
      <BasicsModulePlaceholder
        title="Service Quality & CSAT Performance"
        description="Homeowner satisfaction scores, specialist first-time-fix rate, job completion turnaround times, and quality assurance ratings."
        actionLabel="Export Performance Data"
        actionHref="/partner/basics/performance"
        metrics={[
          { label: "Customer CSAT", value: "4.9 ★" },
          { label: "First-Time-Fix", value: "94.6%" },
          { label: "Resolution Velocity", value: "1.2 Days" },
        ]}
      />
    </PartnerAppShell>
  );
}
