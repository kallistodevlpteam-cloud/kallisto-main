"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  XCircle,
  Truck,
  ClipboardCheck,
  Cpu,
  FileSearch,
  ShieldAlert,
  Sparkles,
  Briefcase,
  Award,
} from "lucide-react";
import styles from "../home-workspace.module.css";

export type EventStatus = "active" | "upcoming" | "completed" | "cancelled";

export interface ScheduleEventItem {
  id: string;
  time: string;
  title: string;
  badge: string;
  location: string;
  dotColor: string;
  trackColor?: string;
  status?: EventStatus;
}

export interface DayScheduleData {
  events: ScheduleEventItem[];
  totalTime: string;
  teamCount: number;
}

/**
 * Returns true if the given list of events contains at least one active or upcoming event.
 * Condition: showIndicator = activeEventsOnDate > 0
 * - Completed events do NOT count.
 * - Cancelled events do NOT count.
 */
export function hasActiveOrUpcomingEvents(events?: ScheduleEventItem[]): boolean {
  if (!events || events.length === 0) return false;
  const activeEventsOnDate = events.filter(
    (ev) => ev.status !== "completed" && ev.status !== "cancelled"
  ).length;
  return activeEventsOnDate > 0;
}

export interface SquircleCalendarDay {
  day: number;
  isBlank?: boolean;
  showIndicator?: boolean;
}

interface EventCategoryTheme {
  icon: React.ReactNode;
  bg: string;
  color: string;
  dotColor: string;
  badgeBg: string;
  badgeColor: string;
}

function getEventCategoryTheme(badge: string, fallbackDotColor?: string): EventCategoryTheme {
  switch (badge.toUpperCase()) {
    case "DELIVERY":
      return {
        icon: <Truck size={16} strokeWidth={2.2} />,
        bg: "#e0e7ff",
        color: "#4f46e5",
        dotColor: "#6366f1",
        badgeBg: "#eef2ff",
        badgeColor: "#4f46e5",
      };
    case "INSPECTION":
      return {
        icon: <ClipboardCheck size={16} strokeWidth={2.2} />,
        bg: "#e0f2fe",
        color: "#0284c7",
        dotColor: "#0ea5e9",
        badgeBg: "#f0f9ff",
        badgeColor: "#0284c7",
      };
    case "COORDINATION":
    case "TECH":
      return {
        icon: <Cpu size={16} strokeWidth={2.2} />,
        bg: "#ede9fe",
        color: "#7c3aed",
        dotColor: "#8b5cf6",
        badgeBg: "#f5f3ff",
        badgeColor: "#7c3aed",
      };
    case "FEASIBILITY":
    case "SURVEY":
      return {
        icon: <FileSearch size={16} strokeWidth={2.2} />,
        bg: "#ccfbf1",
        color: "#0d9488",
        dotColor: "#06b6d4",
        badgeBg: "#f0fdfa",
        badgeColor: "#0d9488",
      };
    case "SAFETY":
      return {
        icon: <ShieldAlert size={16} strokeWidth={2.2} />,
        bg: "#fee2e2",
        color: "#dc2626",
        dotColor: "#ef4444",
        badgeBg: "#fef2f2",
        badgeColor: "#dc2626",
      };
    case "REVIEW":
    case "AUDIT":
      return {
        icon: <Briefcase size={16} strokeWidth={2.2} />,
        bg: "#fef3c7",
        color: "#d97706",
        dotColor: "#f59e0b",
        badgeBg: "#fffbeb",
        badgeColor: "#d97706",
      };
    case "PRESENTATION":
    case "APPROVAL":
      return {
        icon: <Sparkles size={16} strokeWidth={2.2} />,
        bg: "#fce7f3",
        color: "#db2777",
        dotColor: "#ec4899",
        badgeBg: "#fdf2f8",
        badgeColor: "#db2777",
      };
    case "VENDOR":
      return {
        icon: <Briefcase size={16} strokeWidth={2.2} />,
        bg: "#dcfce7",
        color: "#16a34a",
        dotColor: "#10b981",
        badgeBg: "#f0fdf4",
        badgeColor: "#16a34a",
      };
    case "HANDOVER":
    case "MILESTONE":
      return {
        icon: <Award size={16} strokeWidth={2.2} />,
        bg: "#fae8ff",
        color: "#c026d3",
        dotColor: "#d946ef",
        badgeBg: "#fdf4ff",
        badgeColor: "#c026d3",
      };
    case "ROUTINE":
    default:
      return {
        icon: <CalendarClock size={16} strokeWidth={2.2} />,
        bg: "#e0f2fe",
        color: "#0284c7",
        dotColor: fallbackDotColor || "#0284c7",
        badgeBg: "#f0f9ff",
        badgeColor: "#0284c7",
      };
  }
}

