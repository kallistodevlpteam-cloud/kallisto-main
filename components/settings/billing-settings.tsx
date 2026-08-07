"use client";

import React, { useState } from "react";
import styles from "../../app/settings/settings.module.css";
import { Check } from "lucide-react";

interface BillingSettingsProps {
  workspace: {
    id: string;
    name: string;
  };
  permissions: {
    canManageBilling: boolean;
  };
}

export function BillingSettings({ workspace, permissions }: BillingSettingsProps) {
  const [billingCurrency, setBillingCurrency] = useState<"INR" | "USD" | "EUR">("INR");
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  const [payoutAccount, setPayoutAccount] = useState("HDFC Bank ****4321");
  const [taxInfo, setTaxInfo] = useState("29AAAAA0000A1Z5 (GSTIN)");

  const getPrice = (baseINR: number) => {
    let multiplier = 1;
    let symbol = "₹";

    if (billingCurrency === "USD") {
      multiplier = 1 / 80;
      symbol = "$";
    } else if (billingCurrency === "EUR") {
      multiplier = 1 / 88;
      symbol = "€";
    }

    let price = baseINR * multiplier;
    if (billingInterval === "yearly") {
      price = price * 0.83; // 17% discount
    }

    if (price === 0) return "Free";
    return `${symbol}${Math.round(price).toLocaleString()}`;
  };

  return (
    <div className={styles.settingsContentOutlet}>
      <div className={styles.profileCleanContainer} style={{ maxWidth: "900px" }}>
        {/* Usage & Limits */}
        <section>
          <div className={styles.profileSectionHeader}>
            <h2 className={styles.profileSectionTitle}>Usage & Limits</h2>
            <p className={styles.profileSectionSubtitle}>
              Monitor your active API resources.
            </p>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#111827", marginBottom: "12px" }}>
              {workspace.name} — Free Plan
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "13px",
                color: "#6b7280",
                marginBottom: "8px",
              }}
            >
              <span>Credits Used</span>
              <strong style={{ color: "#111827" }}>0 / 10,000 credits</strong>
            </div>
            <div
              style={{
                height: "6px",
                background: "#f3f4f6",
                borderRadius: "3px",
                overflow: "hidden",
              }}
            >
              <div style={{ height: "100%", width: "0%", background: "#111827", borderRadius: "3px" }} />
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section style={{ marginTop: "12px" }}>
          <div className={styles.profileSectionHeader}>
            <h2 className={styles.profileSectionTitle}>Pricing Plans</h2>
            <p className={styles.profileSectionSubtitle}>
              Select a plan that fits your studio needs.
            </p>
          </div>

          <div className={styles.pricingControls} style={{ marginBottom: "20px" }}>
            <select
              className={styles.cleanSelect}
              style={{ width: "140px" }}
              value={billingCurrency}
              onChange={(e) => setBillingCurrency(e.target.value as any)}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>

            <div className={styles.intervalToggle}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${billingInterval === "monthly" ? styles.toggleBtnActive : ""}`}
                onClick={() => setBillingInterval("monthly")}
              >
                Monthly
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${billingInterval === "yearly" ? styles.toggleBtnActive : ""}`}
                onClick={() => setBillingInterval("yearly")}
              >
                Yearly (save 2 months)
              </button>
            </div>
          </div>

          <div className={styles.pricingGrid}>
            <div className={styles.priceCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardPlanName}>Free</span>
                <div className={styles.cardPriceRow}>
                  <span className={styles.cardPrice}>{getPrice(0)}</span>
                  <span className={styles.cardPeriod}>/mo</span>
                </div>
              </div>
              <button type="button" className={`${styles.upgradeActionBtn} ${styles.currentPlanBtn}`} disabled>
                Current Plan
              </button>
              <div className={styles.featuresList}>
                <div className={styles.featureItem}><Check size={12} className={styles.checkIcon} /> 10k credits/mo</div>
                <div className={styles.featureItem}><Check size={12} className={styles.checkIcon} /> 3 Projects</div>
              </div>
            </div>

            <div className={styles.priceCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardPlanName}>Starter</span>
                <div className={styles.cardPriceRow}>
                  <span className={styles.cardPrice}>{getPrice(528)}</span>
                  <span className={styles.cardPeriod}>/mo</span>
                </div>
              </div>
              <button
                type="button"
                className={`${styles.upgradeActionBtn} ${styles.primaryUpgradeBtn}`}
                disabled={!permissions.canManageBilling}
                onClick={() => alert("Initiating Starter plan upgrade...")}
              >
                {permissions.canManageBilling ? "Upgrade" : "Restricted"}
              </button>
              <div className={styles.featuresList}>
                <div className={styles.featureItem}><Check size={12} className={styles.checkIcon} /> 30k credits/mo</div>
                <div className={styles.featureItem}><Check size={12} className={styles.checkIcon} /> 20 Projects</div>
              </div>
            </div>

            <div className={`${styles.priceCard} ${styles.popularCard}`}>
              <span className={styles.popularBadge}>Popular</span>
              <div className={styles.cardHeader}>
                <span className={styles.cardPlanName}>Creator</span>
                <div className={styles.cardPriceRow}>
                  <span className={styles.cardPrice}>{getPrice(968)}</span>
                  <span className={styles.cardPeriod}>/mo</span>
                </div>
              </div>
              <button
                type="button"
                className={`${styles.upgradeActionBtn} ${styles.popularUpgradeBtn}`}
                disabled={!permissions.canManageBilling}
                onClick={() => alert("Initiating Creator plan upgrade...")}
              >
                {permissions.canManageBilling ? "Upgrade" : "Restricted"}
              </button>
              <div className={styles.featuresList}>
                <div className={styles.featureItem}><Check size={12} className={styles.checkIcon} /> 121k credits/mo</div>
                <div className={styles.featureItem}><Check size={12} className={styles.checkIcon} /> 1k Projects</div>
              </div>
            </div>

            <div className={styles.priceCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardPlanName}>Pro</span>
                <div className={styles.cardPriceRow}>
                  <span className={styles.cardPrice}>{getPrice(8712)}</span>
                  <span className={styles.cardPeriod}>/mo</span>
                </div>
              </div>
              <button
                type="button"
                className={`${styles.upgradeActionBtn} ${styles.primaryUpgradeBtn}`}
                disabled={!permissions.canManageBilling}
                onClick={() => alert("Initiating Pro plan upgrade...")}
              >
                {permissions.canManageBilling ? "Upgrade" : "Restricted"}
              </button>
              <div className={styles.featuresList}>
                <div className={styles.featureItem}><Check size={12} className={styles.checkIcon} /> 600k credits/mo</div>
                <div className={styles.featureItem}><Check size={12} className={styles.checkIcon} /> Unlimited Projects</div>
              </div>
            </div>

            <div className={styles.priceCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardPlanName}>Scale</span>
                <div className={styles.cardPriceRow}>
                  <span className={styles.cardPrice}>{getPrice(26312)}</span>
                  <span className={styles.cardPeriod}>/mo</span>
                </div>
              </div>
              <button
                type="button"
                className={`${styles.upgradeActionBtn} ${styles.primaryUpgradeBtn}`}
                disabled={!permissions.canManageBilling}
                onClick={() => alert("Initiating Scale plan upgrade...")}
              >
                {permissions.canManageBilling ? "Upgrade" : "Restricted"}
              </button>
              <div className={styles.featuresList}>
                <div className={styles.featureItem}><Check size={12} className={styles.checkIcon} /> 1.8M credits/mo</div>
                <div className={styles.featureItem}><Check size={12} className={styles.checkIcon} /> Dedicated Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Payouts & Invoicing */}
        <section style={{ marginTop: "12px" }}>
          <div className={styles.profileSectionHeader}>
            <h2 className={styles.profileSectionTitle}>Payouts & Invoicing</h2>
            <p className={styles.profileSectionSubtitle}>
              Manage studio billing methods and tax identities.
            </p>
          </div>

          <div className={styles.cleanFormGrid}>
            <div className={`${styles.cleanFieldGroup} ${styles.fullWidthField}`}>
              <label className={styles.cleanFieldLabel}>Payout Destination</label>
              <input
                type="text"
                className={styles.cleanInput}
                value={payoutAccount}
                onChange={(e) => setPayoutAccount(e.target.value)}
                placeholder="Enter bank account details"
              />
            </div>

            <div className={`${styles.cleanFieldGroup} ${styles.fullWidthField}`}>
              <label className={styles.cleanFieldLabel}>Tax Identification</label>
              <input
                type="text"
                className={styles.cleanInput}
                value={taxInfo}
                onChange={(e) => setTaxInfo(e.target.value)}
                placeholder="Enter GSTIN / VAT ID"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
