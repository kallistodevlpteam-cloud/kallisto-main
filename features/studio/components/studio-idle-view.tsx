"use client";

import React from "react";
import { StudioAgentType, StudioProjectOption, StudioTask } from "@/types/domain/studio";
import { StudioIntent, StudioSource } from "../types/studio-source";
import { ContinueWorkingRow } from "./continue-working-row";
import { StudioComposer } from "./studio-composer/studio-composer";
import { StudioIntentGrid } from "./studio-intent-grid";
import { StudioWelcome } from "./studio-welcome";

export interface StudioIdleContentProps {
  selectedProjectId: string | null;
  projects: StudioProjectOption[];
  onSelectProject: (projectId: string) => void;
  selectedIntent: StudioIntent;
  onSelectIntent: (intent: StudioIntent) => void;
  recentTasks: StudioTask[];
  onReopenTask: (taskId: string) => void;
}

export function StudioIdleContent({
  selectedProjectId,
  projects,
  onSelectProject,
  selectedIntent,
  onSelectIntent,
  recentTasks,
  onReopenTask,
}: StudioIdleContentProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        gap: "24px",
        paddingTop: "24px",
        marginInline: "auto",
        boxSizing: "border-box",
      }}
    >
      {/* 1. Welcome Context */}
      <StudioWelcome
        selectedProjectId={selectedProjectId}
        projects={projects}
        onSelectProject={onSelectProject}
      />

      {/* 2. Primary Intent Cards */}
      <StudioIntentGrid
        selectedIntent={selectedIntent}
        onSelectIntent={onSelectIntent}
      />

      {/* 3. Continue Working (only rendered if recent draft exists) */}
      <ContinueWorkingRow
        tasks={recentTasks}
        onReopenTask={onReopenTask}
      />
    </div>
  );
}

// Retain alias export for backwards compatibility
export { StudioIdleContent as StudioIdleView };
