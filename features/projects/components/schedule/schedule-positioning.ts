import { ScheduleActivityItem } from "./schedule-types";

export interface TimedActivityPosition {
  top: number;
  height: number;
  clippedAtStart: boolean;
  clippedAtEnd: boolean;
  edge: "before" | "after" | null;
}

export function timeToMinutes(value: string): number {
  if (!value || typeof value !== "string") return 0;

  const trimmed = value.trim().toUpperCase();

  // Check 12-hour AM/PM format (e.g. "9:00 AM", "12:30 PM", "9 AM", "12 PM")
  const amPmMatch = /^(\d{1,2})(?::(\d{1,2}))?\s*(AM|PM)$/.exec(trimmed);
  if (amPmMatch) {
    let hours = Number(amPmMatch[1]);
    const minutes = Number(amPmMatch[2] ?? 0);
    const period = amPmMatch[3];

    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return Math.max(0, Math.min(1439, hours * 60 + minutes));
  }

  // Check 24-hour HH:MM format (e.g. "09:00", "9:00", "14:30", "9.30")
  const match = /^(\d{1,2})[:.](\d{1,2})$/.exec(trimmed);
  if (match) {
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    return Math.max(0, Math.min(1439, hours * 60 + minutes));
  }

  // Check single or double digit hour (e.g. "12", "9", "14")
  const hourOnlyMatch = /^(\d{1,2})$/.exec(trimmed);
  if (hourOnlyMatch) {
    const hours = Number(hourOnlyMatch[1]);
    return Math.max(0, Math.min(1439, hours * 60));
  }

  return 0;
}

export function minutesToTime(value: number): string {
  const normalized = Math.max(0, Math.min(1_439, Math.round(value)));
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function formatTimeLabel(value: string): string {
  const totalMinutes = timeToMinutes(value);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}

export function differenceInMinutes(endTime: string, startTime: string): number {
  return timeToMinutes(endTime) - timeToMinutes(startTime);
}

export function getTimedActivityPosition(
  activity: Pick<ScheduleActivityItem, "startTime" | "endTime">,
  scheduleStartMinutes: number,
  scheduleEndMinutes: number,
  pixelsPerMinute: number,
  minimumHeight = 28
): TimedActivityPosition | null {
  if (!activity.startTime || !activity.endTime) {
    return null;
  }

  const startMinutes = timeToMinutes(activity.startTime);
  const endMinutes = timeToMinutes(activity.endTime);
  if (endMinutes <= startMinutes) {
    return null;
  }

  const gridHeight = (scheduleEndMinutes - scheduleStartMinutes) * pixelsPerMinute;

  if (endMinutes <= scheduleStartMinutes) {
    return {
      top: 0,
      height: Math.min(minimumHeight, gridHeight),
      clippedAtStart: true,
      clippedAtEnd: false,
      edge: "before",
    };
  }

  if (startMinutes >= scheduleEndMinutes) {
    return {
      top: Math.max(0, gridHeight - minimumHeight),
      height: Math.min(minimumHeight, gridHeight),
      clippedAtStart: false,
      clippedAtEnd: true,
      edge: "after",
    };
  }

  const visibleStart = Math.max(startMinutes, scheduleStartMinutes);
  const visibleEnd = Math.min(endMinutes, scheduleEndMinutes);
  const top = (visibleStart - scheduleStartMinutes) * pixelsPerMinute;
  const availableHeight = gridHeight - top;
  const naturalHeight = (visibleEnd - visibleStart) * pixelsPerMinute;

  return {
    top,
    height: Math.min(availableHeight, Math.max(minimumHeight, naturalHeight)),
    clippedAtStart: startMinutes < scheduleStartMinutes,
    clippedAtEnd: endMinutes > scheduleEndMinutes,
    edge: null,
  };
}

export function pointerOffsetToTimeRange(
  startOffset: number,
  endOffset: number,
  scheduleStartMinutes: number,
  scheduleEndMinutes: number,
  pixelsPerMinute: number,
  intervalMinutes = 30
): { startTime: string; endTime: string } {
  const lowerOffset = Math.min(startOffset, endOffset);
  const upperOffset = Math.max(startOffset, endOffset);
  const roundToInterval = (minutes: number) =>
    Math.round(minutes / intervalMinutes) * intervalMinutes;
  const rawStart = scheduleStartMinutes + lowerOffset / pixelsPerMinute;
  const rawEnd = scheduleStartMinutes + upperOffset / pixelsPerMinute;
  const startMinutes = Math.max(
    scheduleStartMinutes,
    Math.min(scheduleEndMinutes - intervalMinutes, roundToInterval(rawStart))
  );
  const endMinutes = Math.max(
    startMinutes + intervalMinutes,
    Math.min(scheduleEndMinutes, roundToInterval(rawEnd))
  );

  return {
    startTime: minutesToTime(startMinutes),
    endTime: minutesToTime(endMinutes),
  };
}
