"use client";

import React, { useState } from "react";
import { ChevronUp, CheckCircle2 } from "lucide-react";
import styles from "./enquiry-project-scope-section.module.css";

export interface ScopeCategory {
  id: string;
  title: string;
  items: string[];
}

export interface EnquiryProjectScopeSectionProps {
  /** Project scopes from the backend (project_scope + project_scope_item).
   * Strictly backend-sourced; empty/absent means no scopes are available. */
  scopes?: Array<{ id: number; scope_name: string; items: string[] }>;
  title?: string;
  description?: string;
}

export function EnquiryProjectScopeSection({
  scopes = [],
  title = "PROJECT SCOPE",
  description = "Scope categories with their sub-items, as recorded on the backend.",
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
          {scopes.length === 0 ? (
            <p className={styles.emptyState}>
              No scope categories have been shared yet.
            </p>
          ) : (
            <div className={styles.scopeGrid}>
              {scopes.map((scope) => (
                <div key={scope.id} className={styles.scopeCategoryCard}>
                  <h4 className={styles.categoryTitle}>{scope.scope_name}</h4>
                  <div className={styles.itemList}>
                    {scope.items.map((item, idx) => (
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}