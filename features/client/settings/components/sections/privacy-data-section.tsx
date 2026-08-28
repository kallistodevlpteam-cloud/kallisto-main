"use client";

import React, { useState } from "react";
import { Download, AlertTriangle, Check, Sparkles } from "lucide-react";
import type { ClientPrivacyDataPreferences } from "../../types/client-settings.types";
import styles from "../../styles/client-settings.module.css";

const INITIAL_PRIVACY: ClientPrivacyDataPreferences = {
  projectDataAccess: true,
  connectedServices: true,
  odinDataUsage: {
    useProjectContext: true,
    allowDocumentIndexing: true,
    conversationRetention: "90_days",
  },
};

export function PrivacyDataSection() {
  const [privacy, setPrivacy] = useState<ClientPrivacyDataPreferences>(INITIAL_PRIVACY);
  const [isSaved, setIsSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const triggerSave = (updated: ClientPrivacyDataPreferences) => {
    setPrivacy(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Odin & AI Data Usage */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={16} color="#0f172a" />
            <div>
              <h2 className={styles.cardHeaderTitle}>Odin & AI Intelligence Context</h2>
              <p className={styles.cardHeaderSubtitle}>
                Manage how Ask Odin analyzes your project documents, BOQ data, and site feasibility records.
              </p>
            </div>
          </div>
          {isSaved && (
            <div className={styles.toastSaved}>
              <Check size={14} />
              <span>Saved</span>
            </div>
          )}
        </div>

        <div className={styles.cardBody}>
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "8px",
              background: "#f8fafc",
              border: "1px solid var(--line, #e2e8f0)",
              fontSize: "12.5px",
              color: "#334155",
              lineHeight: "1.5",
            }}
          >
            <strong>How Odin uses your data:</strong> Ask Odin uses approved project files, architectural requirements, and milestone logs strictly to answer your questions and provide contextual construction insights. Your proprietary project information is never shared with third-party model trainers.
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Project-Aware Context</span>
              <span className={styles.settingDesc}>
                Allow Odin to reference your active project timeline, approved budget, and provider deliverables in conversations.
              </span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={privacy.odinDataUsage.useProjectContext}
                onChange={(e) =>
                  triggerSave({
                    ...privacy,
                    odinDataUsage: {
                      ...privacy.odinDataUsage,
                      useProjectContext: e.target.checked,
                    },
                  })
                }
              />
              <span className={styles.slider} />
            </label>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Document & Drawing Analysis</span>
              <span className={styles.settingDesc}>
                Enable Odin to parse uploaded PDF drawings, BOQ line items, and municipal compliance certificates.
              </span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={privacy.odinDataUsage.allowDocumentIndexing}
                onChange={(e) =>
                  triggerSave({
                    ...privacy,
                    odinDataUsage: {
                      ...privacy.odinDataUsage,
                      allowDocumentIndexing: e.target.checked,
                    },
                  })
                }
              />
              <span className={styles.slider} />
            </label>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Conversation History Retention</span>
              <span className={styles.settingDesc}>
                Choose how long past Odin chat sessions and scoping transcripts are stored.
              </span>
            </div>
            <select
              className={styles.select}
              style={{ width: "180px", padding: "6px 10px", fontSize: "12.5px" }}
              value={privacy.odinDataUsage.conversationRetention}
              onChange={(e) =>
                triggerSave({
                  ...privacy,
                  odinDataUsage: {
                    ...privacy.odinDataUsage,
                    conversationRetention: e.target.value as ClientPrivacyDataPreferences["odinDataUsage"]["conversationRetention"],
                  },
                })
              }
            >
              <option value="30_days">30 Days</option>
              <option value="90_days">90 Days (Recommended)</option>
              <option value="indefinite">Indefinite</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Export & Account Governance */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardHeaderTitle}>Data Archive & Export</h3>
            <p className={styles.cardHeaderSubtitle}>
              Request a complete JSON and ZIP archive of all your architectural documents, BOQs, and receipts.
            </p>
          </div>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Download My Data Archive</span>
              <span className={styles.settingDesc}>
                Generates a secure export containing your project requirements, CAD uploads, invoices, and communication transcripts.
              </span>
            </div>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => alert("Your data archive request has been queued. You will receive an email download link within 24 hours.")}
            >
              <Download size={14} />
              <span>Request Archive</span>
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className={styles.card} style={{ borderColor: "#fecaca" }}>
        <div className={styles.cardHeader} style={{ background: "#fff5f5" }}>
          <div>
            <h3 className={styles.cardHeaderTitle} style={{ color: "#b91c1c" }}>Danger Zone</h3>
            <p className={styles.cardHeaderSubtitle} style={{ color: "#7f1d1d" }}>
              Irreversible account and project deletion actions.
            </p>
          </div>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Delete Kallisto Account</span>
              <span className={styles.settingDesc}>
                Permanently delete your profile, cancel active collaborator invitations, and remove linked payment methods.
              </span>
            </div>
            <button
              type="button"
              className={styles.btnDanger}
              onClick={() => setShowDeleteModal(true)}
            >
              <AlertTriangle size={14} />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "16px",
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={styles.card}
            style={{ width: "100%", maxWidth: "460px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)" }}
          >
            <div className={styles.cardHeader} style={{ background: "#fff5f5" }}>
              <h3 className={styles.cardHeaderTitle} style={{ color: "#b91c1c" }}>
                Confirm Account Deletion
              </h3>
            </div>
            <div className={styles.cardBody}>
              <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.5", margin: 0 }}>
                Are you sure you want to delete your client account? This action will permanently revoke access to all current and completed projects. Active escrow balances must be cleared first.
              </p>
            </div>
            <div className={styles.cardFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={() => {
                  setShowDeleteModal(false);
                  alert("Account deletion request submitted.");
                }}
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
