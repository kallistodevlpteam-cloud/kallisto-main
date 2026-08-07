import Image from "next/image";
import { Pencil } from "lucide-react";
import styles from "./project-header.module.css";

interface ProjectCoverBannerProps {
  coverImageUrl: string;
  projectName: string;
  onEditCover?: () => void;
}

export function ProjectCoverBanner({
  coverImageUrl,
  projectName,
  onEditCover,
}: ProjectCoverBannerProps) {
  return (
    <div className={styles.coverBanner}>
      <Image
        src={coverImageUrl}
        alt={`${projectName} project cover`}
        fill
        sizes="(max-width: 960px) 100vw, 80vw"
        className={styles.coverImage}
        unoptimized
        priority
      />
      <button
        type="button"
        className={styles.editCoverButton}
        onClick={onEditCover}
        aria-label="Edit project cover"
        title="Edit project cover"
      >
        <Pencil size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
