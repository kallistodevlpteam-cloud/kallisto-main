import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { PartnerSettingsHub } from "@/partner-app/settings/partner-settings-hub";

export default function PartnerSettingsPage() {
  return (
    <PartnerAppShell>
      <PartnerSettingsHub />
    </PartnerAppShell>
  );
}
