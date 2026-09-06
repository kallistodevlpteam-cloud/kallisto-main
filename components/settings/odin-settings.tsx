"use client";

import React, { useState } from "react";
import { Check, ShieldCheck, Sparkles, FileText } from "lucide-react";
import styles from "../../app/settings/settings.module.css";

export function OdinSettings() {
  const [odinTone, setOdinTone] = useState<"technical" | "advisory" | "concise">("technical");
  const [odinDraftAssist, setOdinDraftAssist] = useState(true);
  const [bylawChecks, setBylawChecks] = useState(true);
  const [costForecasting, setCostForecasting] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const updateTone = (tone: "technical" | "advisory" | "concise") => {
    setOdinTone(tone);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className={styles.contentScrollArea}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardHeaderTitle}>Odin AI Copilot & Engine</h2>
            <p className={styles.cardHeaderSubtitle}>
              Configure AI consultation behavior, statutory bylaw verification (KMBR / KPBR), and BOQ generation.
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
          {/* Consultation Tone Cards */}
          <div className={styles.settingRowStacked}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Consultation Response Tone</span>
              <span className={styles.settingDesc}>
                Set how Odin drafts project notes, explains variations, and communicates with clients.
              </span>
            </div>

            <div className={styles.radioGrid}>
              <div
                className={`${styles.radioCard} ${odinTone === "technical" ? styles.radioCardActive : ""}`}
                onClick={() => updateTone("technical")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldCheck size={16} color="#0f172a" />
                  <span className={styles.radioCardTitle}>Technical & Regulatory</span>
                </div>
                <span className={styles.radioCardSubtitle}>
                  Strict bylaw verification, structural standards, and engineering precision
                </span>
              </div>

              <div
                className={`${styles.radioCard} ${odinTone === "advisory" ? styles.radioCardActive : ""}`}
                onClick={() => updateTone("advisory")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sparkles size={16} color="#0f172a" />
                  <span className={styles.radioCardTitle}>Client Advisory</span>
                </div>
                <span className={styles.radioCardSubtitle}>
                  Accessible design explanations and collaborative client guidance
                </span>
              </div>

              <div
                className={`${styles.radioCard} ${odinTone === "concise" ? styles.radioCardActive : ""}`}
                onClick={() => updateTone("concise")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FileText size={16} color="#0f172a" />
                  <span className={styles.radioCardTitle}>Concise & Operational</span>
                </div>
                <span className={styles.radioCardSubtitle}>
                  Action-oriented summaries, bulleted deliverables, and milestone deadlines
                </span>
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Auto-Draft Assistance</span>
              <span className={styles.settingDesc}>
                Enable automatic BOQ structuring and site feasibility intelligence during client enquiry review.
              </span>
            </div>
            <div className={styles.settingControl}>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={odinDraftAssist}
                  onChange={(e) => setOdinDraftAssist(e.target.checked)}
                />
                <span className={styles.slider} />
              </label>
            </div>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Automated Bylaw Compliance Checks</span>
              <span className={styles.settingDesc}>
                Cross-reference architectural drawing setbacks and FAR calculations with Kerala municipal bylaws before submission.
              </span>
            </div>
            <div className={styles.settingControl}>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={bylawChecks}
                  onChange={(e) => setBylawChecks(e.target.checked)}
                />
                <span className={styles.slider} />
              </label>
            </div>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Material Rate & Cost Forecasting</span>
              <span className={styles.settingDesc}>
                Incorporate real-time Kerala regional material benchmarks (cement, steel, m-sand) into preliminary BOQ drafts.
              </span>
            </div>
            <div className={styles.settingControl}>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={costForecasting}
                  onChange={(e) => setCostForecasting(e.target.checked)}
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
                <span>Save Odin AI Controls</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
