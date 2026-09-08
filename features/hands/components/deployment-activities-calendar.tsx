"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Layers,
  BarChart3,
  Edit2,
  Filter,
  Info,
} from "lucide-react";
import type { Deployment, DeploymentActivityTask, DeploymentContractor } from "../types/hands.types";
import { UpdateTaskModal } from "./update-task-modal";
import { CancelTaskModal } from "./cancel-task-modal";
import { NILA_GANTT_PHASES } from "../utils/deployment-boq-gantt-data";

interface DeploymentActivitiesCalendarProps {
  tasks: DeploymentActivityTask[];
  contractors: DeploymentContractor[];
  deployment: Deployment;
  onAddTaskClick: (date?: string) => void;
  onUpdateTask: (task: DeploymentActivityTask) => void;
  onCancelTask: (taskId: string, reason: string) => void;
  onToggleStatus: (taskId: string) => void;
  variant?: "default" | "partner";
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
}

function getContractorVisual(name: string) {
  const n = name.toLowerCase();
  if (n.includes("apex")) return { color: "#ea580c", bgLight: "#fff7ed", border: "#ffedd5", dot: "#ea580c" };
  if (n.includes("malabar")) return { color: "#0d9488", bgLight: "#f0fdfa", border: "#ccfbf1", dot: "#0d9488" };
  if (n.includes("supervis") || n.includes("site super")) return { color: "#4f46e5", bgLight: "#eef2ff", border: "#e0e7ff", dot: "#4f46e5" };
  if (n.includes("chroma")) return { color: "#be123c", bgLight: "#fff1f2", border: "#ffe4e6", dot: "#be123c" };
  if (n.includes("circuit")) return { color: "#0284c7", bgLight: "#f0f9ff", border: "#e0f2fe", dot: "#0284c7" };
  return { color: "#334155", bgLight: "#f8fafc", border: "#e2e8f0", dot: "#64748b" };
}

