"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import styles from "../styles/partner-settings.module.css";

export type PartnerContactMethod = "whatsapp" | "phone" | "email" | "in_app";
export type PartnerClientContactPermission = "in_app_only" | "allow_whatsapp" | "allow_phone";

export interface PartnerCommunicationPreferences {
  preferredContactMethod: PartnerContactMethod;
  clientCommunication: PartnerClientContactPermission;
  marketing: {
    productUpdates: boolean;
    offersAndRecommendations: boolean;
  };
}

const INITIAL_COMMUNICATION: PartnerCommunicationPreferences = {
  preferredContactMethod: "whatsapp",
  clientCommunication: "allow_whatsapp",
  marketing: {
    productUpdates: true,
    offersAndRecommendations: false,
  },
};

export function PartnerCommunicationSettings() {
  const [comm, setComm] = useState<PartnerCommunicationPreferences>(INITIAL_COMMUNICATION);
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
          <h2 className={styles.cardHeaderTitle}>Communication Preferences</h2>
          <p className={styles.cardHeaderSubtitle}>
            Define your operational contact channels, client communication boundaries, and platform updates.
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
        {/* Preferred Contact Method */}
        <div className={styles.settingRowStacked}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Preferred Contact Method</span>
            <span className={styles.settingDesc}>
              How the Kallisto operations desk and concierges should primarily reach your business.
            </span>
          </div>
          <div className={styles.radioGrid}>
            {[
              { id: "whatsapp", label: "WhatsApp Business", desc: "Fastest response & instant order telemetry" },
              { id: "phone", label: "Direct Phone Call", desc: "Urgent site dispatch & escalation calls" },
              { id: "email", label: "Official Email", desc: "Structured billing and purchase order receipts" },
              { id: "in_app", label: "In-App Workspace Only", desc: "Keep all correspondence within Kallisto Hub" },
            ].map((opt) => (
              <div
                key={opt.id}
                className={`${styles.radioCard} ${
                  comm.preferredContactMethod === opt.id ? styles.radioCardActive : ""
                }`}
                onClick={() =>
                  setComm({
                    ...comm,
                    preferredContactMethod: opt.id as PartnerContactMethod,
                  })
                }
              >
                <span className={styles.radioCardTitle}>{opt.label}</span>
                <span className={styles.radioCardSubtitle}>{opt.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Client & Field Team Communication Permissions */}
        <div className={styles.settingRowStacked}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Client & Field Team Contact Boundaries</span>
            <span className={styles.settingDesc}>
              Controls how clients, architects, and site supervisors can reach your operational leads.
            </span>
          </div>
          <div className={styles.radioGrid}>
            {[
              {
                id: "in_app_only",
                label: "In-App Only (Strict)",
                desc: "Clients can only message through Kallisto project threads.",
              },
              {
                id: "allow_whatsapp",
                label: "Allow WhatsApp",
                desc: "Clients & site teams can contact your hub via WhatsApp.",
              },
              {
                id: "allow_phone",
                label: "Allow Direct Phone Calls",
                desc: "Clients & site supervisors can call your manager's number.",
              },
            ].map((opt) => (
              <div
                key={opt.id}
                className={`${styles.radioCard} ${
                  comm.clientCommunication === opt.id ? styles.radioCardActive : ""
                }`}
                onClick={() =>
                  setComm({
                    ...comm,
                    clientCommunication: opt.id as PartnerClientContactPermission,
                  })
                }
              >
                <span className={styles.radioCardTitle}>{opt.label}</span>
                <span className={styles.radioCardSubtitle}>{opt.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Telemetry & Platform Insights */}
        <div className={styles.settingRowStacked}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Kallisto Partner Insights & Telemetry</span>
            <span className={styles.settingDesc}>
              Stay updated on material price benchmarks, regional demand trends, and feature releases.
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={comm.marketing.productUpdates}
                onChange={(e) =>
                  setComm({
                    ...comm,
                    marketing: { ...comm.marketing, productUpdates: e.target.checked },
                  })
                }
                style={{ width: "16px", height: "16px", accentColor: "#0f172a" }}
              />
              <span>Platform feature updates, catalogue API releases, and hub webinars</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={comm.marketing.offersAndRecommendations}
                onChange={(e) =>
                  setComm({
                    ...comm,
                    marketing: { ...comm.marketing, offersAndRecommendations: e.target.checked },
                  })
                }
                style={{ width: "16px", height: "16px", accentColor: "#0f172a" }}
              />
              <span>Regional material demand forecasts and depot expansion opportunities</span>
            </label>
          </div>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <button type="submit" className={styles.btnPrimary}>
          <Check size={14} />
          <span>Save Communication Preferences</span>
        </button>
      </div>
    </form>
  );
}
