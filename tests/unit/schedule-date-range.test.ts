import { describe, expect, it } from "vitest";
import {
  buildMiniCalendar,
  formatToolbarRange,
  getDateOnlyInTimeZone,
  getVisibleWeek,
  getWeekdayLong,
  shiftSchedulePeriod,
  startOfMondayWeek,
} from "@/features/projects/components/schedule/schedule-date-range";

describe("schedule date range", () => {
  it("maps 24 July 2026 to the correct Monday-start week", () => {
    expect(startOfMondayWeek("2026-07-24")).toBe("2026-07-20");
    expect(getVisibleWeek("2026-07-24")).toEqual([
      "2026-07-20",
      "2026-07-21",
      "2026-07-22",
      "2026-07-23",
      "2026-07-24",
      "2026-07-25",
      "2026-07-26",
    ]);
    expect(getVisibleWeek("2026-07-24").map(getWeekdayLong)).toEqual([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ]);
  });

  it("formats the Week toolbar from the same anchor state", () => {
    expect(formatToolbarRange("2026-07-24", "2026-07-24", "Week")).toBe(
      "20–26 July 2026"
    );
  });

  it("moves to previous and next weeks without changing weekday alignment", () => {
    expect(
      shiftSchedulePeriod("2026-07-24", "2026-07-24", "Week", -1)
    ).toEqual({
      anchorDate: "2026-07-17",
      selectedDate: "2026-07-17",
    });
    expect(
      getVisibleWeek(
        shiftSchedulePeriod("2026-07-24", "2026-07-24", "Week", 1)
          .anchorDate
      )[0]
    ).toBe("2026-07-27");
  });

  it("builds a Monday-first six-week mini calendar", () => {
    const days = buildMiniCalendar("2026-07-24");
    expect(days).toHaveLength(42);
    expect(days[0].date).toBe("2026-06-29");
    expect(days[41].date).toBe("2026-08-09");
  });

  it("calculates today in the project timezone", () => {
    expect(
      getDateOnlyInTimeZone(
        new Date("2026-07-26T20:00:00.000Z"),
        "Asia/Kolkata"
      )
    ).toBe("2026-07-27");
  });
});
