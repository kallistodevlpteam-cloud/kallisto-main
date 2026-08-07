export type ScheduleViewMode = "Day" | "Week" | "Month" | "Gantt";

export type ScheduleActivityType =
  | "Milestone"
  | "Site task"
  | "Approval"
  | "Procurement"
  | "Inspection"
  | "Meeting";

export type ScheduleActivityStatus =
  | "Scheduled"
  | "In progress"
  | "Pending approval"
  | "Blocked"
  | "Completed"
  | "Delayed";

export type ScheduleWorkstream =
  | "Architecture"
  | "Structure"
  | "MEP"
  | "Procurement"
  | "Site execution"
  | "Client approvals";

export interface ScheduleActivityItem {
  id: string;
  projectId: string;
  title: string;
  type: ScheduleActivityType;
  phase: string;
  workstream: ScheduleWorkstream;
  startDate: string;
  endDate: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
  owner: string;
  ownerInitials: string;
  dependency?: string;
  status: ScheduleActivityStatus;
  linkedDocument?: string;
  notes?: string;
  progressPercent?: number;
  isCriticalPath?: boolean;
}

export interface ScheduleDateState {
  anchorDate: string;
  selectedDate: string;
  visibleWeekStart: string;
  visibleWeekEnd: string;
}

export interface ScheduleFilterState {
  phases: string[];
  workstreams: string[];
  team: string[];
  statuses: string[];
  search: string;
}

export interface SchedulePermissions {
  canCreateActivity: boolean;
  canEditActivity: boolean;
  canDeleteActivity: boolean;
}

export interface ScheduleSlotSelection {
  date: string;
  startTime: string;
  endTime: string;
}
