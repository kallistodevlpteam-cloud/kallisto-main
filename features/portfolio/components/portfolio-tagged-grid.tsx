"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Check, EyeOff, Tag, Trash2, Users } from "lucide-react";
import type { TaggedPortfolioItem } from "@/features/portfolio/types/portfolio.types";
import { formatProjectType } from "@/features/portfolio/utils/portfolio-project-format";
import { PortfolioEmptyState } from "./portfolio-empty-state";
import styles from "./portfolio.module.css";

interface PortfolioTaggedGridProps {
  initialItems: TaggedPortfolioItem[];
  isOwner: boolean;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export function PortfolioTaggedGrid({
  initialItems,
  isOwner,
  selectedCategory: controlledCategory,
  onSelectCategory,
}: PortfolioTaggedGridProps) {
  const [items, setItems] = useState(initialItems);
  const [internalCategory, setInternalCategory] = useState<string>("all");
  const activeCategory = controlledCategory ?? internalCategory;

  const handleCategoryChange = (category: string) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }
    setInternalCategory(category);
  };

  // Derive available categories and their counts from tagged items
  const categories = useMemo(() => {
    const typeCounts: Record<string, { label: string; count: number }> = {};
    for (const item of items) {
      const typeKey = item.projectType || item.category || (item.role.toLowerCase().includes("interior") ? "interior" : "architecture");
      const label = item.projectType ? formatProjectType(item.projectType) : (item.category || item.role);
      if (!typeCounts[typeKey]) {
        typeCounts[typeKey] = { label, count: 0 };
      }
      typeCounts[typeKey].count += 1;
    }

    return [
      { id: "all", label: "All", count: items.length },
      ...Object.entries(typeCounts).map(([id, meta]) => ({
        id,
        label: meta.label,
        count: meta.count,
      })),
    ];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (activeCategory === "all") {
      return items;
    }
    return items.filter((item) => {
      const typeKey = item.projectType || item.category || (item.role.toLowerCase().includes("interior") ? "interior" : "architecture");
      return typeKey === activeCategory || item.projectType === activeCategory || item.category === activeCategory;
    });
  }, [items, activeCategory]);

  if (items.length === 0) {
    return (
      <PortfolioEmptyState
        title="No tagged projects"
        description={
          isOwner
            ? "Collaborations that credit your work will appear here for review."
            : "There are no visible tagged collaborations yet."
        }
      />
    );
  }

  const updateItem = (
    id: string,
    status: TaggedPortfolioItem["status"],
  ) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  };

  return (
    <div className={styles.projectGridWrapper}>
      {/* Category / Type Filter Bar */}
      {categories.length > 1 && (
        <div
          className={styles.projectCategoryFilterBar}
          role="tablist"
          aria-label="Filter tagged projects by category"
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

      {/* Tagged Grid or Empty State */}
      {filteredItems.length > 0 ? (
        <div className={styles.instaGrid}>
          {filteredItems.map((item, index) => (
            <article className={styles.instaTile} key={item.id}>
              <div className={styles.instaTileButton} role="region" aria-label={`${item.projectName} collaboration`}>
                <span className={styles.instaMedia}>
                  <Image
                    src={item.coverImageUrl}
                    alt={`${item.projectName} cover`}
                    fill
                    priority={index < 4}
                    loading={index < 4 ? "eager" : "lazy"}
                    className={styles.instaImage}
                    sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, (max-width: 1200px) 25vw, 20vw"
                  />

                  {/* Tagged indicator top right */}
                  <span className={styles.instaMultiIcon} title={`Tagged by ${item.collaborator}`}>
                    <Tag size={13} aria-hidden="true" />
                  </span>

                  {/* Top Left Role Badge */}
                  <span className={styles.hoverCategoryBadge}>{item.role}</span>

                  {/* Bottom Hover Overlay with Details */}
                  <span className={styles.instaHoverOverlay}>
                    <span className={styles.hoverContentGroup}>
                      <h3 className={styles.hoverProjectTitle}>{item.projectName}</h3>
                      <span className={styles.hoverLocationRow}>
                        <Users size={13} className={styles.pinIcon} aria-hidden="true" />
                        <span>{item.collaborator}</span>
                      </span>
                      <span className={styles.hoverFooterRow}>
                        <span>{item.role}</span>
                        <span>By {item.originalOwner}</span>
                      </span>
                    </span>
                  </span>
                </span>
              </div>

              {isOwner ? (
                <div className={styles.taggedOverlayActions}>
                  {item.status !== "Approved" ? (
                    <button
                      type="button"
                      className={styles.taggedActionBtn}
                      onClick={() => updateItem(item.id, "Approved")}
                      title="Approve tag"
                      aria-label="Approve tag"
                    >
                      <Check size={12} aria-hidden="true" />
                    </button>
                  ) : null}
                  {item.status !== "Hidden" ? (
                    <button
                      type="button"
                      className={styles.taggedActionBtn}
                      onClick={() => updateItem(item.id, "Hidden")}
                      title="Hide tag"
                      aria-label="Hide tag"
                    >
                      <EyeOff size={12} aria-hidden="true" />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className={styles.taggedActionBtn}
                    onClick={() =>
                      setItems((current) =>
                        current.filter((candidate) => candidate.id !== item.id),
                      )
                    }
                    title="Remove tag"
                    aria-label="Remove tag"
                  >
                    <Trash2 size={12} aria-hidden="true" />
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.categoryEmptyContainer}>
          <h4 className={styles.categoryEmptyTitle}>No matching tagged projects</h4>
          <p className={styles.categoryEmptyDesc}>
            There are currently no tagged collaborations matching this category.
          </p>
          <button
            type="button"
            className={styles.resetCategoryBtn}
            onClick={() => handleCategoryChange("all")}
          >
            View all tagged projects ({items.length})
          </button>
        </div>
      )}
    </div>
  );
}
