"use client";

import React from "react";
import { Filter, Calendar as CalendarIcon, ZoomIn } from "lucide-react";
import type { CalendarQueryState, GanttZoomId } from "../../hooks/use-calendar-query-state";
import styles from "../calendar-workspace-page.module.css";

interface GanttControlsProps {
  queryState: CalendarQueryState;
  onUpdateQuery: (updates: Partial<CalendarQueryState>) => void;
  projectsList: Array<{ id: string; name: string }>;
  onJumpToday: () => void;
}

export function GanttControls({
  queryState,
  onUpdateQuery,
  projectsList,
  onJumpToday,
}: GanttControlsProps) {
  const isAllProjects = !queryState.project;

  return (
    <div className={styles.ganttControlsBar}>
      <div className={styles.ganttControlsLeft}>
        {/* Scope Selector Toggle: All Projects vs Selected Project */}
        <div className={styles.scopeSegmentGroup} role="tablist">
          <button
            type="button"
            className={`${styles.scopeSegmentBtn} ${isAllProjects ? styles.scopeSegmentActive : ""}`}
            onClick={() => onUpdateQuery({ project: null })}
          >
            All Projects
          </button>
          <button
            type="button"
            className={`${styles.scopeSegmentBtn} ${!isAllProjects ? styles.scopeSegmentActive : ""}`}
            onClick={() => {
              if (projectsList.length > 0) {
                onUpdateQuery({ project: projectsList[0].id });
              }
            }}
          >
            Selected Project
          </button>
        </div>

        {/* Project Selector Dropdown */}
        <div className={styles.ganttProjectSelectWrap}>
          <select
            className={styles.ganttSelect}
            value={queryState.project || ""}
            onChange={(e) => {
              const val = e.target.value || null;
              onUpdateQuery({ project: val });
            }}
          >
            <option value="">All Projects (High-level)</option>
            {projectsList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Today Marker Button */}
        <button
          type="button"
          className={styles.todayMarkerBtn}
          onClick={onJumpToday}
          title="Scroll timeline to today marker"
        >
          <CalendarIcon size={14} />
          <span>Today Marker</span>
        </button>
      </div>

      <div className={styles.ganttControlsRight}>
        {/* Zoom Level Switcher: Week | Month | Quarter */}
        <div className={styles.zoomSegmentGroup}>
          <span className={styles.zoomLabel}>
            <ZoomIn size={14} />
            <span>Zoom:</span>
          </span>
          <button
            type="button"
            className={`${styles.zoomBtn} ${queryState.zoom === "week" ? styles.zoomBtnActive : ""}`}
            onClick={() => onUpdateQuery({ zoom: "week" })}
          >
            Week
          </button>
          <button
            type="button"
            className={`${styles.zoomBtn} ${queryState.zoom === "month" ? styles.zoomBtnActive : ""}`}
            onClick={() => onUpdateQuery({ zoom: "month" })}
          >
            Month
          </button>
          <button
            type="button"
            className={`${styles.zoomBtn} ${queryState.zoom === "quarter" ? styles.zoomBtnActive : ""}`}
            onClick={() => onUpdateQuery({ zoom: "quarter" })}
          >
            Quarter
          </button>
        </div>
      </div>
    </div>
  );
}
