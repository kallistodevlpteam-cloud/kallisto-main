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
          Seleced Work, process and professional focus
        </p>
      </div>

      <div className={styles.highlightsRow} role="group" aria-label="Portfolio story highlights">
        {isOwner ? (
          <button
            type="button"
            className={styles.highlightItemButton}
            onClick={onAddCollection}
            aria-label="Add new collection"
          >
            <div className={`${styles.highlightCircleOuter} ${styles.highlightNewOuter}`}>
              <div className={styles.highlightNewInner}>
                <Plus size={24} className={styles.highlightPlusIcon} aria-hidden="true" />
              </div>
            </div>
            <span className={styles.highlightLabel}>New</span>
          </button>
        ) : null}

        {collections.map((collection) => {
          const isSelected = collection.id === selectedCollectionId;
          const hasRing = collection.hasGradientRing ?? true;

          return (
            <button
              key={collection.id}
              type="button"
              className={styles.highlightItemButton}
              onClick={() => onSelect(collection)}
              aria-label={collection.label}
              aria-pressed={isSelected}
            >
              <div
                className={`${styles.highlightCircleOuter} ${
                  hasRing ? styles.highlightGradientRing : styles.highlightSimpleRing
                } ${isSelected ? styles.highlightSelectedRing : ""}`}
              >
                <div className={styles.highlightCircleInner}>
                  <div className={styles.highlightImageFrame}>
                    {collection.imageUrl ? (
                      <Image
                        src={collection.imageUrl}
                        alt={collection.label}
                        fill
                        className={styles.highlightImage}
                        sizes="76px"
                      />
                    ) : (
                      <span className={styles.highlightInitial}>
                        {collection.label[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className={styles.highlightLabel} title={collection.label}>
                {collection.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export { PortfolioHighlights as PortfolioCollections };
