import { getAuthenticatedWorkspaceContext } from "@/lib/permissions";
import { SettingsAccessDenied } from "@/components/settings/settings-access-denied";
import { DeveloperSettings } from "@/components/settings/developer-settings";

export default async function DeveloperSettingsPage() {
  const context = await getAuthenticatedWorkspaceContext();

  if (!context.permissions.canManageApiKeys) {
    return (
      <SettingsAccessDenied
        message="Developer settings are only accessible to accounts with simulated developer roles."
      />
    );
  }

  return (
    <DeveloperSettings
      user={context.user}
      permissions={context.permissions}
    />
  );
}
