import { useMemo } from "react";
import { UserSecurityContext } from "../types/project.types";

export function useProjectPermissions(context?: UserSecurityContext) {
  return useMemo(() => {
    const defaultCtx: UserSecurityContext = context || {
      userId: "user-current",
      role: "lead_architect",
      workspaceId: "ws-default",
      permissions: [
        "projects.view",
        "projects.create_from_enquiry",
        "projects.import",
        "projects.edit",
        "projects.assign_owner",
        "projects.place_on_hold",
        "projects.complete",
        "projects.reopen",
        "projects.archive",
      ],
    };

    const isAdmin = defaultCtx.isWorkspaceAdmin || defaultCtx.role === "admin" || defaultCtx.role === "workspace_admin";

    const hasPerm = (perm: string) => isAdmin || defaultCtx.permissions.includes(perm);

    return {
      canView: hasPerm("projects.view"),
      canImport: hasPerm("projects.import"),
      canEdit: hasPerm("projects.edit"),
      canAssignOwner: hasPerm("projects.assign_owner"),
      canPlaceOnHold: hasPerm("projects.place_on_hold"),
      canComplete: hasPerm("projects.complete"),
      canReopen: hasPerm("projects.reopen"),
      canArchive: hasPerm("projects.archive"),
      canViewFinancials: hasPerm("projects.view_financials"),
      securityContext: defaultCtx,
    };
  }, [context]);
}
