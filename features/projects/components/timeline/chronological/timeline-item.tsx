"use client";

import React from "react";
import { ProjectScheduleActivity } from "../../../domain/project-schedule.types";
import styles from "./chronological-timeline.module.css";

interface TimelineItemProps {
  activity: ProjectScheduleActivity;
  phaseName?: string;
  isSelected?: boolean;
  onSelect: (activityId: string) => void;
  todayStr?: string;
}

export function TimelineItem({
  activity,
  phaseName,
  isSelected,
  onSelect,
  todayStr = "2026-07-28",
}: TimelineItemProps) {
  const isOverdue =
    activity.status !== "completed" &&
    activity.status !== "cancelled" &&
    activity.plannedEndDate &&
    activity.plannedEndDate < todayStr;

  const isToday =
    activity.plannedStartDate === todayStr || activity.plannedEndDate === todayStr;

  const isMilestone = activity.type === "milestone" || activity.isMilestone;

  // Accessible Status dot styling
  const renderIndicatorDot = () => {
    if (isMilestone) {
      return (
        <span
          className={styles.dotMilestone}
          aria-label={`Milestone indicator for ${activity.title}`}
        />
      );
    }
    if (activity.status === "completed") {
      return (
        <span
          className={`${styles.dotBase} ${styles.dotCompleted}`}
          aria-label="Completed activity"
        />
      );
    }
    if (isOverdue) {
      return (
        <span
          className={`${styles.dotBase} ${styles.dotOverdue}`}
          aria-label="Overdue activity"
        />
      );
    }
    if (activity.status === "blocked") {
      return (
        <span
          className={`${styles.dotBase} ${styles.dotAtRisk}`}
          aria-label="Blocked activity"
        />
      );
    }
    if (isToday) {
      return (
        <span
          className={`${styles.dotBase} ${styles.dotActiveToday}`}
          aria-label="Active today activity"
        >
          <span className={styles.dotActiveTodayInner} />
        </span>
      );
    }
    return (
      <span
        className={`${styles.dotBase} ${styles.dotUpcoming}`}
        aria-label="Upcoming activity"
      />
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(activity.id);
    }
  };

  // Date display formatting
  const displayDate = activity.plannedStartDate || activity.plannedEndDate || "TBD";
  const dateFormatted = displayDate !== "TBD" ? displayDate.substring(5) : "TBD";

  return (
    <div
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Activity: ${activity.title}, Status: ${activity.status}, Due: ${displayDate}`}
      className={`${styles.timelineRowItem} ${isSelected ? styles.timelineRowSelected : ""}`}
      onClick={() => onSelect(activity.id)}
      onKeyDown={handleKeyDown}
    >
      {/* Date Column */}
      <div className={styles.dateCol}>
        <span className={styles.dateText}>{dateFormatted}</span>
        <span className={styles.dayText}>{isMilestone ? "Milestone" : activity.wbsCode}</span>
      </div>

      {/* Rail & Indicator Column */}
      <div className={styles.indicatorCol}>
        <div className={styles.railLine} />
        {renderIndicatorDot()}
      </div>

      {/* Item Content Column */}
      <div className={styles.itemContentCol}>
        <div className={styles.itemTitleRow}>
          <span className={styles.itemTitle}>{activity.title}</span>
          {isOverdue && <span className={styles.overdueTag}>Overdue</span>}
        </div>

        {/* Restrained Metadata Subtitle: Phase · Owner · Status */}
        <div className={styles.itemMetaRow}>
          {phaseName && <span className={styles.metaBadge}>{phaseName}</span>}
          <span>{activity.assigneeName || "Unassigned"}</span>
          <span>·</span>
          <span>
            {activity.status === "completed"
              ? "Completed"
              : activity.status === "in_progress"
              ? `In Progress (${activity.progressPercent}%)`
              : activity.status === "blocked"
              ? "Blocked"
              : "Pending"}
          </span>
        </div>
      </div>
    </div>
  );
}
