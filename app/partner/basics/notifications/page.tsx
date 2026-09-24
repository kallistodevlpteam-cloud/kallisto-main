import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { PartnerNotificationsWorkspace } from "@/partner-app/notifications/components/partner-notifications-workspace";

export default function PartnerBasicsNotificationsPage() {
  return (
    <PartnerAppShell>
      <PartnerNotificationsWorkspace />
    </PartnerAppShell>
  );
}
