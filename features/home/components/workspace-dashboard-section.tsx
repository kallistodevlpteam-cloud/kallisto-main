"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Calendar,
  Clock,
  Users,
  MoreVertical,
  Pencil,
  CalendarClock,
  Copy,
  XCircle
} from "lucide-react";
import styles from "../home-workspace.module.css";

interface CalendarDayItem {
  day: number;
  isMuted?: boolean;
  isSelected?: boolean;
  dots?: string[];
}

const JULY_2026_CALENDAR_DAYS: CalendarDayItem[] = [
  // Row 1
  { day: 28, isMuted: true },
  { day: 29, isMuted: true },
  { day: 30, isMuted: true },
  { day: 1, dots: ["#3b82f6"] },
  { day: 2 },
  { day: 3 },
  { day: 4 },
  // Row 2
  { day: 5 },
  { day: 6 },
  { day: 7 },
  { day: 8 },
  { day: 9 },
  { day: 10 },
  { day: 11 },
  // Row 3
  { day: 12 },
  { day: 13 },
  { day: 14 },
  { day: 15 },
  { day: 16, dots: ["#22c55e", "#f97316"] },
  { day: 17 },
  { day: 18 },
  // Row 4
  { day: 19 },
  { day: 20, isSelected: true, dots: ["#ef4444", "#22c55e"] },
  { day: 21 },
  { day: 22, dots: ["#f97316"] },
  { day: 23 },
  { day: 24, dots: ["#22c55e", "#f97316"] },
  { day: 25 },
  // Row 5
  { day: 26 },
  { day: 27 },
  { day: 28 },
  { day: 29 },
  { day: 30 },
  { day: 31 },
  { day: 1, isMuted: true },
];

interface EventRowItemProps {
  id: string;
  time: string;
  title: string;
  badge: React.ReactNode;
  location: string;
  dotColor: string;
  trackColor: string;
  activeMenuId: string | null;
  setActiveMenuId: (id: string | null) => void;
}

