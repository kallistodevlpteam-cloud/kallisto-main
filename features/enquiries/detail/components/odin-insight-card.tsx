"use client";

import React, { useState } from "react";
import {
  Sparkles,
  PlusCircle,
  ExternalLink,
  ChevronDown,
  HelpCircle,
  FileText,
  MessageSquare,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Tag,
  Copy,
  Check,
} from "lucide-react";
import { OdinContextualInsight, OdinInsightSeverity } from "@/features/enquiries/services/enquiry-intelligence";
import styles from "./odin-insight-card.module.css";

export interface OdinInsightCardProps {
  insight: OdinContextualInsight;
  index: number;
  totalCount: number;
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
  index,
  totalCount,
  isExpanded,
  onToggleExpand,
  onMouseEnter,
  onMouseLeave,
  onAppendToClarification,
  onNavigateToTab,
}) => {
  const [copied, setCopied] = useState(false);
  const badgeConfig = getSeverityConfig(insight.severity);

  const handleCopyInsight = () => {
    const textToCopy = `[ODIN Insight] ${insight.title}
Summary: ${insight.summary}
Why flagged: ${insight.whyFlagged || "N/A"}
Affected area: ${insight.affectedArea || "N/A"}
Suggested question: ${insight.suggestedQuestion || "N/A"}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  return (
    <div
      className={`${styles.card} ${isExpanded ? styles.cardExpanded : ""}`}
      onClick={onToggleExpand}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── Header Row: ODIN Icon + Label (Left) | Counter + Chevron (Right) ──── */}
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.odinAvatar}>
            <Sparkles size={11} className={styles.sparkleIcon} />
          </div>
          <span className={styles.headerLabelText}>ODIN Insight</span>
        </div>

        <div className={styles.headerRight}>
          <span className={styles.counterBadge}>
            {index + 1} of {totalCount}
          </span>
          <button
            type="button"
            className={styles.chevronBtn}
            aria-label={isExpanded ? "Collapse details" : "Expand details"}
          >
            <ChevronDown
              size={14}
              className={`${styles.chevronIcon} ${isExpanded ? styles.chevronIconExpanded : ""}`}
            />
          </button>
        </div>
      </div>

      {/* ── Title & Summary ──────────────────────────────────────────────────── */}
      <h4 className={styles.insightTitle}>{insight.title}</h4>
      <p className={styles.summaryText}>{insight.summary}</p>

      {/* ── Expanded State: Hairline Dividers + Structured Detail Rows ─────── */}
      {isExpanded && (
        <div
          className={styles.expandedSection}
          onClick={(e) => e.stopPropagation()}
        >
          {insight.whyFlagged && (
            <div className={styles.detailRow}>
              <div className={styles.rowLabelGroup}>
                <div className={styles.rowIconWrap}>
                  <HelpCircle size={12} className={styles.rowIcon} />
                </div>
                <span className={styles.rowLabelText}>Why flagged</span>
              </div>
              <p className={styles.rowValueText}>{insight.whyFlagged}</p>
            </div>
          )}

          {insight.affectedArea && (
            <div className={styles.detailRow}>
              <div className={styles.rowLabelGroup}>
                <div className={styles.rowIconWrap}>
                  <FileText size={12} className={styles.rowIcon} />
                </div>
                <span className={styles.rowLabelText}>Affected area</span>
              </div>
              <p className={styles.rowValueText}>{insight.affectedArea}</p>
            </div>
          )}

          {insight.suggestedQuestion && (
            <div className={styles.detailRow}>
              <div className={styles.rowLabelGroup}>
                <div className={styles.rowIconWrap}>
                  <MessageSquare size={12} className={styles.rowIcon} />
                </div>
                <span className={styles.rowLabelText}>Suggested question</span>
              </div>
              <p className={styles.rowValueText}>{insight.suggestedQuestion}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Semantic Tags Row ────────────────────────────────────────────────── */}
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

      {/* ── Expanded Action Footer Buttons ───────────────────────────────────── */}
      {isExpanded && (
        <div
          className={styles.actionFooter}
          onClick={(e) => e.stopPropagation()}
        >
          {insight.actionPrimary && (
            <button
              type="button"
              className={styles.actionPrimaryBtn}
              onClick={handlePrimaryAction}
            >
              <PlusCircle size={12} />
              <span>{insight.actionPrimary.label}</span>
            </button>
          )}

          <button
            type="button"
            className={styles.actionSecondaryBtn}
            onClick={handleCopyInsight}
          >
            {copied ? (
              <Check size={12} className={styles.copiedCheckIcon} />
            ) : (
              <Copy size={12} />
            )}
            <span>{copied ? "Copied!" : "Copy insight"}</span>
          </button>
        </div>
      )}
    </div>
  );
};
