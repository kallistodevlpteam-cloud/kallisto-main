"use client";

import React, { useState } from "react";
import { Camera, Check, User } from "lucide-react";
import type { ClientProfileData, ClientPreferredContactMethod } from "../../types/client-settings.types";
import styles from "../../styles/client-settings.module.css";

const INITIAL_PROFILE: ClientProfileData = {
  fullName: "Ananya Sharma",
  email: "ananya.sharma@example.com",
  phone: "+91 98450 12345",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80",
  preferredContactMethod: "whatsapp",
  preferredCommunicationTime: "10:00 AM – 06:00 PM (IST)",
};

export function ProfileSettingsSection() {
  const [profile, setProfile] = useState<ClientProfileData>(INITIAL_PROFILE);
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
          <h2 className={styles.cardHeaderTitle}>Personal Profile</h2>
          <p className={styles.cardHeaderSubtitle}>
            Manage your personal identity, contact details, and client preferences.
          </p>
        </div>
        {isSaved && (
          <div className={styles.toastSaved}>
            <Check size={14} />
            <span>Profile saved</span>
          </div>
        )}
      </div>

      <div className={styles.cardBody}>
        {/* Profile Avatar */}
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Profile Photo</span>
            <span className={styles.settingDesc}>
              This will be displayed to verified architects, project managers, and specialists working on your projects.
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "1px solid var(--line, #e2e8f0)",
                background: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <User size={24} color="#64748b" />
              )}
            </div>
            <button type="button" className={styles.btnSecondary} style={{ fontSize: "12px", padding: "6px 12px" }}>
              <Camera size={13} />
              <span>Change Photo</span>
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className={styles.inputGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              className={styles.input}
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div className={styles.inputGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              className={styles.input}
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="preferredContactMethod">Preferred Contact Method</label>
            <select
              id="preferredContactMethod"
              className={styles.select}
              value={profile.preferredContactMethod}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  preferredContactMethod: e.target.value as ClientPreferredContactMethod,
                })
              }
            >
              <option value="whatsapp">WhatsApp (Recommended)</option>
              <option value="phone">Phone Calls</option>
              <option value="email">Email</option>
              <option value="in_app">In-App Messages Only</option>
            </select>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="commTime">Preferred Communication Window</label>
          <input
            id="commTime"
            type="text"
            className={styles.input}
            value={profile.preferredCommunicationTime}
            onChange={(e) => setProfile({ ...profile, preferredCommunicationTime: e.target.value })}
            placeholder="e.g. 10:00 AM – 06:00 PM (IST)"
          />
          <span className={styles.settingDesc} style={{ marginTop: "2px" }}>
            Service providers will be requested to reach out strictly within your selected hours.
          </span>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <button type="submit" className={styles.btnPrimary}>
          Save Changes
        </button>
      </div>
    </form>
  );
}
