import React from "react";
import { getAuthenticatedWorkspaceContext } from "@/lib/permissions";
import { SettingsNavigation } from "./settings-navigation";
import styles from "../../app/settings/settings.module.css";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export async function SettingsLayout({ children }: SettingsLayoutProps) {
  const context = await getAuthenticatedWorkspaceContext();
  const showDeveloperTab = context.permissions.canManageApiKeys;

  return (
    <div className={styles.settingsContainerWrapper}>
      {/* 1. Page Header (Screenshot Style) */}
      <header className={styles.settingsFixedHeader}>
        <span className={styles.eyebrow}>CLIENT PORTAL</span>
        <h1 className={styles.settingsTitle}>Account & Project Settings</h1>
        <p className={styles.settingsDescription}>
          Manage your personal account, project access permissions, payment preferences, and Odin AI controls.
        </p>
      </header>

      {/* 2. Two-Pane Layout */}
      <div className={styles.twoPaneContainer}>
        {/* Left Sidebar Navigation */}
        <SettingsNavigation showDeveloperTab={showDeveloperTab} />

        {/* Right Main Content */}
        <main className={styles.settingsContentOutlet}>
          {children}
        </main>
      </div>
    </div>
  );
}
