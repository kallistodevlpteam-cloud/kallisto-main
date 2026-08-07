"use client";

import React, { useState } from "react";
import styles from "../../app/settings/settings.module.css";

interface ServicesSettingsProps {
  workspace: {
    id: string;
    name: string;
  };
}

export function ServicesSettings({ workspace }: ServicesSettingsProps) {
  const [competencies, setCompetencies] = useState(
    "Architecture, Schematic Drawings, BOQ drafting, Feasibility validation"
  );
  const [hourlyRate, setHourlyRate] = useState("₹2,500 / hr");
  const [portfolioVisibility, setPortfolioVisibility] = useState(true);

  return (
    <div className={styles.settingsContentOutlet}>
      <div className={styles.profileCleanContainer}>
        {/* Core Competencies */}
        <section>
          <div className={styles.profileSectionHeader}>
            <h2 className={styles.profileSectionTitle}>Core Competencies</h2>
            <p className={styles.profileSectionSubtitle}>
              Select the type of work your team provides.
            </p>
          </div>

          <div className={styles.cleanFormGrid}>
            <div className={`${styles.cleanFieldGroup} ${styles.fullWidthField}`}>
              <label className={styles.cleanFieldLabel}>Services Provided</label>
              <input
                type="text"
                className={styles.cleanInput}
                value={competencies}
                onChange={(e) => setCompetencies(e.target.value)}
                placeholder="Enter services provided"
              />
            </div>

            <div className={`${styles.cleanFieldGroup} ${styles.fullWidthField}`}>
              <label className={styles.cleanFieldLabel}>Standard Hourly Rate</label>
              <input
                type="text"
                className={styles.cleanInput}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="Enter hourly rate"
              />
            </div>
          </div>
        </section>

        {/* Portfolio Options */}
        <section style={{ marginTop: "12px" }}>
          <div className={styles.profileSectionHeader}>
            <h2 className={styles.profileSectionTitle}>Portfolio Options</h2>
            <p className={styles.profileSectionSubtitle}>
              Control what is visible to the public.
            </p>
          </div>

          <div className={styles.toggleRow}>
            <label className={styles.switchLabel}>
              <input
                type="checkbox"
                className={`${styles.switchInput} ${styles.greenSwitchInput}`}
                checked={portfolioVisibility}
                onChange={(e) => setPortfolioVisibility(e.target.checked)}
              />
              <span className={styles.greenSwitchSlider} />
            </label>
            <label
              className={styles.toggleMeta}
              onClick={() => setPortfolioVisibility(!portfolioVisibility)}
            >
              <span className={styles.toggleTitle}>Public Portfolio Visibility</span>
              <span className={styles.toggleDesc}>
                Allow clients to discover your workspace creations in Kallisto Explore.
              </span>
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}
