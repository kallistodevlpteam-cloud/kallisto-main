"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X, Check, Zap, ArrowRight } from "lucide-react";
import { LockDuotoneIcon } from "./sidebar-icons";
import styles from "./locked-feature-modal.module.css";

export interface LockedFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  featureName: string;
  perks?: string[];
}

export function LockedFeatureModal({
  isOpen,
  onClose,
  title,
  description,
  featureName,
  perks = [
    "Multi-seat collaborative workspace access",
    "Granular role-based permissions & audit history",
    "Priority support & cloud synchronisation",
  ],
}: LockedFeatureModalProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isPartner = pathname?.startsWith("/partner");

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="locked-modal-title"
    >
      <div
        className={styles.modalDialog}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div className={styles.iconWrapper}>
            <LockDuotoneIcon size={22} />
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.badgeRow}>
            <span className={styles.lockBadge}>
              {isPartner ? "Locked for Beta Trials" : "Plan Locked"}
            </span>
          </div>

          <h2 id="locked-modal-title" className={styles.modalTitle}>
            {title}
          </h2>

          <p className={styles.modalDescription}>
            {description}
          </p>

          {perks && perks.length > 0 && (
            <div className={styles.perksBox}>
              <span className={styles.perksTitle}>
                {isPartner ? "Operational Focus for Beta Trials:" : `What unlocks with ${featureName}:`}
              </span>
              {perks.map((perk, idx) => (
                <div key={idx} className={styles.perkItem}>
                  <span className={styles.perkCheckCircle}>
                    <Check size={11} strokeWidth={3} />
                  </span>
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.dismissBtn}
            onClick={onClose}
          >
            Dismiss
          </button>
          {isPartner ? (
            <button
              type="button"
              className={styles.upgradeBtn}
              onClick={() => {
                onClose();
                if (pathname !== "/partner/hub/products") {
                  router.push("/partner/hub/products");
                }
              }}
            >
              <span>Go to Products Workspace</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              className={styles.upgradeBtn}
              onClick={() => {
                onClose();
              }}
            >
              <Zap size={14} fill="currentColor" className={styles.sparkleIcon} />
              <span>Upgrade Workspace</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
