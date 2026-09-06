"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import type {
  ClientCommunicationPreferences,
  ClientPreferredContactMethod,
  ClientProviderContactPermission,
} from "../../types/client-settings.types";
import styles from "../../styles/client-settings.module.css";

const INITIAL_COMMUNICATION: ClientCommunicationPreferences = {
  preferredContactMethod: "whatsapp",
  providerCommunication: "allow_whatsapp",
  marketing: {
    productUpdates: true,
    offersAndRecommendations: false,
  },
};

export function CommunicationSection() {
  const [comm, setComm] = useState<ClientCommunicationPreferences>(INITIAL_COMMUNICATION);
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
          <h2 className={styles.cardHeaderTitle}>Communication Preferences</h2>
          <p className={styles.cardHeaderSubtitle}>
            Define your contact channels, provider communication boundaries, and newsletter preferences.
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
          <div className={styles.settingInfo} style={{ maxWidth: "100%" }}>
            <span className={styles.settingLabel}>Preferred Contact Method</span>
            <span className={styles.settingDesc}>
              How the Kallisto team and concierges should primarily communicate with you.
            </span>
          </div>
          <div className={styles.radioGrid}>
            {[
              { id: "whatsapp", label: "WhatsApp", desc: "Fastest response & instant approvals" },
              { id: "phone", label: "Phone Call", desc: "Direct voice calls for important items" },
              { id: "email", label: "Email", desc: "Structured written correspondence" },
              { id: "in_app", label: "In-App Only", desc: "Keep all messages within Kallisto Portal" },
            ].map((opt) => (
              <div
                key={opt.id}
                className={`${styles.radioCard} ${
                  comm.preferredContactMethod === opt.id ? styles.radioCardActive : ""
                }`}
                onClick={() =>
                  setComm({
                    ...comm,
                    preferredContactMethod: opt.id as ClientPreferredContactMethod,
                  })
                }
              >
                <span className={styles.radioCardTitle}>{opt.label}</span>
                <span className={styles.radioCardSubtitle}>{opt.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Provider Direct Communication Boundary */}
        <div className={styles.settingRowStacked}>
          <div className={styles.settingInfo} style={{ maxWidth: "100%" }}>
            <span className={styles.settingLabel}>Service Provider Communication Permissions</span>
            <span className={styles.settingDesc}>
              Controls whether verified architects, contractors, and project specialists can contact you directly outside the app.
            </span>
          </div>
          <div className={styles.radioGrid}>
            {[
              {
                id: "in_app_only",
                label: "In-App Only (Strict)",
                desc: "Providers can only message through Kallisto project threads.",
              },
              {
                id: "allow_whatsapp",
                label: "Allow WhatsApp",
                desc: "Providers can contact you via WhatsApp for fast coordination.",
              },
              {
                id: "allow_phone",
                label: "Allow Phone & Calls",
                desc: "Providers can call your verified phone number directly.",
              },
            ].map((opt) => (
              <div
                key={opt.id}
                className={`${styles.radioCard} ${
                  comm.providerCommunication === opt.id ? styles.radioCardActive : ""
                }`}
                onClick={() =>
                  setComm({
                    ...comm,
                    providerCommunication: opt.id as ClientProviderContactPermission,
                  })
                }
              >
                <span className={styles.radioCardTitle}>{opt.label}</span>
                <span className={styles.radioCardSubtitle}>{opt.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Marketing & Recommendations */}
        <div className={styles.settingRowStacked}>
          <div className={styles.settingInfo} style={{ maxWidth: "100%" }}>
            <span className={styles.settingLabel}>Kallisto Insights & Recommendations</span>
            <span className={styles.settingDesc}>
              Stay updated on architectural trends, material pricing benchmarks, and feature releases.
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
                style={{ width: "16px", height: "16px", accentColor: "#111827" }}
              />
              <span>Product updates, design trends, and architectural case studies</span>
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
                style={{ width: "16px", height: "16px", accentColor: "#111827" }}
              />
              <span>Specialist discounts and regional site feasibility recommendations</span>
            </label>
          </div>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <button type="submit" className={styles.btnPrimary}>
          Save Communication Preferences
        </button>
      </div>
    </form>
  );
}
