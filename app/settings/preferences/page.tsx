import { getAuthenticatedWorkspaceContext } from "@/lib/permissions";
import { PreferencesSettings } from "@/components/settings/preferences-settings";

export default async function PreferencesSettingsPage() {
  const context = await getAuthenticatedWorkspaceContext();
  return <PreferencesSettings user={context.user} />;
}
