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
  showAll?: boolean;
  onImageClick?: (index: number) => void;
  onViewAll?: () => void;
}

const DEFAULT_SITE_IMAGES: SiteImageItem[] = [
  { id: "site-1", src: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80", alt: "Architectural Drawings & Design Moodboard" },
  { id: "site-2", src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80", alt: "Exterior Stone & Glass Facade" },
  { id: "site-3", src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80", alt: "Double-Height Interior Living Room" },
  { id: "site-4", src: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80", alt: "Master Suite & Courtyard Connection" },
  { id: "site-5", src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", alt: "Modern Kitchen & Dining Layout" },
  { id: "site-6", src: "https://images.unsplash.com/photo-1600573472591-ee6c563aaec9?auto=format&fit=crop&w=800&q=80", alt: "Outdoor Patio & Pool Area" },
  { id: "site-7", src: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80", alt: "Minimalist Bathroom & Teak Accents" },
  { id: "site-8", src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80", alt: "Home Office & Study Area" },
];

export function EnquirySiteImagesCard({
  images = DEFAULT_SITE_IMAGES,
  totalCount = 7,
  extraCount,
  title = "Site Images Preview",
  showAll = false,
  onImageClick,
  onViewAll,
}: EnquirySiteImagesCardProps) {
  const [expanded, setExpanded] = useState(true);

  const hasImages = images.length > 0;
  const VISIBLE = showAll ? images.length : 4;
  const displayImages = images.slice(0, VISIBLE);
  const overflowThumb = images[4] || images[0];
  const overflowCount =
    extraCount !== undefined ? extraCount : Math.max(0, totalCount - 4);

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
          {displayImages.map((img, index) => (
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
                unoptimized
              />
            </button>
          ))}

          {/* 4th Card Overflow +N Overlay (Only rendered if showAll is explicitly false) */}
          {!showAll && overflowCount > 0 && (
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
                unoptimized
              />
              <div className={styles.overflowOverlay}>
                <span className={styles.overflowText}>+{overflowCount}</span>
                <span style={{ fontSize: "11px", fontWeight: 500, color: "#94a3b8" }}>more</span>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
