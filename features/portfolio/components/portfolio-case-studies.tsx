"use client";

import Image from "next/image";
import { TrendingUp } from "lucide-react";
import type {
  PortfolioCaseStudy,
  PortfolioProject,
} from "@/features/portfolio/types/portfolio.types";
import { formatProjectType } from "@/features/portfolio/utils/portfolio-project-format";
import { PortfolioEmptyState } from "./portfolio-empty-state";
import styles from "./portfolio.module.css";

interface PortfolioCaseStudiesProps {
  caseStudies: PortfolioCaseStudy[];
  projects: PortfolioProject[];
  isOwner: boolean;
  onOpenProject: (
    project: PortfolioProject,
    trigger: HTMLButtonElement,
  ) => void;
}

export function PortfolioCaseStudies({
  caseStudies,
  projects,
  isOwner,
  onOpenProject,
}: PortfolioCaseStudiesProps) {
  if (caseStudies.length === 0) {
    return (
      <PortfolioEmptyState
        title="No case studies"
        description={
          isOwner
            ? "Turn a published project into an architectural narrative covering the brief, response, scope and outcome."
            : "Case studies will appear here when they are published."
        }
        actionLabel={isOwner ? "Create case study" : undefined}
        actionHref={
          isOwner ? "/portfolio?portfolioTab=case-studies&create=case-study" : undefined
        }
      />
    );
  }

  return (
    <div className={styles.caseStudyList}>
      {caseStudies.map((caseStudy, index) => {
        const project = projects.find(
          (candidate) => candidate.id === caseStudy.projectId,
        );
        const categoryLabel = formatProjectType(caseStudy.projectType);
        const summaryText = caseStudy.clientBrief || caseStudy.designResponse;

        return (
          <article className={styles.caseStudyCard} key={caseStudy.id}>
            <div className={styles.caseStudyMedia}>
              <Image
                src={caseStudy.coverImageUrl}
                alt={`${caseStudy.title} cover`}
                fill
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                className={styles.caseStudyImage}
                sizes="(max-width: 760px) 100vw, 300px"
              />
            </div>
            <div className={styles.caseStudyContent}>
              <div className={styles.caseStudyHeaderGroup}>
                <span className={styles.caseStudyEyebrow}>
                  {categoryLabel} · Completed {caseStudy.completionYear}
                </span>
                <h2 className={styles.caseStudyTitle}>{caseStudy.title}</h2>
              </div>
              <p className={styles.caseStudySummary}>{summaryText}</p>
              {project ? (
                <button
                  className={styles.caseStudyAction}
                  type="button"
                  onClick={(event) => onOpenProject(project, event.currentTarget)}
                >
                  <TrendingUp size={14} className={styles.actionIcon} aria-hidden="true" />
                  <span>View Case Study</span>
                </button>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
