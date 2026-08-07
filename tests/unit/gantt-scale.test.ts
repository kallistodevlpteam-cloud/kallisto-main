import { describe, it, expect } from "vitest";
import {
  parseDateOnlyUtc,
  formatDateOnlyUtc,
  formatTimelineRangeLabel,
  getIsoWeekNumberUtc,
  formatMonthSegmentLabel,
  calculateTimelineRange,
  buildDynamicGridScale,
  isDateInRange,
} from "../../features/projects/components/timeline/gantt/gantt-scale";
import { ProjectScheduleActivity } from "../../features/projects/domain/project-schedule.types";

function createDummyActivity(overrides: Partial<ProjectScheduleActivity> = {}): ProjectScheduleActivity {
  return {
    id: "act-1",
    projectId: "proj-1",
    phaseId: "phase-1",
    parentId: null,
    wbsCode: "1.1",
    title: "Test Activity",
    type: "activity",
    status: "in_progress",
    plannedStartDate: "2026-06-10",
    plannedEndDate: "2026-06-20",
    baselineStartDate: null,
    baselineEndDate: null,
    actualStartDate: null,
    actualEndDate: null,
    completedAt: null,
    progressPercent: 0,
    weight: 1,
    ownerId: null,
    dependencies: [],
    visibility: "project",
    approvalStatus: "not_required",
    ...overrides,
  };
}

