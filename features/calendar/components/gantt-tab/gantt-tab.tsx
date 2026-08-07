"use client";

import React from "react";
import { GanttControls } from "./gantt-controls";
import { GanttChart } from "./gantt-chart";
import type { CalendarQueryState } from "../../hooks/use-calendar-query-state";
import type { PresentableScheduleItem } from "../../services/project-schedule.service";
import type { MockProject } from "../../data/mock-calendar-data";
import styles from "../calendar-workspace-page.module.css";

interface GanttTabProps {
  queryState: CalendarQueryState;
  onUpdateQuery: (updates: Partial<CalendarQueryState>) => void;
  projectsList: MockProject[];
  scheduleItems: PresentableScheduleItem[];
  onSelectItem: (id: string, type: "activity" | "schedule") => void;
}

export function GanttTab({
  queryState,
  onUpdateQuery,
  projectsList,
  scheduleItems,
  onSelectItem,
}: GanttTabProps) {
  const isAllProjects = !queryState.project;

  return (
    <div className={styles.ganttWorkspaceContainer}>
      {/* Controls Bar */}
      <GanttControls
        queryState={queryState}
        onUpdateQuery={onUpdateQuery}
        projectsList={projectsList}
        onJumpToday={() => onUpdateQuery({ date: "2026-07-21" })}
      />

      {/* Split Chart (Fixed Table + Scrollable Timeline) */}
      <GanttChart
        isAllProjects={isAllProjects}
        selectedProjectId={queryState.project}
        projectsList={projectsList}
        scheduleItems={scheduleItems}
        zoom={queryState.zoom}
        onSelectItem={onSelectItem}
      />
    </div>
  );
}
