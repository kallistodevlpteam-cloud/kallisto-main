"use client";

import type { PortfolioProject } from "@/features/portfolio/types/portfolio.types";
import styles from "./portfolio-project-overview.module.css";

interface PortfolioProjectProgressProps {
  project: PortfolioProject;
}

export function PortfolioProjectProgress({
  project,
}: PortfolioProjectProgressProps) {
  const isCompleted = project.status === "completed";
  const overallPercent = isCompleted ? 100 : (project.completionPercent ?? 65);

  const stages = project.progressStages && project.progressStages.length > 0
    ? project.progressStages
    : [
        { stage: "Planning", percent: 100 },
        { stage: "Architecture", percent: 100 },
        { stage: "Documentation", percent: 100 },
        { stage: "Construction", percent: isCompleted ? 100 : 75 },
        { stage: "Interior", percent: isCompleted ? 100 : 50 },
        { stage: "Handover", percent: isCompleted ? 100 : 20 },
      ];

  return (
    <section className={styles.sectionBlock} aria-labelledby="progress-heading">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <h3 className={styles.sectionTitle} id="progress-heading">
            Project Progress
          </h3>
          <p className={styles.sectionSubtitle}>
            Stage-wise completion metrics and delivery tracking
          </p>
        </div>
      </div>

      <div className={styles.progressOverviewBox}>
        {/* Overall Big Circle Metric */}
        <div className={styles.progressOverallMetric}>
          <span className={styles.progressOverallValue}>{overallPercent}%</span>
          <span className={styles.progressOverallLabel}>Overall Completion</span>
        </div>

        {/* Breakdown Progress Bars */}
        <div className={styles.progressBarsList}>
          {stages.map((st) => (
            <div key={st.stage} className={styles.progressBarItem}>
              <div className={styles.progressBarHeader}>
                <span>{st.stage}</span>
                <span>{st.percent}%</span>
              </div>
              <div className={styles.progressBarTrack}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${st.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
