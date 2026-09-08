"use client";

import React from "react";
import { OdinDuotoneIcon } from "@/components/layout/sidebar-icons";
import { AssignmentDeployment } from "../../types/assignment-domain";
import styles from "./odin-deployment-brief.module.css";

export interface OdinDeploymentBriefProps {
  assignment: AssignmentDeployment;
  className?: string;
  subtitle?: string;
}

export function getAssignmentOdinBrief(assignment: AssignmentDeployment): string {
  if (assignment.odinBrief) return assignment.odinBrief;

  if (assignment.status === "completed") {
    return `${assignment.clientName} has completed the ${assignment.totalDays}-shift deployment for ${assignment.projectName} in ${assignment.location}. All ${assignment.totalWorkersAssigned} deployed crew members (${assignment.tradesBreakdown}) delivered site deliverables under Site Supervisor ${assignment.supervisor.name}, achieving 100% contract fulfillment and approved client sign-off.`;
  }

  const attendanceDetails = assignment.attendance
    ? `${assignment.attendance.present} workers confirmed present on site${
        assignment.attendance.unmarked > 0 || assignment.attendance.absent > 0
          ? `, with ${assignment.attendance.unmarked} unmarked and ${assignment.attendance.absent} reported absent`
          : " with full attendance reported"
      }`
    : `${assignment.totalWorkersAssigned} crew members assigned`;

  const healthRecommendation =
    assignment.health === "at_risk"
      ? "Workforce shortages require immediate supervisor intervention to safeguard milestone delivery and avoid deployment penalties."
      : assignment.health === "attention_required"
      ? "Supervisor check-in is recommended to verify unmarked personnel, reconcile attendance records, and ensure site safety compliance."
      : "Site operations are progressing on schedule with stable crew deployment and active field supervision.";

  return `${assignment.clientName} has deployed a ${assignment.totalWorkersAssigned}-member workforce (${assignment.tradesBreakdown}) under Site Supervisor ${assignment.supervisor.name} for ${assignment.projectName}, ${assignment.location}. Currently on Day ${assignment.currentDay} of ${assignment.totalDays} with ${attendanceDetails}. ${healthRecommendation}`;
}

export function OdinDeploymentBrief({
  assignment,
  className,
  subtitle = "AI-synthesized requirement assessment",
}: OdinDeploymentBriefProps) {
  const briefText = getAssignmentOdinBrief(assignment);

  return (
    <div
      className={`${styles.briefCard}${className ? ` ${className}` : ""}`}
      aria-label="ODIN Project Brief"
    >
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <div className={styles.sidebarThemedIconBox}>
            <OdinDuotoneIcon size={20} />
          </div>
          <div className={styles.titleStack}>
            <h3 className={styles.title}>ODIN PROJECT BRIEF</h3>
            <span className={styles.subtitle}>{subtitle}</span>
          </div>
        </div>
      </div>

      <p className={styles.summaryText}>{briefText}</p>
    </div>
  );
}
