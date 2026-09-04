import { ClientSettingsLayout } from "@/features/client/settings/components/client-settings-layout";
import { AppearanceSection } from "@/features/client/settings/components/sections/appearance-section";

export default function ClientAppearanceSettingsPage() {
  return (
    <ClientSettingsLayout>
      <AppearanceSection />
    </ClientSettingsLayout>
  );
}
