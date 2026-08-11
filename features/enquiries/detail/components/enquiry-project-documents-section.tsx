"use client";

import React from "react";
import { Download, FileText, FileCode, FileSpreadsheet, Archive, MoreHorizontal, AlertCircle } from "lucide-react";
import styles from "./enquiry-project-documents-section.module.css";

export interface ProjectDocumentItem {
  id: string;
  name: string;
  size?: string;
  discipline?: string;
  status?: "Approved" | "In Review" | "Draft" | "Missing";
  revision?: string;
  updatedAt?: string;
  updatedBy?: {
    name: string;
    avatar?: string;
    initials?: string;
  };
  isNew?: boolean;
  uploaded: boolean;
}

const DEFAULT_PROJECT_DOCUMENTS: ProjectDocumentItem[] = [
  {
    id: "doc-1",
    name: "Ground Floor Plan.pdf",
    size: "4.2 MB",
    discipline: "Drawings",
    status: "Approved",
    revision: "R03",
    updatedAt: "11 Aug 2026",
    updatedBy: { name: "Arjun Mehta", initials: "AM" },
    isNew: true,
    uploaded: true,
  },
  {
    id: "doc-2",
    name: "Structural Layout.dwg",
    size: "12.8 MB",
    discipline: "Drawings",
    status: "In Review",
    revision: "R02",
    updatedAt: "10 Aug 2026",
    updatedBy: { name: "Neha Rao", initials: "NR" },
    isNew: true,
    uploaded: true,
  },
  {
    id: "doc-3",
    name: "First Floor Plan.pdf",
    size: "3.9 MB",
    discipline: "Drawings",
    status: "Approved",
    revision: "R03",
    updatedAt: "10 Aug 2026",
    updatedBy: { name: "Arjun Mehta", initials: "AM" },
    isNew: true,
    uploaded: true,
  },
  {
    id: "doc-4",
    name: "Site Progress Log 07.pdf",
    size: "6.8 MB",
    discipline: "Site Reports",
    status: "In Review",
    revision: "R07",
    updatedAt: "10 Aug 2026",
    updatedBy: { name: "Rahul Kumar", initials: "RK" },
    isNew: true,
    uploaded: true,
  },
  {
    id: "doc-5",
    name: "Concept Client Sign-off.pdf",
    size: "723 KB",
    discipline: "Approvals",
    status: "Approved",
    revision: "R01",
    updatedAt: "09 Aug 2026",
    updatedBy: { name: "Priya Nair", initials: "PN" },
    isNew: false,
    uploaded: true,
  },
  {
    id: "doc-6",
    name: "Electrical Layout.dwg",
    size: "9.0 MB",
    discipline: "Drawings",
    status: "In Review",
    revision: "R02",
    updatedAt: "09 Aug 2026",
    updatedBy: { name: "Neha Rao", initials: "NR" },
    isNew: false,
    uploaded: true,
  },
  {
    id: "doc-7",
    name: "Site Photo Set.zip",
    size: "17.6 MB",
    discipline: "Photos & Media",
    status: "In Review",
    revision: "R03",
    updatedAt: "09 Aug 2026",
    updatedBy: { name: "Rahul Kumar", initials: "RK" },
    isNew: false,
    uploaded: true,
  },
  {
    id: "doc-8",
    name: "Detailed BOQ.xlsx",
    size: "1.8 MB",
    discipline: "BOQ & Estimates",
    status: "Draft",
    revision: "R04",
    updatedAt: "09 Aug 2026",
    updatedBy: { name: "Arjun Mehta", initials: "AM" },
    isNew: false,
    uploaded: true,
  },
  {
    id: "doc-9",
    name: "Client Agreement.pdf",
    size: "2.1 MB",
    discipline: "Contracts",
    status: "Approved",
    revision: "R01",
    updatedAt: "08 Aug 2026",
    updatedBy: { name: "Priya Nair", initials: "PN" },
    isNew: false,
    uploaded: true,
  },
];

