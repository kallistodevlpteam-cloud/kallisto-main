import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HandsAttendanceWorkspace } from "@/partner-app/hands/components/attendance/hands-attendance-workspace";

export default function HandsAttendancePage() {
  return (
    <PartnerAppShell>
      <HandsAttendanceWorkspace />
    </PartnerAppShell>
  );
}
