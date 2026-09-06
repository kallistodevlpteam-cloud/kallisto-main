"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import styles from "../../app/settings/settings.module.css";

interface ServicesSettingsProps {
  workspace: {
    id: string;
    name: string;
  };
}

export function ServicesSettings({ workspace }: ServicesSettingsProps) {
  const [competencies, setCompetencies] = useState(
    "Schematic Architecture, 3D BIM Modeling, Statutory Municipal Approvals (KMBR/KPBR), BOQ Drafting, Site Supervision"
  );
  const [baseFee, setBaseFee] = useState("₹1,85,000");
  const [hourlyRate, setHourlyRate] = useState("₹2,500 / hr");
  const [portfolioVisibility, setPortfolioVisibility] = useState(true);
  const [allowInstantEnquiries, setAllowInstantEnquiries] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className={styles.contentScrollArea}>
      {/* 1. Core Competencies Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardHeaderTitle}>Payment Methods & Practice Pricing</h2>
            <p className={styles.cardHeaderSubtitle}>
              Configure your practice rates, hourly advisory fees, and client consultation packages.
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
          <div className={styles.cleanFormGrid}>
            <div className={`${styles.cleanFieldGroup} ${styles.fullWidthField}`}>
              <label className={styles.cleanFieldLabel}>Services & Deliverable Offerings</label>
              <textarea
                className={styles.cleanTextarea}
                rows={3}
                value={competencies}
                onChange={(e) => setCompetencies(e.target.value)}
              />
            </div>

            <div className={styles.cleanFieldGroup}>
              <label className={styles.cleanFieldLabel}>Starting Project Consultation Fee</label>
              <input
                type="text"
                className={styles.cleanInput}
                value={baseFee}
                onChange={(e) => setBaseFee(e.target.value)}
              />
            </div>

            <div className={styles.cleanFieldGroup}>
              <label className={styles.cleanFieldLabel}>Hourly Advisory Rate</label>
              <input
                type="text"
                className={styles.cleanInput}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Showcase in Kallisto Practice Directory</span>
              <span className={styles.settingDesc}>
                Feature your practice portfolio and project highlights in client search and category feeds.
              </span>
            </div>
            <div className={styles.settingControl}>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={portfolioVisibility}
                  onChange={(e) => setPortfolioVisibility(e.target.checked)}
                />
                <span className={styles.slider} />
              </label>
            </div>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Accept Direct Package Enquiries</span>
              <span className={styles.settingDesc}>
                Allow clients to order consultation packages and submit project briefs through Ask Odin.
              </span>
            </div>
            <div className={styles.settingControl}>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={allowInstantEnquiries}
                  onChange={(e) => setAllowInstantEnquiries(e.target.checked)}
                />
                <span className={styles.slider} />
              </label>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
            <button type="button" className={styles.btnPrimary} onClick={handleSave}>
              {isSaved ? (
                <>
                  <Check size={14} color="#ffffff" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save Payment & Service Settings</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
