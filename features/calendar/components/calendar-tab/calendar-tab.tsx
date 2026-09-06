"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Phone,
  Check,
  MapPin,
  AlertTriangle,
  Building2,
  Plus,
} from "lucide-react";
import {
  SearchDuotoneIcon,
  TeamDuotoneIcon,
  CalendarDuotoneIcon,
  DocumentsDuotoneIcon,
  AnalyticsDuotoneIcon,
  SpreadsheetDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import type {
  CalendarQueryState,
  TodayCategoryId,
} from "../../hooks/use-calendar-query-state";
import type { PresentableActivity } from "../../services/calendar-activity.service";
import { CALENDAR_TEAM_MEMBERS } from "../../data/mock-calendar-data";
import styles from "../calendar-workspace-page.module.css";

const REFERENCE_TODAY = "2026-07-24";
const MAX_VISIBLE_ACTIVITIES = 2;

export interface CalendarTabProps {
  queryState?: CalendarQueryState;
  onUpdateQuery?: (updates: Partial<CalendarQueryState>) => void;
  activities?: PresentableActivity[];
  projectsList?: Array<{ id: string; name: string }>;
  onSelectActivity?: (id: string) => void;
  onAddActivity?: (date?: string) => void;
}

interface CategoryFilterItem {
  id: Exclude<TodayCategoryId, "all">;
  label: string;
  dotClass: string;
  boxClass: string;
  types: string[];
}

const CATEGORY_FILTERS: CategoryFilterItem[] = [
  {
    id: "meetings",
    label: "Meetings",
    dotClass: styles.mockupDotMeeting,
    boxClass: styles.mockupCategoryBoxMeeting,
    types: ["client_meeting", "team_meeting"],
  },
  {
    id: "site",
    label: "Site visits",
    dotClass: styles.mockupDotSite,
    boxClass: styles.mockupCategoryBoxSite,
    types: ["site_visit", "inspection"],
  },
  {
    id: "tasks",
    label: "Tasks",
    dotClass: styles.mockupDotTask,
    boxClass: styles.mockupCategoryBoxTask,
    types: ["task", "reminder"],
  },
  {
    id: "deliverables",
    label: "Deliverables",
    dotClass: styles.mockupDotDeliverable,
    boxClass: styles.mockupCategoryBoxDeliverable,
    types: ["drawing_delivery", "milestone"],
  },
  {
    id: "deadlines",
    label: "Deadlines",
    dotClass: styles.mockupDotDeadline,
    boxClass: styles.mockupCategoryBoxDeadline,
    types: ["approval", "payment_review"],
  },
];

const TEAM_MEMBERS: Record<
  string,
  { name: string; role: string; location: string; avatar: string }
> = {
  "usr-1": {
    name: "Brandon Russell",
    role: "Lead Architect",
    location: "834 Boyer Shore Suite 076",
    avatar: "BR",
  },
  "usr-2": {
    name: "Rithvik Menon",
    role: "Site Coordinator",
    location: "Kallisto Studio, Kochi",
    avatar: "RM",
  },
  "usr-3": {
    name: "Ananya Roy",
    role: "Structural Consultant",
    location: "Structural Lab, Kochi",
    avatar: "AR",
  },
  "usr-4": {
    name: "Devika Nair",
    role: "Project Designer",
    location: "Design Studio, Calicut",
    avatar: "DN",
  },
};

function formatTimePart(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatActivityTimeRange(activity: PresentableActivity) {
  if (activity.time.allDay) return "All day";
  const start = formatTimePart(activity.time.startAt.substring(11, 16));
  const end = formatTimePart(activity.time.endAt.substring(11, 16));
  return `${start} – ${end}`;
}

function getActivityDurationMinutes(activity: PresentableActivity) {
  if (activity.time.allDay) return "All day";
  const start = new Date(activity.time.startAt).getTime();
  const end = new Date(activity.time.endAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return "45 min";
  const diffMins = Math.max(15, Math.round((end - start) / (1000 * 60)));
  return `${diffMins} min`;
}

/**
 * Visual Channel 1: TYPE -> Color Dot
 */
function getDotClassForActivity(activityType: string): string {
  switch (activityType) {
    case "client_meeting":
    case "team_meeting":
      return styles.mockupDotMeeting;
    case "site_visit":
    case "inspection":
      return styles.mockupDotSite;
    case "drawing_delivery":
    case "milestone":
      return styles.mockupDotDeliverable;
    case "approval":
    case "payment_review":
      return styles.mockupDotDeadline;
    default:
      return styles.mockupDotTask;
  }
}

/**
 * Intelligent Priority Ranking for Calendar Cell Visibility:
 * 1. Blocked / Critical / Overdue
 * 2. Deadline / Milestone / Approval
 * 3. Scheduled
 * 4. Completed / Cancelled
 */
function getActivityPriorityRank(activity: PresentableActivity): number {
  if (activity.isOverdue) return 1;
  if (
    activity.activityType === "approval" ||
    activity.activityType === "payment_review" ||
    activity.activityType === "milestone"
  ) {
    return 2;
  }
  if (activity.status === "scheduled") return 3;
  return 4; // completed, cancelled, etc.
}

function sortDayActivities(activities: PresentableActivity[]): PresentableActivity[] {
  return [...activities].sort((a, b) => {
    const rankA = getActivityPriorityRank(a);
    const rankB = getActivityPriorityRank(b);
    if (rankA !== rankB) return rankA - rankB;

    const timeA = a.time.allDay ? (a.time.startDate || "") : a.time.startAt;
    const timeB = b.time.allDay ? (b.time.startDate || "") : b.time.startAt;
    return timeA.localeCompare(timeB);
  });
}

/**
 * Maps multi-day activities across all active dates in their span
 */
function getDatesForActivity(activity: PresentableActivity): string[] {
  if (activity.time.allDay) {
    const start = activity.time.startDate;
    const end = activity.time.endDateExclusive;
    if (!start) return [];
    if (!end || end <= start) return [start];

    const dates: string[] = [];
    const curr = new Date(`${start}T12:00:00`);
    const endDate = new Date(`${end}T12:00:00`);
    let count = 0;
    while (curr < endDate && count < 31) {
      dates.push(curr.toISOString().substring(0, 10));
      curr.setDate(curr.getDate() + 1);
      count++;
    }
    return dates.length > 0 ? dates : [start];
  }

  const startDay = activity.time.startAt.substring(0, 10);
  const endDay = activity.time.endAt ? activity.time.endAt.substring(0, 10) : startDay;
  if (startDay === endDay) return [startDay];

  const dates: string[] = [];
  const curr = new Date(`${startDay}T12:00:00`);
  const endDate = new Date(`${endDay}T12:00:00`);
  let count = 0;
  while (curr <= endDate && count < 31) {
    dates.push(curr.toISOString().substring(0, 10));
    curr.setDate(curr.getDate() + 1);
    count++;
  }
  return dates.length > 0 ? dates : [startDay];
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
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [selectedCategories, setSelectedCategories] = useState<
    Exclude<TodayCategoryId, "all">[]
  >(["meetings", "site", "tasks", "deliverables", "deadlines"]);

  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);

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

  const toggleCategory = (catId: Exclude<TodayCategoryId, "all">) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
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

  // 1. Filter activities by scope, category filters, and search query BEFORE rendering
  const filteredActivities = useMemo(() => {
    const allowedTypes = new Set<string>();
    CATEGORY_FILTERS.forEach((cat) => {
      if (selectedCategories.includes(cat.id)) {
        cat.types.forEach((t) => allowedTypes.add(t));
      }
    });

    return activities.filter((act) => {
      const isTeamScope = queryState?.scope === "team";
      const isInScope =
        !isTeamScope ||
        act.ownerId === "usr-1" ||
        act.assigneeIds.includes("usr-1");

      if (!isInScope) return false;
      if (!allowedTypes.has(act.activityType)) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const projectName = act.projectId
          ? projectsById.get(act.projectId)?.toLowerCase() ?? ""
          : "";
        const matchesTitle = act.title.toLowerCase().includes(query);
        const matchesProject = projectName.includes(query);
        const matchesLocation =
          act.location?.toLowerCase().includes(query) ?? false;
        return matchesTitle || matchesProject || matchesLocation;
      }

      return true;
    });
  }, [
    activities,
    queryState?.scope,
    selectedCategories,
    searchQuery,
    projectsById,
  ]);

  // 2. Group filtered activities by date (including multi-day spans) and sort intelligently
  const activitiesByDate = useMemo(() => {
    const rawMap = new Map<string, PresentableActivity[]>();
    filteredActivities.forEach((act) => {
      const dates = getDatesForActivity(act);
      dates.forEach((date) => {
        const list = rawMap.get(date) ?? [];
        list.push(act);
        rawMap.set(date, list);
      });
    });

    // Sort every day's activity list deterministically by priority rank + start time
    const sortedMap = new Map<string, PresentableActivity[]>();
    rawMap.forEach((list, date) => {
      sortedMap.set(date, sortDayActivities(list));
    });

    return sortedMap;
  }, [filteredActivities]);

  // All activities for currently selected date
  const selectedDateActivities = useMemo(() => {
    return activitiesByDate.get(selectedDateStr) ?? [];
  }, [activitiesByDate, selectedDateStr]);

  const monthYearHeaderLabel = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(currentMonthDate);

  const selectedDateFormattedHeader = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${selectedDateStr}T12:00:00`));

  const WEEKDAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className={styles.mockupCalendarCard}>
      {/* Left Column: Calendar Grid & Navigation */}
      <div className={styles.mockupCalendarLeft}>
        {/* Calendar Header Row */}
        <div className={styles.mockupCalendarHeader}>
          <div className={styles.mockupNavGroup}>
            <h2 className={styles.mockupMonthTitle}>{monthYearHeaderLabel}</h2>
          </div>

          <div className={styles.mockupHeaderRight}>
            <div className={styles.mockupSearchWrap}>
              <SearchDuotoneIcon size={14} className={styles.mockupSearchIcon} />
              <input
                type="text"
                className={styles.mockupSearchInput}
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    color: "#94a3b8",
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className={styles.mockupChevronGroup}>
              <button
                type="button"
                className={styles.mockupChevronBtn}
                aria-label="Previous month"
                onClick={handlePrevMonth}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className={styles.mockupChevronBtn}
                aria-label="Next month"
                onClick={handleNextMonth}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <button
              type="button"
              className={styles.mockupTodayBtn}
              onClick={handleTodayClick}
            >
              Today
            </button>

            <button
              type="button"
              className={styles.mockupAddTaskBtn}
              onClick={() => onAddActivity?.(selectedDateStr)}
              aria-label="Add Task"
            >
              <Plus size={14} />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Weekday Column Headers */}
        <div className={styles.mockupWeekdayRow}>
          {WEEKDAY_NAMES.map((name) => (
            <div key={name} className={styles.mockupWeekdayCell}>
              {name}
            </div>
          ))}
        </div>

        {/* Days Grid: 7-Column Deterministic Matrix */}
        <div className={styles.mockupDayGrid}>
          {calendarWeeks.map((week) =>
            week.map((cell) => {
              const dayActivities = activitiesByDate.get(cell.dateStr) ?? [];
              const visibleActivities = dayActivities.slice(0, MAX_VISIBLE_ACTIVITIES);
              const hiddenCount = Math.max(0, dayActivities.length - MAX_VISIBLE_ACTIVITIES);
              const isSelected = cell.dateStr === selectedDateStr;

              return (
                <div
                  key={cell.dateStr}
                  className={`${styles.mockupDayTile} ${
                    !cell.isCurrentMonth ? styles.mockupDayTileOutside : ""
                  } ${isSelected ? styles.mockupDayTileSelected : ""}`}
                  onClick={() => {
                    onUpdateQuery?.({ date: cell.dateStr });
                    if (dayActivities.length > 0) {
                      setExpandedActivityId(dayActivities[0].id);
                      onSelectActivity?.(dayActivities[0].id);
                    } else {
                      setExpandedActivityId(null);
                    }
                  }}
                >
                  {/* Day Number Header: Independent Today and Outside State */}
                  <div className={styles.mockupDayHeader}>
                    {cell.isToday ? (
                      <span className={styles.mockupTodayBadge}>
                        {String(cell.dayNumber).padStart(2, "0")}
                      </span>
                    ) : (
                      <span
                        className={`${styles.mockupDayNumber} ${
                          !cell.isCurrentMonth
                            ? styles.mockupDayNumberOutside
                            : ""
                        }`}
                      >
                        {String(cell.dayNumber).padStart(2, "0")}
                      </span>
                    )}
                  </div>

                  {/* Activity Pill List: Color for TYPE, Icon/Typography for STATUS */}
                  <div className={styles.mockupTileActivityList}>
                    {visibleActivities.map((act) => {
                      const isActSelected =
                        ((expandedActivityId ?? selectedDateActivities[0]?.id) === act.id) && isSelected;
                      const isCompleted = act.status === "completed";
                      const isBlockedOrOverdue = act.isOverdue;
                      const isCancelled = act.status === "cancelled";

                      return (
                        <button
                          type="button"
                          key={act.id}
                          className={`${styles.mockupActivityPill} ${
                            isActSelected ? styles.mockupActivityPillActive : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedActivityId(act.id);
                            onSelectActivity?.(act.id);
                            onUpdateQuery?.({ date: cell.dateStr });
                          }}
                        >
                          {/* Visual Channel 2: Status Treatment Icon */}
                          {isCompleted ? (
                            <Check
                              size={10}
                              strokeWidth={3}
                              className={styles.mockupStatusCheckIcon}
                            />
                          ) : isBlockedOrOverdue ? (
                            <AlertTriangle
                              size={10}
                              strokeWidth={3}
                              className={styles.mockupStatusAlertIcon}
                            />
                          ) : (
                            /* Visual Channel 1: Type Color Dot */
                            <span
                              className={`${styles.mockupActivityDot} ${getDotClassForActivity(
                                act.activityType
                              )}`}
                            />
                          )}

                          <span
                            className={`${
                              isCompleted
                                ? styles.mockupActivityCompletedText
                                : isBlockedOrOverdue
                                ? styles.mockupActivityBlockedText
                                : isCancelled
                                ? styles.mockupActivityCancelledText
                                : ""
                            }`}
                          >
                            {act.title}
                          </span>
                        </button>
                      );
                    })}

                    {/* Deterministic +N Overflow Tag */}
                    {hiddenCount > 0 && (
                      <button
                        type="button"
                        className={styles.mockupOverflowTag}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateQuery?.({ date: cell.dateStr });
                          setExpandedActivityId(null);
                        }}
                        title={`View all ${dayActivities.length} activities for ${cell.dateStr}`}
                      >
                        +{hiddenCount}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Category Filter Legend */}
        <div className={styles.mockupCategoryLegend}>
          {CATEGORY_FILTERS.map((cat) => {
            const isChecked = selectedCategories.includes(cat.id);

            return (
              <label
                key={cat.id}
                className={styles.mockupCategoryCheckbox}
                onClick={() => toggleCategory(cat.id)}
              >
                <span
                  className={`${styles.mockupCategoryBox} ${
                    isChecked ? cat.boxClass : styles.mockupCategoryBoxUnchecked
                  }`}
                >
                  {isChecked && <Check size={12} strokeWidth={3} />}
                </span>
                <span>{cat.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Right Column: Unified Day Schedule & Expandable Chips in New Theme */}
      <div className={styles.mockupRightPanel}>
        <div className={styles.hiveStudioSection}>
          <div className={styles.hiveStudioHeader}>
            <div className={styles.actionTitleGroup}>
              <span className={styles.hiveStudioCategoryTitle}>DAY SCHEDULE</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                className={
                  selectedDateActivities.some((a) => a.isOverdue)
                    ? styles.hiveStudioCountBadgeAmber
                    : styles.hiveStudioCountBadge
                }
              >
                {selectedDateActivities.length}{" "}
                {selectedDateActivities.length === 1 ? "Activity" : "Activities"}
              </span>
              <button
                type="button"
                className={styles.hiveStudioAddBtn}
                onClick={() => onAddActivity?.(selectedDateStr)}
                aria-label="Add task for this date"
                title="Add task for this date"
              >
                <Plus size={13} />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          <p className={styles.mockupDayOverviewSubtitle}>
            {selectedDateFormattedHeader}
          </p>

          <div className={styles.hiveStudioCardList}>
            {selectedDateActivities.length === 0 ? (
              <div className={styles.hiveStudioEmptyBox}>
                <p className={styles.hiveStudioEmptyText}>
                  No activities scheduled for this date.
                </p>
                <button
                  type="button"
                  className={styles.hiveEmptyAddTaskBtn}
                  onClick={() => onAddActivity?.(selectedDateStr)}
                >
                  <Plus size={13} />
                  <span>Create Task for {selectedDateStr}</span>
                </button>
              </div>
            ) : (
              selectedDateActivities.map((act) => {
                const isExpanded = (expandedActivityId ?? selectedDateActivities[0]?.id) === act.id;
                const isCompleted = act.status === "completed";
                const isBlocked = act.isOverdue;
                const actAssignee =
                  CALENDAR_TEAM_MEMBERS[act.ownerId] ||
                  (act.assigneeIds?.[0] ? CALENDAR_TEAM_MEMBERS[act.assigneeIds[0]] : undefined) ||
                  CALENDAR_TEAM_MEMBERS["usr-1"];

                return (
                  <div
                    key={act.id}
                    className={`${styles.hiveExpandableCard} ${
                      isExpanded ? styles.hiveExpandableCardOpen : ""
                    }`}
                  >
                    {/* Clickable Summary Row */}
                    <button
                      type="button"
                      className={styles.hiveCardHeaderBtn}
                      onClick={() => {
                        setExpandedActivityId((prev) => (prev === act.id ? null : act.id));
                      }}
                      aria-expanded={isExpanded}
                      aria-label={`${act.title} activity details`}
                    >
                      <div className={styles.hiveCardLeftGroup}>
                        {/* Themed Icon Box */}
                        <div
                          className={`${styles.hiveIconBox} ${
                            isCompleted
                              ? styles.iconBoxGreen
                              : isBlocked
                              ? styles.iconBoxRed
                              : act.activityType === "client_meeting" ||
                                act.activityType === "team_meeting"
                              ? styles.iconBoxBlue
                              : act.activityType === "site_visit" ||
                                act.activityType === "inspection"
                              ? styles.iconBoxAmber
                              : act.activityType === "drawing_delivery" ||
                                act.activityType === "milestone"
                              ? styles.iconBoxGreen
                              : act.activityType === "approval" ||
                                act.activityType === "payment_review"
                              ? styles.iconBoxRed
                              : styles.iconBoxPurple
                          }`}
                        >
                          {isCompleted ? (
                            <Check size={15} strokeWidth={2.5} />
                          ) : isBlocked ? (
                            <AlertTriangle size={15} strokeWidth={2} />
                          ) : act.activityType === "client_meeting" ||
                            act.activityType === "team_meeting" ? (
                            <TeamDuotoneIcon size={16} />
                          ) : act.activityType === "site_visit" ||
                            act.activityType === "inspection" ? (
                            <MapPin size={15} />
                          ) : act.activityType === "drawing_delivery" ||
                            act.activityType === "milestone" ? (
                            <DocumentsDuotoneIcon size={16} />
                          ) : act.activityType === "approval" ||
                            act.activityType === "payment_review" ? (
                            <AnalyticsDuotoneIcon size={16} />
                          ) : (
                            <CalendarDuotoneIcon size={16} />
                          )}
                        </div>

                        <div className={styles.hiveCardTextStack}>
                          <strong className={styles.hiveCardTitle}>
                            {formatActivityTimeRange(act)}
                          </strong>
                          <span className={styles.hiveCardSubtitle}>
                            {act.title}
                          </span>
                        </div>
                      </div>

                      <div className={styles.hiveCardRightGroup}>
                        <span
                          className={`${styles.hiveStatusPill} ${
                            isCompleted
                              ? styles.pillGreen
                              : isBlocked
                              ? styles.pillRed
                              : styles.pillGrey
                          }`}
                        >
                          {isCompleted
                            ? "Done"
                            : isBlocked
                            ? "Blocked"
                            : "Scheduled"}
                        </span>
                        <ChevronDown
                          size={13}
                          className={`${styles.hiveChevronIcon} ${
                            isExpanded ? styles.hiveChevronRotated : ""
                          }`}
                        />
                      </div>
                    </button>

                    {/* Expanded Details Body in New Theme */}
                    {isExpanded && (
                      <div className={styles.hiveExpandedBody}>
                        {/* Description Paragraph */}
                        <p className={styles.hiveExpandedDesc}>
                          {act.notes ||
                            "Review the revised spatial plan, material direction, and decisions needed before the drawing package advances."}
                        </p>

                        {/* Minimal Assignee Row in Our Theme */}
                        <div className={styles.hiveMinimalUserRow}>
                          <div className={styles.hiveMinimalUserLeft}>
                            <span className={styles.hiveMinimalAvatar}>
                              {actAssignee.avatar}
                            </span>
                            <div className={styles.hiveMinimalUserInfo}>
                              <div className={styles.hiveMinimalUserNameGroup}>
                                <strong className={styles.hiveMinimalUserName}>
                                  {actAssignee.name}
                                </strong>
                                <span className={styles.hiveMinimalUserRole}>
                                  • {actAssignee.role}
                                </span>
                              </div>
                              <span className={styles.hiveMinimalLocation}>
                                <MapPin size={10} />
                                <span>{act.location || actAssignee.location}</span>
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className={styles.hiveMinimalPhoneBtn}
                            aria-label={`Contact ${actAssignee.name}`}
                          >
                            <Phone size={12} />
                          </button>
                        </div>

                        {/* Minimal Project & Milestone Status Row in Our Theme */}
                        <div className={styles.hiveMinimalProjectRow}>
                          <div className={styles.hiveMinimalProjectLeft}>
                            <Building2 size={13} className={styles.hiveMinimalProjectIcon} />
                            <strong className={styles.hiveMinimalProjectName}>
                              {projectsById.get(act.projectId || "") || "Nila Residence"}
                            </strong>
                          </div>
                          <span
                            className={`${styles.hiveStatusPill} ${
                              act.status === "completed"
                                ? styles.pillGreen
                                : act.isOverdue
                                ? styles.pillRed
                                : styles.pillGrey
                            }`}
                          >
                            {act.status === "completed"
                              ? "Done"
                              : act.isOverdue
                              ? "Overdue"
                              : "Scheduled"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
