"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { ProjectUpdateAttachment } from "@/types/domain/project-update";
import styles from "../projects.module.css";

interface ProjectUpdateMediaGridProps {
  attachments: ProjectUpdateAttachment[];
}

export function ProjectUpdateMediaGrid({ attachments }: ProjectUpdateMediaGridProps) {
  const images = attachments.filter((att) => att.type === "image");
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  const handleOpenLightbox = (index: number) => {
    setActiveLightboxIndex(index);
  };

  const handleCloseLightbox = () => {
    setActiveLightboxIndex(null);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex((prev) => (prev! === 0 ? images.length - 1 : prev! - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex((prev) => (prev! === images.length - 1 ? 0 : prev! + 1));
  };

  // Determine adaptive layout grid class based on count
  const renderGridContent = () => {
    const count = images.length;

    if (count === 1) {
      return (
        <div className={styles.mediaGridOne} onClick={() => handleOpenLightbox(0)}>
          <div className={styles.mediaAspectWrapper16x9}>
            <Image
              src={images[0].url}
              alt={images[0].name || "Site photo"}
              fill
              className={styles.mediaGridImage}
              unoptimized
            />
            {images[0].overlayBadgeText && (
              <div className={styles.mediaOverlayBadge}>
                {images[0].overlayBadgeText}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (count === 2) {
      return (
        <div className={styles.mediaGridTwo}>
          {images.map((img, idx) => (
            <div key={img.id} className={styles.mediaAspectWrapperCol} onClick={() => handleOpenLightbox(idx)}>
              <Image
                src={img.url}
                alt={img.name || `Site photo ${idx + 1}`}
                fill
                className={styles.mediaGridImage}
                unoptimized
              />
            </div>
          ))}
        </div>
      );
    }

    if (count === 3) {
      return (
        <div className={styles.mediaGridThree}>
          <div className={styles.mediaGridThreeMain} onClick={() => handleOpenLightbox(0)}>
            <Image
              src={images[0].url}
              alt={images[0].name || "Site photo 1"}
              fill
              className={styles.mediaGridImage}
              unoptimized
            />
          </div>
          <div className={styles.mediaGridThreeSide}>
            <div className={styles.mediaAspectWrapperCol} onClick={() => handleOpenLightbox(1)}>
              <Image
                src={images[1].url}
                alt={images[1].name || "Site photo 2"}
                fill
                className={styles.mediaGridImage}
                unoptimized
              />
            </div>
            <div className={styles.mediaAspectWrapperCol} onClick={() => handleOpenLightbox(2)}>
              <Image
                src={images[2].url}
                alt={images[2].name || "Site photo 3"}
                fill
                className={styles.mediaGridImage}
                unoptimized
              />
            </div>
          </div>
        </div>
      );
    }

    if (count === 4) {
      return (
        <div className={styles.mediaGridFourRow}>
          {images.map((img, idx) => (
            <div key={img.id} className={styles.mediaAspectWrapperCol4} onClick={() => handleOpenLightbox(idx)}>
              <Image
                src={img.url}
                alt={img.name || `Site photo ${idx + 1}`}
                fill
                className={styles.mediaGridImage}
                unoptimized
              />
            </div>
          ))}
        </div>
      );
    }

    // 5+ images (Reference proportional 5-column grid layout with 6th item / +N overlay)
    const displayed = images.slice(0, 6);
    const extraCount = images.length - 6;

    return (
      <div className={styles.mediaGridFive}>
        {displayed.map((img, idx) => {
          const isSixth = idx === 5;
          const showOverlay = (isSixth && extraCount >= 0) || (idx === displayed.length - 1 && extraCount > 0);
          return (
            <div
              key={img.id}
              className={`${styles.mediaAspectWrapperItem} ${styles[`mediaItemTile${idx + 1}`]}`}
              onClick={() => handleOpenLightbox(idx)}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleOpenLightbox(idx);
              }}
            >
              <Image
                src={img.url}
                alt={img.name || `Site photo ${idx + 1}`}
                fill
                className={styles.mediaGridImage}
                unoptimized
              />
              {showOverlay && extraCount > 0 && (
                <div className={styles.mediaMoreOverlay}>
                  <span>+{extraCount} more</span>
                </div>
              )}
              {isSixth && extraCount === 0 && (
                <div className={styles.mediaMoreOverlay}>
                  <span>+2 more</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className={`${styles.projectUpdateMedia} ${styles.projectUpdateMediaGrid}`} data-count={images.length}>
        {renderGridContent()}
      </div>

      {/* Lightbox Popover */}
      {activeLightboxIndex !== null && (
        <div className={styles.lightboxBackdrop} onClick={handleCloseLightbox} role="dialog" aria-modal="true">
          <button
            type="button"
            className={styles.lightboxCloseBtn}
            onClick={handleCloseLightbox}
            aria-label="Close Lightbox"
          >
            <X size={20} />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                className={`${styles.lightboxNavBtn} ${styles.lightboxNavPrev}`}
                onClick={handlePrev}
                aria-label="Previous Image"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                className={`${styles.lightboxNavBtn} ${styles.lightboxNavNext}`}
                onClick={handleNext}
                aria-label="Next Image"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <div className={styles.lightboxContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lightboxImageWrapper}>
              <Image
                src={images[activeLightboxIndex].url}
                alt={images[activeLightboxIndex].name || "Enlarged site photo"}
                fill
                className={styles.lightboxImage}
                unoptimized
              />
            </div>
            <div className={styles.lightboxCaption}>
              <span>{images[activeLightboxIndex].name}</span>
              <span className={styles.lightboxCount}>
                {activeLightboxIndex + 1} of {images.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
