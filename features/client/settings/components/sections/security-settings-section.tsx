"use client";

import React, { useState } from "react";
import { Laptop, Smartphone, KeyRound, Check } from "lucide-react";
import type { ClientSecurityData } from "../../types/client-settings.types";
import styles from "../../styles/client-settings.module.css";

const INITIAL_SECURITY: ClientSecurityData = {
  email: "ananya.sharma@example.com",
  phone: "+91 98450 12345",
  twoFactorEnabled: true,
  passwordLastChanged: "3 months ago (May 24, 2026)",
  activeSessions: [
    {
      id: "sess-1",
      device: "MacBook Pro 16”",
      browser: "Chrome 128.0 · macOS Sonoma",
      location: "Bengaluru, India",
      lastActive: "Active now",
      isCurrent: true,
    },
    {
      id: "sess-2",
      device: "iPhone 15 Pro",
      browser: "Kallisto Mobile App · iOS 18",
      location: "Bengaluru, India",
      lastActive: "2 hours ago",
      isCurrent: false,
    },
  ],
};

export function SecuritySettingsSection() {
  const [security, setSecurity] = useState<ClientSecurityData>(INITIAL_SECURITY);
  const [isSaved, setIsSaved] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const toggle2FA = () => {
    setSecurity((prev) => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const revokeSession = (sessionId: string) => {
    setSecurity((prev) => ({
      ...prev,
      activeSessions: prev.activeSessions.filter((s) => s.id !== sessionId),
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Login Credentials & 2FA */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardHeaderTitle}>Security & Credentials</h2>
            <p className={styles.cardHeaderSubtitle}>
              Manage authentication keys, password policies, and multi-factor security.
            </p>
          </div>
          {isSaved && (
            <div className={styles.toastSaved}>
              <Check size={14} />
              <span>Security settings updated</span>
            </div>
          )}
        </div>

        <div className={styles.cardBody}>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Password</span>
              <span className={styles.settingDesc}>
                Last changed {security.passwordLastChanged}
              </span>
            </div>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => setShowPasswordModal(true)}
            >
              <KeyRound size={14} />
              <span>Change Password</span>
            </button>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Two-Factor Authentication (2FA)</span>
              <span className={styles.settingDesc}>
                Require an SMS OTP or authenticator code verification during login attempts.
              </span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={security.twoFactorEnabled}
                onChange={toggle2FA}
                aria-label="Toggle two-factor authentication"
              />
              <span className={styles.slider} />
            </label>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardHeaderTitle}>Active Sessions & Devices</h3>
            <p className={styles.cardHeaderSubtitle}>
              Devices currently authenticated and logged into your Kallisto client account.
            </p>
          </div>
        </div>

        <div className={styles.cardBody} style={{ padding: "0" }}>
          <table className={styles.settingsTable}>
            <thead>
              <tr>
                <th>Device</th>
                <th>Location</th>
                <th>Last Active</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {security.activeSessions.map((session) => (
                <tr key={session.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {session.device.includes("iPhone") || session.device.includes("Phone") ? (
                        <Smartphone size={16} color="#64748b" />
                      ) : (
                        <Laptop size={16} color="#64748b" />
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "13px" }}>
                          {session.device} {session.isCurrent && <span className={`${styles.badge} ${styles.badgeActive}`} style={{ marginLeft: "6px" }}>This Device</span>}
                        </div>
                        <div style={{ fontSize: "11.5px", color: "#64748b" }}>{session.browser}</div>
                      </div>
                    </div>
                  </td>
                  <td>{session.location}</td>
                  <td>{session.lastActive}</td>
                  <td style={{ textAlign: "right" }}>
                    {!session.isCurrent && (
                      <button
                        type="button"
                        className={styles.btnSecondary}
                        style={{ fontSize: "12px", padding: "4px 10px" }}
                        onClick={() => revokeSession(session.id)}
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPasswordModal && (
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
            style={{ width: "100%", maxWidth: "440px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)" }}
          >
            <div className={styles.cardHeader}>
              <h3 className={styles.cardHeaderTitle}>Change Password</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="currentPassword">Current Password</label>
                <input id="currentPassword" type="password" className={styles.input} />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="newPassword">New Password</label>
                <input id="newPassword" type="password" className={styles.input} />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="confirmPassword">Confirm New Password</label>
                <input id="confirmPassword" type="password" className={styles.input} />
              </div>
            </div>
            <div className={styles.cardFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => {
                  setShowPasswordModal(false);
                  setIsSaved(true);
                  setTimeout(() => setIsSaved(false), 3000);
                }}
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
