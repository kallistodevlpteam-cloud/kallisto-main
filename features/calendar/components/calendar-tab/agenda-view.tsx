"use client";

import React from "react";
import { Clock, MapPin, Building2, User, AlertCircle } from "lucide-react";
import type { PresentableActivity } from "../../services/calendar-activity.service";
import styles from "../calendar-workspace-page.module.css";

interface AgendaViewProps {
  activities: PresentableActivity[];
  onSelectActivity: (id: string) => void;
}

export function AgendaView({ activities, onSelectActivity }: AgendaViewProps) {
  const todayStr = "2026-07-21";

  const overdueItems = activities.filter((a) => a.isOverdue && a.status !== "completed");
  const todayItems = activities.filter((a) => {
    if (a.time.allDay) return a.time.startDate === todayStr;
    return a.time.startAt.startsWith(todayStr);
  });
  const upcomingItems = activities.filter((a) => {
    if (a.isOverdue) return false;
    const dateStr = a.time.allDay ? a.time.startDate : a.time.startAt.substring(0, 10);
    return dateStr > todayStr;
  });

  return (
    <div className={styles.agendaContainer}>
      {/* Overdue Section */}
      {overdueItems.length > 0 && (
        <div className={styles.agendaSection}>
          <div className={styles.agendaSectionHeaderOverdue}>
            <AlertCircle size={16} />
            <h3>Overdue Activities ({overdueItems.length})</h3>
          </div>
          <div className={styles.agendaList}>
            {overdueItems.map((act) => (
              <div
                key={act.id}
                className={`${styles.agendaRow} ${styles.agendaRowOverdue}`}
                onClick={() => onSelectActivity(act.id)}
              >
                <div className={styles.agendaDateCol}>
                  <span className={styles.agendaDateText}>
                    {act.time.allDay ? act.time.startDate : act.time.startAt.substring(0, 10)}
                  </span>
                  <span className={styles.agendaTimeText}>
                    {act.time.allDay ? "All Day" : act.time.startAt.substring(11, 16)}
                  </span>
                </div>

                <div className={styles.agendaContentCol}>
                  <h4 className={styles.agendaTitle}>{act.title}</h4>
                  <div className={styles.agendaMetaLine}>
                    {act.projectId && <span>Project: {act.projectId}</span>}
                    <span>Owner: {act.ownerId}</span>
                  </div>
                </div>

                <span className={styles.statusOverdueTag}>Overdue</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today Section */}
      <div className={styles.agendaSection}>
        <div className={styles.agendaSectionHeader}>
          <h3>Today — Jul 21, 2026</h3>
        </div>
        <div className={styles.agendaList}>
          {todayItems.length === 0 ? (
            <p className={styles.emptyAgendaText}>No activities scheduled for today.</p>
          ) : (
            todayItems.map((act) => (
              <div
                key={act.id}
                className={styles.agendaRow}
                onClick={() => onSelectActivity(act.id)}
              >
                <div className={styles.agendaDateCol}>
                  <span className={styles.agendaTimeText}>
                    {act.time.allDay ? "All Day" : act.time.startAt.substring(11, 16)}
                  </span>
                </div>

                <div className={styles.agendaContentCol}>
                  <h4 className={styles.agendaTitle}>{act.title}</h4>
                  <div className={styles.agendaMetaLine}>
                    {act.projectId && <span>Project: {act.projectId}</span>}
                    {act.location && <span>Loc: {act.location}</span>}
                    <span>Assignee: {act.ownerId}</span>
                  </div>
                </div>

                <span
                  className={`${styles.agendaStatusBadge} ${
                    act.status === "completed" ? styles.statusCompleted : styles.statusScheduled
                  }`}
                >
                  {act.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upcoming Section */}
      <div className={styles.agendaSection}>
        <div className={styles.agendaSectionHeader}>
          <h3>Upcoming Schedule</h3>
        </div>
        <div className={styles.agendaList}>
          {upcomingItems.length === 0 ? (
            <p className={styles.emptyAgendaText}>No upcoming activities scheduled.</p>
          ) : (
            upcomingItems.map((act) => (
              <div
                key={act.id}
                className={styles.agendaRow}
                onClick={() => onSelectActivity(act.id)}
              >
                <div className={styles.agendaDateCol}>
                  <span className={styles.agendaDateText}>
                    {act.time.allDay ? act.time.startDate : act.time.startAt.substring(0, 10)}
                  </span>
                  <span className={styles.agendaTimeText}>
                    {act.time.allDay ? "All Day" : act.time.startAt.substring(11, 16)}
                  </span>
                </div>

                <div className={styles.agendaContentCol}>
                  <h4 className={styles.agendaTitle}>{act.title}</h4>
                  <div className={styles.agendaMetaLine}>
                    {act.projectId && <span>Project: {act.projectId}</span>}
                    <span>Assignee: {act.ownerId}</span>
                  </div>
                </div>

                <span className={styles.agendaStatusBadge}>{act.status}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
