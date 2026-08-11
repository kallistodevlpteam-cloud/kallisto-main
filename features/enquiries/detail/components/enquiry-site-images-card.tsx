"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronUp, ChevronDown } from "lucide-react";
import styles from "./enquiry-site-images-card.module.css";

export interface EnquirySiteImagesCardProps {
  /** Site image URLs strictly from the backend (project_site.site_img_url
   * list). Empty/absent renders the empty state; no hardcoded images. */
  images?: string[];
  title?: string;
  onImageClick?: (index: number) => void;
  onViewAll?: () => void;
}

export function EnquirySiteImagesCard({
  images = [],
  title = "Site Images Preview",
  onImageClick,
  onViewAll,
}: EnquirySiteImagesCardProps) {
  const [expanded, setExpanded] = useState(true);

  // Show up to 4 thumbnails on the row, 5th container is +N more tile
  const VISIBLE = 4;
  const visibleThumbs = images.slice(0, VISIBLE);
  const overflow = Math.max(0, images.length - VISIBLE);

  return (
    <div className={styles.card}>
      {/* ── Header row ── */}
      <button
        type="button"
        className={styles.header}
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        aria-controls="site-images-body"
        data-testid="site-images-toggle"
      >
        <span className={styles.headerTitle}>
          {title}
          <span className={styles.count}>({images.length})</span>
        </span>
        {expanded
          ? <ChevronUp size={15} className={styles.chevron} aria-hidden="true" />
          : <ChevronDown size={15} className={styles.chevron} aria-hidden="true" />
        }
      </button>

      {/* ── Image grid ── */}
      {expanded && (
        <div id="site-images-body" className={styles.grid}>
          {images.length === 0 ? (
            <div className={styles.emptyState} role="status">
              No site images have been shared yet.
            </div>
          ) : (
            <>
              {visibleThumbs.map((src, index) => (
                <button
                  key={`site-${index + 1}`}
                  type="button"
                  className={styles.thumbCard}
                  onClick={() => onImageClick?.(index)}
                  aria-label={`View site image ${index + 1}`}
                >
                  <Image
                    src={src}
                    alt={`Site image ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 20vw, 80px"
                    className={styles.thumbImage}
                  />
                </button>
              ))}

              {overflow > 0 && (
                <button
                  type="button"
                  className={styles.moreCard}
                  onClick={onViewAll}
                  aria-label={`View ${overflow} more site images`}
                >
                  <span className={styles.moreNumber}>+{overflow}</span>
                  <span className={styles.moreText}>more</span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}