import { KeyboardEvent } from "react";
import { SiteView } from "../types/site.types";
import styles from "./project-site-workspace.module.css";

interface SiteNavigationProps {
  activeView: SiteView;
  onViewChange: (view: SiteView) => void;
}

export const SITE_NAV_ITEMS: Array<{ id: SiteView; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "daily_logs", label: "Daily Logs" },
  { id: "inspections", label: "Inspections" },
  { id: "issues", label: "Issues" },
  { id: "attendance", label: "Attendance" },
];

export function SiteNavigation({
  activeView,
  onViewChange,
}: SiteNavigationProps) {
  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % SITE_NAV_ITEMS.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex =
        (currentIndex - 1 + SITE_NAV_ITEMS.length) % SITE_NAV_ITEMS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = SITE_NAV_ITEMS.length - 1;
    }

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    const nextView = SITE_NAV_ITEMS[nextIndex];
    onViewChange(nextView.id);
    const tablist = event.currentTarget.closest('[role="tablist"]');
    const tabs = tablist?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs?.[nextIndex]?.focus();
  }

  return (
    <nav className={styles.siteNavigation} aria-label="Site operations views">
      <div role="tablist" aria-label="Site operations views">
        {SITE_NAV_ITEMS.map((item, index) => (
          <button
            key={item.id}
            id={`site-tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={activeView === item.id}
            aria-controls={`site-panel-${item.id}`}
            tabIndex={activeView === item.id ? 0 : -1}
            className={
              activeView === item.id
                ? styles.siteNavigationTabActive
                : styles.siteNavigationTab
            }
            onClick={() => onViewChange(item.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
