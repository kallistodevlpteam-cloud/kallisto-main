"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CalendarRange, Flag } from "lucide-react";
import {
  differenceInCalendarDays,
  getDateOnlyInTimeZone,
  getMinutesInTimeZone,
  getMonthDayLabel,
  getWeekdayLong,
  getWeekdayShort,
  isDateWithinRange,
} from "./schedule-date-range";
import { layoutOverlappingActivities } from "./schedule-overlap-layout";
import {
  formatTimeLabel,
  getTimedActivityPosition,
  minutesToTime,
  pointerOffsetToTimeRange,
} from "./schedule-positioning";
import {
  ScheduleActivityItem,
  ScheduleSlotSelection,
} from "./schedule-types";
import {
  ActivityHoverCard,
  CreateActivityPopoverCard,
  ExpandedActivityCard,
  TimedActivity,
} from "./schedule-activity-block";
import { getWorkstreamColorTheme } from "../timeline/gantt/phase-colors";
import styles from "./schedule.module.css";

export interface WeekCalendarProps {
  visibleDates: string[];
  selectedDate: string;
  activities: ScheduleActivityItem[];
  selectedActivityId: string | null;
  initialSlot?: ScheduleSlotSelection | null;
  onSelectDate: (date: string) => void;
  onSelectActivity: (activity: ScheduleActivityItem) => void;
  onCreateSlot: (slot: ScheduleSlotSelection) => void;
  onCloseSlot?: () => void;
  onSaveSlot?: (activityData: Partial<ScheduleActivityItem>) => void;
  onEditActivity?: (activity: ScheduleActivityItem) => void;
  onDeleteActivity?: (activityId: string) => void;
  scheduleStartMinutes?: number;
  scheduleEndMinutes?: number;
  pixelsPerMinute?: number;
  timezone?: string;
  now?: Date;
}

interface DayColumnProps {
  date: string;
  dayIndex?: number;
  totalDays?: number;
  activities: ScheduleActivityItem[];
  selectedActivityId: string | null;
  initialSlot?: ScheduleSlotSelection | null;
  scheduleStartMinutes: number;
  scheduleEndMinutes: number;
  pixelsPerMinute: number;
  currentMinutes: number | null;
  onSelectActivity: (activity: ScheduleActivityItem) => void;
  onCreateSlot: (slot: ScheduleSlotSelection) => void;
  onCloseSlot?: () => void;
  onSaveSlot?: (activityData: Partial<ScheduleActivityItem>) => void;
  onEditActivity?: (activity: ScheduleActivityItem) => void;
  onDeleteActivity?: (activityId: string) => void;
}

function getActivityStatusClass(
  status: ScheduleActivityItem["status"]
): string {
  switch (status) {
    case "In progress":
      return styles.eventInProgress;
    case "Completed":
      return styles.eventCompleted;
    case "Pending approval":
      return styles.eventPendingApproval;
    case "Blocked":
    case "Delayed":
      return styles.eventBlocked;
    default:
      return styles.eventScheduled;
  }
}

