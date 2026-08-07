import { getAuthenticatedWorkspaceContext } from "@/lib/permissions";
import { SettingsAccessDenied } from "@/components/settings/settings-access-denied";
import { ServicesSettings } from "@/components/settings/services-settings";

export default async function ServicesSettingsPage() {
  const context = await getAuthenticatedWorkspaceContext();

  if (!context.permissions.canManageServices) {
    return <SettingsAccessDenied />;
  }

  return <ServicesSettings workspace={context.workspace} />;
}
