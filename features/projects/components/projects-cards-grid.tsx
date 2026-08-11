"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Building2 } from "lucide-react";
import styles from "../projects.module.css";
import type { ProjectStatus, ProjectHealth } from "../types/project.types";

// ---------------------------------------------------------------------------
// Typed project card fed by the backend (project_character = 'pr').
// Health, progress, due-date and next-action fields are optional because the
// backend does not expose them yet; when absent the card omits them instead
// of fabricating "On track", "0%" or due/next-action claims.
// ---------------------------------------------------------------------------
export interface SampleProjectCard {
  id: string;
  name: string;
  code: string;
  type: string;
  location: string;
  clientDisplayName: string;
  phase: string | null;
  status: ProjectStatus;
  health?: ProjectHealth;
  phaseProgress?: number; // 0–100
  nextActionTitle: string | null;
  dueLabel: string | null;
  dueState?: "overdue" | "due_soon" | "on_track" | "no_due_date";
  image: string;
  images?: string[];
}

// ---------------------------------------------------------------------------
// Status filtering helper
// ---------------------------------------------------------------------------
function matchesTab(
  project: SampleProjectCard,
  activeStatus: ProjectStatus | "ALL" | undefined
): boolean {
  if (!activeStatus || activeStatus === "ALL") return true;
  return project.status === activeStatus;
}

// ---------------------------------------------------------------------------
// Health chip styling
// ---------------------------------------------------------------------------
function healthBadgeClass(health: ProjectHealth): string {
  switch (health) {
    case "ON_TRACK":        return styles.pcHealthOnTrack;
    case "NEEDS_ATTENTION": return styles.pcHealthAttention;
    case "BLOCKED":         return styles.pcHealthBlocked;
    case "OVERDUE":         return styles.pcHealthOverdue;
  }
}

function healthBadgeLabel(health: ProjectHealth): string {
  switch (health) {
    case "ON_TRACK":        return "On track";
    case "NEEDS_ATTENTION": return "Attention";
    case "BLOCKED":         return "Blocked";
    case "OVERDUE":         return "Overdue";
  }
}

