"use client";

import React from "react";
import {
  Activity,
  Bookmark,
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Layers,
  PanelLeftClose,
  Users,
} from "lucide-react";
import {
  addDays,
  buildMiniCalendar,
  formatWeekRange,
  getMonthLabel,
  getWeekOfMonthLabel,
  startOfMondayWeek,
} from "./schedule-date-range";
import styles from "./schedule.module.css";

export interface ScheduleSidebarProps {
  anchorDate: string;
  selectedDate: string;
  todayDate: string;
  selectedPhases: string[];
  selectedWorkstreams: string[];
  selectedTeam: string[];
  selectedStatuses: string[];
  selectedSavedView: string | null;
  teamOptions: string[];
  isCollapsed: boolean;
  forceExpanded: boolean;
  activeFilterCount: number;
  onToggleCollapsed: () => void;
  onNavigateMonth: (direction: number) => void;
  onNavigateWeek?: (direction: -1 | 1) => void;
  onSelectDate: (date: string) => void;
  onTogglePhase: (phase: string) => void;
  onToggleWorkstream: (workstream: string) => void;
  onToggleTeam: (owner: string) => void;
  onToggleStatus: (status: string) => void;
  onSelectSavedView: (viewName: string) => void;
}

const PHASES = [
  "Pre-design",
  "Design",
  "Procurement",
  "Construction",
  "Handover",
];

const WORKSTREAMS = [
  "Architecture",
  "Structure",
  "MEP",
  "Procurement",
  "Site execution",
  "Client approvals",
];

const STATUSES = [
  "Scheduled",
  "In progress",
  "Pending approval",
  "Blocked",
  "Completed",
  "Delayed",
];

const SAVED_VIEWS = [
  { id: "v1", name: "Weekly Execution Plan" },
  { id: "v2", name: "Critical Path View" },
  { id: "v3", name: "Site Coordination" },
];

