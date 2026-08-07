"use client";

import React from "react";
import { Crop, Home, Layers } from "lucide-react";

const STATUS_CHIPS = [
  { id: "area", label: "4,000 sq.ft", type: "area" },
  { id: "type", label: "Residential", type: "home" },
  { id: "status", label: "In Progress", type: "progress" },
  { id: "phase", label: "Phase 3", type: "layers" },
] as const;

function ChipIcon({ type }: { type: "area" | "home" | "progress" | "layers" }) {
  if (type === "area") {
    return <Crop size={15} strokeWidth={1.8} className="title-chip-icon" />;
  }
  if (type === "home") {
    return <Home size={15} strokeWidth={1.8} className="title-chip-icon" />;
  }
  if (type === "progress") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="title-chip-icon">
        <circle cx="12" cy="12" r="7.5" stroke="#FF6B00" strokeWidth="2.5" />
      </svg>
    );
  }
  return <Layers size={15} strokeWidth={1.8} className="title-chip-icon" />;
}

export function ProjectStatusChips() {
  return (
    <div className="title-status-chips" aria-label="Project Status Details">
      {STATUS_CHIPS.map((chip, idx) => (
        <React.Fragment key={chip.id}>
          {idx > 0 && <div className="title-status-divider" aria-hidden="true" />}
          <div className="title-status-chip">
            <ChipIcon type={chip.type} />
            <span>{chip.label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
