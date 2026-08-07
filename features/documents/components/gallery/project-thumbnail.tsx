"use client";

import React from "react";
import Image from "next/image";

export interface ProjectThumbnailProps {
  id: string;
  src: string;
  alt: string;
  isSelected?: boolean;
  onClick: () => void;
  overlayText?: string;
}

export function ProjectThumbnail({
  src,
  alt,
  isSelected = false,
  onClick,
  overlayText,
}: ProjectThumbnailProps) {
  return (
    <button
      type="button"
      className={`project-thumbnail-btn ${isSelected ? "is-selected" : ""}`}
      onClick={onClick}
      aria-label={overlayText ? `View all ${overlayText} gallery images` : alt}
      title={alt}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="project-thumbnail-img"
        sizes="(max-width: 768px) 84px, (max-width: 1400px) 110px, 150px"
      />
      {overlayText && (
        <div className="project-thumbnail-overlay" aria-hidden="true">
          <span>{overlayText}</span>
        </div>
      )}
    </button>
  );
}
