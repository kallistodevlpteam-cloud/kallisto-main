"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Lock, Plus } from "lucide-react";
import { HomeSchedulePreviewItem } from "@/types/domain/home";
import styles from "../home-workspace.module.css";

export interface CalendarWorkspacePreviewProps {
  todayEvents: HomeSchedulePreviewItem[];
  upcomingEvents: HomeSchedulePreviewItem[];
}

export function CalendarWorkspacePreview({
  todayEvents,
  upcomingEvents,
}: CalendarWorkspacePreviewProps) {
  const [selectedDay, setSelectedDay] = useState(21);
  const [viewTab, setViewTab] = useState<"today" | "upcoming">("today");

  const visibleEvents = viewTab === "today" ? todayEvents : upcomingEvents;

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

  // Days matrix for July 2026 mini calendar
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <section className={styles.sectionContainerFullWidth}>
      <div className={styles.sectionHeaderRow}>
        <div>
          <h2 className={styles.sectionTitleLarge}>Main Calendar Workspace</h2>
          <p className={styles.sectionSubtitle}>
            Full operational schedule, site visits, inspections, and project deliveries.
          </p>
        </div>

        <div className={styles.headerRightActions}>
          <Link href="/calendar" className={styles.btnPrimaryHeader}>
            <Plus size={15} />
            <span>Schedule event</span>
          </Link>
          <Link href="/calendar" className={styles.headerActionLink}>
            <span>Open calendar</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Main Full-Width Calendar Box (Matching SVG w=1155px, h=662px) */}
      <div className={styles.fullCalendarBox}>
        {/* Left Panel: Mini Month Calendar (~280px wide) */}
        <div className={styles.miniMonthPanel}>
          <div className={styles.miniMonthHeader}>
            <span className={styles.miniMonthTitle}>July 2026</span>
            <div className={styles.miniMonthNavBtns}>
              <button type="button" className={styles.miniNavBtn} aria-label="Previous month">
                <ChevronLeft size={14} />
              </button>
              <button type="button" className={styles.miniNavBtn} aria-label="Next month">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className={styles.miniDayNamesRow}>
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <span key={d} className={styles.miniDayName}>
                {d}
              </span>
            ))}
          </div>

          <div className={styles.miniGridDays}>
            {/* Lead offset for Wednesday July 1 */}
            <span className={styles.miniDayBlank} />
            <span className={styles.miniDayBlank} />

            {daysInMonth.map((day) => {
              const isToday = day === 21;
              const isSelected = day === selectedDay;
              const hasEvent = [21, 22, 23, 24, 25].includes(day);

              return (
                <button
                  key={day}
                  type="button"
                  className={`${styles.miniDayBtn}${isSelected ? ` ${styles.miniDaySelected}` : ""}${
                    isToday ? ` ${styles.miniDayToday}` : ""
                  }`}
                  onClick={() => setSelectedDay(day)}
                >
                  <span>{day}</span>
                  {hasEvent && <span className={styles.eventDotIndicator} />}
                </button>
              );
            })}
          </div>

          <div className={styles.miniMonthFooterInfo}>
            <CalendarIcon size={14} className={styles.iconPurple} />
            <span>4 site visits & deliveries on July 21</span>
          </div>
        </div>

        {/* Right Panel: Large Agenda & Schedule List */}
        <div className={styles.agendaListPanel}>
          <div className={styles.agendaHeaderRow}>
            <div className={styles.agendaTabGroup}>
              <button
                type="button"
                className={`${styles.agendaTabBtn}${viewTab === "today" ? ` ${styles.agendaTabActive}` : ""}`}
                onClick={() => setViewTab("today")}
              >
                Today ({todayEvents.length})
              </button>

              <button
                type="button"
                className={`${styles.agendaTabBtn}${viewTab === "upcoming" ? ` ${styles.agendaTabActive}` : ""}`}
                onClick={() => setViewTab("upcoming")}
              >
                Upcoming ({upcomingEvents.length})
              </button>
            </div>

            <span className={styles.agendaDateLabel}>
              {viewTab === "today" ? "Tuesday, 21 July 2026" : "Upcoming Schedule"}
            </span>
          </div>

          <div className={styles.agendaRowsStack}>
            {visibleEvents.length === 0 ? (
              <div className={styles.emptyStateBox}>
                <p>No events scheduled for this period.</p>
              </div>
            ) : (
              visibleEvents.map((event) => (
                <div key={event.id} className={styles.largeAgendaRow}>
                  <div className={styles.agendaTimeCell}>
                    <span className={styles.agendaTimeText}>{event.timeOrDate}</span>
                  </div>

                  <div className={styles.agendaMainCell}>
                    <div className={styles.agendaTitleLine}>
                      {event.isPrivate && <Lock size={13} className={styles.iconGray} />}
                      <strong className={styles.largeAgendaTitle}>{event.title}</strong>
                    </div>
                    <span className={styles.agendaProjectContext}>{event.projectName}</span>
                  </div>

                  <div className={styles.agendaChipCell}>
                    <span className={`${styles.eventChipLarge} ${getChipStyle(event.typeChip)}`}>
                      {event.typeChip}
                    </span>
                  </div>

                  <div className={styles.agendaActionCell}>
                    <Link href={event.route} className={styles.btnOpenAgendaRow}>
                      Open Details
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
