import {
  ScheduleActivityItem,
  ScheduleFilterState,
} from "./schedule-types";

export function filterScheduleActivities(
  activities: ScheduleActivityItem[],
  filters: ScheduleFilterState
): ScheduleActivityItem[] {
  const query = filters.search.trim().toLocaleLowerCase();

  return activities.filter((activity) => {
    if (filters.phases.length > 0 && !filters.phases.includes(activity.phase)) {
      return false;
    }
    if (
      filters.workstreams.length > 0 &&
      !filters.workstreams.includes(activity.workstream)
    ) {
      return false;
    }
    if (filters.team.length > 0 && !filters.team.includes(activity.owner)) {
      return false;
    }
    if (
      filters.statuses.length > 0 &&
      !filters.statuses.includes(activity.status)
    ) {
      return false;
    }
    if (
      query &&
      ![
        activity.title,
        activity.owner,
        activity.workstream,
        activity.phase,
        activity.status,
      ].some((value) => value.toLocaleLowerCase().includes(query))
    ) {
      return false;
    }
    return true;
  });
}

export function countActiveFilterGroups(
  filters: ScheduleFilterState,
  available: Omit<ScheduleFilterState, "search">
): number {
  let count = filters.search.trim() ? 1 : 0;
  if (filters.phases.length !== available.phases.length) count += 1;
  if (filters.workstreams.length !== available.workstreams.length) count += 1;
  if (filters.team.length !== available.team.length) count += 1;
  if (filters.statuses.length !== available.statuses.length) count += 1;
  return count;
}
