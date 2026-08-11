"use client";

import React from "react";
import { Sparkles, PlusCircle, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { OdinContextualInsight, OdinInsightSeverity } from "@/features/enquiries/services/enquiry-intelligence";
import styles from "./odin-insight-card.module.css";

export interface OdinInsightCardProps {
  insight: OdinContextualInsight;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onAppendToClarification?: (text: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

function getSeverityBadge(severity: OdinInsightSeverity): { label: string; styleClass: string } {
  switch (severity) {
    case "blocker":
      return { label: "Critical", styleClass: styles.badgeBlocker };
    case "verification":
      return { label: "Needs verification", styleClass: styles.badgeVerification };
    case "inferred":
      return { label: "Inferred", styleClass: styles.badgeInferred };
    case "recommendation":
      return { label: "Recommendation", styleClass: styles.badgeRecommendation };
    case "risk":
      return { label: "Risk", styleClass: styles.badgeRisk };
    case "change":
      return { label: "Change", styleClass: styles.badgeChange };
    case "contradiction":
      return { label: "Unresolved", styleClass: styles.badgeContradiction };
    case "strength":
    default:
      return { label: "Strength", styleClass: styles.badgeStrength };
  }
}

export const OdinInsightCard: React.FC<OdinInsightCardProps> = ({
  insight,
  isExpanded,
  onToggleExpand,
  onMouseEnter,
  onMouseLeave,
  onAppendToClarification,
  onNavigateToTab,
}) => {
  const badge = getSeverityBadge(insight.severity);
  const hasExpandedDetails = Boolean(
    insight.whyFlagged || insight.affectedArea || insight.suggestedQuestion
  );

  return (
    <div
      className={`${styles.card} ${isExpanded ? styles.cardExpanded : ""}`}
      onClick={onToggleExpand}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── Top Row: ODIN avatar + Title + Scope + Quick Action + Chevron ──── */}
      <div className={styles.topRow}>
        <div className={styles.titleWrap}>
          <div className={styles.odinAvatar}>
            <Sparkles size={11} className={styles.sparkleIcon} />
          </div>
          <div className={styles.titleTextWrap}>
            <h4 className={styles.insightTitle}>{insight.title}</h4>
            <span className={styles.scopeLabel}>{insight.scopeLabel}</span>
          </div>
        </div>

        <div className={styles.topRightActions}>
          {insight.actionPrimary && (
            <button
              type="button"
              className={styles.quickActionBtn}
              onClick={(e) => {
                e.stopPropagation();
                if (
                  (insight.actionPrimary?.type === "add_clarification" ||
                    insight.actionPrimary?.type === "confirm_client" ||
                    insight.actionPrimary?.type === "request_document") &&
                  insight.actionPrimary.payload
                ) {
                  onAppendToClarification?.(insight.actionPrimary.payload);
                } else if (insight.actionPrimary?.type === "view_evidence") {
                  onNavigateToTab?.("evidence");
                } else if (insight.actionPrimary?.type === "view_requirement") {
                  onNavigateToTab?.("requirements");
                }
              }}
            >
              {insight.actionPrimary.type === "add_clarification" ||
              insight.actionPrimary.type === "request_document" ||
              insight.actionPrimary.type === "confirm_client" ? (
                <PlusCircle size={11} />
              ) : (
                <ExternalLink size={11} />
              )}
              <span>{insight.actionPrimary.label}</span>
            </button>
          )}

          <button
            type="button"
            className={styles.chevronBtn}
            aria-label={isExpanded ? "Collapse details" : "Expand details"}
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* ── Body: Concise 1-2 line summary ──────────────────────────────────── */}
      <p className={styles.summaryText}>{insight.summary}</p>

      {/* ── Expanded Content (Flat Disclosure) ─────────────────────────────── */}
      {isExpanded && hasExpandedDetails && (
        <div
          className={styles.expandedSection}
          onClick={(e) => e.stopPropagation()}
        >
          {insight.whyFlagged && (
            <div className={styles.detailGroup}>
              <span className={styles.detailLabel}>WHY FLAGGED</span>
              <p className={styles.detailValue}>{insight.whyFlagged}</p>
            </div>
          )}
          {insight.affectedArea && (
            <div className={styles.detailGroup}>
              <span className={styles.detailLabel}>AFFECTED AREA</span>
              <p className={styles.detailValue}>{insight.affectedArea}</p>
            </div>
          )}
          {insight.suggestedQuestion && (
            <div className={styles.detailGroup}>
              <span className={styles.detailLabel}>SUGGESTED QUESTION</span>
              <p className={styles.detailValue}>{insight.suggestedQuestion}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Footer / Meta Row: Tags & Severity ───────────────────────────────── */}
      <div className={styles.footerRow}>
        <div className={styles.tagsWrap}>
          <span className={`${styles.badge} ${badge.styleClass}`}>
            {badge.label}
          </span>
          {insight.domainTag && (
            <span className={styles.domainTag}>{insight.domainTag}</span>
          )}
        </div>
      </div>
    </div>
  );
};
