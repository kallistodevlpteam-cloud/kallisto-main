"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  ProjectScheduleActivity,
  ProjectSchedulePhase,
  ProjectSchedulePermissions,
  ScheduleSummaryContext,
} from "../../../domain/project-schedule.types";
import { GanttToolbar } from "./gantt-toolbar";
import { GanttTaskTable } from "./gantt-task-table";
import { GanttGrid, GanttGridHandle } from "./gantt-grid";
import {
  calculateTimelineRange,
  formatTimelineRangeLabel,
  formatDateOnlyUtc,
} from "./gantt-scale";
import { ActivityInspector } from "../activity-inspector/activity-inspector";
import { GanttZoom } from "../query-state/timeline-query-schema";
import styles from "./gantt-workspace.module.css";

interface GanttWorkspaceProps {
  projectId: string;
  projectName: string;
  activities: ProjectScheduleActivity[];
  phases: ProjectSchedulePhase[];
  permissions: ProjectSchedulePermissions;
  context: ScheduleSummaryContext;
  selectedActivityId: string | null;
  zoom: GanttZoom;
  showBaseline: boolean;
  searchValue: string;
  onSelectActivity: (activityId: string | null) => void;
  onZoomChange: (zoom: GanttZoom) => void;
  onToggleBaseline: () => void;
  onSearchChange: (q: string) => void;
}

export function GanttWorkspace({
  activities,
  phases,
  permissions,
  context,
  selectedActivityId,
  zoom,
  showBaseline,
  searchValue,
  onSelectActivity,
  onZoomChange,
  onToggleBaseline,
  onSearchChange,
}: GanttWorkspaceProps) {
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredActivityId, setHoveredActivityId] = useState<string | null>(null);

  // Sync scroll ref for task table and imperative handle ref for GanttGrid
  const taskTableRef = useRef<HTMLDivElement>(null);
  const ganttGridRef = useRef<GanttGridHandle>(null);

  // Calculate timeline range ONCE from complete unfiltered activities list
  const timelineRange = useMemo(
    () => calculateTimelineRange(activities, context.today),
    [activities, context.today]
  );

  const dateRangeLabel = useMemo(
    () =>
      formatTimelineRangeLabel(
        formatDateOnlyUtc(timelineRange.rangeStartMs),
        formatDateOnlyUtc(timelineRange.rangeEndMs)
      ),
    [timelineRange.rangeStartMs, timelineRange.rangeEndMs]
  );

  // Keyboard shortcut: Escape exits expanded workspace focus mode
  useEffect(() => {
    if (!isExpanded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsExpanded(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

  const handleNavigateToday = () => {
    ganttGridRef.current?.scrollToToday();
  };

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

  // Filter activities by search query only for visible rows
  const filteredActivities = activities.filter((act) => {
    if (!searchValue.trim()) return true;
    const q = searchValue.toLowerCase();
    return (
      act.title.toLowerCase().includes(q) ||
      act.wbsCode.toLowerCase().includes(q) ||
      (act.assigneeName || "").toLowerCase().includes(q)
    );
  });

  const selectedActivity = activities.find((a) => a.id === selectedActivityId) || null;

  return (
    <div
      className={`${styles.timelineWorkspaceLayout} ${
        isExpanded ? styles.ganttWorkspaceExpanded : ""
      }`}
    >
      {/* Unified Single Planning Surface */}
      <section className={styles.planningSurface}>
        {/* Integrated Toolbar */}
        <GanttToolbar
          zoom={zoom}
          onZoomChange={onZoomChange}
          showBaseline={showBaseline}
          onToggleBaseline={onToggleBaseline}
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded((prev) => !prev)}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          dateRangeLabel={dateRangeLabel}
          onNavigateToday={handleNavigateToday}
        />

        {/* Task Tree & Timeline Workspace Container */}
        <div className={styles.ganttViewportTable}>
          <div className={styles.ganttMainLayout}>
            {/* Task Tree Column Pane */}
            <GanttTaskTable
              phases={phases}
              activities={filteredActivities}
              collapsedPhases={collapsedPhases}
              onTogglePhaseCollapse={togglePhaseCollapse}
              selectedActivityId={selectedActivityId}
              hoveredActivityId={hoveredActivityId}
              onSelectActivity={(id) => onSelectActivity(id)}
              onHoverActivity={setHoveredActivityId}
              bodyRef={taskTableRef}
            />

            {/* Timeline Grid Pane (Owns Measured Scale & Imperative Scroll Handle) */}
            <GanttGrid
              ref={ganttGridRef}
              phases={phases}
              activities={filteredActivities}
              timelineRange={timelineRange}
              collapsedPhases={collapsedPhases}
              showBaseline={showBaseline}
              todayStr={context.today}
              selectedActivityId={selectedActivityId}
              hoveredActivityId={hoveredActivityId}
              zoom={zoom}
              onSelectActivity={(id) => onSelectActivity(id)}
              onHoverActivity={setHoveredActivityId}
            />
          </div>
        </div>
      </section>

      {/* Docked Activity Inspector */}
      <ActivityInspector
        activity={selectedActivity}
        permissions={permissions}
        onClose={() => onSelectActivity(null)}
      />
    </div>
  );
}
