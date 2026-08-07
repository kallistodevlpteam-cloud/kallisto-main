import {
  SiteActivityStatus,
  SiteDeliveryStatus,
  SiteIssueSeverity,
} from "../types/site.types";

export type SiteStatusTone =
  | "neutral"
  | "active"
  | "warning"
  | "danger"
  | "success";

export function getActivityStatusTone(
  status: SiteActivityStatus,
): SiteStatusTone {
  const tones: Record<SiteActivityStatus, SiteStatusTone> = {
    scheduled: "neutral",
    in_progress: "active",
    blocked: "danger",
    awaiting_inspection: "warning",
    completed: "success",
    cancelled: "neutral",
  };

  return tones[status];
}

export function getIssueSeverityTone(
  severity: SiteIssueSeverity,
): SiteStatusTone {
  if (severity === "critical") {
    return "danger";
  }

  if (severity === "high" || severity === "medium") {
    return "warning";
  }

  return "neutral";
}

export function getDeliveryStatusTone(
  status: SiteDeliveryStatus,
): SiteStatusTone {
  const tones: Record<SiteDeliveryStatus, SiteStatusTone> = {
    expected: "neutral",
    arrived: "success",
    partially_received: "warning",
    rejected: "danger",
    delayed: "danger",
  };

  return tones[status];
}
