export type StudioPermission =
  | "create"
  | "edit"
  | "review"
  | "approve"
  | "publish"
  | "export"
  | "view_financial_data"
  | "create_revisions"
  | "archive";

export class StudioPermissions {
  static checkPermission(
    userRole: string,
    permission: StudioPermission,
    workspaceType?: string
  ): boolean {
    const role = userRole.toLowerCase();

    // Admins and owners have all permissions
    if (role === "admin" || role === "owner" || role === "lead_architect") {
      return true;
    }

    // Role-based restrictions
    if (permission === "view_financial_data") {
      // Restrict BOQ / Estimate financial data to estimators, managers, and architects
      return ["estimator", "project_manager", "architect", "contractor"].includes(role);
    }

    if (permission === "approve" || permission === "publish") {
      return ["project_manager", "lead_architect", "admin"].includes(role);
    }

    if (permission === "archive") {
      return ["admin", "project_manager"].includes(role);
    }

    // Default permissions for service providers
    return ["architect", "designer", "estimator", "field_engineer", "provider"].includes(role);
  }

  static assertPermission(
    userRole: string,
    permission: StudioPermission,
    workspaceType?: string
  ): void {
    if (!this.checkPermission(userRole, permission, workspaceType)) {
      throw new Error(
        `Permission denied: role '${userRole}' does not have '${permission}' permission for ${workspaceType || "Studio"}.`
      );
    }
  }
}
