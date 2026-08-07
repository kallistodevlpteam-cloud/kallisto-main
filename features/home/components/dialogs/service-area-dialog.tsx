"use client";

import React, { useState } from "react";
import { MapPin, X } from "lucide-react";
import styles from "../../home-workspace.module.css";

export interface ServiceAreaDialogProps {
  isOpen: boolean;
  currentServiceArea: string;
  onClose: () => void;
  onSave: (newArea: string) => void;
}

const AVAILABLE_SERVICE_AREAS = [
  "Kochi, Kerala",
  "Thiruvananthapuram, Kerala",
  "Kozhikode (Calicut), Kerala",
  "Kottayam, Kerala",
  "Thrissur, Kerala",
  "Kannur, Kerala",
  "Bengaluru, Karnataka",
];

export function ServiceAreaDialog({
  isOpen,
  currentServiceArea,
  onClose,
  onSave,
}: ServiceAreaDialogProps) {
  const [selectedArea, setSelectedArea] = useState(currentServiceArea);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(selectedArea);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="service-area-title">
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleGroup}>
            <MapPin size={18} className={styles.iconBlue} />
            <h3 id="service-area-title" className={styles.modalTitle}>Change Primary Service Area</h3>
          </div>
          <button type="button" onClick={onClose} className={styles.modalCloseBtn} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <p className={styles.modalDescription}>
              Select your primary operating region. Opportunities and site feasibility reports are filtered based on your service area.
            </p>

            <div className={styles.radioGroup}>
              {AVAILABLE_SERVICE_AREAS.map((area) => (
                <label key={area} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="serviceArea"
                    value={area}
                    checked={selectedArea === area}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className={styles.radioInput}
                  />
                  <span>{area}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.btnSecondary}>
              Cancel
            </button>
            <button type="submit" className={styles.btnPrimary}>
              Save Service Area
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
