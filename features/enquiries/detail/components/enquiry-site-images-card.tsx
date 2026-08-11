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
  { id: "site-1", src: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80", alt: "Architectural Drawings & Design Moodboard" },
  { id: "site-2", src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80", alt: "Exterior Stone & Glass Facade" },
  { id: "site-3", src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80", alt: "Double-Height Interior Living Room" },
  { id: "site-4", src: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80", alt: "Master Suite & Courtyard Connection" },
];

export function EnquirySiteImagesCard({
  images = DEFAULT_SITE_IMAGES,
  totalCount = 8,
  extraCount,
  title = "INSPIRATION IMAGES",
  onImageClick,
  onViewAll,
}: EnquirySiteImagesCardProps) {
  const [expanded, setExpanded] = useState(true);

  // Render 3 normal image cards + 1 overflow "+N" image overlay card
  const VISIBLE_NORMAL = 3;
  const normalThumbs = images.slice(0, VISIBLE_NORMAL);
  const overflowThumb = images[3] || images[0];
  const overflowCount =
    extraCount !== undefined ? extraCount : Math.max(0, totalCount - VISIBLE_NORMAL);

  return (
    <div className={styles.container}>
      {/* ── Collapsible Header Row ── */}
      <button
        type="button"
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
      {expanded && (
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
                unoptimized
              />
            </button>
          ))}

          {/* 4th Card: Image Background with Dark Translucent +N Overlay */}
          {overflowCount > 0 && (
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
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
