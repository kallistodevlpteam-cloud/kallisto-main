"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Edit3,
  Calendar,
  Clock,
  Building2,
  Users,
  Layers,
  BarChart3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { DeploymentActivityTask, DeploymentContractor } from "../types/hands.types";
import { NILA_BOQ_ITEMS, NILA_GANTT_PHASES } from "../utils/deployment-boq-gantt-data";

interface UpdateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: DeploymentActivityTask | null;
  contractors: DeploymentContractor[];
  onUpdateTask: (updatedTask: DeploymentActivityTask) => void;
  variant?: "default" | "partner";
  hideContractorSelect?: boolean;
}

export function UpdateTaskModal({
  isOpen,
  onClose,
  task,
  contractors,
  onUpdateTask,
  variant = "default",
  hideContractorSelect = false,
}: UpdateTaskModalProps) {
  const isPartner = variant === "partner";
  const shouldHideContractor = hideContractorSelect || isPartner;

  const [title, setTitle] = useState(task?.title || "");
  const [date, setDate] = useState(task?.date || "2026-09-08");
  const [time, setTime] = useState(task?.time || "8:00 AM – 1:30 PM");
  const [contractorName, setContractorName] = useState(
    task?.contractorName || contractors[0]?.name || "Apex Integrated Civil",
  );
  const [trade, setTrade] = useState(task?.trade || "6 Masons");
  const [boqItemCode, setBoqItemCode] = useState(task?.boqItemCode || "BOQ-04.1");
  const [ganttPhaseId, setGanttPhaseId] = useState(task?.ganttPhaseId || "phase-2");
  const [status, setStatus] = useState<DeploymentActivityTask["status"]>(
    task?.status || "in-progress",
  );
  const [description, setDescription] = useState(task?.description || "");
  const [error, setError] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    const selectedBoq = NILA_BOQ_ITEMS.find((b) => b.code === boqItemCode);
    const selectedGantt = NILA_GANTT_PHASES.find((g) => g.id === ganttPhaseId);

    const updated: DeploymentActivityTask = {
      ...task,
      title: title.trim(),
      date,
      time: time.trim(),
      contractorName,
      trade: trade.trim() || undefined,
      status,
      description: description.trim() || undefined,
      boqItemCode: selectedBoq?.code,
      boqItemName: selectedBoq?.name,
      boqQuantity: selectedBoq?.unitScope,
      ganttPhaseId: selectedGantt?.id,
      ganttPhaseName: selectedGantt?.name,
      serviceCategory: selectedBoq?.serviceCategory,
    };

    onUpdateTask(updated);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-task-modal-title"
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
          maxWidth: "580px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #f1f5f9",
            backgroundColor: "#f8fafc",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                backgroundColor: "#0f172a",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Edit3 size={16} />
            </div>
            <div>
              <h3
                id="update-task-modal-title"
                style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}
              >
                Update Site Task
              </h3>
              <p style={{ fontSize: "11.5px", color: "#64748b", margin: "2px 0 0" }}>
                Modify task schedule, assigned contractor, BOQ reference, or execution status
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close update task modal"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              color: "#64748b",
              cursor: "pointer",
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                backgroundColor: "#fef2f2",
                color: "#dc2626",
                borderRadius: "8px",
                fontSize: "12px",
                marginBottom: "16px",
                border: "1px solid #fecaca",
              }}
            >
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div style={{ marginBottom: "14px" }}>
            <label
              htmlFor="update-task-title"
              style={{ display: "block", fontSize: "12px", fontWeight: 650, color: "#334155", marginBottom: "5px" }}
            >
              Task Title *
            </label>
            <input
              id="update-task-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: "13px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                outline: "none",
                boxSizing: "border-box",
                color: "#0f172a",
              }}
              placeholder="e.g. Perimeter brick masonry & plumb line verification"
            />
          </div>

          {/* Row 2: Scheduled Date & Trade / Contractor */}
          {shouldHideContractor ? (
            /* Partner View: Contractor is removed; Scheduled Date & Assigned Trade are side-by-side */
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
              <div>
                <label
                  htmlFor="update-task-date"
                  style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 650, color: "#334155", marginBottom: "5px" }}
                >
                  <Calendar size={13} color="#64748b" />
                  <span>Scheduled Date</span>
                </label>
                <input
                  id="update-task-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    fontSize: "12.5px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    outline: "none",
                    boxSizing: "border-box",
                    color: "#0f172a",
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="update-task-trade"
                  style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 650, color: "#334155", marginBottom: "5px" }}
                >
                  <Users size={13} color="#64748b" />
                  <span>Assigned Trade / Crew</span>
                </label>
                <input
                  id="update-task-trade"
                  type="text"
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    fontSize: "12.5px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    outline: "none",
                    boxSizing: "border-box",
                    color: "#0f172a",
                  }}
                  placeholder="e.g. 6 Masons"
                />
              </div>
            </div>
          ) : (
            /* Provider View with Contractor selection */
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label
                    htmlFor="update-task-date"
                    style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 650, color: "#334155", marginBottom: "5px" }}
                  >
                    <Calendar size={13} color="#64748b" />
                    <span>Scheduled Date</span>
                  </label>
                  <input
                    id="update-task-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      fontSize: "12.5px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      outline: "none",
                      boxSizing: "border-box",
                      color: "#0f172a",
                    }}
                  />
                </div>
                <div>
                  <label
                    htmlFor="update-task-trade"
                    style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 650, color: "#334155", marginBottom: "5px" }}
                  >
                    <Users size={13} color="#64748b" />
                    <span>Assigned Trade / Crew</span>
                  </label>
                  <input
                    id="update-task-trade"
                    type="text"
                    value={trade}
                    onChange={(e) => setTrade(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      fontSize: "12.5px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      outline: "none",
                      boxSizing: "border-box",
                      color: "#0f172a",
                    }}
                    placeholder="e.g. 6 Masons"
                  />
                </div>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label
                  htmlFor="update-task-contractor"
                  style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 650, color: "#334155", marginBottom: "5px" }}
                >
                  <Building2 size={13} color="#64748b" />
                  <span>Assigned Labour Contractor</span>
                </label>
                <select
                  id="update-task-contractor"
                  value={contractorName}
                  onChange={(e) => setContractorName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    fontSize: "12.5px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    outline: "none",
                    boxSizing: "border-box",
                    backgroundColor: "#ffffff",
                    color: "#0f172a",
                  }}
                >
                  {contractors.map((c) => (
                    <option key={c.id || c.name} value={c.name}>
                      {c.name} ({c.trade || "Labour Contractor"})
                    </option>
                  ))}
                  <option value="Site Supervision">Site Supervision (Kallisto QA Lead)</option>
                </select>
              </div>
            </>
          )}

          {/* Row 3: Shift Timing */}
          <div style={{ marginBottom: "14px" }}>
            <label
              htmlFor="update-task-time"
              style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 650, color: "#334155", marginBottom: "5px" }}
            >
              <Clock size={13} color="#64748b" />
              <span>Shift Timing</span>
            </label>
            <input
              id="update-task-time"
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: "12.5px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                outline: "none",
                boxSizing: "border-box",
                color: "#0f172a",
              }}
              placeholder="e.g. 8:00 AM – 1:30 PM"
            />
            <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
              {[
                { label: "Morning (8:00 AM – 1:30 PM)", value: "8:00 AM – 1:30 PM" },
                { label: "Afternoon (1:30 PM – 5:00 PM)", value: "1:30 PM – 5:00 PM" },
                { label: "Full Shift (8:00 AM – 5:00 PM)", value: "8:00 AM – 5:00 PM" },
              ].map((preset) => {
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

          {/* BOQ Line Item Selector */}
          <div style={{ marginBottom: "14px" }}>
            <label
              htmlFor="update-task-boq"
              style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 650, color: "#334155", marginBottom: "5px" }}
            >
              <Layers size={13} color="#64748b" />
              <span>Linked BOQ Line Item</span>
            </label>
            <select
              id="update-task-boq"
              value={boqItemCode}
              onChange={(e) => setBoqItemCode(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                fontSize: "12.5px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                outline: "none",
                boxSizing: "border-box",
                backgroundColor: "#ffffff",
                color: "#0f172a",
              }}
            >
              {NILA_BOQ_ITEMS.map((boq) => (
                <option key={boq.code} value={boq.code}>
                  {boq.code} — {boq.name} ({boq.unitScope})
                </option>
              ))}
            </select>
          </div>

          {/* Gantt Milestone Phase Selector */}
          <div style={{ marginBottom: "14px" }}>
            <label
              htmlFor="update-task-gantt"
              style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 650, color: "#334155", marginBottom: "5px" }}
            >
              <BarChart3 size={13} color="#64748b" />
              <span>Linked Gantt Milestone / Phase</span>
            </label>
            <select
              id="update-task-gantt"
              value={ganttPhaseId}
              onChange={(e) => setGanttPhaseId(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                fontSize: "12.5px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                outline: "none",
                boxSizing: "border-box",
                backgroundColor: "#ffffff",
                color: "#0f172a",
              }}
            >
              {NILA_GANTT_PHASES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.dateRange})
                </option>
              ))}
            </select>
          </div>

          {/* Status Selection */}
          <div style={{ marginBottom: "14px" }}>
            <label
              style={{ display: "block", fontSize: "12px", fontWeight: 650, color: "#334155", marginBottom: "6px" }}
            >
              Task Execution Status
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
              {[
                { id: "scheduled", label: "Scheduled", color: "#0284c7", bg: "#f0f9ff" },
                { id: "in-progress", label: "In Progress", color: "#15803d", bg: "#f0fdf4" },
                { id: "completed", label: "Completed", color: "#0f172a", bg: "#f8fafc" },
                { id: "cancelled", label: "Cancelled", color: "#b91c1c", bg: "#fef2f2" },
              ].map((opt) => {
                const isSelected = status === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStatus(opt.id as DeploymentActivityTask["status"])}
                    style={{
                      padding: "8px 4px",
                      fontSize: "11.5px",
                      fontWeight: 650,
                      borderRadius: "6px",
                      border: isSelected ? `2px solid ${opt.color}` : "1px solid #e2e8f0",
                      backgroundColor: isSelected ? opt.bg : "#ffffff",
                      color: isSelected ? opt.color : "#64748b",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "18px" }}>
            <label
              htmlFor="update-task-desc"
              style={{ display: "block", fontSize: "12px", fontWeight: 650, color: "#334155", marginBottom: "5px" }}
            >
              Workfront Notes &amp; Specifications
            </label>
            <textarea
              id="update-task-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: "12.5px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                outline: "none",
                boxSizing: "border-box",
                color: "#0f172a",
                resize: "vertical",
              }}
              placeholder="Specific alignment, batch ratio, safety precautions..."
            />
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
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
                padding: "7px 14px",
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#64748b",
                backgroundColor: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 16px",
                fontSize: "12.5px",
                fontWeight: 650,
                color: "#ffffff",
                backgroundColor: "#0f172a",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(15, 23, 42, 0.1)",
              }}
            >
              <CheckCircle2 size={14} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
