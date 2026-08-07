"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Copy,
  Ellipsis,
  EyeOff,
  ImageOff,
  Pencil,
  Share2,
  Star,
  X,
} from "lucide-react";
import type {
  PortfolioProfile,
  PortfolioProject,
} from "@/features/portfolio/types/portfolio.types";
import { buildPortfolioEnquiryHref } from "@/features/portfolio/utils/portfolio-enquiry-state";
import {
  formatBuiltUpArea,
  formatProjectCategory,
  formatProjectCompletion,
  formatProjectLocation,
  formatProjectStatus,
  formatSiteArea,
} from "@/features/portfolio/utils/portfolio-project-format";
import styles from "./portfolio.module.css";

interface PortfolioProjectViewerProps {
  project: PortfolioProject;
  projects: PortfolioProject[];
  profile: PortfolioProfile;
  isOwner: boolean;
  onClose: () => void;
  onNavigate: (project: PortfolioProject) => void;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function PortfolioProjectViewer({
  project,
  projects,
  profile,
  isOwner,
  onClose,
  onNavigate,
}: PortfolioProjectViewerProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [shareLabel, setShareLabel] = useState("Share project");

  const projectIndex = projects.findIndex(
    (candidate) => candidate.id === project.id,
  );
  const previousProject =
    projects[(projectIndex - 1 + projects.length) % projects.length];
  const nextProject = projects[(projectIndex + 1) % projects.length];
  const activeImage =
    project.gallery[imageIndex] ?? project.coverImage;

  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => !element.hasAttribute("disabled"));

      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const shareProject = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("project", project.id);
    try {
      if (navigator.share) {
        await navigator.share({
          title: project.title,
          text: project.description,
          url: url.toString(),
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url.toString());
        setShareLabel("Link copied");
        window.setTimeout(() => setShareLabel("Share project"), 1800);
      }
    } catch {
      setShareLabel("Share project");
    }
  };

