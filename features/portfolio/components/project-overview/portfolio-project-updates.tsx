"use client";

import Image from "next/image";
import type { PortfolioProject } from "@/features/portfolio/types/portfolio.types";
import styles from "./portfolio-project-overview.module.css";

interface PortfolioProjectUpdatesProps {
  project: PortfolioProject;
  onOpenImage?: (imageUrl: string) => void;
}

export function PortfolioProjectUpdates({
  project,
}: PortfolioProjectUpdatesProps) {
  const updates = project.updates && project.updates.length > 0
    ? project.updates
    : [
        {
          id: "upd-1",
          date: "12 Jun 2026",
          title: "Interior Work — 85% Complete",
          description:
            "Flooring and ceiling work completed across the living and dining areas. Custom teak joinery installation underway.",
          images: [
            "/assets/projects/anitha_menon.png",
            "/assets/studio/visualisations.jpg",
          ],
          addedBy: "Arjun K. (Lead Architect)",
          milestone: "Milestone 07: Interior & Finishing",
        },
        {
          id: "upd-2",
          date: "28 Apr 2026",
          title: "Courtyard Landscaping & Paving",
          description:
            "Natural stone paving laid in central courtyard with rainwater percolation wells and indigenous planting installed.",
          images: ["/assets/hero-architecture-banner.webp"],
          addedBy: "Maya Nair (Interior Team)",
          milestone: "Milestone 07: Interior & Finishing",
        },
      ];

  if (updates.length === 0) return null;

  return (
    <section className={styles.sectionBlock} aria-labelledby="updates-heading">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <h3 className={styles.sectionTitle} id="updates-heading">
            Latest Project Updates
          </h3>
          <p className={styles.sectionSubtitle}>
            Verified site progress logs, milestone reports, and construction activity
          </p>
        </div>
      </div>

      <div className={styles.updatesList}>
        {updates.map((update) => (
          <article key={update.id} className={styles.updateCard}>
            <div className={styles.updateHeaderRow}>
              <h4 className={styles.updateTitle}>{update.title}</h4>
              <span className={styles.updateDate}>{update.date}</span>
            </div>

            <p className={styles.updateText}>{update.description}</p>

            {update.images && update.images.length > 0 && (
              <div className={styles.updateImagesRow}>
                {update.images.map((img, idx) => (
                  <div key={idx} className={styles.updateThumbnail}>
                    <Image
                      src={img}
                      alt={`${update.title} photo ${idx + 1}`}
                      fill
                      sizes="120px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className={styles.updateFooterRow}>
              <span>{update.addedBy}</span>
              <span style={{ fontWeight: 600 }}>{update.milestone}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
