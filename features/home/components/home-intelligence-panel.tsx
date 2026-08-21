"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Flame,
  AlertCircle,
  ChevronDown,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import {
  StudioDuotoneIcon,
  AnalyticsDuotoneIcon,
  DocumentsDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { PriorityPreview } from "@/types/domain/home";
import styles from "../home-workspace.module.css";

const PROJECT_THUMBNAILS: Record<string, string> = {
  "Skyline Heights": "/assets/projects/anitha-menon-residence.png",
  "Nila Residence": "/assets/projects/greenfield-villa.png",
  "Lakeview Apartments": "/assets/projects/oak-house.png",
  "Villa Azure": "/assets/projects/residence-24.png",
  "Anand Estate Villa": "/assets/nila-thumb1.jpg",
  "Palm Grove Residence": "/assets/nila-thumb2.jpg",
  "Greenfield Villa": "/assets/projects/greenfield_villa.png",
};

function getProjectImage(projectName: string, fallback?: string): string {
  return (
    PROJECT_THUMBNAILS[projectName] ||
    fallback ||
    "/assets/projects/anitha-menon-residence.png"
  );
}

interface StudioAiInsight {
  id: string;
  toolTitle: string;
  projectContext: string;
  description: string;
  icon: typeof StudioDuotoneIcon;
  studioRoute: string;
  ctaText: string;
  badgeText: string;
}

const STUDIO_AI_INSIGHTS: StudioAiInsight[] = [
  {
    id: "ai-1",
    toolTitle: "AI Plan & Scope Takeoff",
    projectContext: "Skyline Heights • Concept Rev 03",
    description:
      "ODIN prepared early space allocations and structural quantity estimates based on latest architectural floor plans.",
    icon: StudioDuotoneIcon,
    studioRoute: "/studio",
    ctaText: "Open in Studio",
    badgeText: "AI Draft",
  },
  {
    id: "ai-2",
    toolTitle: "BOQ Auto-Rate Alignment",
    projectContext: "Nila Residence • Foundation Variance",
    description:
      "3 soil excavation rate variances detected. Generate updated cost impact and variation report in Hive Studio.",
    icon: AnalyticsDuotoneIcon,
    studioRoute: "/studio",
    ctaText: "Generate BOQ",
    badgeText: "Cost Insight",
  },
  {
    id: "ai-3",
    toolTitle: "Drawing Compliance Audit",
    projectContext: "Lakeview Apartments • MEP Working Set",
    description:
      "Automated KMBR setback and ducting clearance check completed with 0 blocking violations.",
    icon: DocumentsDuotoneIcon,
    studioRoute: "/studio",
    ctaText: "Review Audit",
    badgeText: "Compliance",
  },
];

export interface HomeIntelligencePanelProps {
  attentionItems?: PriorityPreview[];
}

export function HomeIntelligencePanel({
  attentionItems = [],
}: HomeIntelligencePanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const visibleAttention = attentionItems.slice(0, 3);

  const getActionTitleIcon = (item: PriorityPreview) => {
    const tagLower = (item.tag || "").toLowerCase();
    if (
      item.priorityLevel === "critical" ||
      tagLower.includes("overdue") ||
      tagLower.includes("approval")
    ) {
      return <Flame size={12} className={styles.titleIconRed} />;
    }
    if (
      tagLower.includes("site") ||
      tagLower.includes("decision") ||
      tagLower.includes("issue")
    ) {
      return <AlertCircle size={12} className={styles.titleIconAmber} />;
    }
    if (
      tagLower.includes("boq") ||
      tagLower.includes("cost") ||
      tagLower.includes("quote")
    ) {
      return <FileSpreadsheet size={12} className={styles.titleIconPurple} />;
    }
    if (
      tagLower.includes("drawing") ||
      tagLower.includes("document") ||
      tagLower.includes("plan")
    ) {
      return <FileText size={12} className={styles.titleIconBlue} />;
    }
    return <AlertCircle size={12} className={styles.titleIconAmber} />;
  };

  return (
    <div className={styles.homeIntelligenceWrapper}>
      {/* 1. ODIN Studio Intelligence Insights (AI / Generative Assistant Hub) */}
      <div className={styles.hiveStudioSection}>
        <div className={styles.hiveStudioHeader}>
          <span className={styles.hiveStudioCategoryTitle}>ODIN STUDIO INSIGHTS</span>
          <span className={styles.hiveStudioCountBadge}>3 Active</span>
        </div>

        <div className={styles.hiveStudioCardList}>
          {STUDIO_AI_INSIGHTS.map((item) => {
            const isOpen = expandedId === item.id;
            const IconComponent = item.icon;

            return (
              <div
                key={item.id}
                className={`${styles.hiveExpandableCard} ${
                  isOpen ? styles.hiveExpandableCardOpen : ""
                }`}
              >
                {/* Clickable Header / Summary Row with Sidebar-style Duotone Icon */}
                <button
                  type="button"
                  onClick={() => toggleExpand(item.id)}
                  className={styles.hiveCardHeaderBtn}
                  aria-expanded={isOpen}
                  aria-label={`${item.toolTitle} insight details`}
                >
                  <div className={styles.hiveCardLeftGroup}>
                    <div className={styles.sidebarThemedIconBox}>
                      <IconComponent size={18} />
                    </div>
                    <div className={styles.hiveCardTextStack}>
                      <strong className={styles.hiveCardTitle}>
                        {item.toolTitle}
                      </strong>
                      <span className={styles.hiveCardSubtitle}>
                        {item.projectContext}
                      </span>
                    </div>
                  </div>
                  <div className={styles.hiveCardRightGroup}>
                    <span className={`${styles.hiveStatusPill} ${styles.pillGrey}`}>
                      {item.badgeText}
                    </span>
                    <ChevronDown
                      size={13}
                      className={`${styles.hiveChevronIcon} ${
                        isOpen ? styles.hiveChevronRotated : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded Details & CTA Area */}
                {isOpen && (
                  <div className={styles.hiveExpandedBody}>
                    <p className={styles.hiveExpandedDesc}>{item.description}</p>
                    <div className={styles.hiveExpandedCtaRow}>
                      <Link
                        href={item.studioRoute}
                        className={styles.hiveExpandedCtaBtn}
                      >
                        <Sparkles size={11} />
                        <span>{item.ctaText}</span>
                        <ArrowRight size={11} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Action Required Urgent Queue (Project Titled Cards with Project Images) */}
      <div className={styles.hiveStudioSection}>
        <div className={styles.hiveStudioHeader}>
          <div className={styles.actionTitleGroup}>
            <Flame size={13} className={styles.actionFlameIcon} />
            <span className={styles.hiveStudioCategoryTitle}>ACTION REQUIRED</span>
          </div>
          <span className={styles.hiveStudioCountBadgeAmber}>
            {attentionItems.length || 5}
          </span>
        </div>

        <div className={styles.hiveStudioCardList}>
          {visibleAttention.length === 0 ? (
            <div className={styles.sideEmptyBox}>
              <span>All priority actions cleared.</span>
            </div>
          ) : (
            visibleAttention.map((item) => {
              const isOpen = expandedId === item.id;
              const isCrit = item.priorityLevel === "critical";
              const targetRoute =
                item.destination.availability === "available"
                  ? item.destination.route
                  : "/projects";

              return (
                <div
                  key={item.id}
                  className={`${styles.hiveExpandableCard} ${
                    isOpen ? styles.hiveExpandableCardOpen : ""
                  }`}
                >
                  {/* Clickable Header / Summary Row with Project Image */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.id)}
                    className={styles.hiveCardHeaderBtn}
                    aria-expanded={isOpen}
                    aria-label={`${item.projectName} action details`}
                  >
                    <div className={styles.hiveCardLeftGroup}>
                      <img
                        src={getProjectImage(item.projectName)}
                        alt={`${item.projectName} thumbnail`}
                        className={styles.hiveProjectThumb}
                      />
                      <div className={styles.hiveCardTextStack}>
                        <div className={styles.hiveTitleWithIcon}>
                          <strong className={styles.hiveCardTitle}>
                            {item.projectName}
                          </strong>
                          {getActionTitleIcon(item)}
                        </div>
                        <span className={styles.hiveCardSubtitle}>
                          {item.tag}
                        </span>
                      </div>
                    </div>
                    <div className={styles.hiveCardRightGroup}>
                      <span
                        className={`${styles.hiveStatusPill} ${
                          isCrit ? styles.pillRed : styles.pillAmber
                        }`}
                      >
                        {item.dueText || (isCrit ? "Critical" : "High")}
                      </span>
                      <ChevronDown
                        size={13}
                        className={`${styles.hiveChevronIcon} ${
                          isOpen ? styles.hiveChevronRotated : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Expanded Details & CTA Area */}
                  {isOpen && (
                    <div className={styles.hiveExpandedBody}>
                      <p className={styles.hiveExpandedDesc}>
                        {item.subtitle ||
                          `${item.tag} for ${item.projectName}. Immediate action required.`}
                      </p>
                      <div className={styles.hiveExpandedCtaRow}>
                        <Link
                          href={targetRoute}
                          className={styles.hiveExpandedCtaBtn}
                        >
                          <span>{item.actionLabel || "Resolve Issue"}</span>
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
