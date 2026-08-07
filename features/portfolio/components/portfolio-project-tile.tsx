"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, ImageOff, Star } from "lucide-react";
import type { PortfolioProject } from "@/features/portfolio/types/portfolio.types";
import {
  formatBuiltUpArea,
  formatProjectCompletion,
  formatProjectLocation,
  formatProjectType,
} from "@/features/portfolio/utils/portfolio-project-format";
import styles from "./portfolio.module.css";

interface PortfolioProjectTileProps {
  project: PortfolioProject;
  eager: boolean;
  onOpen: (project: PortfolioProject, trigger: HTMLButtonElement) => void;
}

export function PortfolioProjectTile({
  project,
  eager,
  onOpen,
}: PortfolioProjectTileProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const visibleServices = project.services.slice(0, 3);
  const additionalServices = project.services.length - visibleServices.length;

  return (
    <article className={styles.projectTile}>
      <button
        className={styles.projectTileButton}
        type="button"
        aria-label={`View ${project.title} project`}
        onClick={(event) => onOpen(project, event.currentTarget)}
      >
        <span className={styles.projectMedia}>
          {imageFailed ? (
            <span className={styles.imageFallback}>
              <ImageOff size={24} aria-hidden="true" />
              Image unavailable
            </span>
          ) : (
            <Image
              src={project.coverImage}
              alt={`${project.title} cover`}
              fill
              priority={eager}
              loading={eager ? "eager" : "lazy"}
              className={styles.projectImage}
              sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 42vw"
              onError={() => setImageFailed(true)}
            />
          )}
          <span className={styles.projectViewIndicator}>
            View project
            <ArrowUpRight size={14} aria-hidden="true" />
          </span>
        </span>

        <span className={styles.projectCardContent}>
          <span className={styles.projectCardHeading}>
            <span>
              <strong>{project.title}</strong>
              <span>{formatProjectType(project.projectType)} architecture</span>
            </span>
            {project.featured ? (
              <span className={styles.projectFeaturedLabel}>
                <Star size={12} fill="currentColor" aria-hidden="true" />
                Featured
              </span>
            ) : null}
          </span>
          <span className={styles.projectCardLocation}>
            {formatProjectLocation(project)}
          </span>
          <span className={styles.projectCardFacts}>
            {formatBuiltUpArea(project)} · {formatProjectCompletion(project)}
          </span>
          <span
            className={styles.catalogueServiceList}
            aria-label="Service scope"
          >
            {visibleServices.map((service) => (
              <span key={service}>{service}</span>
            ))}
            {additionalServices > 0 ? (
              <span>+{additionalServices} services</span>
            ) : null}
          </span>
        </span>
      </button>
    </article>
  );
}
