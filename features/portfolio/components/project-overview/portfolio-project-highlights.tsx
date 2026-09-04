"use client";

import type { PortfolioProject } from "@/features/portfolio/types/portfolio.types";
import styles from "./portfolio-project-overview.module.css";

interface PortfolioProjectHighlightsProps {
  project: PortfolioProject;
}

const HIGHLIGHT_DESCRIPTIONS = [
  "Acts as the thermal lung and visual centerpiece of the home, drawing cool air upward.",
  "Strategically placed louvers and courtyard pressure differentials ensure continuous airflow.",
  "Overhanging roof eaves and verandahs protect interior walls from heavy monsoon rain and harsh solar heat.",
  "Laterite stone, clay tiles, and regional teak reduce embodied carbon while providing thermal mass.",
  "Built-in teak joinery, daylight-led circulation, and adaptable semi-open family gathering zones.",
  "Filtered clerestory light courts eliminate the need for artificial lighting during daytime hours.",
];

function HighlightShape({ index }: { index: number }) {
  const shapeIndex = index % 6;

  switch (shapeIndex) {
    case 0:
      // Diamond / Rhombus
      return (
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <polygon
            points="10 2 18 10 10 18 2 10"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.08"
          />
          <circle cx="10" cy="10" r="2" fill="currentColor" />
        </svg>
      );
    case 1:
      // Arch / Semicircular Portal
      return (
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M3 18V9a7 7 0 0 1 14 0v9"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            fill="currentColor"
            fillOpacity="0.08"
          />
          <line x1="2" y1="18" x2="18" y2="18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case 2:
      // Geometric Triangle / Delta
      return (
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <polygon
            points="10 2.5 18 17.5 2 17.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.08"
          />
          <circle cx="10" cy="12" r="1.75" fill="currentColor" />
        </svg>
      );
    case 3:
      // Concentric Circle Core
      return (
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.75" fill="currentColor" fillOpacity="0.08" />
          <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
        </svg>
      );
    case 4:
      // Isometric Hexagon
      return (
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <polygon
            points="10 2 17.5 6.33 17.5 15 10 19.33 2.5 15 2.5 6.33"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.08"
          />
          <circle cx="10" cy="10.66" r="1.75" fill="currentColor" />
        </svg>
      );
    case 5:
    default:
      // 2x2 Orthogonal Grid
      return (
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="2.5" y="2.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08" />
          <rect x="11.5" y="2.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08" />
          <rect x="2.5" y="11.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08" />
          <rect x="11.5" y="11.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08" />
        </svg>
      );
  }
}

export function PortfolioProjectHighlights({
  project,
}: PortfolioProjectHighlightsProps) {
  const highlights = project.designHighlights && project.designHighlights.length > 0
    ? project.designHighlights
    : [
        "Central landscaped courtyard",
        "Passive cross ventilation",
        "Deep shaded openings",
        "Locally sourced materials",
        "Integrated interior planning",
        "Natural daylight optimization",
      ];

  return (
    <section className={styles.sectionBlock} aria-labelledby="highlights-heading">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <h3 className={styles.sectionTitle} id="highlights-heading">
            Design Highlights
          </h3>
          <p className={styles.sectionSubtitle}>
            Architectural features and climate-responsive design solutions
          </p>
        </div>
      </div>

      <div className={styles.highlightsGrid}>
        {highlights.map((hl, idx) => {
          const desc = HIGHLIGHT_DESCRIPTIONS[idx % HIGHLIGHT_DESCRIPTIONS.length];

          return (
            <div key={idx} className={styles.highlightCard}>
              <div className={styles.highlightIconCircle}>
                <HighlightShape index={idx} />
              </div>

              <div className={styles.highlightContent}>
                <h4 className={styles.highlightTitle}>{hl}</h4>
                <p className={styles.highlightDesc}>{desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
