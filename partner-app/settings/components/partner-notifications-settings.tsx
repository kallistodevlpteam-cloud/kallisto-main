"use client";

import React, { useState } from "react";
import { Bell, Check, Save, MessageSquare, PhoneCall } from "lucide-react";
import styles from "../styles/partner-settings.module.css";

export function PartnerNotificationsSettings() {
  const [rfqAlerts, setRfqAlerts] = useState(true);
  const [whatsappSync, setWhatsappSync] = useState(true);
  const [paymentEscrowAlerts, setPaymentEscrowAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);
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
          <h2 className={styles.cardHeaderTitle}>Notification Channels & Dispatch Alerts</h2>
          <p className={styles.cardHeaderSubtitle}>
            Configure operational communication channels, WhatsApp milestone notifications, and SMS triggers.
          </p>
        </div>
        {isSaved && (
          <div className={styles.toastSaved}>
            <Check size={14} />
            <span>Notifications saved</span>
          </div>
        )}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.toggleRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>New Material RFQ & Order Pushes</span>
            <span className={styles.settingDesc}>
              Instant alerts whenever a site engineer or contractor places a new material requisition.
            </span>
          </div>
          <button
            type="button"
            className={`${styles.toggleSwitch} ${rfqAlerts ? styles.toggleSwitchActive : ""}`}
            onClick={() => setRfqAlerts(!rfqAlerts)}
            aria-label="Toggle RFQ Alerts"
          >
            <span className={styles.toggleSwitchThumb} />
          </button>
        </div>

        <div className={styles.toggleRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>WhatsApp Contractor & Driver Telemetry</span>
            <span className={styles.settingDesc}>
              Receive automated WhatsApp messages when drivers depart the hub and arrive on site.
            </span>
          </div>
          <button
            type="button"
            className={`${styles.toggleSwitch} ${whatsappSync ? styles.toggleSwitchActive : ""}`}
            onClick={() => setWhatsappSync(!whatsappSync)}
            aria-label="Toggle WhatsApp Sync"
          >
            <span className={styles.toggleSwitchThumb} />
          </button>
        </div>

        <div className={styles.toggleRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Milestone & Escrow Payment Settlements</span>
            <span className={styles.settingDesc}>
              Notifications when client escrow disbursements and order milestone payments clear.
            </span>
          </div>
          <button
            type="button"
            className={`${styles.toggleSwitch} ${paymentEscrowAlerts ? styles.toggleSwitchActive : ""}`}
            onClick={() => setPaymentEscrowAlerts(!paymentEscrowAlerts)}
            aria-label="Toggle Payment Alerts"
          >
            <span className={styles.toggleSwitchThumb} />
          </button>
        </div>

        <div className={styles.toggleRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Daily Operational Summary Email</span>
            <span className={styles.settingDesc}>
              Receive an end-of-day summary of deliveries, revenue, and stock reorders at 7:00 PM.
            </span>
          </div>
          <button
            type="button"
            className={`${styles.toggleSwitch} ${dailyDigest ? styles.toggleSwitchActive : ""}`}
            onClick={() => setDailyDigest(!dailyDigest)}
            aria-label="Toggle Daily Digest"
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
