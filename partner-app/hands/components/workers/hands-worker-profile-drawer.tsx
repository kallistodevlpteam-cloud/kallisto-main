"use client";

import React from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  MapPin,
  Phone,
  Calendar,
  Sparkles,
} from "lucide-react";
import { WorkerProfile, WorkerAvailability } from "../../types/worker-domain";
import styles from "./hands-workers.module.css";

interface HandsWorkerProfileDrawerProps {
  worker: WorkerProfile;
  isOpen: boolean;
  onClose: () => void;
  onAssignToWork: (worker: WorkerProfile) => void;
  onAskOdinForWorker: (worker: WorkerProfile) => void;
}

export function HandsWorkerProfileDrawer({
  worker,
  isOpen,
  onClose,
  onAssignToWork,
  onAskOdinForWorker,
}: HandsWorkerProfileDrawerProps) {
  if (!isOpen) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getAvailabilityClass = (status: WorkerAvailability) => {
    switch (status) {
      case "Available":
        return styles.statusAvailable;
      case "Assigned":
        return styles.statusAssigned;
      case "Unavailable":
        return styles.statusUnavailable;
      default:
        return styles.statusUnavailable;
    }
  };

  return (
    <div
      className={styles.drawerOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Worker Profile: ${worker.name}`}
    >
      <div
        className={styles.profileDrawer}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.drawerHeader}>
          <div className={styles.profileHero}>
            <div className={styles.profileHeroAvatar}>
              {getInitials(worker.name)}
            </div>
            <div className={styles.profileHeroMeta}>
              <h2 className={styles.profileHeroName}>{worker.name}</h2>
              <span className={styles.profileHeroSub}>
                {worker.trade} · {worker.experienceYears} Years Experience
              </span>
              <div style={{ marginTop: "4px" }}>
                <span
                  className={`${styles.statusPill} ${getAvailabilityClass(
                    worker.availability
                  )}`}
                >
                  <span className={styles.statusDot} />
                  {worker.availability === "Available"
                    ? "Available Today"
                    : worker.availability}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className={styles.drawerCloseBtn}
            onClick={onClose}
            aria-label="Close profile modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.drawerBody}>
          {/* Quick Contact & Base Details */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              fontSize: "12px",
              color: "#475569",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Phone size={14} style={{ color: "#64748b" }} />
              <span>{worker.phone}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <MapPin size={14} style={{ color: "#64748b" }} />
              <span>{worker.location}</span>
            </div>
            {worker.dailyRate && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>
                  Daily Base Rate:
                </span>
                <span>₹{worker.dailyRate} / day</span>
              </div>
            )}
          </div>

          <div className={styles.divider} />

          {/* SKILLS */}
          <div>
            <div className={styles.sectionHeader}>SKILLS</div>
            <div className={styles.skillsPillList}>
              {worker.skills.map((skill) => (
                <span key={skill} className={styles.skillPill}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.divider} />

          {/* VERIFICATION */}
          <div>
            <div className={styles.sectionHeader}>VERIFICATION</div>
            <div className={styles.verificationChecklist}>
              <div className={styles.verificationItem}>
                {worker.verificationDetails.identityVerified ? (
                  <CheckCircle2 size={15} style={{ color: "#059669", flexShrink: 0 }} />
                ) : (
                  <AlertCircle size={15} style={{ color: "#d97706", flexShrink: 0 }} />
                )}
                <span>
                  Identity Verified (
                  {worker.verificationDetails.kycDocumentType || "Aadhaar Verified"}
                  )
                </span>
              </div>
              <div className={styles.verificationItem}>
                {worker.verificationDetails.phoneVerified ? (
                  <CheckCircle2 size={15} style={{ color: "#059669", flexShrink: 0 }} />
                ) : (
                  <AlertCircle size={15} style={{ color: "#d97706", flexShrink: 0 }} />
                )}
                <span>Phone Verified ({worker.phone})</span>
              </div>
              <div className={styles.verificationItem}>
                {worker.verificationDetails.tradeCertified ? (
                  <CheckCircle2 size={15} style={{ color: "#059669", flexShrink: 0 }} />
                ) : (
                  <AlertCircle size={15} style={{ color: "#d97706", flexShrink: 0 }} />
                )}
                <span>Trade Certification & Skill Assessment</span>
              </div>
            </div>
            {worker.needsAttentionReason && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "8px 12px",
                  backgroundColor: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#92400e",
                }}
              >
                ⚠️ <strong>Attention:</strong> {worker.needsAttentionReason}
              </div>
            )}
          </div>

          <div className={styles.divider} />

          {/* CURRENT STATUS */}
          <div>
            <div className={styles.sectionHeader}>CURRENT STATUS</div>
            {worker.currentAssignment ? (
              <div className={styles.statusCard}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Briefcase size={14} style={{ color: "#0f172a" }} />
                  <span className={styles.statusCardTitle}>
                    {worker.currentAssignment.projectName}
                  </span>
                </div>
                <span className={styles.statusCardDetail}>
                  Role: {worker.currentAssignment.role} · Site:{" "}
                  {worker.currentAssignment.location}
                </span>
                <span className={styles.statusCardDetail}>
                  Active period: {worker.currentAssignment.startDate} –{" "}
                  {worker.currentAssignment.endDate || "Ongoing"}
                </span>
              </div>
            ) : (
              <div className={styles.statusCard}>
                <span className={styles.statusCardTitle} style={{ color: "#059669" }}>
                  ● Available for assignment
                </span>
                <span className={styles.statusCardDetail}>
                  This worker is currently not allocated to any active project and is available for immediate dispatch.
                </span>
              </div>
            )}
          </div>

          <div className={styles.divider} />

          {/* RECENT WORK */}
          <div>
            <div className={styles.sectionHeader}>RECENT WORK</div>
            {worker.recentWork && worker.recentWork.length > 0 ? (
              <div className={styles.historyList}>
                {worker.recentWork.map((hist) => (
                  <div key={hist.id} className={styles.historyItem}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                      }}
                    >
                      <span className={styles.historyProject}>
                        {hist.projectName}
                      </span>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>
                        {hist.role}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        marginTop: "2px",
                      }}
                    >
                      <Calendar size={12} style={{ color: "#94a3b8" }} />
                      <span className={styles.historyDates}>
                        {hist.dateRange}
                      </span>
                    </div>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                      {hist.location}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                No prior Kallisto deployments recorded.
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className={styles.drawerFooter}>
          <button
            type="button"
            className={styles.odinToggleBtn}
            onClick={() => onAskOdinForWorker(worker)}
            title="Ask Odin about this worker"
          >
            <Sparkles size={14} />
            <span>Odin Match</span>
          </button>
          <button
            type="button"
            className={styles.primaryActionBtn}
            onClick={() => onAssignToWork(worker)}
          >
            <Briefcase size={15} />
            <span>
              {worker.availability === "Assigned"
                ? "Manage Assignment"
                : "Assign to Work"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
