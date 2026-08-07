"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import styles from "../../projects.module.css";

interface ProjectTasksAttentionProps {
  attentionSummary: {
    overdueCount: number;
    blockedCount: number;
    awaitingClientApprovalCount: number;
  };
}

export function ProjectTasksAttention({ attentionSummary }: ProjectTasksAttentionProps) {
  const { overdueCount, blockedCount, awaitingClientApprovalCount } = attentionSummary;
  const totalNeedsAttention = overdueCount + blockedCount + awaitingClientApprovalCount;

  if (totalNeedsAttention === 0) {
    return null;
  }

  const items: string[] = [];
  if (overdueCount > 0) items.push(`${overdueCount} overdue`);
  if (blockedCount > 0) items.push(`${blockedCount} blocked`);
  if (awaitingClientApprovalCount > 0) items.push(`${awaitingClientApprovalCount} awaiting client approval`);

  return (
    <div className={`${styles.projectTasksAttention} projectTasksAttention`}>
      <div className={styles.attentionLabelGroup}>
        <AlertCircle size={14} className={styles.attentionIcon} />
        <span className={styles.attentionTitle}>Needs attention</span>
      </div>
      <span className={styles.attentionDetails}>{items.join(" · ")}</span>
    </div>
  );
}
