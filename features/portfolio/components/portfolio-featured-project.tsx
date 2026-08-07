"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ImageOff } from "lucide-react";
import type {
  PortfolioProfile,
  PortfolioProject,
} from "@/features/portfolio/types/portfolio.types";
import { buildPortfolioEnquiryHref } from "@/features/portfolio/utils/portfolio-enquiry-state";
import {
  formatBuiltUpArea,
  formatProjectCompletion,
  formatProjectLocation,
  formatProjectType,
} from "@/features/portfolio/utils/portfolio-project-format";
import styles from "./portfolio.module.css";

interface PortfolioFeaturedProjectProps {
  project: PortfolioProject;
  profile: PortfolioProfile;
  isOwner: boolean;
  onOpen: (project: PortfolioProject, trigger: HTMLButtonElement) => void;
}

export function PortfolioFeaturedProject({
  project,
  profile,
  isOwner,
  onOpen,
}: PortfolioFeaturedProjectProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className={styles.featuredProject}>
      <div className={styles.featuredProjectMedia}>
        {imageFailed ? (
          <div className={styles.imageFallback}>
            <ImageOff size={24} aria-hidden="true" />
            Image unavailable
          </div>
        ) : (
          <Image
            src={project.coverImage}
            alt={`${project.title} exterior`}
            fill
            priority
            className={styles.featuredProjectImage}
            sizes="(max-width: 760px) 100vw, 60vw"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>

      <div className={styles.featuredProjectContent}>
        <span className={styles.eyebrow}>Featured project</span>
        <h2>{project.title}</h2>
        <p className={styles.featuredProjectType}>
          {formatProjectType(project.projectType)} architecture
        </p>
        <p className={styles.featuredProjectLocation}>
          {formatProjectLocation(project)}
        </p>
        <div className={styles.featuredProjectFacts}>
          <span>{formatBuiltUpArea(project)}</span>
          <span>{formatProjectCompletion(project)}</span>
        </div>
        <p className={styles.featuredProjectSummary}>{project.description}</p>
        <div className={styles.catalogueServiceList} aria-label="Service scope">
          {project.services.slice(0, 3).map((service) => (
            <span key={service}>{service}</span>
          ))}
          {project.services.length > 3 ? (
            <span>+{project.services.length - 3} services</span>
          ) : null}
        </div>
        <div className={styles.featuredProjectActions}>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={(event) => onOpen(project, event.currentTarget)}
          >
            View project
            <ArrowUpRight size={15} aria-hidden="true" />
          </button>
          {!isOwner ? (
            <Link
              className={styles.secondaryButton}
              href={buildPortfolioEnquiryHref(profile, "proposal", project)}
            >
              Send enquiry
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
