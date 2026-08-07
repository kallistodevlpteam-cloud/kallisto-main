import type { HandsTab } from "../types/hands.types";
import styles from "./hands-overview.module.css";

const TABS: ReadonlyArray<{ id: HandsTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "requests", label: "Requests" },
  { id: "deployments", label: "Deployments" },
  { id: "attendance", label: "Attendance" },
  { id: "payments", label: "Payments" },
];

interface HandsPageTabsProps {
  activeTab: HandsTab;
  onSelect: (tab: HandsTab) => void;
}

export function HandsPageTabs({
  activeTab,
  onSelect,
}: HandsPageTabsProps) {
  return (
    <div
      className={styles.tabsScroller}
      role="tablist"
      aria-label="Hands workspaces"
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`hands-tab-${tab.id}`}
          aria-selected={activeTab === tab.id}
          aria-controls={`hands-panel-${tab.id}`}
          className={`${styles.tabButton} ${
            activeTab === tab.id ? styles.tabButtonActive : ""
          }`}
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
