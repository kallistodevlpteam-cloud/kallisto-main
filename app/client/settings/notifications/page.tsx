import { ClientSettingsLayout } from "@/features/client/settings/components/client-settings-layout";
import { NotificationsSection } from "@/features/client/settings/components/sections/notifications-section";

export default function ClientNotificationsPage() {
  return (
    <ClientSettingsLayout>
      <NotificationsSection />
    </ClientSettingsLayout>
  );
}
