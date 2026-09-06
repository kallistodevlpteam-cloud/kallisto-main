"use client";

import { FileText, Eye, Download } from "lucide-react";
import type { PortfolioProject } from "@/features/portfolio/types/portfolio.types";
import styles from "./portfolio-project-overview.module.css";

interface PortfolioProjectDocumentsProps {
  project: PortfolioProject;
}

export function PortfolioProjectDocuments({
  project,
}: PortfolioProjectDocumentsProps) {
  const documents = project.documents && project.documents.length > 0
    ? project.documents
    : [
        {
          id: "doc-1",
          name: "Project Brief & Requirements Sign-off",
          fileType: "PDF",
          size: "2.4 MB",
          updatedDate: "Jan 2025",
          version: "v1.0",
          url: "#",
        },
        {
          id: "doc-2",
          name: "Architectural Drawings & 3D Massing",
          fileType: "PDF",
          size: "14.8 MB",
          updatedDate: "Mar 2025",
          version: "v2.1",
          url: "#",
        },
        {
          id: "doc-3",
          name: "Floor Plans & Zoning Diagrams",
          fileType: "PDF",
          size: "8.2 MB",
          updatedDate: "May 2025",
          version: "v2.0",
          url: "#",
        },
        {
          id: "doc-4",
          name: "Elevations & Sectional Details",
          fileType: "PDF",
          size: "11.5 MB",
          updatedDate: "May 2025",
          version: "v1.8",
          url: "#",
        },
        {
          id: "doc-5",
          name: "GFC Working Drawing Package",
          fileType: "PDF",
          size: "22.0 MB",
          updatedDate: "Jul 2025",
          version: "v3.0",
          url: "#",
        },
        {
          id: "doc-6",
          name: "Approved Bill of Quantities (BOQ)",
          fileType: "XLSX",
          size: "1.6 MB",
          updatedDate: "Aug 2025",
          version: "v2.4",
          url: "#",
        },
        {
          id: "doc-7",
          name: "Technical Specifications Document",
          fileType: "PDF",
          size: "4.1 MB",
          updatedDate: "Aug 2025",
          version: "v1.2",
          url: "#",
        },
        {
          id: "doc-8",
          name: "Final Handover & Completion Certificate",
          fileType: "PDF",
          size: "3.5 MB",
          updatedDate: "Jul 2026",
          version: "Final",
          url: "#",
        },
      ];

  const handleDownload = (docName: string) => {
    alert(`Downloading ${docName}...`);
  };

  const handleView = (docName: string) => {
    alert(`Opening preview for ${docName}...`);
  };

  return (
    <section className={styles.sectionBlock} aria-labelledby="documents-heading">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <h3 className={styles.sectionTitle} id="documents-heading">
            Project Documents
          </h3>
          <p className={styles.sectionSubtitle}>
            Authoritative drawings, contract specifications, and sign-off records
          </p>
        </div>
      </div>

      <div className={styles.documentsTable} role="table" aria-label="Project documents list">
        {documents.map((doc) => (
          <div key={doc.id} className={styles.documentRow} role="row">
            <div className={styles.documentNameCell} role="cell">
              <FileText size={16} color="#64748b" style={{ flexShrink: 0 }} />
              <span>{doc.name}</span>
            </div>

            <div className={styles.documentTextCell} role="cell">
              <span className={styles.docTypeBadge}>{doc.fileType}</span>
            </div>

            <div className={styles.documentTextCell} role="cell">
              <span>{doc.size}</span>
            </div>

            <div className={styles.documentTextCell} role="cell">
              <span>{doc.version}</span>
            </div>

            <div className={styles.documentActionCell} role="cell">
              <button
                type="button"
                className={styles.docBtn}
                onClick={() => handleView(doc.name)}
                aria-label={`View ${doc.name}`}
              >
                <Eye size={12} />
                <span>View</span>
              </button>

              <button
                type="button"
                className={styles.docBtn}
                onClick={() => handleDownload(doc.name)}
                aria-label={`Download ${doc.name}`}
              >
                <Download size={12} />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
