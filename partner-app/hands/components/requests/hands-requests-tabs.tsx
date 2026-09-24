"use client";

import React from "react";
import { EnquiriesDuotoneIcon } from "@/components/layout/sidebar-icons";
import { HandsRequestTabType } from "../../types/request-domain";
import styles from "./hands-requests.module.css";

function HistoryIcon({
  size = 16,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </svg>
  );
}

export interface HandsRequestsTabsProps {
  activeTab: HandsRequestTabType;
  onTabChange: (tab: HandsRequestTabType) => void;
  counts: {
    requests: number;
    history?: number;
  };
}

export function HandsRequestsTabs({
  activeTab,
  onTabChange,
  counts,
}: HandsRequestsTabsProps) {
  const tabs: {
    id: HandsRequestTabType;
    label: string;
    count?: number;
    icon: React.ElementType;
  }[] = [
    {
      id: "requests",
      label: "Requests",
      count: counts.requests,
      icon: EnquiriesDuotoneIcon,
    },
    {
      id: "history",
      label: "History",
      count: counts.history,
      icon: HistoryIcon,
    },
  ];

  return (
    <div className={styles.segmentedTabsContainer} role="tablist" aria-label="Request Status Navigation">
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            className={`${styles.segmentedTabBtn} ${isSelected ? styles.segmentedTabBtnActive : ""}`}
            onClick={() => onTabChange(tab.id)}
            role="tab"
            aria-selected={isSelected}
          >
            <Icon size={16} className={isSelected ? styles.tabIconActive : styles.tabIconInactive} />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`${styles.segmentedTabCount} ${isSelected ? styles.segmentedTabCountActive : ""}`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
