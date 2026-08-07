"use client";

import React, { useEffect, useRef } from "react";
import { X, CheckCircle2, Calendar, User, FileText, Link as LinkIcon, ShieldCheck, Clock } from "lucide-react";
import { ProjectScheduleActivity, ProjectSchedulePermissions } from "../../../domain/project-schedule.types";
import styles from "./activity-inspector.module.css";

interface ActivityInspectorProps {
  activity: ProjectScheduleActivity | null;
  permissions?: Partial<ProjectSchedulePermissions>;
  onClose: () => void;
  onMarkComplete?: (activityId: string) => void;
  onEditActivity?: (activityId: string) => void;
}

export function ActivityInspector({
  activity,
  permissions,
  onClose,
  onMarkComplete,
  onEditActivity,
}: ActivityInspectorProps) {
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (activity) {
      triggerRef.current = document.activeElement;
      panelRef.current?.focus();
    }
  }, [activity]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activity) {
        onClose();
        if (triggerRef.current instanceof HTMLElement) {
          triggerRef.current.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activity, onClose]);

  if (!activity) return null;

  const canEdit = permissions?.canEditActivity ?? true;
  const canComplete = permissions?.canCompleteActivity ?? true;

  return (
    <div className={styles.inspectorContainer}>
      <div className={styles.inspectorBackdrop} onClick={onClose} aria-hidden="true" />
      <aside
        ref={panelRef}
        tabIndex={-1}
        className={styles.inspectorPanel}
        role="region"
        aria-label={`Activity Inspector for ${activity.title}`}
      >
        {/* Header */}
        <div className={styles.inspectorHeader}>
          <div className={styles.titleBox}>
            <span className={styles.wbsTag}>WBS {activity.wbsCode}</span>
            <h3 className={styles.inspectorTitle}>{activity.title}</h3>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => {
              onClose();
              if (triggerRef.current instanceof HTMLElement) {
                triggerRef.current.focus();
              }
            }}
            aria-label="Close activity inspector"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.inspectorBody}>
          {/* Status & Progress */}
          <div className={styles.sectionGroup}>
            <span className={styles.sectionLabel}>Status & Progress</span>
            <div className={styles.grid2Col}>
              <div className={styles.metaItem}>
                <span className={styles.sectionLabel}>Status</span>
                <div
                  className={`${styles.statusBadge} ${
                    activity.status === "completed"
                      ? styles.statusBadgeCompleted
                      : activity.status === "in_progress"
                      ? styles.statusBadgeInProgress
                      : activity.status === "blocked"
                      ? styles.statusBadgeBlocked
                      : styles.statusBadgePending
                  }`}
                >
                  <CheckCircle2 size={13} />
                  <span>
                    {activity.status === "completed"
                      ? "Complete"
                      : activity.status === "in_progress"
                      ? "In Progress"
                      : activity.status === "blocked"
                      ? "Blocked"
                      : "Pending"}
                  </span>
                </div>
              </div>

              <div className={styles.metaItem}>
                <span className={styles.sectionLabel}>Progress</span>
                <span className={styles.metaValue}>{activity.progressPercent}%</span>
                <div className={styles.progressBarTrack}>
                  <div
                    className={styles.progressBarFill}
                    style={{ width: `${activity.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className={styles.sectionGroup}>
            <span className={styles.sectionLabel}>Dates & Schedule</span>
            <div className={styles.grid2Col}>
              <div className={styles.metaItem}>
                <span className={styles.sectionLabel}>Start Date</span>
                <span className={styles.metaValue}>
                  {activity.plannedStartDate || "Unscheduled"}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.sectionLabel}>Due Date</span>
                <span className={styles.metaValue}>
                  {activity.plannedEndDate || "Unscheduled"}
                </span>
              </div>
            </div>
            {activity.baselineEndDate && (
              <div className={styles.metaItem}>
                <span className={styles.sectionLabel}>Approved Baseline End</span>
                <span className={styles.metaValue}>{activity.baselineEndDate}</span>
              </div>
            )}
          </div>

          {/* Assignee & Approval */}
          <div className={styles.sectionGroup}>
            <span className={styles.sectionLabel}>Owner & Governance</span>
            <div className={styles.grid2Col}>
              <div className={styles.metaItem}>
                <span className={styles.sectionLabel}>Responsible Owner</span>
                <span className={styles.metaValue}>{activity.assigneeName || "Unassigned"}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.sectionLabel}>Approval Status</span>
                <span className={styles.metaValue}>
                  {activity.approvalStatus === "approved"
                    ? "Approved"
                    : activity.approvalStatus === "pending"
                    ? "Pending Review"
                    : activity.approvalStatus === "rejected"
                    ? "Rejected"
                    : "Not Required"}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {activity.description && (
            <div className={styles.sectionGroup}>
              <span className={styles.sectionLabel}>Description</span>
              <p className={styles.metaValue}>{activity.description}</p>
            </div>
          )}

          {/* Dependencies */}
          {activity.dependencies && activity.dependencies.length > 0 && (
            <div className={styles.sectionGroup}>
              <span className={styles.sectionLabel}>Predecessor Dependencies</span>
              {activity.dependencies.map((dep, idx) => (
                <div key={idx} className={styles.metaItem}>
                  <span className={styles.metaValue}>
                    Predecessor: {dep.predecessorActivityId} ({dep.type})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.inspectorFooter}>
          {canComplete && activity.status !== "completed" && (
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => onMarkComplete?.(activity.id)}
            >
              <CheckCircle2 size={16} />
              <span>Mark Complete</span>
            </button>
          )}
          {canEdit && (
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => onEditActivity?.(activity.id)}
            >
              Edit Activity
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
