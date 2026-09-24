"use client";

import React from "react";
import { X, PhoneCall } from "lucide-react";
import { AttendanceRecord } from "../../types/attendance-domain";
import styles from "./hands-attendance.module.css";

interface AttendanceDetailModalProps {
  record: AttendanceRecord | null;
  onClose: () => void;
  onApproveOvertime?: (id: string) => void;
  onFlagDiscrepancy?: (id: string) => void;
}

export function AttendanceDetailModal({
  record,
  onClose,
  onApproveOvertime,
  onFlagDiscrepancy,
}: AttendanceDetailModalProps) {
  if (!record) return null;

  const initials = record.workerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-label={`Biometric Log for ${record.workerName}`}
      onClick={onClose}
    >
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className={styles.modalBadge}>Biometric Log</span>
              <span className={styles.modalRefId}>{record.id}</span>
            </div>
            <h3 className={styles.modalTitle}>{record.workerName}</h3>
            <p className={styles.modalSubtitle}>
              {record.trade} ({record.level}) · {record.siteName}
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

        {/* Modal Body */}
        <div className={styles.modalBody}>
          {/* Worker & Status Overview Banner */}
          <div className={styles.workerBannerCard}>
            <div className={styles.workerAvatarContainer}>
              {record.avatarUrl ? (
                <img
                  src={record.avatarUrl}
                  alt={record.workerName}
                  className={styles.workerAvatarImg}
                />
              ) : (
                <div className={styles.workerInitialsAvatar}>{initials}</div>
              )}
            </div>

            <div className={styles.workerMetaDetails}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span className={styles.workerNameText}>{record.workerName}</span>
                <span className={styles.tradeBadgePill}>{record.trade} · {record.level}</span>
                <span
                  className={`${styles.statusBadgePill} ${
                    styles[`statusPill_${record.status.replace(/\s+/g, "_")}`]
                  }`}
                >
                  ● {record.status}
                </span>
              </div>

              <div className={styles.workerSubmetaRow}>
                <span>ID: {record.workerId}</span>
                <span>•</span>
                <span>Phone: {record.phone}</span>
                <span>•</span>
                <span>Date: {record.shiftDate}</span>
              </div>
            </div>
          </div>

          {/* 3 Key Metric Tiles */}
          <div className={styles.modalMetricGrid}>
            <div className={styles.metricTile}>
              <span className={styles.tileLabel}>Check-In Time</span>
              <span className={styles.tileValue} style={{ color: "#059669" }}>
                {record.checkInTime}
              </span>
              <span className={styles.tileSub}>Target 08:00 AM</span>
            </div>

            <div className={styles.metricTile}>
              <span className={styles.tileLabel}>Check-Out Time</span>
              <span className={styles.tileValue}>
                {record.checkOutTime || "Shift Active"}
              </span>
              <span className={styles.tileSub}>Target 05:00 PM</span>
            </div>

            <div className={styles.metricTile}>
              <span className={styles.tileLabel}>Hours Logged</span>
              <span className={styles.tileValue}>
                {record.hoursLogged > 0 ? `${record.hoursLogged} hrs` : "0 hrs"}
              </span>
              <span className={styles.tileSub}>
                {record.overtimeHours > 0
                  ? `+${record.overtimeHours} hrs Overtime`
                  : "Standard Shift"}
              </span>
            </div>
          </div>

          {/* Site & Verification Details */}
          <div className={styles.detailsSectionCard}>
            <h4 className={styles.sectionHeading}>
              <span>Site &amp; Verification Details</span>
            </h4>

            <div className={styles.telemetryGrid}>
              <div className={styles.telemetryRow}>
                <span className={styles.telemetryKey}>Site Name:</span>
                <span className={styles.telemetryVal}>{record.siteName}</span>
              </div>

              <div className={styles.telemetryRow}>
                <span className={styles.telemetryKey}>Location:</span>
                <span className={styles.telemetryVal}>{record.location}</span>
              </div>

              <div className={styles.telemetryRow}>
                <span className={styles.telemetryKey}>Verification Method:</span>
                <span className={styles.telemetryVal}>
                  <span className={styles.methodBadge}>
                    {record.verificationMethod.replace(/ Geotag|\s*\+\s*GPS/gi, "")}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Supervisor Information & Sign-Off */}
          <div className={styles.detailsSectionCard}>
            <h4 className={styles.sectionHeading}>
              <span>Site Supervisor Sign-Off</span>
            </h4>

            <div className={styles.supervisorRow}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span className={styles.supervisorName}>{record.supervisorName}</span>
                <span className={styles.supervisorRole}>Site Lead · {record.supervisorPhone}</span>
              </div>

              <a
                href={`tel:${record.supervisorPhone}`}
                className={styles.callSupervisorBtn}
              >
                <PhoneCall size={13} />
                <span>Call Supervisor</span>
              </a>
            </div>

            {record.notes && (
              <div className={styles.supervisorNotesBox}>
                <p><strong>Notes:</strong> {record.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
