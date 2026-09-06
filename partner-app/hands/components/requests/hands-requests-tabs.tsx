"use client";

import React from "react";
import { EnquiriesDuotoneIcon } from "@/components/layout/sidebar-icons";
import { HandsRequestTabType } from "../../types/request-domain";
import styles from "./hands-requests.module.css";

function HistoryDuotoneIcon({
  size = 14,
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
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Tinted circle base */}
      <circle cx="12" cy="12" r="9.5" fill="currentColor" opacity="0.25" />
      {/* Clock hands */}
      <path
        d="M12 7V12L15.5 14.2"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Rewind counter-clockwise arc */}
      <path
        d="M3.5 12A8.5 8.5 0 0 1 12 3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
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
    { id: "requests", label: "Requests", count: counts.requests, icon: EnquiriesDuotoneIcon },
    { id: "history", label: "History", icon: HistoryDuotoneIcon },
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
            <Icon size={14} className={isSelected ? styles.tabIconActive : styles.tabIconInactive} />
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
