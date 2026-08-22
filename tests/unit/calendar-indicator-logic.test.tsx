import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  TodayTab,
  calculateDateActivityState,
  shouldShowCalendarDateIndicator,
} from "@/features/calendar/components/today-tab/today-tab";
import type { PresentableActivity } from "@/features/calendar/services/calendar-activity.service";
import type { PresentableScheduleItem } from "@/features/calendar/services/project-schedule.service";

afterEach(cleanup);

function makeActivity(
  id: string,
  dateStr: string,
  status: "scheduled" | "completed" | "cancelled" = "scheduled",
  projectId = "proj-1",
  activityType: PresentableActivity["activityType"] = "client_meeting",
  linkedScheduleItemId?: string
): PresentableActivity {
  return {
    id,
    workspaceId: "ws-kallisto",
    title: `Activity ${id}`,
    activityType,
    visibility: "workspace",
    ownerId: "usr-1",
    assigneeIds: ["usr-1"],
    time: {
      allDay: false,
      startAt: `${dateStr}T10:00:00+05:30`,
      endAt: `${dateStr}T11:00:00+05:30`,
      timezone: "Asia/Kolkata",
    },
    projectId,
    sourceType: "calendar_activity",
    sourceId: id,
    linkedScheduleItemId,
    status,
    isOverdue: false,
  };
}

describe("Calendar Date Indicator Pure Logic Tests", () => {
  it("returns false for a date with 0 activities", () => {
    const state = calculateDateActivityState([], [], "2026-07-24");
    expect(state).toEqual({
      scheduled: 0,
      active: 0,
      completed: 0,
      blocked: 0,
      cancelled: 0,
      total: 0,
    });
    expect(shouldShowCalendarDateIndicator(state)).toBe(false);
  });

  it("returns true for 1 scheduled activity", () => {
    const acts = [makeActivity("act-1", "2026-07-24", "scheduled")];
    const state = calculateDateActivityState(acts, [], "2026-07-24");
    expect(state.scheduled + state.active).toBe(1);
    expect(shouldShowCalendarDateIndicator(state)).toBe(true);
  });

  it("returns true for 3 and 10 activities (single indicator condition)", () => {
    const acts3 = [
      makeActivity("act-1", "2026-07-24", "scheduled"),
      makeActivity("act-2", "2026-07-24", "scheduled"),
      makeActivity("act-3", "2026-07-24", "scheduled"),
    ];
    const state3 = calculateDateActivityState(acts3, [], "2026-07-24");
    expect(state3.total).toBe(3);
    expect(shouldShowCalendarDateIndicator(state3)).toBe(true);

    const acts10 = Array.from({ length: 10 }, (_, i) =>
      makeActivity(`act-${i}`, "2026-07-24", "scheduled")
    );
    const state10 = calculateDateActivityState(acts10, [], "2026-07-24");
    expect(state10.total).toBe(10);
    expect(shouldShowCalendarDateIndicator(state10)).toBe(true);
  });

  it("returns true for activities across 4 different projects", () => {
    const acts = [
      makeActivity("act-1", "2026-07-24", "scheduled", "proj-1"),
      makeActivity("act-2", "2026-07-24", "scheduled", "proj-2"),
      makeActivity("act-3", "2026-07-24", "scheduled", "proj-3"),
      makeActivity("act-4", "2026-07-24", "scheduled", "proj-4"),
    ];
    const state = calculateDateActivityState(acts, [], "2026-07-24");
    expect(state.total).toBe(4);
    expect(shouldShowCalendarDateIndicator(state)).toBe(true);
  });

  it("returns false for completed-only activities", () => {
    const acts = [
      makeActivity("act-1", "2026-07-24", "completed"),
      makeActivity("act-2", "2026-07-24", "completed"),
    ];
    const state = calculateDateActivityState(acts, [], "2026-07-24");
    expect(state.completed).toBe(2);
    expect(state.scheduled).toBe(0);
    expect(state.active).toBe(0);
    expect(shouldShowCalendarDateIndicator(state)).toBe(false);
  });

  it("returns false for cancelled-only activities", () => {
    const acts = [
      makeActivity("act-1", "2026-07-24", "cancelled"),
      makeActivity("act-2", "2026-07-24", "cancelled"),
    ];
    const state = calculateDateActivityState(acts, [], "2026-07-24");
    expect(state.cancelled).toBe(2);
    expect(state.scheduled).toBe(0);
    expect(state.active).toBe(0);
    expect(shouldShowCalendarDateIndicator(state)).toBe(false);
  });

  it("returns true for mixed completed and scheduled activities", () => {
    const acts = [
      makeActivity("act-1", "2026-07-24", "completed"),
      makeActivity("act-2", "2026-07-24", "scheduled"),
    ];
    const state = calculateDateActivityState(acts, [], "2026-07-24");
    expect(state.completed).toBe(1);
    expect(state.scheduled + state.active).toBe(1);
    expect(shouldShowCalendarDateIndicator(state)).toBe(true);
  });

  it("handles blocked activities linked to blocked schedule items", () => {
    const blockedScheduleItem: PresentableScheduleItem = {
      id: "sch-blocked",
      workspaceId: "ws-kallisto",
      projectId: "proj-1",
      title: "Blocked milestone",
      itemType: "task",
      startDate: "2026-07-24",
      dueDate: "2026-07-24",
      status: "blocked",
      dependencyIds: [],
      isDelayed: false,
      isCriticalDelay: false,
    };
    const acts = [
      makeActivity("act-1", "2026-07-24", "scheduled", "proj-1", "client_meeting", "sch-blocked"),
    ];
    const state = calculateDateActivityState(acts, [blockedScheduleItem], "2026-07-24");
    expect(state.blocked).toBe(1);
    expect(state.scheduled).toBe(0);
    expect(state.active).toBe(0);
    expect(shouldShowCalendarDateIndicator(state)).toBe(false);
  });
});

