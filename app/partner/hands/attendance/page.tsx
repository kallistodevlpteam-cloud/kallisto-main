import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HandsModulePlaceholder } from "@/partner-app/hands/components/hands-module-placeholder";

export default function HandsAttendancePage() {
  return (
    <PartnerAppShell>
      <HandsModulePlaceholder
        title="Attendance & Time-Tracking"
        description="Daily biometric geotag logs, supervisor shift approvals, overtime tracking, and compliance records."
        actionLabel="Export Timesheet"
        actionHref="/partner/hands/attendance"
        metrics={[
          { label: "Present Today", value: "128" },
          { label: "Compliance Rate", value: "96.4%" },
          { label: "Late Check-ins", value: "2" },
        ]}
      />
    </PartnerAppShell>
  );
}
