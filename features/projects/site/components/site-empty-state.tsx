import {
  LucideIcon,
  RefreshCw,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";
import { ReactNode } from "react";
import styles from "./project-site-workspace.module.css";

interface SiteEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  supportingContent?: ReactNode;
  presentation?: "default" | "compact";
}

export function SiteEmptyState({
  icon: Icon,
  title,
  description,
  primaryActionLabel,
  onPrimaryAction,
  supportingContent,
  presentation = "default",
}: SiteEmptyStateProps) {
  return (
    <section
      className={`${styles.emptyState} ${
        presentation === "compact" ? styles.emptyStateCompact : ""
      }`}
    >
      <span className={styles.emptyStateIcon}>
        <Icon size={22} aria-hidden="true" />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {primaryActionLabel && onPrimaryAction ? (
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onPrimaryAction}
        >
          {primaryActionLabel}
        </button>
      ) : null}
      {supportingContent ? (
        <div className={styles.emptyStateSupporting}>{supportingContent}</div>
      ) : null}
    </section>
  );
}

interface SiteErrorStateProps {
  projectCode: string;
  onRetry: () => void;
}

export function SiteErrorState({
  projectCode,
  onRetry,
}: SiteErrorStateProps) {
  return (
    <div role="alert">
      <SiteEmptyState
        icon={TriangleAlert}
        title="Site records could not be loaded"
        description={`The field record for project ${projectCode} is temporarily unavailable. Retry without leaving the project workspace.`}
        primaryActionLabel="Retry"
        onPrimaryAction={onRetry}
        supportingContent={
          <span className={styles.retryHint}>
            <RefreshCw size={14} aria-hidden="true" />
            Existing project context will be preserved.
          </span>
        }
      />
    </div>
  );
}

export function SitePermissionState({
  projectCode,
}: {
  projectCode: string;
}) {
  return (
    <SiteEmptyState
      icon={ShieldAlert}
      title="Site access restricted"
      description={`Your current project role does not include field records for ${projectCode}. Ask the project administrator for site access.`}
    />
  );
}

export function SiteLoadingState() {
  return (
    <div
      className={styles.loadingState}
      aria-label="Loading site operations"
      aria-busy="true"
    >
      <div className={styles.loadingHeader}>
        <span className={styles.skeletonTitle} />
        <span className={styles.skeletonSubtitle} />
      </div>
      <span className={styles.skeletonNavigation} />
      <div className={styles.skeletonGrid}>
        <span className={styles.skeletonWide} />
        <span className={styles.skeletonNarrow} />
        <span className={styles.skeletonWide} />
        <span className={styles.skeletonNarrow} />
      </div>
    </div>
  );
}
