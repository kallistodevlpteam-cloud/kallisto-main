import { ProjectScheduleActivity } from "../../../domain/project-schedule.types";
import { GanttZoom } from "../query-state/timeline-query-schema";

export interface DayCol {
  id: string;
  dateStr: string;
  weekdayInitial: string;
  dateNum: string;
  isToday: boolean;
  isWeekend: boolean;
  isMonthBoundary: boolean;
  isMonday: boolean;
  showDateHeader: boolean;
  weekMarkerLabel?: string;
}

export interface MonthSegment {
  label: string;
  displayLabel: string;
  daysCount: number;
  widthPx: number;
}

export interface TimelineRange {
  rangeStart: Date;
  rangeEnd: Date;
  rangeStartMs: number;
  rangeEndMs: number;
  totalDays: number;
}

const WEEKDAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"];

/**
 * Parses a date string (YYYY-MM-DD or ISO string) into a UTC timestamp at 00:00:00Z.
 * Returns null if string is missing or invalid.
 */
export function parseDateOnlyUtc(value?: string | null): number | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month, day));
    if (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month &&
      date.getUTCDate() === day
    ) {
      return date.getTime();
    }
  }

  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return null;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/**
 * Formats a UTC millisecond timestamp as YYYY-MM-DD.
 */
export function formatDateOnlyUtc(ms: number): string {
  const d = new Date(ms);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Computes ISO 8601 week number in pure UTC.
 * ISO week 1 is the week containing the first Thursday of the year.
 */
export function getIsoWeekNumberUtc(dateStr: string): number {
  const ms = parseDateOnlyUtc(dateStr);
  if (ms === null) return 1;

  const target = new Date(ms);
  const dayNum = target.getUTCDay() || 7; // Sunday=7, Monday=1
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return weekNo;
}

/**
 * Formats dynamic timeline range date strings in UTC format (e.g. "24 Jun – 13 Sep 2026").
 */
export function formatTimelineRangeLabel(
  rangeStartStr?: string | null,
  rangeEndStr?: string | null
): string {
  const startMs = parseDateOnlyUtc(rangeStartStr);
  const endMs = parseDateOnlyUtc(rangeEndStr);
  if (startMs === null || endMs === null) return "";

  const startDate = new Date(startMs);
  const endDate = new Date(endMs);

  const startDay = startDate.getUTCDate();
  const startMonth = startDate.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  const startYear = startDate.getUTCFullYear();

  const endDay = endDate.getUTCDate();
  const endMonth = endDate.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  const endYear = endDate.getUTCFullYear();

  if (startYear === endYear) {
    return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${startYear}`;
  }
  return `${startDay} ${startMonth} ${startYear} – ${endDay} ${endMonth} ${endYear}`;
}

/**
 * Formats month segment title text based on deterministic segment width thresholds:
 * - widthPx >= 120px: "July, 2026"
 * - widthPx >= 72px: "Jul 2026"
 * - widthPx >= 34px: "Jul"
 * - widthPx < 34px: "" (hidden)
 */
export function formatMonthSegmentLabel(
  fullLabel: string,
  daysCount: number,
  unitDayWidth: number
): string {
  const widthPx = daysCount * unitDayWidth;
  if (widthPx >= 120) {
    return fullLabel;
  }
  
  // Extract month and year from "July, 2026"
  const parts = fullLabel.split(", ");
  const monthFull = parts[0] || "";
  const yearStr = parts[1] || "";
  const monthShort = monthFull.slice(0, 3);

  if (widthPx >= 72) {
    return `${monthShort} ${yearStr}`;
  }
  if (widthPx >= 34) {
    return monthShort;
  }
  return "";
}

/**
 * Adds a specific number of UTC days to a millisecond timestamp.
 */
export function addUtcDays(ms: number, days: number): number {
  const d = new Date(ms);
  d.setUTCDate(d.getUTCDate() + days);
  return d.getTime();
}

/**
 * Checks if a given date string falls within [rangeStartMs, rangeEndMs] inclusive.
 */
export function isDateInRange(
  dateStr?: string | null,
  rangeStartMs?: number,
  rangeEndMs?: number
): boolean {
  if (!dateStr || rangeStartMs === undefined || rangeEndMs === undefined) return false;
  const ms = parseDateOnlyUtc(dateStr);
  if (ms === null) return false;
  return ms >= rangeStartMs && ms <= rangeEndMs;
}

/**
 * Calculates day offset relative to rangeStartMs.
 */
export function getDaysOffset(dateStr?: string | null, rangeStartMs?: number): number {
  if (!dateStr || rangeStartMs === undefined) return 0;
  const targetMs = parseDateOnlyUtc(dateStr);
  if (targetMs === null) return 0;
  const diffMs = targetMs - rangeStartMs;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculates inclusive duration in days between two date strings.
 * Returns 1 if missing or invalid.
 */
export function getInclusiveDurationDays(
  startDateStr?: string | null,
  endDateStr?: string | null
): number {
  const startMs = parseDateOnlyUtc(startDateStr);
  const endMs = parseDateOnlyUtc(endDateStr);
  if (startMs === null || endMs === null || endMs < startMs) return 1;
  const diffDays = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
}

/**
 * Calculates dynamic timeline range for full activity list.
 */
export function calculateTimelineRange(
  activities: ProjectScheduleActivity[],
  todayStr: string
): TimelineRange {
  const validMsList: number[] = [];

  for (const act of activities) {
    const pStartMs = parseDateOnlyUtc(act.plannedStartDate);
    const pEndMs = parseDateOnlyUtc(act.plannedEndDate);

    if (pStartMs !== null && pEndMs !== null) {
      if (pStartMs <= pEndMs) {
        validMsList.push(pStartMs, pEndMs);
      }
    } else if (pStartMs !== null) {
      validMsList.push(pStartMs);
    } else if (pEndMs !== null) {
      validMsList.push(pEndMs);
    }

    const bStartMs = parseDateOnlyUtc(act.baselineStartDate);
    const bEndMs = parseDateOnlyUtc(act.baselineEndDate);

    if (bStartMs !== null && bEndMs !== null) {
      if (bStartMs <= bEndMs) {
        validMsList.push(bStartMs, bEndMs);
      }
    } else if (bStartMs !== null) {
      validMsList.push(bStartMs);
    } else if (bEndMs !== null) {
      validMsList.push(bEndMs);
    }
  }

  let rangeStartMs: number;
  let rangeEndMs: number;

  if (validMsList.length > 0) {
    const minMs = Math.min(...validMsList);
    const maxMs = Math.max(...validMsList);
    rangeStartMs = addUtcDays(minMs, -7);
    rangeEndMs = addUtcDays(maxMs, 14);
  } else {
    const parsedToday = parseDateOnlyUtc(todayStr) ?? parseDateOnlyUtc(new Date().toISOString().slice(0, 10))!;
    rangeStartMs = addUtcDays(parsedToday, -14);
    rangeEndMs = addUtcDays(parsedToday, 45);
  }

  const rangeStart = new Date(rangeStartMs);
  const rangeEnd = new Date(rangeEndMs);
  const totalDays = Math.round((rangeEndMs - rangeStartMs) / (1000 * 60 * 60 * 24)) + 1;

  return {
    rangeStart,
    rangeEnd,
    rangeStartMs,
    rangeEndMs,
    totalDays,
  };
}

/**
 * Builds dynamic day columns, month segments, and unitDayWidth scale across calculated timeline range.
 */
export function buildDynamicGridScale(
  range: TimelineRange,
  zoom: GanttZoom = "month",
  todayStr: string = new Date().toISOString().slice(0, 10),
  viewportWidth: number = 0
) {
  const days: DayCol[] = [];
  let curMs = range.rangeStartMs;

  while (curMs <= range.rangeEndMs) {
    const dateStr = formatDateOnlyUtc(curMs);
    const cur = new Date(curMs);
    const dayNum = cur.getUTCDate();
    const dayOfWeek = cur.getUTCDay();
    const isToday = dateStr === todayStr;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isMonthBoundary = dayNum === 1;
    const isMonday = dayOfWeek === 1;

    let showDateHeader = true;
    let weekMarkerLabel: string | undefined = undefined;

    if (zoom === "week") {
      showDateHeader = true;
    } else if (zoom === "month") {
      showDateHeader = isMonthBoundary || isMonday || isToday;
    } else if (zoom === "quarter") {
      showDateHeader = false;
      if (isMonday) {
        const isoWeek = getIsoWeekNumberUtc(dateStr);
        weekMarkerLabel = `W${String(isoWeek).padStart(2, "0")}`;
      }
    }

    days.push({
      id: dateStr,
      dateStr,
      weekdayInitial: WEEKDAY_INITIALS[dayOfWeek],
      dateNum: String(dayNum).padStart(2, "0"),
      isToday,
      isWeekend,
      isMonthBoundary,
      isMonday,
      showDateHeader,
      weekMarkerLabel,
    });

    curMs = addUtcDays(curMs, 1);
  }

  const renderedDayCount = days.length;
  let unitDayWidth = 54;
  let totalCanvasWidth = renderedDayCount * unitDayWidth;

  if (zoom === "month") {
    unitDayWidth = 112 / 7;
    totalCanvasWidth = renderedDayCount * unitDayWidth;
  } else if (zoom === "quarter") {
    const baseQuarterDayWidth = 160 / 30.75;
    const baseCanvasWidth = renderedDayCount * baseQuarterDayWidth;
    const effectiveCanvasWidth = Math.max(baseCanvasWidth, viewportWidth);
    unitDayWidth = effectiveCanvasWidth / renderedDayCount;
    totalCanvasWidth = effectiveCanvasWidth;
  }

  const monthSegments: MonthSegment[] = [];
  let currentMonthLabel = "";
  let currentMonthDaysCount = 0;

  for (const day of days) {
    const d = new Date(`${day.dateStr}T00:00:00Z`);
    const monthName = d.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
    const year = d.getUTCFullYear();
    const label = `${monthName}, ${year}`;

    if (label !== currentMonthLabel) {
      if (currentMonthLabel !== "") {
        const widthPx = currentMonthDaysCount * unitDayWidth;
        const displayLabel = formatMonthSegmentLabel(currentMonthLabel, currentMonthDaysCount, unitDayWidth);
        monthSegments.push({
          label: currentMonthLabel,
          displayLabel,
          daysCount: currentMonthDaysCount,
          widthPx,
        });
      }
      currentMonthLabel = label;
      currentMonthDaysCount = 1;
    } else {
      currentMonthDaysCount++;
    }
  }

  if (currentMonthLabel !== "") {
    const widthPx = currentMonthDaysCount * unitDayWidth;
    const displayLabel = formatMonthSegmentLabel(currentMonthLabel, currentMonthDaysCount, unitDayWidth);
    monthSegments.push({
      label: currentMonthLabel,
      displayLabel,
      daysCount: currentMonthDaysCount,
      widthPx,
    });
  }

  return { days, monthSegments, renderedDayCount, unitDayWidth, totalCanvasWidth };
}