// ---------------------------------------------------------------------------
// Project Card Media Section (Single photo matching reference SVG)
// ---------------------------------------------------------------------------
function ProjectCardMedia({ project }: { project: SampleProjectCard }) {
  const mainImage = (project.images && project.images.length > 0)
    ? project.images[0]
    : project.image;

  return (
    <div className={styles.pcMediaContainer}>
      {/* Bottom subtle dark gradient overlay behind status badges */}
      <div className={styles.pcMediaGradient} />

      {/* Bottom badges overlay (matching reference SVG) */}
      <div className={styles.pcBottomRow}>
        {project.phase && <span className={styles.pcPhasePill}>{project.phase}</span>}
        {project.health && (
          <span className={`${styles.pcHealthBadge} ${healthBadgeClass(project.health)}`}>
            {healthBadgeLabel(project.health)}
          </span>
        )}
      </div>

      {/* Single Media Photo */}
      {mainImage ? (
        <div className={styles.pcSingleMediaWrap}>
          <Image
            src={mainImage}
            alt={project.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={styles.pcMediaImage}
            unoptimized
          />
        </div>
      ) : (
        <div className={styles.pcPlaceholderWrap}>
          <Building2 size={36} className={styles.pcPlaceholderIcon} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compact SVG-aligned Project Card Component
// ---------------------------------------------------------------------------
export function ProjectCard({ project }: { project: SampleProjectCard }) {
  const showDueChip = Boolean(
    project.dueLabel &&
    project.dueState &&
    project.dueState !== "no_due_date"
  );

  return (
    <Link
      href={`/projects/${project.id}`}
      className={styles.pcCard}
      aria-label={`Project ${project.name}, phase ${project.phase ?? "Unassigned"}, ${project.phaseProgress ?? 0}% completed`}
    >
      {/* Media section with collage/image & overlays */}
      <ProjectCardMedia project={project} />

      {/* Information section below media */}
      <div className={styles.pcInfoSection}>
        {/* Row 1: Project Name (left) & Progress % (right) */}
        <div className={styles.pcTitleRow}>
          <h3 className={styles.pcName} title={project.name}>
            {project.name}
          </h3>
          <span className={styles.pcPercent}>
            {project.phaseProgress != null ? `${project.phaseProgress}%` : "—"}
          </span>
        </div>

        {/* Row 2: Location (left) & Due Date Chip (right, above divider) */}
        <div className={styles.pcLocationRow}>
          <span>{project.location}</span>
          {showDueChip && (
            <span
              className={`${styles.pcDueChip} ${
                project.dueState === "overdue"
                  ? styles.dueCritical
                  : project.dueState === "due_soon"
                  ? styles.dueWarning
                  : styles.dueNeutral
              }`}
            >
              {project.dueLabel}
            </span>
          )}
        </div>

        {/* Spacing / Divider */}
        <div className={styles.pcDivider} />

        {/* Row 3: Next action label + text */}
        {project.nextActionTitle && (
          <div className={styles.pcNextActionRow}>
            <span className={styles.pcNextActionText}>
              <span className={styles.pcNextActionLabel}>Next :</span>
              <span title={project.nextActionTitle}>{project.nextActionTitle}</span>
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Empty state component
// ---------------------------------------------------------------------------
function EmptyState({ activeStatus }: { activeStatus: string }) {
  const getEmptyDetails = () => {
    switch (activeStatus) {
      case "UPCOMING":
        return {
          title: "No upcoming projects",
          subtitle: "There are currently no upcoming projects queued or scheduled for kickoff.",
          icon: "🏗️",
        };
      case "ACTIVE":
        return {
          title: "No active projects",
          subtitle: "There are currently no active projects under construction or design development.",
          icon: "📐",
        };
      case "ON_HOLD":
        return {
          title: "No projects on hold",
          subtitle: "There are currently no paused or on-hold projects.",
          icon: "⏸️",
        };
      case "COMPLETED":
        return {
          title: "No completed projects",
          subtitle: "There are no completed projects recorded yet.",
          icon: "🎉",
        };
      default:
        return {
          title: "No projects found",
          subtitle: "No projects match the selected status or filters.",
          icon: "📂",
        };
    }
  };

  const details = getEmptyDetails();

  return (
    <div className={styles.pcEmptyState}>
      <div className={styles.pcEmptyIconWrap}>{details.icon}</div>
      <h4 className={styles.pcEmptyTitle}>{details.title}</h4>
      <p className={styles.pcEmptySubtitle}>{details.subtitle}</p>
    </div>
  );
}

function matchesLocation(project: SampleProjectCard, locationFilter?: string): boolean {
  if (!locationFilter) return true;
  const selected = locationFilter.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (selected.length === 0) return true;
  return selected.includes(project.location.toLowerCase());
}

// ---------------------------------------------------------------------------
// Projects card grid
// ---------------------------------------------------------------------------
interface ProjectsCardsGridProps {
  projects: SampleProjectCard[];
  activeStatus: ProjectStatus | "ALL" | undefined;
  locationFilter?: string;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

export function ProjectsCardsGrid({
  projects,
  activeStatus,
  locationFilter,
  loading = false,
  error = false,
  onRetry,
}: ProjectsCardsGridProps) {
  if (loading) {
    return (
      <div className={styles.pcEmptyState} aria-label="Loading projects">
        <div className={styles.pcEmptyIconWrap}>⏳</div>
        <h4 className={styles.pcEmptyTitle}>Loading projects</h4>
        <p className={styles.pcEmptySubtitle}>Fetching accepted projects from the backend…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pcEmptyState} role="alert" aria-label="Failed to load projects">
        <div className={styles.pcEmptyIconWrap}>⚠️</div>
        <h4 className={styles.pcEmptyTitle}>Could not load projects</h4>
        <p className={styles.pcEmptySubtitle}>
          The project list could not be fetched from the backend. Please try again.
        </p>
        {onRetry && (
          <button type="button" className={styles.primaryBtn} onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    );
  }

  const filtered = projects.filter(
    (p) => matchesTab(p, activeStatus) && matchesLocation(p, locationFilter)
  );

  if (filtered.length === 0) {
    return <EmptyState activeStatus={activeStatus ?? "ACTIVE"} />;
  }

  return (
    <div className={styles.pcGrid}>
      {filtered.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

