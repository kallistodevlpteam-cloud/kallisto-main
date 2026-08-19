"use client";

import React from "react";
import { Plus, Layers2, Maximize2, Minimize2 } from "lucide-react";
import { GanttZoom } from "../query-state/timeline-query-schema";
import styles from "./gantt-workspace.module.css";

interface GanttToolbarProps {
  zoom: GanttZoom;
  onZoomChange: (zoom: GanttZoom) => void;
  showBaseline: boolean;
  onToggleBaseline: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  searchValue?: string;
  onSearchChange?: (q: string) => void;
  dateRangeLabel: string;
  onNavigateToday: () => void;
}

export function GanttToolbar({
  zoom,
  onZoomChange,
  showBaseline,
  onToggleBaseline,
  isExpanded,
  onToggleExpand,
  dateRangeLabel,
  onNavigateToday,
}: GanttToolbarProps) {
  return (
    <div className={styles.ganttUnifiedToolbar}>
      <div className={styles.toolbarRow}>
        {/* Left Section: Team Controls, Baseline Comparison & Expand Workspace */}
        <div className={styles.toolbarLeftSection}>
          <div className={styles.teamAvatarStack} title="Team members">
            <button
              type="button"
              className={styles.addMemberBtn}
              title="Add team member"
              aria-label="Add team member"
            >
              <Plus size={13} />
            </button>
            <div className={styles.avatarCircle} title="Farhan">
              F
            </div>
            <span className={styles.avatarMoreBadge}>+5</span>
          </div>

          <span className={styles.toolIconDivider} />

          {/* Baseline Comparison Toggle */}
          <button
            type="button"
            className={`${styles.toolIconBtn} ${showBaseline ? styles.toolIconActive : ""}`}
            onClick={onToggleBaseline}
            aria-pressed={showBaseline}
            title={showBaseline ? "Hide baseline comparison" : "Show baseline comparison"}
            aria-label={showBaseline ? "Hide baseline comparison" : "Show baseline comparison"}
          >
            <Layers2 size={15} />
          </button>

          {/* Expand / Collapse Workspace Toggle */}
          <button
            type="button"
            className={`${styles.toolIconBtn} ${isExpanded ? styles.toolIconActive : ""}`}
            onClick={onToggleExpand}
            aria-pressed={isExpanded}
            title={isExpanded ? "Collapse Gantt workspace" : "Expand Gantt workspace"}
            aria-label={isExpanded ? "Collapse Gantt workspace" : "Expand Gantt workspace"}
          >
            {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>

        {/* Right Section: Today Button, Date Range & Zoom Segmented Control */}
        <div className={styles.toolbarRightSection}>
          <button
            type="button"
            className={styles.todayBtn}
            onClick={onNavigateToday}
            title="Navigate to today"
          >
            Today
          </button>

          <span className={styles.dateRangeTextLabel}>{dateRangeLabel}</span>

          <div className={styles.zoomSegmentedGroup} role="group" aria-label="Timeline zoom level">
            <button
              type="button"
              className={`${styles.zoomSegmentBtn} ${
                zoom === "week" ? styles.zoomSegmentActive : ""
              }`}
              onClick={() => onZoomChange("week")}
              aria-pressed={zoom === "week"}
            >
              Week
            </button>
            <button
              type="button"
              className={`${styles.zoomSegmentBtn} ${
                zoom === "month" ? styles.zoomSegmentActive : ""
              }`}
              onClick={() => onZoomChange("month")}
              aria-pressed={zoom === "month"}
            >
              Month
            </button>
            <button
              type="button"
              className={`${styles.zoomSegmentBtn} ${
                zoom === "quarter" ? styles.zoomSegmentActive : ""
              }`}
              onClick={() => onZoomChange("quarter")}
              aria-pressed={zoom === "quarter"}
            >
              Quarter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
