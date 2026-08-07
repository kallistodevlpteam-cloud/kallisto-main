import Image from "next/image";
import { ArrowRight, Clock3 } from "lucide-react";
import type { PortfolioProject } from "@/features/portfolio/types/portfolio.types";
import { PortfolioEmptyState } from "./portfolio-empty-state";
import styles from "./portfolio.module.css";

interface PortfolioDraftsGridProps {
  drafts: PortfolioProject[];
}

export function PortfolioDraftsGrid({
  drafts,
}: PortfolioDraftsGridProps) {
  if (drafts.length === 0) {
    return (
      <PortfolioEmptyState
        title="No drafts"
        description="New project drafts will appear here until they are ready to publish."
        actionLabel="Create draft"
        actionHref="/portfolio?portfolioTab=drafts&create=project"
      />
    );
  }

  return (
    <div className={styles.draftsGrid}>
      {drafts.map((draft, index) => (
        <article className={styles.draftCard} key={draft.id}>
          <div className={styles.draftMedia}>
            <Image
              src={draft.coverImage}
              alt={`${draft.title} draft cover`}
              fill
              priority={index < 2}
              loading={index < 2 ? "eager" : "lazy"}
              className={styles.draftImage}
              sizes="(max-width: 640px) 50vw, 32vw"
            />
            <span>Draft</span>
          </div>
          <div className={styles.draftContent}>
            <h2>{draft.title}</h2>
            <p>
              <Clock3 size={13} aria-hidden="true" />
              Last edited {draft.lastEditedAt}
            </p>
            <div className={styles.draftProgress}>
              <span style={{ width: `${draft.completionPercent ?? 0}%` }} />
            </div>
            <div className={styles.draftFooter}>
              <span>{draft.completionPercent ?? 0}% complete</span>
              <a href={`/portfolio?portfolioTab=drafts&edit=${draft.id}`}>
                Continue editing
                <ArrowRight size={13} aria-hidden="true" />
              </a>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
