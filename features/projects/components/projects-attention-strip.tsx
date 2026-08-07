import React from "react";
import { AlertCircle, AlertTriangle, ChevronRight } from "lucide-react";
import { ProjectFilterParams } from "../types/project.types";
import styles from "../projects.module.css";

interface ProjectsAttentionStripProps {
  counts?: {
    overdueActions: number;
    blockedProjects: number;
    pendingClientDecisions: number;
  };
  onApplyAttentionFilter: (filter: NonNullable<ProjectFilterParams["attention"]>[number]) => void;
}

export function ProjectsAttentionStrip({
  counts,
  onApplyAttentionFilter,
}: ProjectsAttentionStripProps) {
  if (
    !counts ||
    (counts.overdueActions === 0 &&
      counts.blockedProjects === 0 &&
      counts.pendingClientDecisions === 0)
  ) {
    return null;
  }

  return (
    <div className={styles.attentionStrip} role="region" aria-label="Needs attention summary">
      <div className={styles.attentionLabel}>
        <AlertTriangle size={15} className={styles.attentionIcon} />
        <span>Needs attention</span>
      </div>

      <div className={styles.attentionItems}>
        {counts.overdueActions > 0 && (
          <button
            type="button"
            className={`${styles.attentionPill} ${styles.danger}`}
            onClick={() => onApplyAttentionFilter("overdue")}
          >
            <AlertCircle size={13} />
            <span>{counts.overdueActions} overdue action{counts.overdueActions > 1 ? "s" : ""}</span>
          </button>
        )}

        {counts.blockedProjects > 0 && (
          <button
            type="button"
            className={`${styles.attentionPill} ${styles.warning}`}
            onClick={() => onApplyAttentionFilter("blocked")}
          >
            <span>{counts.blockedProjects} blocked project{counts.blockedProjects > 1 ? "s" : ""}</span>
          </button>
        )}

        {counts.pendingClientDecisions > 0 && (
          <button
            type="button"
            className={`${styles.attentionPill} ${styles.info}`}
            onClick={() => onApplyAttentionFilter("awaiting_client")}
          >
            <span>{counts.pendingClientDecisions} client decision{counts.pendingClientDecisions > 1 ? "s" : ""} pending</span>
          </button>
        )}
      </div>

      <button
        type="button"
        className={styles.viewAllBtn}
        onClick={() => onApplyAttentionFilter("overdue")}
      >
        <span>View all</span>
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