describe("gantt-scale date utilities", () => {
  it("parses date-only strings accurately in UTC", () => {
    const ms = parseDateOnlyUtc("2026-06-10");
    expect(ms).not.toBeNull();
    expect(formatDateOnlyUtc(ms!)).toBe("2026-06-10");
    expect(parseDateOnlyUtc("invalid-date")).toBeNull();
    expect(parseDateOnlyUtc("")).toBeNull();
  });

  describe("getIsoWeekNumberUtc", () => {
    it("handles regular year week numbers accurately in UTC", () => {
      expect(getIsoWeekNumberUtc("2026-01-01")).toBe(1);  // 2026-01-01 is Thursday in ISO W01 of 2026
      expect(getIsoWeekNumberUtc("2026-01-05")).toBe(2);  // 2026-01-05 is Monday of W02
      expect(getIsoWeekNumberUtc("2026-07-06")).toBe(28); // 2026-07-06 is Monday of W28
    });

    it("handles December to January transitions accurately", () => {
      expect(getIsoWeekNumberUtc("2026-12-28")).toBe(53); // 2026-12-28 is Monday of W53
      expect(getIsoWeekNumberUtc("2027-01-04")).toBe(1);  // 2027-01-04 is Monday of W01
    });
  });

  describe("formatMonthSegmentLabel", () => {
    it("returns full label when segment width >= 120px", () => {
      expect(formatMonthSegmentLabel("July, 2026", 10, 16)).toBe("July, 2026"); // 160px
    });

    it("returns short month + year when segment width >= 72px and < 120px", () => {
      expect(formatMonthSegmentLabel("July, 2026", 5, 16)).toBe("Jul 2026"); // 80px
    });

    it("returns short month only when segment width >= 34px and < 72px", () => {
      expect(formatMonthSegmentLabel("July, 2026", 3, 16)).toBe("Jul"); // 48px
    });

    it("returns empty string when segment width < 34px", () => {
      expect(formatMonthSegmentLabel("July, 2026", 1, 16)).toBe(""); // 16px
    });
  });

  describe("formatTimelineRangeLabel", () => {
    it("formats same month and same year", () => {
      expect(formatTimelineRangeLabel("2026-06-10", "2026-06-25")).toBe("10 Jun – 25 Jun 2026");
    });

    it("formats different months in the same year", () => {
      expect(formatTimelineRangeLabel("2026-06-24", "2026-09-13")).toBe("24 Jun – 13 Sep 2026");
    });

    it("formats different years", () => {
      expect(formatTimelineRangeLabel("2026-12-24", "2027-01-15")).toBe("24 Dec 2026 – 15 Jan 2027");
    });

    it("handles invalid range values safely", () => {
      expect(formatTimelineRangeLabel(null, "2026-06-10")).toBe("");
      expect(formatTimelineRangeLabel("invalid", "2026-06-10")).toBe("");
    });
  });

  describe("buildDynamicGridScale zoom & cadence behavior", () => {
    it("builds Month view header cadence (header numbers on 1st of month, Mondays, and Today)", () => {
      const range = {
        rangeStart: new Date("2026-07-01T00:00:00Z"),
        rangeEnd: new Date("2026-07-14T00:00:00Z"),
        rangeStartMs: parseDateOnlyUtc("2026-07-01")!,
        rangeEndMs: parseDateOnlyUtc("2026-07-14")!,
        totalDays: 14,
      };
      const scale = buildDynamicGridScale(range, "month", "2026-07-08"); // 2026-07-08 is Wednesday (Today)

      // 2026-07-01 (Wednesday, 1st of month) -> showDateHeader = true
      const day1 = scale.days.find((d) => d.dateStr === "2026-07-01");
      expect(day1?.showDateHeader).toBe(true);

      // 2026-07-06 (Monday) -> showDateHeader = true, isMonday = true
      const day6 = scale.days.find((d) => d.dateStr === "2026-07-06");
      expect(day6?.showDateHeader).toBe(true);
      expect(day6?.isMonday).toBe(true);

      // 2026-07-08 (Wednesday, Today) -> showDateHeader = true
      const day8 = scale.days.find((d) => d.dateStr === "2026-07-08");
      expect(day8?.showDateHeader).toBe(true);

      // 2026-07-02 (Thursday, regular day) -> showDateHeader = false
      const day2 = scale.days.find((d) => d.dateStr === "2026-07-02");
      expect(day2?.showDateHeader).toBe(false);
    });

    it("builds Quarter view week markers on Mondays and hides daily date numbers", () => {
      const range = {
        rangeStart: new Date("2026-07-01T00:00:00Z"),
        rangeEnd: new Date("2026-07-14T00:00:00Z"),
        rangeStartMs: parseDateOnlyUtc("2026-07-01")!,
        rangeEndMs: parseDateOnlyUtc("2026-07-14")!,
        totalDays: 14,
      };
      const scale = buildDynamicGridScale(range, "quarter", "2026-07-08");

      expect(scale.days.every((d) => d.showDateHeader === false)).toBe(true);

      const mondayCell = scale.days.find((d) => d.dateStr === "2026-07-06"); // W28
      expect(mondayCell?.weekMarkerLabel).toBe("W28");

      const tuesdayCell = scale.days.find((d) => d.dateStr === "2026-07-07");
      expect(tuesdayCell?.weekMarkerLabel).toBeUndefined();
    });

    it("expands Quarter canvas to fill viewport width when schedule is short", () => {
      const range = {
        rangeStart: new Date("2026-07-01T00:00:00Z"),
        rangeEnd: new Date("2026-07-10T00:00:00Z"),
        rangeStartMs: parseDateOnlyUtc("2026-07-01")!,
        rangeEndMs: parseDateOnlyUtc("2026-07-10")!,
        totalDays: 10,
      };
      const viewportWidth = 1000;
      const scale = buildDynamicGridScale(range, "quarter", "2026-07-01", viewportWidth);

      expect(scale.renderedDayCount).toBe(10);
      expect(scale.totalCanvasWidth).toBe(1000);
      expect(scale.unitDayWidth).toBe(100); // 1000 / 10
    });

    it("remains horizontally scrollable in Quarter mode when schedule is long", () => {
      const range = {
        rangeStart: new Date("2026-01-01T00:00:00Z"),
        rangeEnd: new Date("2026-12-31T00:00:00Z"),
        rangeStartMs: parseDateOnlyUtc("2026-01-01")!,
        rangeEndMs: parseDateOnlyUtc("2026-12-31")!,
        totalDays: 365,
      };
      const viewportWidth = 1000;
      const scale = buildDynamicGridScale(range, "quarter", "2026-07-01", viewportWidth);

      const baseQuarterDayWidth = 160 / 30.75;
      expect(scale.totalCanvasWidth).toBeCloseTo(365 * baseQuarterDayWidth);
      expect(scale.totalCanvasWidth).toBeGreaterThan(viewportWidth);
    });
  });

  it("calculates normal schedule with planned dates", () => {
    const act = createDummyActivity({
      plannedStartDate: "2026-06-10",
      plannedEndDate: "2026-06-20",
    });
    const range = calculateTimelineRange([act], "2026-07-26");

    expect(formatDateOnlyUtc(range.rangeStartMs)).toBe("2026-06-03");
    expect(formatDateOnlyUtc(range.rangeEndMs)).toBe("2026-07-04");
  });
});
