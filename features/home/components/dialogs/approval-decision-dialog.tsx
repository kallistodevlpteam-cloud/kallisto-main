"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import { ApprovalRequestItem } from "@/types/domain/home";
import styles from "../../home-workspace.module.css";

export interface ApprovalDecisionDialogProps {
  isOpen: boolean;
  request: ApprovalRequestItem | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ApprovalDecisionDialog({
  isOpen,
  request,
  isSubmitting = false,
  onClose,
  onConfirm,
}: ApprovalDecisionDialogProps) {
  if (!isOpen || !request) return null;

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="approve-modal-title">
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleGroup}>
            <CheckCircle2 size={20} className={styles.iconGreen} />
            <h3 id="approve-modal-title" className={styles.modalTitle}>Confirm Approval — {request.requestId}</h3>
          </div>
          <button type="button" onClick={onClose} className={styles.modalCloseBtn} aria-label="Close dialog" disabled={isSubmitting}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.modalDescription}>
            Are you sure you want to approve this request? An audit log entry will be permanently recorded.
          </p>

          <div className={styles.requestSummaryCard}>
            <div><strong>Project:</strong> {request.projectName}</div>
            <div><strong>Request Type:</strong> {request.requestType.toUpperCase()}</div>
            <div><strong>Summary:</strong> {request.itemsSummary}</div>
            {request.amountOrQuantities && (
              <div><strong>Value/Quantities:</strong> {request.amountOrQuantities}</div>
            )}
            <div><strong>Requested By:</strong> {request.requestedBy} ({request.requestedDate})</div>
          </div>

          <div className={styles.warningNote}>
            <AlertTriangle size={14} className={styles.iconAmber} />
            <span>Approval will unlock downstream project phase execution and notify stakeholders.</span>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" onClick={onClose} className={styles.btnSecondary} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={styles.btnSuccess}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Approving..." : "Confirm Approval"}
          </button>
        </div>
      </div>
    </div>
  );
}
