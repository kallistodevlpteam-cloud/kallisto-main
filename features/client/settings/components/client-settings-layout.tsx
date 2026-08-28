"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ClientSettingsNavigation } from "./client-settings-navigation";
import styles from "../styles/client-settings.module.css";

interface ClientSettingsLayoutProps {
  children: React.ReactNode;
}

export function ClientSettingsLayout({ children }: ClientSettingsLayoutProps) {
  return (
    <div className={styles.settingsPageLayout}>
      <header className={styles.settingsFixedHeader}>
        <p className={styles.eyebrow}>Client Portal</p>
        <h1 className={styles.settingsTitle}>Account & Project Settings</h1>
        <p className={styles.settingsDescription}>
          Manage your personal account, project access permissions, payment preferences, and Odin AI controls.
        </p>
      </header>

      <div className={styles.twoPaneContainer}>
        <aside className={styles.navFixedAside}>
          <ClientSettingsNavigation />
        </aside>

        <main className={styles.contentScrollableOutlet}>
          <div className={styles.contentScrollArea}>
            <div className={styles.mobileBackBar}>
              <Link href="/client/settings" className={styles.backLink}>
                <ArrowLeft size={14} />
                <span>All Settings</span>
              </Link>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
