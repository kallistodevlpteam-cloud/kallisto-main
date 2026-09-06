"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import type { ClientLanguageRegionPreferences } from "../../types/client-settings.types";
import styles from "../../styles/client-settings.module.css";

const INITIAL_LANG_REGION: ClientLanguageRegionPreferences = {
  language: "en-IN",
  country: "IN",
  currency: "INR",
  dateFormat: "DD/MM/YYYY",
  timeZone: "Asia/Kolkata",
};

export function LanguageRegionSection() {
  const [prefs, setPrefs] = useState<ClientLanguageRegionPreferences>(INITIAL_LANG_REGION);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardHeaderTitle}>Language & Region</h2>
          <p className={styles.cardHeaderSubtitle}>
            Configure your geographic locale, timezone, date representations, and currency standards.
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
        <div className={styles.inputGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="language">Language</label>
            <select
              id="language"
              className={styles.select}
              value={prefs.language}
              onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
            >
              <option value="en-IN">English (India)</option>
              <option value="en-GB">English (UK)</option>
              <option value="en-US">English (US)</option>
              <option value="ml-IN">Malayalam (മലയാളം)</option>
              <option value="ta-IN">Tamil (தமிழ்)</option>
              <option value="hi-IN">Hindi (हिन्दी)</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="country">Country / Region</label>
            <select
              id="country"
              className={styles.select}
              value={prefs.country}
              onChange={(e) => setPrefs({ ...prefs, country: e.target.value })}
            >
              <option value="IN">India (IN)</option>
              <option value="AE">United Arab Emirates (UAE)</option>
              <option value="SG">Singapore (SG)</option>
              <option value="GB">United Kingdom (UK)</option>
              <option value="US">United States (US)</option>
            </select>
          </div>
        </div>

        <div className={styles.inputGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="dateFormat">Date Format</label>
            <select
              id="dateFormat"
              className={styles.select}
              value={prefs.dateFormat}
              onChange={(e) => setPrefs({ ...prefs, dateFormat: e.target.value })}
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (27/08/2026)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (08/27/2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (2026-08-27)</option>
              <option value="D MMMM YYYY">D MMMM YYYY (27 August 2026)</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="timeZone">Time Zone</label>
            <select
              id="timeZone"
              className={styles.select}
              value={prefs.timeZone}
              onChange={(e) => setPrefs({ ...prefs, timeZone: e.target.value })}
            >
              <option value="Asia/Kolkata">India Standard Time (IST · GMT+5:30)</option>
              <option value="Asia/Dubai">Gulf Standard Time (GST · GMT+4:00)</option>
              <option value="Asia/Singapore">Singapore Standard Time (SGT · GMT+8:00)</option>
              <option value="Europe/London">Greenwich Mean Time (GMT · GMT+0:00)</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <button type="submit" className={styles.btnPrimary}>
          Save Regional Settings
        </button>
      </div>
    </form>
  );
}
