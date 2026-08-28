"use client";

import React, { useState, useEffect } from "react";
import { Check, Sun, Moon, Monitor } from "lucide-react";
import styles from "../../app/settings/settings.module.css";

export function AppearanceSettings() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [isSaved, setIsSaved] = useState(false);

  // Initialize theme and density from localStorage or active DOM attributes on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedTheme = (localStorage.getItem("kallisto_theme") as "light" | "dark" | "system") || "light";
    const savedDensity = (localStorage.getItem("kallisto_density") as "comfortable" | "compact") || "comfortable";

    setTheme(savedTheme);
    setDensity(savedDensity);

    applyThemeToDOM(savedTheme);
    applyDensityToDOM(savedDensity);
  }, []);

  const applyThemeToDOM = (selectedTheme: "light" | "dark" | "system") => {
    if (typeof document === "undefined") return;

    let effectiveTheme: "light" | "dark" = "light";
    if (selectedTheme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      effectiveTheme = selectedTheme;
    }

    document.documentElement.setAttribute("data-theme", effectiveTheme);
    document.documentElement.classList.toggle("dark", effectiveTheme === "dark");
    localStorage.setItem("kallisto_theme", selectedTheme);
    window.dispatchEvent(new CustomEvent("kallisto_theme_changed", { detail: { theme: selectedTheme, effectiveTheme } }));
  };

  const applyDensityToDOM = (selectedDensity: "comfortable" | "compact") => {
    if (typeof document === "undefined") return;

    document.documentElement.setAttribute("data-density", selectedDensity);
    localStorage.setItem("kallisto_density", selectedDensity);
    window.dispatchEvent(new CustomEvent("kallisto_density_changed", { detail: { density: selectedDensity } }));
  };

  const updateTheme = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    applyThemeToDOM(newTheme);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const updateDensity = (newDensity: "comfortable" | "compact") => {
    setDensity(newDensity);
    applyDensityToDOM(newDensity);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className={styles.contentScrollArea}>
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
          {/* Color Theme */}
          <div className={styles.settingRowStacked}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Color Theme</span>
              <span className={styles.settingDesc}>
                Select your preferred color theme or match your device system settings.
              </span>
            </div>

            <div className={styles.radioGrid}>
              <div
                className={`${styles.radioCard} ${theme === "light" ? styles.radioCardActive : ""}`}
                onClick={() => updateTheme("light")}
                role="button"
                tabIndex={0}
                aria-pressed={theme === "light"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sun size={16} color={theme === "light" ? "var(--ink, #0f172a)" : "var(--muted, #64748b)"} />
                  <span className={styles.radioCardTitle}>Light Mode</span>
                </div>
                <span className={styles.radioCardSubtitle}>High-clarity paper white styling</span>
              </div>

              <div
                className={`${styles.radioCard} ${theme === "dark" ? styles.radioCardActive : ""}`}
                onClick={() => updateTheme("dark")}
                role="button"
                tabIndex={0}
                aria-pressed={theme === "dark"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Moon size={16} color={theme === "dark" ? "var(--ink, #0f172a)" : "var(--muted, #64748b)"} />
                  <span className={styles.radioCardTitle}>Dark Mode</span>
                </div>
                <span className={styles.radioCardSubtitle}>Low-glare deep obsidian theme</span>
              </div>

              <div
                className={`${styles.radioCard} ${theme === "system" ? styles.radioCardActive : ""}`}
                onClick={() => updateTheme("system")}
                role="button"
                tabIndex={0}
                aria-pressed={theme === "system"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Monitor size={16} color={theme === "system" ? "var(--ink, #0f172a)" : "var(--muted, #64748b)"} />
                  <span className={styles.radioCardTitle}>System Preference</span>
                </div>
                <span className={styles.radioCardSubtitle}>Syncs with your OS configuration</span>
              </div>
            </div>
          </div>

          {/* Interface Density */}
          <div className={styles.settingRowStacked}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Interface Density</span>
              <span className={styles.settingDesc}>
                Controls padding and compact row heights across project BOQ tables and drawings.
              </span>
            </div>

            <div className={styles.radioGrid}>
              <div
                className={`${styles.radioCard} ${density === "comfortable" ? styles.radioCardActive : ""}`}
                onClick={() => updateDensity("comfortable")}
                role="button"
                tabIndex={0}
                aria-pressed={density === "comfortable"}
              >
                <span className={styles.radioCardTitle}>Comfortable</span>
                <span className={styles.radioCardSubtitle}>Default spacious touch-friendly layout</span>
              </div>

              <div
                className={`${styles.radioCard} ${density === "compact" ? styles.radioCardActive : ""}`}
                onClick={() => updateDensity("compact")}
                role="button"
                tabIndex={0}
                aria-pressed={density === "compact"}
              >
                <span className={styles.radioCardTitle}>Compact</span>
                <span className={styles.radioCardSubtitle}>Condensed rows for large BOQ spreadsheets</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
