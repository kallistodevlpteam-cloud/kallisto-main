"use client";

import React from "react";
import { ProjectThumbnail } from "./project-thumbnail";

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
}

export interface ProjectThumbnailRailProps {
  images: GalleryImage[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  overflowCount?: number;
}

export function ProjectThumbnailRail({
  images,
  selectedIndex,
  onSelect,
  overflowCount,
}: ProjectThumbnailRailProps) {
  return (
    <div className="project-thumbnail-rail" aria-label="Project image thumbnails">
      {images.map((img, idx) => {
        const isLast = idx === images.length - 1;
        const hasOverlay = isLast && Boolean(overflowCount && overflowCount > 0);

        return (
          <ProjectThumbnail
            key={img.id}
            id={img.id}
            src={img.src}
            alt={img.alt}
            isSelected={idx === selectedIndex}
            onClick={() => onSelect(idx)}
            overlayText={hasOverlay ? `+${overflowCount}` : undefined}
          />
        );
      })}
    </div>
  );
}
