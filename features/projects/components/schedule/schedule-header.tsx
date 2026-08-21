"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Check } from "lucide-react";
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

function UnifiedFilterDropdown({
  selectedPhases = [],
  selectedWorkstreams = [],
  selectedTeam = [],
  selectedStatuses = [],
  teamOptions = ["Arun Mehta", "Anil Kumar", "Priya Sharma", "Vikram Singh"],
  onTogglePhase,
  onToggleWorkstream,
  onToggleTeam,
  onToggleStatus,
}: {
  selectedPhases?: string[];
  selectedWorkstreams?: string[];
  selectedTeam?: string[];
  selectedStatuses?: string[];
  teamOptions?: string[];
  onTogglePhase?: (phase: string) => void;
  onToggleWorkstream?: (workstream: string) => void;
  onToggleTeam?: (owner: string) => void;
  onToggleStatus?: (status: string) => void;
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

  const totalCount =
    selectedPhases.length +
    selectedWorkstreams.length +
    selectedTeam.length +
    selectedStatuses.length;

  const displayLabel = "Filters";

  const filterSections = [
    {
      title: "Phases",
      options: DEFAULT_PHASES,
      selected: selectedPhases,
      onToggle: onTogglePhase,
    },
    {
      title: "Workstreams",
      options: DEFAULT_WORKSTREAMS,
      selected: selectedWorkstreams,
      onToggle: onToggleWorkstream,
    },
    {
      title: "Team",
      options: teamOptions,
      selected: selectedTeam,
      onToggle: onToggleTeam,
    },
    {
      title: "Status",
      options: DEFAULT_STATUSES,
      selected: selectedStatuses,
      onToggle: onToggleStatus,
    },
  ];

  return (
    <div ref={containerRef} className={styles.headerFilterTabContainer}>
      <button
        type="button"
        className={`${styles.headerFilterTabBtn} ${
          totalCount > 0 ? styles.headerFilterTabActive : ""
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
        <div className={styles.headerUnifiedFilterDropdownMenu} role="menu">
          <div className={styles.unifiedFilterSectionsContainer}>
            {filterSections.map((sec) => (
              <div key={sec.title} className={styles.unifiedFilterSectionBlock}>
                <div className={styles.unifiedFilterSectionHeader}>
                  <span>{sec.title}</span>
                  {sec.selected.length > 0 && (
                    <span className={styles.unifiedFilterSectionBadge}>
                      {sec.selected.length}
                    </span>
                  )}
                </div>
                <div className={styles.unifiedFilterOptionsList}>
                  {sec.options.map((opt) => {
                    const isChecked = sec.selected.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        className={`${styles.headerFilterOption} ${
                          isChecked ? styles.headerFilterOptionSelected : ""
                        }`}
                        onClick={() => sec.onToggle?.(opt)}
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
              </div>
            ))}
          </div>
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
  headerTabs?: React.ReactNode;
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
  headerTabs,
}: ScheduleHeaderProps) {
  const viewOptions: ScheduleViewMode[] = ["Day", "Week"];

  return (
    <header className={styles.scheduleHeaderContainer}>
      <div className={styles.scheduleTopControlRow}>
        <div className={styles.topControlRowLeft}>
          {headerTabs}
        </div>

        <div className={styles.topControlRowRight}>
          <div className={styles.headerFilterGroup}>
            <UnifiedFilterDropdown
              selectedPhases={selectedPhases}
              selectedWorkstreams={selectedWorkstreams}
              selectedTeam={selectedTeam}
              selectedStatuses={selectedStatuses}
              teamOptions={teamOptions}
              onTogglePhase={onTogglePhase}
              onToggleWorkstream={onToggleWorkstream}
              onToggleTeam={onToggleTeam}
              onToggleStatus={onToggleStatus}
            />
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

          <button
            type="button"
            className={`${styles.ganttSeparateBtn} ${
              viewMode === "Gantt" ? styles.ganttSeparateBtnActive : ""
            }`}
            onClick={() => onViewModeChange("Gantt")}
            aria-pressed={viewMode === "Gantt"}
          >
            Gantt
          </button>
        </div>
      </div>
    </header>
  );
}
