import type {
  BasicsAvailability,
  BasicsEngagementStatus,
  BasicsPricingModel,
  BasicsProposalStatus,
  BasicsRequirementStatus,
  BasicsVerificationLevel,
} from "../types/basics.types";

export function formatCurrency(value: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value?: string): string {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function titleCase(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const verificationLabels: Record<BasicsVerificationLevel, string> = {
  unverified: "Unverified",
  identity_verified: "Identity verified",
  professional_verified: "Professional verified",
  business_verified: "Business verified",
};

export const availabilityLabels: Record<BasicsAvailability, string> = {
  available_now: "Available now",
  available_this_week: "Available this week",
  limited: "Limited availability",
  unavailable: "Unavailable",
};

export const pricingLabels: Record<BasicsPricingModel, string> = {
  fixed: "Fixed fee",
  hourly: "Hourly",
  per_sq_ft: "Per sq ft",
  per_drawing: "Per drawing",
  per_deliverable: "Per deliverable",
  custom: "Custom quote",
};

export type BasicsStatus =
  | BasicsRequirementStatus
  | BasicsProposalStatus
  | BasicsEngagementStatus;

