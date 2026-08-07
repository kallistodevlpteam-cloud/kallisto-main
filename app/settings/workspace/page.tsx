import { getAuthenticatedWorkspaceContext } from "@/lib/permissions";
import { SettingsAccessDenied } from "@/components/settings/settings-access-denied";
import { WorkspaceSettings } from "@/components/settings/workspace-settings";

export default async function WorkspaceSettingsPage() {
  const context = await getAuthenticatedWorkspaceContext();

  if (!context.permissions.canManageWorkspace) {
    return <SettingsAccessDenied />;
  }

  return (
    <WorkspaceSettings
      workspace={context.workspace}
      user={context.user}
      permissions={context.permissions}
    />
  );
}
