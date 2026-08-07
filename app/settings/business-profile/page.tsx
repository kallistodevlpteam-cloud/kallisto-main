import { getAuthenticatedWorkspaceContext } from "@/lib/permissions";
import { SettingsAccessDenied } from "@/components/settings/settings-access-denied";
import { BusinessProfileSettings } from "@/components/settings/business-profile-settings";

export default async function BusinessProfileSettingsPage() {
  const context = await getAuthenticatedWorkspaceContext();

  if (!context.permissions.canManageBusinessProfile) {
    return <SettingsAccessDenied />;
  }

  return <BusinessProfileSettings workspace={context.workspace} />;
}
