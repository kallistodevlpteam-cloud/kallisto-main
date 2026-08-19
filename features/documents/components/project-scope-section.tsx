"use client";

import React, { useState } from "react";
import { CheckCircle2, ChevronUp } from "lucide-react";

export interface ScopeCategory {
  title: string;
  items: string[];
}

export interface ProjectScopeSectionProps {
  title?: string;
  description?: string;
  categories?: ScopeCategory[];
}

const DEFAULT_CATEGORIES: ScopeCategory[] = [
  {
    title: "Space Planning & Layout",
    items: [
      "Open-plan workstation arrangement (50+ capacity)",
      "2 Executive Cabins & 1 Conference Room",
      "Reception Area & Visitor Lounge",
      "Pantry & Breakout Zone",
    ],
  },
  {
    title: "Civil & Interior Fit-out",
    items: [
      "Glass acoustic partition walls",
      "Custom reception desk & credenza storage",
      "Gypsum & grid false ceiling works",
      "Commercial grade carpet & vinyl flooring",
    ],
  },
  {
    title: "MEP & Infrastructure",
    items: [
      "Electrical wiring & floor raceways for workstations",
      "Modular LED ceiling lighting fixture installation",
      "HVAC duct relocation & diffuser fitting",
      "Data cabling & server room trunking",
    ],
  },
];

export function ProjectScopeSection({
  title = "PROJECT SCOPE",
  description = "Comprehensive spatial, fit-out, and infrastructure scope breakdown derived from client requirements.",
  categories = DEFAULT_CATEGORIES,
}: ProjectScopeSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="project-scope-section">
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
          {description ? <p className="po-section-description">{description}</p> : null}

          {/* 3-Column Scope Cards Grid */}
          <div className="project-scope-grid">
            {categories.map((cat, idx) => (
              <div key={idx} className="project-scope-card">
                <h4 className="project-scope-card-title">{cat.title}</h4>
                <div className="project-scope-card-divider" />
                <ul className="project-scope-list">
                  {cat.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="project-scope-item">
                      <CheckCircle2 size={15} className="project-scope-check-icon" aria-hidden="true" />
                      <span className="project-scope-item-text">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
