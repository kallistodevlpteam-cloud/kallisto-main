"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  ExternalLink,
  AlertTriangle,
  UserX,
  Search,
  CheckCircle2,
  Calendar,
  Users,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import {
  TeamDuotoneIcon,
  CalendarDuotoneIcon,
  LocationDuotoneIcon,
  StudioDuotoneIcon,
  ShieldDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { LabourRequest } from "../../types/request-domain";
import { calculateRequestMatch } from "../../mock/requests-mock-data";
import { INITIAL_WORKERS } from "../workers/../../mock/workers-mock-data";
import styles from "./hands-requests.module.css";

function MetricClockDuotoneIcon({
  size = 14,
  style = {},
}: {
  size?: number;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
    >
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.28" />
      <path
        d="M12 7V12L15.5 14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

interface HandsRequestDetailDrawerProps {
  request: LabourRequest;
  isOpen: boolean;
  onClose: () => void;
  onAcceptRequest: (req: LabourRequest) => void;
  onDeclineRequest: (req: LabourRequest) => void;
  onAskOdinForRequest?: (req: LabourRequest) => void;
}

export function HandsRequestDetailDrawer({
  request,
  isOpen,
  onClose,
  onAcceptRequest,
  onDeclineRequest,
  onAskOdinForRequest,
}: HandsRequestDetailDrawerProps) {
  const router = useRouter();
  const [isAcceptedSuccess, setIsAcceptedSuccess] = useState(false);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [declineReason, setDeclineReason] = useState("Bench workforce fully committed");

  if (!isOpen) return null;

  const match = calculateRequestMatch(request);
  const totalWorkers = request.requirements.reduce((acc, r) => acc + r.requiredCount, 0);

  // Find candidate available workers for this request
  const candidateWorkers = request.requirements.flatMap((req) =>
    (req.matchingWorkerIds || []).map((id) => {
      const existing = INITIAL_WORKERS.find((w) => w.id === id);
      if (existing && existing.trade === req.trade) {
        return existing;
      }
      return {
        id,
        name: existing ? existing.name : `Candidate ${id.split("-").pop()}`,
        trade: req.trade,
        level: existing?.level || "Skilled",
        experienceYears: existing?.experienceYears || 5,
        availability: "Available",
        dailyRate: existing?.dailyRate || 850,
      } as any;
    })
  );

  const handleConfirmAccept = () => {
    setShowAcceptConfirm(false);
    setIsAcceptedSuccess(true);
    onAcceptRequest(request);
  };

  const handleConfirmDecline = () => {
    setShowDeclineConfirm(false);
    onDeclineRequest(request);
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="detail-title">
      <div className={styles.detailCardModal}>
        {/* Header */}
        <div className={styles.detailModalHeader}>
          <div className={styles.detailModalHeaderLeft}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span className={styles.detailModalId}>Request {request.id}</span>
              <button
                type="button"
                onClick={() => router.push("/partner/hands/profile")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  border: "none",
                  background: "transparent",
                  color: "#2563eb",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <span>View Profile</span>
                <ExternalLink size={12} />
              </button>
            </div>
            <h2 id="detail-title" className={styles.detailModalTitle}>
              {request.projectName}
            </h2>
            <div className={styles.detailModalLocation}>
              <LocationDuotoneIcon size={14} style={{ color: "#2563eb" }} />
              <span>{request.location}</span>
            </div>
          </div>

          <button
            type="button"
            className={styles.detailCloseBtn}
            onClick={() => {
              setIsAcceptedSuccess(false);
              setShowAcceptConfirm(false);
              setShowDeclineConfirm(false);
              onClose();
            }}
            aria-label="Close request details"
          >
            <X size={15} />
          </button>
        </div>

        {/* Accepted Success Screen */}
        {isAcceptedSuccess ? (
          <div className={styles.acceptedSuccessBody}>
            <div className={styles.successIconBox}>
              <CheckCircle2 size={36} color="#059669" />
            </div>

            <h3 className={styles.successTitle}>Request Accepted & Scheduled!</h3>
            <p className={styles.successSubtitle}>
              <strong>{request.projectName}</strong> has been added to your{" "}
              <strong>Deployment Calendar</strong> ({request.startDate} · {request.estimatedDuration}) and queued for crew assignment.
            </p>

            <div className={styles.successActionsGrid}>
              <button
                type="button"
                className={styles.successActionBtn}
                onClick={() => {
                  onClose();
                  router.push("/partner/hands/assignments");
                }}
              >
                <Users size={16} color="#2563eb" />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>Assign Crew</div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>Allocate workers in Assignments page</div>
                </div>
                <ArrowRight size={14} style={{ marginLeft: "auto", color: "#94a3b8" }} />
              </button>

              <button
                type="button"
                className={styles.successActionBtn}
                onClick={() => {
                  onClose();
                  router.push("/partner/hands/workforce");
                }}
              >
                <Calendar size={16} color="#059669" />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>View in Calendar</div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>See deployment timeline & shifts</div>
                </div>
                <ArrowRight size={14} style={{ marginLeft: "auto", color: "#94a3b8" }} />
              </button>
            </div>

            <button
              type="button"
              className={styles.doneBtn}
              onClick={() => {
                setIsAcceptedSuccess(false);
                onClose();
              }}
            >
              Done (View Accepted Demands)
            </button>
          </div>
        ) : (
          /* Main Drawer Body */
          <div className={styles.detailModalBody}>
            {/* 1. Project Brief & Scope Summary */}
            <div className={styles.detailSection}>
              <h4 className={styles.detailSectionTitle}>Project Brief & Scope</h4>
              <div className={styles.projectBriefCard}>
                <div className={styles.projectBriefHeader}>
                  <div className={styles.projectPhaseBadge}>
                    <span className={styles.activePhaseDot} />
                    <span>Construction Stage · Superstructure Phase</span>
                  </div>
                  <span className={styles.clientTag}>{request.clientName}</span>
                </div>

                {request.notes && (
                  <p className={styles.projectBriefNotes}>{request.notes}</p>
                )}

                {request.scopeOfWork && request.scopeOfWork.length > 0 && (
                  <div className={styles.scopeListGrid}>
                    {request.scopeOfWork.map((scope, idx) => (
                      <div key={idx} className={styles.scopeItem}>
                        <span className={styles.scopeCheckDot}>✓</span>
                        <span>{scope}</span>
                      </div>
                    ))}
                  </div>
                )}

                {request.contactPerson && (
                  <div className={styles.siteSupervisorRow}>
                    <span className={styles.supervisorLabel}>Site In-Charge:</span>
                    <span className={styles.supervisorName}>
                      {request.contactPerson.name} ({request.contactPerson.role})
                    </span>
                    <span className={styles.supervisorPhone}>{request.contactPerson.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Workforce Required */}
            <div className={styles.detailSection}>
              <h4 className={styles.detailSectionTitle}>Workforce Required</h4>
              <div className={styles.requirementsGrid}>
                {request.requirements.map((req) => (
                  <div key={req.trade} className={styles.reqBox}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <TeamDuotoneIcon size={16} style={{ color: "#2563eb", flexShrink: 0 }} />
                      <span className={styles.reqBoxTrade}>{req.trade}s</span>
                    </div>
                    <span className={styles.reqBoxCount}>{req.requiredCount} Workers Required</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Work Details */}
            <div className={styles.detailSection}>
              <h4 className={styles.detailSectionTitle}>Work Details</h4>
              <div className={styles.workDetailsGrid}>
                <div className={styles.workDetailBox}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <CalendarDuotoneIcon size={13} style={{ color: "#64748b" }} />
                    <span className={styles.workDetailLabel}>Start Date</span>
                  </div>
                  <span className={styles.workDetailValue}>{request.startDate}</span>
                </div>

                <div className={styles.workDetailBox}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <MetricClockDuotoneIcon size={13} style={{ color: "#64748b" }} />
                    <span className={styles.workDetailLabel}>Duration</span>
                  </div>
                  <span className={styles.workDetailValue}>{request.estimatedDuration}</span>
                </div>

                <div className={styles.workDetailBox}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <MetricClockDuotoneIcon size={13} style={{ color: "#64748b" }} />
                    <span className={styles.workDetailLabel}>Working Hours</span>
                  </div>
                  <span className={styles.workDetailValue}>{request.workingHours}</span>
                </div>
              </div>
            </div>

            {/* 4. Location */}
            <div className={styles.detailSection}>
              <h4 className={styles.detailSectionTitle}>Location</h4>
              <div className={styles.locationDetailBox}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                  <LocationDuotoneIcon size={18} style={{ color: "#2563eb", flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                      {request.projectName}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {request.locationDetails?.address || request.location}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.viewLocationBtn}
                  onClick={() => alert(`Opening map location: ${request.locationDetails?.address || request.location}`)}
                >
                  <span>View Location</span>
                  <ExternalLink size={11} />
                </button>
              </div>
            </div>

            {/* 5. Workforce Match Intelligence */}
            <div className={styles.detailSection}>
              <h4 className={styles.detailSectionTitle}>Workforce Match Intelligence</h4>
              <div className={styles.matchBreakdownCard}>
                <div className={styles.matchBreakdownHeader}>
                  <span className={styles.matchBreakdownTitle}>Bench Availability vs Demand</span>
                  <span
                    className={styles.matchBreakdownPill}
                    style={{
                      backgroundColor:
                        match.matchState === "full"
                          ? "#ecfdf5"
                          : match.matchState === "partial"
                          ? "#fffbeb"
                          : "#fef2f2",
                      color:
                        match.matchState === "full"
                          ? "#047857"
                          : match.matchState === "partial"
                          ? "#b45309"
                          : "#dc2626",
                    }}
                  >
                    {match.matchState === "full"
                      ? "✓ Full Match"
                      : match.matchState === "partial"
                      ? "◐ Partial Match"
                      : "✕ No Match"}
                  </span>
                </div>

                {request.requirements.map((req) => (
                  <div key={req.trade} className={styles.matchRow}>
                    <span>{req.trade}s</span>
                    <span style={{ fontWeight: 650 }}>
                      {req.availableCount} / {req.requiredCount} Available
                    </span>
                  </div>
                ))}

                <div className={`${styles.matchRow} ${styles.matchTotalRow}`}>
                  <span>Overall Workforce Match</span>
                  <span>{match.totalAvailable} / {match.totalRequired} Workers ({match.matchPercentage}%)</span>
                </div>

                {match.shortages.length > 0 && (
                  <div className={styles.shortageWarning}>
                    <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                    <span>
                      Short by {match.shortages.map((s) => `${s.shortBy} ${s.trade}s`).join(", ")}. Additional recruitment or bench redeployment required.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 6. Candidate Available Workers Ready for Deployment */}
            {candidateWorkers.length > 0 && (
              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}>Matching Available Candidates ({candidateWorkers.length})</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {candidateWorkers.map((worker) => (
                    <div key={worker.id} className={styles.candidateWorkerRow}>
                      <div className={styles.candidateWorkerInfo}>
                        <div className={styles.candidateAvatar}>
                          {worker.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "12.5px" }}>{worker.name}</div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            {worker.trade} ({worker.level}) · {worker.experienceYears} Yrs Exp · ₹{worker.dailyRate}/day
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 650, color: request.status === "new" ? "#059669" : "#475569", padding: "2px 8px", backgroundColor: request.status === "new" ? "#ecfdf5" : "#f1f5f9", borderRadius: "9999px" }}>
                        {request.status === "new" ? "Ready for assignment" : request.status === "accepted" ? "Assigned" : "Unassigned"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        {!isAcceptedSuccess && (
          <div className={styles.detailModalFooter}>
            {request.status !== "closed" && request.status !== "accepted" && (
              <button
                type="button"
                className={styles.declineSecondaryBtn}
                onClick={() => setShowDeclineConfirm(true)}
              >
                <UserX size={14} />
                <span>Decline</span>
              </button>
            )}

            {onAskOdinForRequest && (
              <button
                type="button"
                className={styles.reviewSecondaryBtn}
                onClick={() => onAskOdinForRequest(request)}
              >
                <Search size={13} />
                <span>Analyse with Odin</span>
              </button>
            )}

            {request.status !== "accepted" && request.status !== "closed" && (
              <button
                type="button"
                className={styles.acceptPrimaryBtn}
                onClick={() => setShowAcceptConfirm(true)}
              >
                <StudioDuotoneIcon size={14} />
                <span>Accept Request</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Pop-up Card: Accept Request */}
      {showAcceptConfirm && (
        <div className={styles.confirmBackdrop}>
          <div className={styles.confirmCardModal}>
            <div className={styles.confirmHeader}>
              <div className={styles.confirmIconBox} style={{ backgroundColor: "#ecfdf5", color: "#059669" }}>
                <ShieldDuotoneIcon size={20} />
              </div>
              <div>
                <h3 className={styles.confirmTitle}>Accept Workforce Request?</h3>
                <p className={styles.confirmSubtitle}>
                  You are confirming deployment for <strong>{request.projectName}</strong>.
                </p>
              </div>
            </div>

            <div className={styles.confirmDetailsBox}>
              <div className={styles.confirmDetailItem}>
                <span className={styles.confirmDetailLabel}>Workforce Demand:</span>
                <span className={styles.confirmDetailVal}>{totalWorkers} Workers ({request.requirements.map((r) => `${r.requiredCount} ${r.trade}s`).join(", ")})</span>
              </div>
              <div className={styles.confirmDetailItem}>
                <span className={styles.confirmDetailLabel}>Timeline:</span>
                <span className={styles.confirmDetailVal}>{request.startDate} · {request.estimatedDuration}</span>
              </div>
              <div className={styles.confirmDetailItem}>
                <span className={styles.confirmDetailLabel}>Site Location:</span>
                <span className={styles.confirmDetailVal}>{request.location}</span>
              </div>
            </div>

            <div className={styles.confirmActionsRow}>
              <button
                type="button"
                className={styles.confirmCancelBtn}
                onClick={() => setShowAcceptConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmAcceptBtn}
                onClick={handleConfirmAccept}
              >
                <StudioDuotoneIcon size={14} />
                <span>Confirm & Accept</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Pop-up Card: Decline Request */}
      {showDeclineConfirm && (
        <div className={styles.confirmBackdrop}>
          <div className={styles.confirmCardModal}>
            <div className={styles.confirmHeader}>
              <div className={styles.confirmIconBox} style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}>
                <UserX size={20} />
              </div>
              <div>
                <h3 className={styles.confirmTitle}>Decline Request?</h3>
                <p className={styles.confirmSubtitle}>
                  This will close the requisition for <strong>{request.projectName}</strong> and update site management.
                </p>
              </div>
            </div>

            <div className={styles.declineReasonSection}>
              <label className={styles.declineReasonLabel}>Reason for Declining:</label>
              <div className={styles.declineReasonsList}>
                {[
                  "Bench workforce fully committed",
                  "Timeline clash with existing projects",
                  "Site location outside operational radius",
                  "Trade rates or requirements mismatch",
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    className={`${styles.declineReasonPill} ${declineReason === reason ? styles.declineReasonPillActive : ""}`}
                    onClick={() => setDeclineReason(reason)}
                  >
                    <span>{reason}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.confirmActionsRow}>
              <button
                type="button"
                className={styles.confirmCancelBtn}
                onClick={() => setShowDeclineConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmDeclineBtn}
                onClick={handleConfirmDecline}
              >
                <UserX size={14} />
                <span>Confirm Decline</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
