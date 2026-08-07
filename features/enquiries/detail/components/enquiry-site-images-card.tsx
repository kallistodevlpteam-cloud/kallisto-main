"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronUp, ChevronDown } from "lucide-react";
import styles from "./enquiry-site-images-card.module.css";

export interface SiteImageItem {
  id: string;
  src: string;
  alt: string;
}

export interface EnquirySiteImagesCardProps {
  images?: SiteImageItem[];
  totalCount?: number;
  title?: string;
  onImageClick?: (index: number) => void;
  onViewAll?: () => void;
}

const DEFAULT_SITE_IMAGES: SiteImageItem[] = [
  { id: "site-1", src: "/assets/nila-thumb1.jpg", alt: "Site Inspection Ground Work" },
  { id: "site-2", src: "/assets/nila-thumb2.jpg", alt: "Site Structure Construction" },
  { id: "site-3", src: "/assets/nila-thumb3.jpg", alt: "Site Boundary & Masonry" },
  { id: "site-4", src: "/assets/nila-thumb4.jpg", alt: "Site Interior Progress" },
];

export function EnquirySiteImagesCard({
  images = DEFAULT_SITE_IMAGES,
  totalCount = 7,
  extraCount,
  title = "Site Images Preview",
  onImageClick,
  onViewAll,
}: EnquirySiteImagesCardProps) {
  const [expanded, setExpanded] = useState(true);

  // Show up to 4 thumbnails on the row, 5th container is +N more tile
  const VISIBLE = 4;
  const visibleThumbs = images.slice(0, VISIBLE);
  const overflow = extraCount !== undefined ? extraCount : Math.max(0, totalCount - visibleThumbs.length);
  const calculatedTotal = extraCount !== undefined ? visibleThumbs.length + extraCount : totalCount;

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
          <span className={styles.count}>({calculatedTotal})</span>
        </span>
        {expanded
          ? <ChevronUp size={15} className={styles.chevron} aria-hidden="true" />
          : <ChevronDown size={15} className={styles.chevron} aria-hidden="true" />
        }
      </button>

      {/* ── Image grid ── */}
      {expanded && (
        <div id="site-images-body" className={styles.grid}>
          {visibleThumbs.map((img, index) => (
            <button
              key={img.id}
              type="button"
              className={styles.thumbCard}
              onClick={() => onImageClick?.(index)}
            >
              <Image
                src={img.src}
                alt={img.alt}
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
        </div>
      )}
    </div>
  );
}
