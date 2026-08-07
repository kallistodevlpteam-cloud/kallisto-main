import {
  SiteActivityStatus,
  SiteDeliveryStatus,
  SiteEvidenceType,
  SiteIssue,
} from "../types/site.types";

const ACTIVITY_STATUS_LABELS: Record<SiteActivityStatus, string> = {
  scheduled: "Scheduled",
  in_progress: "In progress",
  blocked: "Blocked",
  awaiting_inspection: "Awaiting inspection",
  completed: "Completed",
  cancelled: "Cancelled",
};

const DELIVERY_STATUS_LABELS: Record<SiteDeliveryStatus, string> = {
  expected: "Expected",
  arrived: "Arrived",
  partially_received: "Partially received",
  rejected: "Rejected",
  delayed: "Delayed",
};

const EVIDENCE_TYPE_LABELS: Record<SiteEvidenceType, string> = {
  progress_photo: "Progress photo",
  inspection_evidence: "Inspection evidence",
  delivery_proof: "Delivery proof",
  issue_evidence: "Issue evidence",
  measurement_evidence: "Measurement evidence",
};

const ISSUE_STATUS_LABELS: Record<SiteIssue["status"], string> = {
  open: "Open",
  in_progress: "In progress",
  blocked: "Blocked",
  under_review: "Under review",
  supplier_follow_up: "Supplier follow-up",
  resolved: "Resolved",
};

export function formatActivityStatus(status: SiteActivityStatus): string {
  return ACTIVITY_STATUS_LABELS[status];
}

export function formatDeliveryStatus(status: SiteDeliveryStatus): string {
  return DELIVERY_STATUS_LABELS[status];
}

export function formatEvidenceType(type: SiteEvidenceType): string {
  return EVIDENCE_TYPE_LABELS[type];
}

export function formatIssueStatus(status: SiteIssue["status"]): string {
  return ISSUE_STATUS_LABELS[status];
}

export function formatWorkerCount(workerCount?: number): string {
  if (workerCount === undefined) {
    return "Individual assignment";
  }

  return `${workerCount} ${workerCount === 1 ? "worker" : "workers"}`;
}

export function formatEvidenceCount(evidenceCount: number): string {
  if (evidenceCount === 0) {
    return "No evidence yet";
  }

  return `${evidenceCount} ${evidenceCount === 1 ? "photo" : "photos"}`;
}
