import { ClientSettingsLayout } from "@/features/client/settings/components/client-settings-layout";
import { CommunicationSection } from "@/features/client/settings/components/sections/communication-section";

export default function ClientCommunicationPreferencesPage() {
  return (
    <ClientSettingsLayout>
      <CommunicationSection />
    </ClientSettingsLayout>
  );
}
