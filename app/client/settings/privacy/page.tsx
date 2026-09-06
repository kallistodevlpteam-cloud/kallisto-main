import { ClientSettingsLayout } from "@/features/client/settings/components/client-settings-layout";
import { PrivacyDataSection } from "@/features/client/settings/components/sections/privacy-data-section";

export default function ClientPrivacySettingsPage() {
  return (
    <ClientSettingsLayout>
      <PrivacyDataSection />
    </ClientSettingsLayout>
  );
}
