"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  Calendar,
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit2,
  FileText,
  Flag,
  Link2,
  Trash2,
  User,
  X,
} from "lucide-react";
import { ActivityOverlapLayout } from "./schedule-overlap-layout";
import { formatTimeLabel, minutesToTime, timeToMinutes, TimedActivityPosition } from "./schedule-positioning";
import { ScheduleActivityItem, ScheduleSlotSelection } from "./schedule-types";
import { getWorkstreamColorTheme } from "../timeline/gantt/phase-colors";
import styles from "./schedule.module.css";

export interface TimedActivityProps {
  activity: ScheduleActivityItem;
  position: TimedActivityPosition;
  overlap: ActivityOverlapLayout;
  isSelected: boolean;
  hasActiveSelection?: boolean;
  alignLeft?: boolean;
  onSelect: (activity: ScheduleActivityItem) => void;
  onEdit?: (activity: ScheduleActivityItem) => void;
  onDelete?: (activityId: string) => void;
}

function getStatusClass(status: ScheduleActivityItem["status"]): string {
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

export function ActivityHoverCard({
  activity,
  timeLabel,
  alignLeft = false,
}: {
  activity: ScheduleActivityItem;
  timeLabel: string;
  alignLeft?: boolean;
}) {
  const theme = getWorkstreamColorTheme(activity.workstream);
  const progressVal = activity.progressPercent ?? 65;
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [shouldAlignLeft, setShouldAlignLeft] = React.useState(alignLeft);

  React.useLayoutEffect(() => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    if (rect.right > viewportWidth - 20 || alignLeft) {
      setShouldAlignLeft(true);
    } else {
      setShouldAlignLeft(false);
    }
  }, [alignLeft]);

  return (
    <div
      ref={cardRef}
      className={`${styles.activityHoverCard} ${
        shouldAlignLeft ? styles.activityHoverCardLeft : ""
      }`}
      role="tooltip"
    >
      <div className={styles.hoverCardHeader}>
        <span
          className={styles.hoverCardBadge}
          style={{
            backgroundColor: theme.lightBg,
            color: theme.text,
            border: `1px solid ${theme.progressFill}`,
          }}
        >
          {activity.workstream}
        </span>
        <span className={`${styles.hoverCardStatus} ${getStatusClass(activity.status)}`}>
          {activity.status}
        </span>
      </div>

      <h4 className={styles.hoverCardTitle}>{activity.title}</h4>

      <div className={styles.hoverCardMetaRow}>
        <div className={styles.hoverCardMetaItem}>
          <Clock3 size={12} className={styles.hoverCardMetaIcon} />
          <span>{timeLabel || "All Day"}</span>
        </div>
        <div className={styles.hoverCardMetaItem}>
          <CalendarRange size={12} className={styles.hoverCardMetaIcon} />
          <span>{activity.startDate}</span>
        </div>
      </div>

      <div className={styles.hoverCardFooter}>
        <div className={styles.hoverCardOwner}>
          <span className={styles.hoverCardAvatar}>{activity.ownerInitials}</span>
          <span className={styles.hoverCardOwnerName}>{activity.owner}</span>
        </div>
        <div className={styles.hoverCardProgressWrap}>
          <div className={styles.hoverCardProgressBar}>
            <div
              className={styles.hoverCardProgressFill}
              style={{
                width: `${progressVal}%`,
                backgroundColor: theme.progressFill,
              }}
            />
          </div>
          <span className={styles.hoverCardProgressText}>{progressVal}%</span>
        </div>
      </div>
    </div>
  );
}

