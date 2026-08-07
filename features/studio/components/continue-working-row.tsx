"use client";

import React from "react";
import { ArrowRight, Clock, FileText } from "lucide-react";
import { StudioTask } from "@/types/domain/studio";
import { getProjectDisplayName } from "./project-selector";

export interface ContinueWorkingRowProps {
  tasks: StudioTask[];
  onReopenTask: (taskId: string) => void;
}

export function ContinueWorkingRow({
  tasks,
  onReopenTask,
}: ContinueWorkingRowProps) {
  if (!tasks || tasks.length === 0) {
    return null; // Render nothing if no draft exists
  }

  const latestTask = tasks[0];

  return (
    <div
      style={{
        width: "100%",
        marginBottom: "20px",
      }}
    >
      <div style={{ marginBottom: "6px" }}>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#64748b",
          }}
        >
          Continue where you left off
        </span>
      </div>

      <div
        onClick={() => onReopenTask(latestTask.id)}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onReopenTask(latestTask.id);
          }
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          padding: "10px 14px",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          background: "#ffffff",
          cursor: "pointer",
          transition: "all 0.15s ease",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <div
            style={{
              display: "grid",
              placeItems: "center",
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              background: "#f1f5f9",
              color: "#334155",
              flexShrink: 0,
            }}
          >
            <FileText size={15} />
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 650,
                  color: "#0f172a",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {latestTask.prompt || `${latestTask.workspaceType.toUpperCase()} Draft`}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#6d28d9",
                  background: "#f5f3ff",
                  padding: "1px 6px",
                  borderRadius: "4px",
                  whiteSpace: "nowrap",
                }}
              >
                {getProjectDisplayName({ name: latestTask.projectName } as any) || latestTask.projectName}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#64748b", fontSize: "11.5px" }}>
            <Clock size={12} />
            <span>Updated recently</span>
          </div>

          <ArrowRight size={14} style={{ color: "#7c3aed" }} />
        </div>
      </div>
    </div>
  );
}
