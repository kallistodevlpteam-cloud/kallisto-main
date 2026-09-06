"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import styles from "../../app/settings/settings.module.css";
import { VerifiedBadge } from "@/components/ui/verified-badge";

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
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className={styles.contentScrollArea}>
      {/* 1. Business Profile */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardHeaderTitle}>Business Profile</h2>
            <p className={styles.cardHeaderSubtitle}>
              Configure your public studio identity on Kallisto.
            </p>
          </div>
        </div>

        <div className={styles.cardBody}>
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
              <div className={styles.copyInputGroup}>
                <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>https://</span>
                <input
                  type="text"
                  className={styles.copyInputText}
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

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
            <button type="button" className={styles.btnPrimary} onClick={handleSave}>
              {isSaved ? (
                <>
                  <Check size={14} color="#ffffff" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Verification Status */}
      <div className={styles.card} style={{ marginTop: "16px" }}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardHeaderTitle}>Verification Status</h2>
            <p className={styles.cardHeaderSubtitle}>
              Your verified status within the Kallisto ecosystem.
            </p>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel} style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#166534" }}>
                <VerifiedBadge size={16} /> Verified Practice
              </span>
              <span className={styles.settingDesc}>
                This studio has passed identity verification, statutory checks, and practice authentication.
              </span>
            </div>
            <div className={styles.settingControl}>
              <span className={styles.thisDeviceBadge}>Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
