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
  extraCount?: number;
  title?: string;
  onImageClick?: (index: number) => void;
  onViewAll?: () => void;
}

const DEFAULT_SITE_IMAGES: SiteImageItem[] = [
  { id: "site-1", src: "/assets/project-banner.jpg", alt: "Architectural Concept Presentation" },
  { id: "site-2", src: "/assets/nila-thumb1.jpg", alt: "Exterior Stone & Glass Facade" },
  { id: "site-3", src: "/assets/nila-thumb2.jpg", alt: "Double-Height Interior Living Room" },
  { id: "site-4", src: "/assets/nila-thumb3.jpg", alt: "Aerial Construction Site & Boundary" },
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

  // Render 4 normal image cards + 1 overflow "+N" tile
  const VISIBLE_NORMAL = 4;
  const hasImages = images.length > 0;
  const normalThumbs = images.slice(0, VISIBLE_NORMAL);
  const overflowThumb = images[4] || images[0];
  const overflowCount =
    extraCount !== undefined ? extraCount : Math.max(0, totalCount - VISIBLE_NORMAL);

  return (
    <div className={styles.container}>
      {/* ── Collapsible Header Row ── */}
      <button
        type="button"
        data-testid="site-images-toggle"
        className={styles.headerToggle}
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        aria-controls="site-images-gallery"
      >
        <span className={styles.headerTitle}>{title}</span>
        {expanded ? (
          <ChevronUp size={15} className={styles.chevron} />
        ) : (
          <ChevronDown size={15} className={styles.chevron} />
        )}
      </button>

      {/* ── 4-Column Image Gallery Grid ── */}
      {expanded && !hasImages && (
        <p className={styles.emptyState} aria-label="No site images available">
          No site images have been shared yet.
        </p>
      )}
      {expanded && hasImages && (
        <div id="site-images-gallery" className={styles.galleryGrid}>
          {normalThumbs.map((img, index) => (
            <button
              key={img.id}
              type="button"
              className={styles.imageCard}
              onClick={() => onImageClick?.(index)}
              aria-label={img.alt}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className={styles.cardImage}
              />
            </button>
          ))}

          {/* Overflow Card: Image Background with Dark Translucent +N Overlay */}
          <button
            type="button"
            className={styles.overflowCard}
            onClick={onViewAll}
            aria-label={`View ${overflowCount} more images`}
          >
            <Image
              src={overflowThumb.src}
              alt={overflowThumb.alt}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={styles.cardImage}
            />
            <div className={styles.overflowOverlay}>
              <span className={styles.overflowText}>+{overflowCount}</span>
              <span style={{ fontSize: "11px", fontWeight: 500, color: "#94a3b8" }}>more</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
