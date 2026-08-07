import { GanttQueryState, TimelineTabQueryState } from "./timeline-query-schema";
import { ProjectScheduleActivity, ProjectSchedulePhase } from "../../../domain/project-schedule.types";

export function reconcileGanttQueryWithSchedule(
  parsed: GanttQueryState,
  activities: ProjectScheduleActivity[],
  phases: ProjectSchedulePhase[]
): GanttQueryState {
  const result = { ...parsed };

  // 1. Verify Activity exists
  if (result.activity) {
    const exists = activities.some((a) => a.id === result.activity);
    if (!exists) {
      result.activity = null;
    }
  }

  // 2. Verify Phase exists
  if (result.phase) {
    const exists = phases.some((p) => p.id === result.phase);
    if (!exists) {
      result.phase = null;
    }
  }

  // 3. Verify Owner exists
  if (result.owner) {
    const exists = activities.some((a) => a.ownerId === result.owner || a.assigneeName === result.owner);
    if (!exists) {
      result.owner = null;
    }
  }

  return result;
}

export function reconcileTimelineTabQueryWithSchedule(
  parsed: TimelineTabQueryState,
  activities: ProjectScheduleActivity[]
): TimelineTabQueryState {
  const result = { ...parsed };

  if (result.activity) {
    const exists = activities.some((a) => a.id === result.activity);
    if (!exists) {
      result.activity = null;
    }
  }

  return result;
}
