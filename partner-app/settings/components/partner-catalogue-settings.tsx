"use client";

import React, { useState } from "react";
import { PackageCheck, Check, Save, Sliders } from "lucide-react";
import styles from "../styles/partner-settings.module.css";

export function PartnerCatalogueSettings() {
  const [defaultMargin, setDefaultMargin] = useState("12%");
  const [lowStockThreshold, setLowStockThreshold] = useState("15");
  const [autoSyncPrice, setAutoSyncPrice] = useState(true);
  const [allowInstantQuote, setAllowInstantQuote] = useState(true);
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
          <h2 className={styles.cardHeaderTitle}>Catalogue & Quotation Preferences</h2>
          <p className={styles.cardHeaderSubtitle}>
            Configure standard markups, stock telemetry alerts, and automated instant quotation tolerances.
          </p>
        </div>
        {isSaved && (
          <div className={styles.toastSaved}>
            <Check size={14} />
            <span>Catalogue settings saved</span>
          </div>
        )}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.inputGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="defaultMargin">Default Margin Markup (%)</label>
            <input
              id="defaultMargin"
              type="text"
              className={styles.input}
              value={defaultMargin}
              onChange={(e) => setDefaultMargin(e.target.value)}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="lowStockThreshold">Low Stock Alert Threshold (Units)</label>
            <input
              id="lowStockThreshold"
              type="number"
              className={styles.input}
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.toggleRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Automated Supplier Price Telemetry</span>
            <span className={styles.settingDesc}>
              Automatically flag price discrepancies when tier-1 mill and distributor rates change.
            </span>
          </div>
          <button
            type="button"
            className={`${styles.toggleSwitch} ${autoSyncPrice ? styles.toggleSwitchActive : ""}`}
            onClick={() => setAutoSyncPrice(!autoSyncPrice)}
            aria-label="Toggle Price Telemetry"
          >
            <span className={styles.toggleSwitchThumb} />
          </button>
        </div>

        <div className={styles.toggleRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Odin Instant Quotation Engine</span>
            <span className={styles.settingDesc}>
              Allow Odin AI to draft automated quote bundles when contractor RFQs match catalog stock.
            </span>
          </div>
          <button
            type="button"
            className={`${styles.toggleSwitch} ${allowInstantQuote ? styles.toggleSwitchActive : ""}`}
            onClick={() => setAllowInstantQuote(!allowInstantQuote)}
            aria-label="Toggle Instant Quote"
          >
            <span className={styles.toggleSwitchThumb} />
          </button>
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
