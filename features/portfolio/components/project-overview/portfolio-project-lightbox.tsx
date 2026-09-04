"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { PortfolioGalleryItem } from "@/features/portfolio/types/portfolio.types";
import styles from "./portfolio-project-overview.module.css";

interface PortfolioProjectLightboxProps {
  isOpen: boolean;
  images: PortfolioGalleryItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function PortfolioProjectLightbox({
  isOpen,
  images,
  currentIndex,
  onClose,
  onNavigate,
}: PortfolioProjectLightboxProps) {
  const total = images.length;
  const currentItem = images[currentIndex];

  const handlePrev = useCallback(() => {
    onNavigate((currentIndex - 1 + total) % total);
  }, [currentIndex, total, onNavigate]);

  const handleNext = useCallback(() => {
    onNavigate((currentIndex + 1) % total);
  }, [currentIndex, total, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !currentItem) return null;

  const counterText = `${String(currentIndex + 1).padStart(2, "0")} / ${String(
    total,
  ).padStart(2, "0")}`;

  return (
    <div
      className={styles.lightboxOverlay}
      role="dialog"
      aria-modal="true"
      aria-label="Project Gallery Lightbox"
      onClick={onClose}
    >
      {/* Lightbox Header */}
      <div className={styles.lightboxHeader} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className={styles.lightboxCounter}>{counterText}</span>
          <span className={styles.galleryCategoryTag}>{currentItem.category}</span>
        </div>

        <button
          type="button"
          className={styles.lightboxCloseBtn}
          onClick={onClose}
          aria-label="Close Lightbox"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      {/* Main Image & Navigation */}
      <div className={styles.lightboxMain} onClick={(e) => e.stopPropagation()}>
        {total > 1 && (
          <button
            type="button"
            className={`${styles.lightboxNavBtn} ${styles.lightboxNavLeft}`}
            onClick={handlePrev}
            aria-label="Previous image"
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>
        )}

        <div className={styles.lightboxImageWrapper}>
          <Image
            src={currentItem.url}
            alt={currentItem.caption || `Gallery photo ${currentIndex + 1}`}
            fill
            priority
            className={styles.lightboxImage}
            sizes="100vw"
          />
        </div>

        {total > 1 && (
          <button
            type="button"
            className={`${styles.lightboxNavBtn} ${styles.lightboxNavRight}`}
            onClick={handleNext}
            aria-label="Next image"
          >
            <ChevronRight size={24} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Lightbox Footer */}
      <div className={styles.lightboxFooter} onClick={(e) => e.stopPropagation()}>
        <p className={styles.lightboxCaption}>{currentItem.caption}</p>
      </div>
    </div>
  );
}
