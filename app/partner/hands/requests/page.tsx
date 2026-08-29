import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HandsModulePlaceholder } from "@/partner-app/hands/components/hands-module-placeholder";

export default function HandsRequestsPage() {
  return (
    <PartnerAppShell>
      <HandsModulePlaceholder
        title="Workforce Requests"
        description="Incoming trade crew requests from architects, interior designers, and general contractors via Virtual Office."
        actionLabel="Review Incoming"
        actionHref="/partner/hands/requests"
        metrics={[
          { label: "Pending Allocation", value: "4" },
          { label: "Urgent Priority", value: "2" },
          { label: "Avg Response Time", value: "18 Mins" },
        ]}
      />
    </PartnerAppShell>
  );
}
