"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  FileText,
  CheckCircle2,
  RotateCcw,
  Pencil,
  Send,
  Download,
  AlertCircle,
  Sparkles,
  MessageSquare,
  Check,
  X,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { EnquiryRecord } from "@/features/enquiries/types/enquiry.types";
import { getClientEnquiryStatus } from "@/features/enquiries/components/enquiry-table-row";
import { recordAcceptedProject, notifyCreatedProjectsChanged } from "@/features/client/services/accepted-projects-store";
import styles from "./client-enquiry-actions-panel.module.css";

export interface ClientEnquiryActionsPanelProps {
  enquiry: EnquiryRecord;
  onOpenProposal: () => void;
  onDownloadProposal: () => void;
}

export function ClientEnquiryActionsPanel({
  enquiry,
  onOpenProposal,
  onDownloadProposal,
}: ClientEnquiryActionsPanelProps) {
  const router = useRouter();
  const clientStatus = getClientEnquiryStatus(enquiry);
  const [localStatus, setLocalStatus] = useState<string>(clientStatus.label);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [revisionComments, setRevisionComments] = useState("");
  const [editNotes, setEditNotes] = useState(enquiry.requirementSummary || "");
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const isCedarValley = enquiry.id?.includes("9") || enquiry.title?.toLowerCase().includes("cedar valley");

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handleAcceptProposal = () => {
    recordAcceptedProject({
      id: enquiry.id,
      title: enquiry.title,
      clientName: enquiry.clientName,
      location: enquiry.location || "",
      budget: enquiry.budget || "",
      projectType: enquiry.projectType || enquiry.source || "",
      acceptedAt: new Date().toISOString(),
      thumbnailUrl: enquiry.thumbnailUrl,
      providerName: "Kallisto Studio Architects",
    });
    notifyCreatedProjectsChanged();
    setLocalStatus("Proposal Accepted");
    setShowAcceptModal(false);
    router.push("/client/projects");
  };

  const handleSubmitRevision = () => {
    if (!revisionComments.trim()) {
      alert("Please enter revision details or adjustments you need from the provider.");
      return;
    }
    setLocalStatus("Revision Requested");
    setShowRevisionModal(false);
    showToast("Revision request sent to service provider. They will prepare an updated draft.");
  };

  const handleSubmitEdit = () => {
    setShowEditModal(false);
    showToast("Enquiry updated and resent to service provider.");
  };

  // Case: Status = "Declined"
  if (localStatus === "Declined" || enquiry.clientStatus === "Declined") {
    return (
      <div className={styles.clientPanelContainer}>
        <div className={styles.clientCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerTitleRow}>
              <div className={styles.headerIconWrap} style={{ background: "#fff1f2", color: "#e11d48" }}>
                <XCircle size={16} />
              </div>
              <h4 className={styles.cardTitle}>Enquiry Status</h4>
            </div>
            <span className={styles.statusPill} style={{ background: "#fff1f2", color: "#e11d48", border: "1px solid #fecdd3" }}>
              Declined
            </span>
          </div>

          <div className={styles.noticeBox} style={{ background: "#fff1f2", borderColor: "#fecdd3", color: "#9f1239" }}>
            <strong style={{ color: "#881337" }}>Specialist unable to accept enquiry</strong>
            <span style={{ color: "#9f1239" }}>
              The service provider was unable to take on this project due to current studio capacity.
            </span>
            <div style={{ marginTop: "8px", padding: "8px 10px", background: "#ffffff", borderRadius: "6px", fontSize: "12px", border: "1px solid #fecdd3", lineHeight: 1.4 }}>
              <strong style={{ color: "#881337" }}>Reason: </strong>
              <span style={{ color: "#475569" }}>{enquiry.declineReason || "Current studio team capacity is fully booked for Q3/Q4."}</span>
            </div>
          </div>

          <div className={styles.actionBtnStack}>
            <Link
              href="/client/enquiries"
              className={styles.secondaryActionBtn}
              style={{ textDecoration: "none", display: "flex", justifyContent: "center" }}
            >
              Back to Enquiries
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case: Status = "Expired"
  if (localStatus === "Expired" || enquiry.clientStatus === "Expired") {
    return (
      <div className={styles.clientPanelContainer}>
        <div className={styles.clientCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerTitleRow}>
              <div className={`${styles.headerIconWrap} ${styles.iconBlue}`}>
                <Clock size={16} />
              </div>
              <h4 className={styles.cardTitle}>Enquiry Status</h4>
            </div>
            <span className={`${styles.statusPill} ${styles.statusPillSlate}`}>Expired</span>
          </div>

          <div className={`${styles.noticeBox} ${styles.noticeBoxNeutral}`}>
            <strong style={{ color: "#0f172a" }}>Response window expired</strong>
            <span>
              The service provider did not respond within the 14-day SLA response period. This enquiry has expired. You can re-send this enquiry or connect with another specialist.
            </span>
          </div>

          <div className={styles.actionBtnStack}>
            <Link
              href="/client/enquiries"
              className={styles.secondaryActionBtn}
              style={{ textDecoration: "none", display: "flex", justifyContent: "center" }}
            >
              Back to Enquiries
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case: Status = "Rejected"
  if (localStatus === "Rejected" || enquiry.clientStatus === "Rejected" || enquiry.stage === "rejected") {
    return (
      <div className={styles.clientPanelContainer}>
        <div className={styles.clientCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerTitleRow}>
              <div className={styles.headerIconWrap} style={{ background: "#fef2f2", color: "#b91c1c" }}>
                <XCircle size={16} />
              </div>
              <h4 className={styles.cardTitle}>Enquiry Status</h4>
            </div>
            <span className={styles.statusPill} style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fee2e2" }}>
              Rejected
            </span>
          </div>

          <div className={styles.noticeBox} style={{ background: "#fef2f2", borderColor: "#fee2e2", color: "#991b1b" }}>
            <strong style={{ color: "#991b1b" }}>Proposal Rejected by Client</strong>
            <span>
              You rejected the proposal submitted by the service provider for this project. This record has been moved to History.
            </span>
          </div>

          <div className={styles.actionBtnStack}>
            <Link
              href="/client/enquiries?tab=history"
              className={styles.secondaryActionBtn}
              style={{ textDecoration: "none", display: "flex", justifyContent: "center" }}
            >
              View History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 1: Status = "Sent"
  if (localStatus === "Sent" || enquiry.clientStatus === "Sent" || enquiry.stage === "new") {
    return (
      <div className={styles.clientPanelContainer}>
        {feedbackToast && (
          <div style={{ padding: "8px 12px", background: "#f0fdf4", color: "#166534", borderRadius: "8px", fontSize: "12px", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: "6px" }}>
            <Check size={14} />
            <span>{feedbackToast}</span>
          </div>
        )}

        <div className={styles.clientCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerTitleRow}>
              <div className={`${styles.headerIconWrap} ${styles.iconBlue}`}>
                <Clock size={16} />
              </div>
              <h4 className={styles.cardTitle}>Enquiry Status</h4>
            </div>
            <span className={`${styles.statusPill} ${styles.statusPillSlate}`}>Sent</span>
          </div>

          <div className={`${styles.noticeBox} ${styles.noticeBoxNeutral}`}>
            <strong style={{ color: "#0f172a" }}>Service provider has not responded yet.</strong>
            <span>
              Your enquiry has been received by <strong>Kallisto Studio Architects</strong>. They are currently reviewing your project scope, site coordinates, and budget target. They will reply soon with an initial consultation or proposal.
            </span>
          </div>

          <div className={styles.actionBtnStack}>
            <button
              type="button"
              className={styles.secondaryActionBtn}
              onClick={() => setShowEditModal(true)}
            >
              <Pencil size={14} />
              <span>Edit Enquiry & Resend</span>
            </button>
          </div>
        </div>

        {/* Edit & Resend Modal */}
        {showEditModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <div style={{ background: "#ffffff", borderRadius: "12px", padding: "20px", maxWidth: "480px", width: "100%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "15px", fontWeight: 700 }}>Edit Enquiry Requirements</h3>
              <p style={{ margin: "0 0 12px 0", fontSize: "12.5px", color: "#64748b" }}>
                Update your project brief or requirement notes before the service provider prepares the proposal.
              </p>
              <textarea
                className={styles.inputField}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Describe any additional spaces, materials, or requirements..."
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "14px" }}>
                <button type="button" className={styles.secondaryActionBtn} style={{ width: "auto" }} onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="button" className={styles.primaryActionBtn} style={{ width: "auto" }} onClick={handleSubmitEdit}>Update & Resend</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Case 2: Status = "Revision Requested" (like prj-9)
  if (localStatus === "Revision Requested" || enquiry.clientStatus === "Revision Requested" || enquiry.stage === "clarification") {
    return (
      <div className={styles.clientPanelContainer}>
        {feedbackToast && (
          <div style={{ padding: "8px 12px", background: "#f0fdf4", color: "#166534", borderRadius: "8px", fontSize: "12px", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: "6px" }}>
            <Check size={14} />
            <span>{feedbackToast}</span>
          </div>
        )}

        <div className={styles.clientCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerTitleRow}>
              <div className={`${styles.headerIconWrap} ${styles.iconOrange}`}>
                <RotateCcw size={16} />
              </div>
              <h4 className={styles.cardTitle}>Revision & Response</h4>
            </div>
            <span className={`${styles.statusPill} ${styles.statusPillOrange}`}>Revision Requested</span>
          </div>

          <div className={`${styles.noticeBox} ${styles.noticeBoxOrange}`}>
            <strong>Service provider has updated the proposal.</strong>
            <span>
              The service provider has reviewed your revision request and submitted an updated proposal draft (V02) below for your inspection.
            </span>
          </div>

          {/* Service Provider Response Block */}
          <div className={styles.providerResponseSection}>
            <div className={styles.providerHeaderRow}>
              <div className={styles.providerNameCol}>
                <span className={styles.providerTitle}>Kallisto Studio Architects</span>
                <span className={styles.providerSubtitle}>Ar. Vivek Menon   Response received Aug 12, 2026</span>
              </div>
              <span className={styles.responseBadge}>Proposal V02 Updated</span>
            </div>
            <p className={styles.responseText}>
              {isCedarValley ? (
                "We have reviewed your request for exposed rammed earth walls and additional north-facing artist studio skylights. We recalibrated the civil BOQ to ₹95L, incorporated local Wayanad laterite soil tests, and established a 10-month execution schedule. Please review the updated proposal."
              ) : (
                "We have reviewed your comments, recalibrated the scope deliverables, updated the itemised BOQ commercial schedule, and reflected the timeline changes in proposal V02."
              )}
            </p>
            <ul className={styles.responseHighlights}>
              <li>✓ Rammed earth wall specifications confirmed</li>
              <li>✓ North-light studio clerestories added to structural package</li>
              <li>✓ BOQ breakdown aligned with ₹95L budget target</li>
            </ul>
          </div>

          {/* Action Buttons for Revision Requested */}
          <div className={styles.actionBtnStack}>
            <button
              type="button"
              className={styles.primaryActionBtn}
              onClick={onOpenProposal}
            >
              <FileText size={15} />
              <span>View Updated Proposal (V02)</span>
            </button>

            <div className={styles.actionBtnRow}>
              <button
                type="button"
                className={styles.secondaryActionBtn}
                onClick={onDownloadProposal}
              >
                <Download size={14} />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                className={styles.acceptActionBtn}
                onClick={() => setShowAcceptModal(true)}
              >
                <CheckCircle2 size={14} />
                <span>Accept</span>
              </button>
            </div>

            <button
              type="button"
              className={styles.orangeActionBtn}
              onClick={() => setShowRevisionModal(true)}
            >
              <RotateCcw size={14} />
              <span>Request Further Revision</span>
            </button>
          </div>
        </div>

        {/* Revision Request Modal */}
        {showRevisionModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <div style={{ background: "#ffffff", borderRadius: "12px", padding: "20px", maxWidth: "500px", width: "100%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>Request Proposal Revision</h3>
                <button type="button" onClick={() => setShowRevisionModal(false)} style={{ border: "none", background: "none", cursor: "pointer", color: "#64748b" }}><X size={18} /></button>
              </div>
              <p style={{ margin: "0 0 12px 0", fontSize: "12.5px", color: "#64748b" }}>
                Specify what changes you need regarding scope, materials, budget, or timeline:
              </p>
              <textarea
                className={styles.inputField}
                value={revisionComments}
                onChange={(e) => setRevisionComments(e.target.value)}
                placeholder="e.g. Please adjust the timeline milestone schedule or provide an alternate specification for flooring..."
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "14px" }}>
                <button type="button" className={styles.secondaryActionBtn} style={{ width: "auto" }} onClick={() => setShowRevisionModal(false)}>Cancel</button>
                <button type="button" className={styles.orangeActionBtn} style={{ width: "auto" }} onClick={handleSubmitRevision}>Submit Revision Request</button>
              </div>
            </div>
          </div>
        )}

        {/* Accept Confirmation Modal */}
        {showAcceptModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <div style={{ background: "#ffffff", borderRadius: "12px", padding: "22px", maxWidth: "440px", width: "100%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#f0fdf4", color: "#16a34a", display: "grid", placeItems: "center" }}>
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>Accept Proposal</h3>
                  <span style={{ fontSize: "11.5px", color: "#64748b" }}>{enquiry.title} ({enquiry.budget || "₹95L"})</span>
                </div>
              </div>
              <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#334155", lineHeight: 1.5 }}>
                Are you ready to accept this proposal from <strong>Kallisto Studio Architects</strong>? This will initiate the contract execution and project onboarding phase.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button type="button" className={styles.secondaryActionBtn} style={{ width: "auto" }} onClick={() => setShowAcceptModal(false)}>Review Proposal First</button>
                <button type="button" className={styles.acceptActionBtn} style={{ width: "auto" }} onClick={handleAcceptProposal}>Confirm & Accept</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Case 3: Status = "Proposal Received" (e.g. prj-8)
  return (
    <div className={styles.clientPanelContainer}>
      {feedbackToast && (
        <div style={{ padding: "8px 12px", background: "#f0fdf4", color: "#166534", borderRadius: "8px", fontSize: "12px", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: "6px" }}>
          <Check size={14} />
          <span>{feedbackToast}</span>
        </div>
      )}

      <div className={styles.clientCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerTitleRow}>
            <div className={`${styles.headerIconWrap} ${styles.iconBlue}`}>
              <FileText size={16} />
            </div>
            <h4 className={styles.cardTitle}>Proposal Received</h4>
          </div>
          <span className={`${styles.statusPill} ${styles.statusPillBlue}`}>Proposal Received</span>
        </div>

        <div className={`${styles.noticeBox} ${styles.noticeBoxBlue}`}>
          <strong>Official proposal submitted for review.</strong>
          <span>
            Kallisto Studio Architects has prepared a complete architectural proposal and itemised BOQ schedule for your review.
          </span>
        </div>

        <div className={styles.actionBtnStack}>
          <button
            type="button"
            className={styles.primaryActionBtn}
            onClick={onOpenProposal}
          >
            <FileText size={15} />
            <span>View Proposal</span>
          </button>

          <div className={styles.actionBtnRow}>
            <button
              type="button"
              className={styles.acceptActionBtn}
              onClick={() => setShowAcceptModal(true)}
            >
              <CheckCircle2 size={14} />
              <span>Accept Proposal</span>
            </button>

            <button
              type="button"
              className={styles.orangeActionBtn}
              onClick={() => setShowRevisionModal(true)}
            >
              <RotateCcw size={14} />
              <span>Request Revision</span>
            </button>
          </div>

          <div className={styles.actionBtnRow}>
            <button
              type="button"
              className={styles.secondaryActionBtn}
              onClick={onDownloadProposal}
            >
              <Download size={14} />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              className={styles.secondaryActionBtn}
              onClick={() => setShowEditModal(true)}
            >
              <Pencil size={14} />
              <span>Edit & Resend</span>
            </button>
          </div>
        </div>
      </div>

      {/* Revision Request Modal */}
      {showRevisionModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#ffffff", borderRadius: "12px", padding: "20px", maxWidth: "500px", width: "100%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>Request Proposal Revision</h3>
              <button type="button" onClick={() => setShowRevisionModal(false)} style={{ border: "none", background: "none", cursor: "pointer", color: "#64748b" }}><X size={18} /></button>
            </div>
            <p style={{ margin: "0 0 12px 0", fontSize: "12.5px", color: "#64748b" }}>
              What would you like the service provider to revise?
            </p>
            <textarea
              className={styles.inputField}
              value={revisionComments}
              onChange={(e) => setRevisionComments(e.target.value)}
              placeholder="e.g. Please optimize the MEP budget or adjust the milestone payment schedule..."
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "14px" }}>
              <button type="button" className={styles.secondaryActionBtn} style={{ width: "auto" }} onClick={() => setShowRevisionModal(false)}>Cancel</button>
              <button type="button" className={styles.orangeActionBtn} style={{ width: "auto" }} onClick={handleSubmitRevision}>Submit Revision Request</button>
            </div>
          </div>
        </div>
      )}

      {/* Accept Confirmation Modal */}
      {showAcceptModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#ffffff", borderRadius: "12px", padding: "22px", maxWidth: "440px", width: "100%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#f0fdf4", color: "#16a34a", display: "grid", placeItems: "center" }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>Accept Proposal</h3>
                <span style={{ fontSize: "11.5px", color: "#64748b" }}>{enquiry.title} ({enquiry.budget || "₹95L"})</span>
              </div>
            </div>
            <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#334155", lineHeight: 1.5 }}>
              Accept this proposal to proceed to contract execution and project initiation.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button type="button" className={styles.secondaryActionBtn} style={{ width: "auto" }} onClick={() => setShowAcceptModal(false)}>Cancel</button>
              <button type="button" className={styles.acceptActionBtn} style={{ width: "auto" }} onClick={handleAcceptProposal}>Confirm & Accept</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit & Resend Modal */}
      {showEditModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#ffffff", borderRadius: "12px", padding: "20px", maxWidth: "480px", width: "100%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "15px", fontWeight: 700 }}>Edit Enquiry & Resend</h3>
            <p style={{ margin: "0 0 12px 0", fontSize: "12.5px", color: "#64748b" }}>
              Edit requirement details and resend for a revised proposal:
            </p>
            <textarea
              className={styles.inputField}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Describe your updated requirements..."
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "14px" }}>
              <button type="button" className={styles.secondaryActionBtn} style={{ width: "auto" }} onClick={() => setShowEditModal(false)}>Cancel</button>
              <button type="button" className={styles.primaryActionBtn} style={{ width: "auto" }} onClick={handleSubmitEdit}>Resend to Provider</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
