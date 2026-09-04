"use client";

import React, { useState } from "react";
import { Check, Sun, Moon, Monitor } from "lucide-react";
import type { ClientAppearancePreferences } from "../../types/client-settings.types";
import styles from "../../styles/client-settings.module.css";

const INITIAL_APPEARANCE: ClientAppearancePreferences = {
  theme: "light",
  density: "comfortable",
};

export function AppearanceSection() {
  const [appearance, setAppearance] = useState<ClientAppearancePreferences>(INITIAL_APPEARANCE);
  const [isSaved, setIsSaved] = useState(false);

  const updateTheme = (theme: ClientAppearancePreferences["theme"]) => {
    setAppearance((prev) => ({ ...prev, theme }));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const updateDensity = (density: ClientAppearancePreferences["density"]) => {
    setAppearance((prev) => ({ ...prev, density }));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardHeaderTitle}>Appearance & Interface Density</h2>
          <p className={styles.cardHeaderSubtitle}>
            Customize the look, color scheme, and spacing density of your Kallisto portal.
          </p>
        </div>
        {isSaved && (
          <div className={styles.toastSaved}>
            <Check size={14} />
            <span>Saved</span>
          </div>
        )}
      </div>

      <div className={styles.cardBody}>
        {/* Theme */}
        <div className={styles.settingRowStacked}>
          <div className={styles.settingInfo} style={{ maxWidth: "100%" }}>
            <span className={styles.settingLabel}>Color Theme</span>
            <span className={styles.settingDesc}>
              Select your preferred color theme or match your device system settings.
            </span>
          </div>
          <div className={styles.radioGrid}>
            <div
              className={`${styles.radioCard} ${appearance.theme === "light" ? styles.radioCardActive : ""}`}
              onClick={() => updateTheme("light")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sun size={16} />
                <span className={styles.radioCardTitle}>Light Mode</span>
              </div>
              <span className={styles.radioCardSubtitle}>High-clarity paper white styling</span>
            </div>

            <div
              className={`${styles.radioCard} ${appearance.theme === "dark" ? styles.radioCardActive : ""}`}
              onClick={() => updateTheme("dark")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Moon size={16} />
                <span className={styles.radioCardTitle}>Dark Mode</span>
              </div>
              <span className={styles.radioCardSubtitle}>Low-glare deep obsidian theme</span>
            </div>

            <div
              className={`${styles.radioCard} ${appearance.theme === "system" ? styles.radioCardActive : ""}`}
              onClick={() => updateTheme("system")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Monitor size={16} />
                <span className={styles.radioCardTitle}>System Preference</span>
              </div>
              <span className={styles.radioCardSubtitle}>Syncs with your OS configuration</span>
            </div>
          </div>
        </div>

        {/* Layout Density */}
        <div className={styles.settingRowStacked}>
          <div className={styles.settingInfo} style={{ maxWidth: "100%" }}>
            <span className={styles.settingLabel}>Interface Density</span>
            <span className={styles.settingDesc}>
              Controls padding and compact row heights across project BOQ tables and drawings.
            </span>
          </div>
          <div className={styles.radioGrid}>
            <div
              className={`${styles.radioCard} ${appearance.density === "comfortable" ? styles.radioCardActive : ""}`}
              onClick={() => updateDensity("comfortable")}
            >
              <span className={styles.radioCardTitle}>Comfortable</span>
              <span className={styles.radioCardSubtitle}>Default spacious touch-friendly layout</span>
            </div>

            <div
              className={`${styles.radioCard} ${appearance.density === "compact" ? styles.radioCardActive : ""}`}
              onClick={() => updateDensity("compact")}
            >
              <span className={styles.radioCardTitle}>Compact</span>
              <span className={styles.radioCardSubtitle}>Condensed rows for large BOQ spreadsheets</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
