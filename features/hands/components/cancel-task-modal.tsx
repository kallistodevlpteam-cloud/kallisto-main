"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  AlertTriangle,
  Calendar,
  Building2,
  Clock,
  Layers,
} from "lucide-react";
import type { DeploymentActivityTask } from "../types/hands.types";

interface CancelTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: DeploymentActivityTask | null;
  onConfirmCancel: (taskId: string, reason: string) => void;
}

const PRESET_REASONS = [
  "Weather Disruption / Heavy Rainfall",
  "Material Staging & Delivery Delay",
  "Structural Redesign / Engineering Hold",
  "Pre-requisite QA Inspection Pending",
  "Labour Shortfall / Shift Reassignment",
  "Client Scope Revision",
];

export function CancelTaskModal({
  isOpen,
  onClose,
  task,
  onConfirmCancel,
}: CancelTaskModalProps) {
  const [selectedReason, setSelectedReason] = useState(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
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

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedReason === "Other"
      ? customReason.trim()
      : customReason.trim()
        ? `${selectedReason} — ${customReason.trim()}`
        : selectedReason;

    if (!finalReason) {
      setError("Please provide a reason for cancelling this task");
      return;
    }

    onConfirmCancel(task.id, finalReason);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-task-modal-title"
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
          maxWidth: "500px",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
          border: "1px solid #fee2e2",
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
            borderBottom: "1px solid #fef2f2",
            backgroundColor: "#fff5f5",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                backgroundColor: "#fee2e2",
                color: "#b91c1c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3
                id="cancel-task-modal-title"
                style={{ fontSize: "15px", fontWeight: 700, color: "#991b1b", margin: 0 }}
              >
                Cancel Site Task
              </h3>
              <p style={{ fontSize: "11.5px", color: "#b91c1c", margin: "2px 0 0" }}>
                Log cancellation reason and remove from active shift execution
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cancel task modal"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              border: "1px solid #fecaca",
              backgroundColor: "#ffffff",
              color: "#64748b",
              cursor: "pointer",
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Task Summary Box */}
        <div style={{ padding: "18px 20px" }}>
          <div
            style={{
              padding: "12px 14px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              marginBottom: "16px",
            }}
          >
            <strong style={{ display: "block", fontSize: "13px", color: "#0f172a", marginBottom: "4px" }}>
              {task.title}
            </strong>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                fontSize: "11.5px",
                color: "#64748b",
              }}
            >
              {task.date && (
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Calendar size={12} />
                  {task.date}
                </span>
              )}
              {task.time && (
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={12} />
                  {task.time}
                </span>
              )}
              {task.contractorName && (
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Building2 size={12} />
                  {task.contractorName}
                </span>
              )}
              {task.boqItemCode && (
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Layers size={12} />
                  {task.boqItemCode}
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleConfirm}>
            {error && (
              <div
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#fef2f2",
                  color: "#b91c1c",
                  borderRadius: "6px",
                  fontSize: "12px",
                  marginBottom: "14px",
                  border: "1px solid #fecaca",
                }}
              >
                {error}
              </div>
            )}

            {/* Quick Reasons */}
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{ display: "block", fontSize: "12px", fontWeight: 650, color: "#334155", marginBottom: "6px" }}
              >
                Reason for Cancellation *
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                {PRESET_REASONS.map((r) => {
                  const isSelected = selectedReason === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setSelectedReason(r);
                        if (error) setError("");
                      }}
                      style={{
                        padding: "5px 10px",
                        fontSize: "11px",
                        fontWeight: isSelected ? 700 : 500,
                        borderRadius: "6px",
                        border: isSelected ? "1.5px solid #b91c1c" : "1px solid #cbd5e1",
                        backgroundColor: isSelected ? "#fef2f2" : "#ffffff",
                        color: isSelected ? "#991b1b" : "#475569",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>

              <textarea
                rows={2}
                value={customReason}
                onChange={(e) => {
                  setCustomReason(e.target.value);
                  if (error) setError("");
                }}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  fontSize: "12.5px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  outline: "none",
                  boxSizing: "border-box",
                  color: "#0f172a",
                  resize: "none",
                }}
                placeholder="Additional details / notes regarding postponement..."
              />
            </div>

            {/* Footer buttons */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "10px",
                paddingTop: "12px",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "7px 14px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#64748b",
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Keep Task
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
                  backgroundColor: "#dc2626",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(220, 38, 38, 0.2)",
                }}
              >
                Confirm Cancellation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
