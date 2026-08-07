"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, X, ShieldAlert } from "lucide-react";
import { ApprovalRequestItem, RequestCategory } from "@/types/domain/home";
import { ApprovalDecisionDialog } from "./dialogs/approval-decision-dialog";
import { RejectionReasonDialog } from "./dialogs/rejection-reason-dialog";
import styles from "../home-workspace.module.css";

export interface RequestsApprovalQueueProps {
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

export function RequestsApprovalQueue({
  requests,
  userRole = "owner",
  onExecuteAction,
}: RequestsApprovalQueueProps) {
  const [activeTab, setActiveTab] = useState<RequestCategory>("all");
  const [selectedApproveRequest, setSelectedApproveRequest] = useState<ApprovalRequestItem | null>(null);
  const [selectedRejectRequest, setSelectedRejectRequest] = useState<ApprovalRequestItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredRequests = requests.filter((req) => {
    if (activeTab === "all") return true;
    return req.category === activeTab;
  });

  const visibleRequests = filteredRequests.slice(0, 5);

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
    <section className={styles.sectionContainer}>
      <div className={styles.sectionHeaderRow}>
        <div>
          <h2 className={styles.sectionTitle}>Requests and Approvals</h2>
          <p className={styles.sectionSubtitle}>
            Decision queue for procurement, BOQ revisions, payments, documents, and variations.
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

      {/* Filter Tabs */}
      <div className={styles.filterTabsRow} role="tablist" aria-label="Request categories">
        {(["all", "procurement", "boq", "payments", "documents"] as RequestCategory[]).map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={activeTab === cat}
            className={`${styles.filterTabBtn}${activeTab === cat ? ` ${styles.filterTabActive}` : ""}`}
            onClick={() => setActiveTab(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Decision Queue List */}
      <div className={styles.queueContainer}>
        {visibleRequests.length === 0 ? (
          <div className={styles.emptyStateBox}>
            <p>No requests are waiting for your decision.</p>
          </div>
        ) : (
          <div className={styles.queueList}>
            {visibleRequests.map((req) => (
              <div key={req.id} className={styles.requestCard}>
                <div className={styles.requestCardHeader}>
                  <div className={styles.reqBadgeGroup}>
                    <span className={styles.reqIdBadge}>{req.requestId}</span>
                    <span className={styles.reqTypeBadge}>{req.requestType}</span>
                    <span className={styles.reqProjectTag}>{req.projectName}</span>
                  </div>
                  <span
                    className={`${styles.statusPill} ${
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

                <div className={styles.requestCardBody}>
                  <strong className={styles.reqSummaryText}>{req.itemsSummary}</strong>
                  {req.amountOrQuantities && (
                    <div className={styles.reqQtyRow}>
                      <span>Details: <strong>{req.amountOrQuantities}</strong></span>
                    </div>
                  )}
                  <div className={styles.reqMetaLine}>
                    <span>Requested by: <strong>{req.requestedBy}</strong> ({req.requestedDate})</span>
                    <span>Needed by: <strong>{req.neededByDate}</strong></span>
                  </div>
                </div>

                {req.status === "Awaiting approval" && (
                  <div className={styles.requestCardFooter}>
                    <Link href="/documents?filter=approvals" className={styles.btnReview}>
                      Review
                    </Link>
                    <div className={styles.decisionBtnGroup}>
                      <button
                        type="button"
                        className={styles.btnApproveAction}
                        onClick={() => setSelectedApproveRequest(req)}
                      >
                        <Check size={14} />
                        <span>Approve</span>
                      </button>
                      <button
                        type="button"
                        className={styles.btnRejectAction}
                        onClick={() => setSelectedRejectRequest(req)}
                      >
                        <X size={14} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
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
