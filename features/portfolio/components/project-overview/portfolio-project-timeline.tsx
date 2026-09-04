"use client";

import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type {
  MilestoneStatus,
  PortfolioProject,
} from "@/features/portfolio/types/portfolio.types";
import styles from "./portfolio-project-overview.module.css";

interface PortfolioProjectTimelineProps {
  project: PortfolioProject;
}

function getStatusBadge(status: MilestoneStatus) {
  switch (status) {
    case "Completed":
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            fontWeight: 600,
            color: "#059669",
            background: "#ecfdf5",
            padding: "2px 8px",
            borderRadius: 9999,
          }}
        >
          <CheckCircle2 size={12} />
          <span>Completed</span>
        </span>
      );
    case "In Progress":
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            fontWeight: 600,
            color: "#2563eb",
            background: "#eff6ff",
            padding: "2px 8px",
            borderRadius: 9999,
          }}
        >
          <Clock size={12} />
          <span>In Progress</span>
        </span>
      );
    case "Delayed":
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            fontWeight: 600,
            color: "#dc2626",
            background: "#fef2f2",
            padding: "2px 8px",
            borderRadius: 9999,
          }}
        >
          <AlertCircle size={12} />
          <span>Delayed</span>
        </span>
      );
    case "Upcoming":
    default:
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            fontWeight: 600,
            color: "#64748b",
            background: "#f1f5f9",
            padding: "2px 8px",
            borderRadius: 9999,
          }}
        >
          <span>Upcoming</span>
        </span>
      );
  }
}

export function PortfolioProjectTimeline({
  project,
}: PortfolioProjectTimelineProps) {
  const milestones = project.milestones && project.milestones.length > 0
    ? project.milestones
    : [
        {
          id: "m-1",
          stepNumber: "01",
          title: "Project Initiated",
          date: "Jan 2025",
          status: "Completed" as MilestoneStatus,
          description: "Initial client brief, site inspection, and zoning feasibility clearance.",
        },
        {
          id: "m-2",
          stepNumber: "02",
          title: "Site Study & Requirements",
          date: "Feb 2025",
          status: "Completed" as MilestoneStatus,
          description: "Topographic survey, sun-path analysis, and structured requirement sign-off.",
        },
        {
          id: "m-3",
          stepNumber: "03",
          title: "Concept Design",
          date: "Mar 2025",
          status: "Completed" as MilestoneStatus,
          description: "Courtyard spatial layout, 3D volumetric massing, and client presentation.",
        },
        {
          id: "m-4",
          stepNumber: "04",
          title: "Design Development",
          date: "May 2025",
          status: "Completed" as MilestoneStatus,
          description: "Structural grid alignment, MEP schematics, and material specifications.",
        },
        {
          id: "m-5",
          stepNumber: "05",
          title: "Working Drawings",
          date: "Jul 2025",
          status: "Completed" as MilestoneStatus,
          description: "GFC drawing pack, joinery details, and BOQ contractor tendering.",
        },
        {
          id: "m-6",
          stepNumber: "06",
          title: "Construction Started",
          date: "Aug 2025",
          status: "Completed" as MilestoneStatus,
          description: "Groundbreaking, laterite foundation, and RCC frame erection.",
        },
        {
          id: "m-7",
          stepNumber: "07",
          title: "Interior & Finishing",
          date: "Jun 2026",
          status: "Completed" as MilestoneStatus,
          description: "Custom teak carpentry, lime plaster application, and sanitary fittings.",
        },
        {
          id: "m-8",
          stepNumber: "08",
          title: "Project Completed",
          date: "Jul 2026",
          status: "Completed" as MilestoneStatus,
          description: "Final site audit, snag list clearance, and client handover.",
        },
      ];

  return (
    <section className={styles.sectionBlock} aria-labelledby="timeline-heading">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <h3 className={styles.sectionTitle} id="timeline-heading">
            Project Timeline
          </h3>
          <p className={styles.sectionSubtitle}>
            Chronological milestone track from initiation to completion
          </p>
        </div>
      </div>

      <div className={styles.timelineGrid}>
        {milestones.map((m) => (
          <div key={m.id} className={styles.timelineCard}>
            <div className={styles.timelineCardHeader}>
              <span className={styles.timelineStepBadge}>{m.stepNumber}</span>
              {getStatusBadge(m.status)}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span className={styles.timelineDate}>{m.date}</span>
              <h4 className={styles.timelineTitle}>{m.title}</h4>
            </div>

            <p className={styles.timelineDesc}>{m.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
