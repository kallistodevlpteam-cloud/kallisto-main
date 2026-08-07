import { GanttQueryState, GanttZoom, TimelineCategoryFilter, TimelineTabQueryState } from "./timeline-query-schema";
import { ProjectActivityStatus } from "../../../domain/project-schedule.types";

const VALID_ZOOMS: GanttZoom[] = ["week", "month", "quarter"];
const VALID_FILTERS: TimelineCategoryFilter[] = ["all", "activities", "milestones", "approvals"];
const VALID_STATUSES: ProjectActivityStatus[] = [
  "not_started",
  "in_progress",
  "completed",
  "blocked",
  "cancelled",
];

export function parseGanttQuery(
  rawParams: Record<string, string | string[] | undefined> | URLSearchParams,
  defaultDate = new Date().toISOString().slice(0, 10)
): GanttQueryState {
  const getParam = (key: string): string | null => {
    if (rawParams instanceof URLSearchParams) {
      return rawParams.get(key);
    }
    const val = rawParams[key];
    if (Array.isArray(val)) return val[0] || null;
    return val || null;
  };

  const rawDate = getParam("date");
  const isValidDate = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate);
  const date = isValidDate ? rawDate : defaultDate;

  const rawZoom = getParam("zoom") as GanttZoom;
  const zoom: GanttZoom = VALID_ZOOMS.includes(rawZoom) ? rawZoom : "week";

  const baseline = getParam("baseline") === "true";

  const activity = getParam("activity") || null;

  const rawStatus = getParam("status");
  const status: ProjectActivityStatus[] = rawStatus
    ? (rawStatus.split(",").filter((s) => VALID_STATUSES.includes(s as ProjectActivityStatus)) as ProjectActivityStatus[])
    : [];

  const phase = getParam("phase") || null;
  const owner = getParam("owner") || null;
  const q = getParam("q") || "";
  const criticalPath = getParam("criticalPath") === "true";

  return {
    date,
    zoom,
    baseline,
    activity,
    status,
    phase,
    owner,
    q,
    criticalPath,
  };
}

export function parseTimelineTabQuery(
  rawParams: Record<string, string | string[] | undefined> | URLSearchParams
): TimelineTabQueryState {
  const getParam = (key: string): string | null => {
    if (rawParams instanceof URLSearchParams) {
      return rawParams.get(key);
    }
    const val = rawParams[key];
    if (Array.isArray(val)) return val[0] || null;
    return val || null;
  };

  const rawFilter = getParam("timelineFilter") as TimelineCategoryFilter;
  const timelineFilter: TimelineCategoryFilter = VALID_FILTERS.includes(rawFilter) ? rawFilter : "all";

  const q = getParam("q") || "";
  const activity = getParam("activity") || null;

  return {
    timelineFilter,
    q,
    activity,
  };
}