export function ScheduleSidebar({
  anchorDate,
  selectedDate,
  todayDate,
  selectedPhases,
  selectedWorkstreams,
  selectedTeam,
  selectedStatuses,
  selectedSavedView,
  teamOptions,
  isCollapsed,
  forceExpanded,
  activeFilterCount,
  onToggleCollapsed,
  onNavigateMonth,
  onNavigateWeek,
  onSelectDate,
  onTogglePhase,
  onToggleWorkstream,
  onToggleTeam,
  onToggleStatus,
  onSelectSavedView,
}: ScheduleSidebarProps) {
  const miniCalendarDays = buildMiniCalendar(anchorDate);
  const weekOfMonthLabel = getWeekOfMonthLabel(selectedDate || anchorDate, anchorDate);

  return (
    <aside
      id="schedule-filter-sidebar"
      className={`${styles.scheduleSidebarContainer} ${
        isCollapsed ? styles.sidebarCollapsed : ""
      } ${forceExpanded ? styles.sidebarForceExpanded : ""}`}
      aria-label={isCollapsed ? "Collapsed schedule filters" : "Schedule filters"}
    >
      <div className={styles.sidebarCollapsedContent}>
        <button
          type="button"
          className={styles.sidebarExpandButton}
          onClick={onToggleCollapsed}
          aria-label="Expand schedule filters"
        >
          <ChevronRight size={16} />
          {activeFilterCount > 0 && (
            <span className={styles.collapsedFilterCount}>
              {activeFilterCount}
            </span>
          )}
        </button>
        <div className={styles.collapsedIconRail} aria-hidden="true">
          <Calendar size={17} />
          <Bookmark size={17} />
          <Layers size={17} />
          <Activity size={17} />
          <Users size={17} />
          <CheckSquare size={17} />
        </div>
      </div>

      <div className={styles.sidebarExpandedContent}>
        <div className={styles.sidebarScrollableContent}>
        <div className={styles.miniCalCard}>
          <div className={styles.miniCalHeader}>
            <div className={styles.miniCalNavGroup}>
              <button
                type="button"
                className={styles.miniCalNavBtn}
                onClick={() => onNavigateMonth(-12)}
                title="Previous year"
                aria-label="Previous year"
              >
                <ChevronsLeft size={13} />
              </button>
              <button
                type="button"
                className={styles.miniCalNavBtn}
                onClick={() => onNavigateMonth(-1)}
                title="Previous month"
                aria-label="Previous month"
              >
                <ChevronLeft size={13} />
              </button>
            </div>

            <span className={styles.miniCalTitleText}>
              {getMonthLabel(anchorDate)}
            </span>

            <div className={styles.miniCalNavGroup}>
              <button
                type="button"
                className={styles.miniCalNavBtn}
                onClick={() => onNavigateMonth(1)}
                title="Next month"
                aria-label="Next month"
              >
                <ChevronRight size={13} />
              </button>
              <button
                type="button"
                className={styles.miniCalNavBtn}
                onClick={() => onNavigateMonth(12)}
                title="Next year"
                aria-label="Next year"
              >
                <ChevronsRight size={13} />
              </button>
            </div>
          </div>

          <div className={styles.miniCalWeekRow}>
            <button
              type="button"
              className={styles.miniCalWeekBtn}
              onClick={() => (onNavigateWeek ? onNavigateWeek(-1) : onNavigateMonth(-1))}
              title="Previous week"
              aria-label="Previous week"
            >
              <ChevronLeft size={13} />
            </button>

            <span className={styles.miniCalWeekText}>
              {weekOfMonthLabel}
            </span>

            <button
              type="button"
              className={styles.miniCalWeekBtn}
              onClick={() => (onNavigateWeek ? onNavigateWeek(1) : onNavigateMonth(1))}
              title="Next week"
              aria-label="Next week"
            >
              <ChevronRight size={13} />
            </button>
          </div>

          <div className={styles.miniCalGrid}>
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
              <span key={day} className={styles.miniCalDayHeader}>
                {day}
              </span>
            ))}

            {miniCalendarDays.map((day) => (
              <button
                key={day.date}
                type="button"
                className={`${styles.miniCalDayCell} ${
                  day.date === todayDate ? styles.miniCalTodayCell : ""
                } ${
                  day.date === selectedDate ? styles.miniCalSelectedCell : ""
                } ${
                  !day.isCurrentMonth ? styles.miniCalMutedCell : ""
                }`}
                onClick={() => onSelectDate(day.date)}
                aria-pressed={day.date === selectedDate}
                aria-label={day.date}
              >
                {day.dayNumber}
              </button>
            ))}
          </div>
        </div>

        <SidebarSection
          icon={<Bookmark size={13} />}
          title="Saved Views"
        >
          <div className={styles.savedViewsList}>
            {SAVED_VIEWS.map((savedView) => (
              <button
                key={savedView.id}
                type="button"
                className={`${styles.savedViewBtn} ${
                  selectedSavedView === savedView.name
                    ? styles.savedViewActive
                    : ""
                }`}
                onClick={() => onSelectSavedView(savedView.name)}
              >
                <span className={styles.savedViewDot} />
                <span>{savedView.name}</span>
              </button>
            ))}
          </div>
        </SidebarSection>

        {/* Sidebar sections (Phases, Workstreams, Team, Status) moved to Header Filter Toolbar */}
        </div>
      </div>
    </aside>
  );
}

function SidebarSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.sidebarSectionBlock}>
      <div className={styles.sectionHeaderRow}>
        <span className={styles.sectionHeaderIcon}>{icon}</span>
        <h3 className={styles.sectionTitleHeading}>{title}</h3>
      </div>
      {children}
    </section>
  );
}

function CheckboxSection({
  icon,
  title,
  values,
  selected,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  values: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <SidebarSection icon={icon} title={title}>
      <div className={styles.checkboxFilterList}>
        {values.map((value) => (
          <label key={value} className={styles.filterCheckboxItem}>
            <input
              type="checkbox"
              checked={selected.includes(value)}
              onChange={() => onToggle(value)}
              className={styles.checkboxInput}
            />
            <span className={styles.checkboxLabelText}>{value}</span>
          </label>
        ))}
      </div>
    </SidebarSection>
  );
}
