"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  AlertCircle,
  Building2,
  Users,
  Clock,
  CalendarClock,
  FileText,
  Calendar,
  Layers,
  BarChart3,
} from "lucide-react";
import type { DeploymentActivityTask } from "../types/hands.types";
import { NILA_BOQ_ITEMS, NILA_GANTT_PHASES } from "../utils/deployment-boq-gantt-data";

export interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  supervisorName?: string;
  contractors?: Array<{ name: string; trade?: string }>;
  onAddTask: (task: DeploymentActivityTask) => void;
  initialDate?: string;
  variant?: "default" | "partner";
  hideContractorSelect?: boolean;
}

const COMMON_TRADES = [
  "Masons",
  "Helpers",
  "Carpenters & Shuttering",
  "Steel Fixers & Rebar",
  "Plasterers",
  "Electricians",
  "Plumbers",
  "Painters",
  "Site Supervisor",
  "General Civil Crew",
];

const SHIFT_PRESETS = [
  { label: "Morning (8:00 AM – 1:30 PM)", value: "8:00 AM – 1:30 PM" },
  { label: "Afternoon (1:30 PM – 5:00 PM)", value: "1:30 PM – 5:00 PM" },
  { label: "Full Shift (8:00 AM – 5:00 PM)", value: "8:00 AM – 5:00 PM" },
];

