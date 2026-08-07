"use client";

import React, { useState } from "react";
import styles from "../../app/settings/settings.module.css";

interface AccountSettingsProps {
  user: {
    uid: string;
    role: string;
  };
}

export function AccountSettings({ user }: AccountSettingsProps) {
  // Profile state
  const [photoUrl, setPhotoUrl] = useState("/assets/profile_avatar.png");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");

  // Preferences state
  const [timezone, setTimezone] = useState("");
  const [language, setLanguage] = useState("");
  const [startOfWeek, setStartOfWeek] = useState("");
  const [dateFormat, setDateFormat] = useState("");
  const [twentyFourHourFormat, setTwentyFourHourFormat] = useState(true);
  const [showActiveDot, setShowActiveDot] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
    }
  };

  return (
    <div className={styles.settingsContentOutlet}>
      <div className={styles.profileCleanContainer}>
        {/* Profile Section */}
        <section>
          <div className={styles.profileSectionHeader}>
            <h2 className={styles.profileSectionTitle}>Profile</h2>
            <p className={styles.profileSectionSubtitle}>
              Manage your information, preferences, and connected data.
            </p>
          </div>

          {/* Profile Photo */}
          <div className={styles.profilePhotoRow}>
            <label style={{ cursor: "pointer", display: "inline-block" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl} alt="Profile photo" className={styles.profilePhotoAvatar} />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: "none" }}
              />
            </label>
            <div className={styles.profilePhotoMeta}>
              <span className={styles.profilePhotoLabel}>Profile photo</span>
              <span className={styles.profilePhotoHint}>PNG, JPEG, SVG (Less than 5MB)</span>
            </div>
          </div>

          {/* Profile Form Fields */}
          <div className={styles.cleanFormGrid}>
            <div className={styles.cleanFieldGroup}>
              <label className={styles.cleanFieldLabel}>First Name</label>
              <input
                type="text"
                className={styles.cleanInput}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder=""
              />
            </div>

            <div className={styles.cleanFieldGroup}>
              <label className={styles.cleanFieldLabel}>Last Name</label>
              <input
                type="text"
                className={styles.cleanInput}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
              />
            </div>

            <div className={`${styles.cleanFieldGroup} ${styles.fullWidthField}`}>
              <label className={styles.cleanFieldLabel}>Username</label>
              <input
                type="text"
                className={styles.cleanInput}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>

            <div className={`${styles.cleanFieldGroup} ${styles.fullWidthField}`}>
              <label className={styles.cleanFieldLabel}>Email</label>
              <input
                type="email"
                className={styles.cleanInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>

            <div className={`${styles.cleanFieldGroup} ${styles.fullWidthField}`}>
              <label className={styles.cleanFieldLabel}>Website</label>
              <div className={styles.websiteInputContainer}>
                <span className={styles.websitePrefix}>https://</span>
                <input
                  type="text"
                  className={`${styles.cleanInput} ${styles.websiteInput}`}
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="company.com"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section style={{ marginTop: "12px" }}>
          <div className={styles.profileSectionHeader}>
            <h2 className={styles.profileSectionTitle}>Preferences</h2>
            <p className={styles.profileSectionSubtitle}>
              Manage your application preferences
            </p>
          </div>

          <div className={styles.cleanFormGrid}>
            <div className={styles.cleanFieldGroup}>
              <label className={styles.cleanFieldLabel}>Timezone</label>
              <select
                className={styles.cleanSelect}
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                <option value="" disabled hidden>
                  Select timezone
                </option>
                <option value="UTC+5:30">UTC+5:30 (India Standard Time)</option>
                <option value="UTC+0:00">UTC+0:00 (Coordinated Universal Time)</option>
                <option value="UTC-5:00">UTC-5:00 (Eastern Standard Time)</option>
                <option value="UTC-8:00">UTC-8:00 (Pacific Standard Time)</option>
              </select>
            </div>

            <div className={styles.cleanFieldGroup}>
              <label className={styles.cleanFieldLabel}>Language</label>
              <select
                className={styles.cleanSelect}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="" disabled hidden>
                  Select language
                </option>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>

            <div className={styles.cleanFieldGroup}>
              <label className={styles.cleanFieldLabel}>Start of the week</label>
              <select
                className={styles.cleanSelect}
                value={startOfWeek}
                onChange={(e) => setStartOfWeek(e.target.value)}
              >
                <option value="" disabled hidden>
                  Select date
                </option>
                <option value="Monday">Monday</option>
                <option value="Sunday">Sunday</option>
                <option value="Saturday">Saturday</option>
              </select>
            </div>

            <div className={styles.cleanFieldGroup}>
              <label className={styles.cleanFieldLabel}>Date format</label>
              <select
                className={styles.cleanSelect}
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
              >
                <option value="" disabled hidden>
                  Select format
                </option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>

          {/* Toggle Switches */}
          <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className={styles.toggleRow}>
              <label className={styles.switchLabel}>
                <input
                  type="checkbox"
                  className={`${styles.switchInput} ${styles.greenSwitchInput}`}
                  checked={twentyFourHourFormat}
                  onChange={(e) => setTwentyFourHourFormat(e.target.checked)}
                />
                <span className={styles.greenSwitchSlider} />
              </label>
              <label
                className={styles.toggleMeta}
                onClick={() => setTwentyFourHourFormat(!twentyFourHourFormat)}
              >
                <span className={styles.toggleTitle}>24 hour time format</span>
                <span className={styles.toggleDesc}>
                  Example: 20:00 PM, 12-hour format if switch off
                </span>
              </label>
            </div>

            <div className={styles.toggleRow}>
              <label className={styles.switchLabel}>
                <input
                  type="checkbox"
                  className={`${styles.switchInput} ${styles.greenSwitchInput}`}
                  checked={showActiveDot}
                  onChange={(e) => setShowActiveDot(e.target.checked)}
                />
                <span className={styles.greenSwitchSlider} />
              </label>
              <label
                className={styles.toggleMeta}
                onClick={() => setShowActiveDot(!showActiveDot)}
              >
                <span className={styles.toggleTitle}>Show active dot</span>
                <span className={styles.toggleDesc}>
                  Display a green dot next to your picture if you&apos;re online
                </span>
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}


