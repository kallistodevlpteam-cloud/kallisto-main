"use client";

import React from "react";
import { Download, AlertCircle, FileText, FileSpreadsheet, FileCode, Paperclip } from "lucide-react";
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

function getFileIcon(ext: string) {
  switch (ext) {
    case "DWG":
      return <FileCode size={16} />;
    case "XLSX":
    case "CSV":
      return <FileSpreadsheet size={16} />;
    case "PDF":
      return <FileText size={16} />;
    default:
      return <Paperclip size={16} />;
  }
}

export function EnquiryProjectDocumentsSection({
  documents = DEFAULT_PROJECT_DOCUMENTS,
  title = "Project Documents",
  onDownload,
}: EnquiryProjectDocumentsSectionProps) {
  return (
    <div className={styles.container} aria-label={title}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.countBadge}>{documents.length} files</span>
      </div>

      <div className={styles.documentList}>
        {documents.map((doc) => {
          const ext = doc.name.split(".").pop()?.toUpperCase() || "DOC";
          return (
            <div key={doc.id} className={styles.listItem}>
              <div className={styles.itemLeft}>
                <div
                  className={`${styles.fileIconWrap} ${
                    ext === "DWG"
                      ? styles.iconDwg
                      : ext === "XLSX"
                      ? styles.iconXlsx
                      : !doc.uploaded
                      ? styles.iconMissing
                      : styles.iconPdf
                  }`}
                >
                  {getFileIcon(ext)}
                </div>

                <div className={styles.fileDetails}>
                  <span className={styles.fileName}>{doc.name}</span>
                  <span className={styles.fileMeta}>
                    {doc.uploaded ? `${doc.size || "Document"} • ${ext}` : "Missing File"}
                  </span>
                </div>
              </div>

              <div className={styles.itemRight}>
                {doc.uploaded ? (
                  <button
                    type="button"
                    className={styles.downloadBtn}
                    onClick={() => onDownload?.(doc.id)}
                    aria-label={`Download ${doc.name}`}
                  >
                    <Download size={12} />
                    <span>Download</span>
                  </button>
                ) : (
                  <span className={styles.missingStatus}>
                    <AlertCircle size={12} />
                    <span>Missing</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