function getStatusVisual(status: string) {
  switch (status) {
    case "in-progress":
      return {
        color: "#c2410c",
        bgLight: "#fff7ed",
        border: "#fed7aa",
        dot: "#ea580c",
      };
    case "scheduled":
      return {
        color: "#0284c7",
        bgLight: "#f0f9ff",
        border: "#bae6fd",
        dot: "#0284c7",
      };
    case "completed":
      return {
        color: "#15803d",
        bgLight: "#f0fdf4",
        border: "#bbf7d0",
        dot: "#16a34a",
      };
    case "cancelled":
      return {
        color: "#b91c1c",
        bgLight: "#fef2f2",
        border: "#fecaca",
        dot: "#dc2626",
      };
    default:
      return {
        color: "#475569",
        bgLight: "#f8fafc",
        border: "#e2e8f0",
        dot: "#64748b",
      };
  }
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function DeploymentActivitiesCalendar({
  tasks,
  contractors,
  deployment,
  onAddTaskClick,
  onUpdateTask,
  onCancelTask,
  onToggleStatus,
  variant = "default",
  selectedDate: controlledSelectedDate,
  onSelectDate,
}: DeploymentActivitiesCalendarProps) {
  const isPartner = variant === "partner";
  const [internalSelectedDate, setInternalSelectedDate] = useState<string>("2026-09-08");
  const selectedDate = controlledSelectedDate !== undefined ? controlledSelectedDate : internalSelectedDate;

  const handleSelectDate = (dateStr: string) => {
    setInternalSelectedDate(dateStr);
    onSelectDate?.(dateStr);
  };
  const [contractorFilter, setContractorFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");

  const [editingTask, setEditingTask] = useState<DeploymentActivityTask | null>(null);
  const [cancellingTask, setCancellingTask] = useState<DeploymentActivityTask | null>(null);

  const resolveContractorName = React.useCallback(
    (task: DeploymentActivityTask): string => {
      if (task.contractorName) return task.contractorName;
      const tradeLower = (task.trade || "").toLowerCase();
      const titleLower = (task.title || "").toLowerCase();
      if (
        tradeLower.includes("mason") ||
        titleLower.includes("mason") ||
        titleLower.includes("brick")
      ) {
        const c = contractors.find(
          (item) =>
            item.trade?.toLowerCase().includes("mason") ||
            item.name.toLowerCase().includes("apex"),
        );
        return c?.name || contractors[0]?.name || "Apex Integrated Civil";
      }
      if (
        tradeLower.includes("helper") ||
        tradeLower.includes("mortar") ||
        tradeLower.includes("staging") ||
        titleLower.includes("mortar") ||
        titleLower.includes("staging")
      ) {
        const c = contractors.find(
          (item) =>
            item.trade?.toLowerCase().includes("helper") ||
            item.name.toLowerCase().includes("malabar"),
        );
        return c?.name || contractors[1]?.name || contractors[0]?.name || "Malabar Site Crew";
      }
      if (
        tradeLower.includes("supervis") ||
        titleLower.includes("lintel") ||
        titleLower.includes("rebar") ||
        titleLower.includes("inspect")
      ) {
        return "Site Supervision";
      }
      return contractors[0]?.name || "Apex Integrated Civil";
    },
    [contractors],
  );

  // Filter tasks based on contractor, status, and Gantt phase
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (contractorFilter !== "all") {
        const cName = resolveContractorName(t);
        if (!cName.toLowerCase().includes(contractorFilter.toLowerCase())) {
          return false;
        }
      }
      if (statusFilter !== "all" && t.status !== statusFilter) {
        return false;
      }
      if (phaseFilter !== "all" && t.ganttPhaseId !== phaseFilter) {
        return false;
      }
      return true;
    });
  }, [tasks, contractorFilter, statusFilter, phaseFilter, resolveContractorName]);

  // Tasks mapped by date string "YYYY-MM-DD"
  const tasksByDate = useMemo(() => {
    const map: Record<string, DeploymentActivityTask[]> = {};
    filteredTasks.forEach((t) => {
      const d = t.date || "2026-09-08";
      if (!map[d]) map[d] = [];
      map[d].push(t);
    });
    return map;
  }, [filteredTasks]);

  // Calendar month days for September 2026 (30 days, Sep 1 is Tuesday -> 1 padding day on Monday)
  const calendarDays = useMemo(() => {
    const days: Array<{ dayNum: number; dateStr: string; isCurrentMonth: boolean }> = [];
    // August 31 (Monday pad)
    days.push({ dayNum: 31, dateStr: "2026-08-31", isCurrentMonth: false });
    // September 1 to 30
    for (let i = 1; i <= 30; i++) {
      const dayPad = i < 10 ? `0${i}` : `${i}`;
      days.push({ dayNum: i, dateStr: `2026-09-${dayPad}`, isCurrentMonth: true });
    }
    // October 1 to 4 (pad to 35 cells = 5 weeks)
    for (let i = 1; i <= 4; i++) {
      const dayPad = `0${i}`;
      days.push({ dayNum: i, dateStr: `2026-10-${dayPad}`, isCurrentMonth: false });
    }
    return days;
  }, []);

  // Tasks for the currently selected date
  const selectedDateTasks = useMemo(() => {
    return tasksByDate[selectedDate] || [];
  }, [tasksByDate, selectedDate]);

  // Formatted date string for selected date
  const selectedDateFormatted = useMemo(() => {
    try {
      const [year, month, day] = selectedDate.split("-").map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
      }}
    >
      {/* ── Top Header & Navigation Bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          padding: "16px 20px",
          borderBottom: "1px solid #f1f5f9",
          backgroundColor: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              backgroundColor: "#0f172a",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CalendarIcon size={18} />
          </div>
          <div>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>Site Activities &amp; Task Calendar</span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 650,
                  backgroundColor: "#f0fdf4",
                  color: "#15803d",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  border: "1px solid #bbf7d0",
                }}
              >
                ● Live Execution Schedule
              </span>
            </h2>
            <p style={{ fontSize: "11.5px", color: "#64748b", margin: "2px 0 0" }}>
              Labour tasks mapped to BOQ line items and Gantt milestones for {deployment.projectName}
            </p>
          </div>
        </div>

        {/* Action Buttons & Month Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Month Switcher */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              backgroundColor: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "2px 4px",
            }}
          >
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => handleSelectDate("2026-08-31")}
              style={{
                background: "none",
                border: "none",
                color: "#64748b",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "4px",
                display: "flex",
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", padding: "0 8px" }}>
              September 2026
            </span>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => handleSelectDate("2026-10-01")}
              style={{
                background: "none",
                border: "none",
                color: "#64748b",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "4px",
                display: "flex",
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleSelectDate("2026-09-08")}
            style={{
              height: "32px",
              padding: "0 12px",
              fontSize: "12px",
              fontWeight: 650,
              backgroundColor: selectedDate === "2026-09-08" ? "#0f172a" : "#ffffff",
              color: selectedDate === "2026-09-08" ? "#ffffff" : "#475569",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Today (Sep 8)
          </button>

          <button
            type="button"
            onClick={() => onAddTaskClick(selectedDate)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              height: "32px",
              padding: "0 12px",
              backgroundColor: "#0f172a",
              color: "#ffffff",
              border: "1px solid #0f172a",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 650,
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
            }}
          >
            <Plus size={14} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* ── Filter Toolbar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isPartner ? "flex-end" : "space-between",
          flexWrap: "wrap",
          gap: "10px",
          padding: "10px 20px",
          backgroundColor: "#f8fafc",
          borderBottom: "1px solid #f1f5f9",
          fontSize: "11.5px",
        }}
      >
        {/* Contractor Filter (hidden in partner view) */}
        {!isPartner && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 650, color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
              <Filter size={12} />
              Filter by Contractor:
            </span>
            {[
              { id: "all", label: "All Contractors" },
              ...contractors.map((c) => ({ id: c.name, label: c.name })),
              { id: "Site Supervision", label: "Site Supervision" },
            ].map((item) => {
              const isSelected = contractorFilter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setContractorFilter(item.id)}
                  style={{
                    padding: "3px 9px",
                    fontSize: "11.5px",
                    fontWeight: isSelected ? 700 : 500,
                    borderRadius: "9999px",
                    border: isSelected ? "1px solid #0f172a" : "1px solid #cbd5e1",
                    backgroundColor: isSelected ? "#0f172a" : "#ffffff",
                    color: isSelected ? "#ffffff" : "#475569",
                    cursor: "pointer",
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Status & Gantt Filter Selectors */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Status filter */}
          <select
            aria-label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "4px 8px",
              fontSize: "11.5px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#ffffff",
              color: "#334155",
              outline: "none",
            }}
          >
            <option value="all">All Statuses ({tasks.length})</option>
            <option value="in-progress">In Progress</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Gantt Phase filter */}
          <select
            aria-label="Filter by Gantt Phase"
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            style={{
              padding: "4px 8px",
              fontSize: "11.5px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#ffffff",
              color: "#334155",
              outline: "none",
              maxWidth: "180px",
            }}
          >
            <option value="all">All Gantt Phases</option>
            {NILA_GANTT_PHASES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Interactive Month Grid ── */}
      <div style={{ padding: "16px 20px" }}>
        {/* Days of week */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: "8px",
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          {DAYS_OF_WEEK.map((dw, idx) => {
            const isWeekend = idx >= 5;
            return (
              <div
                key={dw}
                style={{
                  fontSize: "11px",
                  fontWeight: 750,
                  color: isWeekend ? "#94a3b8" : "#475569",
                  padding: "6px 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                  backgroundColor: isWeekend ? "#f8fafc" : "transparent",
                  borderRadius: "6px",
                }}
              >
                {dw}
              </div>
            );
          })}
        </div>

        {/* 5-week month cells */}
        {isPartner && (
          <style>{`
            .partner-calendar-cell {
              position: relative !important;
              transition: box-shadow 140ms ease !important;
            }
            .partner-calendar-cell:hover {
              box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05) !important;
              z-index: 2 !important;
            }
            .partner-calendar-cell .partner-cell-add-btn {
              opacity: 0;
              transition: opacity 140ms ease;
              pointer-events: none;
            }
            .partner-calendar-cell:hover .partner-cell-add-btn {
              opacity: 1;
              pointer-events: auto;
            }
            /* Do not fill with black color on hover; maintain clean outline style */
            .partner-cell-add-btn:hover {
              background-color: #ffffff !important;
              border-color: #64748b !important;
              color: #475569 !important;
            }
          `}</style>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: "8px",
          }}
        >
          {calendarDays.map((cell) => {
            const isToday = cell.dateStr === "2026-09-08";
            const dayTasks = tasksByDate[cell.dateStr] || [];
            const isSelected = isPartner
              ? cell.dateStr === selectedDate && dayTasks.length > 0
              : cell.dateStr === selectedDate;

            const handleCellClick = () => {
              if (isPartner && dayTasks.length === 0) {
                // Click on empty column directly opens overlay without displaying selected
                onAddTaskClick?.(cell.dateStr);
              } else {
                handleSelectDate(cell.dateStr);
              }
            };

            return (
              <div
                key={cell.dateStr}
                role="button"
                tabIndex={0}
                className={isPartner ? "partner-calendar-cell" : undefined}
                data-selected={isSelected ? "true" : "false"}
                data-today={isToday ? "true" : "false"}
                onClick={handleCellClick}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCellClick();
                  }
                }}
                aria-label={`${cell.dateStr}: ${dayTasks.length} tasks scheduled`}
                style={{
                  minHeight: "92px",
                  borderRadius: "10px",
                  padding: "7px 8px",
                  backgroundColor: isSelected
                    ? (isPartner ? "#f8fafc" : "#eff6ff")
                    : cell.isCurrentMonth
                      ? "#ffffff"
                      : "#f8fafc",
                  border: isSelected
                    ? (isPartner ? "1.5px solid #334155" : "2px solid #2563eb")
                    : isToday
                      ? (isPartner ? "1.5px solid #0f172a" : "2px solid #0f172a")
                      : "1px solid #e2e8f0",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  transition: "all 140ms ease",
                  opacity: cell.isCurrentMonth ? 1 : 0.5,
                  minWidth: 0,
                  overflow: "hidden",
                  boxSizing: "border-box",
                  boxShadow: isSelected
                    ? (isPartner
                        ? "0 2px 6px rgba(15, 23, 42, 0.06)"
                        : "0 0 0 1px #2563eb, 0 4px 12px rgba(37, 99, 235, 0.12)")
                    : "0 1px 2px rgba(15, 23, 42, 0.02)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "5px",
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: isToday ? "11px" : "11.5px",
                      fontWeight: isToday || isSelected ? 800 : 650,
                      width: isToday ? "22px" : "auto",
                      height: isToday ? "22px" : "auto",
                      borderRadius: isToday ? "50%" : "0",
                      backgroundColor: isToday ? "#0f172a" : "transparent",
                      color: isToday
                        ? "#ffffff"
                        : isSelected
                          ? (isPartner ? "#0f172a" : "#1d4ed8")
                          : cell.isCurrentMonth
                            ? "#1e293b"
                            : "#94a3b8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {cell.dayNum}
                  </span>

                  {dayTasks.length > 0 && (
                    <span
                      style={{
                        fontSize: "9.5px",
                        fontWeight: 700,
                        backgroundColor: isSelected
                          ? (isPartner ? "#e2e8f0" : "#dbeafe")
                          : "#f1f5f9",
                        color: isSelected
                          ? (isPartner ? "#0f172a" : "#1e40af")
                          : "#475569",
                        padding: "1px 6px",
                        borderRadius: "9999px",
                        flexShrink: 0,
                      }}
                    >
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                {/* Event Chips (preview) */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "3.5px",
                    flex: 1,
                    minWidth: 0,
                    overflow: "hidden",
                  }}
                >
                  {dayTasks.slice(0, 2).map((task) => {
                    const contractorName = resolveContractorName(task);
                    const visual = isPartner
                      ? getStatusVisual(task.status)
                      : getContractorVisual(contractorName);
                    const isCancelled = task.status === "cancelled";
                    const isCompleted = task.status === "completed";

                    return (
                      <div
                        key={task.id}
                        title={isPartner ? `${task.title} (${task.status})` : `${task.title} (${contractorName})`}
                        style={{
                          fontSize: "10px",
                          lineHeight: 1.25,
                          padding: "2px 5px",
                          borderRadius: "4px",
                          backgroundColor: isPartner
                            ? visual.bgLight
                            : isCancelled
                              ? "#fef2f2"
                              : isCompleted
                                ? "#f8fafc"
                                : visual.bgLight,
                          color: isPartner
                            ? visual.color
                            : isCancelled
                              ? "#b91c1c"
                              : visual.color,
                          border: isPartner
                            ? `1px solid ${visual.border}`
                            : isCancelled
                              ? "1px solid #fecaca"
                              : `1px solid ${visual.border}`,
                          textDecoration: isCancelled ? "line-through" : "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "3.5px",
                          minWidth: 0,
                          maxWidth: "100%",
                          overflow: "hidden",
                          boxSizing: "border-box",
                        }}
                      >
                        <span
                          style={{
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            backgroundColor: isPartner
                              ? visual.dot
                              : isCancelled
                                ? "#b91c1c"
                                : visual.color,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            minWidth: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "block",
                            fontWeight: 650,
                            flex: 1,
                            color: isPartner ? visual.color : undefined,
                          }}
                        >
                          {task.title}
                        </span>
                      </div>
                    );
                  })}

                  {dayTasks.length > 2 && (
                    <span
                      style={{
                        fontSize: "9px",
                        color: "#64748b",
                        fontWeight: 650,
                        marginTop: "1px",
                        padding: "1px 4px",
                        borderRadius: "3px",
                        backgroundColor: "#f1f5f9",
                        alignSelf: "flex-start",
                      }}
                    >
                      +{dayTasks.length - 2} more
                    </span>
                  )}
                </div>

                {/* Empty cell hover plus action button placed at exact center of column */}
                {isPartner && dayTasks.length === 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 2,
                    }}
                  >
                    <button
                      type="button"
                      className="partner-cell-add-btn"
                      aria-label={`Add task for ${cell.dateStr}`}
                      title="Add task for this date"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddTaskClick?.(cell.dateStr);
                      }}
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        border: "1.2px solid #64748b",
                        backgroundColor: "#ffffff",
                        color: "#475569",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        padding: 0,
                        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
                      }}
                    >
                      <Plus size={12} strokeWidth={2} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Selected Date Agenda & Activity Cards ── */}
      <div
        style={{
          borderTop: "1px solid #e2e8f0",
          backgroundColor: "#f8fafc",
          padding: "16px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "14px",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>{selectedDateFormatted}</span>
              {selectedDate === "2026-09-08" && (
                <span
                  style={{
                    fontSize: "10.5px",
                    fontWeight: 700,
                    backgroundColor: "#0f172a",
                    color: "#ffffff",
                    padding: "1px 6px",
                    borderRadius: "4px",
                  }}
                >
                  TODAY · SHIFT 12
                </span>
              )}
            </h3>
            <p style={{ fontSize: "11.5px", color: "#64748b", margin: "2px 0 0" }}>
              {selectedDateTasks.length}{" "}
              {selectedDateTasks.length === 1 ? "task" : "tasks"} scheduled for this date
            </p>
          </div>

          <button
            type="button"
            onClick={() => onAddTaskClick(selectedDate)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "5px 12px",
              fontSize: "11.5px",
              fontWeight: 650,
              backgroundColor: "#ffffff",
              color: "#0f172a",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            <Plus size={13} />
            <span>Schedule Task for this Date</span>
          </button>
        </div>

        {/* Tasks List for Selected Date */}
        {selectedDate === "2026-09-08" && deployment.todayActivity?.headline && (
          <div
            style={{
              padding: "12px 14px",
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              marginBottom: "12px",
            }}
          >
            <h4
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#0f172a",
                margin: "0 0 4px",
              }}
            >
              {deployment.todayActivity.headline}
            </h4>
            {deployment.todayActivity.description && (
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                {deployment.todayActivity.description}
              </p>
            )}
          </div>
        )}

        {selectedDateTasks.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "28px 20px",
              backgroundColor: "#ffffff",
              border: "1px dashed #cbd5e1",
              borderRadius: "10px",
              color: "#64748b",
            }}
          >
            <Clock size={24} style={{ margin: "0 auto 6px", opacity: 0.5 }} />
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#334155", margin: 0 }}>
              No tasks scheduled for {selectedDateFormatted}
            </p>
            <p style={{ fontSize: "11.5px", margin: "4px 0 12px" }}>
              Service provider can schedule a new task tied to BOQ and Gantt milestones.
            </p>
            <button
              type="button"
              onClick={() => onAddTaskClick(selectedDate)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 650,
                backgroundColor: "#0f172a",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              <Plus size={13} />
              <span>Schedule New Task</span>
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {selectedDateTasks.map((task) => {
              const contractorName = resolveContractorName(task);
              const visual = getContractorVisual(contractorName);
              const isCancelled = task.status === "cancelled";
              const isCompleted = task.status === "completed";
              const isInProgress = task.status === "in-progress";

              return (
                <div
                  key={task.id}
                  style={{
                    backgroundColor: isCancelled ? "#fffbfa" : "#ffffff",
                    border: isCancelled ? "1px solid #fecaca" : "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "14px 16px",
                    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
                    transition: "all 120ms ease",
                  }}
                >
                  {/* Top line: Contractor, Trade, Time, Status */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginBottom: "6px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      {!isPartner && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            backgroundColor: visual.bgLight,
                            color: visual.color,
                            border: `1px solid ${visual.border}`,
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                          title={`Assigned to ${contractorName}`}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: visual.color,
                            }}
                          />
                          {contractorName}
                        </span>
                      )}

                      {task.trade && (
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#475569",
                            backgroundColor: "#f1f5f9",
                            padding: "2px 7px",
                            borderRadius: "5px",
                            fontWeight: 600,
                          }}
                        >
                          {task.trade}
                        </span>
                      )}

                      {task.time && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "11px",
                            color: "#64748b",
                          }}
                        >
                          <Clock size={11} />
                          {task.time}
                        </span>
                      )}
                    </div>

                    {/* Status badge / interactive pill */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => onToggleStatus(task.id)}
                        title="Click to cycle status (Scheduled → In progress → Completed)"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "2px 8px",
                          borderRadius: "9999px",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                          border: isCancelled
                            ? "1px solid #fca5a5"
                            : isCompleted
                              ? "1px solid #bbf7d0"
                              : isInProgress
                                ? "1px solid #fed7aa"
                                : "1px solid #bae6fd",
                          backgroundColor: isCancelled
                            ? "#fef2f2"
                            : isCompleted
                              ? "#f0fdf4"
                              : isInProgress
                                ? "#fff7ed"
                                : "#f0f9ff",
                          color: isCancelled
                            ? "#b91c1c"
                            : isCompleted
                              ? "#15803d"
                              : isInProgress
                                ? "#c2410c"
                                : "#0284c7",
                        }}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 size={11} />
                            Completed
                          </>
                        ) : isInProgress ? (
                          <>
                            <Clock size={11} />
                            In progress
                          </>
                        ) : isCancelled ? (
                          <>
                            <XCircle size={11} />
                            Cancelled
                          </>
                        ) : (
                          <>
                            <span
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                backgroundColor: "#0284c7",
                              }}
                            />
                            Scheduled
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Task Title */}
                  <h4
                    style={{
                      fontSize: "13.5px",
                      fontWeight: 700,
                      color: isCancelled ? "#64748b" : "#0f172a",
                      margin: "0 0 6px",
                      textDecoration: isCancelled ? "line-through" : "none",
                    }}
                  >
                    {task.title}
                  </h4>

                  {task.description && (
                    <p style={{ fontSize: "11.5px", color: "#64748b", margin: "0 0 10px", lineHeight: 1.4 }}>
                      {task.description}
                    </p>
                  )}

                  {/* BOQ & Gantt Metadata Strip */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "8px",
                      padding: "7px 10px",
                      backgroundColor: "#f8fafc",
                      borderRadius: "6px",
                      border: "1px solid #f1f5f9",
                      fontSize: "11px",
                      marginBottom: isCancelled && task.cancellationReason ? "8px" : "10px",
                    }}
                  >
                    {task.boqItemCode && (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#334155" }}>
                        <Layers size={12} color="#0284c7" />
                        <span>
                          <strong>{task.boqItemCode}:</strong> {task.boqItemName || "Masonry Works"}
                          {task.boqQuantity ? ` (${task.boqQuantity})` : ""}
                        </span>
                      </div>
                    )}

                    {task.ganttPhaseName && (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          color: "#475569",
                          borderLeft: "1px solid #cbd5e1",
                          paddingLeft: "8px",
                        }}
                      >
                        <BarChart3 size={12} color="#7c3aed" />
                        <span>
                          <strong>Gantt:</strong> {task.ganttPhaseName}
                        </span>
                      </div>
                    )}

                    {task.serviceCategory && (
                      <span
                        style={{
                          fontSize: "10.5px",
                          color: "#64748b",
                          borderLeft: "1px solid #cbd5e1",
                          paddingLeft: "8px",
                        }}
                      >
                        {task.serviceCategory}
                      </span>
                    )}
                  </div>

                  {/* Cancelled Notice */}
                  {isCancelled && task.cancellationReason && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "6px",
                        padding: "7px 10px",
                        backgroundColor: "#fef2f2",
                        border: "1px solid #fecaca",
                        borderRadius: "6px",
                        fontSize: "11px",
                        color: "#991b1b",
                        marginBottom: "10px",
                      }}
                    >
                      <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: "1px" }} />
                      <div>
                        <strong>Cancelled by Service Provider:</strong> {task.cancellationReason}
                        {task.cancelledAt ? ` · ${task.cancelledAt}` : ""}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons for Service Provider (hidden on cancelled tasks) */}
                  {!isCancelled && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: "8px",
                        paddingTop: "6px",
                        borderTop: "1px solid #f1f5f9",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setEditingTask(task)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 10px",
                          fontSize: "11px",
                          fontWeight: 600,
                          backgroundColor: "#ffffff",
                          color: "#334155",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        <Edit2 size={11} />
                        <span>Update Task</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCancellingTask(task)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 10px",
                          fontSize: "11px",
                          fontWeight: 600,
                          backgroundColor: "#ffffff",
                          color: "#b91c1c",
                          border: "1px solid #fecaca",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        <XCircle size={11} />
                        <span>Cancel Task</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Site Supervisor Log Note at bottom */}
        {deployment.todayActivity?.siteLog && (
          <div
            style={{
              marginTop: "14px",
              padding: "10px 14px",
              backgroundColor: "#f1f5f9",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "11.5px",
              color: "#334155",
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
            }}
          >
            <Info size={14} color="#64748b" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong style={{ color: "#0f172a" }}>SITE SUPERVISOR LOG</strong>{" "}
              <span style={{ color: "#64748b", fontSize: "11px" }}>
                · {deployment.todayActivity.loggedAt || "Today, 10:45 AM"}
              </span>
              <p style={{ margin: "2px 0 0", color: "#475569" }}>
                {deployment.todayActivity.siteLog}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Update Task Modal ── */}
      <UpdateTaskModal
        key={editingTask ? `update-${editingTask.id}` : "update-none"}
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        task={editingTask}
        contractors={contractors}
        onUpdateTask={(updated) => {
          onUpdateTask(updated);
          setEditingTask(null);
        }}
        variant={variant}
        hideContractorSelect={isPartner}
      />

      {/* ── Cancel Task Modal ── */}
      <CancelTaskModal
        key={cancellingTask ? `cancel-${cancellingTask.id}` : "cancel-none"}
        isOpen={Boolean(cancellingTask)}
        onClose={() => setCancellingTask(null)}
        task={cancellingTask}
        onConfirmCancel={(taskId, reason) => {
          onCancelTask(taskId, reason);
          setCancellingTask(null);
        }}
      />
    </div>
  );
}
