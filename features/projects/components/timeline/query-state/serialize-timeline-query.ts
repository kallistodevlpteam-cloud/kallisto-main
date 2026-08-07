import { GanttQueryState, TimelineTabQueryState } from "./timeline-query-schema";

export function serializeGanttQuery(state: Partial<GanttQueryState>): Record<string, string> {
  const params: Record<string, string> = {};

  if (state.date) params.date = state.date;
  if (state.zoom && state.zoom !== "week") params.zoom = state.zoom;
  if (state.baseline) params.baseline = "true";
  if (state.activity) params.activity = state.activity;
  if (state.status && state.status.length > 0) params.status = state.status.join(",");
  if (state.phase) params.phase = state.phase;
  if (state.owner) params.owner = state.owner;
  if (state.q) params.q = state.q;
  if (state.criticalPath) params.criticalPath = "true";

  return params;
}

export function serializeTimelineTabQuery(state: Partial<TimelineTabQueryState>): Record<string, string> {
  const params: Record<string, string> = {};

  params.tab = "timeline";
  if (state.timelineFilter && state.timelineFilter !== "all") {
    params.timelineFilter = state.timelineFilter;
  }
  if (state.q) params.q = state.q;
  if (state.activity) params.activity = state.activity;

  return params;
}
