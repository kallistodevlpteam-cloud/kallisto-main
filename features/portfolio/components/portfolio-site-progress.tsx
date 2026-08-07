import Image from "next/image";
import { CalendarDays } from "lucide-react";
import type { PortfolioSiteProgressUpdate } from "@/features/portfolio/types/portfolio.types";
import { PortfolioEmptyState } from "./portfolio-empty-state";
import styles from "./portfolio.module.css";

interface PortfolioSiteProgressProps {
  updates: PortfolioSiteProgressUpdate[];
  isOwner: boolean;
}

export function PortfolioSiteProgress({
  updates,
  isOwner,
}: PortfolioSiteProgressProps) {
  if (updates.length === 0) {
    return (
      <PortfolioEmptyState
        title="No published site updates"
        description={
          isOwner
            ? "Publish factual, client-safe site updates from active projects."
            : "Published construction progress will appear here when available."
        }
        actionLabel={isOwner ? "Add site update" : undefined}
        actionHref={
          isOwner
            ? "/portfolio?portfolioTab=site-progress&create=update"
            : undefined
        }
      />
    );
  }

  return (
    <ol className={styles.progressTimeline} aria-label="Site progress updates">
      {updates.map((update, index) => (
        <li className={styles.progressUpdate} key={update.id}>
          <span className={styles.progressMarker} aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <article>
            <div className={styles.progressMedia}>
              <Image
                src={update.primaryImageUrl}
                alt={`${update.projectName}, ${update.stage}`}
                fill
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                className={styles.progressImage}
                sizes="(max-width: 640px) 100vw, 420px"
              />
            </div>
            <div className={styles.progressContent}>
              <p>{update.projectName}</p>
              <h2>{update.stage}</h2>
              <span>
                <CalendarDays size={13} aria-hidden="true" />
                {update.updateDate}
              </span>
              <p>{update.note}</p>
            </div>
          </article>
        </li>
      ))}
    </ol>
  );
}