export interface EnquiryProjectDocumentsSectionProps {
  documents?: ProjectDocumentItem[];
  extraCount?: number;
  title?: string;
  onDownload?: (documentId: string) => void;
  onViewAll?: () => void;
}

function getFileIcon(doc: ProjectDocumentItem) {
  const ext = doc.name.split(".").pop()?.toUpperCase() || "DOC";
  switch (ext) {
    case "DWG":
      return <FileCode size={15} />;
    case "XLSX":
    case "CSV":
      return <FileSpreadsheet size={15} />;
    case "ZIP":
    case "RAR":
      return <Archive size={15} />;
    case "PDF":
    default:
      return <FileText size={15} />;
  }
}

function getFileIconStyleClass(doc: ProjectDocumentItem) {
  const ext = doc.name.split(".").pop()?.toUpperCase() || "DOC";
  if (!doc.uploaded) return styles.iconMissing;
  switch (ext) {
    case "DWG":
      return styles.iconDwg;
    case "XLSX":
    case "CSV":
      return styles.iconXlsx;
    case "ZIP":
    case "RAR":
      return styles.iconZip;
    case "PDF":
    default:
      return styles.iconPdf;
  }
}

function getStatusStyleClass(status?: string) {
  switch (status) {
    case "Approved":
      return styles.statusApproved;
    case "In Review":
      return styles.statusInReview;
    case "Draft":
      return styles.statusDraft;
    case "Missing":
    default:
      return styles.statusMissing;
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

      <div className={styles.tableCard}>
        <div className={styles.tableResponsiveContainer}>
          <table className={styles.docTable}>
            <thead>
              <tr>
                <th>FILE</th>
                <th>DISCIPLINE</th>
                <th>STATUS</th>
                <th>REVISION</th>
                <th>UPDATED</th>
                <th>UPDATED BY</th>
                <th className={styles.alignRight}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  {/* FILE Column */}
                  <td>
                    <div className={styles.fileCell}>
                      <div className={`${styles.fileIconWrap} ${getFileIconStyleClass(doc)}`}>
                        {getFileIcon(doc)}
                      </div>
                      <div className={styles.fileInfo}>
                        <div className={styles.fileNameRow}>
                          <span className={styles.fileName}>{doc.name}</span>
                          {doc.isNew && <span className={styles.newBadge}>New</span>}
                        </div>
                        <span className={styles.fileSize}>
                          {doc.uploaded ? doc.size || "Document" : "Missing File"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* DISCIPLINE Column */}
                  <td>
                    <span className={styles.disciplineText}>{doc.discipline || "Drawings"}</span>
                  </td>

                  {/* STATUS Column */}
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusStyleClass(doc.status)}`}>
                      {doc.status || (doc.uploaded ? "Approved" : "Missing")}
                    </span>
                  </td>

                  {/* REVISION Column */}
                  <td>
                    <span className={styles.revisionText}>{doc.revision || "R01"}</span>
                  </td>

                  {/* UPDATED Column */}
                  <td>
                    <span className={styles.updatedDate}>{doc.updatedAt || "Recent"}</span>
                  </td>

                  {/* UPDATED BY Column */}
                  <td>
                    <div className={styles.updatedByCell}>
                      <div className={styles.userAvatar}>
                        {doc.updatedBy?.initials || "AM"}
                      </div>
                      <span className={styles.userName}>{doc.updatedBy?.name || "Arjun Mehta"}</span>
                    </div>
                  </td>

                  {/* ACTIONS Column */}
                  <td className={styles.alignRight}>
                    <div className={styles.actionCell}>
                      {doc.uploaded ? (
                        <button
                          type="button"
                          className={styles.actionIconBtn}
                          onClick={() => onDownload?.(doc.id)}
                          title={`Download ${doc.name}`}
                          aria-label={`Download ${doc.name}`}
                        >
                          <Download size={13} />
                        </button>
                      ) : (
                        <AlertCircle size={13} className={styles.missingAlertIcon} />
                      )}
                      <button
                        type="button"
                        className={styles.actionIconBtn}
                        title="More options"
                        aria-label="More options"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
