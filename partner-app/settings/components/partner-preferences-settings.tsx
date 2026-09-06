"use client";

import React, { useState } from "react";
import { Palette, Check, Save, Globe } from "lucide-react";
import styles from "../styles/partner-settings.module.css";

export function PartnerPreferencesSettings() {
  const [theme, setTheme] = useState("system");
  const [density, setDensity] = useState("default");
  const [currency, setCurrency] = useState("INR");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardHeaderTitle}>Appearance & Regional Preferences</h2>
          <p className={styles.cardHeaderSubtitle}>
            Customize your workspace interface theme, visual density, currency formatting, and regional standards.
          </p>
        </div>
        {isSaved && (
          <div className={styles.toastSaved}>
            <Check size={14} />
            <span>Preferences saved</span>
          </div>
        )}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.inputGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="theme">Interface Theme</label>
            <select
              id="theme"
              className={styles.select}
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="system">System Default</option>
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode (OLED)</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="density">Layout Density</label>
            <select
              id="density"
              className={styles.select}
              value={density}
              onChange={(e) => setDensity(e.target.value)}
            >
              <option value="default">Comfortable (Default)</option>
              <option value="compact">Compact (High Information Density)</option>
            </select>
          </div>
        </div>

        <div className={styles.inputGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="currency">Currency Display</label>
            <select
              id="currency"
              className={styles.select}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="INR">Indian Rupee (₹ INR - Lakhs & Crores)</option>
              <option value="USD">US Dollar ($ USD)</option>
              <option value="AED">UAE Dirham (AED)</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="dateFormat">Date Format</label>
            <select
              id="dateFormat"
              className={styles.select}
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 29/08/2026)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 08/29/2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-08-29)</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: "8px" }}>
          <button type="submit" className={styles.btnPrimary}>
            <Check size={14} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </form>
  );
}
