"use client";

import React, { useState } from "react";
import { Sliders, Sun, Moon, Monitor, Bell, Bot, Check } from "lucide-react";
import styles from "../../app/settings/settings.module.css";

interface PreferencesSettingsProps {
  user: {
    uid: string;
    role: string;
  };
}

export function PreferencesSettings({ user }: PreferencesSettingsProps) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [notifyMilestones, setNotifyMilestones] = useState(true);
  const [notifyApprovals, setNotifyApprovals] = useState(true);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [odinDraftAssist, setOdinDraftAssist] = useState(true);
  const [odinTone, setOdinTone] = useState("technical");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className={styles.settingsSectionList}>
      {/* 1. Visual Theme & Presentation Card */}
      <div className={styles.settingsCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <div className={styles.cardIconWrap}>
              <Sliders size={18} />
            </div>
            <div>
              <h2 className={styles.cardTitle}>Visual Appearance & Theme</h2>
              <p className={styles.cardSubtitle}>
                Select your preferred interface color mode for Kallisto Virtual Office.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "20px" }}>
          {[
            { id: "light", label: "Light Theme", icon: Sun, desc: "Crisp white studio layout" },
            { id: "dark", label: "Dark Theme", icon: Moon, desc: "Deep slate nocturnal workspace" },
            { id: "system", label: "System Sync", icon: Monitor, desc: "Follows OS appearance" },
          ].map((item) => {
            const isSelected = theme === item.id;
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                style={{
                  background: isSelected ? "#f8fafc" : "#ffffff",
                  border: isSelected ? "2px solid #0f172a" : "1px solid #e2e8f0",
                  borderRadius: "16px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "8px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
                onClick={() => setTheme(item.id as "light" | "dark" | "system")}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: isSelected ? "#0f172a" : "#f1f5f9",
                    color: isSelected ? "#ffffff" : "#0f172a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconComponent size={18} />
                </div>
                <div>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", display: "block" }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>{item.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Notification Dispatch Preferences */}
      <div className={styles.settingsCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <div className={styles.cardIconWrap}>
              <Bell size={18} />
            </div>
            <div>
              <h2 className={styles.cardTitle}>Client & Project Notifications</h2>
              <p className={styles.cardSubtitle}>
                Configure critical alerts for drawing approvals, client sign-offs, and escrow releases.
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className={styles.settingItemRow}>
            <div className={styles.settingItemInfo}>
              <span className={styles.settingItemTitle}>Client Approval Alerts</span>
              <span className={styles.settingItemDesc}>
                Instant email notification when a client approves a drawing, BOQ revision, or scope variation.
              </span>
            </div>
            <label className={styles.switchToggle}>
              <input
                type="checkbox"
                checked={notifyApprovals}
                onChange={(e) => setNotifyApprovals(e.target.checked)}
              />
              <span className={styles.switchSlider} />
            </label>
          </div>

          <div className={styles.settingItemRow}>
            <div className={styles.settingItemInfo}>
              <span className={styles.settingItemTitle}>Milestone Escrow Releases</span>
              <span className={styles.settingItemDesc}>
                Real-time alerts when site inspection passes and milestone escrow is disbursed to your bank.
              </span>
            </div>
            <label className={styles.switchToggle}>
              <input
                type="checkbox"
                checked={notifyMilestones}
                onChange={(e) => setNotifyMilestones(e.target.checked)}
              />
              <span className={styles.switchSlider} />
            </label>
          </div>

          <div className={styles.settingItemRow}>
            <div className={styles.settingItemInfo}>
              <span className={styles.settingItemTitle}>WhatsApp Direct Updates</span>
              <span className={styles.settingItemDesc}>
                Receive urgent milestone alerts and client meeting reminders on your registered WhatsApp number.
              </span>
            </div>
            <label className={styles.switchToggle}>
              <input
                type="checkbox"
                checked={notifyWhatsapp}
                onChange={(e) => setNotifyWhatsapp(e.target.checked)}
              />
              <span className={styles.switchSlider} />
            </label>
          </div>
        </div>
      </div>

      {/* 3. Odin AI Consultation Assistant Card */}
      <div className={styles.settingsCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <div className={styles.cardIconWrap}>
              <Bot size={18} />
            </div>
            <div>
              <h2 className={styles.cardTitle}>Odin AI Copilot & Consultation Engine</h2>
              <p className={styles.cardSubtitle}>
                Tune AI assistance for drafting proposals, checking bylaws (KMBR / KPBR), and client communication.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.formGrid2Col}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Consultation Response Tone</label>
            <select
              className={styles.selectControl}
              value={odinTone}
              onChange={(e) => setOdinTone(e.target.value)}
            >
              <option value="technical">Technical & Regulatory (Detailed bylaws, engineering precision)</option>
              <option value="advisory">Client Advisory (Accessible, design-focused, collaborative)</option>
              <option value="concise">Concise & Operational (Short summaries, bulleted deliverables)</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Auto-Draft Assistance</label>
            <div style={{ paddingTop: "8px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={odinDraftAssist}
                  onChange={(e) => setOdinDraftAssist(e.target.checked)}
                />
                <span style={{ fontSize: "13.5px", color: "#0f172a", fontWeight: 600 }}>
                  Enable automatic BOQ structuring and site feasibility checks
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className={styles.cardFooterActions}>
          <button type="button" className={styles.secondaryCtaBtn}>
            Reset Defaults
          </button>
          <button type="button" className={styles.primaryCtaBtn} onClick={handleSave}>
            {isSaved ? (
              <>
                <Check size={14} color="#ffffff" />
                <span>Saved Successfully</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
