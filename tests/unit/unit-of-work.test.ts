import { describe, it, expect } from "vitest";
import { MemoryCalendarActivityRepository } from "@/features/calendar/repositories/memory/memory-calendar-activity.repository";
import { MemoryProjectScheduleRepository } from "@/features/calendar/repositories/memory/memory-project-schedule.repository";
import { MemoryCalendarUnitOfWork } from "@/features/calendar/repositories/memory/memory-calendar-unit-of-work";

describe("MemoryCalendarUnitOfWork", () => {
  it("rolls back memory repository mutations if transaction callback throws an error", async () => {
    const actRepo = new MemoryCalendarActivityRepository();
    const schRepo = new MemoryProjectScheduleRepository();
    const uow = new MemoryCalendarUnitOfWork(actRepo, schRepo);

    const initialActivitiesCount = (await actRepo.listActivities()).length;

    await expect(
      uow.executeTransaction(async ({ activities }) => {
        await activities.createActivity({
          workspaceId: "ws-1",
          title: "Temporary Activity",
          activityType: "site_visit",
          visibility: "workspace",
          ownerId: "usr-1",
          assigneeIds: ["usr-1"],
          time: {
            allDay: true,
            startDate: "2026-07-25",
            endDateExclusive: "2026-07-25",
            timezone: "Asia/Kolkata",
          },
        });

        // Force intentional transaction failure
        throw new Error("Transaction Rollback Triggered!");
      })
    ).rejects.toThrow("Transaction Rollback Triggered!");

    const finalActivitiesCount = (await actRepo.listActivities()).length;
    expect(finalActivitiesCount).toBe(initialActivitiesCount);
  });
});
