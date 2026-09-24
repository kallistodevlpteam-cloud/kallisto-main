import Link from "next/link";
import { FolderOpen } from "lucide-react";
import styles from "./portfolio.module.css";

interface PortfolioEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function PortfolioEmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: PortfolioEmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <FolderOpen size={22} aria-hidden="true" />
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {actionLabel && onAction ? (
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : actionLabel && actionHref ? (
        <Link className={styles.secondaryButton} href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
