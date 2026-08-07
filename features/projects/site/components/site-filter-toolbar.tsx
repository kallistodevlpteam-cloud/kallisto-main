import { ReactNode } from "react";
import styles from "./project-site-workspace.module.css";

interface FilterView {
  id: string;
  label: string;
  count?: number;
}

interface SiteFilterToolbarProps {
  label: string;
  views: FilterView[];
  activeView: string;
  onViewChange: (view: string) => void;
  children?: ReactNode;
}

export function SiteFilterToolbar({
  label,
  views,
  activeView,
  onViewChange,
  children,
}: SiteFilterToolbarProps) {
  return (
    <div className={styles.filterToolbar}>
      <div
        className={styles.filterViews}
        role="group"
        aria-label={`${label} views`}
      >
        {views.map((view) => (
          <button
            key={view.id}
            type="button"
            aria-pressed={activeView === view.id}
            className={
              activeView === view.id
                ? styles.filterViewActive
                : styles.filterView
            }
            onClick={() => onViewChange(view.id)}
          >
            {view.label}
            {view.count !== undefined ? <span>{view.count}</span> : null}
          </button>
        ))}
      </div>
      {children ? <div className={styles.filterControls}>{children}</div> : null}
    </div>
  );
}
