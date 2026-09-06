"use client";

import Link from "next/link";
import Image from "next/image";
import type { PortfolioProject } from "@/features/portfolio/types/portfolio.types";
import { formatProjectCategory } from "@/features/portfolio/utils/portfolio-project-format";
import styles from "./portfolio-project-overview.module.css";

interface PortfolioProjectRelatedProps {
  relatedProjects: PortfolioProject[];
}

export function PortfolioProjectRelated({
  relatedProjects,
}: PortfolioProjectRelatedProps) {
  if (!relatedProjects || relatedProjects.length === 0) return null;

  return (
    <section className={styles.sectionBlock} aria-labelledby="related-heading">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <h3 className={styles.sectionTitle} id="related-heading">
            More Projects
          </h3>
          <p className={styles.sectionSubtitle}>
            Explore additional completed works and case studies
          </p>
        </div>
      </div>

      <div className={styles.relatedGrid}>
        {relatedProjects.map((proj) => {
          const categoryStr = formatProjectCategory(proj.projectType);
          const locationStr = `${proj.location.city}, ${proj.location.state}`;
          const yearStr = String(
            proj.completionYear ?? proj.expectedCompletionYear ?? "2026",
          );

          return (
            <Link
              key={proj.id}
              href={`/portfolio/projects/${proj.id}`}
              className={styles.relatedCard}
            >
              <div className={styles.relatedImageWrapper}>
                <Image
                  src={proj.coverImage}
                  alt={`${proj.title} cover`}
                  fill
                  sizes="(max-width: 900px) 100vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
              </div>

              <div className={styles.relatedContent}>
                <span className={styles.relatedCategory}>{categoryStr}</span>
                <h4 className={styles.relatedTitle}>{proj.title}</h4>
                <div className={styles.relatedMeta}>
                  <span>{locationStr}</span>
                  <span>{yearStr}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
