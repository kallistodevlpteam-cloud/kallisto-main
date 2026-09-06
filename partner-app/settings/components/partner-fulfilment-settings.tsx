"use client";

import React, { useState } from "react";
import { MapPin, Check, Save, Truck } from "lucide-react";
import styles from "../styles/partner-settings.module.css";

export function PartnerFulfilmentSettings() {
  const [city, setCity] = useState("Kochi, Kerala");
  const [radius, setRadius] = useState("25 km");
  const [depotAddress, setDepotAddress] = useState("Plot 14, Industrial Estate, Kalamassery, Kochi - 683104");
  const [activeVehicles, setActiveVehicles] = useState("6 Medium Trucks & 3 Heavy Lorries");
  const [isSaved, setIsSaved] = useState(false);

  const radiusOptions = ["15 km", "25 km", "40 km", "60 km"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardHeaderTitle}>Fulfilment & Delivery Zones</h2>
          <p className={styles.cardHeaderSubtitle}>
            Configure your depot coverage radius, warehouse dispatch logistics, and site delivery thresholds.
          </p>
        </div>
        {isSaved && (
          <div className={styles.toastSaved}>
            <Check size={14} />
            <span>Fulfilment zone saved</span>
          </div>
        )}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.inputGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="city">Primary Fulfilment City</label>
            <input
              id="city"
              type="text"
              className={styles.input}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Operating Delivery Radius</label>
            <div className={styles.radiusChipGroup}>
              {radiusOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`${styles.radiusChip} ${radius === opt ? styles.radiusChipActive : ""}`}
                  onClick={() => setRadius(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="depotAddress">Depot / Warehouse Physical Address</label>
          <input
            id="depotAddress"
            type="text"
            className={styles.input}
            value={depotAddress}
            onChange={(e) => setDepotAddress(e.target.value)}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="activeVehicles">Fleet Dispatch Capacity</label>
          <input
            id="activeVehicles"
            type="text"
            className={styles.input}
            value={activeVehicles}
            onChange={(e) => setActiveVehicles(e.target.value)}
            required
          />
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
