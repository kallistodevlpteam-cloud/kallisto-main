import React from "react";
import { useRouter } from "next/navigation";
import { ProjectListItem } from "../types/project.types";
import { ProjectDueLabel } from "./project-due-label";
import { ProjectStatusBadge } from "./project-status-badge";
import styles from "../projects.module.css";

interface ProjectMobileCardProps {
  project: ProjectListItem;
}

export function ProjectMobileCard({ project }: ProjectMobileCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/projects/${project.id}/overview`);
  };

  return (
    <div
      className={styles.mobileCard}
      tabIndex={0}
      role="link"
      aria-label={`Project ${project.name}, client ${project.clientDisplayName}`}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className={styles.mobileCardHeader}>
        <div>
          <h4 className={styles.projectName}>{project.name}</h4>
          <span className={styles.clientSubText}>
            {project.clientDisplayName} · {project.code}
          </span>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>

      <div className={styles.mobileCardBody}>
        <span className={styles.phaseLabel}>{project.phase}</span>
        {project.phaseProgress && (
          <span style={{ fontSize: "12px", color: "var(--muted, #64748b)", display: "block", marginTop: "2px" }}>
            {project.phaseProgress}
          </span>
        )}
        {project.nextAction ? (
          <p className={styles.actionTitle}>{project.nextAction.title}</p>
        ) : (
          <p className={styles.noActionText}>No immediate action required</p>
        )}
      </div>

      <div className={styles.mobileCardFooter}>
        {project.nextAction ? (
          <ProjectDueLabel
            dueState={project.nextAction.dueState}
            dueLabel={project.nextAction.dueLabel}
            isBlocked={project.nextAction.isBlocked}
          />
        ) : (
          <span className={styles.dueNeutral}>—</span>
        )}
        <span className={styles.mobileOwnerName}>· {project.owner.name}</span>
      </div>
    </div>
  );
}
