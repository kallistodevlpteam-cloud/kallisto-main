"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  MoreHorizontal,
  Share2,
  Check,
  Download,
  Printer,
} from "lucide-react";
import type { PortfolioProject } from "@/features/portfolio/types/portfolio.types";
import { formatProjectCategory } from "@/features/portfolio/utils/portfolio-project-format";
import styles from "./portfolio-project-overview.module.css";

interface PortfolioProjectHeaderProps {
  project: PortfolioProject;
  isOwner?: boolean;
  onEdit?: () => void;
}

export function PortfolioProjectHeader({
  project,
  isOwner = true,
  onEdit,
}: PortfolioProjectHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const categoryLabel = formatProjectCategory(project.projectType);
  const locationString = `${project.location.city}, ${project.location.state}`;
  const yearString = String(
    project.completionYear ?? project.expectedCompletionYear ?? "2026",
  );

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${project.title} — Kallisto Portfolio`,
          text: project.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Ignored
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className={styles.headerWrapper} role="banner">
      <div className={styles.headerInner}>
        {/* Left: Back button & Breadcrumbs & Title */}
        <div className={styles.headerLeft}>
          <Link
            href="/portfolio"
            className={styles.backButton}
            aria-label="Back to Portfolio"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            <span>Back to Portfolio</span>
          </Link>

          <div className={styles.headerDivider} aria-hidden="true" />

          <div className={styles.headerMeta}>
            {/* Breadcrumb row */}
            <nav className={styles.headerBreadcrumbs} aria-label="Breadcrumb">
              <Link href="/portfolio" className={styles.breadcrumbLink}>
                Virtual Office
              </Link>
              <ChevronRight
                size={12}
                className={styles.breadcrumbSeparator}
                aria-hidden="true"
              />
              <Link href="/portfolio" className={styles.breadcrumbLink}>
                Portfolio
              </Link>
              <ChevronRight
                size={12}
                className={styles.breadcrumbSeparator}
                aria-hidden="true"
              />
              <span className={styles.breadcrumbCurrent}>{project.title}</span>
            </nav>

            {/* Title & Badge Row */}
            <div className={styles.headerTitleRow}>
              <span className={styles.headerCategoryTag}>{categoryLabel}</span>
              <h1 className={styles.headerTitle}>{project.title}</h1>
              <span
                className={`${styles.statusBadge} ${
                  project.status === "completed"
                    ? styles.statusCompleted
                    : styles.statusOngoing
                }`}
              >
                {project.status === "completed" ? "Completed" : "In Progress"}
              </span>
              <div className={styles.headerLocationYear}>
                <span>{locationString}</span>
                <span>•</span>
                <span>{yearString}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className={styles.headerActions}>
          {isOwner && (
            <button
              type="button"
              className={styles.editButton}
              onClick={onEdit}
              aria-label="Edit Project"
            >
              <Edit3 size={14} aria-hidden="true" />
              <span>Edit Project</span>
            </button>
          )}

          <button
            type="button"
            className={styles.iconActionButton}
            onClick={handleShare}
            title={copied ? "Link Copied!" : "Share Project"}
            aria-label={copied ? "Link Copied!" : "Share Project"}
          >
            {copied ? (
              <Check size={16} color="#10b981" aria-hidden="true" />
            ) : (
              <Share2 size={16} aria-hidden="true" />
            )}
          </button>

          <div style={{ position: "relative" }}>
            <button
              type="button"
              className={styles.iconActionButton}
              onClick={() => setMenuOpen(!menuOpen)}
              title="More options"
              aria-label="More options"
              aria-expanded={menuOpen}
            >
              <MoreHorizontal size={16} aria-hidden="true" />
            </button>

            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  marginTop: 6,
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  padding: 6,
                  zIndex: 50,
                  minWidth: 180,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <button
                  type="button"
                  onClick={handleShare}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    background: "none",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 13,
                    color: "#0f172a",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <Share2 size={14} />
                  <span>Copy Project Link</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    background: "none",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 13,
                    color: "#0f172a",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <Printer size={14} />
                  <span>Print Case Study</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    alert("Exporting PDF Case Study Summary...");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    background: "none",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 13,
                    color: "#0f172a",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <Download size={14} />
                  <span>Download Summary PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
