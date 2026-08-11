"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { OdinContextualInsight } from "@/features/enquiries/services/enquiry-intelligence";
import { OdinInsightCard } from "./odin-insight-card";
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

export const OdinInsightsPanel: React.FC<OdinInsightsPanelProps> = ({
  scope,
  insights,
  onAppendToClarification,
  onNavigateToTab,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(insights[0]?.id ?? null);
  const [showAll, setShowAll] = useState(false);

  const visibleInsights = showAll ? insights : insights.slice(0, 4);
  const hasMore = insights.length > 4;

  return (
    <div className={styles.feedContainer}>
      {/* ── Feed Header ──────────────────────────────────────────────────────── */}
      <div className={styles.feedHeader}>
        <div className={styles.headerTitleWrap}>
          <div className={styles.iconWrap}>
            <Sparkles size={13} className={styles.sparkleIcon} />
          </div>
          <div>
            <h3 className={styles.feedTitle}>ODIN INSIGHTS</h3>
            <span className={styles.scopeSubtitle}>{getScopeTitle(scope)}</span>
          </div>
        </div>
        <span className={styles.countBadge}>{insights.length} active</span>
      </div>

      {/* ── Cards Stack Feed ─────────────────────────────────────────────────── */}
      <div className={styles.cardsStack}>
        {visibleInsights.map((insight) => (
          <OdinInsightCard
            key={insight.id}
            insight={insight}
            isExpanded={expandedId === insight.id}
            onToggleExpand={() => setExpandedId(expandedId === insight.id ? null : insight.id)}
            onAppendToClarification={onAppendToClarification}
            onNavigateToTab={onNavigateToTab}
          />
        ))}
      </div>

      {/* ── View All Toggle Link ──────────────────────────────────────────────── */}
      {hasMore && (
        <button
          type="button"
          className={styles.viewAllBtn}
          onClick={() => setShowAll(!showAll)}
        >
          <span>{showAll ? "Show top insights" : `View all ODIN insights (${insights.length})`}</span>
          <ArrowRight size={12} className={`${styles.arrowIcon} ${showAll ? styles.arrowUp : ""}`} />
        </button>
      )}
    </div>
  );
};
