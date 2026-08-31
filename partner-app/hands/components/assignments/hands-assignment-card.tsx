"use client";

import React from "react";
import {
  Building2,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import {
  TeamDuotoneIcon,
  LocationDuotoneIcon,
  CalendarDuotoneIcon,
  AnalyticsDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { AssignmentDeployment } from "../../types/assignment-domain";
import styles from "./hands-assignments.module.css";

interface HandsAssignmentCardProps {
  assignment: AssignmentDeployment;
  isSelected?: boolean;
  onSelect: (assignment: AssignmentDeployment) => void;
  onOpenDetail: (assignment: AssignmentDeployment) => void;
}

// Generate consistent theme color by project ID (identical to Request Card)
function getProjectTheme(id: string) {
  const themes = [
    { bg: "#2563eb", color: "#ffffff", icon: Building2 },
    { bg: "#ea580c", color: "#ffffff", icon: Briefcase },
    { bg: "#e11d48", color: "#ffffff", icon: Building2 },
    { bg: "#7c3aed", color: "#ffffff", icon: Briefcase },
    { bg: "#059669", color: "#ffffff", icon: Building2 },
    { bg: "#0284c7", color: "#ffffff", icon: Briefcase },
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % themes.length;
  return themes[idx];
}

export function HandsAssignmentCard({
  assignment,
  isSelected = false,
  onSelect,
  onOpenDetail,
}: HandsAssignmentCardProps) {
  const theme = getProjectTheme(assignment.id);
  const ProjectIcon = theme.icon;

  const getHealthTag = () => {
    switch (assignment.health) {
      case "on_track":
        return {
          label: "● ON TRACK",
          boxClass: styles.healthBoxOnTrack,
          icon: CheckCircle2,
          defaultMsg: "All workers deployed and attendance reported.",
        };
      case "attention_required":
        return {
          label: "⚠ ATTENTION REQUIRED",
          boxClass: styles.healthBoxAttention,
          icon: AlertTriangle,
          defaultMsg: "Workers not marked or attendance pending.",
        };
      case "at_risk":
        return {
          label: "● AT RISK",
          boxClass: styles.healthBoxAtRisk,
          icon: AlertCircle,
          defaultMsg: "Workforce shortage affecting deployment.",
        };
    }
  };

  const healthConfig = getHealthTag();
  const HealthIcon = healthConfig.icon;

  return (
    <article
      className={`${styles.gridAssignmentCard} ${isSelected ? styles.gridAssignmentCardSelected : ""}`}
      onClick={() => {
        onSelect(assignment);
        onOpenDetail(assignment);
      }}
      tabIndex={0}
      role="button"
      aria-label={`Assignment for ${assignment.projectName}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(assignment);
          onOpenDetail(assignment);
        }
      }}
    >
      {/* 1. Header: Project Icon + Names + Timeline Day */}
      <div className={styles.cardHeaderRow}>
        <div className={styles.cardHeaderLeft}>
          <div
            className={styles.cardLogoBox}
            style={{ backgroundColor: theme.bg, color: theme.color }}
          >
            <ProjectIcon size={18} />
          </div>
          <div className={styles.cardTitleCol}>
            <h3 className={styles.cardProjectTitle} title={assignment.projectName}>
              {assignment.projectName}
            </h3>
            <span className={styles.cardClientSubtitle} title={assignment.clientName}>
              {assignment.clientName || assignment.tradesBreakdown}
            </span>
          </div>
        </div>

        {/* Timeline Day */}
        <span className={styles.timelineDayPill}>
          Day {assignment.currentDay} of {assignment.totalDays}
        </span>
      </div>

      {/* 2. Subheader Badges Row */}
      <div className={styles.cardBadgesRow}>
        <span className={styles.statusActiveBadge}>{assignment.status.toUpperCase()}</span>

        <div className={styles.cardCountPill}>
          <TeamDuotoneIcon size={13} style={{ color: "#2563eb", flexShrink: 0 }} />
          <span>{assignment.totalWorkersAssigned} Workers</span>
        </div>

        <div className={styles.siteStatusPill}>
          <span className={styles.siteStatusDot} />
          <span>{assignment.siteStatus}</span>
        </div>
      </div>

      {/* 3. Structured Key Properties List (Kallisto Duotone Theme) */}
      <div className={styles.cardPropertiesList}>
        <div className={styles.propertyRow}>
          <TeamDuotoneIcon size={15} className={styles.propertyDuotoneIcon} />
          <span className={styles.propertyValue}>
            <strong>{assignment.totalWorkersAssigned} Members</strong> ({assignment.tradesBreakdown})
          </span>
        </div>

        <div className={styles.propertyRow}>
          <CalendarDuotoneIcon size={15} className={styles.propertyDuotoneIcon} />
          <span className={styles.propertyValue}>
            <strong>{assignment.startDate} – {assignment.endDate}</strong>
          </span>
        </div>

        <div className={styles.propertyRow}>
          <LocationDuotoneIcon size={15} className={styles.propertyDuotoneIcon} />
          <span className={styles.propertyValue} title={assignment.location}>
            {assignment.location}
          </span>
        </div>

        <div className={styles.propertyRow}>
          <AnalyticsDuotoneIcon size={15} className={styles.propertyDuotoneIcon} />
          <span className={styles.propertyValue}>
            Attendance Today: <strong>{assignment.attendance.present} / {assignment.attendance.total} Present</strong>
          </span>
        </div>
      </div>

      {/* 4. Assignment Health Status Callout Box */}
      <div className={`${styles.healthBox} ${healthConfig.boxClass}`}>
        <HealthIcon size={13} className={styles.healthIcon} />
        <div className={styles.healthTexts}>
          <span className={styles.healthTag}>{healthConfig.label}</span>
          <span className={styles.healthDesc}>
            {assignment.healthMessage || healthConfig.defaultMsg}
          </span>
        </div>
      </div>

      {/* 5. Full-Width Card Action Button */}
      <button
        type="button"
        className={styles.cardActionBtn}
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetail(assignment);
        }}
        aria-label={`Open Assignment for ${assignment.projectName}`}
      >
        <span>Open Assignment</span>
        <ArrowRight size={13} />
      </button>
    </article>
  );
}
