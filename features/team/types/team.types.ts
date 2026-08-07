export const WORKSPACE_ROLES = [
  "Workspace Owner",
  "Admin",
  "Project Manager",
  "Architect",
  "Interior Designer",
  "Quantity Surveyor",
  "Contributor",
  "Finance",
  "Viewer",
] as const;

export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

export type MemberStatus = "active" | "invited" | "inactive";

export type PermissionKey = "view" | "edit" | "files" | "finance" | "admin";

export type PermissionSource = "workspace_role" | "project_override";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  projectIds: string[];
  workload: number;
  lastActive: string;
  status: MemberStatus;
  activeNow: boolean;
}

export interface Invitation {
  id: string;
  email: string;
  role: WorkspaceRole;
  invitedAtLabel: string;
  expiresLabel: string;
  projectAccess: InviteProjectAccess;
  selectedProjectIds: string[];
}

export interface ProjectSummary {
  id: string;
  name: string;
}

export interface PermissionGrant {
  enabled: boolean;
  source: PermissionSource;
  locked: boolean;
}

export interface ProjectAccess {
  memberId: string;
  projectId: string;
  projectRole: WorkspaceRole;
  permissions: Record<PermissionKey, PermissionGrant>;
}

export interface RoleSummary {
  role: WorkspaceRole;
  memberCount: number;
}

export interface TeamWorkspaceData {
  workspaceName: string;
  seatCapacity: number;
  members: TeamMember[];
  invitations: Invitation[];
  projects: ProjectSummary[];
  projectAccess: ProjectAccess[];
  roleSummaries: RoleSummary[];
}

export interface TeamMemberFilters {
  query: string;
  role: "all" | WorkspaceRole;
  projectId: "all" | string;
  status: "all" | MemberStatus;
}

export type InviteProjectAccess = "all" | "selected" | "none";

export interface InviteMemberInput {
  email: string;
  role: "" | WorkspaceRole;
  projectAccess: InviteProjectAccess;
  selectedProjectIds: string[];
  message: string;
}

export type InviteMemberErrors = Partial<
  Record<"email" | "role" | "projectAccess", string>
>;

export type TeamPageViewState = "ready" | "loading" | "error" | "forbidden";

export type MemberAction =
  | "view_profile"
  | "edit_role"
  | "manage_project_access"
  | "deactivate"
  | "remove";
