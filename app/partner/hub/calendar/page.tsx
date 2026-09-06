import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HubCalendarWorkspace } from "@/partner-app/hub/components/hub-calendar-workspace";

export const metadata = {
  title: "Calendar | Kallisto Hub",
  description: "View scheduled delivery deadlines, dispatch orders, and material requisitions in a calendar view.",
};

export default function HubCalendarPage() {
  return (
    <PartnerAppShell>
      <HubCalendarWorkspace />
    </PartnerAppShell>
  );
}
