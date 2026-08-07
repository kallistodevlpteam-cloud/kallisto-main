/**
 * Authoritative Project Schedule Domain Models
 */

export type ProjectActivityType = "activity" | "milestone" | "approval" | "site_activity";
export type ProjectActivityStatus = "not_started" | "in_progress" | "completed" | "blocked" | "cancelled";
export type ProjectApprovalStatus = "not_required" | "pending" | "approved" | "rejected";
export type DependencyType = "finish_to_start" | "start_to_start" | "finish_to_finish" | "start_to_finish";

export interface ProjectScheduleDependency {
  predecessorActivityId: string;
  type: DependencyType;
  lagDays: number;
}

export interface ProjectSchedulePhase {
  id: string;
  projectId: string;
  name: string;
  wbsCode: string;
  order: number;
  status: "not_started" | "active" | "completed";
  weight: number;
}

export interface ProjectScheduleActivity {
  id: string;
  projectId: string;
  phaseId: string;
  parentId: string | null;
  wbsCode: string;

  title: string;
  description?: string;
  type: ProjectActivityType;
  status: ProjectActivityStatus;

  plannedStartDate: string | null;
  plannedEndDate: string | null;

  baselineStartDate: string | null;
  baselineEndDate: string | null;

  actualStartDate: string | null;
  actualEndDate: string | null;

  completedAt: string | null;

  progressPercent: number;
  weight: number;

  ownerId: string | null;
  assigneeName?: string;
  dependencies: ProjectScheduleDependency[];

  visibility: "project" | "private";
  approvalStatus: ProjectApprovalStatus;
  isMilestone?: boolean;
  criticalPath?: boolean;
}

export interface ProjectSchedulePermissions {
  canViewSchedule: boolean;
  canCreateActivity: boolean;
  canEditActivity: boolean;
  canDeleteActivity: boolean;
  canCompleteActivity: boolean;
  canEditBaseline: boolean;
  canViewBaseline: boolean;
  canViewPrivateActivities: boolean;
  canViewRestrictedDates: boolean;
  canManageDependencies: boolean;
  canApproveActivity: boolean;
}

export interface ProjectScheduleActivityView extends ProjectScheduleActivity {
  assignee: {
    id: string;
    name: string;
    avatarUrl?: string;
  } | null;
  isCriticalPath: boolean;
}

export interface ScheduleSummaryContext {
  today: string; // YYYY-MM-DD
  timezone: string;
}
