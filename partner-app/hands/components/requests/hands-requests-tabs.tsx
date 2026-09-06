"use client";

import React from "react";
import {
  EnquiriesDuotoneIcon,
  ShieldDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { LabourRequestStatus } from "../../types/request-domain";
import styles from "./hands-requests.module.css";

function ClosedDuotoneIcon({
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
      {/* Tinted archive box base */}
      <path
        d="M4 8H20V19C20 20.1 19.1 21 18 21H6C4.9 21 4 20.1 4 19V8Z"
        fill="currentColor"
        opacity="0.38"
      />
      {/* Solid lid */}
      <path
        d="M2 4C2 3.4 2.4 3 3 3H21C21.6 3 22 3.4 22 4V7C22 7.6 21.6 8 21 8H3C2.4 8 2 7.6 2 7V4Z"
        fill="currentColor"
      />
      {/* Handle slot */}
      <rect x="9.5" y="11.5" width="5" height="2" rx="1" fill="#ffffff" />
    </svg>
  );
}

interface HandsRequestsTabsProps {
  activeTab: LabourRequestStatus;
  onTabChange: (tab: LabourRequestStatus) => void;
  counts: {
    new: number;
    accepted: number;
    closed: number;
  };
}

export function HandsRequestsTabs({
  activeTab,
  onTabChange,
  counts,
}: HandsRequestsTabsProps) {
  const tabs: {
    id: LabourRequestStatus;
    label: string;
    count: number;
    icon: React.ElementType;
  }[] = [
    { id: "new", label: "Requests", count: counts.new, icon: EnquiriesDuotoneIcon },
    { id: "accepted", label: "Accepted", count: counts.accepted, icon: ShieldDuotoneIcon },
    { id: "closed", label: "Closed", count: counts.closed, icon: ClosedDuotoneIcon },
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
