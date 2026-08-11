"use client";

import React from "react";
import { Sparkles, PlusCircle, FileText, ExternalLink, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { OdinContextualInsight, OdinInsightSeverity } from "@/features/enquiries/services/enquiry-intelligence";
import styles from "./odin-insights-panel.module.css";

export interface OdinInsightsPanelProps {
  scope: "requirements" | "evidence" | "client" | "intelligence" | "activity";
  insights: OdinContextualInsight[];
  onAppendToClarification?: (text: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

function getScopeTitle(scope: string): string {
  switch (scope) {
    case "requirements":
      return "Requirements";
    case "evidence":
      return "Site & Evidence";
    case "client":
      return "Client Context";
    case "intelligence":
      return "Decision Summary";
    case "activity":
      return "Activity";
    default:
      return "Context Summary";
  }
}

function getSeverityBadge(severity: OdinInsightSeverity): { label: string; styleClass: string } | null {
  switch (severity) {
    case "blocker":
      return { label: "Critical", styleClass: styles.badgeBlocker };
    case "verification":
      return { label: "Needs verification", styleClass: styles.badgeVerification };
    case "recommendation":
      return { label: "Recommendation", styleClass: styles.badgeRecommendation };
    case "risk":
      return { label: "Risk", styleClass: styles.badgeRisk };
    case "contradiction":
      return { label: "Unresolved", styleClass: styles.badgeContradiction };
    default:
      return null;
  }
}

export const OdinInsightsPanel: React.FC<OdinInsightsPanelProps> = ({
  scope,
  insights,
  onAppendToClarification,
  onNavigateToTab,
}) => {
  return (
    <div className={styles.insightsCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerTitleWrap}>
          <div className={styles.iconWrap}>
            <Sparkles size={14} className={styles.sparkleIcon} />
          </div>
          <div>
            <h3 className={styles.mainTitle}>ODIN INSIGHTS</h3>
            <span className={styles.subTitle}>{getScopeTitle(scope)}</span>
          </div>
        </div>
      </div>

      <div className={styles.insightsList}>
        {insights.map((item) => {
          const badge = getSeverityBadge(item.severity);

          return (
            <div key={item.id} className={styles.insightItem}>
              <div className={styles.itemHeader}>
                <span className={styles.bulletDot}>•</span>
                <p className={styles.insightText}>{item.text}</p>
              </div>

              <div className={styles.itemMetaRow}>
                {badge && (
                  <span className={`${styles.badge} ${badge.styleClass}`}>
                    {badge.label}
                  </span>
                )}

                {item.action && (
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={() => {
                      if (item.action?.type === "add_clarification" && item.action.payload) {
                        onAppendToClarification?.(item.action.payload);
                      } else if (item.action?.type === "request_document" && item.action.payload) {
                        onAppendToClarification?.(item.action.payload);
                      } else if (item.action?.type === "view_evidence") {
                        onNavigateToTab?.("evidence");
                      }
                    }}
                  >
                    {item.action.type === "add_clarification" || item.action.type === "request_document" ? (
                      <PlusCircle size={11} />
                    ) : (
                      <ExternalLink size={11} />
                    )}
                    <span>{item.action.label}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
