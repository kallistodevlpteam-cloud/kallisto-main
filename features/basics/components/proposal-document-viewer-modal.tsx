"use client";

import {
  Check,
  CheckCircle2,
  Download,
  FileCheck2,
  FileText,
  ShieldCheck,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import styles from "./basics-workspace.module.css";

export interface ProposalDocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  contextTitle?: string;
  projectContext?: string;
  submittedBy?: string;
  submittedAt?: string;
  fileSize?: string;
}

export function ProposalDocumentViewerModal({
  isOpen,
  onClose,
  fileName,
  contextTitle = "Technical Proposal Submission",
  projectContext = "Nila Residence",
  submittedBy = "Specialist Provider",
  submittedAt = "14 Jul 2026",
  fileSize = "3.8 MB",
}: ProposalDocumentViewerModalProps) {
  const [downloadNotice, setDownloadNotice] = useState(false);

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

  const handleDownload = () => {
    const blob = new Blob(
      [
        `KALLISTO BASICS — VERIFIED SERVICE PROPOSAL DOCUMENT\n` +
        `===================================================\n` +
        `Document: ${fileName}\n` +
        `Project: ${projectContext}\n` +
        `Submitted By: ${submittedBy}\n` +
        `Date: ${submittedAt}\n` +
        `Reference: KB-DOC-${Math.random().toString(36).substring(2, 8).toUpperCase()}\n\n` +
        `Summary:\n` +
        `This technical package contains detailed specifications, engineering methodology, ` +
        `and milestone deliverables submitted for client review.\n`,
      ],
      { type: "application/pdf" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 3000);
  };

  return (
    <div
      className={styles.chatModalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-viewer-title"
    >
      <div
        className={styles.deliverableReviewDialog}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "780px" }}
      >
        {/* Header */}
        <div className={styles.deliverableReviewHeader}>
          <div className={styles.deliverableReviewHeaderLeft}>
            <div className={styles.deliverableReviewBadgeRow}>
              <span className={styles.deliverableReviewProjectTag}>
                {projectContext}
              </span>
              <span className={styles.deliverableReviewDisciplineTag}>
                {contextTitle}
              </span>
              <span className={styles.approvalVersionBadge}>
                Official Upload
              </span>
            </div>
            <h3 id="doc-viewer-title" className={styles.deliverableReviewTitle}>
              {fileName}
            </h3>
            <p className={styles.deliverableReviewSubtitle}>
              Uploaded by <strong>{submittedBy}</strong> on {submittedAt}
            </p>
          </div>

          <button
            type="button"
            className={styles.chatModalCloseBtn}
            onClick={onClose}
            aria-label="Close document preview"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {downloadNotice ? (
          <div className={styles.deliverableSuccessBanner} role="status">
            <Check size={14} aria-hidden="true" />
            <span>&ldquo;{fileName}&rdquo; downloaded successfully.</span>
          </div>
        ) : null}

        <div className={styles.deliverableReviewBody}>
          {/* File Information Card */}
          <div className={styles.deliverableFileHighlightCard}>
            <div className={styles.deliverableFileHighlightIconWrap}>
              <FileText size={24} style={{ color: "#dc2626" }} aria-hidden="true" />
              <span className={styles.deliverableFileBadge}>PDF</span>
            </div>

            <div className={styles.deliverableFileMetaCol}>
              <span className={styles.deliverableFileNameText}>{fileName}</span>
              <div className={styles.deliverableFileDetailsRow}>
                <span>Format: <strong>PDF Document</strong></span>
                <span>·</span>
                <span>Size: <strong>{fileSize}</strong></span>
                <span>·</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#16a34a" }}>
                  <ShieldCheck size={12} aria-hidden="true" />
                  Kallisto Verified Submission
                </span>
              </div>
            </div>

            <button
              type="button"
              className={styles.deliverableDownloadBtn}
              onClick={handleDownload}
              title={`Download ${fileName}`}
            >
              <Download size={14} aria-hidden="true" />
              <span>Download file</span>
            </button>
          </div>

          {/* Technical Document Preview Canvas */}
          <div className={styles.deliverableDocCanvas}>
            <div className={styles.deliverableDocWatermark}>
              KALLISTO BASICS · SERVICE SUBMISSION
            </div>

            <div className={styles.docTitleBlock}>
              <div className={styles.docTitleBlockHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className={styles.docBrandText}>KALLISTO BASICS</span>
                  <span className={styles.docSealBadge}>
                    <ShieldCheck size={12} aria-hidden="true" />
                    CERTIFIED TECHNICAL PROPOSAL
                  </span>
                </div>
                <span className={styles.docRefCode}>
                  REF: KB-PRP-{fileName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()}
                </span>
              </div>

              <div className={styles.docMetaTable}>
                <div className={styles.docMetaCell}>
                  <span className={styles.docMetaKey}>PROJECT</span>
                  <span className={styles.docMetaVal}>{projectContext}</span>
                </div>
                <div className={styles.docMetaCell}>
                  <span className={styles.docMetaKey}>SUBMITTED BY</span>
                  <span className={styles.docMetaVal}>{submittedBy}</span>
                </div>
                <div className={styles.docMetaCell}>
                  <span className={styles.docMetaKey}>DATE</span>
                  <span className={styles.docMetaVal}>{submittedAt}</span>
                </div>
                <div className={styles.docMetaCell}>
                  <span className={styles.docMetaKey}>STATUS</span>
                  <span className={styles.docMetaVal} style={{ color: "#0284c7" }}>
                    SUBMITTED FOR REVIEW
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.docContentPreview}>
              <div className={styles.docPreviewSection}>
                <h4>1. Document Summary & Technical Scope</h4>
                <p>
                  This submission presents the verified technical specifications, delivery method, and
                  governed milestone schedules in accordance with the published Kallisto Basics service request.
                  All deliverables are subject to client review, revision tracking, and milestone escrow security.
                </p>
              </div>

              <div className={styles.docPreviewSection}>
                <h4>2. Key Deliverable Verification Points</h4>
                <div className={styles.docChecklist}>
                  <div className={styles.docCheckItem}>
                    <CheckCircle2 size={13} style={{ color: "#16a34a" }} aria-hidden="true" />
                    <span>Scope alignment verified against requirement specification</span>
                  </div>
                  <div className={styles.docCheckItem}>
                    <CheckCircle2 size={13} style={{ color: "#16a34a" }} aria-hidden="true" />
                    <span>Coordinated drawings, structural calculations & technical report sheets included</span>
                  </div>
                  <div className={styles.docCheckItem}>
                    <CheckCircle2 size={13} style={{ color: "#16a34a" }} aria-hidden="true" />
                    <span>Milestone progress mapped to release schedule</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.deliverableReviewFooter}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onClose}
          >
            Close preview
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleDownload}
          >
            <Download size={13} aria-hidden="true" />
            <span>Download file ({fileSize})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
