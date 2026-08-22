"use client";

import React from "react";
import { StudioProjectOption, StudioTask } from "@/types/domain/studio";
import { StudioIntent } from "../types/studio-source";
import { StudioProjectContextCard } from "./studio-project-context-card";
import { StudioIntentGrid } from "./studio-intent-grid";
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
  onSelectPrompt,
}: StudioIdleContentProps) {
  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const projectName = selectedProject?.name || "Luxury Villa Horizon";

  return (
    <div className={styles.studioIdleContainer}>
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
    </div>
  );
}

// Retain alias export for backwards compatibility
export { StudioIdleContent as StudioIdleView };
