"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Maximize2,
  User,
} from "lucide-react";
import type { PortfolioProject } from "@/features/portfolio/types/portfolio.types";
import { formatProjectCategory } from "@/features/portfolio/utils/portfolio-project-format";
import styles from "./portfolio-project-overview.module.css";

interface PortfolioProjectHeroProps {
  project: PortfolioProject;
  onOpenGallery: (initialIndex?: number) => void;
}

export function PortfolioProjectHero({
  project,
  onOpenGallery,
}: PortfolioProjectHeroProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const galleryImages =
    project.detailedGallery && project.detailedGallery.length > 0
      ? project.detailedGallery.map((item) => item.url)
      : project.gallery && project.gallery.length > 0
        ? project.gallery
        : [project.coverImage];

  const totalImages = galleryImages.length;
  const currentImageUrl = galleryImages[activeImageIndex] || project.coverImage;
  const currentCounter = `${String(activeImageIndex + 1).padStart(2, "0")} / ${String(
    totalImages,
  ).padStart(2, "0")}`;

  const handlePrev = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : totalImages - 1));
  };

  const handleNext = () => {
    setActiveImageIndex((prev) => (prev < totalImages - 1 ? prev + 1 : 0));
  };

  const categoryLabel = formatProjectCategory(project.projectType);
  const locationText = [project.location.city, project.location.state]
    .filter(Boolean)
    .join(", ");
  const clientNameText =
    project.clientFeedback?.clientName || "Private Client";

  return (
    <section className={styles.heroSection} aria-label="Project overview hero">
      <div className={styles.heroMainImageWrapper}>
        <Image
          src={currentImageUrl}
          alt={`${project.title} featured image`}
          fill
          priority
          className={styles.heroImage}
          sizes="100vw"
        />

        {/* Gradient overlay for text contrast */}
        <div className={styles.heroImageOverlay} />

        {/* Bottom Overlay Container */}
        <div className={styles.heroBottomOverlay}>
          {/* Left Bottom: Project Details */}
          <div className={styles.heroProjectDetails}>
            <div className={styles.heroBadgeRow}>
              <span className={styles.heroCategoryPill}>{categoryLabel}</span>
              <span
                className={`${styles.heroStatusPill} ${
                  project.status === "completed"
                    ? styles.heroStatusCompleted
                    : styles.heroStatusOngoing
                }`}
              >
                {project.status === "completed" ? "Completed" : "In Progress"}
              </span>
              {project.completionYear && (
                <span className={styles.heroYearPill}>
                  {project.completionYear}
                </span>
              )}
            </div>

            <h1 className={styles.heroProjectHeading}>{project.title}</h1>

            <div className={styles.heroMetaRow}>
              <div className={styles.heroMetaItemOverlay}>
                <MapPin size={15} className={styles.heroMetaIcon} aria-hidden="true" />
                <span>{locationText}</span>
              </div>
              <span className={styles.heroMetaDot}>•</span>
              <div className={styles.heroMetaItemOverlay}>
                <User size={15} className={styles.heroMetaIcon} aria-hidden="true" />
                <span>Client: {clientNameText}</span>
              </div>
            </div>
          </div>

          {/* Right Bottom: Floating Controls */}
          <div className={styles.heroFloatingControls}>
            <span className={styles.heroImageCounter}>{currentCounter}</span>

            <div className={styles.heroNavButtons}>
              <button
                type="button"
                className={styles.heroNavBtn}
                onClick={handlePrev}
                aria-label="Previous image"
                title="Previous image"
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>

              <button
                type="button"
                className={styles.heroNavBtn}
                onClick={handleNext}
                aria-label="Next image"
                title="Next image"
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>

              <button
                type="button"
                className={styles.viewGalleryBtn}
                onClick={() => onOpenGallery(activeImageIndex)}
                aria-label="View Fullscreen Gallery"
              >
                <Maximize2 size={13} aria-hidden="true" />
                <span>View Gallery</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail Preview Strip */}
      {totalImages > 1 && (
        <div
          className={styles.heroThumbnailStrip}
          role="tablist"
          aria-label="Gallery thumbnails"
        >
          {galleryImages.map((imgUrl, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={activeImageIndex === idx}
              className={`${styles.heroThumbnailItem} ${
                activeImageIndex === idx ? styles.heroThumbnailActive : ""
              }`}
              onClick={() => setActiveImageIndex(idx)}
              aria-label={`View photo ${idx + 1}`}
            >
              <Image
                src={imgUrl}
                alt={`Thumbnail ${idx + 1}`}
                fill
                sizes="88px"
                style={{ objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
