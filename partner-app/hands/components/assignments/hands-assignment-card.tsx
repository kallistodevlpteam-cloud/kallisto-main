"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import {
  ProjectsDuotoneIcon,
  HandsDuotoneIcon,
  TeamDuotoneIcon,
  LocationDuotoneIcon,
  CalendarDuotoneIcon,
  AnalyticsDuotoneIcon,
  HubDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { AssignmentDeployment } from "../../types/assignment-domain";
import styles from "./hands-assignments.module.css";

interface HandsAssignmentCardProps {
  assignment: AssignmentDeployment;
  isSelected?: boolean;
  onSelect: (assignment: AssignmentDeployment) => void;
  onOpenDetail: (assignment: AssignmentDeployment) => void;
}

// Custom Kallisto Duotone Status Icons
function HealthCheckDuotoneIcon({ size = 15, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="10" cy="10" r="8.5" fill="#059669" fillOpacity="0.18" />
      <circle cx="10" cy="10" r="8.5" stroke="#059669" strokeWidth="1.5" />
      <path
        d="M6.2 10.2L8.7 12.7L13.8 7.3"
        stroke="#059669"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HealthWarningDuotoneIcon({ size = 15, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10 2.2L18.2 16.8C18.4 17.2 18.2 17.8 17.7 18H2.3C1.8 17.8 1.6 17.2 1.8 16.8L10 2.2Z"
        fill="#d97706"
        fillOpacity="0.18"
        stroke="#d97706"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 7.5V11.5" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="14.3" r="1.1" fill="#d97706" />
    </svg>
  );
}

function HealthAlertDuotoneIcon({ size = 15, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="10" cy="10" r="8.5" fill="#dc2626" fillOpacity="0.18" />
      <circle cx="10" cy="10" r="8.5" stroke="#dc2626" strokeWidth="1.5" />
      <path d="M10 6.2V11.2" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="14.1" r="1.1" fill="#dc2626" />
    </svg>
  );
}

// Generate consistent theme color by project ID using Kallisto duotone icons
function getProjectTheme(id: string) {
  const themes = [
    { bg: "#eff6ff", color: "#2563eb", icon: ProjectsDuotoneIcon },
    { bg: "#fff7ed", color: "#ea580c", icon: HandsDuotoneIcon },
    { bg: "#f5f3ff", color: "#7c3aed", icon: TeamDuotoneIcon },
    { bg: "#ecfdf5", color: "#059669", icon: ProjectsDuotoneIcon },
    { bg: "#f0f9ff", color: "#0284c7", icon: HubDuotoneIcon },
    { bg: "#fdf2f8", color: "#db2777", icon: HandsDuotoneIcon },
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
          label: "ON TRACK",
          boxClass: styles.healthBoxOnTrack,
          icon: HealthCheckDuotoneIcon,
          defaultMsg: "All workers deployed and attendance reported.",
        };
      case "attention_required":
        return {
          label: "ATTENTION REQUIRED",
          boxClass: styles.healthBoxAttention,
          icon: HealthWarningDuotoneIcon,
          defaultMsg: "Workers not marked or attendance pending.",
        };
      case "at_risk":
        return {
          label: "AT RISK",
          boxClass: styles.healthBoxAtRisk,
          icon: HealthAlertDuotoneIcon,
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
        <HealthIcon size={15} className={styles.healthIcon} />
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
