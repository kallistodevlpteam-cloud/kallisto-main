"use client";

import Image from "next/image";
import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Square,
  Users,
} from "lucide-react";
import type { CalendarActivityType } from "@/types/domain/calendar";
import type {
  CalendarScopeId,
  TodayCategoryId,
} from "../../hooks/use-calendar-query-state";
import type { PresentableActivity } from "../../services/calendar-activity.service";
import type { PresentableScheduleItem } from "../../services/project-schedule.service";
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
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHours = hours % 12 || 12;
  return `${normalizedHours}:${String(minutes).padStart(2, "0")} ${suffix}`;
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

  const linkedScheduleIds = new Set(
    dayActivities
      .map((activity) => activity.linkedScheduleItemId)
      .filter((value): value is string => Boolean(value))
  );

  const laterItems = scheduleItems
    .filter(
      (item) =>
        !linkedScheduleIds.has(item.id) &&
        item.status !== "completed" &&
        (item.startDate === selectedDate || item.dueDate === selectedDate)
    )
    .slice(0, 3);

  const completedCount = dayActivities.filter(
    (activity) => activity.status === "completed"
  ).length;
  const blockedCount = dayActivities.filter(
    (activity) =>
      getActivityState(activity, scheduleItems, selectedDate) === "blocked"
  ).length;

  const activityDates = new Set(filteredActivities.map(getDateForActivity));
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
      : "Studio";

    const isCurrentActive = activityState === "inProgress";
    const maxVisibleAvatars = 2;
    const overflowAvatars = assignees.length > maxVisibleAvatars ? assignees.length - maxVisibleAvatars : 0;

    scheduleRows.push(
      <button
        type="button"
        key={activity.id}
        className={`${styles.agendaRow} ${
          activityState === "completed" ? styles.agendaRowCompleted : ""
        } ${isCurrentActive ? styles.agendaRowActive : ""}`}
        onClick={() => onSelectActivity?.(activity.id)}
      >
        <span className={styles.agendaTime}>{formatActivityTime(activity)}</span>
        <span
          className={`${styles.agendaStatusDot} ${STATUS_CLASS_NAMES[activityState]}`}
          aria-hidden="true"
        />
        <span className={styles.agendaActivity}>
          <strong>{activity.title}</strong>
          <small>
            {projectName} · {TYPE_LABELS[activity.activityType]}
          </small>
        </span>
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
        <span className={`${styles.agendaStatusText} ${STATUS_CLASS_NAMES[activityState]}`}>
          {activityState === "completed" && <Check size={13} />}
          {STATUS_LABELS[activityState]}
        </span>
        <ChevronRight className={styles.agendaOpenIcon} size={15} aria-hidden="true" />
      </button>
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
                    <Clock3 size={15} />
                    <dt>Time</dt>
                    <dd>{formatActivityRange(primaryActivity)}</dd>
                  </div>
                  <div>
                    <MapPin size={15} />
                    <dt>Location</dt>
                    <dd>{primaryActivity.location ?? "Project workspace"}</dd>
                  </div>
                  <div>
                    <Users size={15} />
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
                    onClick={() => onSelectActivity?.(primaryActivity.id)}
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

        <section className={styles.laterSection} aria-labelledby="later-today-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.sectionEyebrow}>Unscheduled and waiting</p>
              <h2 id="later-today-title">Later today</h2>
            </div>
          </div>

          {laterItems.length > 0 ? (
            <div className={styles.laterList}>
              {laterItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => onSelectScheduleItem?.(item.id)}
                >
                  <Square size={15} className={styles.laterCheckboxIcon} aria-hidden="true" />
                  <span>
                    <strong>{item.title}</strong>
                    <small>
                      {projectsById.get(item.projectId) ?? item.projectId} ·{" "}
                      {item.status === "waiting" ? "Waiting for confirmation" : "Unscheduled task"}
                    </small>
                  </span>
                  <ChevronRight size={15} aria-hidden="true" />
                </button>
              ))}
            </div>
          ) : (
            <p className={styles.laterEmpty}>
              No additional reminders or unscheduled tasks for this date.
            </p>
          )}

          {onViewAllSchedule && (
            <button
              type="button"
              className={styles.viewCalendarActionTextLink}
              onClick={onViewAllSchedule}
            >
              <span>View full calendar</span>
              <ArrowRight size={13} />
            </button>
          )}
        </section>
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
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
              <span key={`${day}-${index}`}>{day}</span>
            ))}
          </div>

          <div className={styles.miniCalendarGrid}>
            {monthCells.map((day, index) => {
              if (!day) {
                return <span key={`empty-${index}`} aria-hidden="true" />;
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

              return (
                <button
                  type="button"
                  key={dateString}
                  className={`${isToday ? styles.miniCalendarToday : ""} ${
                    isSelected ? styles.miniCalendarSelected : ""
                  }`}
                  aria-label={formatLongDate(dateString)}
                  aria-current={isToday ? "date" : undefined}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setVisibleMonthOffset(0);
                    onDateChange?.(dateString);
                  }}
                >
                  {day}
                  {activityDates.has(dateString) && (
                    <i aria-label="Activities scheduled" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className={styles.utilityControls} aria-label="Calendar scope and filters">
          <label>
            <span>Calendar scope</span>
            <select
              value={scope}
              onChange={(event) =>
                onScopeChange?.(event.target.value as "mine" | "team")
              }
            >
              <option value="mine">My work</option>
              <option value="team">Team</option>
            </select>
          </label>
          <label>
            <span>Activity type</span>
            <select
              value={category}
              onChange={(event) =>
                onCategoryChange?.(event.target.value as TodayCategoryId)
              }
            >
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className={styles.daySummary} aria-labelledby="day-summary-title">
          <h2 id="day-summary-title">Day summary</h2>
          <div className={styles.daySummaryGrid}>
            <div className={styles.daySummaryCol}>
              <span className={styles.daySummaryNumber}>{dayActivities.length}</span>
              <span className={styles.daySummaryLabel}>
                <i className={styles.summaryDotScheduled} aria-hidden="true" />
                Scheduled
              </span>
            </div>
            <div className={styles.daySummaryCol}>
              <span className={styles.daySummaryNumber}>{completedCount}</span>
              <span className={styles.daySummaryLabel}>
                <i className={styles.summaryDotCompleted} aria-hidden="true" />
                Completed
              </span>
            </div>
            <div className={styles.daySummaryCol}>
              <span className={styles.daySummaryNumber}>{blockedCount}</span>
              <span className={styles.daySummaryLabel}>
                <i className={styles.summaryDotBlocked} aria-hidden="true" />
                Blocked
              </span>
            </div>
          </div>
        </section>

        <section className={styles.activityLegend} aria-labelledby="activity-legend-title">
          <h2 id="activity-legend-title">Activity legend</h2>
          <ul>
            {(
              [
                ["meeting", "Meeting"],
                ["site", "Site activity"],
                ["task", "Task"],
                ["deadline", "Deadline"],
                ["deliverable", "Deliverable"],
              ] as const
            ).map(([legendType, label]) => (
              <li key={legendType}>
                <i className={styles[`legend${legendType[0].toUpperCase()}${legendType.slice(1)}`]} />
                {label}
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
}