function DayColumn({
  date,
  dayIndex = 0,
  totalDays = 7,
  activities,
  selectedActivityId,
  initialSlot,
  scheduleStartMinutes,
  scheduleEndMinutes,
  pixelsPerMinute,
  currentMinutes,
  onSelectActivity,
  onCreateSlot,
  onCloseSlot,
  onSaveSlot,
  onEditActivity,
  onDeleteActivity,
}: DayColumnProps) {
  const overlapLayout = useMemo(
    () => layoutOverlappingActivities(activities),
    [activities]
  );
  const dragStartRef = useRef<number | null>(null);
  const gridHeight =
    (scheduleEndMinutes - scheduleStartMinutes) * pixelsPerMinute;
  const isRightHalf = dayIndex >= Math.max(1, totalDays - 3);

  const getPointerOffset = (event: React.PointerEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return Math.max(0, Math.min(gridHeight, event.clientY - bounds.top));
  };

  const hourHeight = 60 * pixelsPerMinute;
  const totalHours = Math.round((scheduleEndMinutes - scheduleStartMinutes) / 60);
  const hourIndices = Array.from({ length: totalHours }, (_, i) => i);

  const parseSlotMins = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  return (
    <div
      className={styles.dayColumn}
      style={{ height: gridHeight }}
      role="gridcell"
      aria-label={`${getWeekdayLong(date)}, ${getMonthDayLabel(date)}`}
    >
      {hourIndices.map((index) => {
        const slotStartMinutes = scheduleStartMinutes + index * 60;
        const slotEndMinutes = slotStartMinutes + 60;
        const startHours = Math.floor(slotStartMinutes / 60);
        const startMins = slotStartMinutes % 60;
        const endHours = Math.floor(slotEndMinutes / 60);
        const endMins = slotEndMinutes % 60;
        const startTime = `${String(startHours).padStart(2, "0")}:${String(startMins).padStart(2, "0")}`;
        const endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;

        const hasActiveSelection = selectedActivityId !== null || Boolean(initialSlot);

        return (
          <button
            key={index}
            type="button"
            className={`${styles.hourlySlotCell} ${
              hasActiveSelection ? styles.slotCellHoverDisabled : ""
            }`}
            style={{
              top: index * hourHeight,
              height: hourHeight,
            }}
            aria-label={`Create activity on ${getWeekdayLong(date)}, ${getMonthDayLabel(date)} at ${startTime}`}
            disabled={hasActiveSelection}
            onClick={() => !hasActiveSelection && onCreateSlot({ date, startTime, endTime })}
          />
        );
      })}

      {activities.map((activity) => {
        const position = getTimedActivityPosition(
          activity,
          scheduleStartMinutes,
          scheduleEndMinutes,
          pixelsPerMinute
        );
        if (!position) return null;

        const overlap = overlapLayout[activity.id] ?? { columnIndex: 0, columnCount: 1 };
        const alignLeft = isRightHalf || overlap.columnIndex >= 2;

        return (
          <TimedActivity
            key={activity.id}
            activity={activity}
            position={position}
            overlap={overlap}
            isSelected={selectedActivityId === activity.id}
            hasActiveSelection={selectedActivityId !== null || Boolean(initialSlot)}
            alignLeft={alignLeft}
            onSelect={onSelectActivity}
            onEdit={onEditActivity}
            onDelete={onDeleteActivity}
          />
        );
      })}

      {initialSlot && initialSlot.date === date && onSaveSlot && onCloseSlot && (
        <div
          style={{
            position: "absolute",
            top: (parseSlotMins(initialSlot.startTime) - scheduleStartMinutes) * pixelsPerMinute,
            left: 4,
            right: 4,
            height: Math.max(
              40,
              (parseSlotMins(initialSlot.endTime) - parseSlotMins(initialSlot.startTime)) * pixelsPerMinute
            ),
            zIndex: 99999,
          }}
        >
          <CreateActivityPopoverCard
            slot={initialSlot}
            alignLeft={isRightHalf}
            onClose={onCloseSlot}
            onSave={onSaveSlot}
          />
        </div>
      )}

      {currentMinutes !== null && (
        <div
          className={styles.currentTimeIndicator}
          style={{
            top:
              Math.round(
                (currentMinutes - scheduleStartMinutes) *
                  pixelsPerMinute *
                  100
              ) / 100,
          }}
          aria-label={`Current time ${minutesToTime(currentMinutes)}`}
          data-testid="current-time-indicator"
        >
          <span className={styles.currentTimeLabel}>Now</span>
        </div>
      )}
    </div>
  );
}

function AllDayLane({
  visibleDates,
  activities,
  selectedActivityId,
  hasActiveSelection = false,
  onSelectActivity,
}: Pick<
  WeekCalendarProps,
  "visibleDates" | "activities" | "selectedActivityId" | "onSelectActivity"
> & { hasActiveSelection?: boolean }) {
  const visibleStart = visibleDates[0];
  const visibleEnd = visibleDates[visibleDates.length - 1];
  const visibleActivities = activities.filter(
    (activity) =>
      (activity.allDay ||
        !activity.startTime ||
        !activity.endTime ||
        activity.startDate !== activity.endDate) &&
      activity.endDate >= visibleStart &&
      activity.startDate <= visibleEnd
  );
  const rowEndIndexes: number[] = [];
  const positionedActivities = visibleActivities
    .map((activity) => ({
      activity,
      startIndex: Math.max(
        0,
        differenceInCalendarDays(activity.startDate, visibleStart)
      ),
      endIndex: Math.min(
        visibleDates.length - 1,
        differenceInCalendarDays(activity.endDate, visibleStart)
      ),
    }))
    .sort(
      (left, right) =>
        left.startIndex - right.startIndex ||
        left.endIndex - right.endIndex
    )
    .map((positionedActivity) => {
      let rowIndex = rowEndIndexes.findIndex(
        (rowEndIndex) => rowEndIndex < positionedActivity.startIndex
      );
      if (rowIndex === -1) {
        rowIndex = rowEndIndexes.length;
        rowEndIndexes.push(positionedActivity.endIndex);
      } else {
        rowEndIndexes[rowIndex] = positionedActivity.endIndex;
      }
      return { ...positionedActivity, rowIndex };
    });
  const rowCount = Math.max(1, rowEndIndexes.length);
  const columns = `var(--time-gutter-width) repeat(${visibleDates.length}, minmax(var(--day-column-width), 1fr))`;

  return (
    <div
      className={styles.allDayLane}
      style={{
        gridTemplateColumns: columns,
        gridTemplateRows: `repeat(${rowCount}, 31px)`,
      }}
      aria-label="All-day and multi-day activities"
    >
      <div
        className={styles.allDayGutter}
        style={{ gridRow: `1 / span ${rowCount}` }}
      >
        <CalendarRange size={13} aria-hidden="true" />
        <span>All day</span>
      </div>

      {visibleDates.map((date, index) => (
        <div
          key={date}
          className={styles.allDayDayTrack}
          style={{
            gridColumn: index + 2,
            gridRow: `1 / span ${rowCount}`,
          }}
          aria-hidden="true"
        />
      ))}

      {visibleActivities.length === 0 && (
        <span
          className={styles.allDayEmpty}
          style={{
            gridColumn: `2 / span ${visibleDates.length}`,
            gridRow: 1,
          }}
        >
          No all-day activities this period
        </span>
      )}

      {positionedActivities.map(
        ({ activity, startIndex, endIndex, rowIndex }) => (
          <AllDayActivityItem
            key={activity.id}
            activity={activity}
            startIndex={startIndex}
            endIndex={endIndex}
            rowIndex={rowIndex}
            selectedActivityId={selectedActivityId}
            hasActiveSelection={hasActiveSelection}
            onSelectActivity={onSelectActivity}
          />
        )
      )}
    </div>
  );
}

