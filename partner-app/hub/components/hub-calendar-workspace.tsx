"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Phone,
  Check,
  MapPin,
  AlertTriangle,
  Building2,
  ExternalLink,
} from "lucide-react";
import {
  SearchDuotoneIcon,
  TeamDuotoneIcon,
  CalendarDuotoneIcon,
  DocumentsDuotoneIcon,
  AnalyticsDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { INITIAL_HUB_ORDERS } from "../mock/hub-orders-mock-data";
import { HubOrder, HubOrderStatus } from "../types/hub-order";
import styles from "@/features/calendar/components/calendar-workspace-page.module.css";

// Helper to parse date string like "Aug 30, 2026", "2026-07-24", etc.
function parseOrderDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };
    const parts = dateStr.replace(",", "").split(" ");
    if (parts.length >= 3) {
      const m = months[parts[0].toLowerCase().slice(0, 3)];
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      if (m !== undefined && !isNaN(day) && !isNaN(year)) {
        return new Date(year, m, day);
      }
    }
    return null;
  }
  return d;
}

interface CategoryFilterItem {
  id: string;
  label: string;
  dotClass: string;
  boxClass: string;
  statuses: HubOrderStatus[];
}

const CATEGORY_FILTERS: CategoryFilterItem[] = [
  {
    id: "meetings",
    label: "Meetings",
    dotClass: styles.mockupDotMeeting,
    boxClass: styles.mockupCategoryBoxMeeting,
    statuses: ["REQUEST"],
  },
  {
    id: "site",
    label: "Site visits",
    dotClass: styles.mockupDotSite,
    boxClass: styles.mockupCategoryBoxSite,
    statuses: ["REVIEWING", "QUOTED"],
  },
  {
    id: "tasks",
    label: "Tasks",
    dotClass: styles.mockupDotTask,
    boxClass: styles.mockupCategoryBoxTask,
    statuses: ["CONFIRMED"],
  },
  {
    id: "deliverables",
    label: "Deliverables",
    dotClass: styles.mockupDotDeliverable,
    boxClass: styles.mockupCategoryBoxDeliverable,
    statuses: ["PREPARING", "DISPATCHED"],
  },
  {
    id: "deadlines",
    label: "Deadlines",
    dotClass: styles.mockupDotDeadline,
    boxClass: styles.mockupCategoryBoxDeadline,
    statuses: ["COMPLETED"],
  },
];

