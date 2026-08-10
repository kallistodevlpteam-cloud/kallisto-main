"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import styles from "./enquiry-detail-tabs.module.css";

export type EnquiryTabKey =
  | "overview"
  | "requirements"
  | "evidence"
  | "client"
  | "intelligence"
  | "activity";

export interface EnquiryTabItem {
  key: EnquiryTabKey;
  label: string;
  count?: number;
}

export const ENQUIRY_TABS: EnquiryTabItem[] = [
  { key: "overview", label: "Overview" },
  { key: "requirements", label: "Requirements" },
  { key: "evidence", label: "Site & Evidence" },
  { key: "client", label: "Client Context" },
  { key: "intelligence", label: "ODIN Intelligence" },
  { key: "activity", label: "Activity" },
];

export function resolveValidTabKey(queryTab: string | null): EnquiryTabKey {
  if (!queryTab) return "overview";
  const validKeys: EnquiryTabKey[] = [
    "overview",
    "requirements",
    "evidence",
    "client",
    "intelligence",
    "activity",
  ];
  return validKeys.includes(queryTab as EnquiryTabKey) ? (queryTab as EnquiryTabKey) : "overview";
}

export interface EnquiryDetailTabsProps {
  activeTab?: EnquiryTabKey;
  onTabChange?: (tab: EnquiryTabKey) => void;
  className?: string;
}

export function EnquiryDetailTabs({
  activeTab: controlledTab,
  onTabChange,
  className,
}: EnquiryDetailTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const rawTab = searchParams.get("tab");
  const currentTab = controlledTab || resolveValidTabKey(rawTab);

  function handleTabClick(key: EnquiryTabKey) {
    if (onTabChange) {
      onTabChange(key);
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", key);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <nav
      className={`${styles.tabNav}${className ? ` ${className}` : ""}`}
      aria-label="Enquiry detail sections"
    >
      <div className={styles.tabList} role="tablist">
        {ENQUIRY_TABS.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.key}`}
              id={`tab-${tab.key}`}
              className={`${styles.tabBtn} ${isActive ? styles.tabActive : ""}`}
              onClick={() => handleTabClick(tab.key)}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && <span className={styles.countBadge}>{tab.count}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
