"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type {
  PortfolioGalleryCategory,
  PortfolioGalleryItem,
  PortfolioProject,
} from "@/features/portfolio/types/portfolio.types";
import { PortfolioProjectLightbox } from "./portfolio-project-lightbox";
import styles from "./portfolio-project-overview.module.css";

interface PortfolioProjectGalleryProps {
  project: PortfolioProject;
  lightboxOpen?: boolean;
  initialLightboxIndex?: number;
  onCloseLightbox?: () => void;
}

const CATEGORY_TABS: PortfolioGalleryCategory[] = [
  "All",
  "Exterior",
  "Interior",
  "Floor Plans",
  "3D Visuals",
  "Construction Progress",
];

export function PortfolioProjectGallery({
  project,
  lightboxOpen = false,
  initialLightboxIndex = 0,
  onCloseLightbox,
}: PortfolioProjectGalleryProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<PortfolioGalleryCategory>("All");
  const [internalLightboxOpen, setInternalLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const isLightboxActive = lightboxOpen || internalLightboxOpen;
  const activeIndex = lightboxOpen ? initialLightboxIndex : lightboxIndex;

  const galleryItems: PortfolioGalleryItem[] = useMemo(() => {
    if (project.detailedGallery && project.detailedGallery.length > 0) {
      return project.detailedGallery;
    }
    const urls =
      project.gallery && project.gallery.length > 0
        ? project.gallery
        : [project.coverImage];
    return urls.map((url, idx) => ({
      id: `img-${idx + 1}`,
      url,
      category: (idx % 4 === 0
        ? "Exterior"
        : idx % 4 === 1
          ? "Interior"
          : idx % 4 === 2
            ? "Floor Plans"
            : "3D Visuals") as Exclude<PortfolioGalleryCategory, "All">,
      caption: `${project.title} — View ${idx + 1}`,
      featured: idx === 0,
    }));
  }, [project]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "All") {
      return galleryItems;
    }
    return galleryItems.filter((item) => item.category === selectedCategory);
  }, [galleryItems, selectedCategory]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setInternalLightboxOpen(true);
  };

  const closeLightbox = () => {
    setInternalLightboxOpen(false);
    if (onCloseLightbox) {
      onCloseLightbox();
    }
  };

  return (
    <section className={styles.sectionBlock} aria-labelledby="gallery-heading">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <h3 className={styles.sectionTitle} id="gallery-heading">
            Project Gallery
          </h3>
          <p className={styles.sectionSubtitle}>
            Architectural captures, plans, and construction documentation
          </p>
        </div>

        {/* Category Tabs */}
        <div
          className={styles.galleryFilterBar}
          role="tablist"
          aria-label="Filter gallery by category"
        >
          {CATEGORY_TABS.map((cat) => {
            const count =
              cat === "All"
                ? galleryItems.length
                : galleryItems.filter((item) => item.category === cat).length;
            if (count === 0 && cat !== "All") return null;

            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${styles.galleryFilterPill} ${
                  isActive ? styles.galleryFilterPillActive : ""
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                <span>{cat}</span>
                <span
                  style={{
                    fontSize: 11,
                    opacity: isActive ? 0.9 : 0.7,
                    fontWeight: 600,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Masonry / Grid */}
      <div className={styles.galleryGrid}>
        {filteredItems.map((item, idx) => {
          const isFeatured = idx === 0 && selectedCategory === "All";
          const originalIndex = galleryItems.findIndex((g) => g.id === item.id);

          return (
            <article
              key={item.id}
              className={`${styles.galleryCard} ${
                isFeatured ? styles.galleryCardFeatured : ""
              }`}
              onClick={() =>
                openLightbox(originalIndex !== -1 ? originalIndex : idx)
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openLightbox(originalIndex !== -1 ? originalIndex : idx);
                }
              }}
              aria-label={`View photo: ${item.caption}`}
            >
              <Image
                src={item.url}
                alt={item.caption}
                fill
                sizes={
                  isFeatured
                    ? "(max-width: 900px) 100vw, 50vw"
                    : "(max-width: 900px) 50vw, 25vw"
                }
                className={styles.galleryImage}
              />

              <div className={styles.galleryOverlay}>
                <span className={styles.galleryCategoryTag}>{item.category}</span>
                <h4 className={styles.galleryCaption}>{item.caption}</h4>
              </div>
            </article>
          );
        })}
      </div>

      {/* Fullscreen Lightbox */}
      <PortfolioProjectLightbox
        isOpen={isLightboxActive}
        images={galleryItems}
        currentIndex={activeIndex}
        onClose={closeLightbox}
        onNavigate={setLightboxIndex}
      />
    </section>
  );
}
