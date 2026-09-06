"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Briefcase,
} from "lucide-react";
import {
  TeamDuotoneIcon,
  CalendarDuotoneIcon,
  LocationDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { LabourRequest } from "../../types/request-domain";
import { calculateRequestMatch } from "../../mock/requests-mock-data";
import { getProviderDisplayDetails } from "../../mock/provider-profiles-mock-data";
import styles from "./hands-requests.module.css";

interface HandsRequestCardProps {
  request: LabourRequest;
  isSelected?: boolean;
  onSelect: (req: LabourRequest) => void;
  onReview: (req: LabourRequest) => void;
}

// Generate consistent theme color by project ID
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

export function HandsRequestCard({
  request,
  isSelected = false,
  onSelect,
  onReview,
}: HandsRequestCardProps) {
  const router = useRouter();
  const match = calculateRequestMatch(request);
  const theme = getProjectTheme(request.id);
  const ProjectIcon = theme.icon;

  const totalWorkers = request.requirements.reduce((acc, r) => acc + r.requiredCount, 0);
  const primaryTrade = request.requirements[0]?.trade || "Workforce";
  const providerDisplay = getProviderDisplayDetails(request.clientName, primaryTrade);

  return (
    <article
      className={`${styles.gridRequestCard} ${isSelected ? styles.gridRequestCardSelected : ""}`}
      onClick={() => onSelect(request)}
      tabIndex={0}
      role="button"
      aria-label={`Request from ${providerDisplay.name} for ${request.projectName}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(request);
        }
      }}
    >
      {/* 1. Header: Project Icon + Service Provider Details + Timestamp */}
      <div className={styles.cardHeaderRow}>
        <div className={styles.cardHeaderLeft}>
          <div
            className={styles.cardLogoBox}
            style={{ backgroundColor: theme.bg, color: theme.color }}
          >
            <ProjectIcon size={18} />
          </div>
          <div className={styles.cardTitleCol}>
            <h3
              className={styles.cardProjectTitle}
              title={`View ${providerDisplay.name} Profile`}
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/partner/hands/profile/${providerDisplay.slug}`);
              }}
            >
              {providerDisplay.name}
            </h3>
            <span className={styles.cardClientSubtitle} title={providerDisplay.profession}>
              {providerDisplay.profession}
            </span>
          </div>
        </div>

        {/* Timestamp */}
        <span className={styles.requestTimeAgo}>{request.createdAt}</span>
      </div>

      {/* 2. Subheader Badges Row: Workers Count with Kallisto Duotone Icon */}
      <div className={styles.cardBadgesRow}>
        <div className={styles.cardCountPill}>
          <TeamDuotoneIcon size={13} style={{ color: "#2563eb", flexShrink: 0 }} />
          <span>{totalWorkers} Workers</span>
        </div>
        {request.status === "rejected" && (
          <span className={`${styles.cardStatusPill} ${styles.cardStatusRejected}`}>
            Rejected
          </span>
        )}
        {request.status === "closed" && (
          <span className={`${styles.cardStatusPill} ${styles.cardStatusClosed}`}>
            Closed
          </span>
        )}
      </div>

      {/* 3. Structured Key Properties (Icon Only with Kallisto Duotone Theme) */}
      <div className={styles.cardPropertiesList}>
        <div className={styles.propertyRow}>
          <TeamDuotoneIcon size={15} className={styles.propertyDuotoneIcon} />
          <span className={styles.propertyValue}>
            <strong>{totalWorkers} Members</strong> ({match.totalAvailable} bench)
          </span>
        </div>

        <div className={styles.propertyRow}>
          <CalendarDuotoneIcon size={15} className={styles.propertyDuotoneIcon} />
          <span className={styles.propertyValue}>
            <strong>{request.startDate}</strong> · {request.estimatedDuration}
          </span>
        </div>

        <div className={styles.propertyRow}>
          <LocationDuotoneIcon size={15} className={styles.propertyDuotoneIcon} />
          <span
            className={styles.propertyValue}
            title={`${request.projectName} · ${request.location}`}
          >
            <strong>{request.projectName}</strong> · {request.location}
          </span>
        </div>
      </div>

      {/* 4. Full-Width Action Button */}
      <button
        type="button"
        className={styles.cardActionBtn}
        onClick={(e) => {
          e.stopPropagation();
          onReview(request);
        }}
        aria-label={`${request.status === "rejected" || request.status === "closed" ? "View Details" : "Review Request"} for ${request.projectName}`}
      >
        <span>
          {request.status === "rejected" || request.status === "closed"
            ? "View Details"
            : "Review Request"}
        </span>
      </button>
    </article>
  );
}
