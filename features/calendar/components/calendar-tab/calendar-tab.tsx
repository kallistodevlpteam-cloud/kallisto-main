"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  X,
} from "lucide-react";
import type { CalendarQueryState, TodayCategoryId } from "../../hooks/use-calendar-query-state";
import type { PresentableActivity } from "../../services/calendar-activity.service";
import styles from "../calendar-workspace-page.module.css";

const REFERENCE_TODAY = "2026-07-24";

export interface CalendarTabProps {
  queryState?: CalendarQueryState;
  onUpdateQuery?: (updates: Partial<CalendarQueryState>) => void;
  activities?: PresentableActivity[];
  projectsList?: Array<{ id: string; name: string }>;
  onSelectActivity?: (id: string) => void;
  onAddActivity?: (date?: string) => void;
}

const CATEGORY_LABELS: Record<TodayCategoryId, string> = {
  all: "All types",
  meetings: "Meetings",
  site: "Site visits",
  tasks: "Tasks",
  deadlines: "Deadlines",
  deliverables: "Deliverables",
};

const CATEGORY_TYPES: Record<Exclude<TodayCategoryId, "all">, string[]> = {
  meetings: ["client_meeting", "team_meeting"],
  site: ["site_visit", "inspection"],
  tasks: ["task", "reminder"],
  deadlines: ["approval", "payment_review"],
  deliverables: ["drawing_delivery", "milestone"],
};

