"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Building2 } from "lucide-react";
import styles from "../projects.module.css";
import type { ProjectStatus, ProjectHealth, ProjectPhase } from "../types/project.types";

// ---------------------------------------------------------------------------
// Typed sample projects with accurate domain status, phase & next action.
// ---------------------------------------------------------------------------
export interface SampleProjectCard {
  id: string;
  name: string;
  code: string;
  type: string;
  location: string;
  clientDisplayName: string;
  phase: ProjectPhase;
  status: ProjectStatus;
  health: ProjectHealth;
  phaseProgress: number; // 0–100
  nextActionTitle: string | null;
  dueLabel: string | null;
  dueState?: "overdue" | "due_soon" | "on_track" | "no_due_date";
  image: string;
  images?: string[];
}

export const SAMPLE_PROJECTS: SampleProjectCard[] = [
  // ── ACTIVE Projects (Work in progress: 1%–99%) ──────────────────────────
  {
    id: "proj-001",
    name: "Nila Residence",
    code: "KAL-2024-001",
    type: "Residential",
    location: "Kochi",
    clientDisplayName: "Arjun & Meera Nair",
    phase: "Construction",
    status: "ACTIVE",
    health: "NEEDS_ATTENTION",
    phaseProgress: 62,
    nextActionTitle: "Client approval for joinery revision",
    dueLabel: "Due in 2d",
    dueState: "due_soon",
    image: "/assets/projectbg.webp",
    images: [
      "/assets/projectbg.webp",
      "/assets/nila-thumb1.jpg",
      "/assets/nila-thumb2.jpg",
    ],
  },
  {
    id: "proj-002",
    name: "Azure Villa",
    code: "KAL-2024-002",
    type: "Residential",
    location: "Calicut",
    clientDisplayName: "Fariz Al-Hassan",
    phase: "Construction",
    status: "ACTIVE",
    health: "BLOCKED",
    phaseProgress: 65,
    nextActionTitle: "Structural engineer site inspection report",
    dueLabel: "Overdue 3d",
    dueState: "overdue",
    image:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80",
    ],
  },
  {
    id: "proj-003",
    name: "Greenfield Apartment",
    code: "KAL-2024-003",
    type: "Residential",
    location: "Thrissur",
    clientDisplayName: "Greenfield Builders LLC",
    phase: "Design development",
    status: "ACTIVE",
    health: "ON_TRACK",
    phaseProgress: 80,
    nextActionTitle: "Finalize electrical & lighting drawing set",
    dueLabel: "Due in 5d",
    dueState: "on_track",
    image:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&auto=format&fit=crop&q=80",
    ],
  },
  {
    id: "proj-004",
    name: "Calicut Retail Interior",
    code: "KAL-2024-004",
    type: "Commercial",
    location: "Calicut",
    clientDisplayName: "MedPlus Retail Pvt Ltd",
    phase: "BOQ and procurement",
    status: "ACTIVE",
    health: "ON_TRACK",
    phaseProgress: 45,
    nextActionTitle: "Vendor quotation approval for HVAC",
    dueLabel: "Due tomorrow",
    dueState: "due_soon",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=900&auto=format&fit=crop&q=80",
    ],
  },
  {
    id: "proj-005",
    name: "Harbour View Office",
    code: "KAL-2024-005",
    type: "Commercial",
    location: "Kochi",
    clientDisplayName: "Seaport Holdings",
    phase: "Approvals",
    status: "ACTIVE",
    health: "NEEDS_ATTENTION",
    phaseProgress: 30,
    nextActionTitle: "Municipal sanction document filing",
    dueLabel: "Due in 1d",
    dueState: "due_soon",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&auto=format&fit=crop&q=80",
    ],
  },

  // ── UPCOMING Projects (Not yet started: 0% progress) ───────────────────
  {
    id: "proj-007",
    name: "Skyline Heights Phase II",
    code: "KAL-2024-007",
    type: "Residential",
    location: "Thiruvananthapuram",
    clientDisplayName: "Rajan & Preethi Pillai",
    phase: "Briefing",
    status: "UPCOMING",
    health: "ON_TRACK",
    phaseProgress: 0,
    nextActionTitle: "Initial client requirement brief",
    dueLabel: "Next week",
    dueState: "on_track",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&auto=format&fit=crop&q=80",
    ],
  },
  {
    id: "proj-009",
    name: "Highland Villa",
    code: "KAL-2024-009",
    type: "Residential",
    location: "Munnar",
    clientDisplayName: "Anand & Priya Varma",
    phase: "Site verification",
    status: "UPCOMING",
    health: "ON_TRACK",
    phaseProgress: 0,
    nextActionTitle: "Topographical survey team dispatch",
    dueLabel: "Due in 4d",
    dueState: "on_track",
    image: "",
    images: [],
  },

  // ── ON HOLD Projects (Formally paused / placed on hold) ────────────────
  {
    id: "proj-010",
    name: "Coastal Resort Pavilion",
    code: "KAL-2024-010",
    type: "Hospitality",
    location: "Bekal",
    clientDisplayName: "Malabar Resorts Ltd",
    phase: "Approvals",
    status: "ON_HOLD",
    health: "BLOCKED",
    phaseProgress: 20,
    nextActionTitle: "Client requested project hold",
    dueLabel: "On hold",
    dueState: "no_due_date",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&auto=format&fit=crop&q=80",
    ],
  },

  // ── COMPLETED Projects (Handover completed: 100% progress) ──────────────
  {
    id: "proj-006",
    name: "Palm Heights Penthouse",
    code: "KAL-2024-006",
    type: "Residential",
    location: "Thiruvananthapuram",
    clientDisplayName: "David & Sarah Okafor",
    phase: "Handover",
    status: "COMPLETED",
    health: "ON_TRACK",
    phaseProgress: 100,
    nextActionTitle: "Handover sign-off certificate",
    dueLabel: "Completed",
    dueState: "on_track",
    image:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&auto=format&fit=crop&q=80",
    ],
  },
  {
    id: "proj-008",
    name: "Marina Bay Suites",
    code: "KAL-2024-008",
    type: "Hospitality",
    location: "Kochi",
    clientDisplayName: "Marina Hospitality Group",
    phase: "Post-handover",
    status: "COMPLETED",
    health: "ON_TRACK",
    phaseProgress: 100,
    nextActionTitle: "Defect liability inspection",
    dueLabel: "Completed",
    dueState: "on_track",
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop&q=80",
    ],
  },
];

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
        <span className={styles.pcPhasePill}>{project.phase}</span>
        <span className={`${styles.pcHealthBadge} ${healthBadgeClass(project.health)}`}>
          {healthBadgeLabel(project.health)}
        </span>
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
      aria-label={`Project ${project.name}, phase ${project.phase}, ${project.phaseProgress}% completed`}
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
          <span className={styles.pcPercent}>{project.phaseProgress}%</span>
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
  activeStatus: ProjectStatus | "ALL" | undefined;
  locationFilter?: string;
}

export function ProjectsCardsGrid({ activeStatus, locationFilter }: ProjectsCardsGridProps) {
  const filtered = SAMPLE_PROJECTS.filter(
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

