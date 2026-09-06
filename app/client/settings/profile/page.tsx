import { ClientSettingsLayout } from "@/features/client/settings/components/client-settings-layout";
import { ProfileSettingsSection } from "@/features/client/settings/components/sections/profile-settings-section";

export default function ClientProfileSettingsPage() {
  return (
    <ClientSettingsLayout>
      <ProfileSettingsSection />
    </ClientSettingsLayout>
  );
}
