"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronDown, AlertTriangle, CheckCircle2, User, Flag } from "lucide-react";
import type { PresentableScheduleItem } from "../../services/project-schedule.service";
import type { MockProject } from "../../data/mock-calendar-data";
import type { GanttZoomId } from "../../hooks/use-calendar-query-state";
import styles from "../calendar-workspace-page.module.css";

interface GanttChartProps {
  isAllProjects: boolean;
  selectedProjectId: string | null;
  projectsList: MockProject[];
  scheduleItems: PresentableScheduleItem[];
  zoom: GanttZoomId;
  onSelectItem: (id: string, type: "activity" | "schedule") => void;
}

export function GanttChart({
  isAllProjects,
  selectedProjectId,
  projectsList,
  scheduleItems,
  zoom,
  onSelectItem,
}: GanttChartProps) {
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set());

  const togglePhaseCollapse = (phaseId: string) => {
    setCollapsedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  // Timeline columns for July - August 2026
  const totalDays = 45; // Jul 1 to Aug 15
  const startTimestamp = new Date("2026-07-01").getTime();

  const getDayOffset = (dateStr: string) => {
    const t = new Date(dateStr).getTime();
    const diffDays = Math.floor((t - startTimestamp) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(totalDays, diffDays));
  };

  const colWidth = zoom === "week" ? 40 : zoom === "quarter" ? 14 : 24;
  const todayOffsetDays = getDayOffset("2026-07-21");
  const todayLeftPx = todayOffsetDays * colWidth;

  // Filter items based on scope
  const filteredScheduleItems = isAllProjects
    ? scheduleItems.filter((i) => i.itemType === "phase" || i.itemType === "milestone")
    : scheduleItems.filter((i) => i.projectId === selectedProjectId);

  // Group items by phase for hierarchy
  const phases = filteredScheduleItems.filter((i) => i.itemType === "phase");
  const nonPhases = filteredScheduleItems.filter((i) => i.itemType !== "phase");

  return (
    <div className={styles.ganttChartWrapper}>
      <div className={styles.ganttSplitContainer}>
        {/* Left Fixed Table Section */}
        <div className={styles.ganttTableCol}>
          <div className={styles.ganttTableHeaderRow}>
            <div className={styles.colHeaderName}>Project / Task Name</div>
            <div className={styles.colHeaderAssignee}>Assignee</div>
            <div className={styles.colHeaderProgress}>Progress</div>
            <div className={styles.colHeaderStatus}>Status</div>
          </div>

          <div className={styles.ganttTableBody}>
            {isAllProjects ? (
              // All Projects Overview List
              projectsList.map((proj) => (
                <div key={proj.id} className={styles.ganttTableRowSummary}>
                  <div className={styles.colCellName}>
                    <span className={styles.projectNameText}>{proj.name}</span>
                    <span className={styles.projectCodeBadge}>{proj.code}</span>
                  </div>
                  <div className={styles.colCellAssignee}>
                    <User size={14} />
                    <span>Team Lead</span>
                  </div>
                  <div className={styles.colCellProgress}>
                    <div className={styles.miniProgressBarTrack}>
                      <div
                        className={styles.miniProgressBarFill}
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                    <span>{proj.progress}%</span>
                  </div>
                  <div className={styles.colCellStatus}>
                    <span className={styles.phaseBadge}>{proj.phase}</span>
                  </div>
                </div>
              ))
            ) : (
              // Selected Project Hierarchical List
              phases.map((phase) => {
                const isCollapsed = collapsedPhases.has(phase.id);
                const childItems = nonPhases.filter(
                  (item) => item.startDate >= phase.startDate && item.dueDate <= phase.dueDate
                );

                return (
                  <React.Fragment key={phase.id}>
                    {/* Phase Header Row */}
                    <div className={styles.ganttTableRowPhase}>
                      <div className={styles.colCellName}>
                        <button
                          type="button"
                          className={styles.collapseToggleBtn}
                          onClick={() => togglePhaseCollapse(phase.id)}
                        >
                          {isCollapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
                        </button>
                        <span className={styles.phaseNameText}>{phase.title}</span>
                      </div>
                      <div className={styles.colCellAssignee}>Phase</div>
                      <div className={styles.colCellProgress}>
                        <span>{phase.progress ?? 0}%</span>
                      </div>
                      <div className={styles.colCellStatus}>
                        <span className={styles.statusPhaseTag}>{phase.status}</span>
                      </div>
                    </div>

                    {/* Child Task Rows */}
                    {!isCollapsed &&
                      childItems.map((item) => (
                        <div
                          key={item.id}
                          className={`${styles.ganttTableRowTask} ${
                            item.isCriticalDelay ? styles.ganttRowCritical : ""
                          }`}
                          onClick={() => onSelectItem(item.id, "schedule")}
                          role="button"
                          tabIndex={0}
                        >
                          <div className={styles.colCellNameIndented}>
                            {item.itemType === "milestone" ? (
                              <Flag size={14} className={styles.milestoneIcon} />
                            ) : null}
                            <span className={styles.taskTitleText}>{item.title}</span>
                          </div>
                          <div className={styles.colCellAssignee}>
                            {item.assigneeId ? item.assigneeId : "—"}
                          </div>
                          <div className={styles.colCellProgress}>
                            {item.progress !== undefined ? `${item.progress}%` : "—"}
                          </div>
                          <div className={styles.colCellStatus}>
                            <span
                              className={`${styles.taskStatusTag} ${
                                item.status === "completed"
                                  ? styles.statusTagCompleted
                                  : item.isCriticalDelay
                                  ? styles.statusTagCritical
                                  : styles.statusTagActive
                              }`}
                            >
                              {item.isCriticalDelay ? "Critical Delay" : item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                  </React.Fragment>
                );
              })
            )}
          </div>
        </div>

        {/* Right Scrollable Timeline Section */}
        <div className={styles.ganttTimelineCol}>
          {/* Header Row: Days / Timeline Ticks */}
          <div
            className={styles.timelineHeaderRow}
            style={{ width: `${totalDays * colWidth}px` }}
          >
            {Array.from({ length: totalDays }, (_, i) => {
              const d = new Date(startTimestamp + i * 24 * 60 * 60 * 1000);
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              const dateNum = d.getDate();

              return (
                <div
                  key={`t-head-${i}`}
                  className={`${styles.timelineHeaderTick} ${isWeekend ? styles.tickWeekend : ""}`}
                  style={{ width: `${colWidth}px` }}
                >
                  <span className={styles.tickLabel}>{dateNum}</span>
                </div>
              );
            })}
          </div>

          {/* Timeline Body */}
          <div
            className={styles.timelineBody}
            style={{ width: `${totalDays * colWidth}px` }}
          >
            {/* Vertical Today Indicator Line */}
            <div
              className={styles.ganttTodayLine}
              style={{ left: `${todayLeftPx}px` }}
              title="Today — Jul 21, 2026"
            >
              <div className={styles.ganttTodayMarkerTag}>Today</div>
            </div>

            {/* Render Timeline Bars */}
            {isAllProjects
              ? projectsList.map((proj) => (
                  <div key={`t-row-${proj.id}`} className={styles.timelineRow}>
                    <div
                      className={styles.ganttProjectBar}
                      style={{
                        left: `${10 * colWidth}px`,
                        width: `${25 * colWidth}px`,
                      }}
                    >
                      <span className={styles.barLabel}>{proj.name} — {proj.phase}</span>
                    </div>
                  </div>
                ))
              : phases.map((phase) => {
                  const isCollapsed = collapsedPhases.has(phase.id);
                  const childItems = nonPhases.filter(
                    (item) => item.startDate >= phase.startDate && item.dueDate <= phase.dueDate
                  );

                  const phaseStartOffset = getDayOffset(phase.startDate);
                  const phaseEndOffset = getDayOffset(phase.dueDate);
                  const phaseWidth = Math.max(1, phaseEndOffset - phaseStartOffset) * colWidth;

                  return (
                    <React.Fragment key={`t-phase-${phase.id}`}>
                      {/* Phase Bar Row */}
                      <div className={styles.timelineRowPhase}>
                        <div
                          className={styles.ganttPhaseBar}
                          style={{
                            left: `${phaseStartOffset * colWidth}px`,
                            width: `${phaseWidth}px`,
                          }}
                        >
                          <span className={styles.barLabel}>{phase.title}</span>
                        </div>
                      </div>

                      {/* Child Tasks Bars */}
                      {!isCollapsed &&
                        childItems.map((item) => {
                          const startOffset = getDayOffset(item.startDate);
                          const endOffset = getDayOffset(item.dueDate);
                          const durationDays = Math.max(1, endOffset - startOffset);
                          const barWidth = durationDays * colWidth;

                          const isMilestone = item.itemType === "milestone";

                          return (
                            <div key={`t-task-${item.id}`} className={styles.timelineRowTask}>
                              {/* Baseline Ghost Bar (if baseline dates exist) */}
                              {item.baselineStartDate && item.baselineDueDate && (
                                <div
                                  className={styles.ganttBaselineGhostBar}
                                  style={{
                                    left: `${getDayOffset(item.baselineStartDate) * colWidth}px`,
                                    width: `${
                                      (getDayOffset(item.baselineDueDate) -
                                        getDayOffset(item.baselineStartDate)) *
                                      colWidth
                                    }px`,
                                  }}
                                  title="Baseline Schedule Span"
                                />
                              )}

                              {isMilestone ? (
                                // Milestone Diamond (0 Duration)
                                <div
                                  className={styles.ganttMilestoneDiamond}
                                  style={{ left: `${startOffset * colWidth}px` }}
                                  title={`Milestone: ${item.title}`}
                                  onClick={() => onSelectItem(item.id, "schedule")}
                                />
                              ) : (
                                // Task Bar
                                <div
                                  className={`${styles.ganttTaskBar} ${
                                    item.status === "completed"
                                      ? styles.ganttTaskCompleted
                                      : item.isCriticalDelay
                                      ? styles.ganttTaskCritical
                                      : styles.ganttTaskActive
                                  }`}
                                  style={{
                                    left: `${startOffset * colWidth}px`,
                                    width: `${barWidth}px`,
                                  }}
                                  onClick={() => onSelectItem(item.id, "schedule")}
                                >
                                  {item.progress !== undefined && item.progress > 0 && (
                                    <div
                                      className={styles.ganttTaskProgressFill}
                                      style={{ width: `${item.progress}%` }}
                                    />
                                  )}
                                  <span className={styles.barLabelText}>{item.title}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </React.Fragment>
                  );
                })}
          </div>
        </div>
      </div>
    </div>
  );
}
