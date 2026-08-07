export type ProjectStatus =
  | "UPCOMING"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "ARCHIVED"
  | "CANCELLED";

export type ProjectHealth =
  | "ON_TRACK"
  | "NEEDS_ATTENTION"
  | "BLOCKED"
  | "OVERDUE";

export type ProjectPhase =
  | "Briefing"
  | "Site verification"
  | "Concept"
  | "Design development"
  | "Approvals"
  | "BOQ and procurement"
  | "Construction"
  | "Handover"
  | "Post-handover";

export type ProjectActionType =
  | "CLIENT_APPROVAL"
  | "BOQ_REVISION"
  | "DRAWING_SUBMISSION"
  | "SITE_INSPECTION"
  | "VARIATION_REVIEW"
  | "CONTRACT_SIGNING"
  | "PAYMENT_RELEASE"
  | "GENERAL";

export interface UserSecurityContext {
  userId: string;
  role: string;
  workspaceId: string;
  permissions: string[];
  isWorkspaceAdmin?: boolean;
}

export interface ProjectMemberRecord {
  projectId: string;
  userId: string;
  role: string;
  addedAt: string;
}

export interface ProjectNextAction {
  id: string;
  projectId: string;
  title: string;
  type?: ProjectActionType;
  ownerId: string | null;
  ownerName?: string;
  dueAt: string | null;
  status: "PENDING" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED" | "CANCELLED";
  blockedReason?: string | null;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectListItem {
  id: string;
  name: string;
  code: string;
  type: string;
  clientId: string;
  clientDisplayName: string;
  phase: ProjectPhase;
  phaseProgress?: string;
  nextAction: {
    id: string;
    title: string;
    context: string;
    ownerName?: string;
    dueAt: string | null;
    dueState: "overdue" | "due_today" | "due_soon" | "on_track" | "no_due_date";
    dueLabel: string;
    isOverdue: boolean;
    isBlocked: boolean;
  } | null;
  owner: {
    id: string | null;
    name: string;
    initials: string;
  };
  status: ProjectStatus;
  health: ProjectHealth;
  updatedAt: string;
  allowedActions: Array<
    "open" | "edit" | "change_owner" | "put_on_hold" | "mark_complete" | "reopen" | "archive"
  >;
}

export interface Project {
  id: string;
  workspaceId: string;
  clientId: string;
  name: string;
  code: string;
  type: string;
  status: ProjectStatus;
  health: ProjectHealth;
  phase: ProjectPhase;
  phaseProgress?: string;
  ownerId: string | null;
  ownerName?: string | null;
  siteLocationId?: string | null;
  siteLocation?: string | null;
  nextActionId?: string | null;
  nextAction?: ProjectNextAction | null;
  startDate?: string | null;
  targetCompletionDate?: string | null;
  actualCompletionDate?: string | null;
  sourceEnquiryId?: string | null;
  importedAt?: string | null;
  importedBy?: string | null;
  contractValue?: number;
  notes?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  archivedAt?: string | null;
}

export type ProjectSortOption =
  | "action-due"
  | "recently-updated"
  | "project-name"
  | "start-date"
  | "completion-date"
  | "highest-priority";

export interface ProjectFilterParams {
  status?: ProjectStatus | "ALL" | "on-hold";
  q?: string;
  ownership?: "my_projects" | "all_projects" | string;
  phase?: ProjectPhase[];
  attention?: Array<
    | "overdue"
    | "due_this_week"
    | "blocked"
    | "awaiting_client"
    | "missing_owner"
    | "missing_next_action"
  >;
  location?: string;
  lifecycle?: Array<"CANCELLED" | "ARCHIVED">;
  sort?: ProjectSortOption;
  cursor?: string;
  limit?: number;
}

export interface ProjectsWorkspaceQueryResult {
  items: ProjectListItem[];
  nextCursor: string | null;
  hasMore: boolean;
  totalMatching: number;
  statusCounts: {
    active: number;
    upcoming: number;
    onHold: number;
    completed: number;
    all: number;
  };
  attentionCounts: {
    overdueActions: number;
    blockedProjects: number;
    pendingClientDecisions: number;
  };
}

export interface PreviewClientCandidate {
  id: string;
  name: string;
  organisationName?: string;
  email?: string;
  phone?: string;
  matchScore: number;
  matchReason: string;
}

export interface ImportValidationResult {
  validationId: string;
  expiresAt: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  dataPreview: {
    projectName: string;
    projectCode: string;
    projectType: string;
    clientSelection: {
      mode: "use_existing" | "create_new";
      clientId?: string;
      clientName?: string;
      organisationName?: string;
      email?: string;
      phone?: string;
    };
    siteLocation?: string;
    phase: ProjectPhase;
    startDate?: string;
    expectedCompletionDate?: string;
    ownerId?: string;
    ownerName?: string;
    contractValue?: number;
    sourceSystem?: string;
    notes?: string;
  };
  matchingClientCandidates: PreviewClientCandidate[];
  exactCodeDuplicate: boolean;
}

export interface ConfirmImportInput {
  validationId: string;
  idempotencyKey: string;
  clientSelection: {
    mode: "use_existing" | "create_new";
    selectedClientId?: string;
    newClientDetails?: {
      name: string;
      organisationName?: string;
      email?: string;
      phone?: string;
    };
  };
  notes?: string;
}

export interface ProjectAuditEvent {
  id: string;
  workspaceId: string;
  projectId: string;
  eventType: "STATUS_CHANGED" | "PROJECT_IMPORTED" | "PROJECT_CREATED" | "OWNER_CHANGED" | "PROJECT_REOPENED";
  fromStatus?: ProjectStatus;
  toStatus?: ProjectStatus;
  actorId: string;
  actorRole: string;
  timestamp: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface ProjectSearchIndex {
  projectId: string;
  workspaceId: string;
  normalizedName: string;
  normalizedCode: string;
  normalizedClientName: string;
  normalizedLocation: string;
  searchTokens: string[];
  updatedAt: string;
}
