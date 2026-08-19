import { ProjectNavigationItem } from "./project-header.types";
import styles from "./project-header.module.css";

interface ProjectNavigationTabsProps {
  activeTab: string;
  items: ProjectNavigationItem[];
  onSelect: (label: string) => void;
}

export function ProjectNavigationTabs({
  activeTab,
  items,
  onSelect,
}: ProjectNavigationTabsProps) {
  const normalizedActive = activeTab.toLowerCase();

  return (
    <nav className={styles.projectNavigation} aria-label="Project workspace modules">
      <div className={styles.navigationScroller}>
        {items.map((item) => {
          const isActive =
            normalizedActive === item.key.toLowerCase() ||
            normalizedActive === item.label.toLowerCase();

          return (
            <button
              key={item.key}
              type="button"
              className={`${styles.navigationButton} ${
                isActive ? styles.navigationButtonActive : ""
              }`}
              onClick={() => onSelect(item.label)}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

