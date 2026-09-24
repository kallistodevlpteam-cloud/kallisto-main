"use client";

import React, { useState } from "react";
import { X, Download, FileText, Calendar, Check } from "lucide-react";
import styles from "./hands-attendance.module.css";

interface TimesheetExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: "csv" | "pdf", range: string) => void;
  totalRecords: number;
}

export function TimesheetExportModal({
  isOpen,
  onClose,
  onExport,
  totalRecords,
}: TimesheetExportModalProps) {
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv");
  const [dateRange, setDateRange] = useState<string>("today");
  const [includeOvertime, setIncludeOvertime] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleConfirmExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      onExport(exportFormat, dateRange);
      setIsExporting(false);
      onClose();
    }, 800);
  };

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-label="Export Attendance Timesheet"
    >
      <div className={styles.exportModalCard}>
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <h3 className={styles.modalTitle}>Export Timesheet & Attendance Logs</h3>
            <p className={styles.modalSubtitle}>
              Download verified biometric logs, supervisor sign-offs, and overtime reports.
            </p>
          </div>

          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Format Selector */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Export File Format</label>
            <div className={styles.formatSelectRow}>
              <button
                type="button"
                className={`${styles.formatOptionBtn} ${
                  exportFormat === "csv" ? styles.formatOptionSelected : ""
                }`}
                onClick={() => setExportFormat("csv")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FileText size={18} color={exportFormat === "csv" ? "#0284c7" : "#64748b"} />
                  <div style={{ textAlign: "left" }}>
                    <div className={styles.formatName}>CSV / Excel Spreadsheet</div>
                    <div className={styles.formatDesc}>Raw biometric data & hours for payroll software</div>
                  </div>
                </div>
                {exportFormat === "csv" && <Check size={16} color="#0284c7" />}
              </button>

              <button
                type="button"
                className={`${styles.formatOptionBtn} ${
                  exportFormat === "pdf" ? styles.formatOptionSelected : ""
                }`}
                onClick={() => setExportFormat("pdf")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Download size={18} color={exportFormat === "pdf" ? "#0284c7" : "#64748b"} />
                  <div style={{ textAlign: "left" }}>
                    <div className={styles.formatName}>PDF Official Audit Report</div>
                    <div className={styles.formatDesc}>Formatted document with supervisor sign-offs</div>
                  </div>
                </div>
                {exportFormat === "pdf" && <Check size={16} color="#0284c7" />}
              </button>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Time Period</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={styles.formSelect}
            >
              <option value="today">Today (Sep 21, 2026)</option>
              <option value="yesterday">Yesterday (Sep 20, 2026)</option>
              <option value="this_week">Current Week (Sep 15 – Sep 21)</option>
              <option value="this_month">Current Month (September 2026)</option>
            </select>
          </div>

          {/* Options */}
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabelOption}>
              <input
                type="checkbox"
                checked={includeOvertime}
                onChange={(e) => setIncludeOvertime(e.target.checked)}
              />
              <span>Include Overtime Hours & Compliance Audit Trail ({totalRecords} records)</span>
            </label>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.modalCancelBtn}
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className={styles.confirmExportBtn}
            onClick={handleConfirmExport}
            disabled={isExporting}
          >
            <Download size={14} />
            <span>{isExporting ? "Generating Export..." : `Download ${exportFormat.toUpperCase()}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
