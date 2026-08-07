import type { CalendarActivity } from "@/types/domain/calendar";
import type { ICalendarUnitOfWork } from "../repositories/unit-of-work.interface";
import type { ActivityFilterInput, CreateActivityInput } from "../repositories/calendar-activity.repository";
import type { CreateScheduleItemInput } from "../repositories/project-schedule.repository";
import { CalendarValidationService } from "./calendar-validation.service";
import { CalendarPermissionsService, type UserContext } from "./calendar-permissions.service";

export interface PresentableActivity extends CalendarActivity {
  isOverdue: boolean;
}

export class CalendarActivityService {
  constructor(private unitOfWork: ICalendarUnitOfWork) {}

  async getActivitiesForWorkspace(
    filter: ActivityFilterInput,
    userContext: UserContext,
    referenceNow: Date = new Date("2026-07-24T12:00:00+05:30")
  ): Promise<PresentableActivity[]> {
    return this.unitOfWork.executeTransaction(async ({ activities }) => {
      const rawActivities = await activities.listActivities(filter);
      const authorizedActivities = CalendarPermissionsService.applyPermissionsAndMasking(
        rawActivities,
        userContext
      );

      return authorizedActivities.map((act) => {
        let isOverdue = false;
        if (act.status === "scheduled") {
          if (act.time.allDay) {
            isOverdue = act.time.endDateExclusive <= referenceNow.toISOString().substring(0, 10);
          } else {
            isOverdue = new Date(act.time.endAt).getTime() < referenceNow.getTime();
          }
        }
        return {
          ...act,
          isOverdue,
        };
      });
    });
  }

  async createActivityWithOptionalScheduleItem(
    input: {
      activity: CreateActivityInput;
      createScheduleItem?: CreateScheduleItemInput;
    },
    idempotencyKey?: string
  ): Promise<{ activity: CalendarActivity; scheduleItemId?: string }> {
    CalendarValidationService.validateActivityInput(input.activity);
    if (input.createScheduleItem) {
      CalendarValidationService.validateScheduleItemInput(input.createScheduleItem);
    }

    return this.unitOfWork.executeTransaction(async ({ activities, scheduleItems }) => {
      let createdScheduleItemId: string | undefined = undefined;

      if (input.createScheduleItem) {
        const scheduleItem = await scheduleItems.createScheduleItem(
          input.createScheduleItem,
          idempotencyKey ? `${idempotencyKey}-sch` : undefined
        );
        createdScheduleItemId = scheduleItem.id;
        input.activity.linkedScheduleItemId = scheduleItem.id;
      }

      const activity = await activities.createActivity(
        input.activity,
        idempotencyKey ? `${idempotencyKey}-act` : undefined
      );

      if (createdScheduleItemId) {
        await scheduleItems.updateScheduleItem(createdScheduleItemId, {
          linkedActivityIds: [activity.id],
        });
      }

      return {
        activity,
        scheduleItemId: createdScheduleItemId,
      };
    });
  }

  async updateLinkedDate(
    activityId: string,
    newTime: CalendarActivity["time"]
  ): Promise<{ activity: CalendarActivity; scheduleItemUpdated: boolean }> {
    return this.unitOfWork.executeTransaction(async ({ activities, scheduleItems }) => {
      const existingAct = await activities.getActivityById(activityId);
      if (!existingAct) {
        throw new Error(`Activity ${activityId} not found.`);
      }

      CalendarValidationService.validateActivityInput({ time: newTime });
      const updatedAct = await activities.updateActivity(activityId, { time: newTime });

      let scheduleItemUpdated = false;

      if (existingAct.linkedScheduleItemId) {
        const scheduleItem = await scheduleItems.getScheduleItemById(existingAct.linkedScheduleItemId);
        if (scheduleItem) {
          const newDateStr = newTime.allDay
            ? newTime.startDate
            : newTime.startAt.substring(0, 10);

          await scheduleItems.updateScheduleItem(scheduleItem.id, {
            startDate: newDateStr,
            dueDate: scheduleItem.itemType === "milestone" ? newDateStr : scheduleItem.dueDate,
          });
          scheduleItemUpdated = true;
        }
      }

      return { activity: updatedAct, scheduleItemUpdated };
    });
  }

  async markActivityComplete(activityId: string): Promise<CalendarActivity> {
    return this.unitOfWork.executeTransaction(async ({ activities }) => {
      const existingActivity = await activities.getActivityById(activityId);
      if (!existingActivity) {
        throw new Error(`Activity ${activityId} not found.`);
      }
      if (existingActivity.status === "cancelled") {
        throw new Error("A cancelled activity cannot be marked complete.");
      }
      if (existingActivity.status === "completed") {
        return existingActivity;
      }

      return activities.updateActivity(activityId, { status: "completed" });
    });
  }
}
