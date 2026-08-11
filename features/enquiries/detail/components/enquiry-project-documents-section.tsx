"use client";

import React from "react";
import Image from "next/image";
import { Download, AlertCircle } from "lucide-react";
import styles from "./enquiry-project-documents-section.module.css";

export interface ProjectDocumentItem {
  id: string;
  name: string | null;
  /** Document image preview URL from the backend project_DOC table. */
  docImageUrl?: string | null;
}

export interface EnquiryProjectDocumentsSectionProps {
  /** Documents strictly from the backend (project_DOC). Empty/absent
   * renders the empty state; no hardcoded documents are shown. */
  documents?: ProjectDocumentItem[];
  title?: string;
  onDownload?: (documentId: string) => void;
  onViewAll?: () => void;
}

export function EnquiryProjectDocumentsSection({
  documents = [],
  title = "Project Documents",
  onDownload,
  onViewAll,
}: EnquiryProjectDocumentsSectionProps) {
  const visibleDocs = documents.slice(0, 4);
  const extraCount = Math.max(0, documents.length - 4);

  return (
    <div className={styles.container} aria-label={title}>
      <h3 className={styles.title}>{title}</h3>

      {documents.length === 0 ? (
        <div className={styles.emptyState} role="status">
          No project documents have been shared yet.
        </div>
      ) : (
        <div className={styles.documentRow}>
          {visibleDocs.map((doc) => {
            const ext = doc.name?.split(".").pop()?.toUpperCase() || "DOC";
            const uploaded = Boolean(doc.docImageUrl) && Boolean(doc.name);
            return (
              <div key={doc.id} className={styles.docCardWrapper}>
                <button
                  type="button"
                  className={styles.paperSheet}
                  onClick={() => onDownload?.(doc.id)}
                  aria-label={
                    uploaded
                      ? `View or download ${doc.name}`
                      : `${doc.name ?? "Document"} is missing`
                  }
                  title={doc.name ?? "Missing document"}
                >
                  {/* Folded Corner */}
                  <div className={styles.cornerFold} />

                  {uploaded && doc.docImageUrl ? (
                    <div className={styles.paperImageWrap}>
                      <Image
                        src={doc.docImageUrl}
                        alt={doc.name ?? "Document preview"}
                        fill
                        sizes="96px"
                        className={styles.paperImage}
                      />
                    </div>
                  ) : (
                    <>
                      {/* Paper Header */}
                      <div className={styles.paperHeader}>
                        <span className={styles.paperTitle}>
                          {doc.name ?? "Missing Document"}
                        </span>
                      </div>

                      {/* Mock Document Text Lines */}
                      <div className={styles.paperLines}>
                        <div className={styles.paperLine} />
                        <div className={`${styles.paperLine} ${styles.paperLineShort}`} />
                        <div className={`${styles.paperLine} ${styles.paperLineMedium}`} />
                        <div className={styles.paperLine} />
                        <div className={`${styles.paperLine} ${styles.paperLineShort}`} />
                      </div>
                    </>
                  )}

                  {/* Paper Footer */}
                  <div className={styles.paperFooter}>
                    {uploaded ? (
                      <>
                        <span
                          className={`${styles.paperBadge} ${
                            ext === "DWG"
                              ? styles.badgeDwg
                              : ext === "XLSX"
                              ? styles.badgeXlsx
                              : styles.badgePdf
                          }`}
                        >
                          {ext}
                        </span>
                        <Download size={10} className={styles.downloadIcon} />
                      </>
                    ) : (
                      <>
                        <span className={`${styles.paperBadge} ${styles.badgeMissing}`}>
                          MISSING
                        </span>
                        <AlertCircle size={10} className={styles.missingBadge} />
                      </>
                    )}
                  </div>
                </button>

                <span className={styles.docLabelText} title={doc.name ?? undefined}>
                  {doc.name ?? "Missing Document"}
                </span>
              </div>
            );
          })}

          {/* Overflow Card (+N More) — only when the backend has more documents */}
          {extraCount > 0 ? (
            <div className={styles.docCardWrapper}>
              <button
                type="button"
                className={styles.morePaperSheet}
                onClick={onViewAll}
                aria-label={`View ${extraCount} more project documents`}
              >
                <div className={styles.cornerFold} />
                <div className={styles.moreCardInner}>
                  <span className={styles.moreNumber}>+{extraCount}</span>
                  <span className={styles.moreText}>More</span>
                </div>
              </button>
              <span className={styles.docLabelText}>+{extraCount} More</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}