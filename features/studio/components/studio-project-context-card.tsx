"use client";

import React from "react";
import {
  DocumentsDuotoneIcon,
  DrawingsDuotoneIcon,
  HistoryDuotoneIcon,
  MapPinDuotoneIcon,
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
  onSelectPrompt?: (prompt: string) => void;
}

export function StudioProjectContextCard({
  selectedProjectId,
  projects,
  onSelectProject,
  onSelectPrompt = () => {},
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

  const handlePillClick = (promptText: string) => {
    onSelectPrompt(promptText);
  };

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

      {/* Connected Project Resources Strip */}
      <div className={styles.odinAccessStrip} aria-label="Connected project data">
        <div className={styles.odinAccessPills}>
          <div
            className={styles.odinAccessPill}
            role="button"
            tabIndex={0}
            onClick={() => handlePillClick(`Review and inspect architectural drawings (Rev 04) for ${selectedProject.name}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePillClick(`Review and inspect architectural drawings (Rev 04) for ${selectedProject.name}`);
              }
            }}
            aria-label="Inspect drawings revision 04"
          >
            <DrawingsDuotoneIcon size={14} style={{ color: "#2563eb" }} aria-hidden="true" />
            <span>Drawings (Rev 04)</span>
          </div>

          <div
            className={styles.odinAccessPill}
            role="button"
            tabIndex={0}
            onClick={() => handlePillClick(`Explore and summarize connected project documents (${fileCount} files) for ${selectedProject.name}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePillClick(`Explore and summarize connected project documents (${fileCount} files) for ${selectedProject.name}`);
              }
            }}
            aria-label={`View ${fileCount} connected project documents`}
          >
            <DocumentsDuotoneIcon size={14} style={{ color: "#7c3aed" }} aria-hidden="true" />
            <span>Documents ({fileCount})</span>
          </div>

          <div
            className={styles.odinAccessPill}
            role="button"
            tabIndex={0}
            onClick={() => handlePillClick(`Open and audit the preliminary BOQ breakdown for ${selectedProject.name}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePillClick(`Open and audit the preliminary BOQ breakdown for ${selectedProject.name}`);
              }
            }}
            aria-label="Open preliminary bill of quantities"
          >
            <SpreadsheetDuotoneIcon size={14} style={{ color: "#16a34a" }} aria-hidden="true" />
            <span>BOQ (Preliminary)</span>
          </div>

          <div
            className={styles.odinAccessPill}
            role="button"
            tabIndex={0}
            onClick={() => handlePillClick(`Show status and next actions for all ${taskCount} active project tasks in ${selectedProject.name}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePillClick(`Show status and next actions for all ${taskCount} active project tasks in ${selectedProject.name}`);
              }
            }}
            aria-label={`Show ${taskCount} active project tasks`}
          >
            <ReviewDuotoneIcon size={14} style={{ color: "#ea580c" }} aria-hidden="true" />
            <span>Tasks ({taskCount})</span>
          </div>

          <div
            className={styles.odinAccessPill}
            role="button"
            tabIndex={0}
            onClick={() => handlePillClick(`Show complete project timeline and revision history for ${selectedProject.name}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePillClick(`Show complete project timeline and revision history for ${selectedProject.name}`);
              }
            }}
            aria-label="View project history and timeline"
          >
            <HistoryDuotoneIcon size={14} style={{ color: "#f59e0b" }} aria-hidden="true" />
            <span>Project history</span>
          </div>

          <div
            className={styles.odinAccessPill}
            role="button"
            tabIndex={0}
            onClick={() => handlePillClick(`Review the field site feasibility report and site constraints for ${selectedProject.name}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePillClick(`Review the field site feasibility report and site constraints for ${selectedProject.name}`);
              }
            }}
            aria-label="Review site feasibility report"
          >
            <MapPinDuotoneIcon size={14} style={{ color: "#e11d48" }} aria-hidden="true" />
            <span>Site Feasibility</span>
          </div>
        </div>
      </div>
    </div>
  );
}
