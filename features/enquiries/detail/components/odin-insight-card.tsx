"use client";

import React from "react";
import {
  Sparkles,
  ChevronDown,
} from "lucide-react";
import {
  StudioDuotoneIcon,
  AnalyticsDuotoneIcon,
  DocumentsDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import {
  OdinContextualInsight,
  OdinInsightSeverity,
} from "@/features/enquiries/services/enquiry-intelligence";
import styles from "./odin-insight-card.module.css";

export interface OdinInsightCardProps {
  insight: OdinContextualInsight;
  index?: number;
  totalCount?: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onAppendToClarification?: (text: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

interface SeverityConfig {
  label: string;
  styleClass: string;
}

function getSeverityConfig(severity: OdinInsightSeverity): SeverityConfig {
  switch (severity) {
    case "blocker":
      return {
        label: "Critical",
        styleClass: styles.pillRed,
      };
    case "verification":
      return {
        label: "Verification",
        styleClass: styles.pillAmber,
      };
    case "inferred":
      return {
        label: "Inferred",
        styleClass: styles.pillPurple,
      };
    case "recommendation":
      return {
        label: "Recommendation",
        styleClass: styles.pillBlue,
      };
    case "risk":
      return {
        label: "Risk",
        styleClass: styles.pillRed,
      };
    case "change":
      return {
        label: "Change",
        styleClass: styles.pillGrey,
      };
    case "contradiction":
      return {
        label: "Unresolved",
        styleClass: styles.pillAmber,
      };
    case "strength":
    default:
      return {
        label: "Strength",
        styleClass: styles.pillGreen,
      };
  }
}

function getInsightIcon(severity: OdinInsightSeverity) {
  if (severity === "blocker" || severity === "risk" || severity === "contradiction") {
    return AnalyticsDuotoneIcon;
  }
  if (severity === "verification" || severity === "inferred") {
    return DocumentsDuotoneIcon;
  }
  return StudioDuotoneIcon;
}

export const OdinInsightCard: React.FC<OdinInsightCardProps> = ({
  insight,
  isExpanded,
  onToggleExpand,
  onAppendToClarification,
  onNavigateToTab,
}) => {
  const badgeConfig = getSeverityConfig(insight.severity);
  const IconComponent = getInsightIcon(insight.severity);

  const handlePrimaryAction = () => {
    if (!insight.actionPrimary) return;
    const { type, payload } = insight.actionPrimary;

    if (
      (type === "add_clarification" || type === "confirm_client" || type === "request_document") &&
      payload
    ) {
      onAppendToClarification?.(payload);
    } else if (type === "view_evidence") {
      onNavigateToTab?.("evidence");
    } else if (type === "view_requirement") {
      onNavigateToTab?.("requirements");
    }
  };

  const hasExpandedDetails = Boolean(
    insight.whyFlagged || insight.affectedArea || insight.suggestedQuestion
  );

  return (
    <div
      className={`${styles.cardShell} ${
        isExpanded ? styles.cardShellExpanded : ""
      }`}
    >
      {/* Clickable Header Row matching Homepage ODIN Studio */}
      <button
        type="button"
        onClick={onToggleExpand}
        className={styles.cardHeaderBtn}
        aria-expanded={isExpanded}
        aria-label={`${insight.title} insight details`}
      >
        <div className={styles.cardLeftGroup}>
          <div className={styles.sidebarThemedIconBox}>
            <IconComponent size={18} />
          </div>
          <div className={styles.cardTextStack}>
            <strong className={styles.cardTitle}>{insight.title}</strong>
            {insight.domainTag && (
              <span className={styles.cardSubtitle}>{insight.domainTag}</span>
            )}
          </div>
        </div>

        <div className={styles.cardRightGroup}>
          <span className={`${styles.statusPill} ${badgeConfig.styleClass}`}>
            {badgeConfig.label}
          </span>
          <ChevronDown
            size={13}
            className={`${styles.chevronIcon} ${
              isExpanded ? styles.chevronIconExpanded : ""
            }`}
          />
        </div>
      </button>

      {/* Expanded Body matching Homepage */}
      {isExpanded && (
        <div className={styles.expandedBody}>
          <p className={styles.expandedDesc}>{insight.summary}</p>

          {hasExpandedDetails && (
            <div className={styles.detailsGroup}>
              {insight.whyFlagged && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Why flagged:</span>
                  <span className={styles.detailValue}>{insight.whyFlagged}</span>
                </div>
              )}
              {insight.affectedArea && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Affected area:</span>
                  <span className={styles.detailValue}>{insight.affectedArea}</span>
                </div>
              )}
              {insight.suggestedQuestion && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Suggested question:</span>
                  <span className={styles.detailValue}>{insight.suggestedQuestion}</span>
                </div>
              )}
            </div>
          )}

          {insight.actionPrimary && (
            <div className={styles.expandedCtaRow}>
              <button
                type="button"
                className={styles.expandedCtaBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrimaryAction();
                }}
              >
                <Sparkles size={11} />
                <span>{insight.actionPrimary.label}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
