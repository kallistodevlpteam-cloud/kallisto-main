"use client";

import React from "react";
import { AlertCircle, AlertTriangle, UserX, ShieldAlert, ArrowRight } from "lucide-react";
import styles from "../calendar-workspace-page.module.css";

interface TodayAttentionStripProps {
  overdueApprovalsCount: number;
  scheduleConflictsCount: number;
  unassignedActivitiesCount: number;
  blockedActivitiesCount: number;
  onViewAllAttention?: () => void;
}

export function TodayAttentionStrip({
  overdueApprovalsCount,
  scheduleConflictsCount,
  unassignedActivitiesCount,
  blockedActivitiesCount,
  onViewAllAttention,
}: TodayAttentionStripProps) {
  return (
    <div className={styles.attentionStrip} role="region" aria-label="Daily Operational Needs Attention">
      <div className={styles.attentionStripLeft}>
        <span className={styles.attentionBadge}>Needs Attention</span>

        <div className={styles.attentionItem}>
          <AlertCircle size={14} className={styles.attentionIconRed} />
          <span className={styles.attentionText}>
            <strong>{overdueApprovalsCount}</strong> Overdue approvals
          </span>
        </div>

        <div className={styles.attentionDivider} />

        <div className={styles.attentionItem}>
          <AlertTriangle size={14} className={styles.attentionIconOrange} />
          <span className={styles.attentionText}>
            <strong>{scheduleConflictsCount}</strong> Schedule conflict
          </span>
        </div>

        <div className={styles.attentionDivider} />

        <div className={styles.attentionItem}>
          <UserX size={14} className={styles.attentionIconBlue} />
          <span className={styles.attentionText}>
            <strong>{unassignedActivitiesCount}</strong> Unassigned activities
          </span>
        </div>

        <div className={styles.attentionDivider} />

        <div className={styles.attentionItem}>
          <ShieldAlert size={14} className={styles.attentionIconPurple} />
          <span className={styles.attentionText}>
            <strong>{blockedActivitiesCount}</strong> Blocked task
          </span>
        </div>
      </div>

      {onViewAllAttention && (
        <button
          type="button"
          className={styles.attentionViewAllBtn}
          onClick={onViewAllAttention}
        >
          <span>View all</span>
          <ArrowRight size={13} />
        </button>
      )}
    </div>
  );
}
