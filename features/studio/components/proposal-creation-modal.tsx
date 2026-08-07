"use client";

import React, { useEffect, useRef } from "react";
import { ArrowRight, CheckCircle2, FileText, Sparkles } from "lucide-react";
import type { EnquiryRecord } from "@/features/enquiries/types/enquiry.types";
import styles from "./proposal-creation-modal.module.css";

export interface ProposalCreationModalProps {
  isOpen: boolean;
  enquiry?: EnquiryRecord | null;
  existingDraftExists?: boolean;
  onContinueDrafting: () => void;
  onCancel: () => void;
}

export function ProposalCreationModal({
  isOpen,
  enquiry,
  existingDraftExists = false,
  onContinueDrafting,
  onCancel,
}: ProposalCreationModalProps) {
  const continueBtnRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus primary button when modal opens
  useEffect(() => {
    if (isOpen) {
      continueBtnRef.current?.focus();
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCancel();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  // Map every field dynamically from the selected enquiry record
  const projectTitle = enquiry?.title || "Villa Design Consultation";
  const clientName = enquiry?.clientName || "Ananya Builders";
  const projectType =
    enquiry?.projectType === "residential"
      ? "Residential Interior"
      : enquiry?.projectType === "commercial"
      ? "Commercial Interior"
      : enquiry?.projectType || "Commercial Interior";
  const location = enquiry?.location || "Kochi";
  const budget =
    enquiry?.budget ||
    (enquiry?.budgetMin && enquiry?.budgetMax
      ? `₹${Math.round(enquiry.budgetMin / 100000)}L – ₹${Math.round(enquiry.budgetMax / 100000)}L`
      : "₹18L – ₹25L");
  const duration = enquiry?.timeline || enquiry?.duration || "Within 6 Months";
  const description =
    enquiry?.requirementSummary ||
    enquiry?.notes ||
    "Needs high-end luxury villa design with modern amenities, sustainable materials, and space planning.";

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      // Intentionally NOT closing on backdrop click to prevent accidental discarding of drafts
    >
      <div
        ref={modalRef}
        className={styles.modalContent}
        role="dialog"
        aria-modal="true"
        aria-labelledby="proposal-modal-title"
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <div className={styles.headerIcon} aria-hidden="true">
              <FileText size={18} />
            </div>
            <div>
              <h2 id="proposal-modal-title" className={styles.modalTitle}>
                Create Proposal
              </h2>
              <p className={styles.modalSubtitle}>
                Review the enquiry context before continuing in Hive Studio.
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* Status banner */}
          <div className={styles.statusBanner}>
            <Sparkles size={16} className={styles.statusIcon} aria-hidden="true" />
            <span>
              Hive Studio will use this enquiry information to prepare the proposal draft.
            </span>
          </div>

          {/* Draft notice if draft already exists */}
          {existingDraftExists && (
            <div className={styles.existingDraftNotice}>
              <CheckCircle2 size={15} aria-hidden="true" />
              <span>An active draft already exists for this enquiry.</span>
            </div>
          )}

          {/* Project Details Meta Grid */}
          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Project Title</span>
              <span className={styles.metaValue}>{projectTitle}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Client Name</span>
              <span className={styles.metaValue}>{clientName}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Project Type</span>
              <span className={styles.metaValue}>{projectType}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Location</span>
              <span className={styles.metaValue}>{location}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Budget</span>
              <span className={styles.metaValue}>{budget}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Duration</span>
              <span className={styles.metaValue}>{duration}</span>
            </div>
          </div>

          {/* Project Description (Read-only Content Review Box) */}
          <div className={styles.descriptionBox}>
            <div className={styles.descriptionHeader}>
              <span className={styles.descriptionLabel}>Project Description</span>
              <span className={styles.readOnlyBadge}>Read-only Context</span>
            </div>
            <div className={styles.descriptionText}>{description}</div>
          </div>
        </div>

        {/* Footer / CTA Buttons */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            ref={continueBtnRef}
            type="button"
            className={styles.continueBtn}
            onClick={onContinueDrafting}
          >
            <span>{existingDraftExists ? "Continue Existing Draft" : "Continue in Hive Studio"}</span>
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
