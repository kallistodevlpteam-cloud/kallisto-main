"use client";

import React, { useState } from "react";
import { ChevronUp } from "lucide-react";

export type HighlightStatus = "positive" | "neutral" | "danger";

export interface HighlightItem {
  text: string;
  status?: HighlightStatus;
}

interface ProjectOverviewSectionProps {
  title?: string;
  projectName?: string;
  description?: string;
  highlights?: Array<string | HighlightItem>;
}

export function ProjectOverviewSection({
  title = "PROJECT OVERVIEW",
  projectName = "Nila Residence",
  description,
  highlights = [
    "Structural design completed",
    "Site visits scheduled weekly",
    "BOQ linked to live budget",
    "MEP coordination in progress",
    "Material approvals tracked",
    "Milestones tied to payments",
  ],
}: ProjectOverviewSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="project-overview-section">
      {/* Header Row */}
      {title ? (
        <button
          type="button"
          className="po-section-header-btn"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
        >
          <span className="po-section-eyebrow">{title}</span>
          <ChevronUp
            size={15}
            className={`po-section-chevron ${!isExpanded ? "is-collapsed" : ""}`}
          />
        </button>
      ) : null}

      {/* Expandable Content Container */}
      <div className={`po-section-body ${!isExpanded ? "is-collapsed" : ""}`}>
        <div className="po-section-inner">
          {/* Main Description */}
          <p className="po-section-description">
            {description ? (
              description
            ) : (
              <>
                <strong>{projectName}</strong> is a premium luxury villa project designed to combine modern architecture, sustainable living, and functional spaces. The project is currently progressing through the structural construction phase with continuous milestone tracking and real-time project updates.
              </>
            )}
          </p>

          {/* Highlights 3-Column Grid */}
          <div className="po-highlights-grid">
            {highlights.map((item, idx) => {
              const text = typeof item === "string" ? item : item.text;
              const status = typeof item === "string" ? undefined : item.status;
              const dotClass = [
                "po-highlight-dot",
                status ? `po-highlight-dot--${status}` : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <div key={idx} className="po-highlight-item">
                  <span className={dotClass} aria-hidden="true" />
                  <span className="po-highlight-text">{text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
