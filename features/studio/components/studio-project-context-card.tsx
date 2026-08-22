"use client";

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
  onSelectPrompt?: (promptText: string) => void;
}

export function StudioProjectContextCard({
  selectedProjectId,
  projects,
  onSelectProject,
  onSelectPrompt,
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
    if (onSelectPrompt) {
      onSelectPrompt(promptText);
    }
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
            onClick={() => handlePillClick(`Review and analyse drawing revision Rev 04 for ${selectedProject.name}.`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePillClick(`Review and analyse drawing revision Rev 04 for ${selectedProject.name}.`);
              }
            }}
          >
            <DrawingsDuotoneIcon size={14} style={{ color: "#2563eb" }} aria-hidden="true" />
            <span>Drawings (Rev 04)</span>
          </div>

          <div
            className={styles.odinAccessPill}
            role="button"
            tabIndex={0}
            onClick={() => handlePillClick(`Summarise the ${fileCount} uploaded documents for ${selectedProject.name}.`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePillClick(`Summarise the ${fileCount} uploaded documents for ${selectedProject.name}.`);
              }
            }}
          >
            <DocumentsDuotoneIcon size={14} style={{ color: "#7c3aed" }} aria-hidden="true" />
            <span>Documents ({fileCount})</span>
          </div>

          <div
            className={styles.odinAccessPill}
            role="button"
            tabIndex={0}
            onClick={() => handlePillClick(`Check and validate the preliminary BOQ for ${selectedProject.name}.`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePillClick(`Check and validate the preliminary BOQ for ${selectedProject.name}.`);
              }
            }}
          >
            <SpreadsheetDuotoneIcon size={14} style={{ color: "#16a34a" }} aria-hidden="true" />
            <span>BOQ (Preliminary)</span>
          </div>

          <div
            className={styles.odinAccessPill}
            role="button"
            tabIndex={0}
            onClick={() => handlePillClick(`List and prioritize the ${taskCount} active tasks for ${selectedProject.name}.`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePillClick(`List and prioritize the ${taskCount} active tasks for ${selectedProject.name}.`);
              }
            }}
          >
            <ReviewDuotoneIcon size={14} style={{ color: "#ea580c" }} aria-hidden="true" />
            <span>Tasks ({taskCount})</span>
          </div>

          <div
            className={styles.odinAccessPill}
            role="button"
            tabIndex={0}
            onClick={() => handlePillClick(`Provide a timeline summary of project history and recent decisions for ${selectedProject.name}.`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePillClick(`Provide a timeline summary of project history and recent decisions for ${selectedProject.name}.`);
              }
            }}
          >
            <HistoryDuotoneIcon size={14} style={{ color: "#f59e0b" }} aria-hidden="true" />
            <span>Project history</span>
          </div>

          <div
            className={styles.odinAccessPill}
            role="button"
            tabIndex={0}
            onClick={() => handlePillClick(`Show me the site feasibility report and field findings for ${selectedProject.name}.`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePillClick(`Show me the site feasibility report and field findings for ${selectedProject.name}.`);
              }
            }}
          >
            <MapPinDuotoneIcon size={14} style={{ color: "#e11d48" }} aria-hidden="true" />
            <span>Site Feasibility</span>
          </div>
        </div>
      </div>
    </div>
  );
}
