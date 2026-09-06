"use client";

import React from "react";
import { StudioProjectOption, StudioTask } from "@/types/domain/studio";
import { StudioIntent } from "../types/studio-source";
import { StudioProjectContextCard } from "./studio-project-context-card";
import { StudioIntentGrid } from "./studio-intent-grid";
import { StudioWelcome } from "./studio-welcome";
import { ContinueWorkingRow } from "./continue-working-row";
import styles from "./studio-chat-canvas.module.css";

export interface StudioIdleContentProps {
  selectedProjectId: string | null;
  projects: StudioProjectOption[];
  onSelectProject: (projectId: string) => void;
  selectedIntent: StudioIntent;
  onSelectIntent: (intent: StudioIntent) => void;
  recentTasks?: StudioTask[];
  onReopenTask?: (taskId: string) => void;
  onSelectPrompt?: (promptText: string) => void;
}

export function StudioIdleContent({
  selectedProjectId,
  projects,
  onSelectProject,
  selectedIntent,
  onSelectIntent,
  recentTasks,
  onReopenTask,
  onSelectPrompt,
}: StudioIdleContentProps) {
  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const projectName = selectedProject?.name || "Luxury Villa Horizon";

  return (
    <div className={styles.studioIdleContainer}>
      {/* 1. Welcome Context */}
      <StudioWelcome
        selectedProjectId={selectedProjectId}
        projects={projects}
        onSelectProject={onSelectProject}
      />

      {/* Layer 1: Project Context & Knowledge Foundation */}
      <StudioProjectContextCard
        selectedProjectId={selectedProjectId}
        projects={projects}
        onSelectProject={onSelectProject}
        onSelectPrompt={onSelectPrompt}
      />

      {/* Layer 2: Action-Oriented Pathways */}
      <StudioIntentGrid
        selectedIntent={selectedIntent}
        onSelectIntent={onSelectIntent}
        onSelectPrompt={onSelectPrompt}
        projectName={projectName}
      />

      {/* 3. Continue Working (rendered if tasks exist) */}
      {recentTasks && onReopenTask && (
        <ContinueWorkingRow
          tasks={recentTasks}
          onReopenTask={onReopenTask}
        />
      )}
    </div>
  );
}

// Retain alias export for backwards compatibility
export { StudioIdleContent as StudioIdleView };