function AllDayActivityItem({
  activity,
  startIndex,
  endIndex,
  rowIndex,
  selectedActivityId,
  hasActiveSelection = false,
  onSelectActivity,
  onEditActivity,
  onDeleteActivity,
}: {
  activity: ScheduleActivityItem;
  startIndex: number;
  endIndex: number;
  rowIndex: number;
  selectedActivityId: string | null;
  hasActiveSelection?: boolean;
  onSelectActivity: (activity: ScheduleActivityItem) => void;
  onEditActivity?: (activity: ScheduleActivityItem) => void;
  onDeleteActivity?: (activityId: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isSelected = selectedActivityId === activity.id;
  const isMilestone = activity.type === "Milestone";
  const theme = getWorkstreamColorTheme(activity.workstream);

  return (
    <div
      style={{
        gridColumn: `${startIndex + 2} / ${endIndex + 3}`,
        gridRow: rowIndex + 1,
        position: "relative",
        zIndex: isSelected ? 99999 : isHovered ? 9999 : 2,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        className={`${styles.allDayActivity} ${
          isMilestone ? styles.allDayMilestone : ""
        } ${getActivityStatusClass(activity.status)} ${
          isSelected ? styles.eventSelected : ""
        }`}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: theme.lightBg,
          borderColor: theme.progressFill,
          color: theme.text,
        }}
        disabled={hasActiveSelection && !isSelected}
        onClick={(e) => {
          e.stopPropagation();
          if (!hasActiveSelection || isSelected) {
            onSelectActivity(activity);
          }
        }}
      >
        {isMilestone && <Flag size={11} aria-hidden="true" />}
        <span>{activity.title}</span>
        <span
          className={styles.allDayWorkstream}
          style={{ color: theme.text, opacity: 0.75 }}
        >
          {activity.workstream}
        </span>
      </button>

      {isSelected ? (
        <ExpandedActivityCard
          activity={activity}
          timeLabel="All Day"
          alignLeft={startIndex >= 4}
          onClose={() => onSelectActivity(activity)}
          onEdit={onEditActivity}
          onDelete={onDeleteActivity}
        />
      ) : (
        isHovered && selectedActivityId === null && (
          <ActivityHoverCard
            activity={activity}
            timeLabel="All Day"
            alignLeft={startIndex >= 4}
          />
        )
      )}
    </div>
  );
}

export function WeekCalendar({
  visibleDates,
  selectedDate,
  activities,
  selectedActivityId,
  initialSlot,
  onSelectDate,
  onSelectActivity,
  onCreateSlot,
  onCloseSlot,
  onSaveSlot,
  onEditActivity,
  onDeleteActivity,
  scheduleStartMinutes = 0,
  scheduleEndMinutes = 24 * 60,
  pixelsPerMinute = 1.6,
  timezone = "Asia/Kolkata",
  now,
}: WeekCalendarProps) {
  const [liveNow, setLiveNow] = useState(() => now ?? new Date());
  const scrollerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = 8 * 60 * pixelsPerMinute;
    }
  }, [pixelsPerMinute]);

  useEffect(() => {
    if (now) return;
    const timer = window.setInterval(() => setLiveNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, [now]);

  const effectiveNow = now ?? liveNow;
  const todayDate = getDateOnlyInTimeZone(effectiveNow, timezone);
  const currentMinutes = getMinutesInTimeZone(effectiveNow, timezone);
  const showCurrentTime =
    visibleDates.includes(todayDate) &&
    currentMinutes >= scheduleStartMinutes &&
    currentMinutes <= scheduleEndMinutes;
  const timedActivities = activities.filter(
    (activity) =>
      !activity.allDay &&
      Boolean(activity.startTime && activity.endTime) &&
      activity.startDate === activity.endDate
  );
  const gridHeight =
    (scheduleEndMinutes - scheduleStartMinutes) * pixelsPerMinute;
  const hourLabels = Array.from(
    { length: (scheduleEndMinutes - scheduleStartMinutes) / 60 },
    (_, index) => scheduleStartMinutes + index * 60
  );
  const columns = `var(--time-gutter-width) repeat(${visibleDates.length}, minmax(var(--day-column-width), 1fr))`;

  return (
    <section
      className={styles.weekCalendar}
      aria-label="Project weekly calendar"
      style={
        {
          "--calendar-grid-height": `${gridHeight}px`,
          "--calendar-hour-height": `${60 * pixelsPerMinute}px`,
          "--visible-day-count": visibleDates.length,
        } as React.CSSProperties
      }
    >
      <div
        ref={scrollerRef}
        className={`${styles.weekCalendarScroller} ${
          selectedActivityId !== null || Boolean(initialSlot) ? styles.scrollerLocked : ""
        }`}
      >
        <div
          className={styles.weekCalendarContent}
          style={{
            minWidth: `calc(var(--time-gutter-width) + ${visibleDates.length} * var(--day-column-width) + ${visibleDates.length} * var(--calendar-column-gap))`,
          }}
        >
          <div className={styles.calendarStickyTop}>
            {/* Single Title Header Row with Day and Date */}
            <div
              className={styles.weekHeader}
              style={{ gridTemplateColumns: columns }}
              role="row"
            >
              <div className={styles.weekHeaderGutter} role="columnheader">
                <span>GMT+5:30</span>
              </div>
              {visibleDates.map((date) => {
                const isToday = date === todayDate;
                const isSelected = date === selectedDate;
                return (
                  <button
                    key={date}
                    type="button"
                    className={`${styles.weekDayHeader} ${
                      isToday ? styles.weekDayToday : ""
                    } ${isSelected ? styles.weekDaySelected : ""}`}
                    onClick={() => onSelectDate(date)}
                    aria-pressed={isSelected}
                    aria-label={`${getWeekdayShort(date)} ${getMonthDayLabel(date)}`}
                  >
                    <span className={styles.weekDayName}>
                      {getWeekdayShort(date)}
                    </span>
                    <span className={styles.weekDayDate}>
                      {getMonthDayLabel(date)}
                    </span>
                  </button>
                );
              })}
            </div>

            <AllDayLane
              visibleDates={visibleDates}
              activities={activities}
              selectedActivityId={selectedActivityId}
              hasActiveSelection={selectedActivityId !== null || Boolean(initialSlot)}
              onSelectActivity={onSelectActivity}
            />
          </div>

          <div
            className={styles.hourlyGrid}
            style={{ gridTemplateColumns: columns }}
            role="grid"
          >
            <div
              className={styles.timeGutter}
              style={{ height: gridHeight }}
              aria-hidden="true"
            >
              {hourLabels.map((minutes) => (
                <span
                  key={minutes}
                  className={styles.timeGutterLabel}
                  style={{
                    top:
                      (minutes - scheduleStartMinutes) * pixelsPerMinute + 20,
                  }}
                >
                  {formatTimeLabel(minutesToTime(minutes))}
                </span>
              ))}
            </div>

            {visibleDates.map((date, index) => (
              <DayColumn
                key={date}
                date={date}
                dayIndex={index}
                totalDays={visibleDates.length}
                activities={timedActivities.filter(
                  (activity) => activity.startDate === date
                )}
                selectedActivityId={selectedActivityId}
                initialSlot={initialSlot}
                scheduleStartMinutes={scheduleStartMinutes}
                scheduleEndMinutes={scheduleEndMinutes}
                pixelsPerMinute={pixelsPerMinute}
                currentMinutes={
                  showCurrentTime && date === todayDate ? currentMinutes : null
                }
                onSelectActivity={onSelectActivity}
                onCreateSlot={onCreateSlot}
                onCloseSlot={onCloseSlot}
                onSaveSlot={onSaveSlot}
                onEditActivity={onEditActivity}
                onDeleteActivity={onDeleteActivity}
              />
            ))}
          </div>

          {activities.every(
            (activity) =>
              !visibleDates.some((date) =>
                isDateWithinRange(date, activity.startDate, activity.endDate)
              )
          ) && (
            <div className={styles.calendarEmptyState}>
              <CalendarRange size={20} aria-hidden="true" />
              <span>No activities in this period</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
