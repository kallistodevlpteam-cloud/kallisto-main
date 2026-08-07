import type { ProjectScheduleItem } from "@/types/domain/calendar";
import type { ICalendarUnitOfWork } from "../repositories/unit-of-work.interface";
import type { ScheduleFilterInput, CreateScheduleItemInput } from "../repositories/project-schedule.repository";
import { CalendarValidationService } from "./calendar-validation.service";

export interface PresentableScheduleItem extends ProjectScheduleItem {
  isDelayed: boolean;
  isCriticalDelay: boolean;
}

export class ProjectScheduleService {
  constructor(private unitOfWork: ICalendarUnitOfWork) {}

  async getScheduleItemsForProject(
    filter: ScheduleFilterInput,
    referenceNow: string = "2026-07-24"
  ): Promise<PresentableScheduleItem[]> {
    return this.unitOfWork.executeTransaction(async ({ scheduleItems }) => {
      const items = await scheduleItems.listScheduleItems(filter);
      const itemsMap = new Map(items.map((i) => [i.id, i]));

      return items.map((item) => {
        let isDelayed = false;
        let isCriticalDelay = false;

        if (item.status !== "completed") {
          if (item.dueDate < referenceNow) {
            isDelayed = true;
          }
          if (item.baselineDueDate && item.dueDate > item.baselineDueDate) {
            isDelayed = true;
          }
          if (item.status === "blocked" || (isDelayed && item.dependencyIds.length > 0)) {
            isCriticalDelay = true;
          }
        }

        return {
          ...item,
          isDelayed,
          isCriticalDelay,
        };
      });
    });
  }

  async createScheduleItem(
    input: CreateScheduleItemInput,
    idempotencyKey?: string
  ): Promise<ProjectScheduleItem> {
    return this.unitOfWork.executeTransaction(async ({ scheduleItems }) => {
      const existingItems = await scheduleItems.listScheduleItems({ projectId: input.projectId });
      const existingMap = new Map(existingItems.map((i) => [i.id, i]));

      CalendarValidationService.validateScheduleItemInput(input, existingMap);

      return scheduleItems.createScheduleItem(input, idempotencyKey);
    });
  }
}
