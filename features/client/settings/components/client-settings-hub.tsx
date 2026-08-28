"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CLIENT_SETTINGS_CATEGORIES } from "./client-settings-navigation";
import styles from "../styles/client-settings.module.css";

export function ClientSettingsHub() {
  return (
    <div className={styles.settingsPageLayout}>
      <header className={styles.settingsFixedHeader}>
        <p className={styles.eyebrow}>Client Portal</p>
        <h1 className={styles.settingsTitle}>Settings</h1>
        <p className={styles.settingsDescription}>
          Manage your personal profile, project access, notification channels, payment methods, and privacy controls.
        </p>
      </header>

      <main className={styles.contentScrollableOutlet}>
        <div className={styles.contentScrollArea} style={{ maxWidth: "100%" }}>
          <div className={styles.hubGrid}>
            {CLIENT_SETTINGS_CATEGORIES.map((category) => (
              <div key={category.id} className={styles.hubCard}>
                <div className={styles.hubCardHeader}>
                  <span className={styles.hubCardHeaderTitle}>{category.label}</span>
                </div>
                <div className={styles.hubCardList}>
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href} className={styles.hubItemLink}>
                        <div className={styles.hubItemLeft}>
                          <div className={styles.hubItemIconWrap}>
                            <Icon size={16} />
                          </div>
                          <div className={styles.hubItemMeta}>
                            <span className={styles.hubItemTitle}>{item.label}</span>
                            <span className={styles.hubItemDesc}>{item.description}</span>
                          </div>
                        </div>
                        <ChevronRight size={16} className={styles.hubItemChevron} />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
