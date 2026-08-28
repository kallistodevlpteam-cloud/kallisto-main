"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, EyeOff, Tag, Trash2, Users } from "lucide-react";
import type { TaggedPortfolioItem } from "@/features/portfolio/types/portfolio.types";
import { PortfolioEmptyState } from "./portfolio-empty-state";
import styles from "./portfolio.module.css";

interface PortfolioTaggedGridProps {
  initialItems: TaggedPortfolioItem[];
  isOwner: boolean;
}

export function PortfolioTaggedGrid({
  initialItems,
  isOwner,
}: PortfolioTaggedGridProps) {
  const [items, setItems] = useState(initialItems);

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
    <div className={styles.instaGrid}>
      {items.map((item, index) => (
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
  );
}
