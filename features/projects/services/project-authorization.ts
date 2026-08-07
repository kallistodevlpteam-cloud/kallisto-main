import { ProjectMemberRecord, UserSecurityContext } from "../types/project.types";

export interface ProjectAccessCheckResult {
  isAllowed: boolean;
  reason?: string;
  isNotFound?: boolean;
}

export interface WorkspaceRole {
  role: string;
  permissions: string[];
}

export function checkUserPermission(
  context: UserSecurityContext,
  permission: string
): boolean {
  if (context.isWorkspaceAdmin || context.role === "workspace_admin" || context.role === "admin") {
    return true;
  }
  return context.permissions.includes(permission);
}

export function isUserAuthorizedForProject(
  context: UserSecurityContext,
  project: { id: string; workspaceId: string; ownerId: string | null },
  projectMembers?: ProjectMemberRecord[]
): boolean {
  // 1. Workspace scoping check
  if (project.workspaceId !== context.workspaceId) {
    return false;
  }

  // 2. Workspace admin role check
  if (context.isWorkspaceAdmin || context.role === "workspace_admin" || context.role === "admin") {
    return true;
  }

  // 3. Project owner check
  if (project.ownerId && project.ownerId === context.userId) {
    return true;
  }

  // 4. Datastore-backed project membership check
  if (projectMembers) {
    const isMember = projectMembers.some(
      (m) => m.projectId === project.id && m.userId === context.userId
    );
    if (isMember) return true;
  }

  // Default deny for non-admin, non-owner, non-member
  return false;
}

/**
 * Requirement #9: Safe unavailable/not-found response to prevent route-level existence leakage.
 */
export function buildSafeProjectUnavailableResponse(
  internalReason: string
): { error: string; code: string } {
  console.warn(`[Security Log - Safe Project Response]: ${internalReason}`);
  return {
    error: "The requested project is unavailable or you do not have permission to view it.",
    code: "PROJECT_UNAVAILABLE",
  };
}
