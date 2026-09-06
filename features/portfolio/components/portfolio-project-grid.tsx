"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type {
  ConstructionProjectType,
  PortfolioProfile,
  PortfolioProject,
} from "@/features/portfolio/types/portfolio.types";
import { formatProjectType } from "@/features/portfolio/utils/portfolio-project-format";
import { PortfolioEmptyState } from "./portfolio-empty-state";
import { PortfolioInstaTile } from "./portfolio-insta-tile";
import styles from "./portfolio.module.css";

interface PortfolioProjectGridProps {
  projects: PortfolioProject[];
  profile: PortfolioProfile;
  isOwner: boolean;
  onOpenProject?: (
    project: PortfolioProject,
    trigger: HTMLElement,
  ) => void;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export function PortfolioProjectGrid({
  projects,
  isOwner,
  onOpenProject,
  selectedCategory: controlledCategory,
  onSelectCategory,
}: PortfolioProjectGridProps) {
  const [internalCategory, setInternalCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const activeCategory = controlledCategory ?? internalCategory;

  const handleCategoryChange = (category: string) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }
    setInternalCategory(category);
  };

  // Derive available categories and their counts from projects
  const categories = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    for (const project of projects) {
      if (project.projectType) {
        typeCounts[project.projectType] = (typeCounts[project.projectType] || 0) + 1;
      }
    }

    const uniqueTypes = Object.keys(typeCounts) as ConstructionProjectType[];
    return [
      { id: "all", label: "All", count: projects.length },
      ...uniqueTypes.map((type) => ({
        id: type,
        label: formatProjectType(type),
        count: typeCounts[type],
      })),
    ];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return projects.filter((project) => {
      // 1. Category match
      const matchesCategory =
        activeCategory === "all" || project.projectType === activeCategory;
      if (!matchesCategory) return false;

      // 2. Search query match (project title or location)
      if (!query) return true;

      const titleMatch = project.title.toLowerCase().includes(query);
      const cityMatch = project.location?.city?.toLowerCase().includes(query);
      const stateMatch = project.location?.state?.toLowerCase().includes(query);
      const districtMatch = project.location?.district?.toLowerCase().includes(query);
      const countryMatch = project.location?.country?.toLowerCase().includes(query);

      return (
        titleMatch ||
        cityMatch ||
        stateMatch ||
        districtMatch ||
        countryMatch
      );
    });
  }, [projects, activeCategory, searchQuery]);

  if (projects.length === 0) {
    return (
      <PortfolioEmptyState
        title="No published projects"
        description={
          isOwner
            ? "Add your first project to start building the visual portfolio."
            : "Published work will appear here when it becomes available."
        }
        actionLabel={isOwner ? "Add project" : undefined}
        actionHref={
          isOwner
            ? "/portfolio/projects/new"
            : undefined
        }
      />
    );
  }

  return (
    <div className={styles.projectGridWrapper}>
      {/* Toolbar: Category Filter Pills & Search Input */}
      <div className={styles.projectToolbar}>
        {categories.length > 1 && (
          <div
            className={styles.projectCategoryFilterBar}
            role="tablist"
            aria-label="Filter projects by category"
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

        {/* Search input for project name or location */}
        <div className={styles.projectSearchWrapper}>
          <Search size={14} className={styles.projectSearchIcon} aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or location..."
            aria-label="Search projects by name or location"
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

      {/* Project Grid or Filter Empty State */}
      {filteredProjects.length > 0 ? (
        <div className={styles.instaGrid}>
          {filteredProjects.map((project, index) => (
            <PortfolioInstaTile
              project={project}
              eager={index < 4}
              onOpen={onOpenProject}
              key={project.id}
            />
          ))}
        </div>
      ) : (
        <div className={styles.categoryEmptyContainer}>
          <h4 className={styles.categoryEmptyTitle}>
            {searchQuery
              ? `No projects matching "${searchQuery}"`
              : `No ${formatProjectType(activeCategory as ConstructionProjectType) || "matching"} projects`}
          </h4>
          <p className={styles.categoryEmptyDesc}>
            {searchQuery
              ? `We couldn't find any projects matching your search in ${activeCategory === "all" ? "the portfolio" : formatProjectType(activeCategory as ConstructionProjectType)}.`
              : "There are currently no projects matching this category in the selected collection."}
          </p>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
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
                View all projects ({projects.length})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
