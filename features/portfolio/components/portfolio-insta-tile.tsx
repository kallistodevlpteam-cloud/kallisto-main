"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff, Layers, MapPin } from "lucide-react";
import type { PortfolioProject } from "@/features/portfolio/types/portfolio.types";
import {
  formatBuiltUpArea,
  formatProjectLocation,
  formatProjectType,
  formatProjectYear,
} from "@/features/portfolio/utils/portfolio-project-format";
import styles from "./portfolio.module.css";

interface PortfolioInstaTileProps {
  project: PortfolioProject;
  eager: boolean;
  onOpen: (project: PortfolioProject, trigger: HTMLButtonElement) => void;
}

export function PortfolioInstaTile({
  project,
  eager,
  onOpen,
}: PortfolioInstaTileProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const galleryCount = project.gallery?.length ?? 0;
  const hasMultipleMedia = galleryCount > 1;

  const projectYear = formatProjectYear(project);
  const builtUpArea = formatBuiltUpArea(project);
  const projectTypeLabel = formatProjectType(project.projectType);

  return (
    <article className={styles.instaTile}>
      <button
        className={styles.instaTileButton}
        type="button"
        aria-label={`View ${project.title} project`}
        onClick={(event) => onOpen(project, event.currentTarget)}
      >
        <span className={styles.instaMedia}>
          {imageFailed ? (
            <span className={styles.imageFallback}>
              <ImageOff size={24} aria-hidden="true" />
            </span>
          ) : (
            <Image
              src={project.coverImage}
              alt={`${project.title} cover`}
              fill
              priority={eager}
              loading={eager ? "eager" : "lazy"}
              className={styles.instaImage}
              sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, (max-width: 1200px) 25vw, 20vw"
              onError={() => setImageFailed(true)}
            />
          )}

          {hasMultipleMedia ? (
            <span className={styles.instaMultiIcon} title="Multiple photos">
              <Layers size={15} aria-hidden="true" />
            </span>
          ) : null}

          {/* Top Left Category Pill Badge */}
          <span className={styles.hoverCategoryBadge}>{projectTypeLabel}</span>

          {/* Bottom Hover Overlay with Details */}
          <span className={styles.instaHoverOverlay}>
            <span className={styles.hoverContentGroup}>
              <h3 className={styles.hoverProjectTitle}>{project.title}</h3>
              <span className={styles.hoverLocationRow}>
                <MapPin size={15} className={styles.pinIcon} aria-hidden="true" />
                <span>{formatProjectLocation(project)}</span>
              </span>
              <span className={styles.hoverFooterRow}>
                <span>{builtUpArea}</span>
                <span>Completed : {projectYear}</span>
              </span>
            </span>
          </span>
        </span>
      </button>
    </article>
  );
}
