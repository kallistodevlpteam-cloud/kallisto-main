"use client";

import {
  Check,
  CheckCircle2,
  Download,
  FileText,
  RotateCcw,
  ShieldCheck,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import type {
  BasicsDeliverable,
  BasicsDeliverableVersion,
  BasicsEngagement,
  BasicsMilestone,
  BasicsProvider,
} from "../types/basics.types";
import styles from "./basics-workspace.module.css";

export interface DeliverableReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  engagement: BasicsEngagement;
  deliverable: BasicsDeliverable;
  latestVersion: BasicsDeliverableVersion;
  provider?: BasicsProvider;
  milestone?: BasicsMilestone;
  onApprove: (deliverable: BasicsDeliverable) => Promise<void>;
  onRequestRevision: (deliverable: BasicsDeliverable, comments: string) => Promise<void>;
}

export function DeliverableReviewModal({
  isOpen,
  onClose,
  engagement,
  deliverable,
  latestVersion,
  provider,
  milestone,
  onApprove,
  onRequestRevision,
}: DeliverableReviewModalProps) {
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [revisionComments, setRevisionComments] = useState("");
  const [working, setWorking] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

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

  const isAlreadyApproved = deliverable.status === "approved" || latestVersion.status === "approved";

  const handleApprove = async () => {
    setWorking(true);
    setStatusNotice(null);
    try {
      await onApprove(deliverable);
      setStatusNotice("Deliverable approved successfully! Milestone released.");
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setStatusNotice(err instanceof Error ? err.message : "Failed to approve deliverable.");
    } finally {
      setWorking(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionComments.trim()) {
      setStatusNotice("Please provide comments explaining the revision required.");
      return;
    }
    setWorking(true);
    setStatusNotice(null);
    try {
      await onRequestRevision(deliverable, revisionComments.trim());
      setStatusNotice("Revision request sent to the provider.");
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setStatusNotice(err instanceof Error ? err.message : "Failed to request revision.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <div
      className={styles.chatModalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="deliverable-review-title"
    >
      <div
        className={styles.deliverableReviewDialog}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.deliverableReviewHeader}>
          <div className={styles.deliverableReviewHeaderLeft}>
            <div className={styles.deliverableReviewBadgeRow}>
              <span className={styles.deliverableReviewProjectTag}>
                {engagement.projectName}
              </span>
              <span className={styles.deliverableReviewDisciplineTag}>
                {engagement.title}
              </span>
            </div>
            <h2 id="deliverable-review-title" className={styles.deliverableReviewTitle}>
              Review Output: {deliverable.name}
            </h2>
            <p className={styles.deliverableReviewSubtitle}>
              Submitted by <strong>{provider?.name || latestVersion.submittedBy}</strong> for client review and milestone authorization.
            </p>
          </div>
          <button
            type="button"
            className={styles.chatModalCloseBtn}
            onClick={onClose}
            aria-label="Close review dialog"
            title="Close (Esc)"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Status Notice Toast */}
        {statusNotice ? (
          <div
            className={
              statusNotice.includes("successfully") || statusNotice.includes("sent")
                ? styles.deliverableSuccessBanner
                : styles.deliverableAlertBanner
            }
            role="status"
          >
            {statusNotice.includes("successfully") ? (
              <CheckCircle2 size={15} aria-hidden="true" />
            ) : null}
            <span>{statusNotice}</span>
          </div>
        ) : null}

        {/* Modal Scrollable Body */}
        <div className={styles.deliverableReviewBody}>
          {/* 1. Submitted File Overview Card */}
          <div className={styles.deliverableFileHighlightCard}>
            <div className={styles.deliverableFileHighlightIconWrap}>
              <FileText size={28} className={styles.deliverableFileMainIcon} aria-hidden="true" />
              <span className={styles.deliverableFileBadgeFormat}>PDF</span>
            </div>
            <div className={styles.deliverableFileHighlightText}>
              <div className={styles.deliverableFileHighlightTitleRow}>
                <span className={styles.deliverableFileHighlightName}>
                  {latestVersion.fileName}
                </span>
                <span className={styles.deliverableFileVersionPill}>
                  Rev 0{latestVersion.version}
                </span>
                {isAlreadyApproved ? (
                  <span className={styles.deliverableApprovedPill}>
                    <Check size={10} aria-hidden="true" />
                    <span>Approved</span>
                  </span>
                ) : (
                  <span className={styles.deliverableAwaitingPill}>
                    Awaiting Review
                  </span>
                )}
              </div>
              <div className={styles.deliverableFileHighlightMeta}>
                <span>4.2 MB</span>
                <span>·</span>
                <span>Adobe Acrobat Document</span>
                <span>·</span>
                <span>Submitted {new Date(latestVersion.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
            </div>
            <div className={styles.deliverableFileHighlightActions}>
              <a
                href={latestVersion.fileReference}
                download={latestVersion.fileName}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.deliverableDownloadBtn}
                title="Download Output File"
                onClick={(e) => {
                  e.preventDefault();
                  alert(`Downloading ${latestVersion.fileName}...`);
                }}
              >
                <Download size={13} aria-hidden="true" />
                <span>Download File</span>
              </a>
            </div>
          </div>

          {/* 2. Technical Output Sheet Preview Canvas */}
          <div className={styles.deliverableDocCanvas}>
            <div className={styles.deliverableDocCanvasHeader}>
              <div className={styles.deliverableDocSeal}>
                <ShieldCheck size={14} aria-hidden="true" />
                <span>Kallisto Verified Engineering Output</span>
              </div>
              <span className={styles.deliverableDocHash}>
                Ref: {latestVersion.fileReference}
              </span>
            </div>

            <div className={styles.deliverableDocPreviewContent}>
              <div className={styles.deliverableDocWatermark} aria-hidden="true">
                {isAlreadyApproved ? "APPROVED CLIENT DELIVERABLE" : "SUBMITTED FOR REVIEW · NOT FOR CONSTRUCTION"}
              </div>

              <div className={styles.deliverableDocTitleBlock}>
                <h3 className={styles.deliverableDocHeadline}>
                  {deliverable.name} — Technical Report & Schedule
                </h3>
                <div className={styles.deliverableDocMetaGrid}>
                  <div>
                    <span className={styles.deliverableDocLabel}>Project:</span>
                    <span className={styles.deliverableDocValue}>{engagement.projectName}</span>
                  </div>
                  <div>
                    <span className={styles.deliverableDocLabel}>Consultant:</span>
                    <span className={styles.deliverableDocValue}>{provider?.name || latestVersion.submittedBy}</span>
                  </div>
                  <div>
                    <span className={styles.deliverableDocLabel}>Discipline:</span>
                    <span className={styles.deliverableDocValue}>{engagement.title}</span>
                  </div>
                  <div>
                    <span className={styles.deliverableDocLabel}>Revision:</span>
                    <span className={styles.deliverableDocValue}>Rev 0{latestVersion.version}</span>
                  </div>
                </div>
              </div>

              <div className={styles.deliverableDocScopeSection}>
                <h4 className={styles.deliverableDocSubheading}>Scope & Deliverable Verification</h4>
                <p className={styles.deliverableDocSummary}>
                  {deliverable.description || "Versioned specialist deliverables conforming to client requirements and statutory engineering standards."}
                </p>

                <ul className={styles.deliverableDocChecklist}>
                  <li>
                    <span className={styles.deliverableCheckIcon}>✓</span>
                    <span>General design basis notes and boundary coordinates verified against site survey</span>
                  </li>
                  <li>
                    <span className={styles.deliverableCheckIcon}>✓</span>
                    <span>Calculations compliant with National Building Code and relevant structural codes</span>
                  </li>
                  <li>
                    <span className={styles.deliverableCheckIcon}>✓</span>
                    <span>Load schedules, member sizing, and reinforcement schedules fully documented</span>
                  </li>
                  <li>
                    <span className={styles.deliverableCheckIcon}>✓</span>
                    <span>Quality checked and signed off by lead consultant engineer</span>
                  </li>
                </ul>
              </div>

              <div className={styles.deliverableDocRemarksBox}>
                <span className={styles.deliverableDocRemarksTitle}>Provider Submission Note:</span>
                <p className={styles.deliverableDocRemarksText}>
                  &ldquo;All structural calculations and drawing sheets have been updated to reflect the latest site soil strata reports. Foundation depths and column reinforcement schedules are finalized for client review and milestone escrow release.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* 3. Milestone & Commercial Impact */}
          {milestone ? (
            <div className={styles.deliverableMilestoneBox}>
              <div className={styles.deliverableMilestoneLeft}>
                <span className={styles.deliverableMilestoneHeading}>Linked Milestone Release</span>
                <span className={styles.deliverableMilestoneTitle}>{milestone.title}</span>
                <span className={styles.deliverableMilestoneNotice}>
                  Approval verifies satisfactory output completion and schedules escrow disbursement.
                </span>
              </div>
              <div className={styles.deliverableMilestoneRight}>
                <span className={styles.deliverableMilestoneAmount}>
                  ₹{milestone.amount.toLocaleString("en-IN")}
                </span>
                <span className={styles.deliverableMilestoneStatus}>Escrow Protected</span>
              </div>
            </div>
          ) : null}

          {/* 4. Revision Comments Area (Collapsible / Toggleable) */}
          {showRevisionInput ? (
            <div className={styles.deliverableRevisionInputBox}>
              <label htmlFor="revision-comments-input" className={styles.deliverableRevisionLabel}>
                Revision Instructions for {provider?.name || "Provider"}
              </label>
              <textarea
                id="revision-comments-input"
                className={styles.deliverableRevisionTextarea}
                rows={3}
                placeholder="Explain the adjustments, drawing corrections, or missing data needed before approval..."
                value={revisionComments}
                onChange={(e) => setRevisionComments(e.target.value)}
              />
              <div className={styles.deliverableRevisionActionsRow}>
                <button
                  type="button"
                  className={styles.deliverableSecondaryActionBtn}
                  onClick={() => setShowRevisionInput(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={working || !revisionComments.trim()}
                  className={styles.deliverableSubmitRevisionBtn}
                  onClick={handleRequestRevision}
                >
                  <RotateCcw size={12} aria-hidden="true" />
                  <span>Send Revision Request</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className={styles.deliverableReviewFooter}>
          <div className={styles.deliverableFooterLeft}>
            {!isAlreadyApproved && !showRevisionInput ? (
              <button
                type="button"
                className={styles.deliverableRequestRevisionToggleBtn}
                onClick={() => setShowRevisionInput(true)}
              >
                <RotateCcw size={13} aria-hidden="true" />
                <span>Request Revision</span>
              </button>
            ) : null}
          </div>

          <div className={styles.deliverableFooterRight}>
            <button
              type="button"
              className={styles.deliverableCloseActionBtn}
              onClick={onClose}
            >
              Close
            </button>

            {!isAlreadyApproved ? (
              <button
                type="button"
                disabled={working}
                className={styles.deliverableApproveBtn}
                onClick={handleApprove}
              >
                <CheckCircle2 size={15} aria-hidden="true" />
                <span>Approve Deliverable</span>
              </button>
            ) : (
              <span className={styles.deliverableApprovedStatusNotice}>
                <Check size={13} aria-hidden="true" />
                <span>Approved on {latestVersion.approvalTimestamp ? new Date(latestVersion.approvalTimestamp).toLocaleDateString("en-IN") : "Record"}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
