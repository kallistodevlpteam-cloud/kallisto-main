"use client";

import Image from "next/image";
import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Link2,
  X,
} from "lucide-react";
import {
  ClockDuotoneIcon,
  DocumentsDuotoneIcon,
  MapPinDuotoneIcon,
  TeamDuotoneIcon,
  UserDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import type { CalendarActivityType } from "@/types/domain/calendar";
import type {
  CalendarScopeId,
  TodayCategoryId,
} from "../../hooks/use-calendar-query-state";
import type { PresentableActivity } from "../../services/calendar-activity.service";
import type { PresentableScheduleItem } from "../../services/project-schedule.service";
import { ThemeSelect } from "@/components/ui/theme-select";
import styles from "../calendar-workspace-page.module.css";

const REFERENCE_TODAY = "2026-07-24";
const REFERENCE_NOW_MINUTES = 11 * 60;

type ActivityState = "overdue" | "inProgress" | "upcoming" | "blocked" | "completed";

const CATEGORY_TYPES: Record<Exclude<TodayCategoryId, "all">, CalendarActivityType[]> = {
  meetings: ["client_meeting", "team_meeting"],
  site: ["site_visit", "inspection"],
  tasks: ["task", "reminder"],
  deadlines: ["approval", "payment_review"],
  deliverables: ["drawing_delivery", "milestone"],
};

const CATEGORY_LABELS: Record<TodayCategoryId, string> = {
  all: "All activities",
  meetings: "Meetings",
  site: "Site visits",
  tasks: "Tasks",
  deadlines: "Deadlines",
  deliverables: "Deliverables",
};

const TYPE_LABELS: Record<CalendarActivityType, string> = {
  site_visit: "Site activity",
  client_meeting: "Meeting",
  team_meeting: "Meeting",
  inspection: "Site activity",
  drawing_delivery: "Deliverable",
  approval: "Deadline",
  payment_review: "Deadline",
  task: "Task",
  milestone: "Deliverable",
  reminder: "Task",
};

const TEAM_MEMBERS: Record<string, { name: string; initials: string }> = {
  "usr-1": { name: "Saran", initials: "SA" },
  "usr-2": { name: "Rithvik", initials: "RI" },
  "usr-3": { name: "Ananya", initials: "AN" },
  "usr-99": { name: "Private", initials: "PR" },
};

const STATUS_LABELS: Record<ActivityState, string> = {
  overdue: "Overdue",
  inProgress: "In progress",
  upcoming: "Upcoming",
  blocked: "Blocked",
  completed: "Completed",
};

const STATUS_CLASS_NAMES: Record<ActivityState, string> = {
  overdue: styles.agendaStateOverdue,
  inProgress: styles.agendaStateInProgress,
  upcoming: styles.agendaStateUpcoming,
  blocked: styles.agendaStateBlocked,
  completed: styles.agendaStateCompleted,
};

interface TodayTabProps {
  activities?: PresentableActivity[];
  scheduleItems?: PresentableScheduleItem[];
  projectsList?: Array<{ id: string; name: string }>;
  selectedDate?: string;
  scope?: Exclude<CalendarScopeId, "project">;
  category?: TodayCategoryId;
  onSelectActivity?: (id: string) => void;
  onSelectScheduleItem?: (id: string) => void;
  onViewAllSchedule?: () => void;
  onDateChange?: (date: string) => void;
  onScopeChange?: (scope: "mine" | "team") => void;
  onCategoryChange?: (category: TodayCategoryId) => void;
  onAddActivity?: () => void;
  onMarkComplete?: (id: string) => Promise<unknown>;
}

function getDateForActivity(activity: PresentableActivity) {
  return activity.time.allDay
    ? activity.time.startDate
    : activity.time.startAt.substring(0, 10);
}

function getMinutesForActivity(activity: PresentableActivity) {
  if (activity.time.allDay) return -1;
  const [hours, minutes] = activity.time.startAt.substring(11, 16).split(":").map(Number);
  return hours * 60 + minutes;
}

function getEndMinutesForActivity(activity: PresentableActivity) {
  if (activity.time.allDay) return 24 * 60;
  const [hours, minutes] = activity.time.endAt.substring(11, 16).split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTimePart(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatActivityTime(activity: PresentableActivity) {
  if (activity.time.allDay) return "All day";
  return formatTimePart(activity.time.startAt.substring(11, 16));
}

function formatActivityRange(activity: PresentableActivity) {
  if (activity.time.allDay) return "All day";
  return `${formatTimePart(activity.time.startAt.substring(11, 16))} to ${formatTimePart(
    activity.time.endAt.substring(11, 16)
  )}`;
}

function formatLongDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getActivityState(
  activity: PresentableActivity,
  scheduleItems: PresentableScheduleItem[],
  selectedDate: string
): ActivityState {
  if (activity.status === "completed") return "completed";

  const linkedSchedule = scheduleItems.find(
    (item) => item.id === activity.linkedScheduleItemId
  );
  if (linkedSchedule?.status === "blocked") return "blocked";

  if (selectedDate < REFERENCE_TODAY) return "overdue";
  if (selectedDate > REFERENCE_TODAY || activity.time.allDay) return "upcoming";

  const startMinutes = getMinutesForActivity(activity);
  const endMinutes = getEndMinutesForActivity(activity);
  if (startMinutes <= REFERENCE_NOW_MINUTES && endMinutes >= REFERENCE_NOW_MINUTES) {
    return "inProgress";
  }
  return startMinutes > REFERENCE_NOW_MINUTES ? "upcoming" : "overdue";
}

export interface DateActivityState {
  scheduled: number;
  active: number;
  completed: number;
  blocked: number;
  cancelled: number;
  total: number;
}

export function calculateDateActivityState(
  dateActivities: PresentableActivity[],
  scheduleItems: PresentableScheduleItem[],
  dateStr: string
): DateActivityState {
  let scheduled = 0;
  let active = 0;
  let completed = 0;
  let blocked = 0;
  let cancelled = 0;

  for (const activity of dateActivities) {
    if (activity.status === "cancelled") {
      cancelled++;
      continue;
    }
    if (activity.status === "completed") {
      completed++;
      continue;
    }

    const linkedSchedule = scheduleItems.find(
      (item) => item.id === activity.linkedScheduleItemId
    );
    if (linkedSchedule?.status === "blocked") {
      blocked++;
      continue;
    }

    const state = getActivityState(activity, scheduleItems, dateStr);
    if (state === "inProgress" || state === "overdue") {
      active++;
    } else {
      scheduled++;
    }
  }

  return {
    scheduled,
    active,
    completed,
    blocked,
    cancelled,
    total: dateActivities.length,
  };
}

export function shouldShowCalendarDateIndicator(state?: DateActivityState): boolean {
  if (!state) return false;
  return state.scheduled > 0 || state.active > 0;
}

export function TodayTab({
  activities = [],
  scheduleItems = [],
  projectsList = [],
  selectedDate = REFERENCE_TODAY,
  scope = "mine",
  category = "all",
  onSelectActivity,
  onSelectScheduleItem,
  onViewAllSchedule,
  onDateChange,
  onScopeChange,
  onCategoryChange,
  onAddActivity,
  onMarkComplete,
}: TodayTabProps) {
  const [visibleMonthOffset, setVisibleMonthOffset] = useState(0);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);

  const selectedMonth = new Date(`${selectedDate.substring(0, 7)}-01T12:00:00`);
  const visibleMonth = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth() + visibleMonthOffset,
    1,
    12
  );

  const projectsById = useMemo(
    () => new Map(projectsList.map((project) => [project.id, project.name])),
    [projectsList]
  );

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const isInScope =
        scope === "team" ||
        activity.ownerId === "usr-1" ||
        activity.assigneeIds.includes("usr-1");
      const isInCategory =
        category === "all" || CATEGORY_TYPES[category].includes(activity.activityType);
      return isInScope && isInCategory;
    });
  }, [activities, category, scope]);

  const activityStateByDate = useMemo(() => {
    const map = new Map<string, DateActivityState>();
    const activitiesByDate = new Map<string, PresentableActivity[]>();

    for (const act of filteredActivities) {
      const d = getDateForActivity(act);
      const list = activitiesByDate.get(d) || [];
      list.push(act);
      activitiesByDate.set(d, list);
    }

    activitiesByDate.forEach((dateActs, dateStr) => {
      map.set(dateStr, calculateDateActivityState(dateActs, scheduleItems, dateStr));
    });

    return map;
  }, [filteredActivities, scheduleItems]);

  const selectedDateActivityState = useMemo(() => {
    const dayActs = filteredActivities.filter(
      (act) => getDateForActivity(act) === selectedDate
    );
    return calculateDateActivityState(dayActs, scheduleItems, selectedDate);
  }, [filteredActivities, scheduleItems, selectedDate]);

  const dayActivities = useMemo(
    () =>
      filteredActivities
        .filter((activity) => getDateForActivity(activity) === selectedDate)
        .sort((left, right) => getMinutesForActivity(left) - getMinutesForActivity(right)),
    [filteredActivities, selectedDate]
  );

  const primaryActivity =
    dayActivities.find(
      (activity) =>
        getActivityState(activity, scheduleItems, selectedDate) === "inProgress"
    ) ??
    dayActivities.find(
      (activity) => getActivityState(activity, scheduleItems, selectedDate) === "blocked"
    ) ??
    dayActivities.find(
      (activity) => getActivityState(activity, scheduleItems, selectedDate) === "upcoming"
    ) ??
    dayActivities[0];

  const firstDay = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth(),
    1,
    12
  );
  const daysInMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0,
    12
  ).getDate();
  const mondayFirstOffset = (firstDay.getDay() + 6) % 7;
  const monthCells: Array<number | null> = [
    ...Array.from({ length: mondayFirstOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const scheduleRows: React.ReactNode[] = [];
  let markerAdded = false;
  dayActivities.forEach((activity) => {
    const activityMinutes = getMinutesForActivity(activity);
    if (
      selectedDate === REFERENCE_TODAY &&
      !markerAdded &&
      activityMinutes > REFERENCE_NOW_MINUTES
    ) {
      scheduleRows.push(
        <div className={styles.currentTimeMarker} key="current-time" aria-label="Current time, 11:00 AM">
          <span className={styles.nowLabel}>NOW</span>
          <i className={styles.nowLine} />
        </div>
      );
      markerAdded = true;
    }

    const activityState = getActivityState(activity, scheduleItems, selectedDate);
    const assignees = activity.assigneeIds
      .map((id) => TEAM_MEMBERS[id])
      .filter((member): member is { name: string; initials: string } => Boolean(member));
    const projectName = activity.projectId
      ? projectsById.get(activity.projectId) ?? activity.projectId
      : "";
    const displayTitle = projectName
      ? activity.title && activity.title !== projectName
        ? `${projectName} — ${activity.title}`
        : projectName
      : activity.title;

    const isExpanded = expandedActivityId === activity.id;
    const isCurrentActive = activityState === "inProgress" || isExpanded;
    const maxVisibleAvatars = 2;
    const overflowAvatars = assignees.length > maxVisibleAvatars ? assignees.length - maxVisibleAvatars : 0;
    const isAllDay = activity.time.allDay;
    const startStr = isAllDay ? "All day" : formatTimePart(activity.time.startAt.substring(11, 16));
    const endStr = isAllDay ? "" : formatTimePart(activity.time.endAt.substring(11, 16));

    const handleRowClick = () => {
      setExpandedActivityId(isExpanded ? null : activity.id);
      onSelectActivity?.(activity.id);
    };

    scheduleRows.push(
      <div
        key={activity.id}
        className={`${styles.agendaRowContainer} ${
          isAllDay ? styles.agendaRowContainerAllDay : ""
        } ${isExpanded ? styles.agendaRowContainerExpanded : ""}`}
      >
        <button
          type="button"
          className={`${styles.agendaRow} ${
            isAllDay ? styles.agendaRowAllDay : ""
          } ${activityState === "completed" ? styles.agendaRowCompleted : ""} ${
            isCurrentActive ? styles.agendaRowActive : ""
          }`}
          onClick={handleRowClick}
          aria-expanded={isExpanded}
        >
          <div
            className={`${styles.eventVerticalPill} ${STATUS_CLASS_NAMES[activityState]}`}
            aria-hidden="true"
          />
          {isAllDay ? (
            <>
              <div className={styles.allDayTimeStack}>
                <span className={styles.allDayCapsule}>ALL DAY</span>
              </div>
              <div className={styles.allDayInnerWhiteCard}>
                <div className={styles.eventCardMain}>
                  <div className={styles.eventCategoryTag}>
                    <Calendar size={13} className={styles.eventCategoryIcon} />
                    <span className={styles.eventCategoryName}>
                      {TYPE_LABELS[activity.activityType]?.toUpperCase()}
                    </span>
                  </div>
                  <strong className={styles.eventTitleText}>{displayTitle}</strong>
                </div>
                <span
                  className={styles.agendaAvatars}
                  aria-label={`Assigned to ${assignees.map((member) => member.name).join(", ")}`}
                >
                  {assignees.slice(0, 2).map((member) => (
                    <span key={member.initials}>{member.initials}</span>
                  ))}
                  {overflowAvatars > 0 && (
                    <span className={styles.agendaAvatarOverflow}>+{overflowAvatars}</span>
                  )}
                </span>
                <span className={`${styles.agendaStatusPill} ${STATUS_CLASS_NAMES[activityState]}`}>
                  <span className={styles.statusPillDot} />
                  {STATUS_LABELS[activityState]}
                </span>
                <ChevronRight
                  className={`${styles.agendaOpenIcon} ${
                    isExpanded ? styles.agendaOpenIconRotated : ""
                  }`}
                  size={16}
                  aria-hidden="true"
                />
              </div>
            </>
          ) : (
            <>
              <div className={styles.eventTimeStack}>
                <span className={styles.eventStartTime}>{startStr}</span>
                {endStr && (
                  <>
                    <span className={styles.eventTimeDivider}>–</span>
                    <span className={styles.eventEndTime}>{endStr}</span>
                  </>
                )}
              </div>
              <div className={styles.eventCardMain}>
                <div className={styles.eventCategoryTag}>
                  <Calendar size={13} className={styles.eventCategoryIcon} />
                  <span className={styles.eventCategoryName}>
                    {TYPE_LABELS[activity.activityType]?.toUpperCase()}
                  </span>
                </div>
                <strong className={styles.eventTitleText}>{displayTitle}</strong>
              </div>
              <span
                className={styles.agendaAvatars}
                aria-label={`Assigned to ${assignees.map((member) => member.name).join(", ")}`}
              >
                {assignees.slice(0, 2).map((member) => (
                  <span key={member.initials}>{member.initials}</span>
                ))}
                {overflowAvatars > 0 && (
                  <span className={styles.agendaAvatarOverflow}>+{overflowAvatars}</span>
                )}
              </span>
              <span className={`${styles.agendaStatusPill} ${STATUS_CLASS_NAMES[activityState]}`}>
                <span className={styles.statusPillDot} />
                {STATUS_LABELS[activityState]}
              </span>
              <ChevronRight
                className={`${styles.agendaOpenIcon} ${
                  isExpanded ? styles.agendaOpenIconRotated : ""
                }`}
                size={16}
                aria-hidden="true"
              />
            </>
          )}
        </button>

        {isExpanded && (
          <div className={styles.agendaExpandedPanel}>
            {/* 3-Column Metadata Tiles */}
            <div className={styles.expandedMetaColumnsGrid}>
              {/* Location */}
              <div className={styles.expandedField}>
                <span className={styles.expandedFieldLabel}>LOCATION</span>
                <div className={styles.expandedFieldValueBox}>
                  <MapPinDuotoneIcon size={16} className={styles.expandedFieldIcon} />
                  <span>{activity.location || "Kallisto Studio, Kochi"}</span>
                </div>
              </div>

              {/* Owner */}
              <div className={styles.expandedField}>
                <span className={styles.expandedFieldLabel}>OWNER</span>
                <div className={styles.expandedFieldValueBox}>
                  <UserDuotoneIcon size={16} className={styles.expandedFieldIcon} />
                  <span>{TEAM_MEMBERS[activity.ownerId]?.name ?? activity.ownerId}</span>
                </div>
              </div>

              {/* Assignees */}
              <div className={styles.expandedField}>
                <span className={styles.expandedFieldLabel}>ASSIGNEES</span>
                <div className={styles.expandedFieldValueBox}>
                  <TeamDuotoneIcon size={16} className={styles.expandedFieldIcon} />
                  <span>
                    {assignees.length > 0
                      ? assignees.map((m) => m.name).join(", ")
                      : "Unassigned"}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes & Instructions */}
            {activity.notes && (
              <div className={styles.expandedNotesSection}>
                <div className={styles.expandedNotesHeader}>
                  <DocumentsDuotoneIcon size={15} className={styles.expandedNotesHeaderIcon} />
                  <span className={styles.expandedNotesTitle}>NOTES & INSTRUCTIONS</span>
                </div>
                <div className={styles.expandedNotesCard}>
                  <div className={styles.expandedNotesAccentBar} />
                  <p className={styles.expandedNotesText}>{activity.notes}</p>
                </div>
              </div>
            )}

            {/* Linked Schedule Item */}
            {activity.linkedScheduleItemId && (
              <div className={styles.expandedLinkedNoticeBox}>
                <div className={styles.linkedNoticeHeader}>
                  <Link2 size={14} />
                  <strong>Linked Schedule Item</strong>
                </div>
                <p>ID: {activity.linkedScheduleItemId} (Authoritative sync enabled)</p>
              </div>
            )}

            {/* Action Row */}
            <div className={styles.expandedActionRow}>
              {activity.status !== "completed" && onMarkComplete && (
                <button
                  type="button"
                  className={styles.expandedCompleteBtn}
                  onClick={async (e) => {
                    e.stopPropagation();
                    setCompletingId(activity.id);
                    try {
                      await onMarkComplete(activity.id);
                    } finally {
                      setCompletingId(null);
                    }
                  }}
                  disabled={completingId === activity.id}
                >
                  <CheckCircle2 size={15} />
                  <span>{completingId === activity.id ? "Completing..." : "Mark complete"}</span>
                </button>
              )}
              <button
                type="button"
                className={styles.expandedCloseBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedActivityId(null);
                }}
              >
                <X size={14} />
                <span>Close</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  });

  const handleMarkComplete = async () => {
    if (!primaryActivity || !onMarkComplete) return;
    setCompletingId(primaryActivity.id);
    try {
      await onMarkComplete(primaryActivity.id);
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className={styles.todayEditorialWorkspace}>
      <main className={styles.todayMainColumn}>
        {dayActivities.length === 0 ? (
          <section className={styles.todayEmptyState} aria-labelledby="empty-day-title">
            <span className={styles.todayEmptyDate}>
              {new Date(`${selectedDate}T12:00:00`).getDate()}
            </span>
            <div>
              <h2 id="empty-day-title">Nothing scheduled for this day</h2>
              <p>
                Add an activity or move an unscheduled project task into{" "}
                {formatLongDate(selectedDate)}.
              </p>
              <button type="button" onClick={onAddActivity}>
                Add activity
              </button>
            </div>
          </section>
        ) : (
          <>
            {primaryActivity && (
              <section
                className={styles.primaryFocus}
                aria-labelledby="primary-focus-title"
              >
                <div className={styles.primaryFocusHeading}>
                  <div>
                    <div className={styles.focusEyebrowRow}>
                      <p className={styles.focusEyebrow}>
                        {primaryActivity.projectId
                          ? projectsById.get(primaryActivity.projectId) ??
                            primaryActivity.projectId
                          : "Studio"}{" "}
                        / {TYPE_LABELS[primaryActivity.activityType]}
                      </p>
                      <span className={styles.focusConfirmation}>
                        {primaryActivity.status === "completed"
                          ? "Completed"
                          : getActivityState(primaryActivity, scheduleItems, selectedDate) ===
                              "blocked"
                            ? "Blocked"
                            : "Confirmed"}
                      </span>
                    </div>
                    <h2 id="primary-focus-title">{primaryActivity.title}</h2>
                  </div>
                </div>

                <p className={styles.focusDescription}>
                  {primaryActivity.notes ??
                    "Review the project context, confirm decisions, and record the next action."}
                </p>

                <div className={styles.focusImage}>
                  <Image
                    src="/assets/projects/residence-24.png"
                    alt="Contemporary residence associated with the selected project"
                    width={1024}
                    height={576}
                    priority
                  />
                </div>

                <dl className={styles.focusMetadata}>
                  <div>
                    <ClockDuotoneIcon size={16} />
                    <dt>Time</dt>
                    <dd>{formatActivityRange(primaryActivity)}</dd>
                  </div>
                  <div>
                    <MapPinDuotoneIcon size={16} />
                    <dt>Location</dt>
                    <dd>{primaryActivity.location ?? "Project workspace"}</dd>
                  </div>
                  <div>
                    <TeamDuotoneIcon size={16} />
                    <dt>Assigned to</dt>
                    <dd>
                      {primaryActivity.assigneeIds
                        .map((id) => TEAM_MEMBERS[id]?.name ?? id)
                        .join(", ")}
                    </dd>
                  </div>
                </dl>

                <div className={styles.focusActions}>
                  <button
                    type="button"
                    className={styles.focusPrimaryAction}
                    onClick={() => {
                      setExpandedActivityId(primaryActivity.id);
                      onSelectActivity?.(primaryActivity.id);
                    }}
                  >
                    Open activity
                    <ArrowRight size={15} />
                  </button>
                  <button
                    type="button"
                    className={styles.focusCompleteAction}
                    onClick={handleMarkComplete}
                    disabled={
                      primaryActivity.status === "completed" ||
                      completingId === primaryActivity.id
                    }
                  >
                    <CheckCircle2 size={15} />
                    {completingId === primaryActivity.id
                      ? "Completing..."
                      : primaryActivity.status === "completed"
                        ? "Completed"
                        : "Mark complete"}
                  </button>
                </div>
              </section>
            )}

            <section className={styles.agendaSection} aria-labelledby="today-schedule-title">
              <div className={styles.sectionHeading}>
                <div>
                  <p className={styles.sectionEyebrow}>Daily agenda</p>
                  <h2 id="today-schedule-title">Today&apos;s schedule</h2>
                </div>
                <span>{dayActivities.length} activities</span>
              </div>
              <div className={styles.agendaList}>{scheduleRows}</div>
            </section>
          </>
        )}
      </main>

      <aside className={styles.todayUtilityRail} aria-label="Calendar tools">
        <section className={styles.miniCalendarSection} aria-labelledby="mini-calendar-title">
          <div className={styles.miniCalendarHeader}>
            <h2 id="mini-calendar-title">{formatMonthYear(visibleMonth)}</h2>
            <div className={styles.miniCalendarNavButtons}>
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => setVisibleMonthOffset((current) => current - 1)}
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => setVisibleMonthOffset((current) => current + 1)}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          <div className={styles.miniCalendarWeekdays} aria-hidden="true">
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d, index) => {
              const selectedDateObj = new Date(`${selectedDate}T12:00:00`);
              const activeDayOfWeekIdx = (selectedDateObj.getDay() + 6) % 7;
              return (
                <span
                  key={`${d}-${index}`}
                  className={`${styles.squircleDayNameBadge} ${
                    index === activeDayOfWeekIdx ? styles.squircleDayNameActive : ""
                  }`}
                >
                  {d}
                </span>
              );
            })}
          </div>

          <div className={styles.miniCalendarGrid}>
            {monthCells.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className={styles.squircleDayBlank} aria-hidden="true" />;
              }

              const date = new Date(
                visibleMonth.getFullYear(),
                visibleMonth.getMonth(),
                day,
                12
              );
              const dateString = toDateString(date);
              const isToday = dateString === REFERENCE_TODAY;
              const isSelected = dateString === selectedDate;
              const dateState = activityStateByDate.get(dateString);
              const showIndicator = shouldShowCalendarDateIndicator(dateState);

              return (
                <button
                  type="button"
                  key={dateString}
                  className={`${styles.squircleDayCard} ${
                    isToday ? styles.squircleDayToday : ""
                  } ${isSelected ? styles.squircleDaySelected : ""}`}
                  aria-label={formatLongDate(dateString)}
                  aria-current={isToday ? "date" : undefined}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setVisibleMonthOffset(0);
                    onDateChange?.(dateString);
                  }}
                >
                  <span className={styles.squircleDayNumber}>{day}</span>
                  {showIndicator && (
                    <span className={styles.squircleEventDot} aria-label="Activities scheduled" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className={styles.utilityControls} aria-label="Calendar scope and filters">
          <div className={styles.utilityControlGroup}>
            <label htmlFor="calendar-scope-select" className={styles.utilityControlLabel}>
              Calendar scope
            </label>
            <ThemeSelect
              id="calendar-scope-select"
              ariaLabel="Calendar scope"
              value={scope}
              options={[
                { value: "mine", label: "My work" },
                { value: "team", label: "Team" },
              ]}
              onChange={(val) => onScopeChange?.(val as "mine" | "team")}
              fullWidth
            />
          </div>
          <div className={styles.utilityControlGroup}>
            <label htmlFor="activity-type-select" className={styles.utilityControlLabel}>
              Activity type
            </label>
            <ThemeSelect
              id="activity-type-select"
              ariaLabel="Activity type"
              value={category}
              options={Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
                value: value as TodayCategoryId,
                label,
              }))}
              onChange={(val) => onCategoryChange?.(val as TodayCategoryId)}
              fullWidth
            />
          </div>
        </section>

        <section className={styles.daySummary} aria-labelledby="day-summary-title">
          <h2 id="day-summary-title">Day summary</h2>
          <div className={styles.daySummaryGrid}>
            <div className={styles.daySummaryCol}>
              <span className={styles.daySummaryNumber}>
                {selectedDateActivityState.scheduled + selectedDateActivityState.active}
              </span>
              <span className={styles.daySummaryLabel}>
                <i className={styles.summaryDotScheduled} aria-hidden="true" />
                Scheduled
              </span>
            </div>
            <div className={styles.daySummaryCol}>
              <span className={styles.daySummaryNumber}>{selectedDateActivityState.completed}</span>
              <span className={styles.daySummaryLabel}>
                <i className={styles.summaryDotCompleted} aria-hidden="true" />
                Completed
              </span>
            </div>
            <div className={styles.daySummaryCol}>
              <span className={styles.daySummaryNumber}>{selectedDateActivityState.blocked}</span>
              <span className={styles.daySummaryLabel}>
                <i className={styles.summaryDotBlocked} aria-hidden="true" />
                Blocked
              </span>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}