describe("Calendar Today Tab UI Indicator Integration", () => {
  it("renders blue dot for scheduled activity and NOT for completed activity", () => {
    const acts = [
      makeActivity("act-sched", "2026-07-24", "scheduled"),
      makeActivity("act-comp", "2026-07-25", "completed"),
    ];

    render(<TodayTab activities={acts} selectedDate="2026-07-24" />);

    // Friday 24 July (scheduled) has the indicator
    const jul24Btn = screen.getByRole("button", { name: /Friday, 24 July 2026/i });
    expect(jul24Btn.querySelector("[aria-label='Activities scheduled']")).toBeInTheDocument();

    // Saturday 25 July (completed only) has NO indicator
    const jul25Btn = screen.getByRole("button", { name: /Saturday, 25 July 2026/i });
    expect(jul25Btn.querySelector("[aria-label='Activities scheduled']")).not.toBeInTheDocument();
  });

  it("preserves blue dot on selected date and today when activities exist", () => {
    const acts = [makeActivity("act-sched", "2026-07-24", "scheduled")];

    render(<TodayTab activities={acts} selectedDate="2026-07-24" />);

    const jul24Btn = screen.getByRole("button", { name: /Friday, 24 July 2026/i });
    expect(jul24Btn).toHaveAttribute("aria-pressed", "true");
    expect(jul24Btn.querySelector("[aria-label='Activities scheduled']")).toBeInTheDocument();
  });

  it("does NOT display dot for a date with no scheduled/active activities even if selected or today", () => {
    render(<TodayTab activities={[]} selectedDate="2026-07-24" />);

    const jul24Btn = screen.getByRole("button", { name: /Friday, 24 July 2026/i });
    expect(jul24Btn.querySelector("[aria-label='Activities scheduled']")).not.toBeInTheDocument();
  });

  it("updates Day Summary correctly when selected date changes", () => {
    const acts = [
      makeActivity("act-1", "2026-07-24", "scheduled"),
      makeActivity("act-2", "2026-07-24", "completed"),
      makeActivity("act-3", "2026-07-25", "completed"),
      makeActivity("act-4", "2026-07-25", "completed"),
    ];

    const { rerender } = render(<TodayTab activities={acts} selectedDate="2026-07-24" />);

    const daySummarySection = screen.getByRole("heading", { name: "Day summary" }).closest("section")!;
    expect(daySummarySection).toHaveTextContent("1Scheduled");
    expect(daySummarySection).toHaveTextContent("1Completed");

    // Change selected date to 2026-07-25
    rerender(<TodayTab activities={acts} selectedDate="2026-07-25" />);
    expect(daySummarySection).toHaveTextContent("0Scheduled");
    expect(daySummarySection).toHaveTextContent("2Completed");
  });
});
