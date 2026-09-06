import { ClientSettingsLayout } from "@/features/client/settings/components/client-settings-layout";
import { ProjectAccessSection } from "@/features/client/settings/components/sections/project-access-section";

export default function ClientProjectAccessPage() {
  return (
    <ClientSettingsLayout>
      <ProjectAccessSection />
    </ClientSettingsLayout>
  );
}
