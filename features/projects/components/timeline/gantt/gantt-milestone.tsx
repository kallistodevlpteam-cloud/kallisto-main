"use client";

import React from "react";
import { ProjectScheduleActivity } from "../../../domain/project-schedule.types";
import { PhaseColorTheme } from "./phase-colors";
import { GanttZoom } from "../query-state/timeline-query-schema";
import { shouldShowMilestoneLabel } from "./gantt-label-policy";
import styles from "./gantt-workspace.module.css";

interface GanttMilestoneProps {
  activity: ProjectScheduleActivity;
  leftPx?: number;
  leftPercent?: number;
  totalCanvasWidth?: number;
  colorTheme: PhaseColorTheme;
  zoom?: GanttZoom;
  onSelect: (activityId: string) => void;
}

export function GanttMilestone({
  activity,
  leftPx = 0,
  leftPercent,
  totalCanvasWidth = 0,
  colorTheme,
  zoom = "month",
  onSelect,
}: GanttMilestoneProps) {
  const isCompleted = activity.status === "completed" || activity.progressPercent === 100;
  const leftPos = leftPx !== undefined ? `${leftPx}px` : `${leftPercent}%`;
  const showLabel = shouldShowMilestoneLabel(zoom, totalCanvasWidth, leftPx);

  return (
    <div
      className={styles.milestoneRowContainer}
      style={{ left: leftPos }}
      onClick={() => onSelect(activity.id)}
      title={`Milestone: ${activity.title} (${activity.plannedStartDate || activity.plannedEndDate || ""})`}
    >
      <div
        className={styles.milestoneDiamondShape}
        style={{
          backgroundColor: isCompleted ? "#10b981" : colorTheme.primary,
        }}
        aria-label={`Milestone diamond for ${activity.title}`}
      />
      {showLabel && (
        <span className={styles.milestoneLabelInline}>
          {activity.title}
        </span>
      )}
    </div>
  );
}
