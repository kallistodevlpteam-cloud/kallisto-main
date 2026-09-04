"use client";

import { useMemo, useState } from "react";
import type {
  PortfolioProfile,
  PortfolioProject,
} from "@/features/portfolio/types/portfolio.types";
import { PortfolioProjectHero } from "./portfolio-project-hero";
import { PortfolioProjectSnapshot } from "./portfolio-project-snapshot";
import { PortfolioProjectLightbox } from "./portfolio-project-lightbox";
import { PortfolioProjectSummary } from "./portfolio-project-summary";
import { PortfolioProjectHighlights } from "./portfolio-project-highlights";
import { PortfolioProjectLocation } from "./portfolio-project-location";
import { PortfolioProjectFeedback } from "./portfolio-project-feedback";
import { PortfolioProjectRelated } from "./portfolio-project-related";
import styles from "./portfolio-project-overview.module.css";

interface PortfolioProjectOverviewProps {
  project: PortfolioProject;
  profile?: PortfolioProfile;
  relatedProjects?: PortfolioProject[];
  isOwner?: boolean;
}

export function PortfolioProjectOverview({
  project,
  relatedProjects = [],
}: PortfolioProjectOverviewProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);

  const galleryItems = useMemo(() => {
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
      category: "Exterior" as const,
      caption: `${project.title} — View ${idx + 1}`,
      featured: idx === 0,
    }));
  }, [project]);

  const handleOpenGallery = (index: number = 0) => {
    setLightboxInitialIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className={styles.overviewContainer}>
      <main className={styles.contentMain}>
        {/* 1. Hero Project Section */}
        <PortfolioProjectHero
          project={project}
          onOpenGallery={handleOpenGallery}
        />

        {/* 2. Project Snapshot */}
        <PortfolioProjectSnapshot project={project} />

        {/* 3. Project Summary */}
        <PortfolioProjectSummary project={project} />

        {/* 4. Design Highlights */}
        <PortfolioProjectHighlights project={project} />

        {/* 5. Project Location */}
        <PortfolioProjectLocation project={project} />

        {/* 6. Client Feedback */}
        <PortfolioProjectFeedback project={project} />

        {/* 7. Related Projects */}
        <PortfolioProjectRelated relatedProjects={relatedProjects} />
      </main>

      {/* Fullscreen Lightbox (triggered from Hero 'View Gallery') */}
      <PortfolioProjectLightbox
        isOpen={lightboxOpen}
        images={galleryItems}
        currentIndex={lightboxInitialIndex}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxInitialIndex}
      />
    </div>
  );
}
