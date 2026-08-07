import { getAuthenticatedWorkspaceContext } from "@/lib/permissions";
import { HelpSettings } from "@/components/settings/help-settings";

export default async function HelpSettingsPage() {
  const context = await getAuthenticatedWorkspaceContext();
  return <HelpSettings user={context.user} />;
}
