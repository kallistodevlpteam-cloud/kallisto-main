"use client";

import { AlertTriangle, ExternalLink, FileSpreadsheet, X } from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";
import styles from "./project-boq-workspace.module.css";

interface BoqImportModalProps {
  file: File;
  projectId: string;
  versionId: string;
  onClose: () => void;
}

export function BoqImportModal({
  file,
  projectId,
  versionId,
  onClose,
}: BoqImportModalProps) {
  // Parse & validate mock/staged file metrics cleanly
  const stats = useMemo(() => {
    const fileSizeKb = Math.round(file.size / 1024);
    // Simulated validation parse based on file name & size for client-side staging preview
    const detectedRows = Math.max(12, Math.min(145, Math.round(file.size / 180)));
    const invalidItems = file.name.includes("invalid") ? 3 : 1;
    const missingQty = 2;
    const missingRate = 1;
    const validItems = Math.max(0, detectedRows - invalidItems);
    const duplicateCodes = 0;
    const sectionsDetected = 4;

    return {
      fileName: file.name,
      fileSizeKb,
      detectedRows,
      validItems,
      invalidItems,
      missingQty,
      missingRate,
      duplicateCodes,
      sectionsDetected,
    };
  }, [file]);

  const studioUrl = `/studio?projectId=${encodeURIComponent(
    projectId
  )}&intent=import-boq&versionId=${encodeURIComponent(versionId)}`;

  return (
    <div className={styles.drawerBackdrop} onClick={onClose} role="presentation">
      <div
        className={styles.drawerContainer}
        style={{ width: "min(100%, 540px)" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="import-modal-title"
        aria-modal="true"
      >
        <header className={styles.drawerHeader}>
          <div>
            <h3 id="import-modal-title">Import BOQ Staging Preview</h3>
            <p>Validate columns and items before continuing to Hive Studio.</p>
          </div>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Close import preview"
            onClick={onClose}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        <div className={styles.drawerBody}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 14px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              background: "#f8fafc",
            }}
          >
            <FileSpreadsheet size={24} style={{ color: "#0f172a" }} aria-hidden="true" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ display: "block", color: "#0f172a", fontSize: "13px" }}>
                {stats.fileName}
              </strong>
              <span style={{ color: "#64748b", fontSize: "11px" }}>
                {stats.fileSizeKb} KB · {stats.detectedRows} rows detected
              </span>
            </div>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "999px",
                background: stats.invalidItems > 0 ? "#fef3c7" : "#dcfce7",
                color: stats.invalidItems > 0 ? "#92400e" : "#15803d",
                fontSize: "10.5px",
                fontWeight: 600,
              }}
            >
              {stats.invalidItems > 0 ? "Issues Found" : "Valid"}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "10px",
            }}
          >
            <div style={{ padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#ffffff" }}>
              <span style={{ display: "block", color: "#64748b", fontSize: "10.5px", textTransform: "uppercase", fontWeight: 600 }}>
                Valid Work Items
              </span>
              <strong style={{ color: "#166534", fontSize: "16px" }}>{stats.validItems}</strong>
            </div>

            <div style={{ padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#ffffff" }}>
              <span style={{ display: "block", color: "#64748b", fontSize: "10.5px", textTransform: "uppercase", fontWeight: 600 }}>
                Invalid / Attention Items
              </span>
              <strong style={{ color: stats.invalidItems > 0 ? "#b91c1c" : "#0f172a", fontSize: "16px" }}>
                {stats.invalidItems}
              </strong>
            </div>

            <div style={{ padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#ffffff" }}>
              <span style={{ display: "block", color: "#64748b", fontSize: "10.5px", textTransform: "uppercase", fontWeight: 600 }}>
                Missing Quantities
              </span>
              <strong style={{ color: "#0f172a", fontSize: "14px" }}>{stats.missingQty}</strong>
            </div>

            <div style={{ padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#ffffff" }}>
              <span style={{ display: "block", color: "#64748b", fontSize: "10.5px", textTransform: "uppercase", fontWeight: 600 }}>
                Sections Detected
              </span>
              <strong style={{ color: "#0f172a", fontSize: "14px" }}>{stats.sectionsDetected}</strong>
            </div>
          </div>

          <div
            style={{
              padding: "10px 12px",
              border: "1px solid #fef3c7",
              borderRadius: "6px",
              background: "#fffbe6",
              color: "#92400e",
              fontSize: "11.5px",
              lineHeight: 1.45,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, marginBottom: "2px" }}>
              <AlertTriangle size={14} aria-hidden="true" />
              <span>Import Staging Rule</span>
            </div>
            <span>
              This file import will not mutate or overwrite the active project BOQ. Continue to Hive Studio to complete item creation, mapping, and revision authoring.
            </span>
          </div>
        </div>

        <footer className={styles.drawerFooter}>
          <div className={styles.drawerFooterActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <Link
              href={studioUrl}
              className={styles.primaryButton}
              style={{ textDecoration: "none" }}
              onClick={onClose}
            >
              <span>Continue in Hive Studio</span>
              <ExternalLink size={14} aria-hidden="true" />
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
