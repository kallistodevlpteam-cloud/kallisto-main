"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Building2 } from "lucide-react";
import type { Deployment, DeploymentStatus } from "../types/hands.types";
import styles from "./hands-overview.module.css";

interface DeploymentProjectCardProps {
  deployment: Deployment;
  onSelect: (deployment: Deployment) => void;
}

function resolveStatusToken(status: DeploymentStatus): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case "Active":
      return {
        label: "On track",
        badgeClass: styles.deployHealthOnTrack,
      };
    case "Needs attention":
      return {
        label: "Needs attention",
        badgeClass: styles.deployHealthAttention,
      };
    case "Awaiting check-in":
      return {
        label: "Awaiting check-in",
        badgeClass: styles.deployHealthAwaiting,
      };
    default:
      return {
        label: "Active",
        badgeClass: styles.deployHealthOnTrack,
      };
  }
}

export function DeploymentProjectCard({
  deployment,
  onSelect,
}: DeploymentProjectCardProps) {
  const [imageError, setImageError] = useState(false);

  const statusInfo = resolveStatusToken(deployment.status);
  const progressPct =
    deployment.overallProgress !== undefined
      ? deployment.overallProgress
      : deployment.status === "Active"
        ? 80
        : deployment.status === "Needs attention"
          ? 70
          : 45;

  const category = deployment.category || "Construction & Structural";
  const dueLabel = deployment.dueLabel || "Active shift";
  const coverImage = deployment.coverImage || "/assets/projectbg.webp";

  const activeWorkersCount =
    deployment.activeWorkers !== undefined
      ? deployment.activeWorkers
      : deployment.attendance.state === "recorded"
        ? (deployment.attendance.present ?? 0)
        : (deployment.attendance.total ?? 0);

  const onLeaveCount =
    deployment.onLeaveWorkers !== undefined
      ? deployment.onLeaveWorkers
      : deployment.attendance.state === "recorded" &&
          deployment.attendance.total !== undefined &&
          deployment.attendance.present !== undefined
        ? Math.max(0, deployment.attendance.total - deployment.attendance.present)
        : 0;

  const workerTypes = deployment.workerTypes || deployment.workforce;

  return (
    <div
      role="button"
      tabIndex={0}
      className={styles.deploymentProjectCard}
      onClick={() => onSelect(deployment)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(deployment);
        }
      }}
      aria-label={`Open deployment for ${deployment.projectName}`}
    >
      {/* ── 1. Top Cover Image Container with Overlays ── */}
      <div className={styles.deployCardMedia}>
        <div className={styles.deployCardGradientOverlay} />

        {/* Bottom badges inside photo frame */}
        <div className={styles.deployCardOverlayRow}>
          <span className={styles.deployCategoryPill}>{category}</span>
          <span className={`${styles.deployStatusBadge} ${statusInfo.badgeClass}`}>
            {statusInfo.label}
          </span>
        </div>

        {coverImage && !imageError ? (
          <div className={styles.deployImageWrap}>
            <Image
              src={coverImage}
              alt={`${deployment.projectName} cover`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={styles.deployImage}
              onError={() => setImageError(true)}
              unoptimized
            />
          </div>
        ) : (
          <div className={styles.deployMediaPlaceholder}>
            <Building2 size={36} aria-hidden="true" />
          </div>
        )}
      </div>

      {/* ── 2. Information Section ── */}
      <div className={styles.deployCardContent}>
        {/* Row 1: Project Title & Overall Progress % */}
        <div className={styles.deployTitleRow}>
          <h3 className={styles.deployProjectTitle} title={deployment.projectName}>
            {deployment.projectName}
          </h3>
          <span className={styles.deployProgressPercent}>{progressPct}%</span>
        </div>

        {/* Row 2: Location & Due Date / Shift Tag */}
        <div className={styles.deploySubtitleRow}>
          <span className={styles.deployLocation}>{deployment.location}</span>
          {dueLabel && (
            <span
              className={`${styles.deployDueChip} ${
                deployment.status === "Needs attention"
                  ? styles.dueChipAttention
                  : deployment.status === "Awaiting check-in"
                    ? styles.dueChipAwaiting
                    : styles.dueChipOnTrack
              }`}
            >
              {dueLabel}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className={styles.deployCardDivider} />

        {/* Row 3: Active Workers in Project & On Leave Badges */}
        <div className={styles.deployWorkersStatsRow}>
          <span className={styles.deployActiveWorkersPill}>
            <span className={styles.deployActiveDot} />
            <strong>{activeWorkersCount}</strong> Active
          </span>
          <span
            className={`${styles.deployLeavePill} ${
              onLeaveCount > 0
                ? styles.deployLeavePillWarning
                : styles.deployLeavePillNeutral
            }`}
          >
            <strong>{onLeaveCount}</strong> on leave
          </span>
        </div>

        {/* Row 4: Worker Type / Trade Breakdown */}
        <div className={styles.deployWorkerTypeRow}>
          <span className={styles.deployWorkerTypeLabel}>Worker type :</span>
          <span className={styles.deployWorkerTypeVal} title={workerTypes}>
            {workerTypes}
          </span>
        </div>

        {/* Footer info: Supervisor & Daily Cost */}
        <div className={styles.deployCardFooterRow}>
          <span className={styles.deploySupervisorText}>
            Supervisor: <strong>{deployment.supervisor}</strong>
          </span>
          <span className={styles.deployCostTag}>
            ₹{deployment.dailyCost.toLocaleString("en-IN")}/d
          </span>
        </div>
      </div>
    </div>
  );
}
