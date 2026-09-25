"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import styles from "../styles/partner-settings.module.css";

export function PartnerNotificationsSettings() {
  const [channels, setChannels] = useState({
    inApp: true,
    whatsapp: true,
    email: true,
    sms: false,
  });

  const [alerts, setAlerts] = useState({
    rfqAlerts: true,
    taskUpdates: true,
    approvalRequests: true,
    paymentEscrowAlerts: true,
    dailyDigest: true,
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Delivery Channels Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardHeaderTitle}>Delivery Channels</h2>
            <p className={styles.cardHeaderSubtitle}>
              Select where your hub managers and dispatch leads receive operational alerts and order telemetry.
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
          <div className={styles.toggleRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>In-App Notifications</span>
              <span className={styles.settingDesc}>Real-time alerts inside the Kallisto Hub top bar and notification center.</span>
            </div>
            <button
              type="button"
              className={`${styles.toggleSwitch} ${channels.inApp ? styles.toggleSwitchActive : ""}`}
              onClick={() => setChannels({ ...channels, inApp: !channels.inApp })}
              aria-label="Toggle In-App Notifications"
            >
              <span className={styles.toggleSwitchThumb} />
            </button>
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>WhatsApp Business Dispatch Sync</span>
              <span className={styles.settingDesc}>Instant dispatch status, driver departure alerts, and milestone updates.</span>
            </div>
            <button
              type="button"
              className={`${styles.toggleSwitch} ${channels.whatsapp ? styles.toggleSwitchActive : ""}`}
              onClick={() => setChannels({ ...channels, whatsapp: !channels.whatsapp })}
              aria-label="Toggle WhatsApp Notifications"
            >
              <span className={styles.toggleSwitchThumb} />
            </button>
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Email Digest & Settlement Statements</span>
              <span className={styles.settingDesc}>Daily revenue summaries, purchase order receipts, and payment invoices.</span>
            </div>
            <button
              type="button"
              className={`${styles.toggleSwitch} ${channels.email ? styles.toggleSwitchActive : ""}`}
              onClick={() => setChannels({ ...channels, email: !channels.email })}
              aria-label="Toggle Email Summaries"
            >
              <span className={styles.toggleSwitchThumb} />
            </button>
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>SMS Dispatch Alerts</span>
              <span className={styles.settingDesc}>Security OTPs and high-priority site delivery arrival alerts via text.</span>
            </div>
            <button
              type="button"
              className={`${styles.toggleSwitch} ${channels.sms ? styles.toggleSwitchActive : ""}`}
              onClick={() => setChannels({ ...channels, sms: !channels.sms })}
              aria-label="Toggle SMS Alerts"
            >
              <span className={styles.toggleSwitchThumb} />
            </button>
          </div>
        </div>
      </div>

      {/* Operational & Project Alerts Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardHeaderTitle}>Operational & Project Alerts</h2>
          <p className={styles.cardHeaderSubtitle}>
            Configure triggers for material requisitions, site crew tasks, and client approvals.
          </p>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.toggleRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>New Material RFQ & Order Pushes</span>
              <span className={styles.settingDesc}>
                Instant alerts whenever a site engineer or contractor submits a new material requisition.
              </span>
            </div>
            <button
              type="button"
              className={`${styles.toggleSwitch} ${alerts.rfqAlerts ? styles.toggleSwitchActive : ""}`}
              onClick={() => setAlerts({ ...alerts, rfqAlerts: !alerts.rfqAlerts })}
              aria-label="Toggle RFQ Alerts"
            >
              <span className={styles.toggleSwitchThumb} />
            </button>
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Milestone & Escrow Payment Settlements</span>
              <span className={styles.settingDesc}>
                Notifications when client milestone escrow disbursements clear to your hub account.
              </span>
            </div>
            <button
              type="button"
              className={`${styles.toggleSwitch} ${alerts.paymentEscrowAlerts ? styles.toggleSwitchActive : ""}`}
              onClick={() => setAlerts({ ...alerts, paymentEscrowAlerts: !alerts.paymentEscrowAlerts })}
              aria-label="Toggle Payment Alerts"
            >
              <span className={styles.toggleSwitchThumb} />
            </button>
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Daily Operational Summary Digest</span>
              <span className={styles.settingDesc}>
                Receive an end-of-day summary of deliveries, revenue, and stock reorders at 7:00 PM.
              </span>
            </div>
            <button
              type="button"
              className={`${styles.toggleSwitch} ${alerts.dailyDigest ? styles.toggleSwitchActive : ""}`}
              onClick={() => setAlerts({ ...alerts, dailyDigest: !alerts.dailyDigest })}
              aria-label="Toggle Daily Digest"
            >
              <span className={styles.toggleSwitchThumb} />
            </button>
          </div>
        </div>

        <div style={{ marginTop: "16px" }}>
          <button type="submit" className={styles.btnPrimary}>
            <Check size={14} />
            <span>Save Notification Settings</span>
          </button>
        </div>
      </div>
    </form>
  );
}

