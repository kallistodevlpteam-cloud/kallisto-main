"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import styles from "./enquiry-detail-tabs.module.css";

export type EnquiryTabKey =
  | "overview"
  | "client"
  | "requirements"
  | "evidence"
  | "team"
  | "materials"
  | "hands"
  | "basics"
  | "activity";

export interface EnquiryTabItem {
  key: EnquiryTabKey;
  label: string;
  count?: number;
}

export const ENQUIRY_TABS: EnquiryTabItem[] = [
  { key: "overview", label: "Overview" },
  { key: "client", label: "Client Context" },
  { key: "requirements", label: "Requirements" },
  { key: "evidence", label: "Site & Evidence" },
];

export const UPCOMING_PROJECT_TABS: EnquiryTabItem[] = [
  { key: "overview", label: "Overview" },
  { key: "client", label: "Client Context" },
  { key: "requirements", label: "Requirements" },
  { key: "evidence", label: "Site & Evidence" },
];

export const PROJECT_TABS: EnquiryTabItem[] = [
  { key: "overview", label: "Overview" },
  { key: "client", label: "Client Context" },
  { key: "requirements", label: "Requirements" },
  { key: "evidence", label: "Site & Evidence" },
  { key: "team", label: "Team members" },
  { key: "materials", label: "Materials" },
  { key: "hands", label: "Hands" },
  { key: "basics", label: "Basics" },
  { key: "activity", label: "Activity" },
];

export function resolveValidTabKey(
  queryTab: string | null,
  mode: "enquiry" | "project" | "upcoming" = "enquiry",
): EnquiryTabKey {
  if (!queryTab) return "overview";
  const tabsList = mode === "project" ? PROJECT_TABS : (mode === "upcoming" ? UPCOMING_PROJECT_TABS : ENQUIRY_TABS);
  const validKeys = tabsList.map((t) => t.key);
  return validKeys.includes(queryTab as EnquiryTabKey) ? (queryTab as EnquiryTabKey) : "overview";
}

export interface EnquiryDetailTabsProps {
  activeTab?: EnquiryTabKey;
  onTabChange?: (tab: EnquiryTabKey) => void;
  className?: string;
  mode?: "enquiry" | "project" | "upcoming";
  tabs?: EnquiryTabItem[];
}

export function EnquiryDetailTabs({
  activeTab: controlledTab,
  onTabChange,
  className,
  mode = "enquiry",
  tabs: customTabs,
}: EnquiryDetailTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabsList = customTabs || (mode === "project" ? PROJECT_TABS : ENQUIRY_TABS);
  const rawTab = searchParams.get("tab");
  const currentTab = controlledTab || resolveValidTabKey(rawTab, mode);

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
        {tabsList.map((tab) => {
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
