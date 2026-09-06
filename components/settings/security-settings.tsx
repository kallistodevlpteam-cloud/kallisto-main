"use client";

import React, { useState } from "react";
import { Laptop, Smartphone, KeyRound, Check } from "lucide-react";
import styles from "../../app/settings/settings.module.css";

export function SecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const toggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const sessions = [
    {
      id: "sess-1",
      device: "MacBook Pro 16”",
      browser: "Chrome 128.0 · macOS Sonoma",
      location: "Bengaluru, India",
      lastActive: "Active now",
      isCurrent: true,
    },
  ];

  return (
    <div className={styles.contentScrollArea}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardHeaderTitle}>Security & Credentials</h2>
            <p className={styles.cardHeaderSubtitle}>
              Manage authentication keys, password policies, and multi-factor security.
            </p>
          </div>
        </div>

        <div className={styles.cardBody}>
          {/* Password Row */}
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Password</span>
              <span className={styles.settingDesc}>
                Last changed 3 months ago (May 24, 2026)
              </span>
            </div>
            <div className={styles.settingControl}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => alert("Password change workflow initiated.")}
              >
                <KeyRound size={14} />
                <span>Change Password</span>
              </button>
            </div>
          </div>

          {/* Two-Factor Authentication (2FA) Row */}
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Two-Factor Authentication (2FA)</span>
              <span className={styles.settingDesc}>
                Require an SMS OTP or authenticator code verification during login attempts.
              </span>
            </div>
            <div className={styles.settingControl}>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={toggle2FA}
                  aria-label="Toggle two-factor authentication"
                />
                <span className={styles.slider} />
              </label>
            </div>
          </div>

          {/* Active Sessions & Devices Sub-section */}
          <div className={styles.subSection}>
            <h3 className={styles.subSectionTitle}>Active Sessions & Devices</h3>
            <p className={styles.subSectionDesc}>
              Devices currently authenticated and logged into your Kallisto client account.
            </p>

            <table className={styles.deviceTable}>
              <thead>
                <tr>
                  <th>DEVICE</th>
                  <th>LOCATION</th>
                  <th>LAST ACTIVE</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                        <Laptop size={18} color="#64748b" style={{ marginTop: "2px" }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <span style={{ fontWeight: 600 }}>{session.device}</span>
                            {session.isCurrent && (
                              <span className={styles.thisDeviceBadge}>This Device</span>
                            )}
                          </div>
                          <span style={{ fontSize: "12px", color: "#64748b" }}>
                            {session.browser}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "#334155" }}>{session.location}</td>
                    <td style={{ color: "#334155" }}>{session.lastActive}</td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
