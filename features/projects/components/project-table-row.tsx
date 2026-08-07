import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { ProjectListItem, ProjectStatus } from "../types/project.types";
import { ProjectDueLabel } from "./project-due-label";
import { ProjectStatusBadge } from "./project-status-badge";
import styles from "../projects.module.css";

interface ProjectTableRowProps {
  project: ProjectListItem;
  onUpdateStatus?: (projectId: string, newStatus: ProjectStatus, reason?: string) => void;
  onOpenReopenModal?: (project: ProjectListItem) => void;
}

export function ProjectTableRow({
  project,
  onUpdateStatus,
  onOpenReopenModal,
}: ProjectTableRowProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleRowClick = () => {
    router.push(`/projects/${project.id}/overview`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push(`/projects/${project.id}/overview`);
    }
  };

  return (
    <div
      className={styles.tableRow}
      tabIndex={0}
      role="link"
      aria-label={`Project ${project.name}, client ${project.clientDisplayName}`}
      onClick={handleRowClick}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.colProject}>
        <h4 className={styles.projectName}>{project.name}</h4>
        <span className={styles.clientSubText}>
          {project.clientDisplayName} · {project.code}
        </span>
      </div>

      <div className={styles.colPhase}>
        <span className={styles.phaseLabel}>{project.phase}</span>
        {project.phaseProgress && (
          <span className={styles.phaseProgress}>{project.phaseProgress}</span>
        )}
      </div>

      <div className={styles.colAction}>
        {project.nextAction ? (
          <>
            <p className={styles.actionTitle}>{project.nextAction.title}</p>
            <span className={styles.actionContextBadge}>{project.nextAction.context}</span>
          </>
        ) : (
          <span className={styles.noActionText}>No immediate action required</span>
        )}
      </div>

      <div className={styles.colDue}>
        {project.nextAction ? (
          <ProjectDueLabel
            dueState={project.nextAction.dueState}
            dueLabel={project.nextAction.dueLabel}
            isBlocked={project.nextAction.isBlocked}
          />
        ) : (
          <span className={styles.dueNeutral}>—</span>
        )}
      </div>

      <div className={styles.colOwner}>
        <div className={styles.ownerAvatar} title={project.owner.name}>
          {project.owner.initials}
        </div>
        <span className={styles.ownerName}>{project.owner.name}</span>
      </div>

      <div className={styles.colStatus}>
        <ProjectStatusBadge status={project.status} />
      </div>

      <div className={styles.colMenu} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.threeDotBtn}
          aria-label={`Actions for ${project.name}`}
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu((prev) => !prev);
          }}
        >
          <MoreHorizontal size={16} />
        </button>

        {showMenu && (
          <div className={styles.actionDropdown}>
            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                router.push(`/projects/${project.id}/overview`);
              }}
            >
              Open project
            </button>

            {project.allowedActions.includes("edit") && (
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  alert(`Edit details for ${project.name}`);
                }}
              >
                Edit project details
              </button>
            )}

            {project.allowedActions.includes("change_owner") && (
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  alert(`Change owner for ${project.name}`);
                }}
              >
                Change owner
              </button>
            )}

            {project.allowedActions.includes("put_on_hold") && (
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  if (onUpdateStatus) onUpdateStatus(project.id, "ON_HOLD");
                }}
              >
                Put on hold
              </button>
            )}

            {project.allowedActions.includes("mark_complete") && (
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  if (onUpdateStatus) onUpdateStatus(project.id, "COMPLETED");
                }}
              >
                Mark complete
              </button>
            )}

            {project.allowedActions.includes("reopen") && (
              <button
                type="button"
                className={styles.reopenActionBtn}
                onClick={() => {
                  setShowMenu(false);
                  if (onOpenReopenModal) onOpenReopenModal(project);
                }}
              >
                Reopen project...
              </button>
            )}

            {project.allowedActions.includes("archive") && (
              <button
                type="button"
                className={styles.dangerActionBtn}
                onClick={() => {
                  setShowMenu(false);
                  if (onUpdateStatus) onUpdateStatus(project.id, "ARCHIVED");
                }}
              >
                Archive project
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
