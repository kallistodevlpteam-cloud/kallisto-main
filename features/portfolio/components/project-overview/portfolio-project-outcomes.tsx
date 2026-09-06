"use client";

import type { PortfolioProject } from "@/features/portfolio/types/portfolio.types";
import { formatBuiltUpArea } from "@/features/portfolio/utils/portfolio-project-format";
import styles from "./portfolio-project-overview.module.css";

interface PortfolioProjectOutcomesProps {
  project: PortfolioProject;
}

export function PortfolioProjectOutcomes({
  project,
}: PortfolioProjectOutcomesProps) {
  const isCompleted = project.status === "completed";
  const builtUpStr = formatBuiltUpArea(project);
  const durationStr = project.duration || "18 Months";
  const servicesCountStr = `${project.services.length} Services`;
  const completionRate = isCompleted ? "100%" : `${project.completionPercent ?? 65}%`;

  const summaryStatement = project.outcomesSummary ||
    `Delivered successfully on schedule with comprehensive architectural coordination and strict material standards.`;

  return (
    <section className={styles.sectionBlock} aria-labelledby="outcomes-heading">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <h3 className={styles.sectionTitle} id="outcomes-heading">
            Project Outcomes
          </h3>
          <p className={styles.sectionSubtitle}>
            Key delivery achievements, efficiency gains, and final metrics
          </p>
        </div>
      </div>

      <div className={styles.outcomesBox}>
        <div className={styles.outcomesStatsRow}>
          <div className={styles.outcomeStatCard}>
            <span className={styles.outcomeStatVal}>{builtUpStr}</span>
            <span className={styles.outcomeStatLbl}>Built-up Area</span>
          </div>

          <div className={styles.outcomeStatCard}>
            <span className={styles.outcomeStatVal}>{durationStr}</span>
            <span className={styles.outcomeStatLbl}>Project Duration</span>
          </div>

          <div className={styles.outcomeStatCard}>
            <span className={styles.outcomeStatVal}>{servicesCountStr}</span>
            <span className={styles.outcomeStatLbl}>Services Delivered</span>
          </div>

          <div className={styles.outcomeStatCard}>
            <span className={styles.outcomeStatVal}>{completionRate}</span>
            <span className={styles.outcomeStatLbl}>Project Completion</span>
          </div>
        </div>

        <p className={styles.outcomesStatement}>&ldquo;{summaryStatement}&rdquo;</p>
      </div>
    </section>
  );
}
