import type { CalendarActivity } from "@/types/domain/calendar";
import type {
  ICalendarActivityRepository,
  ActivityFilterInput,
  CreateActivityInput,
} from "../calendar-activity.repository";
import { INITIAL_ACTIVITIES_DATA } from "../../data/mock-calendar-data";

export class MemoryCalendarActivityRepository implements ICalendarActivityRepository {
  private activities: Map<string, CalendarActivity> = new Map();
  private idempotencyRegistry: Map<string, CalendarActivity> = new Map();

  constructor(initialData: CalendarActivity[] = INITIAL_ACTIVITIES_DATA) {
    initialData.forEach((act) => this.activities.set(act.id, { ...act }));
  }

  async listActivities(filter?: ActivityFilterInput): Promise<CalendarActivity[]> {
    let result = Array.from(this.activities.values());

    if (!filter) return result;

    if (filter.projectId) {
      result = result.filter((a) => a.projectId === filter.projectId);
    }
    if (filter.activityType) {
      result = result.filter((a) => a.activityType === filter.activityType);
    }
    if (filter.visibility) {
      result = result.filter((a) => a.visibility === filter.visibility);
    }
    if (filter.status) {
      result = result.filter((a) => a.status === filter.status);
    }
    if (filter.includeCompleted === false) {
      result = result.filter((a) => a.status !== "completed");
    }
    if (filter.assigneeId) {
      result = result.filter(
        (a) => a.ownerId === filter.assigneeId || a.assigneeIds.includes(filter.assigneeId!)
      );
    }
    if (filter.date) {
      const targetDate = filter.date;
      result = result.filter((a) => {
        if (a.time.allDay) {
          return a.time.startDate === targetDate;
        }
        return a.time.startAt.startsWith(targetDate);
      });
    }

    return result;
  }

  async getActivityById(id: string): Promise<CalendarActivity | null> {
    const act = this.activities.get(id);
    return act ? { ...act } : null;
  }

  async createActivity(
    input: CreateActivityInput,
    idempotencyKey?: string
  ): Promise<CalendarActivity> {
    if (idempotencyKey && this.idempotencyRegistry.has(idempotencyKey)) {
      return { ...this.idempotencyRegistry.get(idempotencyKey)! };
    }

    const id = `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newActivity: CalendarActivity = {
      id,
      workspaceId: input.workspaceId,
      title: input.title,
      activityType: input.activityType,
      visibility: input.visibility,
      ownerId: input.ownerId,
      assigneeIds: input.assigneeIds,
      time: input.time,
      projectId: input.projectId,
      location: input.location,
      meetingUrl: input.meetingUrl,
      notes: input.notes,
      sourceType: "calendar_activity",
      sourceId: id,
      linkedScheduleItemId: input.linkedScheduleItemId,
      status: "scheduled",
    };

    this.activities.set(id, newActivity);

    if (idempotencyKey) {
      this.idempotencyRegistry.set(idempotencyKey, newActivity);
    }

    return { ...newActivity };
  }

  async updateActivity(id: string, patch: Partial<CalendarActivity>): Promise<CalendarActivity> {
    const existing = this.activities.get(id);
    if (!existing) {
      throw new Error(`Activity with id ${id} not found.`);
    }

    const updated: CalendarActivity = {
      ...existing,
      ...patch,
      id: existing.id, // Immutable
    };

    this.activities.set(id, updated);
    return { ...updated };
  }

  async deleteActivity(id: string): Promise<void> {
    this.activities.delete(id);
  }
}
