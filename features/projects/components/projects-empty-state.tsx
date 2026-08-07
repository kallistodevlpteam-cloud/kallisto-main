import React from "react";
import Link from "next/link";
import { AlertTriangle, FolderPlus, RefreshCw, Search, ShieldAlert } from "lucide-react";
import styles from "../projects.module.css";

interface ProjectsEmptyStateProps {
  type: "empty_all" | "empty_filtered" | "error" | "access_denied";
  onClearFilters?: () => void;
  onRetry?: () => void;
  onOpenImportDrawer?: () => void;
}

export function ProjectsEmptyState({
  type,
  onClearFilters,
  onRetry,
  onOpenImportDrawer,
}: ProjectsEmptyStateProps) {
  if (type === "access_denied") {
    return (
      <div className={styles.stateBox} aria-label="Access denied state">
        <div className={styles.stateIcon}>
          <ShieldAlert size={28} />
        </div>
        <h3 className={styles.stateTitle}>You do not have permission to view projects</h3>
        <p className={styles.stateDesc}>Ask the workspace administrator to update your access.</p>
      </div>
    );
  }

  if (type === "error") {
    return (
      <div className={styles.stateBox} aria-label="Error state">
        <div className={styles.stateIcon}>
          <AlertTriangle size={28} />
        </div>
        <h3 className={styles.stateTitle}>Projects could not be loaded</h3>
        <p className={styles.stateDesc}>Your data has not been changed. Try loading the page again.</p>
        <button type="button" className={styles.primaryBtn} onClick={onRetry}>
          <RefreshCw size={14} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (type === "empty_filtered") {
    return (
      <div className={styles.stateBox} aria-label="Filtered empty state">
        <div className={styles.stateIcon}>
          <Search size={28} />
        </div>
        <h3 className={styles.stateTitle}>No projects match these filters</h3>
        <p className={styles.stateDesc}>Clear the current filters or adjust your search.</p>
        <button type="button" className={styles.secondaryBtn} onClick={onClearFilters}>
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className={styles.stateBox} aria-label="No projects state">
      <div className={styles.stateIcon}>
        <FolderPlus size={28} />
      </div>
      <h3 className={styles.stateTitle}>No projects yet</h3>
      <p className={styles.stateDesc}>
        Projects are created when a qualified enquiry is converted or when an existing project is imported.
      </p>
      <div className={styles.emptyActions}>
        <Link href="/enquiries" className={styles.primaryBtn}>
          Add enquiry
        </Link>
        <button type="button" className={styles.secondaryBtn} onClick={onOpenImportDrawer}>
          Import project
        </button>
      </div>
    </div>
  );
}

export function ProjectsTableSkeleton() {
  return (
    <div className={styles.skeletonContainer} aria-label="Loading projects table">
      {[...Array(6)].map((_, i) => (
        <div key={i} className={styles.skeletonRow}>
          <div className={styles.skeletonBar} style={{ width: "30%" }} />
          <div className={styles.skeletonBar} style={{ width: "15%" }} />
          <div className={styles.skeletonBar} style={{ width: "25%" }} />
          <div className={styles.skeletonBar} style={{ width: "10%" }} />
          <div className={styles.skeletonBar} style={{ width: "10%" }} />
        </div>
      ))}
    </div>
  );
}