function EventRowItem({
  id,
  time,
  title,
  badge,
  location,
  dotColor,
  trackColor,
  activeMenuId,
  setActiveMenuId,
}: EventRowItemProps) {
  const isMenuOpen = activeMenuId === id;
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, setActiveMenuId]);

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuId(isMenuOpen ? null : id);
  };

  const handleMenuAction = (e: React.MouseEvent, _actionName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuId(null);
  };

  return (
    <Link href="/calendar" className={styles.timelineEventRow}>
      <div className={styles.timelineTrackCol}>
        <span className={styles.nodeDot} style={{ backgroundColor: dotColor }} />
        <span className={styles.trackLine} style={{ backgroundColor: trackColor }} />
      </div>

      <div className={styles.eventContentWrap}>
        <div className={styles.eventTopHeader}>
          <span className={styles.eventTimeText}>{time}</span>

          <div className={styles.eventActionGroup}>
            <span className={styles.eventDiagonalArrow}>
              <ArrowUpRight size={16} />
            </span>

            <div className={styles.menuContainer} ref={menuRef}>
              <button
                type="button"
                className={styles.menuTriggerBtn}
                onClick={handleMenuToggle}
                aria-label="Event options"
              >
                <MoreVertical size={15} />
              </button>

              {isMenuOpen && (
                <div className={styles.contextMenuDropdown} role="menu">
                  <button
                    type="button"
                    className={styles.menuItemBtn}
                    onClick={(e) => handleMenuAction(e, "edit")}
                  >
                    <Pencil size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className={styles.menuItemBtn}
                    onClick={(e) => handleMenuAction(e, "reschedule")}
                  >
                    <CalendarClock size={13} />
                    <span>Reschedule</span>
                  </button>
                  <button
                    type="button"
                    className={styles.menuItemBtn}
                    onClick={(e) => handleMenuAction(e, "duplicate")}
                  >
                    <Copy size={13} />
                    <span>Duplicate</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.menuItemBtn} ${styles.menuItemDanger}`}
                    onClick={(e) => handleMenuAction(e, "cancel")}
                  >
                    <XCircle size={13} />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.eventTitleBadgeRow}>
          <strong className={styles.eventTitleText}>{title}</strong>
          <span className={styles.eventPillBadge}>{badge}</span>
        </div>

        <div className={styles.eventLocationSub}>{location}</div>
      </div>
    </Link>
  );
}

export function WorkspaceDashboardSection() {
  const [selectedDay, setSelectedDay] = useState(20);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  return (
    <div className={styles.dashboardGridContainer}>
      {/* LEFT COLUMN: Schedule (approx 62% width) */}
      <div className={styles.dashboardScheduleColumn}>
        {/* Schedule Header Row */}
        <div className={styles.scheduleHeaderRow}>
          <h2 className={styles.scheduleTitle}>Schedule</h2>

          <div className={styles.headerRightActions}>
            <Link href="/calendar" className={styles.btnAddEventPrimary}>
              <Plus size={13} />
              <span>Add event</span>
            </Link>
            <Link href="/calendar" className={styles.headerActionLink}>
              <span>View calendar</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Schedule Panels: Calendar (left) & Events List (right) */}
        <div className={styles.scheduleContentSplit}>
          {/* Mini Month Calendar Card */}
          <div className={styles.dashboardCalendarCard}>
            <div className={styles.miniMonthHeader}>
              <button type="button" className={styles.miniNavIconBtn} aria-label="Previous month">
                <ChevronLeft size={16} />
              </button>
              <span className={styles.miniMonthTitle}>July 2026</span>
              <button type="button" className={styles.miniNavIconBtn} aria-label="Next month">
                <ChevronRight size={16} />
              </button>
            </div>

            <div className={styles.miniDayNamesRow}>
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                <span key={d} className={styles.miniDayName}>
                  {d}
                </span>
              ))}
            </div>

            <div className={styles.miniGridDays}>
              {JULY_2026_CALENDAR_DAYS.map((item, idx) => {
                const isDaySelected = item.day === selectedDay && !item.isMuted;

                return (
                  <div key={`${item.day}-${idx}`} className={styles.miniDayCellWrap}>
                    <button
                      type="button"
                      className={`${styles.miniDayBtn} ${
                        item.isMuted ? styles.miniDayMuted : ""
                      } ${isDaySelected ? styles.miniDaySelected : ""}`}
                      onClick={() => !item.isMuted && setSelectedDay(item.day)}
                      disabled={item.isMuted}
                    >
                      <span>{item.day}</span>
                    </button>
                    {item.dots && item.dots.length > 0 && (
                      <div className={styles.dotsRow}>
                        {item.dots.map((color, dotIdx) => (
                          <span
                            key={dotIdx}
                            className={styles.multiDot}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={styles.calendarDivider} />

            {/* Calendar Stats Footer */}
            <div className={styles.calendarStatsFooter}>
              <div className={styles.statCol}>
                <div className={styles.statIconSquare}>
                  <Calendar size={16} className={styles.statIcon} />
                </div>
                <span className={styles.statLabel}>Total Events</span>
                <span className={styles.statValue}>3</span>
              </div>

              <div className={styles.statCol}>
                <div className={styles.statIconSquare}>
                  <Clock size={16} className={styles.statIcon} />
                </div>
                <span className={styles.statLabel}>Total Time</span>
                <span className={styles.statValue}>4h 30m</span>
              </div>

              <div className={styles.statCol}>
                <div className={styles.statIconSquare}>
                  <Users size={16} className={styles.statIcon} />
                </div>
                <span className={styles.statLabel}>Team</span>
                <span className={styles.statValue}>6</span>
              </div>
            </div>
          </div>

          {/* Events Agenda Panel */}
          <div className={styles.dashboardEventsPanel}>
            <div className={styles.agendaTimelineStack}>
              {/* TODAY SECTION */}
              <div className={styles.timelineDayBlock}>
                <span className={styles.timelineDayHeader}>TODAY • MON, JUL 20</span>

                {/* Event 1 */}
                <EventRowItem
                  id="event-1"
                  time="09:00 AM - 10:00 AM"
                  title="Cement OPC 53 delivery — 350 bags"
                  badge="DELIVERY"
                  location="Skyline Apartments, Site B • Thiruvananthapuram"
                  dotColor="#6366f1"
                  trackColor="#c7d2fe"
                  activeMenuId={activeMenuId}
                  setActiveMenuId={setActiveMenuId}
                />

                {/* Event 2 */}
                <EventRowItem
                  id="event-2"
                  time="09:00 AM - 10:00 AM"
                  title="Material quality inspection — TMT bars"
                  badge={
                    <>
                      SITE<br />VISIT
                    </>
                  }
                  location="Skyline Heights, Ground Floor • Site engineer to confirm"
                  dotColor="#22c55e"
                  trackColor="#bbf7d0"
                  activeMenuId={activeMenuId}
                  setActiveMenuId={setActiveMenuId}
                />
              </div>

              {/* TOMORROW SECTION */}
              <div className={styles.timelineDayBlock}>
                <span className={styles.timelineDayHeader}>TOMORROW • TUE, JUL 21</span>

                {/* Event 3 */}
                <EventRowItem
                  id="event-3"
                  time="03:00 PM - 05:00 PM"
                  title="Vendor coordination call — dispatch schedule"
                  badge="MEETING"
                  location="Skyline Apartments, Site B • Thiruvananthapuram"
                  dotColor="#cbd5e1"
                  trackColor="#e2e8f0"
                  activeMenuId={activeMenuId}
                  setActiveMenuId={setActiveMenuId}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
