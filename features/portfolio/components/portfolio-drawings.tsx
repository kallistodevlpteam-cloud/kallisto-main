import Image from "next/image";
import { FileText } from "lucide-react";
import type {
  PortfolioDrawing,
  PortfolioProject,
} from "@/features/portfolio/types/portfolio.types";
import { PortfolioEmptyState } from "./portfolio-empty-state";
import styles from "./portfolio.module.css";

interface PortfolioDrawingsProps {
  drawings: PortfolioDrawing[];
  projects: PortfolioProject[];
  isOwner: boolean;
}

export function PortfolioDrawings({
  drawings,
  projects,
  isOwner,
}: PortfolioDrawingsProps) {
  if (drawings.length === 0) {
    return (
      <PortfolioEmptyState
        title="No published drawings"
        description={
          isOwner
            ? "Publish selected non-confidential drawings to demonstrate technical capability."
            : "Published project drawings will appear here when available."
        }
        actionLabel={isOwner ? "Add drawing" : undefined}
        actionHref={
          isOwner
            ? "/portfolio?portfolioTab=drawings&create=drawing"
            : undefined
        }
      />
    );
  }

  return (
    <div className={styles.drawingList} aria-label="Published portfolio drawings">
      {drawings.map((drawing, index) => {
        const project = projects.find(
          (candidate) => candidate.id === drawing.projectId,
        );
        return (
          <article className={styles.drawingItem} key={drawing.id}>
            <div className={styles.drawingPreview}>
              <Image
                src={drawing.previewImageUrl}
                alt={`${drawing.title} preview`}
                fill
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                className={styles.drawingImage}
                sizes="(max-width: 640px) 100vw, 240px"
              />
            </div>
            <div className={styles.drawingIdentity}>
              <span>
                <FileText size={14} aria-hidden="true" />
                {drawing.category}
              </span>
              <h2>{drawing.title}</h2>
              <p>{project?.title ?? "Portfolio project"}</p>
            </div>
            <dl className={styles.drawingMetadata}>
              <div>
                <dt>Revision</dt>
                <dd>{drawing.revision}</dd>
              </div>
              <div>
                <dt>Issue status</dt>
                <dd>{drawing.issueStatus}</dd>
              </div>
              <div>
                <dt>Issue date</dt>
                <dd>{drawing.issueDate}</dd>
              </div>
            </dl>
          </article>
        );
      })}
    </div>
  );
}
