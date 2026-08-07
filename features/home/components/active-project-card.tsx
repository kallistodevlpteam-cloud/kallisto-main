"use client";

import React from "react";
import Link from "next/link";
import { ActiveProjectItem, ProjectHealth } from "@/types/domain/home";
import styles from "../home-workspace.module.css";

export interface ActiveProjectCardProps {
  project: ActiveProjectItem;
  index?: number;
}

export function resolveHealthToken(health: ProjectHealth): {
  key: string;
  label: string;
  chipClass: string;
  progressFillClass: string;
} {
  switch (health) {
    case "on_track":
    case "healthy":
      return {
        key: "on_track",
        label: "On track",
        chipClass: styles.healthChipOnTrack,
        progressFillClass: styles.progressFillOnTrack,
      };
    case "attention":
    case "watch":
      return {
        key: "attention",
        label: "Attention",
        chipClass: styles.healthChipAttention,
        progressFillClass: styles.progressFillAttention,
      };
    case "delayed":
    case "at-risk":
      return {
        key: "delayed",
        label: "Delayed",
        chipClass: styles.healthChipDelayed,
        progressFillClass: styles.progressFillDelayed,
      };
    case "blocked":
      return {
        key: "blocked",
        label: "Blocked",
        chipClass: styles.healthChipBlocked,
        progressFillClass: styles.progressFillBlocked,
      };
    case "planned":
      return {
        key: "planned",
        label: "Planned",
        chipClass: styles.healthChipPlanned,
        progressFillClass: styles.progressFillPlanned,
      };
    case "completed":
      return {
        key: "completed",
        label: "Completed",
        chipClass: styles.healthChipCompleted,
        progressFillClass: styles.progressFillCompleted,
      };
    default:
      return {
        key: "on_track",
        label: "On track",
        chipClass: styles.healthChipOnTrack,
        progressFillClass: styles.progressFillOnTrack,
      };
  }
}

export function ActiveProjectCard({ project }: ActiveProjectCardProps) {
  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.min(100, Math.max(0, project.progressPercent ?? 0));

  // Determine city (use explicit city property or strip street address from location)
  const city =
    project.city ||
    (project.location.includes(",")
      ? project.location.split(",").pop()?.trim() || project.location
      : project.location);

  // Resolve phase with fallback
  const phase = project.phase || "Planning";

  // Resolve health tokens
  const healthInfo = resolveHealthToken(project.health);

  // Destination route
  const href =
    project.destination.availability === "available"
      ? project.destination.route
      : "/projects";

  // Image source with fallback
  const imageUrl = project.thumbnailUrl || "/assets/projects/oak-house.png";

  return (
    <Link
      href={href}
      className={styles.projectCardWrapper}
      aria-label={`${project.name}, ${city}. Phase: ${phase}, Health: ${healthInfo.label}, ${clampedPercentage}% complete`}
    >
      {/* Background Image Frame */}
      <div className={styles.projectCardImageFrame}>
        <img
          src={imageUrl}
          alt={`${project.name} preview`}
          loading="lazy"
          className={styles.projectCardImage}
        />
      </div>

      {/* Restrained Gradient Overlay */}
      <div className={styles.projectCardGradientOverlay} />

      {/* Top Status Chips */}
      <div className={styles.projectCardTopChipsRow}>
        <span className={styles.projectPhaseChip}>{phase}</span>
        <span className={`${styles.projectHealthChip} ${healthInfo.chipClass}`}>
          {healthInfo.label}
        </span>
      </div>

      {/* Bottom Area (Default Info + Hover Overlay) */}
      <div className={styles.projectCardBottomArea}>
        {/* Default Persistent Title & City Row */}
        <div className={styles.projectCardDefaultRow}>
          <div className={styles.projectCardTitleCol}>
            <h3 className={styles.projectCardTitle}>{project.name}</h3>
            <span className={styles.projectCardCity}>{city}</span>
          </div>
          <span className={styles.projectCardPercentNum}>{clampedPercentage}%</span>
        </div>

        {/* Upward Sliding Operational Overlay */}
        {project.currentActivity && (
          <div className={styles.projectCardHoverContent}>
            <div className={styles.hoverRowItem}>
              <span className={styles.hoverLabelMicro}>Current activity</span>
              <p className={styles.hoverValueText}>{project.currentActivity}</p>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

