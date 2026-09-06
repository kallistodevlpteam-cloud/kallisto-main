"use client";

import React, { useState } from "react";
import { X, UserPlus } from "lucide-react";
import {
  WorkerProfile,
  WorkerTrade,
  WorkerAvailability,
} from "../../types/worker-domain";
import styles from "./hands-workers.module.css";

interface HandsAddWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWorker: (newWorker: WorkerProfile) => void;
}

export function HandsAddWorkerModal({
  isOpen,
  onClose,
  onAddWorker,
}: HandsAddWorkerModalProps) {
  const [name, setName] = useState("");
  const [trade, setTrade] = useState<WorkerTrade>("Mason");
  const [experienceYears, setExperienceYears] = useState("5");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("Kochi, Kerala");
  const [skillsInput, setSkillsInput] = useState("");
  const [dailyRate, setDailyRate] = useState("950");
  const [availability, setAvailability] = useState<WorkerAvailability>("Available");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter the worker's full name");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter a valid contact phone number");
      return;
    }

    const randomId = `KH-W-${Math.floor(1000 + Math.random() * 9000)}`;
    const parsedSkills = skillsInput
      ? skillsInput.split(",").map((s) => s.trim()).filter(Boolean)
      : [trade, "Site Operations"];

    const newWorker: WorkerProfile = {
      id: randomId,
      name: name.trim(),
      trade,
      experienceYears: parseInt(experienceYears, 10) || 1,
      availability,
      currentAssignment: null,
      verificationStatus: "Verified",
      phone: phone.trim(),
      location: location.trim() || "Kochi, Kerala",
      skills: parsedSkills,
      verificationDetails: {
        identityVerified: true,
        phoneVerified: true,
        tradeCertified: true,
        kycDocumentType: "Aadhaar Verified",
        verifiedAt: new Date().toISOString().split("T")[0],
      },
      recentWork: [],
      dailyRate: parseInt(dailyRate, 10) || 900,
    };

    onAddWorker(newWorker);
    onClose();
    // Reset form
    setName("");
    setPhone("");
    setSkillsInput("");
    setError(null);
  };

  return (
    <div
      className={styles.modalBackdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-worker-title"
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <UserPlus size={18} style={{ color: "#0f172a" }} />
            <h3 id="add-worker-title" className={styles.modalTitle}>
              Register New Worker
            </h3>
          </div>
          <button
            type="button"
            className={styles.drawerCloseBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {error && (
            <div
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                padding: "8px 12px",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            >
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Full Name *</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="e.g. Manikandan P"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Trade *</label>
              <select
                className={styles.formSelect}
                value={trade}
                onChange={(e) => setTrade(e.target.value as WorkerTrade)}
              >
                <option value="Mason">Mason</option>
                <option value="Helper">Helper</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Painter">Painter</option>
                <option value="Steel Fixer">Steel Fixer</option>
                <option value="Tile Worker">Tile Worker</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Experience (Years)</label>
              <input
                type="number"
                min="0"
                max="50"
                className={styles.formInput}
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Phone Number *</label>
              <input
                type="tel"
                className={styles.formInput}
                placeholder="+91 98470 00000"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError(null);
                }}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Daily Rate (₹)</label>
              <input
                type="number"
                step="50"
                className={styles.formInput}
                value={dailyRate}
                onChange={(e) => setDailyRate(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Location / Base Area</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="e.g. Kazhakkoottam, Trivandrum"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Initial Availability</label>
              <select
                className={styles.formSelect}
                value={availability}
                onChange={(e) => setAvailability(e.target.value as WorkerAvailability)}
              >
                <option value="Available">Available Today</option>
                <option value="Unavailable">Temporarily Unavailable</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Skills & Specialties (comma separated)</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="e.g. Brickwork, Plastering, Pointing"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              Add to Workforce
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
