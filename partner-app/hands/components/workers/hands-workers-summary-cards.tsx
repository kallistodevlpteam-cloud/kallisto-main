"use client";

import React from "react";
import {
  TeamDuotoneIcon,
  ProjectsDuotoneIcon,
  StudioDuotoneIcon,
  AnalyticsDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { WorkforceSummaryMetrics } from "../../types/worker-domain";
import styles from "./hands-workers.module.css";

interface HandsWorkersSummaryCardsProps {
  metrics: WorkforceSummaryMetrics;
}

export function HandsWorkersSummaryCards({ metrics }: HandsWorkersSummaryCardsProps) {
  const cards = [
    {
      id: "total",
      label: "Total Workers",
      value: metrics.totalWorkers,
      color: "#0f172a",
      bgColor: "#f1f5f9",
      icon: TeamDuotoneIcon,
    },
    {
      id: "assigned",
      label: "On Assignment",
      value: metrics.onAssignment,
      color: "#059669",
      bgColor: "#ecfdf5",
      icon: ProjectsDuotoneIcon,
    },
    {
      id: "available",
      label: "Available Today",
      value: metrics.availableToday,
      color: "#ea580c",
      bgColor: "#fff7ed",
      icon: StudioDuotoneIcon,
    },
    {
      id: "attention",
      label: "Needs Attention",
      value: metrics.needsAttention,
      color: "#dc2626",
      bgColor: "#fef2f2",
      icon: AnalyticsDuotoneIcon,
    },
  ];

  return (
    <div className={styles.summaryCardsGrid} role="region" aria-label="Workforce summary metrics">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.id} className={styles.summaryCard}>
            <div
              className={styles.summaryCardIconWrap}
              style={{ backgroundColor: card.bgColor, color: card.color }}
            >
              <Icon size={18} />
            </div>
            <div className={styles.summaryCardContent}>
              <span className={styles.summaryCardValue}>
                {card.value}
              </span>
              <span className={styles.summaryCardLabel}>{card.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
