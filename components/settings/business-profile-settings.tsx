"use client";

import React, { useState } from "react";
import styles from "../../app/settings/settings.module.css";
import { CheckCircle2 } from "lucide-react";

interface BusinessProfileSettingsProps {
  workspace: {
    id: string;
    name: string;
  };
}

export function BusinessProfileSettings({ workspace }: BusinessProfileSettingsProps) {
  const [studioName, setStudioName] = useState("Arjun Architects Studio");
  const [studioWebsite, setStudioWebsite] = useState("arjunarchitects.kallisto.design");
  const [studioAddress, setStudioAddress] = useState("No. 12, MG Road, Bangalore, India");

  return (
    <div className={styles.settingsContentOutlet}>
      <div className={styles.profileCleanContainer}>
        <section>
          <div className={styles.profileSectionHeader}>
            <h2 className={styles.profileSectionTitle}>Business Profile</h2>
            <p className={styles.profileSectionSubtitle}>
              Configure your public studio identity on Kallisto.
            </p>
          </div>

          <div className={styles.cleanFormGrid}>
            <div className={`${styles.cleanFieldGroup} ${styles.fullWidthField}`}>
              <label className={styles.cleanFieldLabel}>Practice Name</label>
              <input
                type="text"
                className={styles.cleanInput}
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                placeholder="Enter practice name"
              />
            </div>

            <div className={`${styles.cleanFieldGroup} ${styles.fullWidthField}`}>
              <label className={styles.cleanFieldLabel}>Studio Website</label>
              <div className={styles.websiteInputContainer}>
                <span className={styles.websitePrefix}>https://</span>
                <input
                  type="text"
                  className={`${styles.cleanInput} ${styles.websiteInput}`}
                  value={studioWebsite}
                  onChange={(e) => setStudioWebsite(e.target.value)}
                  placeholder="your-studio.com"
                />
              </div>
            </div>

            <div className={`${styles.cleanFieldGroup} ${styles.fullWidthField}`}>
              <label className={styles.cleanFieldLabel}>Address</label>
              <input
                type="text"
                className={styles.cleanInput}
                value={studioAddress}
                onChange={(e) => setStudioAddress(e.target.value)}
                placeholder="Enter official physical location"
              />
            </div>
          </div>
        </section>

        <section style={{ marginTop: "12px" }}>
          <div className={styles.profileSectionHeader}>
            <h2 className={styles.profileSectionTitle}>Verification Status</h2>
            <p className={styles.profileSectionSubtitle}>
              Your verified status within the Kallisto ecosystem.
            </p>
          </div>

          <div
            style={{
              padding: "20px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "14.5px",
                  fontWeight: 600,
                  color: "#166534",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <CheckCircle2 size={18} /> Verified Practice
              </div>
              <div style={{ fontSize: "12.5px", color: "#15803d", marginTop: "2px" }}>
                Verified partners get priority listing in client searches and project invitations.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
