import { describe, it, expect } from "vitest";
import { CalendarValidationService } from "@/features/calendar/services/calendar-validation.service";

describe("CalendarValidationService", () => {
  it("throws error when endAt is not strictly after startAt", () => {
    expect(() =>
      CalendarValidationService.validateActivityInput({
        title: "Test Event",
        time: {
          allDay: false,
          startAt: "2026-07-21T11:00:00+05:30",
          endAt: "2026-07-21T10:00:00+05:30", // Invalid!
          timezone: "Asia/Kolkata",
        },
      })
    ).toThrow("endAt must be strictly after startAt.");
  });

  it("throws error when milestones do not have identical start and due dates", () => {
    expect(() =>
      CalendarValidationService.validateScheduleItemInput({
        title: "Test Milestone",
        itemType: "milestone",
        startDate: "2026-07-21",
        dueDate: "2026-07-25", // Invalid for milestone!
      })
    ).toThrow("Milestones must have identical start and due dates.");
  });

  it("throws error when progress is outside 0-100", () => {
    expect(() =>
      CalendarValidationService.validateScheduleItemInput({
        title: "Test Task",
        itemType: "task",
        progress: 150, // Invalid!
      })
    ).toThrow("Progress percentage must remain between 0 and 100.");
  });
});
