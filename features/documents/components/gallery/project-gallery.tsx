"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronUp, X } from "lucide-react";
import type { GalleryImage } from "./project-thumbnail-rail";

export interface ProjectGalleryProps {
  images: GalleryImage[];
  overflowCount?: number;
  initialSelectedIndex?: number;
  title?: string;
}

export function ProjectGallery({
  images,
  title = "INSPIRATION IMAGES",
  overflowCount,
}: ProjectGalleryProps) {
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  if (!images || images.length === 0) {
    return null;
  }

  // Display top 4 preview thumbnails with overflow overlay on the 4th card
  const visibleImages = images.slice(0, 4);
  const remainingCount = overflowCount ?? Math.max(5, images.length - 4);
  const overflowLabel = `+${remainingCount}`;

  const selectedImage = activeModalIndex !== null ? images[activeModalIndex] || images[0] : null;

  return (
    <div id="enquiry-files" className="project-gallery-container">
      {title ? (
        <button
          type="button"
          className="po-section-header-btn"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
        >
          <span className="po-section-eyebrow">{title}</span>
          <ChevronUp
            size={15}
            className={`po-section-chevron ${!isExpanded ? "is-collapsed" : ""}`}
          />
        </button>
      ) : null}

      <div className={`po-section-body ${!isExpanded ? "is-collapsed" : ""}`}>
        <div className="po-section-inner">
          <div className="inspiration-gallery-grid">
            {visibleImages.map((img, idx) => {
              const isFourth = idx === 3;
              return (
                <button
                  key={img.id}
                  type="button"
                  className={`inspiration-thumb-card ${isFourth ? "has-overflow-overlay" : ""}`}
                  onClick={() => setActiveModalIndex(idx)}
                  aria-label={isFourth ? `View ${overflowLabel} more inspiration images` : `View inspiration image ${idx + 1}`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt || `Inspiration ${idx + 1}`}
                    fill
                    className="inspiration-thumb-img"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                  {isFourth ? (
                    <div className="inspiration-overflow-overlay">
                      <span>{overflowLabel}</span>
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && activeModalIndex !== null ? (
        <div className="project-gallery-viewer is-fullscreen">
          <div className="project-viewer-frame">
            <div className="project-viewer-controls">
              <button
                type="button"
                className="project-viewer-control-btn"
                onClick={() => setActiveModalIndex(null)}
                aria-label="Close image viewer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt || "Inspiration preview"}
              fill
              className="project-viewer-img"
              sizes="100vw"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { ProjectGalleryViewer } from "./project-gallery-viewer";
export { ProjectThumbnailRail } from "./project-thumbnail-rail";
export { ProjectThumbnail } from "./project-thumbnail";
