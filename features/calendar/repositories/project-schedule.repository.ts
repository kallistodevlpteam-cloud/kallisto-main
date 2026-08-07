import type { ProjectScheduleItem } from "@/types/domain/calendar";

export interface ScheduleFilterInput {
  projectId?: string;
  itemType?: ProjectScheduleItem["itemType"];
  status?: ProjectScheduleItem["status"];
  assigneeId?: string;
}

export interface CreateScheduleItemInput {
  workspaceId: string;
  projectId: string;
  title: string;
  itemType: ProjectScheduleItem["itemType"];
  startDate: string;
  dueDate: string;
  baselineStartDate?: string;
  baselineDueDate?: string;
  progress?: number;
  status: ProjectScheduleItem["status"];
  assigneeId?: string;
  dependencyIds?: string[];
  blockerReason?: string;
  linkedActivityIds?: string[];
}

export interface IProjectScheduleRepository {
  listScheduleItems(filter?: ScheduleFilterInput): Promise<ProjectScheduleItem[]>;
  getScheduleItemById(id: string): Promise<ProjectScheduleItem | null>;
  createScheduleItem(input: CreateScheduleItemInput, idempotencyKey?: string): Promise<ProjectScheduleItem>;
  updateScheduleItem(id: string, patch: Partial<ProjectScheduleItem>): Promise<ProjectScheduleItem>;
  deleteScheduleItem(id: string): Promise<void>;
}
