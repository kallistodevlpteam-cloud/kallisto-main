"use client";

import React, { useState } from "react";
import { Camera, Check, User } from "lucide-react";
import { usePartnerAuth } from "../../auth/context/partner-auth-context";
import styles from "../styles/partner-settings.module.css";

export function PartnerProfileSettings() {
  const { user } = usePartnerAuth();

  const [name, setName] = useState(user?.name || "Ananya Pillai");
  const [email, setEmail] = useState(user?.email || "ananya.pillai@kallisto-hub.com");
  const [phone, setPhone] = useState(user?.phone || "+91 94471 67890");
  const [locationHub, setLocationHub] = useState(user?.location || "Ernakulam Hub, Kerala");
  const [avatarUrl] = useState<string | null>(
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80"
  );
  const [preferredContact, setPreferredContact] = useState("whatsapp");
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
          <h2 className={styles.cardHeaderTitle}>Personal Profile</h2>
          <p className={styles.cardHeaderSubtitle}>
            Manage your operational administrator identity, contact details, and hub dispatch preferences.
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
        {/* Profile Photo */}
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Profile Photo</span>
            <span className={styles.settingDesc}>
              Displayed to architects, verified contractors, and site supervisors during order fulfillment.
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "1px solid #e2e8f0",
                background: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={name}
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="locationHub">Primary Location Hub</label>
            <input
              id="locationHub"
              type="text"
              className={styles.input}
              value={locationHub}
              onChange={(e) => setLocationHub(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="contactMethod">Preferred Dispatch Communication</label>
          <select
            id="contactMethod"
            className={styles.select}
            value={preferredContact}
            onChange={(e) => setPreferredContact(e.target.value)}
          >
            <option value="whatsapp">WhatsApp Business & In-App (Recommended)</option>
            <option value="phone">Direct Phone Call</option>
            <option value="email">Email Only</option>
          </select>
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
