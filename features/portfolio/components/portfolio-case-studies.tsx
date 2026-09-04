"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import type {
  ConstructionProjectType,
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
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export function PortfolioCaseStudies({
  caseStudies,
  projects,
  isOwner,
  onOpenProject,
  selectedCategory: controlledCategory,
  onSelectCategory,
}: PortfolioCaseStudiesProps) {
  const [internalCategory, setInternalCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCaseStudyId, setSelectedCaseStudyId] = useState<string>(
    caseStudies[0]?.id ?? "",
  );
  const [previewImageOverride, setPreviewImageOverride] = useState<string | null>(null);

  const activeCategory = controlledCategory ?? internalCategory;

  const handleCategoryChange = (category: string) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }
    setInternalCategory(category);
  };

  // Derive available categories and their counts from caseStudies
  const categories = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    for (const cs of caseStudies) {
      if (cs.projectType) {
        typeCounts[cs.projectType] = (typeCounts[cs.projectType] || 0) + 1;
      }
    }

    const uniqueTypes = Object.keys(typeCounts) as ConstructionProjectType[];
    return [
      { id: "all", label: "All", count: caseStudies.length },
      ...uniqueTypes.map((type) => ({
        id: type,
        label: formatProjectType(type),
        count: typeCounts[type],
      })),
    ];
  }, [caseStudies]);

  const filteredCaseStudies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return caseStudies.filter((cs) => {
      // 1. Category match
      const matchesCategory =
        activeCategory === "all" || cs.projectType === activeCategory;
      if (!matchesCategory) return false;

      // 2. Search query match
      if (!query) return true;

      const project = projects.find((p) => p.id === cs.projectId);

      const titleMatch = cs.title.toLowerCase().includes(query);
      const briefMatch = cs.clientBrief?.toLowerCase().includes(query);
      const responseMatch = cs.designResponse?.toLowerCase().includes(query);
      const scopeMatch = cs.scopeOfServices?.toLowerCase().includes(query);
      const outcomeMatch = cs.projectOutcome?.toLowerCase().includes(query);
      const cityMatch = project?.location?.city?.toLowerCase().includes(query);
      const stateMatch = project?.location?.state?.toLowerCase().includes(query);
      const districtMatch = project?.location?.district?.toLowerCase().includes(query);
      const countryMatch = project?.location?.country?.toLowerCase().includes(query);

      return (
        titleMatch ||
        briefMatch ||
        responseMatch ||
        scopeMatch ||
        outcomeMatch ||
        cityMatch ||
        stateMatch ||
        districtMatch ||
        countryMatch
      );
    });
  }, [caseStudies, projects, activeCategory, searchQuery]);

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
    filteredCaseStudies.find((candidate) => candidate.id === selectedCaseStudyId) ??
    filteredCaseStudies[0];

  const activeProject = activeCaseStudy
    ? projects.find((candidate) => candidate.id === activeCaseStudy.projectId)
    : undefined;

  const activeImage =
    previewImageOverride ?? activeCaseStudy?.coverImageUrl ?? "";

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
    <div className={styles.projectGridWrapper}>
      {/* Toolbar: Category Filter Pills & Search Input */}
      <div className={styles.projectToolbar}>
        {categories.length > 1 && (
          <div
            className={styles.projectCategoryFilterBar}
            role="tablist"
            aria-label="Filter case studies by category"
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`${styles.categoryFilterPill} ${
                    isActive ? styles.categoryFilterPillActive : ""
                  }`}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  <span>{cat.label}</span>
                  <span className={styles.categoryCountBadge}>{cat.count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Search input for case study name or keywords */}
        <div className={styles.projectSearchWrapper}>
          <Search size={14} className={styles.projectSearchIcon} aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or keywords..."
            aria-label="Search case studies by name or keywords"
            className={styles.projectSearchInput}
          />
          {searchQuery ? (
            <button
              type="button"
              className={styles.projectSearchClear}
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              title="Clear search"
            >
              <X size={12} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Main Case Studies Layout or Empty Filter State */}
      {filteredCaseStudies.length > 0 && activeCaseStudy ? (
        <div className={styles.caseStudyLayout}>
          <div className={styles.caseStudyList}>
            {filteredCaseStudies.map((caseStudy, index) => {
              const project = projects.find(
                (candidate) => candidate.id === caseStudy.projectId,
              );
              const categoryLabel = formatProjectType(caseStudy.projectType);
              const isSelected = caseStudy.id === activeCaseStudy.id;

              return (
                <article
                  className={`${styles.caseStudyCard} ${
                    isSelected ? styles.caseStudyCardSelected : ""
                  }`}
                  key={caseStudy.id}
                  onClick={(e) =>
                    handleCardInteraction(caseStudy, project, e.currentTarget)
                  }
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
          <aside
            className={styles.caseStudyPreviewSidebar}
            aria-label="Case study preview"
          >
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
                <div
                  className={styles.previewThumbnailRow}
                  aria-label="Preview gallery thumbnails"
                >
                  {activeProject.gallery.slice(0, 4).map((imgUrl, i) => (
                    <button
                      key={imgUrl + i}
                      type="button"
                      className={`${styles.previewThumbnailBtn} ${
                        activeImage === imgUrl
                          ? styles.previewThumbnailBtnActive
                          : ""
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
                      <span className={styles.previewMetricLabel}>
                        Built-up Area
                      </span>
                      <span className={styles.previewMetricValue}>
                        {activeProject.builtUpArea.value.toLocaleString()}{" "}
                        {activeProject.builtUpArea.unit === "sq_ft"
                          ? "sq ft"
                          : "sq m"}
                      </span>
                    </div>
                  ) : null}
                  {activeProject?.duration ? (
                    <div className={styles.previewMetricItem}>
                      <span className={styles.previewMetricLabel}>Timeline</span>
                      <span className={styles.previewMetricValue}>
                        {activeProject.duration}
                      </span>
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
                    <h4 className={styles.previewNarrativeHeading}>
                      Client Brief
                    </h4>
                    <p className={styles.previewNarrativeText}>
                      {activeCaseStudy.clientBrief}
                    </p>
                  </div>
                ) : null}

                {activeCaseStudy.designResponse ? (
                  <div className={styles.previewNarrativeSection}>
                    <h4 className={styles.previewNarrativeHeading}>
                      Design Response
                    </h4>
                    <p className={styles.previewNarrativeText}>
                      {activeCaseStudy.designResponse}
                    </p>
                  </div>
                ) : null}

                {activeCaseStudy.scopeOfServices ? (
                  <div className={styles.previewNarrativeSection}>
                    <h4 className={styles.previewNarrativeHeading}>
                      Scope of Services
                    </h4>
                    <p className={styles.previewNarrativeText}>
                      {activeCaseStudy.scopeOfServices}
                    </p>
                  </div>
                ) : null}

                {activeCaseStudy.projectOutcome ? (
                  <div className={styles.previewNarrativeSection}>
                    <h4 className={styles.previewNarrativeHeading}>
                      Project Outcome
                    </h4>
                    <p className={styles.previewNarrativeText}>
                      {activeCaseStudy.projectOutcome}
                    </p>
                  </div>
                ) : null}

                {/* Key Materials */}
                {activeProject?.materials && activeProject.materials.length > 0 ? (
                  <div className={styles.previewChipsSection}>
                    <h4 className={styles.previewNarrativeHeading}>
                      Key Materials
                    </h4>
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
      ) : (
        <div className={styles.categoryEmptyContainer}>
          <h4 className={styles.categoryEmptyTitle}>
            {searchQuery
              ? `No case studies matching "${searchQuery}"`
              : `No ${
                  formatProjectType(activeCategory as ConstructionProjectType) ||
                  "matching"
                } case studies`}
          </h4>
          <p className={styles.categoryEmptyDesc}>
            {searchQuery
              ? `We couldn't find any case studies matching your search in ${
                  activeCategory === "all"
                    ? "the portfolio"
                    : formatProjectType(activeCategory as ConstructionProjectType)
                }.`
              : "There are currently no case studies matching this category."}
          </p>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {searchQuery && (
              <button
                type="button"
                className={styles.resetCategoryBtn}
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </button>
            )}
            {activeCategory !== "all" && (
              <button
                type="button"
                className={styles.resetCategoryBtn}
                onClick={() => handleCategoryChange("all")}
              >
                View all case studies ({caseStudies.length})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
