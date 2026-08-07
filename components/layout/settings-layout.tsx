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
    <div className={`${styles.settingsContainerWrapper} workspace-container`}>
      <div className={`${styles.settingsFixedHeader} page-heading`} style={{ display: "block", marginBottom: "24px" }}>
        <p className="eyebrow">Kallisto</p>
        <h1 style={{ margin: "0 0 8px 0" }}>Settings</h1>
        <p className="heading-note">
          Manage your personal profile, workspace identity, team permissions, and preferences.
        </p>
      </div>

      <div className={styles.settingsFixedTabs}>
        <SettingsNavigation showDeveloperTab={showDeveloperTab} />
      </div>

      <div className={styles.settingsContentOutlet}>
        <div className={styles.settingsContentScrollArea}>
          {children}
        </div>
      </div>
    </div>
  );
}
