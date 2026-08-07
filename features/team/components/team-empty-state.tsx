import { SearchX, UsersRound } from "lucide-react";
import styles from "./team-page.module.css";

interface TeamEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "search" | "members";
}

export function TeamEmptyState({
  title,
  description,
  actionLabel,
  onAction,
  variant = "members",
}: TeamEmptyStateProps) {
  const Icon = variant === "search" ? SearchX : UsersRound;

  return (
    <div className={styles.emptyState}>
      <span className={styles.emptyStateIcon} aria-hidden="true">
        <Icon size={18} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction ? (
        <button type="button" className={styles.textAction} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
