"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../../app/settings/settings.module.css";

interface SettingsNavigationProps {
  showDeveloperTab: boolean;
}

const TABS = [
  { path: "/settings/account", label: "Profile" },
  { path: "/settings/workspace", label: "Workspace" },
  { path: "/settings/team", label: "Team" },
  { path: "/settings/business-profile", label: "Business Profile" },
  { path: "/settings/services", label: "Services & Portfolio" },
  { path: "/settings/billing", label: "Billing" },
  { path: "/settings/preferences", label: "Preferences" },
  { path: "/settings/help", label: "Help & Support" },
];

export function SettingsNavigation({ showDeveloperTab }: SettingsNavigationProps) {
  const pathname = usePathname();

  const tabs = [
    ...TABS,
    ...(showDeveloperTab ? [{ path: "/settings/developer", label: "Developer" }] : []),
  ];

  return (
    <div className={styles.tabsBar}>
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.path);
        return (
          <Link
            key={tab.path}
            href={tab.path}
            className={`${styles.tabButton} ${isActive ? styles.activeTab : ""}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
