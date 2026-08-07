import type { CalendarActivity, CalendarVisibility } from "@/types/domain/calendar";

export interface ActivityFilterInput {
  date?: string;
  startDate?: string;
  endDate?: string;
  scope?: "mine" | "team" | "project";
  projectId?: string;
  assigneeId?: string;
  activityType?: string;
  status?: string;
  visibility?: CalendarVisibility;
  includeCompleted?: boolean;
}

export interface CreateActivityInput {
  workspaceId: string;
  title: string;
  activityType: CalendarActivity["activityType"];
  visibility: CalendarVisibility;
  ownerId: string;
  assigneeIds: string[];
  time: CalendarActivity["time"];
  projectId?: string;
  location?: string;
  meetingUrl?: string;
  notes?: string;
  linkedScheduleItemId?: string;
}

export interface ICalendarActivityRepository {
  listActivities(filter?: ActivityFilterInput): Promise<CalendarActivity[]>;
  getActivityById(id: string): Promise<CalendarActivity | null>;
  createActivity(input: CreateActivityInput, idempotencyKey?: string): Promise<CalendarActivity>;
  updateActivity(id: string, patch: Partial<CalendarActivity>): Promise<CalendarActivity>;
  deleteActivity(id: string): Promise<void>;
}
