import { ClientSettingsLayout } from "@/features/client/settings/components/client-settings-layout";
import { LanguageRegionSection } from "@/features/client/settings/components/sections/language-region-section";

export default function ClientLanguageRegionSettingsPage() {
  return (
    <ClientSettingsLayout>
      <LanguageRegionSection />
    </ClientSettingsLayout>
  );
}
