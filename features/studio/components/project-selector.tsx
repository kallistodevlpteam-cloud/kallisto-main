"use client";

import React from "react";
import { ChevronDown, Folder } from "lucide-react";
import { StudioProjectOption } from "@/types/domain/studio";

export type ProjectSelectorVariant = "header" | "inline-link" | "context-pill";

export interface ProjectSelectorProps {
  value: string | null;
  projects: StudioProjectOption[];
  onChange: (projectId: string) => void;
  variant?: ProjectSelectorVariant;
  disabled?: boolean;
}

export function getProjectDisplayName(project: StudioProjectOption | null): string {
  if (!project) return "";
  let name = project.name;
  if (name.includes(" - ")) {
    name = name.split(" - ")[0];
  }
  if (name.includes(" — ")) {
    name = name.split(" — ")[0];
  }
  if (name.length > 32) {
    name = name.substring(0, 30) + "…";
  }
  return name.trim();
}

export function ProjectSelector({
  value,
  projects,
  onChange,
  variant = "header",
  disabled = false,
}: ProjectSelectorProps) {
  const selectedProject = projects.find((p) => p.id === value) || null;
  const displayName = getProjectDisplayName(selectedProject);
  const fullTitle = selectedProject ? `${selectedProject.code} — ${selectedProject.name}` : "";

  if (variant === "inline-link") {
    return (
      <span
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        title={fullTitle || "Select a project"}
        onClick={() => {
          const headerEl = document.getElementById("header-project-select");
          if (headerEl) {
            headerEl.focus();
            headerEl.click();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const headerEl = document.getElementById("header-project-select");
            if (headerEl) { headerEl.focus(); headerEl.click(); }
          }
        }}
        style={{
          display: "inline-flex",
          alignItems: "baseline",
          gap: "3px",
          color: "#0f172a",
          fontWeight: 600,
          fontSize: "inherit",
          cursor: "pointer",
          borderBottom: "1.5px solid #0f172a",
          paddingBottom: "2px",
        }}
      >
        {displayName || "a project"}&thinsp;?
      </span>
    );
  }

  if (variant === "context-pill") {
    return (
      <div style={{ position: "relative", display: "inline-flex", maxWidth: "280px" }}>
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          title={fullTitle || "Select project context"}
          aria-label="Select project context"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            height: "30px",
            maxWidth: "280px",
            padding: "0 24px 0 10px",
            border: "1px solid #e2e8f0",
            borderRadius: "9999px",
            background: selectedProject ? "#f8fafc" : "#ffffff",
            color: selectedProject ? "#0f172a" : "#64748b",
            fontSize: "12.5px",
            fontWeight: 600,
            cursor: "pointer",
            appearance: "none",
            outline: "none",
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          <option value="">No Project Selected</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {getProjectDisplayName(p)} ({p.code})
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          style={{
            position: "absolute",
            right: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: "#64748b",
          }}
        />
      </div>
    );
  }

  // Header primary variant (~380-420px width, 40px height)
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", width: "100%", maxWidth: "400px" }}>
      <select
        id="header-project-select"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        title={fullTitle || "Select project"}
        aria-label="Select project"
        style={{
          width: "100%",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          height: "40px",
          padding: "0 30px 0 36px",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          background: "#ffffff",
          color: selectedProject ? "#0f172a" : "#64748b",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          appearance: "none",
          outline: "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <option value="">Select project</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {getProjectDisplayName(p)} — {p.code}
          </option>
        ))}
      </select>
      <Folder
        size={16}
        style={{
          position: "absolute",
          left: "12px",
          pointerEvents: "none",
          color: selectedProject ? "#7c3aed" : "#94a3b8",
        }}
      />
      <ChevronDown
        size={14}
        style={{
          position: "absolute",
          right: "12px",
          pointerEvents: "none",
          color: "#64748b",
        }}
      />
    </div>
  );
}
