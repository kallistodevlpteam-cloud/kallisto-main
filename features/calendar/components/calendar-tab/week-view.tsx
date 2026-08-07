"use client";

import React from "react";
import { CalendarDays } from "lucide-react";
import type { PresentableActivity } from "../../services/calendar-activity.service";
import styles from "../calendar-workspace-page.module.css";

interface WeekViewProps {
  activities: PresentableActivity[];
  selectedDate: string; // YYYY-MM-DD
  onSelectActivity: (id: string) => void;
}

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]; // 8 AM to 6 PM

export function WeekView({ activities, selectedDate, onSelectActivity }: WeekViewProps) {
  const curr = new Date(selectedDate);
  const dayOfWeek = curr.getDay(); // 0 is Sun, 1 is Mon
  const monOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(curr);
    d.setDate(curr.getDate() + monOffset + i);
    return {
      dateStr: d.toISOString().substring(0, 10),
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      dayNumber: d.getDate(),
      isToday: d.toISOString().substring(0, 10) === "2026-07-21",
    };
  });

  const allDayActivities = activities.filter((a) => a.time.allDay);
  const timedActivities = activities.filter((a) => !a.time.allDay);

  return (
    <div className={styles.weekViewContainer}>
      {/* Header Row: Rounded Title Strip */}
      <div className={styles.weekHeaderGrid}>
        <div className={styles.timeAxisHeaderCell} />
        {weekDays.map((wd) => (
          <div
            key={wd.dateStr}
            className={`${styles.weekHeaderCell} ${wd.isToday ? styles.weekHeaderCellToday : ""}`}
          >
            <span className={styles.weekDayName}>{wd.dayName}</span>
          </div>
        ))}
      </div>

      {/* Date Numbers Row */}
      <div className={styles.weekDateNumGrid}>
        <div className={styles.timeAxisDateCell} />
        {weekDays.map((wd) => (
          <div
            key={`date-${wd.dateStr}`}
            className={`${styles.weekDateCell} ${wd.isToday ? styles.weekDateCellToday : ""}`}
          >
            <span className={styles.weekDayNumber}>{wd.dayNumber}</span>
          </div>
        ))}
      </div>

      {/* All-Day Events Section */}
      <div className={styles.allDayRowGrid}>
        <div className={styles.allDayLabelCell}>
          <CalendarDays size={14} className={styles.allDayIcon} />
          <span>All Day</span>
        </div>
        {weekDays.map((wd) => {
          const dayAllDayEvts = allDayActivities.filter(
            (a) => a.time.allDay && a.time.startDate === wd.dateStr
          );
          return (
            <div key={`allday-${wd.dateStr}`} className={styles.allDayCell}>
              {dayAllDayEvts.map((act) => {
                const isGreen = act.activityType === "site_visit" || act.activityType === "inspection";
                const cardClass = isGreen ? styles.allDayCardGreen : styles.allDayCardPurple;
                return (
                  <div
                    key={act.id}
                    className={`${styles.allDayCard} ${cardClass}`}
                    onClick={() => onSelectActivity(act.id)}
                  >
                    <span className={styles.allDayCardTitle}>{act.title}</span>
                    {isGreen && <span className={styles.allDayTag}>Civil</span>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Hourly Time Grid Body */}
      <div className={styles.weekTimeGridBody}>
        {HOURS.map((hour) => {
          const formattedHour = `${String(hour % 12 || 12).padStart(2, "0")}:00 ${hour >= 12 ? "PM" : "AM"}`;
          return (
            <div key={`hour-row-${hour}`} className={styles.weekHourRow}>
              <div className={styles.timeAxisCell}>
                <span>{formattedHour}</span>
              </div>

              {weekDays.map((wd) => {
                const hourActivities = timedActivities.filter((a) => {
                  if (a.time.allDay) return false;
                  const start = new Date(a.time.startAt);
                  const actDate = a.time.startAt.substring(0, 10);
                  return actDate === wd.dateStr && start.getHours() === hour;
                });

                return (
                  <div key={`cell-${wd.dateStr}-${hour}`} className={styles.weekTimeCell}>
                    {hourActivities.map((act, index) => {
                      const count = hourActivities.length;
                      const widthPercent = 100 / count;
                      const leftPercent = index * widthPercent;

                      let themeClass = styles.timedCardCoral;
                      if (act.activityType === "site_visit" || act.activityType === "inspection") {
                        themeClass = styles.timedCardGreen;
                      } else if (act.activityType === "drawing_delivery" || act.activityType === "milestone") {
                        themeClass = styles.timedCardPurple;
                      }

                      return (
                        <div
                          key={act.id}
                          className={`${styles.timedEventCard} ${themeClass}`}
                          style={{
                            width: `${widthPercent}%`,
                            left: `${leftPercent}%`,
                          }}
                          onClick={() => onSelectActivity(act.id)}
                        >
                          <span className={styles.timedCardTitle}>{act.title}</span>
                          <span className={styles.timedCardMeta}>
                            {!act.time.allDay
                              ? `${act.time.startAt.substring(11, 16)} - ${act.time.endAt.substring(11, 16)}`
                              : "All day"}
                          </span>
                          <div className={styles.timedCardAvatarPill}>
                            <span className={styles.avatarCircle}>AK</span>
                            <span className={styles.avatarName}>Anil Kum..</span>
                          </div>
                        </div>
                      );
                    })}

                    {wd.isToday && hour === 10 && (
                      <div className={styles.currentTimeIndicatorLine}>
                        <div className={styles.currentTimeIndicatorDot} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
