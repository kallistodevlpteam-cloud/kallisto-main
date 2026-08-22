"use client";

import {
  DocumentsDuotoneIcon,
  ReviewDuotoneIcon,
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
              <span className={styles.scopeMetaItem}>
                <DocumentsDuotoneIcon size={13} style={{ color: "#0f172a" }} aria-hidden="true" />
                <span>{fileCount} files</span>
              </span>
              <span className={styles.scopeMetaDot}>·</span>
              <span className={styles.scopeMetaItem}>
                <ReviewDuotoneIcon size={13} style={{ color: "#0f172a" }} aria-hidden="true" />
                <span>{taskCount} active tasks</span>
              </span>
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
    </div>
  );
}
