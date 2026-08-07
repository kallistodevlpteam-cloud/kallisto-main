import styles from "./project-site-workspace.module.css";

export type SiteBadgeTone =
  | "neutral"
  | "active"
  | "warning"
  | "danger"
  | "success";

interface SiteStatusBadgeProps {
  label: string;
  tone?: SiteBadgeTone;
}

export function SiteStatusBadge({
  label,
  tone = "neutral",
}: SiteStatusBadgeProps) {
  const toneClasses: Record<SiteBadgeTone, string> = {
    neutral: styles.statusNeutral,
    active: styles.statusActive,
    warning: styles.statusWarning,
    danger: styles.statusDanger,
    success: styles.statusSuccess,
  };

  return (
    <span className={`${styles.statusBadge} ${toneClasses[tone]}`}>
      {label}
    </span>
  );
}
