import { getAuthenticatedWorkspaceContext } from "@/lib/permissions";
import { SettingsAccessDenied } from "@/components/settings/settings-access-denied";
import { TeamSettings } from "@/components/settings/team-settings";

export default async function TeamSettingsPage() {
  const context = await getAuthenticatedWorkspaceContext();

  if (!context.permissions.canManageMembers) {
    return <SettingsAccessDenied />;
  }

  return (
    <TeamSettings
      workspace={context.workspace}
      permissions={context.permissions}
    />
  );
}