export function ExpandedActivityCard({
  activity,
  timeLabel,
  alignLeft = false,
  onClose,
  onEdit,
  onDelete,
}: {
  activity: ScheduleActivityItem;
  timeLabel: string;
  alignLeft?: boolean;
  onClose: () => void;
  onEdit?: (activity: ScheduleActivityItem) => void;
  onDelete?: (activityId: string) => void;
}) {
  const theme = getWorkstreamColorTheme(activity.workstream);
  const progressVal = activity.progressPercent ?? 35;
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [positionStyle, setPositionStyle] = React.useState<React.CSSProperties>({});
  const [shouldAlignLeft, setShouldAlignLeft] = React.useState(alignLeft);

  const [isEditing, setIsEditing] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(activity.title);
  const [editType, setEditType] = React.useState<ScheduleActivityItem["type"]>(activity.type);
  const [editStatus, setEditStatus] = React.useState<ScheduleActivityItem["status"]>(activity.status);
  const [editPhase, setEditPhase] = React.useState<ScheduleActivityItem["phase"]>(activity.phase);
  const [editWorkstream, setEditWorkstream] = React.useState<ScheduleActivityItem["workstream"]>(activity.workstream);
  const [editStartDate, setEditStartDate] = React.useState(activity.startDate);
  const [editStartTime, setEditStartTime] = React.useState(activity.startTime || "09:00");
  const [editEndTime, setEditEndTime] = React.useState(activity.endTime || "17:00");
  const [editOwner, setEditOwner] = React.useState(activity.owner || "Arun Mehta");

  React.useLayoutEffect(() => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (rect.right > viewportWidth - 20 || alignLeft) {
      setShouldAlignLeft(true);
    } else {
      setShouldAlignLeft(false);
    }

    const bottomMargin = 70;
    const overflowBottom = rect.bottom - (viewportHeight - bottomMargin);

    if (overflowBottom > 0) {
      setPositionStyle({
        top: `calc(-6px - ${overflowBottom}px)`,
      });
    }

    const timer = setTimeout(() => {
      cardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }, 60);

    return () => clearTimeout(timer);
  }, [alignLeft, isEditing]);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    onEdit?.({
      ...activity,
      title: editTitle.trim(),
      type: editType,
      status: editStatus,
      phase: editPhase,
      workstream: editWorkstream,
      startDate: editStartDate,
      endDate: editStartDate,
      startTime: editStartTime,
      endTime: editEndTime,
      owner: editOwner,
      ownerInitials: editOwner
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    });
    onClose();
  };

  if (isEditing) {
    return (
      <div
        ref={cardRef}
        className={`${styles.createActivityPopoverCard} ${
          shouldAlignLeft ? styles.createActivityPopoverCardLeft : ""
        }`}
        style={positionStyle}
        role="dialog"
        aria-label={`Edit activity ${activity.title}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.expandedCardHeader}>
          <div>
            <h3 className={styles.createCardHeaderTitle}>Edit activity</h3>
            <span className={styles.createCardHeaderSub}>{activity.id}</span>
          </div>
          <button
            type="button"
            className={styles.expandedCardCloseBtn}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close edit activity popover"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSaveEdit} className={styles.createCardForm}>
          <div className={styles.createFormField}>
            <label className={styles.createFormLabel}>Title</label>
            <input
              type="text"
              className={styles.createFormInput}
              placeholder="e.g. Roof slab casting"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className={styles.createFormRow}>
            <div className={styles.createFormField}>
              <label className={styles.createFormLabel}>Type</label>
              <CustomThemeSelect<ScheduleActivityItem["type"]>
                value={editType}
                options={[
                  { value: "Site task", label: "Site task" },
                  { value: "Milestone", label: "Milestone" },
                  { value: "Approval", label: "Approval task" },
                  { value: "Procurement", label: "Procurement" },
                  { value: "Inspection", label: "Inspection" },
                  { value: "Meeting", label: "Meeting" },
                ]}
                onChange={(val) => setEditType(val)}
              />
            </div>

            <div className={styles.createFormField}>
              <label className={styles.createFormLabel}>Status</label>
              <CustomThemeSelect<ScheduleActivityItem["status"]>
                value={editStatus}
                options={[
                  { value: "Scheduled", label: "Scheduled" },
                  { value: "In progress", label: "In progress" },
                  { value: "Pending approval", label: "Pending approval" },
                  { value: "Completed", label: "Completed" },
                  { value: "Blocked", label: "Blocked" },
                  { value: "Delayed", label: "Delayed" },
                ]}
                onChange={(val) => setEditStatus(val)}
              />
            </div>
          </div>

          <div className={styles.createFormRow}>
            <div className={styles.createFormField}>
              <label className={styles.createFormLabel}>Phase</label>
              <CustomThemeSelect<string>
                value={editPhase}
                options={[
                  { value: "Pre-design", label: "Pre-design" },
                  { value: "Design", label: "Design" },
                  { value: "Procurement", label: "Procurement" },
                  { value: "Construction", label: "Construction" },
                  { value: "Handover", label: "Handover" },
                ]}
                onChange={(val) => setEditPhase(val)}
              />
            </div>

            <div className={styles.createFormField}>
              <label className={styles.createFormLabel}>Workstream</label>
              <CustomThemeSelect<ScheduleActivityItem["workstream"]>
                value={editWorkstream}
                options={[
                  { value: "Architecture", label: "Architecture" },
                  { value: "Structure", label: "Structure" },
                  { value: "MEP", label: "MEP" },
                  { value: "Procurement", label: "Procurement" },
                  { value: "Site execution", label: "Site execution" },
                  { value: "Client approvals", label: "Client approvals" },
                ]}
                onChange={(val) => setEditWorkstream(val)}
              />
            </div>
          </div>

          <div className={styles.createFormRow}>
            <div className={styles.createFormField}>
              <label className={styles.createFormLabel}>Date</label>
              <CustomThemeDatePicker
                value={editStartDate}
                onChange={(val) => setEditStartDate(val)}
              />
            </div>

            <div className={styles.createFormField}>
              <label className={styles.createFormLabel}>Owner</label>
              <input
                type="text"
                className={styles.createFormInput}
                value={editOwner}
                onChange={(e) => setEditOwner(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.createFormRow}>
            <div className={styles.createFormField}>
              <label className={styles.createFormLabel}>Start time</label>
              <CustomThemeSelect<string>
                value={editStartTime}
                options={SCHEDULE_TIME_OPTIONS}
                onChange={(val) => setEditStartTime(val)}
              />
            </div>

            <div className={styles.createFormField}>
              <label className={styles.createFormLabel}>End time</label>
              <CustomThemeSelect<string>
                value={editEndTime}
                options={SCHEDULE_TIME_OPTIONS}
                onChange={(val) => setEditEndTime(val)}
              />
            </div>
          </div>

          <div className={styles.createCardActions}>
            <button
              type="button"
              className={styles.createCancelBtn}
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button type="submit" className={styles.createSaveBtn}>
              Save Activity
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className={`${styles.expandedActivityCard} ${
        shouldAlignLeft ? styles.expandedActivityCardLeft : ""
      }`}
      style={positionStyle}
      role="dialog"
      aria-label={`Activity details for ${activity.title}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.expandedCardHeader}>
        <span className={styles.expandedCardHeaderId}>Activity details</span>
        <button
          type="button"
          className={styles.expandedCardCloseBtn}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close details card"
        >
          <X size={15} />
        </button>
      </div>

      <div className={styles.expandedCardSubHeader}>
        <span className={`${styles.hoverCardStatus} ${getStatusClass(activity.status)}`}>
          {activity.status}
        </span>
      </div>

      <h3 className={styles.expandedCardTitle}>{activity.title}</h3>

      <div className={styles.expandedCardBadgeRow}>
        <span
          className={styles.hoverCardBadge}
          style={{
            backgroundColor: theme.lightBg,
            color: theme.text,
            border: `1px solid ${theme.progressFill}`,
          }}
        >
          {activity.workstream}
        </span>
      </div>

      <div className={styles.expandedCardDetailsList}>
        <div className={styles.expandedDetailRow}>
          <span className={styles.expandedDetailLabel}>
            <CalendarRange size={13} /> Date
          </span>
          <span className={styles.expandedDetailValue}>{activity.startDate}</span>
        </div>

        <div className={styles.expandedDetailRow}>
          <span className={styles.expandedDetailLabel}>
            <Clock3 size={13} /> Time
          </span>
          <span className={styles.expandedDetailValue}>
            {timeLabel || (activity.allDay ? "All Day" : "Full Day")}
          </span>
        </div>

        <div className={styles.expandedDetailRow}>
          <span className={styles.expandedDetailLabel}>
            <User size={13} /> Owner
          </span>
          <span className={styles.expandedDetailValue}>{activity.owner}</span>
        </div>

        <div className={styles.expandedDetailRow}>
          <span className={styles.expandedDetailLabel}>
            <CheckCircle2 size={13} /> Type and phase
          </span>
          <span className={styles.expandedDetailValue}>
            {activity.type}, {activity.phase}
          </span>
        </div>

        <div className={styles.expandedDetailRow}>
          <span className={styles.expandedDetailLabel}>
            <Link2 size={13} /> Dependency
          </span>
          <span className={styles.expandedDetailValue}>
            {activity.dependency || "No dependency"}
          </span>
        </div>

        <div className={styles.expandedDetailRow}>
          <span className={styles.expandedDetailLabel}>
            <FileText size={13} /> Linked record
          </span>
          <span className={styles.expandedDetailValue}>
            {activity.linkedDocument || "No linked record"}
          </span>
        </div>
      </div>

      <div className={styles.expandedCardProgressSection}>
        <div className={styles.expandedProgressHeader}>
          <span>Progress</span>
          <span className={styles.expandedProgressPercent}>{progressVal}%</span>
        </div>
        <div className={styles.expandedProgressBar}>
          <div
            className={styles.expandedProgressFill}
            style={{
              width: `${progressVal}%`,
              backgroundColor: "#2563eb",
            }}
          />
        </div>
      </div>

      <div className={styles.expandedCardActions}>
        <button
          type="button"
          className={styles.expandedDeleteBtn}
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(activity.id);
          }}
        >
          <Trash2 size={13} />
          Delete
        </button>

        <button
          type="button"
          className={styles.expandedEditBtn}
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          <Edit2 size={13} />
          Edit
        </button>
      </div>
    </div>
  );
}

