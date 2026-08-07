"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Check, Search } from "lucide-react";
import { ScheduleViewMode } from "./schedule-types";
import styles from "./schedule.module.css";

const DEFAULT_PHASES = ["Pre-design", "Design", "Procurement", "Construction", "Handover"];
const DEFAULT_WORKSTREAMS = [
  "Architecture",
  "Structure",
  "MEP",
  "Procurement",
  "Site execution",
  "Client approvals",
];
const DEFAULT_STATUSES = [
  "Scheduled",
  "In progress",
  "Pending approval",
  "Blocked",
  "Completed",
  "Delayed",
];

function FilterDropdownTab({
  label,
  options,
  selected = [],
  onToggle,
}: {
  label: string;
  options: string[];
  selected?: string[];
  onToggle?: (option: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeCount = selected.length;
  const displayLabel =
    activeCount === 0
      ? label
      : activeCount === 1
      ? selected[0]
      : `${label} (${activeCount})`;

  return (
    <div ref={containerRef} className={styles.headerFilterTabContainer}>
      <button
        type="button"
        className={`${styles.headerFilterTabBtn} ${
          activeCount > 0 ? styles.headerFilterTabActive : ""
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <span>{displayLabel}</span>
        <ChevronDown
          size={12}
          className={`${styles.headerFilterChevron} ${
            isOpen ? styles.chevronRotated : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className={styles.headerFilterDropdownMenu} role="menu">
          {options.map((opt) => {
            const isChecked = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                className={`${styles.headerFilterOption} ${
                  isChecked ? styles.headerFilterOptionSelected : ""
                }`}
                onClick={() => onToggle?.(opt)}
              >
                <div
                  className={`${styles.headerFilterCheckbox} ${
                    isChecked ? styles.headerFilterCheckboxChecked : ""
                  }`}
                >
                  {isChecked && <Check size={11} strokeWidth={3} />}
                </div>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export interface ScheduleHeaderProps {
  currentDateLabel?: string;
  dateRangeLabel: string;
  viewMode: ScheduleViewMode;
  searchValue: string;
  selectedPhases?: string[];
  selectedWorkstreams?: string[];
  selectedTeam?: string[];
  selectedStatuses?: string[];
  teamOptions?: string[];
  onTogglePhase?: (phase: string) => void;
  onToggleWorkstream?: (workstream: string) => void;
  onToggleTeam?: (owner: string) => void;
  onToggleStatus?: (status: string) => void;
  activeFilterCount?: number;
  isFilterSidebarExpanded?: boolean;
  onViewModeChange: (mode: ScheduleViewMode) => void;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  onNavigateToday: () => void;
  onSearchChange: (query: string) => void;
  onToggleFilter?: () => void;
  onAddMilestoneClick?: () => void;
}

export function ScheduleHeader({
  currentDateLabel,
  dateRangeLabel,
  viewMode,
  searchValue,
  selectedPhases = [],
  selectedWorkstreams = [],
  selectedTeam = [],
  selectedStatuses = [],
  teamOptions = ["Arun Mehta", "Anil Kumar", "Priya Sharma", "Vikram Singh"],
  onTogglePhase,
  onToggleWorkstream,
  onToggleTeam,
  onToggleStatus,
  activeFilterCount = 0,
  isFilterSidebarExpanded = false,
  onViewModeChange,
  onNavigatePrev,
  onNavigateNext,
  onNavigateToday,
  onSearchChange,
  onToggleFilter,
  onAddMilestoneClick,
}: ScheduleHeaderProps) {
  const viewOptions: ScheduleViewMode[] = ["Day", "Week", "Gantt"];

  return (
    <header className={styles.scheduleHeaderContainer}>
      <div className={styles.scheduleHeaderIdentity}>
        <div className={styles.titleStackGroup}>
          <h1 className={styles.schedulePageTitle}>{currentDateLabel || "30 Jul"}</h1>
        </div>
      </div>

      <div className={styles.scheduleHeaderNavigation}>
        <div className={styles.dateNavControlGroup}>
          <button
            type="button"
            className={styles.todayBtn}
            onClick={onNavigateToday}
            aria-label="Go to today"
          >
            Today
          </button>

          <div className={styles.arrowBtnGroup}>
            <button
              type="button"
              className={styles.navArrowBtn}
              onClick={onNavigatePrev}
              title="Previous week"
              aria-label="Previous week"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className={styles.navArrowBtn}
              onClick={onNavigateNext}
              title="Next week"
              aria-label="Next week"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className={styles.headerFilterGroup}>
          <FilterDropdownTab
            label="Phases"
            options={DEFAULT_PHASES}
            selected={selectedPhases}
            onToggle={onTogglePhase}
          />
          <FilterDropdownTab
            label="Workstreams"
            options={DEFAULT_WORKSTREAMS}
            selected={selectedWorkstreams}
            onToggle={onToggleWorkstream}
          />
          <FilterDropdownTab
            label="Team"
            options={teamOptions}
            selected={selectedTeam}
            onToggle={onToggleTeam}
          />
          <FilterDropdownTab
            label="Status"
            options={DEFAULT_STATUSES}
            selected={selectedStatuses}
            onToggle={onToggleStatus}
          />
        </div>
      </div>

      <div className={styles.scheduleHeaderActions}>
        <div className={styles.searchBoxWrapper}>
          <Search size={14} className={styles.searchBoxIcon} aria-hidden="true" />
          <input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search schedule…"
            aria-label="Search schedule"
            className={styles.searchInputField}
          />
          <button
            type="button"
            className={styles.searchCollapsedIconBtn}
            title="Search schedule"
            aria-label="Search schedule"
          >
            <Search size={15} />
          </button>
        </div>

        <div
          className={styles.viewSwitcherGroup}
          role="tablist"
          aria-label="Schedule view"
        >
          {viewOptions.map((mode) => (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={viewMode === mode}
              className={`${styles.viewTabBtn} ${
                viewMode === mode ? styles.viewTabActive : ""
              }`}
              onClick={() => onViewModeChange(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
