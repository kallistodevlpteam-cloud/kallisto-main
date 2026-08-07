import type { CalendarActivity, ProjectScheduleItem } from "@/types/domain/calendar";
import type { CreateActivityInput } from "../repositories/calendar-activity.repository";
import type { CreateScheduleItemInput } from "../repositories/project-schedule.repository";

export class CalendarValidationService {
  static validateActivityInput(input: CreateActivityInput | Partial<CalendarActivity>): void {
    if (!input.title || !input.title.trim()) {
      throw new Error("Activity title cannot be empty.");
    }

    if (input.time) {
      if (input.time.allDay) {
        if (!input.time.startDate || !input.time.endDateExclusive) {
          throw new Error("All-day activities must specify startDate and endDateExclusive.");
        }
        if (input.time.endDateExclusive <= input.time.startDate) {
          throw new Error("endDateExclusive must be strictly after startDate.");
        }
      } else {
        if (!input.time.startAt || !input.time.endAt) {
          throw new Error("Timed activities must specify startAt and endAt ISO strings.");
        }
        const startTime = new Date(input.time.startAt).getTime();
        const endTime = new Date(input.time.endAt).getTime();
        if (isNaN(startTime) || isNaN(endTime)) {
          throw new Error("Invalid ISO-8601 date string provided.");
        }
        if (endTime <= startTime) {
          throw new Error("endAt must be strictly after startAt.");
        }
      }
    }

    if (input.visibility === "project" && !input.projectId) {
      throw new Error("Project-visible activities must specify a valid projectId.");
    }
  }

  static validateScheduleItemInput(
    input: CreateScheduleItemInput | Partial<ProjectScheduleItem>,
    existingItemsMap?: Map<string, ProjectScheduleItem>
  ): void {
    if (!input.title || !input.title.trim()) {
      throw new Error("Schedule item title cannot be empty.");
    }

    if (input.startDate && input.dueDate) {
      if (input.itemType === "milestone") {
        if (input.startDate !== input.dueDate) {
          throw new Error("Milestones must have identical start and due dates.");
        }
      } else {
        if (input.dueDate < input.startDate) {
          throw new Error("dueDate cannot be before startDate.");
        }
      }
    }

    if (input.progress !== undefined) {
      if (input.progress < 0 || input.progress > 100) {
        throw new Error("Progress percentage must remain between 0 and 100.");
      }
    }

    if (input.dependencyIds && input.dependencyIds.length > 0) {
      const id = (input as ProjectScheduleItem).id;
      for (const depId of input.dependencyIds) {
        if (id && depId === id) {
          throw new Error("A schedule item cannot depend on itself.");
        }
        if (existingItemsMap && !existingItemsMap.has(depId)) {
          throw new Error(`Referenced dependency item ${depId} does not exist.`);
        }
      }
    }
  }
}
