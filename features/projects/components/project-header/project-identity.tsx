import Image from "next/image";
import { ChevronRight, MapPin, User } from "lucide-react";
import styles from "./project-header.module.css";

interface ProjectIdentityProps {
  clientName: string;
  location: string;
  projectCode: string;
  projectName: string;
  projectType: string;
  statusLabel: string;
  thumbnailImageUrl: string;
  onClientClick: () => void;
}

export function ProjectIdentity({
  clientName,
  location,
  projectCode,
  projectName,
  projectType,
  statusLabel,
  thumbnailImageUrl,
  onClientClick,
}: ProjectIdentityProps) {
  return (
    <section className={styles.identitySection} aria-labelledby="project-identity-title">
      <div className={styles.projectThumbnail}>
        <Image
          src={thumbnailImageUrl}
          alt=""
          fill
          sizes="92px"
          className={styles.projectThumbnailImage}
          unoptimized
        />
      </div>

      <div className={styles.identityContent}>
        <span className={styles.statusChip}>
          <span className={styles.statusDot} aria-hidden="true" />
          {statusLabel}
        </span>

        <h1 id="project-identity-title" className={styles.projectTitle}>
          {projectName}
        </h1>
        <p className={styles.projectType}>{projectType}</p>
        <p className={styles.projectLocation}>
          <MapPin size={14} aria-hidden="true" />
          <span>{location}</span>
        </p>

        <div className={styles.metadataRow}>
          <button
            type="button"
            className={styles.clientButton}
            onClick={onClientClick}
            title="View client details"
          >
            <span className={styles.clientAvatar} aria-hidden="true">
              <User size={12} />
            </span>
            <span>Client: {clientName}</span>
            <ChevronRight size={13} className={styles.clientChevron} aria-hidden="true" />
          </button>

          <span className={styles.metadataDivider} aria-hidden="true" />
          <span className={styles.projectCodeLabel}>Project ID</span>
          <strong className={styles.projectCode}>{projectCode}</strong>
        </div>
      </div>
    </section>
  );
}
