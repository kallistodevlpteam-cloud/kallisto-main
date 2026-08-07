"use client";

import React, { useState } from "react";
import type { PresentableActivity } from "../../services/calendar-activity.service";
import styles from "../calendar-workspace-page.module.css";

interface MonthViewProps {
  activities: PresentableActivity[];
  selectedDate: string; // YYYY-MM-DD
  onSelectActivity: (id: string) => void;
  onSelectDate: (dateStr: string) => void;
}

export function MonthView({
  activities,
  selectedDate,
  onSelectActivity,
  onSelectDate,
}: MonthViewProps) {
  const [overflowPopoverDay, setOverflowPopoverDay] = useState<string | null>(null);

  // Month Grid for July 2026 (Starts Wednesday Jul 1 = offset 2 from Monday)
  const totalDays = 31;
  const leadBlanks = 2; // Mon, Tue blank offset

  const daysList = Array.from({ length: totalDays }, (_, idx) => {
    const dayNum = idx + 1;
    const dayStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    const dateStr = `2026-07-${dayStr}`;
    const isToday = dateStr === "2026-07-21";
    const isSelected = dateStr === selectedDate;

    const dayActivities = activities.filter((a) => {
      if (a.time.allDay) return a.time.startDate === dateStr;
      return a.time.startAt.startsWith(dateStr);
    });

    return {
      dayNum,
      dateStr,
      isToday,
      isSelected,
      dayActivities,
    };
  });

  return (
    <div className={styles.monthViewCard}>
      {/* 7 Equal Columns Header Row (Monday through Sunday) */}
      <div className={styles.monthDayHeaderRow}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dayName) => (
          <div key={dayName} className={styles.monthDayHeaderCell}>
            {dayName}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className={styles.monthDaysGrid}>
        {/* Blanks */}
        {Array.from({ length: leadBlanks }).map((_, i) => (
          <div key={`blank-${i}`} className={`${styles.monthCell} ${styles.monthCellOutside}`} />
        ))}

        {/* Days */}
        {daysList.map((d) => {
          const visibleEvents = d.dayActivities.slice(0, 3);
          const overflowCount = d.dayActivities.length - 3;

          return (
            <div
              key={d.dateStr}
              className={`${styles.monthCell} ${d.isToday ? styles.monthCellToday : ""} ${
                d.isSelected ? styles.monthCellSelected : ""
              }`}
              onClick={() => onSelectDate(d.dateStr)}
            >
              <div className={styles.monthCellHeader}>
                <span
                  className={`${styles.monthDayNumber} ${
                    d.isToday ? styles.monthDayNumberToday : ""
                  }`}
                >
                  {d.dayNum}
                </span>
              </div>

              {/* Max 3 visible activities per day */}
              <div className={styles.monthEventList}>
                {visibleEvents.map((act) => (
                  <div
                    key={act.id}
                    className={`${styles.monthEventPill} ${
                      act.title === "Busy" ? styles.monthPillBusy : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectActivity(act.id);
                    }}
                  >
                    <span>{act.title}</span>
                  </div>
                ))}

                {/* +N more Overflow Pill */}
                {overflowCount > 0 && (
                  <button
                    type="button"
                    className={styles.overflowPillBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOverflowPopoverDay(d.dateStr);
                    }}
                  >
                    +{overflowCount} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overflow Day Popover Modal */}
      {overflowPopoverDay && (
        <div className={styles.modalOverlay} onClick={() => setOverflowPopoverDay(null)}>
          <div className={styles.overflowModalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Activities for {overflowPopoverDay}</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setOverflowPopoverDay(null)}
              >
                ×
              </button>
            </div>
            <div className={styles.overflowList}>
              {activities
                .filter((a) => {
                  if (a.time.allDay) return a.time.startDate === overflowPopoverDay;
                  return a.time.startAt.startsWith(overflowPopoverDay);
                })
                .map((act) => (
                  <div
                    key={act.id}
                    className={styles.overflowItemRow}
                    onClick={() => {
                      setOverflowPopoverDay(null);
                      onSelectActivity(act.id);
                    }}
                  >
                    <span className={styles.overflowItemTitle}>{act.title}</span>
                    <span className={styles.overflowItemMeta}>
                      {act.time.allDay ? "All Day" : act.time.startAt.substring(11, 16)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
