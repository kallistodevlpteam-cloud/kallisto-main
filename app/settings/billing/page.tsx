import { getAuthenticatedWorkspaceContext } from "@/lib/permissions";
import { SettingsAccessDenied } from "@/components/settings/settings-access-denied";
import { BillingSettings } from "@/components/settings/billing-settings";

export default async function BillingSettingsPage() {
  const context = await getAuthenticatedWorkspaceContext();

  if (!context.permissions.canManageBilling) {
    return <SettingsAccessDenied />;
  }

  return (
    <BillingSettings
      workspace={context.workspace}
      permissions={context.permissions}
    />
  );
}
