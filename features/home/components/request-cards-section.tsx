"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, X, ShieldAlert } from "lucide-react";
import { ApprovalRequestItem, RequestCategory } from "@/types/domain/home";
import { ApprovalDecisionDialog } from "./dialogs/approval-decision-dialog";
import { RejectionReasonDialog } from "./dialogs/rejection-reason-dialog";
import styles from "../home-workspace.module.css";

export interface RequestCardsSectionProps {
  requests: ApprovalRequestItem[];
  userRole?: string;
  onExecuteAction: (params: {
    requestId: string;
    action: "approve" | "reject";
    rejectionReason?: string;
    idempotencyKey: string;
    expectedVersion: number;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function RequestCardsSection({
  requests,
  userRole = "owner",
  onExecuteAction,
}: RequestCardsSectionProps) {
  const [activeTab, setActiveTab] = useState<RequestCategory>("all");
  const [selectedApproveRequest, setSelectedApproveRequest] = useState<ApprovalRequestItem | null>(null);
  const [selectedRejectRequest, setSelectedRejectRequest] = useState<ApprovalRequestItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredRequests = requests.filter((req) => {
    if (activeTab === "all") return true;
    return req.category === activeTab;
  });

  // SVG specifies 3 request cards per row at standard desktop width
  const visibleRequests = filteredRequests.slice(0, 3);

  const handleApproveConfirm = async () => {
    if (!selectedApproveRequest) return;
    setIsSubmitting(true);
    setActionError(null);

    const idempotencyKey = `idem-approve-${selectedApproveRequest.id}-${Date.now()}`;
    const result = await onExecuteAction({
      requestId: selectedApproveRequest.id,
      action: "approve",
      idempotencyKey,
      expectedVersion: selectedApproveRequest.version,
    });

    setIsSubmitting(false);
    if (result.success) {
      setSelectedApproveRequest(null);
    } else {
      setActionError(result.error ?? "Failed to approve request.");
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!selectedRejectRequest) return;
    setIsSubmitting(true);
    setActionError(null);

    const idempotencyKey = `idem-reject-${selectedRejectRequest.id}-${Date.now()}`;
    const result = await onExecuteAction({
      requestId: selectedRejectRequest.id,
      action: "reject",
      rejectionReason: reason,
      idempotencyKey,
      expectedVersion: selectedRejectRequest.version,
    });

    setIsSubmitting(false);
    if (result.success) {
      setSelectedRejectRequest(null);
    } else {
      setActionError(result.error ?? "Failed to reject request.");
    }
  };

  return (
    <section className={styles.sectionContainerFullWidth}>
      <div className={styles.sectionHeaderRow}>
        <div>
          <h2 className={styles.sectionTitleLarge}>Requests and Approvals</h2>
          <p className={styles.sectionSubtitle}>
            Decision queue for procurement, BOQs, payments, documents, and scope variations.
          </p>
        </div>
        <Link href="/documents?filter=approvals" className={styles.headerActionLink}>
          <span>View all requests</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {actionError && (
        <div className={styles.actionErrorBanner} role="alert">
          <ShieldAlert size={15} />
          <span>{actionError}</span>
          <button type="button" onClick={() => setActionError(null)} className={styles.dismissBtn}>
            Dismiss
          </button>
        </div>
      )}

      {/* Horizontal Request Cards Grid (3 cards per row matching SVG y=1862.5 w=447px) */}
      <div className={styles.horizontalRequestsGrid}>
        {visibleRequests.length === 0 ? (
          <div className={styles.emptyStateBox}>
            <p>No requests are waiting for your decision.</p>
          </div>
        ) : (
          visibleRequests.map((req) => (
            <div key={req.id} className={styles.svgRequestCard}>
              <div className={styles.requestCardHeaderRow}>
                <div className={styles.reqBadgeStack}>
                  <span className={styles.reqIdPill}>{req.requestId}</span>
                  <span className={styles.reqCategoryPill}>{req.requestType.toUpperCase()}</span>
                </div>

                <span
                  className={`${styles.requestStatusBadge} ${
                    req.status === "Approved"
                      ? styles.statusApproved
                      : req.status === "Rejected"
                      ? styles.statusRejected
                      : styles.statusPending
                  }`}
                >
                  {req.status}
                </span>
              </div>

              <div className={styles.requestCardMainContent}>
                <h4 className={styles.requestProjectTitle}>{req.projectName}</h4>
                <p className={styles.requestSummaryText}>{req.itemsSummary}</p>
                {req.amountOrQuantities && (
                  <span className={styles.requestQtyText}>Details: <strong>{req.amountOrQuantities}</strong></span>
                )}
              </div>

              <div className={styles.requestCardMetaFooter}>
                <div className={styles.reqMetaDates}>
                  <span>By: {req.requestedBy}</span>
                  <span>Needed: <strong>{req.neededByDate}</strong></span>
                </div>

                {req.status === "Awaiting approval" ? (
                  <div className={styles.requestActionBtnsRow}>
                    <button
                      type="button"
                      className={styles.btnApproveCompact}
                      onClick={() => setSelectedApproveRequest(req)}
                    >
                      <Check size={13} />
                      <span>Approve</span>
                    </button>
                    <button
                      type="button"
                      className={styles.btnRejectCompact}
                      onClick={() => setSelectedRejectRequest(req)}
                    >
                      <X size={13} />
                      <span>Reject</span>
                    </button>
                  </div>
                ) : (
                  <Link href="/documents?filter=approvals" className={styles.btnReviewRequest}>
                    Review
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <ApprovalDecisionDialog
        isOpen={!!selectedApproveRequest}
        request={selectedApproveRequest}
        isSubmitting={isSubmitting}
        onClose={() => setSelectedApproveRequest(null)}
        onConfirm={handleApproveConfirm}
      />

      <RejectionReasonDialog
        isOpen={!!selectedRejectRequest}
        request={selectedRejectRequest}
        isSubmitting={isSubmitting}
        onClose={() => setSelectedRejectRequest(null)}
        onConfirm={handleRejectConfirm}
      />
    </section>
  );
}
