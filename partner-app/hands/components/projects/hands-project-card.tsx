"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { HandsProjectRecord } from "../../types/project-domain";
import styles from "./hands-projects.module.css";

interface HandsProjectCardProps {
  project: HandsProjectRecord;
}

const FALLBACK_IMAGE = "/assets/projects/greenfield-villa.png";

export function HandsProjectCard({ project }: HandsProjectCardProps) {
  const [imgSrc, setImgSrc] = React.useState<string>(project.coverImage || FALLBACK_IMAGE);
  const percentComplete = Math.round((project.currentDay / project.totalDays) * 100) || 0;

  React.useEffect(() => {
    setImgSrc(project.coverImage || FALLBACK_IMAGE);
  }, [project.coverImage]);

  const getStatusLabel = () => {
    switch (project.status) {
      case "active":
        return "In progress";
      case "upcoming":
        return "Upcoming";
      case "completed":
        return "Completed";
      default:
        return "In progress";
    }
  };

  return (
    <Link
      href={`/partner/hands/projects/${project.id}`}
      className={styles.projectCard}
    >
      {/* 1. Cover Image with In progress badge overlay */}
      <div className={styles.cardHeaderImage}>
        <Image
          src={imgSrc}
          alt={project.projectName}
          fill
          className={styles.cardImage}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          onError={() => setImgSrc(FALLBACK_IMAGE)}
        />
        <div className={styles.statusBadgeOverlay}>
          {getStatusLabel()}
        </div>
      </div>

      {/* 2. Text Info Below Image */}
      <div className={styles.cardBody}>
        {/* Row 1: Project Name (left) & Progress % (right) */}
        <div className={styles.cardRowOne}>
          <h3 className={styles.projectName} title={project.projectName}>
            {project.projectName}
          </h3>
          <span className={styles.progressPercent}>{percentComplete}%</span>
        </div>

        {/* Row 2: Location with map pin (left) & Client Name (right) */}
        <div className={styles.cardRowTwo}>
          <div className={styles.locationWrap}>
            <MapPin size={13} className={styles.locationIcon} />
            <span>{project.location}</span>
          </div>
          <span className={styles.clientName} title={`Client: ${project.clientName}`}>
            {project.clientName}
          </span>
        </div>
      </div>
    </Link>
  );
}
