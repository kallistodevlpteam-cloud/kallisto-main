"use client";

import React, {
  useMemo,
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { ProjectScheduleActivity, ProjectSchedulePhase } from "../../../domain/project-schedule.types";
import { GanttActivityBar } from "./gantt-activity-bar";
import { GanttMilestone } from "./gantt-milestone";
import { getPhaseColorTheme } from "./phase-colors";
import { GanttZoom } from "../query-state/timeline-query-schema";
import { getPhaseLabelPresentation } from "./gantt-label-policy";
import {
  TimelineRange,
  DayCol,
  MonthSegment,
  buildDynamicGridScale,
  getDaysOffset,
  getInclusiveDurationDays,
  parseDateOnlyUtc,
  calculateTimelineRange,
  isDateInRange,
} from "./gantt-scale";
import styles from "./gantt-workspace.module.css";

export type { DayCol, MonthSegment, TimelineRange };
export {
  buildDynamicGridScale,
  getDaysOffset,
  getInclusiveDurationDays,
  calculateTimelineRange,
  isDateInRange,
};

export interface GanttGridHandle {
  scrollToToday: () => void;
}

interface GanttGridProps {
  phases: ProjectSchedulePhase[];
  activities: ProjectScheduleActivity[];
  timelineRange: TimelineRange;
  collapsedPhases: Set<string>;
  showBaseline: boolean;
  todayStr?: string;
  selectedActivityId: string | null;
  hoveredActivityId: string | null;
  zoom?: GanttZoom;
  onSelectActivity: (activityId: string) => void;
  onHoverActivity: (activityId: string | null) => void;
  onScroll?: React.UIEventHandler<HTMLDivElement>;
}

export const GanttGrid = forwardRef<GanttGridHandle, GanttGridProps>(function GanttGrid(
  {
    phases,
    activities,
    timelineRange,
    collapsedPhases,
    showBaseline,
    todayStr = new Date().toISOString().slice(0, 10),
    selectedActivityId,
    hoveredActivityId,
    zoom = "month",
    onSelectActivity,
    onHoverActivity,
    onScroll,
  },
  ref
) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);

  // ResizeObserver attached to .rightTimelineGridPanel (prevents resize/render loops)
  useEffect(() => {
    if (!panelRef.current) return;
    const element = panelRef.current;
    setViewportWidth(Math.round(element.clientWidth));

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const nextWidth = Math.round(entry.contentRect.width);
        setViewportWidth((current) =>
          Math.abs(current - nextWidth) >= 2 ? nextWidth : current
        );
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const { days, monthSegments, unitDayWidth, totalCanvasWidth } = useMemo(
    () => buildDynamicGridScale(timelineRange, zoom, todayStr, viewportWidth),
    [timelineRange, zoom, todayStr, viewportWidth]
  );

  const isTodayInRange = isDateInRange(todayStr, timelineRange.rangeStartMs, timelineRange.rangeEndMs);
  const todayDaysOffset = getDaysOffset(todayStr, timelineRange.rangeStartMs);
  const todayLeftPx = todayDaysOffset * unitDayWidth + unitDayWidth / 2;

  // Single authoritative scale imperative navigation handler
  useImperativeHandle(
    ref,
    () => ({
      scrollToToday() {
        if (!panelRef.current) return;
        const todayMs = parseDateOnlyUtc(todayStr);
        let targetScrollLeft = 0;

        if (todayMs !== null && isTodayInRange) {
          const anchorOffset = todayDaysOffset * unitDayWidth;
          targetScrollLeft = Math.max(0, anchorOffset - panelRef.current.clientWidth * 0.3);
        } else if (todayMs !== null && todayMs > timelineRange.rangeEndMs) {
          targetScrollLeft = Math.max(0, totalCanvasWidth - panelRef.current.clientWidth);
        } else {
          targetScrollLeft = 0;
        }

        panelRef.current.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
      },
    }),
    [todayStr, isTodayInRange, todayDaysOffset, unitDayWidth, timelineRange.rangeEndMs, totalCanvasWidth]
  );

  // Scroll initial position safely on zoom change
  useEffect(() => {
    if (panelRef.current) {
      const panelWidth = panelRef.current.clientWidth;
      const todayMs = parseDateOnlyUtc(todayStr);
      let targetScrollLeft = 0;

      if (todayMs !== null && isTodayInRange) {
        const anchorOffset = todayDaysOffset * unitDayWidth;
        targetScrollLeft = Math.max(0, anchorOffset - panelWidth * 0.25);
      } else if (todayMs !== null && todayMs > timelineRange.rangeEndMs) {
        targetScrollLeft = Math.max(0, totalCanvasWidth - panelWidth);
      } else {
        targetScrollLeft = 0;
      }
      panelRef.current.scrollLeft = targetScrollLeft;
    }
  }, [zoom, todayStr, unitDayWidth, todayDaysOffset, isTodayInRange, timelineRange.rangeEndMs, totalCanvasWidth]);

  return (
    <div ref={panelRef} className={styles.rightTimelineGridPanel} onScroll={onScroll}>
      {/* Complete Horizontally Scrollable Timeline Canvas */}
      <div className={styles.timelineCanvas} style={{ width: `${totalCanvasWidth}px` }}>
        {/* Restrained 1px Blue Today Vertical Line ONLY when Today is inside range */}
        {isTodayInRange && (
          <div className={styles.verticalTodayLine} style={{ left: `${todayLeftPx}px` }} />
        )}

        {/* 2-Level Calendar Header Row (Total Height 56px) */}
        <div className={styles.timelineHeaderContainer} style={{ width: `${totalCanvasWidth}px` }}>
          {/* Level 1: Month Header Row with Responsive Labels */}
          <div className={styles.timelineMonthHeaderRow}>
            {monthSegments.map((m, idx) => (
              <div
                key={`${m.label}-${idx}`}
                className={styles.timelineMonthHeaderCell}
                style={{ width: `${m.widthPx}px`, flex: `0 0 ${m.widthPx}px` }}
              >
                <span className={styles.monthSegmentLabel} title={m.label} aria-label={m.label}>
                  {m.displayLabel}
                </span>
              </div>
            ))}
          </div>

          {/* Level 2: Subdivided Header Row */}
          <div className={styles.timelineHeaderRowGrid}>
            {days.map((day) => {
              const separatorClass =
                zoom === "month" || zoom === "quarter"
                  ? day.isMonthBoundary
                    ? styles.monthBoundarySeparator
                    : ""
                  : day.isMonday
                  ? styles.mondaySeparator
                  : "";

              return (
                <div
                  key={day.id}
                  className={`${styles.timelineDateHeaderCell} ${separatorClass}`}
                  style={{ width: `${unitDayWidth}px`, flex: `0 0 ${unitDayWidth}px` }}
                >
                  {zoom === "week" ? (
                    <div
                      className={`${styles.dayCellInner} ${
                        day.isToday ? styles.todayPillHighlight : ""
                      }`}
                    >
                      <span className={styles.weekdayInitial}>{day.weekdayInitial}</span>
                      <span className={styles.dateNumber}>{day.dateNum}</span>
                    </div>
                  ) : zoom === "month" ? (
                    day.showDateHeader ? (
                      <span className={day.isToday ? styles.todayPillHighlight : undefined}>
                        {day.dateNum}
                      </span>
                    ) : null
                  ) : (
                    day.weekMarkerLabel && (
                      <span className={styles.weekMarkerText}>{day.weekMarkerLabel}</span>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Grid Body */}
        <div className={styles.timelineGridBody} style={{ width: `${totalCanvasWidth}px` }}>
          {phases.map((phase, idx) => {
            const phaseActivities = activities.filter((a) => a.phaseId === phase.id);
            const isCollapsed = collapsedPhases.has(phase.id);
            const colorTheme = getPhaseColorTheme(phase.id, phase.order || idx);

            const validPhaseActivities = phaseActivities.filter((a) => {
              const startMs = parseDateOnlyUtc(a.plannedStartDate);
              const endMs = parseDateOnlyUtc(a.plannedEndDate);
              return startMs !== null && endMs !== null && startMs <= endMs;
            });

            const hasValidActivities = validPhaseActivities.length > 0;
            let phaseStart = "";
            let phaseEnd = "";
            let phaseLeftPx = 0;
            let phaseWidthPx = 0;

            if (hasValidActivities) {
              const startDates = validPhaseActivities
                .map((a) => a.plannedStartDate!)
                .sort((a, b) => parseDateOnlyUtc(a)! - parseDateOnlyUtc(b)!);
              const endDates = validPhaseActivities
                .map((a) => a.plannedEndDate!)
                .sort((a, b) => parseDateOnlyUtc(a)! - parseDateOnlyUtc(b)!);

              phaseStart = startDates[0];
              phaseEnd = endDates[endDates.length - 1];

              const phaseStartOffset = getDaysOffset(phaseStart, timelineRange.rangeStartMs);
              const phaseDurationDays = getInclusiveDurationDays(phaseStart, phaseEnd);
              phaseLeftPx = phaseStartOffset * unitDayWidth;
              phaseWidthPx = phaseDurationDays * unitDayWidth;
            }

            const { showLabel: showPhaseLabel, showWbs: showPhaseWbs } = getPhaseLabelPresentation(
              zoom,
              phaseWidthPx
            );

            return (
              <React.Fragment key={phase.id}>
                {/* Phase Summary Row Track */}
                <div className={styles.gridPhaseRowTrack}>
                  {days.map((day) => {
                    const separatorClass =
                      zoom === "month" || zoom === "quarter"
                        ? day.isMonthBoundary
                          ? styles.monthBoundarySeparator
                          : ""
                        : day.isMonday
                        ? styles.mondaySeparator
                        : "";

                    return (
                      <div
                        key={day.id}
                        className={`${styles.gridCellCol} ${separatorClass}`}
                        style={{ width: `${unitDayWidth}px`, flex: `0 0 ${unitDayWidth}px` }}
                      />
                    );
                  })}

                  {/* Phase Bar */}
                  {hasValidActivities && (
                    <div
                      className={styles.ganttPhaseBar}
                      style={{
                        left: `${phaseLeftPx}px`,
                        width: `${phaseWidthPx}px`,
                        backgroundColor: colorTheme.primary,
                      }}
                      title={`${phase.name} (${phase.wbsCode}): ${phaseStart} to ${phaseEnd}`}
                    >
                      {showPhaseLabel && (
                        <span className={styles.phaseBarLabel}>
                          {phase.name.toUpperCase()} {showPhaseWbs ? `- #${phase.wbsCode}` : ""}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Child Activity Rows */}
                {!isCollapsed &&
                  phaseActivities.map((act) => {
                    const isSelected = act.id === selectedActivityId;
                    const isHovered = act.id === hoveredActivityId;
                    const isMilestone = act.type === "milestone" || Boolean(act.isMilestone);

                    const pStartMs = parseDateOnlyUtc(act.plannedStartDate);
                    const pEndMs = parseDateOnlyUtc(act.plannedEndDate);

                    const hasValidPlanned = isMilestone
                      ? pStartMs !== null || pEndMs !== null
                      : pStartMs !== null && pEndMs !== null && pStartMs <= pEndMs;

                    let actLeftPx = 0;
                    let actWidthPx = 0;
                    let actStartDate = "";
                    let actEndDate = "";

                    if (hasValidPlanned) {
                      actStartDate = act.plannedStartDate || act.plannedEndDate || "";
                      actEndDate = act.plannedEndDate || actStartDate;
                      const actStartOffset = getDaysOffset(actStartDate, timelineRange.rangeStartMs);
                      const actDurationDays = getInclusiveDurationDays(actStartDate, actEndDate);
                      actLeftPx = actStartOffset * unitDayWidth;
                      actWidthPx = actDurationDays * unitDayWidth;
                    }

                    const bStartMs = parseDateOnlyUtc(act.baselineStartDate);
                    const bEndMs = parseDateOnlyUtc(act.baselineEndDate);
                    const hasValidBaseline = bStartMs !== null && bEndMs !== null && bStartMs <= bEndMs;

                    let baseLeftPx = 0;
                    let baseWidthPx = 0;
                    let delayDays = 0;

                    if (hasValidBaseline) {
                      const baseStartOffset = getDaysOffset(act.baselineStartDate, timelineRange.rangeStartMs);
                      const baseDurationDays = getInclusiveDurationDays(
                        act.baselineStartDate,
                        act.baselineEndDate
                      );
                      baseLeftPx = baseStartOffset * unitDayWidth;
                      baseWidthPx = baseDurationDays * unitDayWidth;

                      if (pEndMs !== null && bEndMs !== null && pEndMs > bEndMs) {
                        delayDays = Math.round((pEndMs - bEndMs) / (1000 * 60 * 60 * 24));
                      }
                    }

                    return (
                      <div
                        key={act.id}
                        className={`${styles.gridActivityRowTrack} ${
                          isSelected ? styles.timelineRowSelected : ""
                        } ${isHovered ? styles.timelineRowHovered : ""}`}
                        onMouseEnter={() => onHoverActivity(act.id)}
                        onMouseLeave={() => onHoverActivity(null)}
                      >
                        {days.map((day) => {
                          const separatorClass =
                            zoom === "month" || zoom === "quarter"
                              ? day.isMonthBoundary
                                ? styles.monthBoundarySeparator
                                : ""
                              : day.isMonday
                              ? styles.mondaySeparator
                              : "";

                          return (
                            <div
                              key={day.id}
                              className={`${styles.gridCellCol} ${separatorClass}`}
                              style={{ width: `${unitDayWidth}px`, flex: `0 0 ${unitDayWidth}px` }}
                            />
                          );
                        })}

                        {/* Approved Baseline Bar */}
                        {showBaseline && hasValidBaseline && (
                          <>
                            <div
                              className={styles.approvedBaselineBar}
                              style={{ left: `${baseLeftPx}px`, width: `${baseWidthPx}px` }}
                              title={`Approved Baseline: ${act.baselineStartDate} to ${act.baselineEndDate}`}
                            />
                            {delayDays > 0 && hasValidPlanned && (
                              <div
                                className={styles.delayExtensionBar}
                                style={{ left: `${baseLeftPx}px`, width: `${actWidthPx}px` }}
                                title={`Schedule Delay: +${delayDays}d variance`}
                              />
                            )}
                          </>
                        )}

                        {/* Activity or Milestone */}
                        {hasValidPlanned &&
                          (isMilestone ? (
                            <GanttMilestone
                              activity={act}
                              leftPx={actLeftPx}
                              totalCanvasWidth={totalCanvasWidth}
                              colorTheme={colorTheme}
                              zoom={zoom}
                              onSelect={onSelectActivity}
                            />
                          ) : (
                            <GanttActivityBar
                              activity={act}
                              leftPx={actLeftPx}
                              widthPx={actWidthPx}
                              showBaseline={showBaseline}
                              delayDays={delayDays}
                              colorTheme={colorTheme}
                              zoom={zoom}
                              onSelect={onSelectActivity}
                            />
                          ))}
                      </div>
                    );
                  })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
});
