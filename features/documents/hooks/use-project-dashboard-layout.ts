"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  getProjectDashboardGeometry,
  PROJECT_UPDATES_MIN_WIDTH,
  type ProjectUpdatesLayoutMode,
} from "@/lib/layout/project-dashboard-responsive-contract";

interface ProjectDashboardLayoutState {
  dashboardRef: RefObject<HTMLDivElement | null>;
  mode: ProjectUpdatesLayoutMode;
  mainWidth: number;
  updatesWidth: number;
}

/**
 * Capacity affects dialog semantics and the heading trigger, not only styling.
 * ResizeObserver therefore owns this behavioral state; CSS consumes the
 * resulting data attribute and rail-width variable without repeating limits.
 */
export function useProjectDashboardLayout(active: boolean): ProjectDashboardLayoutState {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!active) return;

    const dashboard = dashboardRef.current;
    if (!dashboard) return;

    const syncViewportWidth = () => setViewportWidth(window.innerWidth);
    const syncContainerWidth = () => {
      setContainerWidth(dashboard.getBoundingClientRect().width);
    };

    syncViewportWidth();
    syncContainerWidth();

    window.addEventListener("resize", syncViewportWidth);

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", syncContainerWidth);
      return () => {
        window.removeEventListener("resize", syncViewportWidth);
        window.removeEventListener("resize", syncContainerWidth);
      };
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(dashboard);

    return () => {
      window.removeEventListener("resize", syncViewportWidth);
      observer.disconnect();
    };
  }, [active]);

  const geometry = useMemo(
    () => getProjectDashboardGeometry(viewportWidth, containerWidth),
    [containerWidth, viewportWidth],
  );

  return {
    dashboardRef,
    mode: geometry.mode,
    mainWidth: geometry.mainWidth,
    updatesWidth:
      geometry.mode === "rail" ? geometry.updatesWidth : PROJECT_UPDATES_MIN_WIDTH,
  };
}
