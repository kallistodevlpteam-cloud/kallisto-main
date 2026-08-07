export type ProjectTaskStatus =
  | "todo"
  | "in_progress"
  | "waiting"
  | "blocked"
  | "completed"
  | "cancelled";

export type ProjectTaskPriority = "low" | "normal" | "high" | "critical";

export type ProjectTaskVisibility =
  | "project_team"
  | "client_visible"
  | "internal";

export type ProjectTaskErrorCode =
  | "VERSION_CONFLICT"
  | "TASK_NOT_FOUND"
  | "PERMISSION_DENIED"
  | "INVALID_STATUS_TRANSITION"
  | "BLOCKER_REASON_REQUIRED"
  | "APPROVAL_EVIDENCE_REQUIRED"
  | "SELF_DEPENDENCY"
  | "DUPLICATE_DEPENDENCY"
  | "CIRCULAR_DEPENDENCY"
  | "CROSS_PROJECT_DEPENDENCY"
  | "TASK_HAS_DEPENDENTS"
  | "INVALID_CURSOR"
  | "IDEMPOTENCY_CONFLICT";

export class ProjectTaskDomainError extends Error {
  constructor(
    public readonly code: ProjectTaskErrorCode,
    message: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ProjectTaskDomainError";
  }
}

export interface WorkPackage {
  id: string;
  workspaceId: string;
  projectId: string;
  name: string;
  order: number;
  phaseId?: string;
  milestoneId?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskChecklistItem {
  id: string;
  taskId: string;
  label: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTask {
  id: string;
  workspaceId: string;
  projectId: string;
  version: number;

  title: string;
  description?: string;

  workPackageId: string;
  phaseId?: string;
  milestoneId?: string;
  siteZoneId?: string;

  status: ProjectTaskStatus;
  priority: ProjectTaskPriority;

  assigneeIds: string[];
  reporterId: string;

  startDate?: string;
  dueDate?: string;
  completedAt?: string;

  progress?: number;
  visibility: ProjectTaskVisibility;

  checklistItemIds: string[];
  dependencyIds: string[];
  attachmentIds: string[];

  blockerReason?: string;
  commentCount: number;

  createdAt: string;
  updatedAt: string;
}

export type TaskPanelState =
  | { type: "closed" }
  | { type: "inspect"; taskId: string }
  | { type: "create" }
  | { type: "edit"; taskId: string };

/**
 * Domain-level progress calculation rule
 */
export function calculateTaskProgress(
  task: ProjectTask,
  checklist: TaskChecklistItem[]
): number | undefined {
  if (task.status === "completed") return 100;
  if (task.status === "cancelled") return undefined;

  if (checklist.length > 0) {
    const completedCount = checklist.filter((item) => item.completed).length;
    return Math.round((completedCount / checklist.length) * 100);
  }

  return task.progress;
}

/**
 * Dependency validation helper
 */
export function validateTaskDependencies(
  task: ProjectTask,
  newDependencyId: string,
  allTasksMap: Map<string, ProjectTask>
): void {
  if (task.id === newDependencyId) {
    throw new ProjectTaskDomainError("SELF_DEPENDENCY", "A task cannot depend on itself.", { taskId: task.id });
  }
  if (task.dependencyIds.includes(newDependencyId)) {
    throw new ProjectTaskDomainError("DUPLICATE_DEPENDENCY", "Duplicate dependency.", { taskId: task.id, newDependencyId });
  }
  const depTask = allTasksMap.get(newDependencyId);
  if (!depTask) {
    throw new ProjectTaskDomainError("TASK_NOT_FOUND", "Dependency task does not exist in project.");
  }
  if (depTask.workspaceId !== task.workspaceId || depTask.projectId !== task.projectId) {
    throw new ProjectTaskDomainError("CROSS_PROJECT_DEPENDENCY", "Dependencies must belong to the same project and workspace.");
  }
  if (depTask.status === "cancelled") {
    throw new ProjectTaskDomainError("INVALID_STATUS_TRANSITION", "Cancelled tasks cannot become new dependencies.");
  }

  // Cycle detection (DFS)
  const visited = new Set<string>();
  function checkCycle(currentId: string): void {
    if (currentId === task.id) {
      throw new ProjectTaskDomainError("CIRCULAR_DEPENDENCY", "Circular dependency chain detected.");
    }
    if (visited.has(currentId)) return;
    visited.add(currentId);
    const node = allTasksMap.get(currentId);
    if (node) {
      node.dependencyIds.forEach((id) => checkCycle(id));
    }
  }
  depTask.dependencyIds.forEach((id) => checkCycle(id));
}

/**
 * Authorization contract
 */
export interface TaskAuthorizationInput {
  workspaceId: string;
  projectId: string;
  userId: string;
  userRole?: string;
  task?: ProjectTask;
}

export interface ProjectTaskAuthorization {
  canViewTask(input: TaskAuthorizationInput): Promise<boolean>;
  canCreateTask(input: TaskAuthorizationInput): Promise<boolean>;
  canEditTask(input: TaskAuthorizationInput): Promise<boolean>;
  canDeleteTask(input: TaskAuthorizationInput): Promise<boolean>;

  canChangeStatus(
    input: TaskAuthorizationInput & {
      targetStatus: ProjectTaskStatus;
      approvalEvidenceId?: string;
    }
  ): Promise<boolean>;

  canChangeVisibility(
    input: TaskAuthorizationInput & {
      targetVisibility: ProjectTaskVisibility;
    }
  ): Promise<boolean>;

  canViewAttachment(
    input: TaskAuthorizationInput & {
      attachmentId: string;
    }
  ): Promise<boolean>;
}
