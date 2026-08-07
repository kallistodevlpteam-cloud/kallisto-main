"use client";

import React, { useState } from "react";
import { XCircle, X } from "lucide-react";
import { ApprovalRequestItem } from "@/types/domain/home";
import styles from "../../home-workspace.module.css";

export interface RejectionReasonDialogProps {
  isOpen: boolean;
  request: ApprovalRequestItem | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function RejectionReasonDialog({
  isOpen,
  request,
  isSubmitting = false,
  onClose,
  onConfirm,
}: RejectionReasonDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen || !request) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("A rejection reason is mandatory.");
      return;
    }
    setError("");
    onConfirm(reason.trim());
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="reject-modal-title">
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleGroup}>
            <XCircle size={20} className={styles.iconRed} />
            <h3 id="reject-modal-title" className={styles.modalTitle}>Reject Request — {request.requestId}</h3>
          </div>
          <button type="button" onClick={onClose} className={styles.modalCloseBtn} aria-label="Close dialog" disabled={isSubmitting}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <p className={styles.modalDescription}>
              Please provide a specific reason for rejecting this request. The requester will be notified to make necessary revisions.
            </p>

            <div className={styles.requestSummaryCard}>
              <div><strong>Project:</strong> {request.projectName}</div>
              <div><strong>Item:</strong> {request.itemsSummary}</div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="rejection-reason-input" className={styles.formLabel}>
                Rejection Reason <span className={styles.requiredStar}>*</span>
              </label>
              <textarea
                id="rejection-reason-input"
                className={`${styles.formTextarea}${error ? ` ${styles.inputError}` : ""}`}
                rows={3}
                placeholder="Specify missing rates, scope discrepancy, or revision requirements..."
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (e.target.value.trim()) setError("");
                }}
                disabled={isSubmitting}
              />
              {error && <span className={styles.errorMessage}>{error}</span>}
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.btnSecondary} disabled={isSubmitting}>
              Cancel
            </button>
            <button
              type="submit"
              className={styles.btnDanger}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
