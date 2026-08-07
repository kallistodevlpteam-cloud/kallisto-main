"use client";

import React from "react";
import { Search, Filter } from "lucide-react";
import { TimelineCategoryFilter } from "../query-state/timeline-query-schema";
import styles from "./chronological-timeline.module.css";

interface TimelineFiltersProps {
  activeCategory: TimelineCategoryFilter;
  onSelectCategory: (cat: TimelineCategoryFilter) => void;
  searchValue: string;
  onSearchChange: (q: string) => void;
}

export function TimelineFilters({
  activeCategory,
  onSelectCategory,
  searchValue,
  onSearchChange,
}: TimelineFiltersProps) {
  return (
    <div className={styles.filterBarRow}>
      {/* High-level Segmented Control: All | Activities | Milestones | Approvals */}
      <div className={styles.segmentedSwitch} role="tablist" aria-label="Timeline category filter">
        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === "all"}
          className={`${styles.segmentTab} ${activeCategory === "all" ? styles.segmentTabActive : ""}`}
          onClick={() => onSelectCategory("all")}
        >
          All
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === "activities"}
          className={`${styles.segmentTab} ${activeCategory === "activities" ? styles.segmentTabActive : ""}`}
          onClick={() => onSelectCategory("activities")}
        >
          Activities
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === "milestones"}
          className={`${styles.segmentTab} ${activeCategory === "milestones" ? styles.segmentTabActive : ""}`}
          onClick={() => onSelectCategory("milestones")}
        >
          Milestones
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === "approvals"}
          className={`${styles.segmentTab} ${activeCategory === "approvals" ? styles.segmentTabActive : ""}`}
          onClick={() => onSelectCategory("approvals")}
        >
          Approvals
        </button>
      </div>

      {/* Right Controls: Search & Filter */}
      <div className={styles.filterControlsRight}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search timeline..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
            aria-label="Search timeline activities"
          />
        </div>
      </div>
    </div>
  );
}