export const SCHEDULE_TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const totalMins = i * 30;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  const timeVal = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const h12 = h % 12 || 12;
  const ampm = h >= 12 ? "PM" : "AM";
  const label = `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
  return { value: timeVal, label };
});

export function CustomThemeSelect<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (val: T) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.customSelectContainer} ref={containerRef}>
      <button
        type="button"
        className={`${styles.customSelectTrigger} ${
          isOpen ? styles.customSelectTriggerOpen : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label ?? value}</span>
        <ChevronDown
          size={13}
          className={`${styles.customSelectChevron} ${
            isOpen ? styles.chevronRotated : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className={styles.customSelectMenu} role="listbox">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                className={`${styles.customSelectOption} ${
                  isSelected ? styles.customSelectOptionSelected : ""
                }`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={isSelected}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <Check size={13} className={styles.customSelectCheck} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CustomThemeDatePicker({
  value,
  onChange,
}: {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const parsedDate = React.useMemo(() => {
    if (!value) return new Date();
    const [y, m, d] = value.split("-").map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d);
  }, [value]);

  const [viewYear, setViewYear] = useState(parsedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedDate.getMonth());

  React.useEffect(() => {
    setViewYear(parsedDate.getFullYear());
    setViewMonth(parsedDate.getMonth());
  }, [parsedDate]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const calendarDays = React.useMemo(() => {
    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const prevDay = daysInPrevMonth - i;
      const prevDate = new Date(viewYear, viewMonth - 1, prevDay);
      const y = prevDate.getFullYear();
      const m = String(prevDate.getMonth() + 1).padStart(2, "0");
      const d = String(prevDay).padStart(2, "0");
      days.push({
        dateStr: `${y}-${m}-${d}`,
        dayNum: prevDay,
        isCurrentMonth: false,
      });
    }

    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const curDate = new Date(viewYear, viewMonth, d);
      const y = curDate.getFullYear();
      const m = String(curDate.getMonth() + 1).padStart(2, "0");
      const dayFormatted = String(d).padStart(2, "0");
      days.push({
        dateStr: `${y}-${m}-${dayFormatted}`,
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(viewYear, viewMonth + 1, d);
      const y = nextDate.getFullYear();
      const m = String(nextDate.getMonth() + 1).padStart(2, "0");
      const dayFormatted = String(d).padStart(2, "0");
      days.push({
        dateStr: `${y}-${m}-${dayFormatted}`,
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  const todayStr = React.useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const formatDisplay = (valStr: string) => {
    if (!valStr) return "Select date";
    const [y, m, d] = valStr.split("-").map(Number);
    if (!y || !m || !d) return valStr;
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className={styles.customDatePickerContainer} ref={containerRef}>
      <button
        type="button"
        className={`${styles.customDatePickerTrigger} ${
          isOpen ? styles.customDatePickerTriggerOpen : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{formatDisplay(value)}</span>
        <Calendar size={13} className={styles.customDatePickerIcon} />
      </button>

      {isOpen && (
        <div className={styles.customDatePickerPopover} role="dialog">
          <div className={styles.datePickerHeader}>
            <span className={styles.datePickerTitle}>
              {MONTH_NAMES[viewMonth]}, {viewYear}
            </span>
            <div className={styles.datePickerNav}>
              <button
                type="button"
                className={styles.datePickerNavBtn}
                onClick={handlePrevMonth}
                aria-label="Previous month"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                className={styles.datePickerNavBtn}
                onClick={handleNextMonth}
                aria-label="Next month"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className={styles.datePickerWeekdays}>
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          <div className={styles.datePickerDaysGrid}>
            {calendarDays.map((day) => {
              const isSelected = day.dateStr === value;
              const isToday = day.dateStr === todayStr;

              return (
                <button
                  key={day.dateStr}
                  type="button"
                  className={`${styles.datePickerDayBtn} ${
                    !day.isCurrentMonth ? styles.datePickerOtherMonth : ""
                  } ${isToday ? styles.datePickerToday : ""} ${
                    isSelected ? styles.datePickerSelected : ""
                  }`}
                  onClick={() => {
                    onChange(day.dateStr);
                    setIsOpen(false);
                  }}
                >
                  {day.dayNum}
                </button>
              );
            })}
          </div>

          <div className={styles.datePickerFooter}>
            <button
              type="button"
              className={styles.datePickerClearBtn}
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className={styles.datePickerTodayBtn}
              onClick={() => {
                onChange(todayStr);
                const today = new Date();
                setViewYear(today.getFullYear());
                setViewMonth(today.getMonth());
                setIsOpen(false);
              }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function CreateActivityPopoverCard({
  slot,
  alignLeft = false,
  onClose,
  onSave,
}: {
  slot: ScheduleSlotSelection;
  alignLeft?: boolean;
  onClose: () => void;
  onSave: (activityData: Partial<ScheduleActivityItem>) => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ScheduleActivityItem["type"]>("Site task");
  const [status, setStatus] = useState<ScheduleActivityItem["status"]>("Scheduled");
  const [phase, setPhase] = useState<ScheduleActivityItem["phase"]>("Construction");
  const [workstream, setWorkstream] = useState<ScheduleActivityItem["workstream"]>("Structure");
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState(slot.date);
  const [endDate, setEndDate] = useState(slot.date);
  const [startTime, setStartTime] = useState(slot.startTime);
  const [endTime, setEndTime] = useState(slot.endTime);
  const [owner, setOwner] = useState("Arun Mehta");
  const [dependency, setDependency] = useState("");
  const [linkedDocument, setLinkedDocument] = useState("");

  const cardRef = React.useRef<HTMLDivElement>(null);
  const [positionStyle, setPositionStyle] = React.useState<React.CSSProperties>({});
  const [shouldAlignLeft, setShouldAlignLeft] = React.useState(alignLeft);

  React.useLayoutEffect(() => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (rect.right > viewportWidth - 20 || alignLeft) {
      setShouldAlignLeft(true);
    } else {
      setShouldAlignLeft(false);
    }

    const bottomMargin = 70;
    const overflowBottom = rect.bottom - (viewportHeight - bottomMargin);

    if (overflowBottom > 0) {
      setPositionStyle({
        top: `calc(-6px - ${overflowBottom}px)`,
      });
    }

    const timer = setTimeout(() => {
      cardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }, 60);

    return () => clearTimeout(timer);
  }, [alignLeft]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const normalizedStart = minutesToTime(timeToMinutes(startTime || slot.startTime));
    const startMins = timeToMinutes(normalizedStart);
    const rawEndMins = timeToMinutes(endTime || slot.endTime);
    const endMins = rawEndMins > startMins ? rawEndMins : startMins + 60;
    const normalizedEnd = minutesToTime(endMins);

    onSave({
      title: title.trim(),
      type,
      status,
      phase,
      workstream,
      allDay,
      startDate,
      endDate,
      startTime: normalizedStart,
      endTime: normalizedEnd,
      owner,
      ownerInitials: owner
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
      dependency,
      linkedDocument,
    });
  };

  return (
    <div
      ref={cardRef}
      className={`${styles.createActivityPopoverCard} ${
        shouldAlignLeft ? styles.createActivityPopoverCardLeft : ""
      }`}
      style={positionStyle}
      role="dialog"
      aria-label="Add activity popover"
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.expandedCardHeader}>
        <div>
          <h3 className={styles.createCardHeaderTitle}>Add activity</h3>
          <span className={styles.createCardHeaderSub}>Project schedule</span>
        </div>
        <button
          type="button"
          className={styles.expandedCardCloseBtn}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close add activity popover"
        >
          <X size={15} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.createCardForm}>
        <div className={styles.createFormField}>
          <label className={styles.createFormLabel}>Title</label>
          <input
            type="text"
            className={styles.createFormInput}
            placeholder="e.g. Roof slab casting"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className={styles.createFormRow}>
          <div className={styles.createFormField}>
            <label className={styles.createFormLabel}>Type</label>
            <CustomThemeSelect<ScheduleActivityItem["type"]>
              value={type}
              options={[
                { value: "Site task", label: "Site task" },
                { value: "Milestone", label: "Milestone" },
                { value: "Approval", label: "Approval task" },
                { value: "Procurement", label: "Procurement" },
                { value: "Inspection", label: "Inspection" },
                { value: "Meeting", label: "Meeting" },
              ]}
              onChange={(val) => setType(val)}
            />
          </div>

          <div className={styles.createFormField}>
            <label className={styles.createFormLabel}>Status</label>
            <CustomThemeSelect<ScheduleActivityItem["status"]>
              value={status}
              options={[
                { value: "Scheduled", label: "Scheduled" },
                { value: "In progress", label: "In progress" },
                { value: "Pending approval", label: "Pending approval" },
                { value: "Completed", label: "Completed" },
                { value: "Blocked", label: "Blocked" },
                { value: "Delayed", label: "Delayed" },
              ]}
              onChange={(val) => setStatus(val)}
            />
          </div>
        </div>

        <div className={styles.createFormRow}>
          <div className={styles.createFormField}>
            <label className={styles.createFormLabel}>Phase</label>
            <CustomThemeSelect<string>
              value={phase}
              options={[
                { value: "Pre-design", label: "Pre-design" },
                { value: "Design", label: "Design" },
                { value: "Procurement", label: "Procurement" },
                { value: "Construction", label: "Construction" },
                { value: "Handover", label: "Handover" },
              ]}
              onChange={(val) => setPhase(val)}
            />
          </div>

          <div className={styles.createFormField}>
            <label className={styles.createFormLabel}>Workstream</label>
            <CustomThemeSelect<ScheduleActivityItem["workstream"]>
              value={workstream}
              options={[
                { value: "Architecture", label: "Architecture" },
                { value: "Structure", label: "Structure" },
                { value: "MEP", label: "MEP" },
                { value: "Procurement", label: "Procurement" },
                { value: "Site execution", label: "Site execution" },
                { value: "Client approvals", label: "Client approvals" },
              ]}
              onChange={(val) => setWorkstream(val)}
            />
          </div>
        </div>

        <div className={styles.createFormRow}>
          <div className={styles.createFormField}>
            <label className={styles.createFormLabel}>Date</label>
            <CustomThemeDatePicker
              value={startDate}
              onChange={(val) => {
                setStartDate(val);
                setEndDate(val);
              }}
            />
          </div>

          <div className={styles.createFormField}>
            <label className={styles.createFormLabel}>Owner</label>
            <input
              type="text"
              className={styles.createFormInput}
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            />
          </div>
        </div>

        {!allDay && (
          <div className={styles.createFormRow}>
            <div className={styles.createFormField}>
              <label className={styles.createFormLabel}>Start time</label>
              <CustomThemeSelect
                value={startTime}
                options={SCHEDULE_TIME_OPTIONS}
                onChange={(val) => setStartTime(val)}
              />
            </div>

            <div className={styles.createFormField}>
              <label className={styles.createFormLabel}>End time</label>
              <CustomThemeSelect
                value={endTime}
                options={SCHEDULE_TIME_OPTIONS}
                onChange={(val) => setEndTime(val)}
              />
            </div>
          </div>
        )}

        <div className={styles.createCardActions}>
          <button
            type="button"
            className={styles.createCancelBtn}
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className={styles.createSaveBtn}>
            Save Activity
          </button>
        </div>
      </form>
    </div>
  );
}

export function TimedActivity({
  activity,
  position,
  overlap,
  isSelected,
  hasActiveSelection = false,
  alignLeft,
  onSelect,
  onEdit,
  onDelete,
}: TimedActivityProps) {
  const [isHovered, setIsHovered] = useState(false);
  const widthPercent = 100 / overlap.columnCount;
  const leftPercent = widthPercent * overlap.columnIndex;
  const horizontalInset = overlap.columnCount === 1 ? 4 : 3;
  const isCompact = position.height < 52 || overlap.columnCount >= 3;
  const isMilestone = activity.type === "Milestone";
  const isWarning =
    activity.status === "Pending approval" ||
    activity.status === "Blocked" ||
    activity.status === "Delayed";
  const timeLabel =
    activity.startTime && activity.endTime
      ? `${formatTimeLabel(activity.startTime)}\u2013${formatTimeLabel(
          activity.endTime
        )}`
      : "";

  const theme = getWorkstreamColorTheme(activity.workstream);
  const effectiveAlignLeft = alignLeft ?? overlap.columnIndex >= 2;

  return (
    <div
      className={styles.timedActivityWrapper}
      style={{
        top: position.top,
        height: position.height,
        left: `calc(${leftPercent}% + ${horizontalInset}px)`,
        width: `calc(${widthPercent}% - ${horizontalInset * 2}px)`,
        zIndex: isSelected ? 99999 : isHovered && !hasActiveSelection ? 9999 : 5,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <button
        type="button"
        className={`${styles.timedActivity} ${getStatusClass(activity.status)} ${
          isMilestone ? styles.eventMilestone : ""
        } ${isSelected ? styles.eventSelected : ""} ${
          isCompact ? styles.eventCompact : ""
        } ${position.edge ? styles.eventOutsideRange : ""}`}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: theme.lightBg,
          borderColor: theme.progressFill,
          color: theme.text,
        }}
        disabled={hasActiveSelection && !isSelected}
        onClick={(event) => {
          event.stopPropagation();
          if (!hasActiveSelection || isSelected) {
            onSelect(activity);
          }
        }}
        aria-label={`${activity.title}, ${timeLabel}, ${activity.status}`}
        data-activity-id={activity.id}
      >
        <span className={styles.eventTitleRow}>
          {isMilestone ? (
            <Flag size={12} aria-hidden="true" />
          ) : isWarning ? (
            <AlertCircle size={12} aria-hidden="true" />
          ) : (
            <Clock3 size={11} aria-hidden="true" />
          )}
          <span className={styles.eventTitle}>{activity.title}</span>
        </span>

        <span className={styles.eventTime}>
          {position.edge === "before"
            ? `Before ${formatTimeLabel(activity.endTime ?? "08:00")}`
            : position.edge === "after"
            ? `After ${formatTimeLabel(activity.startTime ?? "18:00")}`
            : timeLabel}
        </span>

        {!isCompact && (
          <span className={styles.eventFooter}>
            <span className={styles.eventWorkstream}>{activity.workstream}</span>
            <span className={styles.eventOwner}>
              <span className={styles.eventAvatar}>{activity.ownerInitials}</span>
              <span className={styles.eventOwnerName}>{activity.owner}</span>
            </span>
          </span>
        )}

        {(position.clippedAtStart || position.clippedAtEnd) && (
          <span className={styles.visuallyHidden}>
            This activity extends outside the visible time range.
          </span>
        )}
      </button>

      {isSelected ? (
        <ExpandedActivityCard
          activity={activity}
          timeLabel={timeLabel}
          alignLeft={effectiveAlignLeft}
          onClose={() => onSelect(activity)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        isHovered && !hasActiveSelection && (
          <ActivityHoverCard
            activity={activity}
            timeLabel={timeLabel}
            alignLeft={effectiveAlignLeft}
          />
        )
      )}
    </div>
  );
}
