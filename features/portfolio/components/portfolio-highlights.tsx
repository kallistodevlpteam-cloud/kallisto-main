"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import type { PortfolioCollection } from "@/features/portfolio/types/portfolio.types";
import styles from "./portfolio.module.css";

interface PortfolioHighlightsProps {
  collections: PortfolioCollection[];
  isOwner: boolean;
  selectedCollectionId: string;
  onSelect: (collection: PortfolioCollection) => void;
  onAddCollection?: () => void;
}

export function PortfolioHighlights({
  collections,
  isOwner,
  selectedCollectionId,
  onSelect,
  onAddCollection,
}: PortfolioHighlightsProps) {
  return (
    <section className={styles.highlightsSection} aria-label="Portfolio Highlights">
      <div className={styles.highlightsHeader}>
        <h2 className={styles.highlightsTitle}>Portfolio Highlights</h2>
        <p className={styles.highlightsSubtitle}>
          Selected work, process and professional focus
        </p>
      </div>

      <div className={styles.highlightsRow} role="group" aria-label="Portfolio collection highlights">
        {isOwner ? (
          <button
            type="button"
            className={styles.highlightNewRectCard}
            onClick={onAddCollection}
            aria-label="Add new collection"
          >
            <Plus size={22} />
            <span className={styles.highlightNewRectLabel}>New Collection</span>
          </button>
        ) : null}

        {collections.map((collection) => {
          const isSelected = collection.id === selectedCollectionId;

          return (
            <button
              key={collection.id}
              type="button"
              className={`${styles.highlightRectCard} ${
                isSelected ? styles.highlightRectCardActive : ""
              }`}
              onClick={() => onSelect(collection)}
              aria-label={collection.label}
              aria-pressed={isSelected}
            >
              {collection.imageUrl ? (
                <Image
                  src={collection.imageUrl}
                  alt={collection.label}
                  fill
                  className={styles.highlightCardBg}
                  sizes="125px"
                />
              ) : null}

              <div className={styles.highlightCardOverlay}>
                <p className={styles.highlightCardLabel}>{collection.label}</p>
                <span className={styles.highlightCardCount}>
                  {collection.projectIds?.length ?? 0} {collection.projectIds?.length === 1 ? "project" : "projects"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export { PortfolioHighlights as PortfolioCollections };
