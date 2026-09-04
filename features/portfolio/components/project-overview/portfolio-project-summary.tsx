"use client";

import type { PortfolioProject } from "@/features/portfolio/types/portfolio.types";
import styles from "./portfolio-project-overview.module.css";

interface PortfolioProjectSummaryProps {
  project: PortfolioProject;
}

export function PortfolioProjectSummary({
  project,
}: PortfolioProjectSummaryProps) {
  const editorial = project.editorialSummary || {
    vision: `${project.title} was envisioned as a responsive architectural sanctuary that balances privacy, natural light and spatial flow.`,
    approach: `The design balances climate-responsive passive principles with locally sourced materials suited to tropical conditions.`,
    context: `Located in ${project.location.city}, ${project.location.state}, the project respects site boundaries while integrating indoor and outdoor living.`,
  };

  return (
    <section className={styles.sectionBlock} aria-labelledby="summary-heading">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <h3 className={styles.sectionTitle} id="summary-heading">
            Project Summary
          </h3>
          <p className={styles.sectionSubtitle}>
            Editorial overview of vision, approach, and environmental context
          </p>
        </div>
      </div>

      <div className={styles.summaryEditorialGrid}>
        <div className={styles.summaryColumnCard}>
          <h4 className={styles.summaryColumnTitle}>Project Vision</h4>
          <p className={styles.summaryColumnText}>{editorial.vision}</p>
        </div>

        <div className={styles.summaryColumnCard}>
          <h4 className={styles.summaryColumnTitle}>Design Approach</h4>
          <p className={styles.summaryColumnText}>{editorial.approach}</p>
        </div>

        <div className={styles.summaryColumnCard}>
          <h4 className={styles.summaryColumnTitle}>Project Context</h4>
          <p className={styles.summaryColumnText}>{editorial.context}</p>
        </div>
      </div>
    </section>
  );
}