export function AddTaskModal({
  isOpen,
  onClose,
  projectName,
  supervisorName = "Site Supervisor",
  contractors,
  onAddTask,
  initialDate,
  variant = "default",
  hideContractorSelect = false,
}: AddTaskModalProps) {
  const isPartner = variant === "partner";
  const shouldHideContractor = hideContractorSelect || isPartner;

  const [date, setDate] = useState<string>(initialDate || "2026-09-08");
  const [title, setTitle] = useState("");
  const [contractorName, setContractorName] = useState<string>(
    contractors?.[0]?.name || "Apex Integrated Civil"
  );
  const [trade, setTrade] = useState("Masons");
  const [customTrade, setCustomTrade] = useState("");
  const [time, setTime] = useState("8:00 AM – 1:30 PM");
  const [boqItemCode, setBoqItemCode] = useState("BOQ-04.1");
  const [ganttPhaseId, setGanttPhaseId] = useState("phase-2");
  const [status, setStatus] = useState<"scheduled" | "in-progress" | "completed">("scheduled");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const [prevInitialDate, setPrevInitialDate] = useState(initialDate);
  if (initialDate !== prevInitialDate) {
    setPrevInitialDate(initialDate);
    if (initialDate) {
      setDate(initialDate);
    }
  }

  if (!isOpen) return null;

  const hasMultipleContractors = Boolean(contractors && contractors.length > 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a task title");
      return;
    }

    const assignedTrade = trade === "Other" ? customTrade.trim() || "Site Workforce" : trade;
    const effectiveContractor = shouldHideContractor
      ? contractors?.[0]?.name || "Apex Integrated Civil"
      : hasMultipleContractors
        ? contractorName || undefined
        : undefined;

    const selectedBoq = NILA_BOQ_ITEMS.find((b) => b.code === boqItemCode) || NILA_BOQ_ITEMS[0];
    const selectedGantt = NILA_GANTT_PHASES.find((g) => g.id === ganttPhaseId) || NILA_GANTT_PHASES[1];

    const newTask: DeploymentActivityTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      date: date || initialDate || "2026-09-08",
      status: status === "scheduled" ? "scheduled" : status,
      time: time.trim() || "8:00 AM – 1:30 PM",
      trade: assignedTrade,
      contractorName: effectiveContractor,
      description: description.trim() || undefined,
      boqItemCode: selectedBoq.code,
      boqItemName: selectedBoq.name,
      boqQuantity: selectedBoq.unitScope,
      ganttPhaseId: selectedGantt.id,
      ganttPhaseName: selectedGantt.name,
      serviceCategory: selectedBoq.serviceCategory,
    };

    onAddTask(newTask);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-task-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "540px",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.06)",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          animation: "fadeIn 150ms ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid #f1f5f9",
            backgroundColor: "#f8fafc",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "#eff6ff",
                border: "1px solid #dbeafe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2563eb",
                flexShrink: 0,
              }}
            >
              <Plus size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h2
                id="add-task-modal-title"
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Add Site Execution Task
              </h2>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0" }}>
                Schedule or record execution task for {projectName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add task modal"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              color: "#64748b",
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 24px" }}>
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "12px",
                marginBottom: "16px",
              }}
            >
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Task Title */}
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="task-title"
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 650,
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              Task Title <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              id="task-title"
              type="text"
              required
              placeholder="e.g. 230mm block masonry laying & plumb line verification"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
              style={{
                width: "100%",
                height: "38px",
                padding: "0 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                color: "#0f172a",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Row 2: Scheduled Date / Contractor & Trade */}
          {shouldHideContractor ? (
            /* Partner View: Contractor is removed; Scheduled Date and Trade are side-by-side */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label
                  htmlFor="task-date"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "12px",
                    fontWeight: 650,
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  <Calendar size={12} style={{ color: "#64748b" }} />
                  <span>Scheduled Date</span>
                </label>
                <input
                  id="task-date"
                  type="date"
                  required
                  value={date}
                  min="2026-09-01"
                  max="2026-10-31"
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                    color: "#0f172a",
                    backgroundColor: "#ffffff",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="task-trade"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "12px",
                    fontWeight: 650,
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  <Users size={12} style={{ color: "#64748b" }} />
                  <span>Assigned Trade / Crew</span>
                </label>
                <select
                  id="task-trade"
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                    color: "#0f172a",
                    backgroundColor: "#ffffff",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                >
                  {COMMON_TRADES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                  <option value="Other">Other / Custom...</option>
                </select>
              </div>
            </div>
          ) : hasMultipleContractors ? (
            /* Provider Multi-Contractor View: Assigned Contractor and Trade side-by-side */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label
                  htmlFor="task-contractor"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "12px",
                    fontWeight: 650,
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  <Building2 size={12} style={{ color: "#64748b" }} />
                  <span>Assigned Labour Contractor</span>
                </label>
                <select
                  id="task-contractor"
                  value={contractorName}
                  onChange={(e) => setContractorName(e.target.value)}
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                    color: "#0f172a",
                    backgroundColor: "#ffffff",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                >
                  {contractors?.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} {c.trade ? `(${c.trade})` : ""}
                    </option>
                  ))}
                  <option value="Site Supervision">Site Supervision ({supervisorName})</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="task-trade"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "12px",
                    fontWeight: 650,
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  <Users size={12} style={{ color: "#64748b" }} />
                  <span>Assigned Trade / Crew</span>
                </label>
                <select
                  id="task-trade"
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                    color: "#0f172a",
                    backgroundColor: "#ffffff",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                >
                  {COMMON_TRADES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                  <option value="Other">Other / Custom...</option>
                </select>
              </div>
            </div>
          ) : (
            /* Single Contractor View: Trade & Scheduled Date */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label
                  htmlFor="task-trade"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "12px",
                    fontWeight: 650,
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  <Users size={12} style={{ color: "#64748b" }} />
                  <span>Assigned Trade / Crew</span>
                </label>
                <select
                  id="task-trade"
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                    color: "#0f172a",
                    backgroundColor: "#ffffff",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                >
                  {COMMON_TRADES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                  <option value="Other">Other / Custom...</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="task-date"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "12px",
                    fontWeight: 650,
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  <Calendar size={12} style={{ color: "#64748b" }} />
                  <span>Scheduled Date</span>
                </label>
                <input
                  id="task-date"
                  type="date"
                  required
                  value={date}
                  min="2026-09-01"
                  max="2026-10-31"
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                    color: "#0f172a",
                    backgroundColor: "#ffffff",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          )}

          {trade === "Other" && (
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="task-custom-trade"
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 650,
                  color: "#334155",
                  marginBottom: "6px",
                }}
              >
                Specify Crew or Person
              </label>
              <input
                id="task-custom-trade"
                type="text"
                placeholder="e.g. 4 Structural Fabricators"
                value={customTrade}
                onChange={(e) => setCustomTrade(e.target.value)}
                style={{
                  width: "100%",
                  height: "38px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "12.5px",
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          {/* Row 3: Shift Time Window */}
          <div style={{ marginBottom: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "6px",
              }}
            >
              <label
                htmlFor="task-time"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "12px",
                  fontWeight: 650,
                  color: "#334155",
                }}
              >
                <Clock size={12} style={{ color: "#64748b" }} />
                <span>Shift Timing</span>
              </label>
            </div>
            <input
              id="task-time"
              type="text"
              placeholder="e.g. 8:00 AM – 1:30 PM"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{
                width: "100%",
                height: "38px",
                padding: "0 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "12.5px",
                color: "#0f172a",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <div
              style={{
                display: "flex",
                gap: "6px",
                marginTop: "6px",
                flexWrap: "wrap",
              }}
            >
              {SHIFT_PRESETS.map((preset) => {
                const isCurrent = time === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setTime(preset.value)}
                    style={{
                      padding: "3px 8px",
                      fontSize: "11px",
                      fontWeight: isCurrent ? 600 : 500,
                      borderRadius: "6px",
                      border: isCurrent ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                      backgroundColor: isCurrent ? "#eff6ff" : "#f8fafc",
                      color: isCurrent ? "#1d4ed8" : "#64748b",
                      cursor: "pointer",
                      transition: "all 120ms ease",
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 4: BOQ Line Item Selector */}
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="task-boq"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                fontWeight: 650,
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              <Layers size={12} style={{ color: "#64748b" }} />
              <span>Linked BOQ Line Item</span>
            </label>
            <select
              id="task-boq"
              value={boqItemCode}
              onChange={(e) => setBoqItemCode(e.target.value)}
              style={{
                width: "100%",
                height: "38px",
                padding: "0 10px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "12.5px",
                color: "#0f172a",
                backgroundColor: "#ffffff",
                outline: "none",
                boxSizing: "border-box",
              }}
            >
              {NILA_BOQ_ITEMS.map((boq) => (
                <option key={boq.code} value={boq.code}>
                  {boq.code} — {boq.name} ({boq.unitScope})
                </option>
              ))}
            </select>
          </div>

          {/* Row 5: Gantt Milestone Phase Selector */}
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="task-gantt"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                fontWeight: 650,
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              <BarChart3 size={12} style={{ color: "#64748b" }} />
              <span>Linked Gantt Milestone / Phase</span>
            </label>
            <select
              id="task-gantt"
              value={ganttPhaseId}
              onChange={(e) => setGanttPhaseId(e.target.value)}
              style={{
                width: "100%",
                height: "38px",
                padding: "0 10px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "12.5px",
                color: "#0f172a",
                backgroundColor: "#ffffff",
                outline: "none",
                boxSizing: "border-box",
              }}
            >
              {NILA_GANTT_PHASES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.dateRange})
                </option>
              ))}
            </select>
          </div>

          {/* Row 6: Task Execution Status as modern segmented bar */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                fontWeight: 650,
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              <CalendarClock size={12} style={{ color: "#64748b" }} />
              <span>Task Execution Status</span>
            </label>
            <div
              style={{
                display: "flex",
                gap: "4px",
                padding: "3px",
                backgroundColor: "#f1f5f9",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
              }}
            >
              {(
                [
                  { id: "scheduled", label: "Scheduled", color: "#475569", dotColor: "#64748b" },
                  { id: "in-progress", label: "In Progress", color: "#0284c7", dotColor: "#0284c7" },
                  { id: "completed", label: "Completed", color: "#16a34a", dotColor: "#16a34a" },
                ] as const
              ).map((s) => {
                const isSelected = status === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStatus(s.id)}
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      borderRadius: "7px",
                      border: isSelected ? "1px solid rgba(0, 0, 0, 0.05)" : "1px solid transparent",
                      backgroundColor: isSelected ? "#ffffff" : "transparent",
                      color: isSelected ? s.color : "#64748b",
                      boxShadow: isSelected ? "0 1px 3px rgba(0, 0, 0, 0.08)" : "none",
                      fontSize: "12px",
                      fontWeight: isSelected ? 700 : 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 120ms ease",
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: isSelected ? s.dotColor : "#94a3b8",
                      }}
                    />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 7: Notes / Description */}
          <div style={{ marginBottom: "18px" }}>
            <label
              htmlFor="task-desc"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                fontWeight: 650,
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              <FileText size={12} style={{ color: "#64748b" }} />
              <span>Workfront Notes & Specifications</span>
            </label>
            <textarea
              id="task-desc"
              rows={3}
              placeholder="Specific alignment, batch ratio, safety precautions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "12px",
                color: "#0f172a",
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </div>

          {/* Action buttons footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              paddingTop: "14px",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 16px",
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#475569",
                backgroundColor: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 120ms ease",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "8px 18px",
                fontSize: "12.5px",
                fontWeight: 650,
                color: "#ffffff",
                backgroundColor: "#0f172a",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                transition: "background-color 120ms ease",
              }}
            >
              <Plus size={14} />
              <span>Add Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
