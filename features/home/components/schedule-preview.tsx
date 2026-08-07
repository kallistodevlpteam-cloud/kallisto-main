"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Plus, Lock } from "lucide-react";
import { HomeSchedulePreviewItem } from "@/types/domain/home";
import styles from "../home-workspace.module.css";

export interface SchedulePreviewProps {
  todayEvents: HomeSchedulePreviewItem[];
  upcomingEvents: HomeSchedulePreviewItem[];
}

export function SchedulePreview({
  todayEvents,
  upcomingEvents,
}: SchedulePreviewProps) {
  const visibleToday = todayEvents.slice(0, 4);
  const visibleUpcoming = upcomingEvents.slice(0, 4);

  const getChipStyle = (typeChip: string) => {
    switch (typeChip) {
      case "delivery":
        return styles.chipBlue;
      case "site-visit":
        return styles.chipAmber;
      case "inspection":
        return styles.chipPurple;
      case "approval":
        return styles.chipRed;
      case "payment":
        return styles.chipGreen;
      case "private":
        return styles.chipGray;
      default:
        return styles.chipBlue;
    }
  };

  return (
    <section className={styles.sectionContainer}>
      <div className={styles.sectionHeaderRow}>
        <div>
          <h2 className={styles.sectionTitle}>Today and Upcoming</h2>
          <p className={styles.sectionSubtitle}>
            Site visits, deliveries, inspections, and milestone deadlines.
          </p>
        </div>

        <div className={styles.headerRightActions}>
          <Link href="/calendar" className={styles.btnSecondaryCompact}>
            <Plus size={13} />
            <span>Schedule event</span>
          </Link>
          <Link href="/calendar" className={styles.headerActionLink}>
            <span>Open calendar</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* 2-Column Desktop Layout */}
      <div className={styles.scheduleColumnsContainer}>
        {/* Left Column: Today */}
        <div className={styles.scheduleColumn}>
          <div className={styles.scheduleColHeader}>
            <span className={styles.scheduleColTitle}>Today</span>
            <span className={styles.scheduleColBadge}>{visibleToday.length} events</span>
          </div>

          {visibleToday.length === 0 ? (
            <div className={styles.emptyStateBoxSmall}>
              <p>No events scheduled today.</p>
            </div>
          ) : (
            <div className={styles.scheduleList}>
              {visibleToday.map((event) => (
                <div key={event.id} className={styles.scheduleRow}>
                  <div className={styles.eventTimeCell}>
                    <span className={styles.eventTimeText}>{event.timeOrDate}</span>
                  </div>

                  <div className={styles.eventMainCell}>
                    <div className={styles.eventTitleRow}>
                      {event.isPrivate && <Lock size={12} className={styles.iconGray} />}
                      <strong className={styles.eventTitle}>{event.title}</strong>
                    </div>
                    <span className={styles.eventProjectContext}>{event.projectName}</span>
                  </div>

                  <div className={styles.eventMetaCell}>
                    <span className={`${styles.eventChip} ${getChipStyle(event.typeChip)}`}>
                      {event.typeChip}
                    </span>
                  </div>

                  <div className={styles.eventActionCell}>
                    <Link href={event.route} className={styles.btnEventOpen}>
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Upcoming */}
        <div className={styles.scheduleColumn}>
          <div className={styles.scheduleColHeader}>
            <span className={styles.scheduleColTitle}>Upcoming</span>
            <span className={styles.scheduleColBadge}>{visibleUpcoming.length} items</span>
          </div>

          {visibleUpcoming.length === 0 ? (
            <div className={styles.emptyStateBoxSmall}>
              <p>No upcoming events scheduled.</p>
            </div>
          ) : (
            <div className={styles.scheduleList}>
              {visibleUpcoming.map((event) => (
                <div key={event.id} className={styles.scheduleRow}>
                  <div className={styles.eventTimeCell}>
                    <span className={styles.eventDateText}>{event.timeOrDate}</span>
                  </div>

                  <div className={styles.eventMainCell}>
                    <div className={styles.eventTitleRow}>
                      {event.isPrivate && <Lock size={12} className={styles.iconGray} />}
                      <strong className={styles.eventTitle}>{event.title}</strong>
                    </div>
                    <span className={styles.eventProjectContext}>{event.projectName}</span>
                  </div>

                  <div className={styles.eventMetaCell}>
                    <span className={`${styles.eventChip} ${getChipStyle(event.typeChip)}`}>
                      {event.typeChip}
                    </span>
                  </div>

                  <div className={styles.eventActionCell}>
                    <Link href={event.route} className={styles.btnEventOpen}>
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