function parseTimeTokens(timeStr: string) {
  const parts = timeStr.split("-").map((s) => s.trim());
  if (parts.length === 2) {
    return {
      start: parts[0],
      end: parts[1],
    };
  }
  return { start: timeStr, end: "" };
}

interface EventRowItemProps {
  id: string;
  time: string;
  title: string;
  badge: string;
  location: string;
  dotColor: string;
  trackColor?: string;
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
  activeMenuId,
  setActiveMenuId,
}: EventRowItemProps) {
  const isMenuOpen = activeMenuId === id;
  const menuRef = useRef<HTMLDivElement>(null);
  const theme = getEventCategoryTheme(badge, dotColor);
  const timeTokens = parseTimeTokens(time);

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

  return (
    <div className={styles.timelineItemCard}>
      {/* 1. Timestamp Column (Start / End) */}
      <div className={styles.eventTimeStack}>
        <span className={styles.eventStartTime}>{timeTokens.start}</span>
        {timeTokens.end && <span className={styles.eventEndTime}>{timeTokens.end}</span>}
      </div>

      {/* 2. Vertical Colored Accent Pill */}
      <div
        className={styles.eventVerticalPill}
        style={{ backgroundColor: theme.dotColor }}
      />

      {/* 3. Main Content: Category Tag (Top) & Title (Bottom) */}
      <div className={styles.eventCardMain}>
        <div className={styles.eventCategoryTag}>
          <span className={styles.eventCategoryName}>{badge.charAt(0).toUpperCase() + badge.slice(1).toLowerCase()}</span>
          {location && <span className={styles.eventLocationInline}>• {location}</span>}
        </div>
        <strong className={styles.eventTitleText}>{title}</strong>
      </div>

      {/* 4. Dropdown Menu / Actions */}
      <div className={styles.eventHeaderActionsWrap}>
        <div className={styles.menuDropdownContainer} ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={styles.eventActionBtn}
            aria-label="Event actions"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveMenuId(isMenuOpen ? null : id);
            }}
          >
            <MoreVertical size={14} />
          </button>

          {isMenuOpen && (
            <div className={styles.eventActionMenuDropdown}>
              <button type="button" className={styles.menuItemBtn} onClick={(e) => { e.preventDefault(); setActiveMenuId(null); }}>
                <Pencil size={13} />
                <span>Edit details</span>
              </button>
              <button type="button" className={styles.menuItemBtn} onClick={(e) => { e.preventDefault(); setActiveMenuId(null); }}>
                <CalendarClock size={13} />
                <span>Reschedule</span>
              </button>
              <button type="button" className={styles.menuItemBtn} onClick={(e) => { e.preventDefault(); setActiveMenuId(null); }}>
                <Copy size={13} />
                <span>Duplicate</span>
              </button>
              <button type="button" className={`${styles.menuItemBtn} ${styles.menuItemDanger}`} onClick={(e) => { e.preventDefault(); setActiveMenuId(null); }}>
                <XCircle size={13} />
                <span>Cancel event</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const SCHEDULE_EVENTS_BY_DAY: Record<number, DayScheduleData> = {
  30: {
    events: [
      {
        id: "event-30-1",
        time: "09:00 AM - 10:00 AM",
        title: "Cement OPC 53 delivery — 350 bags",
        badge: "DELIVERY",
        location: "Skyline Apartments, Site B • Thiruvananthapuram",
        dotColor: "#6366f1",
        trackColor: "#6366f1",
      },
      {
        id: "event-30-2",
        time: "11:30 AM - 12:30 PM",
        title: "Structural column inspection & pour sign-off",
        badge: "INSPECTION",
        location: "Nila Residence, Zone 2 • Kochi",
        dotColor: "#0ea5e9",
        trackColor: "#0ea5e9",
      },
      {
        id: "event-30-3",
        time: "03:00 PM - 04:00 PM",
        title: "HVAC vendor coordination meeting",
        badge: "COORDINATION",
        location: "Online Meeting • Virtual Room 4",
        dotColor: "#10b981",
        trackColor: "#10b981",
      },
    ],
    totalTime: "4h 30m",
    teamCount: 6,
  },
  20: {
    events: [
      {
        id: "event-20-1",
        time: "09:00 AM - 10:30 AM",
        title: "Electrical & smart automation conduit check",
        badge: "INSPECTION",
        location: "Skyline Luxury Villa, Site A",
        dotColor: "#0ea5e9",
        trackColor: "#0ea5e9",
      },
      {
        id: "event-20-2",
        time: "02:00 PM - 03:30 PM",
        title: "Home automation integration & audio layout review",
        badge: "TECH",
        location: "Smart Living Lab • Virtual Room 2",
        dotColor: "#6366f1",
        trackColor: "#6366f1",
      },
    ],
    totalTime: "3h 00m",
    teamCount: 4,
  },
  3: {
    events: [
      {
        id: "event-3-1",
        time: "10:00 AM - 11:30 AM",
        title: "AI site feasibility & zoning analysis review",
        badge: "FEASIBILITY",
        location: "Greenfield Eco Resort, Alappuzha",
        dotColor: "#06b6d4",
        trackColor: "#06b6d4",
      },
      {
        id: "event-3-2",
        time: "02:00 PM - 03:00 PM",
        title: "Topographical contour validation & soil report",
        badge: "SURVEY",
        location: "Kakkanad Site Office",
        dotColor: "#6366f1",
        trackColor: "#6366f1",
      },
    ],
    totalTime: "2h 30m",
    teamCount: 4,
  },
  12: {
    events: [
      {
        id: "event-12-1",
        time: "08:30 AM - 09:30 AM",
        title: "Weekly site safety compliance drill & team briefing",
        badge: "SAFETY",
        location: "Main Yard • Thiruvananthapuram",
        dotColor: "#f43f5e",
        trackColor: "#f43f5e",
      },
      {
        id: "event-12-2",
        time: "03:30 PM - 05:00 PM",
        title: "Sub-contractor progress & safety review",
        badge: "REVIEW",
        location: "Zone 1 Conference Room",
        dotColor: "#8b5cf6",
        trackColor: "#8b5cf6",
      },
    ],
    totalTime: "2h 30m",
    teamCount: 8,
  },
  15: {
    events: [
      {
        id: "event-15-1",
        time: "11:00 AM - 12:30 PM",
        title: "3D Digital Twin walkthrough presentation",
        badge: "PRESENTATION",
        location: "Client Presentation Studio",
        dotColor: "#06b6d4",
        trackColor: "#06b6d4",
      },
      {
        id: "event-15-2",
        time: "03:30 PM - 04:30 PM",
        title: "Interior finishing material sample approval",
        badge: "APPROVAL",
        location: "Kallisto Materials Hub",
        dotColor: "#f59e0b",
        trackColor: "#f59e0b",
      },
    ],
    totalTime: "2h 30m",
    teamCount: 5,
  },
  16: {
    events: [
      {
        id: "event-16-1",
        time: "09:30 AM - 11:00 AM",
        title: "Waterfront setback & drainage survey inspection",
        badge: "INSPECTION",
        location: "Alappuzha Backwaters Site",
        dotColor: "#0ea5e9",
        trackColor: "#0ea5e9",
      },
      {
        id: "event-16-2",
        time: "02:00 PM - 03:30 PM",
        title: "Marine-grade piling vendor sign-off",
        badge: "VENDOR",
        location: "Site Office Suite",
        dotColor: "#10b981",
        trackColor: "#10b981",
      },
    ],
    totalTime: "3h 00m",
    teamCount: 4,
  },
  25: {
    events: [
      {
        id: "event-25-1",
        time: "10:30 AM - 12:00 PM",
        title: "Acoustic insulation & drywall audit",
        badge: "AUDIT",
        location: "Urban Studio Project • Kochi",
        dotColor: "#10b981",
        trackColor: "#10b981",
      },
      {
        id: "event-25-2",
        time: "02:30 PM - 03:30 PM",
        title: "HVAC low-noise ducting inspection",
        badge: "INSPECTION",
        location: "Kochi North Wing",
        dotColor: "#06b6d4",
        trackColor: "#06b6d4",
      },
    ],
    totalTime: "2h 30m",
    teamCount: 3,
  },
  28: {
    events: [
      {
        id: "event-28-1",
        time: "09:00 AM - 11:00 AM",
        title: "Pre-handover snag list inspection & deep clean",
        badge: "HANDOVER",
        location: "Nila Residence, Villa 4",
        dotColor: "#f43f5e",
        trackColor: "#f43f5e",
      },
      {
        id: "event-28-2",
        time: "02:00 PM - 03:30 PM",
        title: "Client key handover & completion certificate sign-off",
        badge: "MILESTONE",
        location: "Main Reception",
        dotColor: "#10b981",
        trackColor: "#10b981",
      },
    ],
    totalTime: "3h 30m",
    teamCount: 5,
  },
};

const DAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function WorkspaceDashboardSection() {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date(2026, 6, 1));
  const [selectedDay, setSelectedDay] = useState(30);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthNameFull = currentMonthDate.toLocaleDateString("en-US", { month: "long" });
  const monthTitle = `${monthNameFull} ${year}`;
  const monthShort = currentMonthDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase();

  const handlePrevMonth = () => setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const calendarData = useMemo(() => {
    const isJuly2026 = year === 2026 && month === 6;
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const leadingBlanks = isJuly2026 ? 1 : (firstDayOfWeek + 6) % 7;
    const daysCount = new Date(year, month + 1, 0).getDate();

    const items: SquircleCalendarDay[] = [];
    for (let i = 0; i < leadingBlanks; i++) items.push({ day: 0, isBlank: true });
    for (let d = 1; d <= daysCount; d++) {
      const dayEvents = isJuly2026 ? SCHEDULE_EVENTS_BY_DAY[d]?.events : undefined;
      const showIndicator = hasActiveOrUpcomingEvents(dayEvents);
      items.push({ day: d, showIndicator });
    }
    return { items, leadingBlanks, daysCount };
  }, [year, month]);

  const activeDay = Math.min(selectedDay, calendarData.daysCount);
  const activeDayOfWeekIdx = (calendarData.leadingBlanks + activeDay - 1) % 7;
  const weekdayLabel = DAY_NAMES[activeDayOfWeekIdx];

  const defaultDaySchedule: DayScheduleData = {
    events: [
      {
        id: `event-${activeDay}-routine`,
        time: "09:30 AM - 11:00 AM",
        title: "Daily site log verification & labor attendance check",
        badge: "ROUTINE",
        location: "Active Site Office • Central Monitoring",
        dotColor: "#0284c7",
        trackColor: "#0284c7",
      },
    ],
    totalTime: "1h 30m",
    teamCount: 3,
  };

  const isJuly2026 = year === 2026 && month === 6;
  const currentSchedule = (isJuly2026 && SCHEDULE_EVENTS_BY_DAY[activeDay]) ? SCHEDULE_EVENTS_BY_DAY[activeDay] : defaultDaySchedule;
  const isCurrentDayToday = isJuly2026 && activeDay === 30;
  const headerDateLabel = isCurrentDayToday
    ? `TODAY • ${weekdayLabel}, ${monthShort} ${activeDay}`
    : `${weekdayLabel}, ${monthShort} ${activeDay}`;

  return (
    <div className={styles.dashboardGridContainer}>
      <div className={styles.dashboardScheduleColumn}>
        <div className={styles.scheduleHeaderRow}>
          <h2 className={styles.scheduleTitle}>Schedule</h2>
          <div className={styles.headerRightActions}>
            <Link href="/calendar" className={styles.btnAddEventPrimary}><Plus size={13} /><span>Add event</span></Link>
          </div>
        </div>

        <div className={styles.scheduleContentSplit}>
          <div className={styles.squircleCalendarCard}>
            <div className={styles.squircleMonthHeader}>
              <button type="button" className={styles.squircleNavBtn} aria-label="Previous month" onClick={handlePrevMonth}><ChevronLeft size={16} /></button>
              <span className={styles.squircleMonthTitle}>{monthTitle}</span>
              <button type="button" className={styles.squircleNavBtn} aria-label="Next month" onClick={handleNextMonth}><ChevronRight size={16} /></button>
            </div>

            <div className={styles.squircleDayNamesRow}>
              {DAY_NAMES.map((d, idx) => (
                <span
                  key={d}
                  className={`${styles.squircleDayNameBadge} ${idx === activeDayOfWeekIdx ? styles.squircleDayNameActive : ""}`}
                >
                  {d}
                </span>
              ))}
            </div>

            <div className={styles.squircleGridDays}>
              {calendarData.items.map((item, idx) => {
                if (item.isBlank) return <div key={`blank-${idx}`} className={styles.squircleDayBlank} />;
                const isDaySelected = item.day === activeDay;
                return (
                  <button
                    key={`day-${item.day}`}
                    type="button"
                    className={`${styles.squircleDayCard} ${isDaySelected ? styles.squircleDaySelected : ""}`}
                    onClick={() => setSelectedDay(item.day)}
                  >
                    <span className={styles.squircleDayNumber}>{item.day}</span>
                    {item.showIndicator && <span className={styles.squircleEventDot} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.dashboardEventsPanel}>
            <div className={styles.agendaTimelineStack}>
              <div className={styles.timelineDayBlock}>
                <span className={styles.timelineDayHeader}>{headerDateLabel}</span>
                {currentSchedule.events.length > 0 ? (
                  currentSchedule.events.map((ev) => (
                    <EventRowItem key={ev.id} {...ev} activeMenuId={activeMenuId} setActiveMenuId={setActiveMenuId} />
                  ))
                ) : (
                  <div className={styles.emptyEventsCard}>
                    <Calendar size={22} className={styles.emptyEventsIcon} />
                    <h4 className={styles.emptyEventsTitle}>No Events Scheduled</h4>
                    <p className={styles.emptyEventsDesc}>
                      There are no site visits or milestones scheduled for {weekdayLabel}, {monthNameFull} {activeDay}.
                    </p>
                    <Link href="/calendar" className={styles.emptyEventsAddBtn}>
                      <Plus size={13} />
                      <span>Schedule for {monthShort} {activeDay}</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
