import { ReactNode } from "react";
import styles from "./project-site-workspace.module.css";

interface SiteSectionHeaderProps {
  title: string;
  description: string;
  meta?: string;
  actions?: ReactNode;
}

export function SiteSectionHeader({
  title,
  description,
  meta,
  actions,
}: SiteSectionHeaderProps) {
  return (
    <header className={styles.sectionHeader}>
      <div>
        <div className={styles.sectionTitleRow}>
          <h3>{title}</h3>
          {meta ? <span>{meta}</span> : null}
        </div>
        <p>{description}</p>
      </div>
      {actions ? <div className={styles.sectionHeaderActions}>{actions}</div> : null}
    </header>
  );
}
