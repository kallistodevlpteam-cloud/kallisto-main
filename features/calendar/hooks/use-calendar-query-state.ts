"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { CalendarActivityType, CalendarVisibility } from "@/types/domain/calendar";

export type CalendarTabId = "today" | "calendar" | "gantt";
export type CalendarViewId = "week" | "month" | "agenda";
export type CalendarScopeId = "mine" | "team" | "project";
export type GanttZoomId = "week" | "month" | "quarter";
export type TodayCategoryId =
  | "all"
  | "meetings"
  | "site"
  | "tasks"
  | "deadlines"
  | "deliverables";

export interface CalendarQueryState {
  tab: CalendarTabId;
  view: CalendarViewId;
  date: string; // YYYY-MM-DD
  scope: CalendarScopeId;
  project: string | null;
  assignee: string | null;
  activityType: CalendarActivityType | null;
  status: string | null;
  visibility: CalendarVisibility | null;
  includeCompleted: boolean;
  category: TodayCategoryId;
  zoom: GanttZoomId;
  ganttRange: string | null;
  selected: string | null; // "activity:<id>" | "schedule:<id>"
}

const DEFAULT_DATE = "2026-07-24";

function parseCalendarQueryState(searchParams: URLSearchParams): CalendarQueryState {
  const rawTab = searchParams.get("tab");
  const tab: CalendarTabId =
    rawTab === "calendar" || rawTab === "gantt" ? rawTab : "today";

  const rawView = searchParams.get("view");
  const view: CalendarViewId =
    rawView === "month" || rawView === "agenda" ? rawView : "week";

  const date = searchParams.get("date") || DEFAULT_DATE;

  const rawScope = searchParams.get("scope");
  const scope: CalendarScopeId =
    rawScope === "team" || rawScope === "project" ? rawScope : "mine";

  const project = searchParams.get("project");
  const assignee = searchParams.get("assignee");
  const activityType = (searchParams.get("activityType") as CalendarActivityType) || null;
  const status = searchParams.get("status");
  const visibility = (searchParams.get("visibility") as CalendarVisibility) || null;
  const includeCompleted = searchParams.get("includeCompleted") === "true";

  const rawCategory = searchParams.get("category");
  const category: TodayCategoryId =
    rawCategory === "meetings" ||
    rawCategory === "site" ||
    rawCategory === "tasks" ||
    rawCategory === "deadlines" ||
    rawCategory === "deliverables"
      ? rawCategory
      : "all";

  const rawZoom = searchParams.get("zoom");
  const zoom: GanttZoomId =
    rawZoom === "week" || rawZoom === "quarter" ? rawZoom : "month";

  const ganttRange = searchParams.get("ganttRange");
  const selected = searchParams.get("selected");

  return {
    tab,
    view,
    date,
    scope,
    project,
    assignee,
    activityType,
    status,
    visibility,
    includeCompleted,
    category,
    zoom,
    ganttRange,
    selected,
  };
}

export function useCalendarQueryState() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentState, setCurrentState] = useState<CalendarQueryState>(() =>
    parseCalendarQueryState(new URLSearchParams(searchParams.toString()))
  );

  useEffect(() => {
    const handleHistoryNavigation = () => {
      setCurrentState(
        parseCalendarQueryState(new URLSearchParams(window.location.search))
      );
    };
    window.addEventListener("popstate", handleHistoryNavigation);
    return () => window.removeEventListener("popstate", handleHistoryNavigation);
  }, []);

  const setQueryState = useCallback(
    (updates: Partial<CalendarQueryState>) => {
      const params = new URLSearchParams(window.location.search);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          params.delete(key);
        } else if (typeof value === "boolean") {
          if (value) {
            params.set(key, "true");
          } else {
            params.delete(key);
          }
        } else {
          params.set(key, String(value));
        }
      });

      // Default rules clean-up
      if (params.get("tab") === "calendar" && params.get("view") === "week") {
        params.delete("view");
      }
      if (params.get("tab") === "gantt" && params.get("zoom") === "month") {
        params.delete("zoom");
      }

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;

      window.history.replaceState(window.history.state, "", targetUrl);
      setCurrentState((state) => ({ ...state, ...updates }));
    },
    [pathname]
  );

  return {
    state: currentState,
    setQueryState,
    isPending: false,
  };
}
