import { getAuthenticatedWorkspaceContext } from "@/lib/permissions";
import { AccountSettings } from "@/components/settings/account-settings";

export default async function AccountSettingsPage() {
  const context = await getAuthenticatedWorkspaceContext();
  return <AccountSettings user={context.user} />;
}
