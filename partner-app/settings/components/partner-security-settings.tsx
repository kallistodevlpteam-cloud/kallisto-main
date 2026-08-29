"use client";

import React, { useState } from "react";
import { Check, KeyRound, Shield, Save, Smartphone, Laptop } from "lucide-react";
import styles from "../styles/partner-settings.module.css";

export function PartnerSecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardHeaderTitle}>Security & Login</h2>
          <p className={styles.cardHeaderSubtitle}>
            Manage your partner portal credentials, two-factor authentication, and authorized device sessions.
          </p>
        </div>
        {isSaved && (
          <div className={styles.toastSaved}>
            <Check size={14} />
            <span>Security updated</span>
          </div>
        )}
      </div>

      <div className={styles.cardBody}>
        {/* Change Password */}
        <div className={styles.inputGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </div>

        {/* 2FA Toggle */}
        <div className={styles.toggleRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Two-Factor Authentication (2FA)</span>
            <span className={styles.settingDesc}>
              Requires SMS or authenticator OTP verification when signing in from an unrecognized browser or device.
            </span>
          </div>
          <button
            type="button"
            className={`${styles.toggleSwitch} ${twoFactorEnabled ? styles.toggleSwitchActive : ""}`}
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            aria-label="Toggle 2FA"
          >
            <span className={styles.toggleSwitchThumb} />
          </button>
        </div>

        {/* Active Sessions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "6px" }}>
          <span className={styles.settingLabel}>Active Dispatch Sessions</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Laptop size={16} color="#0f172a" />
                <div>
                  <p style={{ margin: 0, fontSize: "12.5px", fontWeight: 600, color: "#0f172a" }}>
                    Chrome on macOS (Current Session)
                  </p>
                  <p style={{ margin: 0, fontSize: "11.5px", color: "#64748b" }}>Kochi, India · IP 103.212.x.x</p>
                </div>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#16a34a" }}>Active Now</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Smartphone size={16} color="#64748b" />
                <div>
                  <p style={{ margin: 0, fontSize: "12.5px", fontWeight: 600, color: "#0f172a" }}>
                    Kallisto Hub Partner App on iOS
                  </p>
                  <p style={{ margin: 0, fontSize: "11.5px", color: "#64748b" }}>Ernakulam, India · 2 hours ago</p>
                </div>
              </div>
              <button type="button" className={styles.btnSecondary} style={{ fontSize: "11px", padding: "4px 8px" }}>
                Revoke
              </button>
            </div>
          </div>
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
