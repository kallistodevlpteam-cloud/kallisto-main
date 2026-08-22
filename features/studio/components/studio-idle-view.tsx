"use client";

import React from "react";
import { ArrowRight, Zap } from "lucide-react";
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
  onSelectPrompt = () => {},
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
      />

      {/* Layer 2: Action-Oriented Pathways */}
      <StudioIntentGrid
        selectedIntent={selectedIntent}
        onSelectIntent={onSelectIntent}
      />

      {/* Recommended Next Action Card */}
      <div className={styles.nextActionCard}>
        <div className={styles.nextActionLeft}>
          <div className={styles.nextActionIconWrap}>
            <Zap size={16} aria-hidden="true" />
          </div>
          <div className={styles.nextActionMeta}>
            <span className={styles.nextActionBadge}>Recommended Next Action</span>
            <h3 className={styles.nextActionTitle}>
              Complete the preliminary estimate for {projectName}
            </h3>
            <p className={styles.nextActionDescription}>
              Odin can synthesize the structural BOQ, living room material specs, and Kerala civil labour rates into an authoritative estimate.
            </p>
          </div>
        </div>

        <button
          type="button"
          className={styles.nextActionBtn}
          onClick={() =>
            onSelectPrompt(
              `Complete the preliminary estimate for ${projectName} synthesizing the BOQ, material specs and current civil labour rates.`
            )
          }
          aria-label={`Complete the preliminary estimate for ${projectName}`}
        >
          <span>Complete estimate</span>
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

// Retain alias export for backwards compatibility
export { StudioIdleContent as StudioIdleView };
