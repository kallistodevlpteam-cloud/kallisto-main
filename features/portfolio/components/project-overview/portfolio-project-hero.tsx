"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Maximize2,
  Pencil,
  SlidersHorizontal,
  User,
} from "lucide-react";
import type { PortfolioProject } from "@/features/portfolio/types/portfolio.types";
import { formatProjectCategory } from "@/features/portfolio/utils/portfolio-project-format";
import { EditProjectModal } from "./edit-project-modal";
import styles from "./portfolio-project-overview.module.css";

interface PortfolioProjectHeroProps {
  project: PortfolioProject;
  onOpenGallery: (initialIndex?: number) => void;
  isOwner?: boolean;
  onEdit?: () => void;
  onUpdateCover?: (newCoverUrl: string) => void;
  onUpdateProject?: (updatedProject: Partial<PortfolioProject>) => void;
}

export function PortfolioProjectHero({
  project,
  onOpenGallery,
  isOwner = true,
  onEdit,
  onUpdateCover,
  onUpdateProject,
}: PortfolioProjectHeroProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [editMenuOpen, setEditMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [customCoverUrl, setCustomCoverUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const editMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown menu on outside click or escape
  useEffect(() => {
    if (!editMenuOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (editMenuRef.current && !editMenuRef.current.contains(e.target as Node)) {
        setEditMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editMenuOpen]);

  const activeCover = customCoverUrl || project.coverImage;
  const galleryImages =
    project.detailedGallery && project.detailedGallery.length > 0
      ? project.detailedGallery.map((item) => item.url)
      : project.gallery && project.gallery.length > 0
        ? project.gallery
        : [activeCover];

  const totalImages = galleryImages.length;
  const currentImageUrl =
    activeImageIndex === 0 && customCoverUrl
      ? customCoverUrl
      : galleryImages[activeImageIndex] || activeCover;
  const currentCounter = `${String(activeImageIndex + 1).padStart(2, "0")} / ${String(
    totalImages,
  ).padStart(2, "0")}`;

  const handlePrev = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : totalImages - 1));
  };

  const handleNext = () => {
    setActiveImageIndex((prev) => (prev < totalImages - 1 ? prev + 1 : 0));
  };

  const handleCoverFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomCoverUrl(url);
      setActiveImageIndex(0);
      onUpdateCover?.(url);
      setToastMessage("Cover image updated");
      setTimeout(() => setToastMessage(null), 3000);
    }
    e.target.value = "";
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

        {/* Top Right: Edit Option on Cover Image */}
        {isOwner && (
          <div className={styles.heroTopActionsOverlay}>
            {toastMessage && (
              <div className={styles.heroNotificationPill} role="status">
                <Check size={14} aria-hidden="true" />
                <span>{toastMessage}</span>
              </div>
            )}

            <div className={styles.heroEditMenuWrapper} ref={editMenuRef}>
              <button
                type="button"
                className={styles.heroEditBtn}
                onClick={() => setEditMenuOpen((prev) => !prev)}
                aria-label="Edit options"
                aria-expanded={editMenuOpen}
                aria-haspopup="menu"
              >
                <Pencil size={13} aria-hidden="true" />
                <span>Edit</span>
              </button>

              {editMenuOpen && (
                <div
                  className={styles.heroEditDropdown}
                  role="menu"
                  aria-label="Cover and project edit options"
                >
                  <button
                    type="button"
                    role="menuitem"
                    className={styles.heroEditMenuItem}
                    onClick={() => {
                      setEditMenuOpen(false);
                      fileInputRef.current?.click();
                    }}
                  >
                    <Camera size={15} className={styles.heroEditMenuItemIcon} aria-hidden="true" />
                    <span>Change Cover Image</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    className={styles.heroEditMenuItem}
                    onClick={() => {
                      setEditMenuOpen(false);
                      if (onEdit) {
                        onEdit();
                      }
                      setIsEditModalOpen(true);
                    }}
                  >
                    <SlidersHorizontal size={15} className={styles.heroEditMenuItemIcon} aria-hidden="true" />
                    <span>Edit Project Details</span>
                  </button>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp,image/jpg"
              className={styles.visuallyHiddenFileInput}
              aria-label="Upload new cover image"
              onChange={handleCoverFileSelected}
            />
          </div>
        )}

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

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={isEditModalOpen}
        project={project}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(updated) => {
          onUpdateProject?.(updated);
          setToastMessage("Project details updated");
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />
    </section>
  );
}
