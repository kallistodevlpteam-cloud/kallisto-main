import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { PartnerNotificationsWorkspace } from "@/partner-app/notifications/components/partner-notifications-workspace";

export default function PartnerNotificationsPage() {
  return (
    <PartnerAppShell>
      <PartnerNotificationsWorkspace />
    </PartnerAppShell>
  );
}
