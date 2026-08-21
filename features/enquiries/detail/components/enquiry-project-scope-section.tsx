"use client";

import React, { useState } from "react";
import { ChevronUp, CheckCircle2 } from "lucide-react";
import styles from "./enquiry-project-scope-section.module.css";

export interface ScopeCategory {
  id: string;
  title: string;
  items: string[];
}

const DEFAULT_PROJECT_SCOPE: ScopeCategory[] = [
  {
    id: "cat-1",
    title: "Space Planning & Layout",
    items: [
      "Formal Living Room & Dining Suite",
      "Master Bedroom Suite with Walk-in Closet",
      "Dedicated Home Office & Study Suite",
      "Courtyard cutout for daylight & cross ventilation",
    ],
  },
  {
    id: "cat-2",
    title: "Civil & Interior Fit-out",
    items: [
      "Custom teak joinery & fixed wardrobe units",
      "Microcement wall finishes & natural stone flooring",
      "Acoustic insulation for master & study suites",
      "Terrace pergola & outdoor lounge landscaping",
    ],
  },
  {
    id: "cat-3",
    title: "MEP & Infrastructure",
    items: [
      "3-Phase electrical distribution & smart scene lighting",
      "High-efficiency VRF HVAC air conditioning layout",
      "Plumbing layout for master bath & powder room",
      "5kW Rooftop solar PV & rainwater harvesting",
    ],
  },
];

export interface EnquiryProjectScopeSectionProps {
  categories?: ScopeCategory[];
  unconfirmedItems?: string[];
  title?: string;
  description?: string;
}

export function EnquiryProjectScopeSection({
  categories = DEFAULT_PROJECT_SCOPE,
  unconfirmedItems = [
    "Loose living room & bedroom furniture package",
    "Outdoor landscape & garden terrace installation",
    "Smart home security & scene automation details",
    "Decorative pendant lighting fixtures & art hardware",
  ],
  title = "PROJECT SCOPE",
  description = "Comprehensive spatial, fit-out, and infrastructure scope breakdown derived from client requirements.",
}: EnquiryProjectScopeSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={styles.sectionContainer}>
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

      <div className={`po-section-body ${!isExpanded ? "is-collapsed" : ""}`}>
        <div className="po-section-inner">
          {description && (
            <p className={styles.sectionDescription}>{description}</p>
          )}
          <div className={styles.scopeGrid}>
            {categories.map((cat) => (
              <div key={cat.id} className={styles.scopeCategoryCard}>
                <div className={styles.categoryHeaderRow}>
                  <h4 className={styles.categoryTitle}>{cat.title}</h4>
                  <span className={styles.itemCountBadge}>{cat.items.length}</span>
                </div>
                <div className={styles.itemList}>
                  {cat.items.map((item, idx) => (
                    <div key={idx} className={styles.itemRow}>
                      <CheckCircle2
                        size={14}
                        className={styles.checkIcon}
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {unconfirmedItems && unconfirmedItems.length > 0 && (
              <div className={`${styles.scopeCategoryCard} ${styles.unconfirmedCard}`}>
                <div className={styles.categoryHeaderRow}>
                  <h4 className={styles.unconfirmedTitle}>
                    Unconfirmed Scope
                  </h4>
                  <span className={styles.unconfirmedBadge}>Optional</span>
                </div>
                <div className={styles.itemList}>
                  {unconfirmedItems.map((item, idx) => (
                    <div key={idx} className={styles.itemRow}>
                      <span className={styles.unconfirmedIcon}>?</span>
                      <span className={styles.unconfirmedText}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
