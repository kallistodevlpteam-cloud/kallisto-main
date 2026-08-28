"use client";

import { useState } from "react";
import Image from "next/image";
import { TrendingUp, Layers, MapPin, Calendar, Compass, ArrowUpRight } from "lucide-react";
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
  const [selectedCaseStudyId, setSelectedCaseStudyId] = useState<string>(
    caseStudies[0]?.id ?? "",
  );
  const [previewImageOverride, setPreviewImageOverride] = useState<string | null>(null);

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

  const activeCaseStudy =
    caseStudies.find((candidate) => candidate.id === selectedCaseStudyId) ??
    caseStudies[0];

  const activeProject = projects.find(
    (candidate) => candidate.id === activeCaseStudy.projectId,
  );

  const activeImage = previewImageOverride ?? activeCaseStudy.coverImageUrl;

  const handleSelectCaseStudy = (id: string) => {
    setSelectedCaseStudyId(id);
    setPreviewImageOverride(null);
  };

  const handleCardInteraction = (
    caseStudy: PortfolioCaseStudy,
    project: PortfolioProject | undefined,
    triggerElement: HTMLElement,
  ) => {
    handleSelectCaseStudy(caseStudy.id);
    if (typeof window !== "undefined" && window.innerWidth <= 1024 && project) {
      onOpenProject(project, triggerElement as unknown as HTMLButtonElement);
    }
  };

  return (
    <div className={styles.caseStudyLayout}>
      <div className={styles.caseStudyList}>
        {caseStudies.map((caseStudy, index) => {
          const project = projects.find(
            (candidate) => candidate.id === caseStudy.projectId,
          );
          const categoryLabel = formatProjectType(caseStudy.projectType);
          const summaryText = caseStudy.clientBrief || caseStudy.designResponse;
          const isSelected = caseStudy.id === activeCaseStudy.id;

          return (
            <article
              className={`${styles.caseStudyCard} ${
                isSelected ? styles.caseStudyCardSelected : ""
              }`}
              key={caseStudy.id}
              onClick={(e) => handleCardInteraction(caseStudy, project, e.currentTarget)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCardInteraction(caseStudy, project, e.currentTarget);
                }
              }}
            >
              <div className={styles.caseStudyMedia}>
                <Image
                  src={caseStudy.coverImageUrl}
                  alt={`${caseStudy.title} cover`}
                  fill
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  className={styles.caseStudyImage}
                  sizes="(max-width: 600px) 100vw, 140px"
                />
              </div>
              <div className={styles.caseStudyContent}>
                <div className={styles.caseStudyHeaderGroup}>
                  <span className={styles.caseStudyEyebrow}>
                    {categoryLabel} · Completed {caseStudy.completionYear}
                  </span>
                  <h2 className={styles.caseStudyTitle}>{caseStudy.title}</h2>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Right Preview Section */}
      <aside className={styles.caseStudyPreviewSidebar} aria-label="Case study preview">
        <div className={styles.caseStudyPreviewCard}>
          <div className={styles.previewMediaContainer}>
            <Image
              src={activeImage}
              alt={`${activeCaseStudy.title} preview`}
              fill
              className={styles.previewImage}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <span className={styles.previewCategoryBadge}>
              {formatProjectType(activeCaseStudy.projectType)}
            </span>
          </div>

          {activeProject?.gallery && activeProject.gallery.length > 1 ? (
            <div className={styles.previewThumbnailRow}>
              {activeProject.gallery.slice(0, 4).map((imgUrl, i) => (
                <button
                  key={imgUrl + i}
                  type="button"
                  className={`${styles.previewThumbnailBtn} ${
                    activeImage === imgUrl ? styles.previewThumbnailBtnActive : ""
                  }`}
                  onClick={() => setPreviewImageOverride(imgUrl)}
                  aria-label={`View photo ${i + 1}`}
                >
                  <Image
                    src={imgUrl}
                    alt=""
                    fill
                    className={styles.previewThumbImage}
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          ) : null}

          <div className={styles.previewBody}>
            <div className={styles.previewHeaderGroup}>
              <span className={styles.previewEyebrow}>
                Completed {activeCaseStudy.completionYear}
                {activeProject?.location
                  ? ` · ${activeProject.location.city}, ${activeProject.location.state}`
                  : ""}
              </span>
              <h3 className={styles.previewTitle}>{activeCaseStudy.title}</h3>
            </div>

            {/* Metrics Grid */}
            <div className={styles.previewMetricsGrid}>
              {activeProject?.builtUpArea ? (
                <div className={styles.previewMetricItem}>
                  <span className={styles.previewMetricLabel}>Built-up Area</span>
                  <span className={styles.previewMetricValue}>
                    {activeProject.builtUpArea.value.toLocaleString()}{" "}
                    {activeProject.builtUpArea.unit === "sq_ft" ? "sq ft" : "sq m"}
                  </span>
                </div>
              ) : null}
              {activeProject?.duration ? (
                <div className={styles.previewMetricItem}>
                  <span className={styles.previewMetricLabel}>Timeline</span>
                  <span className={styles.previewMetricValue}>{activeProject.duration}</span>
                </div>
              ) : null}
              {activeProject?.status ? (
                <div className={styles.previewMetricItem}>
                  <span className={styles.previewMetricLabel}>Status</span>
                  <span
                    className={styles.previewMetricValue}
                    style={{ textTransform: "capitalize" }}
                  >
                    {activeProject.status.replace("_", " ")}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Narrative Sections */}
            {activeCaseStudy.clientBrief ? (
              <div className={styles.previewNarrativeSection}>
                <h4 className={styles.previewNarrativeHeading}>Client Brief</h4>
                <p className={styles.previewNarrativeText}>{activeCaseStudy.clientBrief}</p>
              </div>
            ) : null}

            {activeCaseStudy.designResponse ? (
              <div className={styles.previewNarrativeSection}>
                <h4 className={styles.previewNarrativeHeading}>Design Response</h4>
                <p className={styles.previewNarrativeText}>{activeCaseStudy.designResponse}</p>
              </div>
            ) : null}

            {activeCaseStudy.scopeOfServices ? (
              <div className={styles.previewNarrativeSection}>
                <h4 className={styles.previewNarrativeHeading}>Scope of Services</h4>
                <p className={styles.previewNarrativeText}>{activeCaseStudy.scopeOfServices}</p>
              </div>
            ) : null}

            {activeCaseStudy.projectOutcome ? (
              <div className={styles.previewNarrativeSection}>
                <h4 className={styles.previewNarrativeHeading}>Project Outcome</h4>
                <p className={styles.previewNarrativeText}>{activeCaseStudy.projectOutcome}</p>
              </div>
            ) : null}

            {/* Key Materials */}
            {activeProject?.materials && activeProject.materials.length > 0 ? (
              <div className={styles.previewChipsSection}>
                <h4 className={styles.previewNarrativeHeading}>Key Materials</h4>
                <div className={styles.previewChipsList}>
                  {activeProject.materials.map((mat) => (
                    <span key={mat} className={styles.previewChip}>
                      {mat}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}
