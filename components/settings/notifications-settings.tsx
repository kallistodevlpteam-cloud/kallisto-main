"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import styles from "../../app/settings/settings.module.css";

export function NotificationsSettings() {
  const [notifyApprovals, setNotifyApprovals] = useState(true);
  const [notifyMilestones, setNotifyMilestones] = useState(true);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);
  const [browserPush, setBrowserPush] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className={styles.contentScrollArea}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardHeaderTitle}>Notifications</h2>
            <p className={styles.cardHeaderSubtitle}>
              Manage project alerts, client sign-offs, and communication delivery channels.
            </p>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Client Approval Alerts</span>
              <span className={styles.settingDesc}>
                Instant email notification when a client approves a drawing, BOQ revision, or scope variation.
              </span>
            </div>
            <div className={styles.settingControl}>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={notifyApprovals}
                  onChange={(e) => setNotifyApprovals(e.target.checked)}
                />
                <span className={styles.slider} />
              </label>
            </div>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Milestone Escrow Releases</span>
              <span className={styles.settingDesc}>
                Real-time alerts when site inspection passes and milestone escrow is disbursed to your bank.
              </span>
            </div>
            <div className={styles.settingControl}>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={notifyMilestones}
                  onChange={(e) => setNotifyMilestones(e.target.checked)}
                />
                <span className={styles.slider} />
              </label>
            </div>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>WhatsApp Direct Updates</span>
              <span className={styles.settingDesc}>
                Receive urgent milestone alerts and client meeting reminders on your registered WhatsApp number.
              </span>
            </div>
            <div className={styles.settingControl}>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={notifyWhatsapp}
                  onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                />
                <span className={styles.slider} />
              </label>
            </div>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Daily Practice Digest</span>
              <span className={styles.settingDesc}>
                Receive a morning summary of active project milestones, unreviewed submissions, and client chats.
              </span>
            </div>
            <div className={styles.settingControl}>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={dailyDigest}
                  onChange={(e) => setDailyDigest(e.target.checked)}
                />
                <span className={styles.slider} />
              </label>
            </div>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Sound & Browser Push Notifications</span>
              <span className={styles.settingDesc}>
                Play subtle audio tone and display browser popups for incoming client enquiries and urgent mentions.
              </span>
            </div>
            <div className={styles.settingControl}>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={browserPush}
                  onChange={(e) => setBrowserPush(e.target.checked)}
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
                <span>Save Notification Preferences</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
