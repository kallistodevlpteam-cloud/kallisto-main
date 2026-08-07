import { ProjectActivityStatus } from "../../../domain/project-schedule.types";

export type GanttZoom = "week" | "month" | "quarter";
export type TimelineCategoryFilter = "all" | "activities" | "milestones" | "approvals";

export interface GanttQueryState {
  date: string;
  zoom: GanttZoom;
  baseline: boolean;
  activity: string | null;
  status: ProjectActivityStatus[];
  phase: string | null;
  owner: string | null;
  q: string;
  criticalPath: boolean;
}

export interface TimelineTabQueryState {
  timelineFilter: TimelineCategoryFilter;
  q: string;
  activity: string | null;
}
