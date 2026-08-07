"use client";

import React, { useState } from "react";
import styles from "../../app/settings/settings.module.css";
import { useSearchParams, useRouter } from "next/navigation";

interface PreferencesSettingsProps {
  user: {
    uid: string;
    role: string;
  };
}

export function PreferencesSettings({ user }: PreferencesSettingsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSub = searchParams.get("sub") || "appearance";

  // Appearance states
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  // Notification states
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(false);

  // Region states
  const [language, setLanguage] = useState("English (US)");
  const [timezone, setTimezone] = useState("Asia/Kolkata (IST)");

  // Calendar Defaults
  const [defaultView, setDefaultView] = useState("Board");

  // Project Defaults
  const [autoSave, setAutoSave] = useState(true);

  // Accessibility
  const [screenReaderOptimized, setScreenReaderOptimized] = useState(false);

  const handleSubTabChange = (sub: string) => {
    router.push(`/settings/preferences?sub=${sub}`);
  };

  const menuItems = [
    { key: "appearance", label: "Appearance" },
    { key: "notifications", label: "Notifications" },
    { key: "calendar", label: "Calendar defaults" },
    { key: "projects", label: "Project defaults" },
    { key: "region", label: "Language & region" },
    { key: "accessibility", label: "Accessibility" },
  ];

  return (
    <div className={`${styles.settingsContentOutlet} ${styles.preferencesSubLayout}`}>
      <div className={styles.preferencesSidebar}>
        {menuItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`${styles.sidebarItem} ${activeSub === item.key ? styles.sidebarItemActive : ""}`}
            onClick={() => handleSubTabChange(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className={styles.preferencesContent}>
        {activeSub === "appearance" && (
          <div className={styles.profileCleanContainer}>
            <section>
              <div className={styles.profileSectionHeader}>
                <h2 className={styles.profileSectionTitle}>Appearance</h2>
                <p className={styles.profileSectionSubtitle}>
                  Configure visual settings for your dashboard.
                </p>
              </div>

              <div className={styles.cleanFieldGroup}>
                <label className={styles.cleanFieldLabel}>Theme Selection</label>
                <select
                  className={styles.cleanSelect}
                  style={{ maxWidth: "320px" }}
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                >
                  <option value="light">Light Theme</option>
                  <option value="dark">Dark Theme</option>
                  <option value="system">System Default</option>
                </select>
              </div>
            </section>
          </div>
        )}

        {activeSub === "notifications" && (
          <div className={styles.profileCleanContainer}>
            <section>
              <div className={styles.profileSectionHeader}>
                <h2 className={styles.profileSectionTitle}>Notifications</h2>
                <p className={styles.profileSectionSubtitle}>
                  Choose how and when Kallisto alerts you.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div className={styles.toggleRow} style={{ marginTop: 0 }}>
                  <label className={styles.switchLabel}>
                    <input
                      type="checkbox"
                      className={`${styles.switchInput} ${styles.greenSwitchInput}`}
                      checked={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.checked)}
                    />
                    <span className={styles.greenSwitchSlider} />
                  </label>
                  <label className={styles.toggleMeta} onClick={() => setNotifyEmail(!notifyEmail)}>
                    <span className={styles.toggleTitle}>Email Notifications</span>
                    <span className={styles.toggleDesc}>
                      Receive structural requirement and milestone updates in your inbox.
                    </span>
                  </label>
                </div>

                <div className={styles.toggleRow} style={{ marginTop: 0 }}>
                  <label className={styles.switchLabel}>
                    <input
                      type="checkbox"
                      className={`${styles.switchInput} ${styles.greenSwitchInput}`}
                      checked={notifyPush}
                      onChange={(e) => setNotifyPush(e.target.checked)}
                    />
                    <span className={styles.greenSwitchSlider} />
                  </label>
                  <label className={styles.toggleMeta} onClick={() => setNotifyPush(!notifyPush)}>
                    <span className={styles.toggleTitle}>Push Alerts</span>
                    <span className={styles.toggleDesc}>
                      Enable instant pop-up alerts inside the Kallisto workspace.
                    </span>
                  </label>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeSub === "calendar" && (
          <div className={styles.profileCleanContainer}>
            <section>
              <div className={styles.profileSectionHeader}>
                <h2 className={styles.profileSectionTitle}>Calendar Defaults</h2>
                <p className={styles.profileSectionSubtitle}>
                  Set up default options for the interactive schedule.
                </p>
              </div>

              <div className={styles.cleanFieldGroup}>
                <label className={styles.cleanFieldLabel}>Default Work Schedule View</label>
                <select
                  className={styles.cleanSelect}
                  style={{ maxWidth: "320px" }}
                  value={defaultView}
                  onChange={(e) => setDefaultView(e.target.value)}
                >
                  <option value="Board">Board view</option>
                  <option value="Month">Month view</option>
                  <option value="Timeline">Timeline view</option>
                </select>
              </div>
            </section>
          </div>
        )}

        {activeSub === "projects" && (
          <div className={styles.profileCleanContainer}>
            <section>
              <div className={styles.profileSectionHeader}>
                <h2 className={styles.profileSectionTitle}>Project Defaults</h2>
                <p className={styles.profileSectionSubtitle}>
                  Default configurations for new bids and drawings.
                </p>
              </div>

              <div className={styles.toggleRow} style={{ marginTop: 0 }}>
                <label className={styles.switchLabel}>
                  <input
                    type="checkbox"
                    className={`${styles.switchInput} ${styles.greenSwitchInput}`}
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                  />
                  <span className={styles.greenSwitchSlider} />
                </label>
                <label className={styles.toggleMeta} onClick={() => setAutoSave(!autoSave)}>
                  <span className={styles.toggleTitle}>Autosave drafts</span>
                  <span className={styles.toggleDesc}>
                    Automatically save BOQ and proposal revisions.
                  </span>
                </label>
              </div>
            </section>
          </div>
        )}

        {activeSub === "region" && (
          <div className={styles.profileCleanContainer}>
            <section>
              <div className={styles.profileSectionHeader}>
                <h2 className={styles.profileSectionTitle}>Language & Region</h2>
                <p className={styles.profileSectionSubtitle}>
                  Define localization parameters.
                </p>
              </div>

              <div className={styles.cleanFormGrid}>
                <div className={styles.cleanFieldGroup}>
                  <label className={styles.cleanFieldLabel}>Display Language</label>
                  <select
                    className={styles.cleanSelect}
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="English (US)">English (US)</option>
                    <option value="English (UK)">English (UK)</option>
                    <option value="Spanish">Spanish</option>
                  </select>
                </div>

                <div className={styles.cleanFieldGroup}>
                  <label className={styles.cleanFieldLabel}>Local Timezone</label>
                  <select
                    className={styles.cleanSelect}
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC / GMT</option>
                    <option value="America/New_York (EST)">America/New_York (EST)</option>
                  </select>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeSub === "accessibility" && (
          <div className={styles.profileCleanContainer}>
            <section>
              <div className={styles.profileSectionHeader}>
                <h2 className={styles.profileSectionTitle}>Accessibility</h2>
                <p className={styles.profileSectionSubtitle}>
                  Optimize workspace rendering for assistive tools.
                </p>
              </div>

              <div className={styles.toggleRow} style={{ marginTop: 0 }}>
                <label className={styles.switchLabel}>
                  <input
                    type="checkbox"
                    className={`${styles.switchInput} ${styles.greenSwitchInput}`}
                    checked={screenReaderOptimized}
                    onChange={(e) => setScreenReaderOptimized(e.target.checked)}
                  />
                  <span className={styles.greenSwitchSlider} />
                </label>
                <label
                  className={styles.toggleMeta}
                  onClick={() => setScreenReaderOptimized(!screenReaderOptimized)}
                >
                  <span className={styles.toggleTitle}>Screen Reader Optimization</span>
                  <span className={styles.toggleDesc}>
                    Use simplified layouts and enhanced ARIA annotations.
                  </span>
                </label>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

