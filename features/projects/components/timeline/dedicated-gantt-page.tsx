"use client";

import React from "react";
import {
  ProjectScheduleActivity,
  ProjectSchedulePhase,
  ProjectSchedulePermissions,
  ScheduleSummaryContext,
} from "../../domain/project-schedule.types";
import { ProjectScheduleWorkspace } from "../schedule/project-schedule-workspace";
import { GanttQueryState } from "./query-state/timeline-query-schema";

interface DedicatedGanttPageProps {
  projectId: string;
  projectName: string;
  activities: ProjectScheduleActivity[];
  phases: ProjectSchedulePhase[];
  permissions: ProjectSchedulePermissions;
  context: ScheduleSummaryContext;
  initialQuery: GanttQueryState;
}

export function DedicatedGanttPage({
  projectId,
  projectName,
}: DedicatedGanttPageProps) {
  return (
    <ProjectScheduleWorkspace
      projectId={projectId}
      projectName={projectName}
      initialViewMode="Gantt"
      hideHeader={true}
    />
  );
}
