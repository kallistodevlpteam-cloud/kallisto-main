"use client";

import React from "react";
import { Folder, AlertCircle, Check, ChevronRight } from "lucide-react";
import styles from "./enquiry-documents-summary.module.css";

export interface EnquiryDocumentSummaryItem {
  id: string;
  label: string;
  required: boolean;
  uploaded: boolean;
}

export interface EnquiryDocumentsSummaryProps {
  documents: EnquiryDocumentSummaryItem[];
  onViewAllFiles: () => void;
  className?: string;
}

export function EnquiryDocumentsSummary({
  documents,
  onViewAllFiles,
  className,
}: EnquiryDocumentsSummaryProps) {
  // Derived counts
  const uploadedCount = documents.filter((doc) => doc.uploaded).length;
  const requiredCount = documents.filter((doc) => doc.required).length;
  const missingRequiredDocuments = documents.filter(
    (doc) => doc.required && !doc.uploaded
  );
  const missingCount = missingRequiredDocuments.length;

  const visibleMissing = missingRequiredDocuments.slice(0, 3);
  const extraMissingCount = Math.max(0, missingCount - 3);

  return (
    <div
      className={`${styles.card}${className ? ` ${className}` : ""}`}
      aria-label="Enquiry documents summary"
    >
      {/* Header Row */}
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <Folder size={15} className={styles.icon} aria-hidden="true" />
          <h3 className={styles.title}>Documents</h3>
        </div>
        <span className={styles.totalBadge}>{documents.length} total</span>
      </div>

      {/* Summary Line */}
      <div className={styles.summaryLine}>
        <span className={styles.uploadedCount}>{uploadedCount} uploaded</span>
        {requiredCount > 0 && (
          <>
            <span className={styles.bullet} aria-hidden="true">
              ·
            </span>
            {missingCount > 0 ? (
              <span className={styles.missingBadge}>{missingCount} missing</span>
            ) : (
              <span className={styles.completeBadge}>
                <Check size={13} aria-hidden="true" />
                <span>Complete</span>
              </span>
            )}
          </>
        )}
      </div>

      {/* Missing Section */}
      <div className={styles.missingSection}>
        {requiredCount > 0 && (
          <>
            {missingCount > 0 ? (
              <>
                <span className={styles.missingSectionLabel}>Missing</span>
                <div className={styles.missingList} role="list">
                  {visibleMissing.map((doc) => (
                    <div
                      key={doc.id}
                      className={styles.missingRow}
                      role="listitem"
                      title={doc.label}
                    >
                      <AlertCircle
                        size={14}
                        className={styles.rowIcon}
                        aria-hidden="true"
                      />
                      <span className={styles.docLabel}>{doc.label}</span>
                    </div>
                  ))}

                  {extraMissingCount > 0 && (
                    <div className={styles.moreMissingRow}>
                      +{extraMissingCount} more required document
                      {extraMissingCount > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className={styles.completeBox}>
                <Check size={14} className={styles.rowIconComplete} aria-hidden="true" />
                <span>All required documents received</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Action */}
      <div className={styles.footer}>
        <button
          type="button"
          className={styles.viewAllBtn}
          onClick={onViewAllFiles}
          aria-label="View all enquiry files in main panel"
        >
          <span>View all files</span>
          <ChevronRight size={14} className={styles.btnChevron} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