function formatTimePart(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHours = hours % 12 || 12;
  return `${normalizedHours}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function formatActivityTime(activity: PresentableActivity) {
  if (activity.time.allDay) return "All day";
  const start = formatTimePart(activity.time.startAt.substring(11, 16));
  const end = formatTimePart(activity.time.endAt.substring(11, 16));
  return `${start}–${end}`;
}

function getDotClass(activityType: string): string {
  switch (activityType) {
    case "client_meeting":
    case "team_meeting":
      return styles.editorialDotMeeting;
    case "site_visit":
    case "inspection":
      return styles.editorialDotSite;
    case "drawing_delivery":
    case "milestone":
      return styles.editorialDotDeliverable;
    case "approval":
    case "payment_review":
      return styles.editorialDotDeadline;
    default:
      return styles.editorialDotTask;
  }
}

export function CalendarTab({
  queryState,
  onUpdateQuery,
  activities = [],
  projectsList = [],
  onSelectActivity,
  onAddActivity,
}: CalendarTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDayPopover, setSelectedDayPopover] = useState<string | null>(null);

  const selectedDateStr = queryState?.date || REFERENCE_TODAY;
  const currentMonthDate = useMemo(() => {
    const d = new Date(`${selectedDateStr.substring(0, 7)}-01T12:00:00`);
    return Number.isNaN(d.getTime()) ? new Date("2026-07-01T12:00:00") : d;
  }, [selectedDateStr]);

  const projectsById = useMemo(
    () => new Map(projectsList.map((p) => [p.id, p.name])),
    [projectsList]
  );

  const handlePrevMonth = () => {
    const prev = new Date(currentMonthDate);
    prev.setMonth(prev.getMonth() - 1);
    const dateStr = prev.toISOString().substring(0, 10);
    onUpdateQuery?.({ date: dateStr });
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonthDate);
    next.setMonth(next.getMonth() + 1);
    const dateStr = next.toISOString().substring(0, 10);
    onUpdateQuery?.({ date: dateStr });
  };

  const handleTodayClick = () => {
    onUpdateQuery?.({ date: REFERENCE_TODAY });
  };

  // Build full 5 or 6-week Monday-first calendar matrix
  const calendarWeeks = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    const firstOfMonth = new Date(year, month, 1, 12);
    const lastOfMonth = new Date(year, month + 1, 0, 12);

    // Monday offset (Monday = 0)
    const startDayOfWeek = (firstOfMonth.getDay() + 6) % 7;

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    // Leading days from previous month
    for (let i = startDayOfWeek; i > 0; i--) {
      const prevDate = new Date(year, month, 1 - i, 12);
      const dateStr = prevDate.toISOString().substring(0, 10);
      days.push({
        dateStr,
        dayNumber: prevDate.getDate(),
        isCurrentMonth: false,
        isToday: dateStr === REFERENCE_TODAY,
        isSelected: dateStr === selectedDateStr,
      });
    }

    // Days of current month
    for (let day = 1; day <= lastOfMonth.getDate(); day++) {
      const currDate = new Date(year, month, day, 12);
      const dateStr = currDate.toISOString().substring(0, 10);
      days.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dateStr === REFERENCE_TODAY,
        isSelected: dateStr === selectedDateStr,
      });
    }

    // Trailing days from next month to complete week row
    const trailingDays = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= trailingDays; i++) {
      const nextDate = new Date(year, month + 1, i, 12);
      const dateStr = nextDate.toISOString().substring(0, 10);
      days.push({
        dateStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: dateStr === REFERENCE_TODAY,
        isSelected: dateStr === selectedDateStr,
      });
    }

    // Group into 7-day weeks
    const weeks: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  }, [currentMonthDate, selectedDateStr]);

  // Filter activities by scope, category, and real-time search query
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const isTeamScope = queryState?.scope === "team";
      const isInScope =
        !isTeamScope ||
        act.ownerId === "usr-1" ||
        act.assigneeIds.includes("usr-1");

      const category = queryState?.category || "all";
      const isInCategory =
        category === "all" ||
        CATEGORY_TYPES[category as Exclude<TodayCategoryId, "all">]?.includes(
          act.activityType
        );

      if (!isInScope || !isInCategory) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const projectName = act.projectId
          ? projectsById.get(act.projectId)?.toLowerCase() ?? ""
          : "";
        const matchesTitle = act.title.toLowerCase().includes(query);
        const matchesProject = projectName.includes(query);
        const matchesLocation = act.location?.toLowerCase().includes(query) ?? false;
        return matchesTitle || matchesProject || matchesLocation;
      }

      return true;
    });
  }, [activities, queryState?.scope, queryState?.category, searchQuery, projectsById]);

  // Map activities by date string
  const activitiesByDate = useMemo(() => {
    const map = new Map<string, PresentableActivity[]>();
    filteredActivities.forEach((act) => {
      const date = act.time.allDay
        ? act.time.startDate
        : act.time.startAt.substring(0, 10);
      const list = map.get(date) ?? [];
      list.push(act);
      map.set(date, list);
    });
    return map;
  }, [filteredActivities]);

  const monthYearHeaderLabel = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
  }).format(currentMonthDate);

  const [activeSavedView, setActiveSavedView] = useState("weekly");
  const miniDaysHeader = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const WEEKDAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  return (
    <div className={styles.scheduleWorkspaceLayout}>
      {/* Left Sidebar */}
      <aside className={styles.scheduleSidebar}>
        {/* Mini Month Picker */}
        <div className={styles.miniMonthPicker}>
          <div className={styles.miniMonthHeader}>
            <span>{monthYearHeaderLabel}</span>
            <div className={styles.miniMonthNav}>
              <button
                type="button"
                aria-label="Previous month"
                onClick={handlePrevMonth}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={handleNextMonth}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <div className={styles.miniMonthDaysHeader}>
            {miniDaysHeader.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className={styles.miniMonthGrid}>
            {calendarWeeks.flat().map((cell) => (
              <button
                key={cell.dateStr}
                type="button"
                className={`${styles.miniDayCell} ${
                  cell.isSelected ? styles.miniDaySelected : ""
                } ${!cell.isCurrentMonth ? styles.miniDayMuted : ""}`}
                onClick={() => onUpdateQuery?.({ date: cell.dateStr })}
              >
                {cell.dayNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Saved Views */}
        <div className={styles.sidebarSection}>
          <h5 className={styles.sidebarSectionTitle}>SAVED VIEWS</h5>
          <div className={styles.savedViewsList}>
            <button
              type="button"
              className={`${styles.savedViewItem} ${
                activeSavedView === "weekly" ? styles.savedViewActive : ""
              }`}
              onClick={() => setActiveSavedView("weekly")}
            >
              <span className={styles.savedViewDotPurple} />
              <span>Weekly Execution Plan</span>
            </button>
            <button
              type="button"
              className={`${styles.savedViewItem} ${
                activeSavedView === "critical" ? styles.savedViewActive : ""
              }`}
              onClick={() => setActiveSavedView("critical")}
            >
              <span className={styles.savedViewDotGrey} />
              <span>Critical Path View</span>
            </button>
            <button
              type="button"
              className={`${styles.savedViewItem} ${
                activeSavedView === "site" ? styles.savedViewActive : ""
              }`}
              onClick={() => setActiveSavedView("site")}
            >
              <span className={styles.savedViewDotGrey} />
              <span>Site Coordination</span>
            </button>
          </div>
        </div>

        {/* Phases */}
        <div className={styles.sidebarSection}>
          <h5 className={styles.sidebarSectionTitle}>PHASES</h5>
          <div className={styles.checkboxList}>
            {["Pre-design", "Design", "Procurement", "Construction", "Handover"].map(
              (phase) => (
                <label key={phase} className={styles.checkboxLabel}>
                  <input type="checkbox" defaultChecked />
                  <span>{phase}</span>
                </label>
              ),
            )}
          </div>
        </div>

        {/* Workstreams */}
        <div className={styles.sidebarSection}>
          <h5 className={styles.sidebarSectionTitle}>WORKSTREAMS</h5>
          <div className={styles.checkboxList}>
            {["Architecture", "Structure", "MEP", "Procurement"].map((ws) => (
              <label key={ws} className={styles.checkboxLabel}>
                <input type="checkbox" defaultChecked />
                <span>{ws}</span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Board Region */}
      <main className={styles.scheduleMainContent}>
        <div className={styles.editorialMonthWorkspace}>
          {/* Calendar Header Row */}
          <div className={styles.editorialMonthHeader}>
            <div className={styles.editorialMonthNavGroup}>
              <h2 className={styles.editorialMonthLabel}>{monthYearHeaderLabel}</h2>
              <div className={styles.editorialMonthNavButtons}>
                <button
                  type="button"
                  className={styles.editorialNavBtn}
                  aria-label="Previous month"
                  onClick={handlePrevMonth}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  className={styles.editorialNavBtn}
                  aria-label="Next month"
                  onClick={handleNextMonth}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <button
                type="button"
                className={styles.editorialTodayBtn}
                onClick={handleTodayClick}
              >
                Today
              </button>
            </div>

          <div className={styles.editorialMonthFilterGroup}>
          <div className={styles.editorialSearchWrapper}>
            <Search size={14} className={styles.editorialSearchIcon} />
            <input
              type="text"
              className={styles.editorialSearchInput}
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.editorialSearchClear}
                aria-label="Clear search"
                onClick={() => setSearchQuery("")}
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className={styles.editorialFilterSelects}>
            <select
              className={styles.editorialSelect}
              aria-label="Calendar scope"
              value={queryState?.scope || "mine"}
              onChange={(e) =>
                onUpdateQuery?.({ scope: e.target.value as "mine" | "team" })
              }
            >
              <option value="mine">My work</option>
              <option value="team">Team</option>
            </select>

            <select
              className={styles.editorialSelect}
              aria-label="Activity type"
              value={queryState?.category || "all"}
              onChange={(e) =>
                onUpdateQuery?.({ category: e.target.value as TodayCategoryId })
              }
            >
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Editorial Month Board Grid */}
      <div className={styles.editorialMonthBoard}>
        {calendarWeeks.map((week, weekIndex) => (
          <div key={`week-${weekIndex}`} className={styles.editorialWeekRow}>
            {week.map((cell, colIndex) => {
              const dayActivities = activitiesByDate.get(cell.dateStr) ?? [];
              const maxVisible = 2;
              const overflowCount = dayActivities.length - maxVisible;
              const isPopoverOpen = selectedDayPopover === cell.dateStr;

              return (
                <div
                  key={cell.dateStr}
                  className={`${styles.editorialMonthCell} ${
                    !cell.isCurrentMonth ? styles.editorialMonthCellMuted : ""
                  } ${cell.isToday ? styles.editorialMonthCellToday : ""} ${
                    cell.isSelected ? styles.editorialMonthCellSelected : ""
                  }`}
                  onClick={(e) => {
                    // Clicking blank date cell updates query & opens add activity modal
                    if (e.target === e.currentTarget) {
                      onUpdateQuery?.({ date: cell.dateStr });
                      onAddActivity?.(cell.dateStr);
                    }
                  }}
                >
                  {/* Top Rule */}
                  <div className={styles.editorialCellTopRule} />

                  {/* Weekday Label (First Row Only) */}
                  {weekIndex === 0 && (
                    <span
                      className={`${styles.editorialCellWeekday} ${
                        cell.isToday ? styles.editorialCellWeekdayToday : ""
                      }`}
                    >
                      {WEEKDAY_NAMES[colIndex]}
                    </span>
                  )}

                  {/* Date Number Header */}
                  <div className={styles.editorialCellDateHeader}>
                    <span
                      className={`${styles.editorialCellDateNum} ${
                        cell.isToday ? styles.editorialCellDateNumToday : ""
                      }`}
                      onClick={() => onUpdateQuery?.({ date: cell.dateStr })}
                    >
                      {String(cell.dayNumber).padStart(2, "0")}
                    </span>
                    {cell.isToday && (
                      <span className={styles.editorialTodayBadge}>Today</span>
                    )}
                  </div>

                  {/* Event Typography List */}
                  <div className={styles.editorialCellEventList}>
                    {dayActivities.slice(0, maxVisible).map((act) => {
                      const isPrivateInTeamScope =
                        queryState?.scope === "team" &&
                        act.visibility === "private" &&
                        act.ownerId !== "usr-1";

                      const projectName = act.projectId
                        ? projectsById.get(act.projectId) ?? act.projectId
                        : "Studio";

                      return (
                        <button
                          type="button"
                          key={act.id}
                          className={styles.editorialEventItem}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectActivity?.(act.id);
                          }}
                        >
                          <div className={styles.editorialEventItemHeader}>
                            <i
                              className={`${styles.editorialEventDot} ${getDotClass(
                                act.activityType
                              )}`}
                              aria-hidden="true"
                            />
                            <span className={styles.editorialEventItemTitle}>
                              {isPrivateInTeamScope ? "Busy" : act.title}
                            </span>
                          </div>
                          <span className={styles.editorialEventItemTime}>
                            {formatActivityTime(act)}
                          </span>
                          {!isPrivateInTeamScope && (
                            <span className={styles.editorialEventItemProject}>
                              {projectName}
                            </span>
                          )}
                        </button>
                      );
                    })}

                    {/* Overflow indicator */}
                    {overflowCount > 0 && (
                      <button
                        type="button"
                        className={styles.editorialOverflowBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDayPopover(
                            isPopoverOpen ? null : cell.dateStr
                          );
                        }}
                      >
                        +{overflowCount} more
                      </button>
                    )}
                  </div>

                  {/* Overflow Popover Drawer */}
                  {isPopoverOpen && (
                    <div
                      className={styles.editorialDayPopover}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className={styles.editorialPopoverHeader}>
                        <span>
                          {cell.dayNumber} {monthYearHeaderLabel}
                        </span>
                        <button
                          type="button"
                          aria-label="Close overflow"
                          onClick={() => setSelectedDayPopover(null)}
                        >
                          <X size={13} />
                        </button>
                      </div>
                      <div className={styles.editorialPopoverList}>
                        {dayActivities.map((act) => (
                          <button
                            type="button"
                            key={act.id}
                            className={styles.editorialEventItem}
                            onClick={() => {
                              setSelectedDayPopover(null);
                              onSelectActivity?.(act.id);
                            }}
                          >
                            <span className={styles.editorialEventItemTitle}>
                              {act.title}
                            </span>
                            <span className={styles.editorialEventItemTime}>
                              {formatActivityTime(act)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  </main>
</div>
  );
}