  return (
    <div
      className={styles.viewerBackdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={styles.viewer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="portfolio-viewer-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <button
          className={styles.viewerClose}
          type="button"
          aria-label="Close project viewer"
          onClick={onClose}
          ref={closeButtonRef}
        >
          <X size={18} aria-hidden="true" />
        </button>

        <div className={styles.viewerMediaPanel}>
          <div className={styles.viewerMainImage}>
            {imageFailed ? (
              <div className={styles.viewerImageFallback}>
                <ImageOff size={28} aria-hidden="true" />
                <span>Project image unavailable</span>
              </div>
            ) : (
              <Image
                src={activeImage}
                alt={`${project.title}, image ${imageIndex + 1}`}
                fill
                priority
                className={styles.viewerImage}
                sizes="(max-width: 760px) 100vw, 65vw"
                onError={() => setImageFailed(true)}
              />
            )}

            {projects.length > 1 ? (
              <>
                <button
                  className={`${styles.viewerNavButton} ${styles.viewerNavPrevious}`}
                  type="button"
                  aria-label={`Previous project, ${previousProject.title}`}
                  onClick={() => onNavigate(previousProject)}
                >
                  <ChevronLeft size={19} aria-hidden="true" />
                </button>
                <button
                  className={`${styles.viewerNavButton} ${styles.viewerNavNext}`}
                  type="button"
                  aria-label={`Next project, ${nextProject.title}`}
                  onClick={() => onNavigate(nextProject)}
                >
                  <ChevronRight size={19} aria-hidden="true" />
                </button>
              </>
            ) : null}
          </div>

          {project.gallery.length > 1 ? (
            <div className={styles.viewerThumbnails} aria-label="Project images">
              {project.gallery.map((imageUrl, index) => (
                <button
                  className={`${styles.viewerThumbnail} ${
                    imageIndex === index ? styles.viewerThumbnailActive : ""
                  }`}
                  type="button"
                  aria-label={`Show image ${index + 1}`}
                  aria-pressed={imageIndex === index}
                  key={imageUrl}
                  onClick={() => {
                    setImageIndex(index);
                    setImageFailed(false);
                  }}
                >
                  <Image
                    src={imageUrl}
                    alt=""
                    fill
                    className={styles.viewerThumbnailImage}
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <aside className={styles.viewerDetails}>
          <div className={styles.viewerTitleBlock}>
            <span className={styles.viewerCategory}>
              {formatProjectCategory(project.projectType)}
            </span>
            <h2 id="portfolio-viewer-title">{project.title}</h2>
            <p>
              {formatProjectLocation(project)} ·{" "}
              {formatProjectCompletion(project)}
            </p>
          </div>

          <dl className={styles.viewerProjectFacts}>
            <div>
              <dt>Built-up area</dt>
              <dd>{formatBuiltUpArea(project)}</dd>
            </div>
            <div>
              <dt>Site area</dt>
              <dd>{formatSiteArea(project)}</dd>
            </div>
            <div>
              <dt>Completion year</dt>
              <dd>{formatProjectCompletion(project)}</dd>
            </div>
            <div>
              <dt>Project status</dt>
              <dd>{formatProjectStatus(project.status)}</dd>
            </div>
            <div>
              <dt>Project duration</dt>
              <dd>{project.duration ?? "Not specified"}</dd>
            </div>
            <div>
              <dt>Service scope</dt>
              <dd>
                {project.services.length}{" "}
                {project.services.length === 1 ? "service" : "services"}
              </dd>
            </div>
          </dl>

          <div className={styles.viewerSection}>
            <h3>Project summary</h3>
            <p className={styles.viewerDescription}>{project.description}</p>
          </div>

          <div className={styles.viewerSection}>
            <h3>Scope of services</h3>
            <div className={styles.viewerTags}>
              {project.services.map((service) => (
                <span key={service}>{service}</span>
              ))}
            </div>
          </div>

          {project.designHighlights?.length ? (
            <div className={styles.viewerSection}>
              <h3>Design highlights</h3>
              <ul className={styles.viewerHighlightsList}>
                {project.designHighlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {project.materials?.length ? (
            <div className={styles.viewerSection}>
              <h3>Material palette</h3>
              <div className={styles.viewerTags}>
                {project.materials.map((material) => (
                  <span key={material}>{material}</span>
                ))}
              </div>
            </div>
          ) : null}

          {project.collaborators?.length ? (
            <div className={styles.viewerSection}>
              <h3>Project collaborators</h3>
              <p className={styles.viewerDescription}>
                {project.collaborators.join(" · ")}
              </p>
            </div>
          ) : null}

          {isOwner ? (
            <div className={styles.viewerOwnerFooter}>
              <a
                className={styles.viewerCaseStudyLink}
                href={`/portfolio?portfolioTab=case-studies&project=${project.id}`}
              >
                View project case study
                <ChevronRight size={15} aria-hidden="true" />
              </a>
              <details className={styles.viewerOwnerMenu}>
                <summary>
                  <Ellipsis size={16} aria-hidden="true" />
                  Project actions
                </summary>
                <div role="menu">
                  <button type="button" role="menuitem">
                    <Pencil size={14} aria-hidden="true" />
                    Edit project
                  </button>
                  <button type="button" role="menuitem">
                    <Star size={14} aria-hidden="true" />
                    {project.featured ? "Unfeature" : "Feature"} project
                  </button>
                  <button type="button" role="menuitem">
                    <EyeOff size={14} aria-hidden="true" />
                    Manage visibility
                  </button>
                  <button type="button" role="menuitem">
                    <Copy size={14} aria-hidden="true" />
                    Duplicate
                  </button>
                  <button type="button" role="menuitem">
                    <Archive size={14} aria-hidden="true" />
                    Archive
                  </button>
                </div>
              </details>
            </div>
          ) : (
            <div className={styles.viewerPublicActions}>
              <Link
                className={styles.viewerEnquiryAction}
                href={buildPortfolioEnquiryHref(profile, "proposal", project)}
              >
                Send enquiry
              </Link>
              <Link
                className={styles.secondaryButton}
                href={buildPortfolioEnquiryHref(
                  profile,
                  "consultation",
                  project,
                )}
              >
                Request consultation
              </Link>
              <button
                className={styles.viewerShareAction}
                type="button"
                onClick={shareProject}
              >
                <Share2 size={15} aria-hidden="true" />
                {shareLabel}
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
