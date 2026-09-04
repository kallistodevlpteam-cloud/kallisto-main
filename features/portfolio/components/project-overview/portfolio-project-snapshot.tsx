"use client";

import {
  BedDouble,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  LandPlot,
  Ruler,
} from "lucide-react";
import type { PortfolioProject } from "@/features/portfolio/types/portfolio.types";
import {
  formatBuiltUpArea,
  formatSiteArea,
} from "@/features/portfolio/utils/portfolio-project-format";
import styles from "./portfolio-project-overview.module.css";

interface PortfolioProjectSnapshotProps {
  project: PortfolioProject;
}

export function PortfolioProjectSnapshot({
  project,
}: PortfolioProjectSnapshotProps) {
  const builtUpAreaStr = formatBuiltUpArea(project);
  const siteAreaStr = formatSiteArea(project);
  const floorsStr = project.floors || "2 Floors";
  const bedroomsStr = project.bedrooms || "4 BHK";
  const durationStr = project.duration || "18 Months";
  const yearStr = String(
    project.completionYear ?? project.expectedCompletionYear ?? "2026",
  );
  const statusStr = project.status === "completed" ? "Completed" : "In Progress";
  const servicesCount = String(project.services.length);

  const snapshotItems = [
    { label: "Built-up Area", value: builtUpAreaStr, icon: Ruler },
    { label: "Site Area", value: siteAreaStr, icon: LandPlot },
    { label: "Floors", value: floorsStr, icon: Building2 },
    { label: "Bedrooms", value: bedroomsStr, icon: BedDouble },
    { label: "Project Duration", value: durationStr, icon: Clock },
    { label: "Completion Year", value: yearStr, icon: CalendarDays },
    { label: "Project Status", value: statusStr, icon: CheckCircle2 },
    { label: "Services", value: servicesCount, icon: Briefcase },
  ];

  return (
    <section className={styles.sectionBlock} aria-labelledby="snapshot-heading">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <h3 className={styles.sectionTitle} id="snapshot-heading">
            Project Snapshot
          </h3>
          <p className={styles.sectionSubtitle}>
            Key architectural and operational specifications
          </p>
        </div>
      </div>

      <div className={styles.snapshotGrid}>
        {snapshotItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className={styles.snapshotCard}>
              <div className={styles.snapshotCardHeader}>
                <div className={styles.snapshotIconCircle}>
                  <Icon size={14} className={styles.snapshotIcon} aria-hidden="true" />
                </div>
                <span className={styles.snapshotLabel}>{item.label}</span>
              </div>
              <span className={styles.snapshotValue}>{item.value}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
