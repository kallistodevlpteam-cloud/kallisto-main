"use client";

import React from "react";
import { Inbox } from "lucide-react";
import { LabourRequest } from "../../types/request-domain";
import { HandsRequestCard } from "./hands-request-card";
import styles from "./hands-requests.module.css";

interface HandsRequestsListProps {
  requests: LabourRequest[];
  selectedRequestId?: string;
  onSelectRequest: (req: LabourRequest) => void;
  onReviewRequest: (req: LabourRequest) => void;
}

export function HandsRequestsList({
  requests,
  selectedRequestId,
  onSelectRequest,
  onReviewRequest,
}: HandsRequestsListProps) {
  if (requests.length === 0) {
    return (
      <div className={styles.emptyStateContainer} role="status">
        <Inbox size={32} color="#94a3b8" />
        <h4 className={styles.emptyStateTitle}>No workforce requests found</h4>
        <p className={styles.emptyStateSub}>
          There are no incoming trade requirements matching your current filters or selected tab.
        </p>
      </div>
    );
  }

  return (
    <section className={styles.requestsListContainer} aria-label="Incoming Workforce Requests">
      {requests.map((request) => (
        <HandsRequestCard
          key={request.id}
          request={request}
          isSelected={request.id === selectedRequestId}
          onSelect={onSelectRequest}
          onReview={onReviewRequest}
        />
      ))}
    </section>
  );
}
