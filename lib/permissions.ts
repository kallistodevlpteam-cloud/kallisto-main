import { cookies } from "next/headers";
import { UserRole } from "@/developer-console/types/developerConsole.types";

export interface WorkspaceContext {
  workspace: {
    id: string;
    name: string;
  };
  user: {
    uid: string;
    role: UserRole;
  };
  permissions: {
    canManageAccount: boolean;
    canManagePreferences: boolean;
    canManageHelp: boolean;
    canManageBusinessProfile: boolean;
    canManageServices: boolean;
    canManageMembers: boolean;
    canManageBilling: boolean;
    canManageWorkspace: boolean;
    canManageApiKeys: boolean;
    canDeleteWorkspace: boolean;
  };
}

export async function getAuthenticatedWorkspaceContext(): Promise<WorkspaceContext> {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("kallisto_simulated_role");
  const role = (roleCookie?.value || "developer") as UserRole;

  const isDeveloper = role === "developer";
  const isSuperAdmin = role === "super_admin";
  const isQA = role === "qa";

  const isAdminOrDev = isDeveloper || isSuperAdmin || isQA;

  return {
    workspace: {
      id: "arjun_arch_provider_id",
      name: "Arjun Architects",
    },
    user: {
      uid: "arjun_architects_dev",
      role,
    },
    permissions: {
      canManageAccount: true,
      canManagePreferences: true,
      canManageHelp: true,
      canManageBusinessProfile: isAdminOrDev,
      canManageServices: isAdminOrDev,
      canManageMembers: isAdminOrDev,
      canManageBilling: isAdminOrDev,
      canManageWorkspace: isAdminOrDev,
      canManageApiKeys: isDeveloper,
      canDeleteWorkspace: isDeveloper || isSuperAdmin,
    },
  };
}
