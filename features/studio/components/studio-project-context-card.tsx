"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import {
  DocumentsDuotoneIcon,
  DrawingsDuotoneIcon,
  HistoryDuotoneIcon,
  MapPinDuotoneIcon,
  OdinDuotoneIcon,
  ReviewDuotoneIcon,
  SpreadsheetDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { StudioProjectOption } from "@/types/domain/studio";
import { ProjectSelector } from "./project-selector";
import styles from "./studio-chat-canvas.module.css";

export interface StudioProjectContextCardProps {
  selectedProjectId: string | null;
  projects: StudioProjectOption[];
  onSelectProject: (projectId: string) => void;
}

export function StudioProjectContextCard({
  selectedProjectId,
  projects,
  onSelectProject,
}: StudioProjectContextCardProps) {
  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0] || {
    id: "proj-001",
    name: "Luxury Villa Horizon",
    code: "KL-COK-2026",
    projectType: "Residential Villa",
    phase: "Design Development",
    status: "active",
  };

  // Derive contextual metadata based on selected project
  const subScope =
    selectedProject.name.includes("Horizon")
      ? "Living Space & Terrace"
      : selectedProject.name.includes("Nila")
      ? "Interior Fit-Out & Joinery"
      : "Main Architectural & Structural Works";

  const fileCount = selectedProject.name.includes("Horizon") ? 12 : 8;
  const taskCount = selectedProject.name.includes("Horizon") ? 4 : 3;

  return (
    <div className={styles.projectContextCard} aria-label="Active project context">
      {/* Top Banner: Project Title & Scope */}
      <div className={styles.projectContextTopRow}>
        <div className={styles.projectContextMainMeta}>
          <div className={styles.projectBadgeRow}>
            <span className={styles.projectCodeBadge}>{selectedProject.code || "PRJ-2026"}</span>
            <span className={styles.projectPhaseBadge}>
              <span className={styles.projectPhaseDot} />
              {selectedProject.phase || "Design Development"}
            </span>
            <span className={styles.projectScopeMeta}>
              {fileCount} files · {taskCount} active tasks
            </span>
          </div>

          <h1 className={styles.projectTitleHeading}>
            <ProjectSelector
              value={selectedProjectId}
              projects={projects}
              onChange={onSelectProject}
              variant="inline-link"
            />
          </h1>
          <p className={styles.projectSubScopeSubtitle}>{subScope}</p>
        </div>
      </div>

      {/* Subtle "Odin has access to..." Connection Strip */}
      <div className={styles.odinAccessStrip} aria-label="Odin connected project data">
        <div className={styles.odinAccessLabel}>
          <OdinDuotoneIcon size={14} className={styles.odinAccessIcon} aria-hidden="true" />
          <span>Odin has access to:</span>
        </div>

        <div className={styles.odinAccessPills}>
          <div className={styles.odinAccessPill}>
            <DrawingsDuotoneIcon size={14} style={{ color: "#2563eb" }} aria-hidden="true" />
            <span>Drawings (Rev 04)</span>
          </div>
          <div className={styles.odinAccessPill}>
            <DocumentsDuotoneIcon size={14} style={{ color: "#7c3aed" }} aria-hidden="true" />
            <span>Documents ({fileCount})</span>
          </div>
          <div className={styles.odinAccessPill}>
            <SpreadsheetDuotoneIcon size={14} style={{ color: "#16a34a" }} aria-hidden="true" />
            <span>BOQ (Preliminary)</span>
          </div>
          <div className={styles.odinAccessPill}>
            <ReviewDuotoneIcon size={14} style={{ color: "#ea580c" }} aria-hidden="true" />
            <span>Tasks ({taskCount})</span>
          </div>
          <div className={styles.odinAccessPill}>
            <HistoryDuotoneIcon size={14} style={{ color: "#f59e0b" }} aria-hidden="true" />
            <span>Project history</span>
          </div>
          <div className={styles.odinAccessPill}>
            <MapPinDuotoneIcon size={14} style={{ color: "#e11d48" }} aria-hidden="true" />
            <span>Site Feasibility</span>
          </div>
        </div>
      </div>
    </div>
  );
}
