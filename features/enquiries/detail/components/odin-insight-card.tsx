"use client";

import React from "react";
import {
  Sparkles,
  ChevronDown,
  HelpCircle,
  FileText,
  MessageSquare,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Tag,
  Plus,
} from "lucide-react";
import { OdinContextualInsight, OdinInsightSeverity } from "@/features/enquiries/services/enquiry-intelligence";
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
  icon: React.ReactNode;
}

function getSeverityConfig(severity: OdinInsightSeverity): SeverityConfig {
  switch (severity) {
    case "blocker":
      return {
        label: "Critical",
        styleClass: styles.badgeBlocker,
        icon: <AlertTriangle size={12} className={styles.badgeIcon} />,
      };
    case "verification":
      return {
        label: "Needs Verification",
        styleClass: styles.badgeVerification,
        icon: <HelpCircle size={12} className={styles.badgeIcon} />,
      };
    case "inferred":
      return {
        label: "Inferred",
        styleClass: styles.badgeInferred,
        icon: <Sparkles size={12} className={styles.badgeIcon} />,
      };
    case "recommendation":
      return {
        label: "Recommendation",
        styleClass: styles.badgeRecommendation,
        icon: <Info size={12} className={styles.badgeIcon} />,
      };
    case "risk":
      return {
        label: "Risk",
        styleClass: styles.badgeRisk,
        icon: <AlertCircle size={12} className={styles.badgeIcon} />,
      };
    case "change":
      return {
        label: "Change",
        styleClass: styles.badgeChange,
        icon: <Info size={12} className={styles.badgeIcon} />,
      };
    case "contradiction":
      return {
        label: "Unresolved",
        styleClass: styles.badgeContradiction,
        icon: <AlertCircle size={12} className={styles.badgeIcon} />,
      };
    case "strength":
    default:
      return {
        label: "Strength",
        styleClass: styles.badgeStrength,
        icon: <CheckCircle2 size={12} className={styles.badgeIcon} />,
      };
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
  const badgeConfig = getSeverityConfig(insight.severity);

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
      className={`${styles.cardShell} ${isExpanded ? styles.cardShellExpanded : ""}`}
      onClick={onToggleExpand}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── 1. LAYER 1: HEADER ROW ────────────────────────────────────────── */}
      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <div className={styles.iconBox}>
            <Sparkles size={13} className={styles.sparkleIcon} />
          </div>
          <h4 className={styles.cardTitle}>{insight.title}</h4>
        </div>

        <button
          type="button"
          className={styles.chevronBtn}
          aria-label={isExpanded ? "Collapse details" : "Expand details"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
        >
          <ChevronDown
            size={14}
            className={`${styles.chevronIcon} ${isExpanded ? styles.chevronIconExpanded : ""}`}
          />
        </button>
      </div>

      {/* ── 2. LAYER 2: SECONDARY INNER CONTENT CARD (#ffffff) — COLLAPSIBLE ── */}
      <div
        className={`${styles.collapsibleContainer} ${
          isExpanded ? styles.collapsibleContainerExpanded : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.collapsibleInner}>
          <div className={styles.innerCard}>
            {/* Summary Paragraph */}
            <p className={styles.summaryText}>{insight.summary}</p>

            {/* Expanded Details */}
            {hasExpandedDetails && (
              <div className={styles.detailsGroup}>
                {insight.whyFlagged && (
                  <div className={styles.detailRow}>
                    <div className={styles.labelCol}>
                      <div className={styles.rowIconWrap}>
                        <HelpCircle size={12} className={styles.rowIcon} />
                      </div>
                      <span className={styles.labelText}>Why flagged:</span>
                    </div>
                    <p className={styles.valueText}>{insight.whyFlagged}</p>
                  </div>
                )}

                {insight.affectedArea && (
                  <div className={styles.detailRow}>
                    <div className={styles.labelCol}>
                      <div className={styles.rowIconWrap}>
                        <FileText size={12} className={styles.rowIcon} />
                      </div>
                      <span className={styles.labelText}>Affected area:</span>
                    </div>
                    <p className={styles.valueText}>{insight.affectedArea}</p>
                  </div>
                )}

                {insight.suggestedQuestion && (
                  <div className={styles.detailRow}>
                    <div className={styles.labelCol}>
                      <div className={styles.rowIconWrap}>
                        <MessageSquare size={12} className={styles.rowIcon} />
                      </div>
                      <span className={styles.labelText}>Suggested question:</span>
                    </div>
                    <p className={styles.valueText}>{insight.suggestedQuestion}</p>
                  </div>
                )}
              </div>
            )}

            {/* Semantic Tags Row */}
            <div className={styles.tagsRow}>
              <span className={`${styles.badge} ${badgeConfig.styleClass}`}>
                {badgeConfig.icon}
                <span>{badgeConfig.label}</span>
              </span>
              {insight.domainTag && (
                <span className={styles.domainTag}>
                  <Tag size={11} className={styles.tagIcon} />
                  <span>{insight.domainTag}</span>
                </span>
              )}
            </div>
          </div>

          {/* ── 3. LAYER 3: FOOTER CTA BUTTON ── */}
          {insight.actionPrimary && (
            <div className={styles.footerCtaWrap} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className={styles.ctaButton}
                onClick={handlePrimaryAction}
              >
                <Plus size={13} />
                <span>{insight.actionPrimary.label}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
