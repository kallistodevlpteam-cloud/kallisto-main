import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { BasicsModulePlaceholder } from "@/partner-app/basics/components/basics-module-placeholder";

export default function BasicsSchedulePage() {
  return (
    <PartnerAppShell>
      <BasicsModulePlaceholder
        title="Service Booking Calendar & Schedule"
        description="Daily, weekly, and monthly calendar of specialist inspections, routine maintenance visits, and milestone handovers."
        actionLabel="New Booking"
        actionHref="/partner/basics/schedule"
        metrics={[
          { label: "Bookings Today", value: "7" },
          { label: "Scheduled This Week", value: "38" },
          { label: "Punctuality Rate", value: "99.2%" },
        ]}
      />
    </PartnerAppShell>
  );
}
