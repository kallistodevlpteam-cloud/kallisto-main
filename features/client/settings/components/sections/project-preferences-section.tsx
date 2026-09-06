"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import type { ClientProjectPreferencesData } from "../../types/client-settings.types";
import styles from "../../styles/client-settings.module.css";

const INITIAL_PROJECT_PREFERENCES: ClientProjectPreferencesData = {
  defaultProjectId: "nila-residence",
  defaultView: "overview",
  currency: "INR",
  measurementSystem: "metric",
  defaultDocumentView: "latest",
  projectActivityLevel: "important_only",
};

export function ProjectPreferencesSection() {
  const [prefs, setPrefs] = useState<ClientProjectPreferencesData>(INITIAL_PROJECT_PREFERENCES);
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
          <h2 className={styles.cardHeaderTitle}>Project Preferences</h2>
          <p className={styles.cardHeaderSubtitle}>
            Configure your default project workspace, primary view tabs, units of measurement, and Odin AI scope.
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
        {/* Default Project Selection */}
        <div className={styles.settingRowStacked}>
          <div className={styles.settingInfo} style={{ maxWidth: "100%" }}>
            <span className={styles.settingLabel}>Primary / Default Project Context</span>
            <span className={styles.settingDesc}>
              This project will load automatically when you open the Client App and serves as the primary conversational context for Ask Odin.
            </span>
          </div>
          <select
            className={styles.select}
            value={prefs.defaultProjectId}
            onChange={(e) => setPrefs({ ...prefs, defaultProjectId: e.target.value })}
          >
            <option value="nila-residence">Nila Residence · Kumarakom, Kottayam (Active · Pre-Construction)</option>
            <option value="malabar-heritage">Malabar Heritage Villa · Kozhikode (Active · Construction)</option>
            <option value="skyline-loft">Skyline Penthouse · Panampilly Nagar, Kochi (Completed)</option>
          </select>
        </div>

        {/* Default View & Currency */}
        <div className={styles.inputGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="defaultView">Default Project View</label>
            <select
              id="defaultView"
              className={styles.select}
              value={prefs.defaultView}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  defaultView: e.target.value as ClientProjectPreferencesData["defaultView"],
                })
              }
            >
              <option value="overview">Overview & AI Summary</option>
              <option value="tasks">Milestones & Phase Tasks</option>
              <option value="boq">BOQ & Bill of Quantities</option>
              <option value="finance">Payments & Invoices</option>
              <option value="documents">Drawings & Approvals</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="currency">Currency Format</label>
            <select
              id="currency"
              className={styles.select}
              value={prefs.currency}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  currency: e.target.value as ClientProjectPreferencesData["currency"],
                })
              }
            >
              <option value="INR">INR (₹) — Indian Rupee</option>
              <option value="USD">USD ($) — US Dollar</option>
              <option value="EUR">EUR (€) — Euro</option>
              <option value="AED">AED (د.إ) — UAE Dirham</option>
            </select>
          </div>
        </div>

        {/* Units & Document View */}
        <div className={styles.inputGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="measurementSystem">Measurement System</label>
            <select
              id="measurementSystem"
              className={styles.select}
              value={prefs.measurementSystem}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  measurementSystem: e.target.value as ClientProjectPreferencesData["measurementSystem"],
                })
              }
            >
              <option value="metric">Metric (sq meters, meters, mm)</option>
              <option value="imperial">Imperial (sq feet, feet, inches)</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="defaultDocView">Default Document View</label>
            <select
              id="defaultDocView"
              className={styles.select}
              value={prefs.defaultDocumentView}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  defaultDocumentView: e.target.value as ClientProjectPreferencesData["defaultDocumentView"],
                })
              }
            >
              <option value="latest">Latest Approved Version</option>
              <option value="all_versions">Full Revision & Approval History</option>
            </select>
          </div>
        </div>

        {/* Project Activity Level */}
        <div className={styles.settingRowStacked}>
          <div className={styles.settingInfo} style={{ maxWidth: "100%" }}>
            <span className={styles.settingLabel}>Project Activity Feed Level</span>
            <span className={styles.settingDesc}>
              Select the granularity of daily timeline updates shown on your project workspace.
            </span>
          </div>
          <div className={styles.radioGrid}>
            <div
              className={`${styles.radioCard} ${
                prefs.projectActivityLevel === "important_only" ? styles.radioCardActive : ""
              }`}
              onClick={() => setPrefs({ ...prefs, projectActivityLevel: "important_only" })}
            >
              <span className={styles.radioCardTitle}>Important Updates</span>
              <span className={styles.radioCardSubtitle}>
                Milestone completions, approval requests, and site inspections only.
              </span>
            </div>

            <div
              className={`${styles.radioCard} ${
                prefs.projectActivityLevel === "all_updates" ? styles.radioCardActive : ""
              }`}
              onClick={() => setPrefs({ ...prefs, projectActivityLevel: "all_updates" })}
            >
              <span className={styles.radioCardTitle}>All Activity</span>
              <span className={styles.radioCardSubtitle}>
                Includes daily sub-task notes, worker check-ins, and drawing drafts.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <button type="submit" className={styles.btnPrimary}>
          Save Preferences
        </button>
      </div>
    </form>
  );
}
