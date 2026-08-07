"use client";

import React from "react";
import { Download, AlertCircle } from "lucide-react";
import styles from "./enquiry-project-documents-section.module.css";

export interface ProjectDocumentItem {
  id: string;
  name: string;
  size?: string;
  uploaded: boolean;
}

const DEFAULT_PROJECT_DOCUMENTS: ProjectDocumentItem[] = [
  {
    id: "doc-1",
    name: "Client Requirements.pdf",
    size: "2.4 MB",
    uploaded: true,
  },
  {
    id: "doc-2",
    name: "Site Inspection Report.pdf",
    size: "4.1 MB",
    uploaded: true,
  },
  {
    id: "doc-3",
    name: "Existing Floor Plan.dwg",
    size: "8.6 MB",
    uploaded: true,
  },
  {
    id: "doc-4",
    name: "Brand Guidelines.pdf",
    uploaded: false,
  },
];

export interface EnquiryProjectDocumentsSectionProps {
  documents?: ProjectDocumentItem[];
  extraCount?: number;
  title?: string;
  onDownload?: (documentId: string) => void;
  onViewAll?: () => void;
}

export function EnquiryProjectDocumentsSection({
  documents = DEFAULT_PROJECT_DOCUMENTS,
  extraCount = 5,
  title = "Project Documents",
  onDownload,
  onViewAll,
}: EnquiryProjectDocumentsSectionProps) {
  const visibleDocs = documents.slice(0, 4);

  return (
    <div className={styles.container} aria-label={title}>
      <h3 className={styles.title}>{title}</h3>

      <div className={styles.documentRow}>
        {visibleDocs.map((doc) => {
          const ext = doc.name.split(".").pop()?.toUpperCase() || "DOC";
          return (
            <div key={doc.id} className={styles.docCardWrapper}>
              <button
                type="button"
                className={styles.paperSheet}
                onClick={() => onDownload?.(doc.id)}
                aria-label={`View or download ${doc.name}`}
                title={doc.name}
              >
                {/* Folded Corner */}
                <div className={styles.cornerFold} />

                {/* Paper Header */}
                <div className={styles.paperHeader}>
                  <span className={styles.paperTitle}>{doc.name}</span>
                  <span className={styles.paperSubtitle}>
                    {doc.uploaded ? doc.size || "PDF Document" : "Missing File"}
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

                {/* Paper Footer */}
                <div className={styles.paperFooter}>
                  {doc.uploaded ? (
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

              <span className={styles.docLabelText} title={doc.name}>
                {doc.name}
              </span>
            </div>
          );
        })}

        {/* 5th Overflow Card (+5 More) */}
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
      </div>
    </div>
  );
}
