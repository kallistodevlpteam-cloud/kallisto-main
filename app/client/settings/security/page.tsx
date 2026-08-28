import { ClientSettingsLayout } from "@/features/client/settings/components/client-settings-layout";
import { SecuritySettingsSection } from "@/features/client/settings/components/sections/security-settings-section";

export default function ClientSecuritySettingsPage() {
  return (
    <ClientSettingsLayout>
      <SecuritySettingsSection />
    </ClientSettingsLayout>
  );
}
