"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExternalLink, Filter, Plus, Search } from "lucide-react";
import styles from "./chronological/chronological-timeline.module.css";

export interface TimelineToolbarProps {
  projectId: string;
  activeFilter: string;
  searchValue: string;
  canCreateActivity?: boolean;
  onFilterChange: (filterId: string) => void;
  onSearchChange: (query: string) => void;
  onAddActivityClick?: () => void;
}

export const TOOLBAR_FILTER_TABS = [
  { id: "all", label: "All activity" },
  { id: "milestones", label: "Milestones" },
  { id: "tasks", label: "Tasks" },
  { id: "approvals", label: "Approvals" },
  { id: "payments", label: "Payments" },
  { id: "site", label: "Site updates" },
] as const;

export function TimelineToolbar({
  projectId,
  activeFilter,
  searchValue,
  canCreateActivity = true,
  onFilterChange,
  onSearchChange,
  onAddActivityClick,
}: TimelineToolbarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className={styles.timelineToolbarContainer}>
      {/* Top Row: Title + Right Controls */}
      <div className={styles.toolbarTopRow}>
        <div className={styles.toolbarLeftTitleCol}>
          <h1 className={styles.toolbarTitle}>Project timeline</h1>
          <p className={styles.toolbarSubtitle}>
            Track phases, milestones, approvals and site progress
          </p>
        </div>

        <div className={styles.toolbarRightActionsRow}>
          {/* Search Box */}
          <div className={styles.toolbarSearchBox}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search timeline..."
              className={styles.toolbarSearchInput}
            />
          </div>

          {/* Filter Button */}
          <button
            type="button"
            className={`${styles.toolbarFilterBtn} ${isFilterOpen ? styles.filterBtnActive : ""}`}
            onClick={() => setIsFilterOpen((prev) => !prev)}
          >
            <Filter size={14} />
            <span>Filter</span>
          </button>

          {/* Primary Outlined Button: View Gantt Chart */}
          <Link
            href={`/projects/${projectId}/timeline/gantt`}
            className={styles.toolbarGanttBtn}
          >
            <span>View Gantt Chart</span>
            <ExternalLink size={14} />
          </Link>

          {/* Add Milestone Button */}
          {canCreateActivity && onAddActivityClick && (
            <button
              type="button"
              className={styles.toolbarAddActivityBtn}
              onClick={onAddActivityClick}
            >
              <Plus size={15} />
              <span>Add milestone</span>
            </button>
          )}
        </div>
      </div>

      {/* Secondary Row: Activity Filter Switcher Tabs */}
      <div className={styles.toolbarFilterTabsRow}>
        {TOOLBAR_FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.toolbarTabBtn} ${
              activeFilter === tab.id ? styles.toolbarTabActive : ""
            }`}
            onClick={() => onFilterChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
