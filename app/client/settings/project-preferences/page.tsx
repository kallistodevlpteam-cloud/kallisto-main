import { ClientSettingsLayout } from "@/features/client/settings/components/client-settings-layout";
import { ProjectPreferencesSection } from "@/features/client/settings/components/sections/project-preferences-section";

export default function ClientProjectPreferencesPage() {
  return (
    <ClientSettingsLayout>
      <ProjectPreferencesSection />
    </ClientSettingsLayout>
  );
}
