import { describe, expect, it } from "vitest";

import { MemoryCalendarActivityRepository } from "@/features/calendar/repositories/memory/memory-calendar-activity.repository";
import { MemoryCalendarUnitOfWork } from "@/features/calendar/repositories/memory/memory-calendar-unit-of-work";
import { MemoryProjectScheduleRepository } from "@/features/calendar/repositories/memory/memory-project-schedule.repository";
import { CalendarActivityService } from "@/features/calendar/services/calendar-activity.service";
import type { CalendarActivity } from "@/types/domain/calendar";

const scheduledActivity: CalendarActivity = {
  id: "act-complete",
  workspaceId: "ws-kallisto",
  title: "Client design review",
  activityType: "client_meeting",
  visibility: "project",
  ownerId: "usr-1",
  assigneeIds: ["usr-1"],
  time: {
    allDay: false,
    startAt: "2026-07-24T10:30:00+05:30",
    endAt: "2026-07-24T11:30:00+05:30",
    timezone: "Asia/Kolkata",
  },
  projectId: "proj-201",
  sourceType: "calendar_activity",
  sourceId: "act-complete",
  status: "scheduled",
};

describe("Calendar activity completion", () => {
  it("marks a scheduled activity complete and keeps repeated completion idempotent", async () => {
    const activityRepository = new MemoryCalendarActivityRepository([
      scheduledActivity,
    ]);
    const scheduleRepository = new MemoryProjectScheduleRepository([]);
    const service = new CalendarActivityService(
      new MemoryCalendarUnitOfWork(activityRepository, scheduleRepository)
    );

    const completed = await service.markActivityComplete("act-complete");
    const repeated = await service.markActivityComplete("act-complete");

    expect(completed.status).toBe("completed");
    expect(repeated.status).toBe("completed");
    expect(
      (await activityRepository.getActivityById("act-complete"))?.status
    ).toBe("completed");
  });
});
