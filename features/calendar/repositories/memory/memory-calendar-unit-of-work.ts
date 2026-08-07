import type { ICalendarUnitOfWork } from "../unit-of-work.interface";
import type { ICalendarActivityRepository } from "../calendar-activity.repository";
import type { IProjectScheduleRepository } from "../project-schedule.repository";
import { MemoryCalendarActivityRepository } from "./memory-calendar-activity.repository";
import { MemoryProjectScheduleRepository } from "./memory-project-schedule.repository";

export class MemoryCalendarUnitOfWork implements ICalendarUnitOfWork {
  constructor(
    private activityRepo: MemoryCalendarActivityRepository,
    private scheduleRepo: MemoryProjectScheduleRepository
  ) {}

  async executeTransaction<T>(
    work: (repos: {
      activities: ICalendarActivityRepository;
      scheduleItems: IProjectScheduleRepository;
    }) => Promise<T>
  ): Promise<T> {
    // Snapshot existing data for atomic rollback
    const activitySnapshot = await this.activityRepo.listActivities();
    const scheduleSnapshot = await this.scheduleRepo.listScheduleItems();

    try {
      // Execute work using the repositories
      return await work({
        activities: this.activityRepo,
        scheduleItems: this.scheduleRepo,
      });
    } catch (error) {
      // Rollback memory repos to snapshot state
      const currentActivities = await this.activityRepo.listActivities();
      for (const act of currentActivities) {
        await this.activityRepo.deleteActivity(act.id);
      }
      for (const act of activitySnapshot) {
        await this.activityRepo.createActivity(act);
      }

      const currentSchedule = await this.scheduleRepo.listScheduleItems();
      for (const item of currentSchedule) {
        await this.scheduleRepo.deleteScheduleItem(item.id);
      }
      for (const item of scheduleSnapshot) {
        await this.scheduleRepo.createScheduleItem(item);
      }

      throw error;
    }
  }
}
