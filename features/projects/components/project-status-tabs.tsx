import React from "react";
import { Clock, Calendar, PauseCircle, CheckCircle2 } from "lucide-react";
import { ProjectStatus } from "../types/project.types";
import styles from "../projects.module.css";

interface ProjectStatusTabsProps {
  currentStatus: ProjectStatus | "ALL" | undefined;
  counts?: {
    active: number;
    upcoming: number;
    onHold: number;
    completed: number;
    all: number;
  };
  onSelectTab: (status: ProjectStatus | "ALL") => void;
}

export function ProjectStatusTabs({
  currentStatus,
  counts,
  onSelectTab,
}: ProjectStatusTabsProps) {
  const activeStatus: ProjectStatus | "ALL" | undefined =
    currentStatus || "UPCOMING";

  return (
    <div className={styles.segmentedControl} role="tablist" aria-label="Project status views">
      <button
        type="button"
        role="tab"
        aria-selected={activeStatus === "ACTIVE"}
        className={`${styles.segmentTab}${activeStatus === "ACTIVE" ? ` ${styles.active}` : ""}`}
        onClick={() => onSelectTab("ACTIVE")}
      >
        <Clock size={16} className={styles.tabIcon} />
        <span>Active</span>
        {counts !== undefined && <span className={styles.tabCount}>{counts.active}</span>}
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeStatus === "UPCOMING"}
        className={`${styles.segmentTab}${activeStatus === "UPCOMING" ? ` ${styles.active}` : ""}`}
        onClick={() => onSelectTab("UPCOMING")}
      >
        <Calendar size={16} className={styles.tabIcon} />
        <span>Upcoming</span>
        {counts !== undefined && <span className={styles.tabCount}>{counts.upcoming}</span>}
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeStatus === "ON_HOLD"}
        className={`${styles.segmentTab}${activeStatus === "ON_HOLD" ? ` ${styles.active}` : ""}`}
        onClick={() => onSelectTab("ON_HOLD")}
      >
        <PauseCircle size={16} className={styles.tabIcon} />
        <span>On hold</span>
        {counts !== undefined && <span className={styles.tabCount}>{counts.onHold}</span>}
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeStatus === "COMPLETED"}
        className={`${styles.segmentTab}${activeStatus === "COMPLETED" ? ` ${styles.active}` : ""}`}
        onClick={() => onSelectTab("COMPLETED")}
      >
        <CheckCircle2 size={16} className={styles.tabIcon} />
        <span>Completed</span>
        {counts !== undefined && <span className={styles.tabCount}>{counts.completed}</span>}
      </button>
    </div>
  );
}
