"use client";

import React from "react";
import { Check } from "lucide-react";
import { ProjectScheduleActivity } from "../../../domain/project-schedule.types";
import { PhaseColorTheme } from "./phase-colors";
import { GanttZoom } from "../query-state/timeline-query-schema";
import { shouldShowActivityLabel } from "./gantt-label-policy";
import styles from "./gantt-workspace.module.css";

interface GanttActivityBarProps {
  activity: ProjectScheduleActivity;
  leftPx?: number;
  widthPx?: number;
  leftPercent?: number;
  widthPercent?: number;
  showBaseline: boolean;
  delayDays: number;
  colorTheme: PhaseColorTheme;
  zoom?: GanttZoom;
  onSelect: (activityId: string) => void;
}

export function GanttActivityBar({
  activity,
  leftPx,
  widthPx,
  leftPercent,
  widthPercent,
  showBaseline,
  delayDays,
  colorTheme,
  zoom = "month",
  onSelect,
}: GanttActivityBarProps) {
  const isCompleted = activity.status === "completed" || activity.progressPercent === 100;

  const positionStyle: React.CSSProperties =
    leftPx !== undefined && widthPx !== undefined
      ? { left: `${leftPx}px`, width: `${widthPx}px` }
      : { left: `${leftPercent}%`, width: `${widthPercent}%` };

  const barWidth = widthPx !== undefined ? widthPx : (widthPercent || 0) * 10;
  const showLabel = shouldShowActivityLabel(zoom, barWidth);

  return (
    <div
      className={styles.activityBarWrapper}
      style={positionStyle}
      onClick={() => onSelect(activity.id)}
      title={`${activity.title}: ${activity.plannedStartDate || ""} to ${activity.plannedEndDate || ""} (${activity.progressPercent}% complete)${
        delayDays > 0 ? ` — +${delayDays}d delay past baseline` : ""
      }`}
      aria-label={`${activity.title}, ${activity.progressPercent}% complete`}
    >
      {/* Activity Bar Body */}
      <div
        className={styles.activityBar}
        style={{
          backgroundColor: colorTheme.lightBg,
          border: "none",
        }}
      >
        {/* Solid 3px Leading Edge */}
        <div
          className={styles.barLeadingEdge}
          style={{ backgroundColor: colorTheme.primary }}
        />

        {/* Progress Fill Overlay */}
        {activity.progressPercent > 0 && (
          <div
            className={styles.barProgressFill}
            style={{
              width: `${activity.progressPercent}%`,
              backgroundColor: colorTheme.primary,
              opacity: isCompleted ? 0.35 : 0.28,
            }}
          />
        )}

        {/* Inside Bar Content (strictly internal, no external wrapping labels) */}
        {showLabel && (
          <div className={styles.barInsideContent}>
            {isCompleted && (
              <span
                className={styles.barCheckBadge}
                style={{ backgroundColor: colorTheme.primary }}
              >
                <Check size={8} strokeWidth={3} color="#ffffff" />
              </span>
            )}
            <span
              className={styles.barTextLabelInside}
              style={{ color: colorTheme.text }}
            >
              {activity.title}
            </span>
          </div>
        )}
      </div>

      {/* Delay Variance Badge */}
      {showBaseline && delayDays > 0 && (
        <span className={styles.delayVarianceBadge} title={`Delayed by +${delayDays}d`}>
          +{delayDays}d
        </span>
      )}
    </div>
  );
}