const MAX_VISIBLE_ACTIVITIES = 2;
const WEEKDAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function HubCalendarWorkspace() {
  const router = useRouter();

  // Current view month & selected date
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(6); // 6 = July (0-indexed)
  const [selectedDateStr, setSelectedDateStr] = useState<string>("2026-07-24");

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "meetings",
    "site",
    "tasks",
    "deliverables",
    "deadlines",
  ]);

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>("ORD-1024");

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleTodayClick = () => {
    setCurrentYear(2026);
    setCurrentMonth(6);
    setSelectedDateStr("2026-07-24");
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  // Map allowed statuses
  const allowedStatuses = useMemo(() => {
    const set = new Set<HubOrderStatus>();
    CATEGORY_FILTERS.forEach((cat) => {
      if (selectedCategories.includes(cat.id)) {
        cat.statuses.forEach((s) => set.add(s));
      }
    });
    return set;
  }, [selectedCategories]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return INITIAL_HUB_ORDERS.filter((order) => {
      if (!allowedStatuses.has(order.status)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(q);
        const matchesProject = order.project.toLowerCase().includes(q);
        const matchesCustomer = order.customer.toLowerCase().includes(q);
        const matchesItem = order.items.some((i) => i.name.toLowerCase().includes(q));
        if (!matchesId && !matchesProject && !matchesCustomer && !matchesItem) {
          return false;
        }
      }
      return true;
    });
  }, [allowedStatuses, searchQuery]);

  // Group orders by date (normalizing dates into July / August for demo view)
  const ordersByDate = useMemo(() => {
    const map = new Map<string, HubOrder[]>();

    filteredOrders.forEach((order) => {
      let dateKey = "2026-07-24";
      if (order.id === "ORD-1024") dateKey = "2026-07-24";
      else if (order.id === "ORD-1023") dateKey = "2026-07-25";
      else if (order.id === "ORD-1022") dateKey = "2026-07-23";
      else if (order.id === "ORD-1021") dateKey = "2026-07-22";
      else if (order.id === "ORD-1020") dateKey = "2026-07-21";
      else {
        const d = parseOrderDate(order.requiredBy);
        if (d) {
          dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        }
      }

      const list = map.get(dateKey) || [];
      list.push(order);
      map.set(dateKey, list);
    });

    return map;
  }, [filteredOrders]);

  // Selected date orders
  const selectedDateOrders = useMemo(() => {
    return ordersByDate.get(selectedDateStr) || [];
  }, [ordersByDate, selectedDateStr]);

  // Calendar Weeks Grid (Mon - Sun deterministic matrix)
  const calendarWeeks = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const dayOfWeek = firstDay.getDay(); // 0 = Sun
    const mondayOffset = (dayOfWeek + 6) % 7;

    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();

    const cells: Array<{
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      dateStr: string;
    }> = [];

    // Prev month days
    for (let i = mondayOffset - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      cells.push({
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: false,
        dateStr,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isToday = currentYear === 2026 && currentMonth === 6 && d === 24; // Reference today (24 July 2026)
      cells.push({
        dayNumber: d,
        isCurrentMonth: true,
        isToday,
        dateStr,
      });
    }

    // Next month padding
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
        const dateStr = `${nextY}-${String(nextM + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        cells.push({
          dayNumber: d,
          isCurrentMonth: false,
          isToday: false,
          dateStr,
        });
      }
    }

    const weeks: Array<typeof cells> = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  }, [currentYear, currentMonth]);

  const monthYearHeaderLabel = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(currentYear, currentMonth, 1));

  const selectedDateFormattedHeader = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${selectedDateStr}T12:00:00`));

  return (
    <div className={styles.mockupCalendarCard}>
      {/* Left Column: Calendar Grid & Navigation */}
      <div className={styles.mockupCalendarLeft}>
        {/* Calendar Header Row */}
        <div className={styles.mockupCalendarHeader}>
          <div className={styles.mockupNavGroup}>
            <h2 className={styles.mockupMonthTitle}>{monthYearHeaderLabel}</h2>
          </div>

          <div className={styles.mockupHeaderRight}>
            <div className={styles.mockupSearchWrap}>
              <SearchDuotoneIcon size={14} className={styles.mockupSearchIcon} />
              <input
                type="text"
                className={styles.mockupSearchInput}
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    color: "#94a3b8",
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className={styles.mockupChevronGroup}>
              <button
                type="button"
                className={styles.mockupChevronBtn}
                aria-label="Previous month"
                onClick={handlePrevMonth}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className={styles.mockupChevronBtn}
                aria-label="Next month"
                onClick={handleNextMonth}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <button
              type="button"
              className={styles.mockupTodayBtn}
              onClick={handleTodayClick}
            >
              Today
            </button>
          </div>
        </div>

        {/* Weekday Column Headers */}
        <div className={styles.mockupWeekdayRow}>
          {WEEKDAY_NAMES.map((name) => (
            <div key={name} className={styles.mockupWeekdayCell}>
              {name}
            </div>
          ))}
        </div>

        {/* Days Grid: 7-Column Deterministic Matrix */}
        <div className={styles.mockupDayGrid}>
          {calendarWeeks.map((week) =>
            week.map((cell) => {
              const dayOrders = ordersByDate.get(cell.dateStr) ?? [];
              const visibleOrders = dayOrders.slice(0, MAX_VISIBLE_ACTIVITIES);
              const hiddenCount = Math.max(0, dayOrders.length - MAX_VISIBLE_ACTIVITIES);
              const isSelected = cell.dateStr === selectedDateStr;

              return (
                <div
                  key={cell.dateStr}
                  className={`${styles.mockupDayTile} ${
                    !cell.isCurrentMonth ? styles.mockupDayTileOutside : ""
                  } ${isSelected ? styles.mockupDayTileSelected : ""}`}
                  onClick={() => {
                    setSelectedDateStr(cell.dateStr);
                    if (dayOrders.length > 0) {
                      setExpandedOrderId(dayOrders[0].id);
                    } else {
                      setExpandedOrderId(null);
                    }
                  }}
                >
                  {/* Day Number Header */}
                  <div className={styles.mockupDayHeader}>
                    {cell.isToday ? (
                      <span className={styles.mockupTodayBadge}>
                        {String(cell.dayNumber).padStart(2, "0")}
                      </span>
                    ) : (
                      <span
                        className={`${styles.mockupDayNumber} ${
                          !cell.isCurrentMonth ? styles.mockupDayNumberOutside : ""
                        }`}
                      >
                        {String(cell.dayNumber).padStart(2, "0")}
                      </span>
                    )}
                  </div>

                  {/* Order Activity Pills */}
                  <div className={styles.mockupTileActivityList}>
                    {visibleOrders.map((order) => {
                      const isOrderActive =
                        ((expandedOrderId ?? selectedDateOrders[0]?.id) === order.id) && isSelected;
                      const hasSourcing = order.items.some((i) => !i.inStock);

                      return (
                        <button
                          type="button"
                          key={order.id}
                          data-testid={`calendar-order-${order.id}`}
                          className={`${styles.mockupActivityPill} ${
                            isOrderActive ? styles.mockupActivityPillActive : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDateStr(cell.dateStr);
                            setExpandedOrderId(order.id);
                          }}
                        >
                          {hasSourcing ? (
                            <AlertTriangle
                              size={10}
                              strokeWidth={3}
                              className={styles.mockupStatusAlertIcon}
                            />
                          ) : (
                            <span
                              className={`${styles.mockupActivityDot} ${
                                order.status === "REQUEST"
                                  ? styles.mockupDotMeeting
                                  : order.status === "REVIEWING" || order.status === "QUOTED"
                                  ? styles.mockupDotSite
                                  : order.status === "CONFIRMED"
                                  ? styles.mockupDotTask
                                  : order.status === "DISPATCHED"
                                  ? styles.mockupDotDeliverable
                                  : styles.mockupDotDeadline
                              }`}
                            />
                          )}

                          <span>{order.project}</span>
                        </button>
                      );
                    })}

                    {/* Overflow Tag */}
                    {hiddenCount > 0 && (
                      <button
                        type="button"
                        className={styles.mockupOverflowTag}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDateStr(cell.dateStr);
                          setExpandedOrderId(null);
                        }}
                      >
                        +{hiddenCount}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Category Filter Legend */}
        <div className={styles.mockupCategoryLegend}>
          {CATEGORY_FILTERS.map((cat) => {
            const isChecked = selectedCategories.includes(cat.id);

            return (
              <label
                key={cat.id}
                className={styles.mockupCategoryCheckbox}
                onClick={() => toggleCategory(cat.id)}
              >
                <span
                  className={`${styles.mockupCategoryBox} ${
                    isChecked ? cat.boxClass : styles.mockupCategoryBoxUnchecked
                  }`}
                >
                  {isChecked && <Check size={12} strokeWidth={3} />}
                </span>
                <span>{cat.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Right Column: Unified Day Schedule & Expandable Chips in Our Theme */}
      <div className={styles.mockupRightPanel}>
        <div className={styles.hiveStudioSection}>
          <div className={styles.hiveStudioHeader}>
            <div className={styles.actionTitleGroup}>
              <span className={styles.hiveStudioCategoryTitle}>DAY SCHEDULE</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className={styles.hiveStudioCountBadge}>
                {selectedDateOrders.length}{" "}
                {selectedDateOrders.length === 1 ? "Activity" : "Activities"}
              </span>
            </div>
          </div>

          <p className={styles.mockupDayOverviewSubtitle}>
            {selectedDateFormattedHeader}
          </p>

          <div className={styles.hiveStudioCardList}>
            {selectedDateOrders.length === 0 ? (
              <div className={styles.hiveStudioEmptyBox}>
                <p className={styles.hiveStudioEmptyText}>
                  No activities or requisitions scheduled for this date.
                </p>
              </div>
            ) : (
              selectedDateOrders.map((order) => {
                const isExpanded = (expandedOrderId ?? selectedDateOrders[0]?.id) === order.id;
                const isCompleted = order.status === "COMPLETED";
                const isBlocked = order.items.some((i) => !i.inStock);
                const orderValue = order.finalValue || order.estimatedValue;
                const initials = order.customer
                  .split(" ")
                  .map((w) => w[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("");

                return (
                  <div
                    key={order.id}
                    className={`${styles.hiveExpandableCard} ${
                      isExpanded ? styles.hiveExpandableCardOpen : ""
                    }`}
                  >
                    {/* Clickable Summary Row */}
                    <button
                      type="button"
                      className={styles.hiveCardHeaderBtn}
                      onClick={() => {
                        setExpandedOrderId((prev) => (prev === order.id ? null : order.id));
                      }}
                      aria-expanded={isExpanded}
                      aria-label={`${order.project} order details`}
                    >
                      <div className={styles.hiveCardLeftGroup}>
                        {/* Themed Icon Box */}
                        <div
                          className={`${styles.hiveIconBox} ${
                            isCompleted
                              ? styles.iconBoxGreen
                              : isBlocked
                              ? styles.iconBoxRed
                              : order.status === "REQUEST"
                              ? styles.iconBoxBlue
                              : order.status === "REVIEWING" || order.status === "QUOTED"
                              ? styles.iconBoxAmber
                              : styles.iconBoxPurple
                          }`}
                        >
                          {isCompleted ? (
                            <Check size={15} strokeWidth={2.5} />
                          ) : isBlocked ? (
                            <AlertTriangle size={15} strokeWidth={2} />
                          ) : order.status === "REQUEST" ? (
                            <TeamDuotoneIcon size={16} />
                          ) : order.status === "DISPATCHED" ? (
                            <DocumentsDuotoneIcon size={16} />
                          ) : (
                            <CalendarDuotoneIcon size={16} />
                          )}
                        </div>

                        <div className={styles.hiveCardTextStack}>
                          <strong className={styles.hiveCardTitle}>
                            {order.id} · 10:30 - 11:30
                          </strong>
                          <span className={styles.hiveCardSubtitle}>
                            {order.project} · {order.items.length} materials
                          </span>
                        </div>
                      </div>

                      <div className={styles.hiveCardRightGroup}>
                        <span
                          className={`${styles.hiveStatusPill} ${
                            isCompleted
                              ? styles.pillGreen
                              : isBlocked
                              ? styles.pillRed
                              : styles.pillGrey
                          }`}
                        >
                          {isCompleted
                            ? "Done"
                            : isBlocked
                            ? "Blocked"
                            : "Scheduled"}
                        </span>
                        <ChevronDown
                          size={13}
                          className={`${styles.hiveChevronIcon} ${
                            isExpanded ? styles.hiveChevronRotated : ""
                          }`}
                        />
                      </div>
                    </button>

                    {/* Expanded Details Body */}
                    {isExpanded && (
                      <div className={styles.hiveExpandedBody}>
                        {/* Description Paragraph */}
                        <p className={styles.hiveExpandedDesc}>
                          {order.notes ||
                            "Review the revised spatial plan, material direction, and decisions needed before the drawing package advances."}
                        </p>

                        {/* Minimal Assignee Row */}
                        <div className={styles.hiveMinimalUserRow}>
                          <div className={styles.hiveMinimalUserLeft}>
                            <span className={styles.hiveMinimalAvatar}>
                              {initials}
                            </span>
                            <div className={styles.hiveMinimalUserInfo}>
                              <div className={styles.hiveMinimalUserNameGroup}>
                                <strong className={styles.hiveMinimalUserName}>
                                  {order.customer}
                                </strong>
                                <span className={styles.hiveMinimalUserRole}>
                                  • Lead Contractor
                                </span>
                              </div>
                              <span className={styles.hiveMinimalLocation}>
                                <MapPin size={10} />
                                <span>{order.deliveryLocation.split(",")[0]}, Kerala</span>
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className={styles.hiveMinimalPhoneBtn}
                            aria-label={`Contact ${order.customer}`}
                            onClick={() => window.open(`tel:${order.phone}`)}
                          >
                            <Phone size={12} />
                          </button>
                        </div>

                        {/* Minimal Project & Milestone Status Row */}
                        <div className={styles.hiveMinimalProjectRow}>
                          <div className={styles.hiveMinimalProjectLeft}>
                            <Building2 size={13} className={styles.hiveMinimalProjectIcon} />
                            <strong className={styles.hiveMinimalProjectName}>
                              {order.project}
                            </strong>
                          </div>
                          <span
                            className={`${styles.hiveStatusPill} ${
                              order.needsAttention ? styles.pillRed : styles.pillAmber
                            }`}
                          >
                            {order.needsAttention ? "Overdue" : `₹${(orderValue / 100000).toFixed(2)}L`}
                          </span>
                        </div>

                        {/* Open in Workspace Action */}
                        <button
                          type="button"
                          className={styles.mockupPanelActionBtn}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            padding: "9px 14px",
                            fontSize: "12.5px",
                            borderRadius: "8px",
                          }}
                          onClick={() => {
                            router.push(`/partner/hub/orders?orderId=${order.id}`);
                          }}
                        >
                          <span>Open in Orders Workspace</span>
                          <ExternalLink size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
