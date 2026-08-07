import { ScheduleActivityItem } from "./schedule-types";
import { timeToMinutes } from "./schedule-positioning";

export interface ActivityOverlapLayout {
  columnIndex: number;
  columnCount: number;
}

interface TimedItem {
  id: string;
  start: number;
  end: number;
}

export function layoutOverlappingActivities(
  activities: Pick<ScheduleActivityItem, "id" | "startTime" | "endTime">[]
): Record<string, ActivityOverlapLayout> {
  const timedItems: TimedItem[] = activities
    .filter(
      (
        activity
      ): activity is Pick<ScheduleActivityItem, "id"> & {
        startTime: string;
        endTime: string;
      } => Boolean(activity.startTime && activity.endTime)
    )
    .map((activity) => ({
      id: activity.id,
      start: timeToMinutes(activity.startTime),
      end: timeToMinutes(activity.endTime),
    }))
    .filter((activity) => activity.end > activity.start)
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const result: Record<string, ActivityOverlapLayout> = {};
  let group: TimedItem[] = [];
  let groupEnd = -1;

  const commitGroup = () => {
    if (group.length === 0) {
      return;
    }

    const columnEndTimes: number[] = [];
    const assignments = new Map<string, number>();

    for (const item of group) {
      let columnIndex = columnEndTimes.findIndex((end) => end <= item.start);
      if (columnIndex === -1) {
        columnIndex = columnEndTimes.length;
        columnEndTimes.push(item.end);
      } else {
        columnEndTimes[columnIndex] = item.end;
      }
      assignments.set(item.id, columnIndex);
    }

    const columnCount = Math.max(1, columnEndTimes.length);
    for (const item of group) {
      result[item.id] = {
        columnIndex: assignments.get(item.id) ?? 0,
        columnCount,
      };
    }
  };

  for (const item of timedItems) {
    if (group.length > 0 && item.start >= groupEnd) {
      commitGroup();
      group = [];
      groupEnd = -1;
    }
    group.push(item);
    groupEnd = Math.max(groupEnd, item.end);
  }
  commitGroup();

  return result;
}
