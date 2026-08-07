import type { ICalendarActivityRepository } from "./calendar-activity.repository";
import type { IProjectScheduleRepository } from "./project-schedule.repository";

export interface ICalendarUnitOfWork {
  executeTransaction<T>(
    work: (repos: {
      activities: ICalendarActivityRepository;
      scheduleItems: IProjectScheduleRepository;
    }) => Promise<T>
  ): Promise<T>;
}
