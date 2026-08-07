import {
  ProjectTask,
  ProjectTaskPriority,
  ProjectTaskStatus,
  ProjectTaskVisibility,
  TaskChecklistItem,
  WorkPackage,
} from "@/types/domain/project-task";

export type ProjectTaskCursor = string;

export interface ProjectTaskMutationResult<T> {
  taskId: string;
  taskVersion: number;
  value: T;
}

export interface ListProjectTasksInput {
  workspaceId: string;
  projectId: string;
  scope?: "all" | "mine";
  searchQuery?: string;
  statusFilter?: ProjectTaskStatus | "active" | "all";
  priorityFilter?: string;
  assigneeFilter?: string;
  phaseFilter?: string;
  workPackageFilter?: string;
  sortBy?: "needs_attention" | "recently_updated" | "due_date" | "priority" | "progress" | "created_at" | "status" | "title" | "updated_at";
  sortOrder?: "asc" | "desc";
  groupPagination?: {
    workPackageId: string;
    cursor?: ProjectTaskCursor;
    limit: number;
  };
}

export interface ProjectTaskGroupResult {
  workPackage: WorkPackage;
  tasks: ProjectTask[];
  totalCount: number;
  nextCursor?: ProjectTaskCursor;
}

export interface ProjectTaskPage {
  groups: ProjectTaskGroupResult[];
  totalCount: number;
  attentionSummary: {
    overdueCount: number;
    blockedCount: number;
    awaitingClientApprovalCount: number;
    dueThisWeekCount: number;
  };
}

export interface CreateProjectTaskCommand {
  workspaceId: string;
  projectId: string;
  actorId: string;
  idempotencyKey: string;

  title: string;
  description?: string;
  workPackageId: string;
  phaseId?: string;
  milestoneId?: string;
  siteZoneId?: string;

  status?: ProjectTaskStatus;
  priority?: ProjectTaskPriority;
  assigneeIds: string[];
  reporterId: string;

  startDate?: string;
  dueDate?: string;
  visibility: ProjectTaskVisibility;
}

export interface UpdateProjectTaskCommand {
  workspaceId: string;
  projectId: string;
  taskId: string;
  actorId: string;
  expectedVersion: number;
  idempotencyKey: string;
  patch: {
    title?: string;
    description?: string;
    workPackageId?: string;
    phaseId?: string | null;
    milestoneId?: string | null;
    siteZoneId?: string | null;
    priority?: ProjectTaskPriority;
    assigneeIds?: string[];
    startDate?: string | null;
    dueDate?: string | null;
  };
}

export interface ChangeProjectTaskVisibilityCommand {
  workspaceId: string;
  projectId: string;
  taskId: string;
  actorId: string;
  expectedVersion: number;
  idempotencyKey: string;
  targetVisibility: ProjectTaskVisibility;
  confirmation?: boolean;
}

export interface ChangeProjectTaskStatusInput {
  workspaceId: string;
  projectId: string;
  taskId: string;
  status: ProjectTaskStatus;
  actorId: string;
  expectedVersion: number;
  idempotencyKey: string;

  blockerReason?: string;
  completionNote?: string;
  approvalEvidenceId?: string;
  reopenedReason?: string;
}

export interface DeleteProjectTaskCommand {
  workspaceId: string;
  projectId: string;
  taskId: string;
  actorId: string;
  expectedVersion: number;
  idempotencyKey: string;
  reason: string;
}

export interface AddTaskChecklistItemInput {
  workspaceId: string;
  projectId: string;
  taskId: string;
  actorId: string;
  expectedVersion: number;
  idempotencyKey: string;
  label: string;
}

export interface UpdateTaskChecklistItemInput {
  workspaceId: string;
  projectId: string;
  taskId: string;
  checklistItemId: string;
  actorId: string;
  expectedVersion: number;
  idempotencyKey: string;
  completed?: boolean;
  label?: string;
}

export interface DeleteTaskChecklistItemInput {
  workspaceId: string;
  projectId: string;
  taskId: string;
  checklistItemId: string;
  actorId: string;
  expectedVersion: number;
  idempotencyKey: string;
}

export interface AttachTaskFileInput {
  workspaceId: string;
  projectId: string;
  taskId: string;
  attachmentId: string;
  actorId: string;
  expectedVersion: number;
  idempotencyKey: string;
}

export interface RemoveTaskAttachmentInput {
  workspaceId: string;
  projectId: string;
  taskId: string;
  attachmentId: string;
  actorId: string;
  expectedVersion: number;
  idempotencyKey: string;
}

export interface AddTaskDependencyInput {
  workspaceId: string;
  projectId: string;
  taskId: string;
  dependencyTaskId: string;
  actorId: string;
  expectedVersion: number;
  idempotencyKey: string;
}

export interface RemoveTaskDependencyInput {
  workspaceId: string;
  projectId: string;
  taskId: string;
  dependencyTaskId: string;
  actorId: string;
  expectedVersion: number;
  idempotencyKey: string;
}

export interface ProjectTaskRepository {
  list(input: ListProjectTasksInput): Promise<ProjectTaskPage>;

  getById(input: {
    workspaceId: string;
    projectId: string;
    taskId: string;
  }): Promise<ProjectTask | null>;

  getWorkPackages(workspaceId: string, projectId: string): Promise<WorkPackage[]>;

  create(command: CreateProjectTaskCommand): Promise<ProjectTask>;
  update(command: UpdateProjectTaskCommand): Promise<ProjectTask>;
  changeVisibility(command: ChangeProjectTaskVisibilityCommand): Promise<ProjectTask>;
  changeStatus(input: ChangeProjectTaskStatusInput): Promise<ProjectTask>;
  delete(command: DeleteProjectTaskCommand): Promise<void>;

  addChecklistItem(input: AddTaskChecklistItemInput): Promise<ProjectTaskMutationResult<TaskChecklistItem>>;
  updateChecklistItem(input: UpdateTaskChecklistItemInput): Promise<ProjectTaskMutationResult<TaskChecklistItem>>;
  deleteChecklistItem(input: DeleteTaskChecklistItemInput): Promise<ProjectTaskMutationResult<void>>;

  attachFile(input: AttachTaskFileInput): Promise<ProjectTaskMutationResult<ProjectTask>>;
  removeAttachment(input: RemoveTaskAttachmentInput): Promise<ProjectTaskMutationResult<ProjectTask>>;

  addDependency(input: AddTaskDependencyInput): Promise<ProjectTaskMutationResult<ProjectTask>>;
  removeDependency(input: RemoveTaskDependencyInput): Promise<ProjectTaskMutationResult<ProjectTask>>;
}
