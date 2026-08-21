import { ScheduleViewMode } from "./schedule-types";

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export interface MiniCalendarDay {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
}

export function parseDateOnly(value: string): Date {
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) {
    throw new Error(`Invalid date-only value: ${value}`);
  }

  const [, year, month, day] = match;
  const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  if (
    parsed.getUTCFullYear() !== Number(year) ||
    parsed.getUTCMonth() !== Number(month) - 1 ||
    parsed.getUTCDate() !== Number(day)
  ) {
    throw new Error(`Invalid calendar date: ${value}`);
  }

  return parsed;
}

export function formatDateOnly(value: Date): string {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(value: string, amount: number): string {
  const date = parseDateOnly(value);
  date.setUTCDate(date.getUTCDate() + amount);
  return formatDateOnly(date);
}

export function addMonths(value: string, amount: number): string {
  const date = parseDateOnly(value);
  const originalDay = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + amount);
  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)
  ).getUTCDate();
  date.setUTCDate(Math.min(originalDay, lastDay));
  return formatDateOnly(date);
}

export function startOfMondayWeek(value: string): string {
  const date = parseDateOnly(value);
  const day = date.getUTCDay();
  const offsetFromMonday = day === 0 ? 6 : day - 1;
  return addDays(value, -offsetFromMonday);
}

export function endOfMondayWeek(value: string): string {
  return addDays(startOfMondayWeek(value), 6);
}

export function getVisibleWeek(value: string): string[] {
  const weekStart = startOfMondayWeek(value);
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

export function differenceInCalendarDays(later: string, earlier: string): number {
  const milliseconds = parseDateOnly(later).getTime() - parseDateOnly(earlier).getTime();
  return Math.round(milliseconds / 86_400_000);
}

export function isDateWithinRange(
  value: string,
  rangeStart: string,
  rangeEnd: string
): boolean {
  return value >= rangeStart && value <= rangeEnd;
}

export function formatWeekRange(weekStart: string, weekEnd: string): string {
  const start = parseDateOnly(weekStart);
  const end = parseDateOnly(weekEnd);
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth();
  const monthFormatter = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    timeZone: "UTC",
  });

  if (sameMonth) {
    return `${start.getUTCDate()}\u2013${end.getUTCDate()} ${monthFormatter.format(
      start
    )} ${start.getUTCFullYear()}`;
  }

  const startLabel = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" as const }),
    timeZone: "UTC",
  }).format(start);
  const endLabel = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(end);
  return `${startLabel}\u2013${endLabel}`;
}

export function formatToolbarRange(
  anchorDate: string,
  selectedDate: string,
  viewMode: ScheduleViewMode
): string {
  if (viewMode === "Day") {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(parseDateOnly(selectedDate));
  }

  if (viewMode === "Month") {
    return new Intl.DateTimeFormat("en-GB", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(parseDateOnly(anchorDate));
  }

  const weekStart = startOfMondayWeek(anchorDate);
  return formatWeekRange(weekStart, addDays(weekStart, 6));
}

export function shiftSchedulePeriod(
  anchorDate: string,
  selectedDate: string,
  viewMode: ScheduleViewMode,
  direction: -1 | 1
): { anchorDate: string; selectedDate: string } {
  if (viewMode === "Day") {
    const next = addDays(selectedDate, direction);
    return { anchorDate: next, selectedDate: next };
  }

  if (viewMode === "Month") {
    const next = addMonths(anchorDate, direction);
    return { anchorDate: next, selectedDate: next };
  }

  const next = addDays(anchorDate, direction * 7);
  return { anchorDate: next, selectedDate: next };
}

export function getWeekdayLong(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    timeZone: "UTC",
  }).format(parseDateOnly(value));
}

export function getWeekdayShort(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    timeZone: "UTC",
  }).format(parseDateOnly(value));
}

export function getMonthDayLabel(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(parseDateOnly(value));
}

export function buildMiniCalendar(anchorDate: string): MiniCalendarDay[] {
  const anchor = parseDateOnly(anchorDate);
  const firstOfMonth = formatDateOnly(
    new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1))
  );
  const gridStart = startOfMondayWeek(firstOfMonth);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    return {
      date,
      dayNumber: parseDateOnly(date).getUTCDate(),
      isCurrentMonth:
        parseDateOnly(date).getUTCMonth() === anchor.getUTCMonth(),
    };
  });
}

export function getMonthLabel(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parseDateOnly(value));
}

export function getDateOnlyInTimeZone(
  now: Date = new Date(),
  timeZone = "Asia/Kolkata"
): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function getMinutesInTimeZone(
  now: Date = new Date(),
  timeZone = "Asia/Kolkata"
): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((item) => item.type === type)?.value ?? 0);
  return part("hour") * 60 + part("minute");
}

export function getWeekOfMonthLabel(dateStr: string, anchorDateStr: string): string {
  const anchor = parseDateOnly(anchorDateStr);
  const firstOfMonth = formatDateOnly(
    new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1))
  );
  const gridStart = startOfMondayWeek(firstOfMonth);
  const currentWeekStart = startOfMondayWeek(dateStr);
  const diffDays = differenceInCalendarDays(currentWeekStart, gridStart);
  const weekNumber = Math.max(1, Math.min(5, Math.floor(diffDays / 7) + 1));
  return `Week ${weekNumber}`;
}
