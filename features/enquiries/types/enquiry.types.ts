export type EnquiryStatus = "active" | "needs_attention" | "completed" | "archived";

export type EnquiryStage =
  | "new"
  | "clarification"
  | "consultation"
  | "qualified"
  | "proposal"
  | "won"
  | "lost";

export type EnquirySource = "website" | "referral" | "partner" | "franchise" | "direct";

export type ProjectType =
  | "residential"
  | "commercial"
  | "hospitality"
  | "multi_family"
  | "landscape"
  | "retail";

export type NextActionType =
  | "review_enquiry"
  | "request_clarification"
  | "schedule_consultation"
  | "consultation"
  | "follow_up"
  | "prepare_proposal"
  | "convert_to_project"
  | "mark_as_lost";

export type NextActionState = "urgent" | "scheduled" | "ready" | "completed";

export interface EnquiryNextAction {
  type: NextActionType;
  label: string;
  dueAt?: string; // ISO 8601 string
  state?: NextActionState;
}

export interface EnquiryRecord {
  id: string;
  title: string;
  requirementSummary: string;
  clientName: string;
  location: string;
  thumbnailUrl: string;
  source: EnquirySource;
  status: EnquiryStatus;
  stage: EnquiryStage;
  projectType: ProjectType;
  budgetMin: number; // in whole rupees
  budgetMax: number; // in whole rupees
  receivedAt: string; // ISO 8601 string
  nextAction: EnquiryNextAction;
  isNew?: boolean;
  priority?: EnquiryPriority;
  owner?: string;          // assigned enquiry owner display name
  tags?: string[];         // e.g. ["fitout", "bengaluru"]
  enquiryRef?: string;     // e.g. "ENQ-2026-0486"
  lastUpdatedAt?: string;  // ISO 8601 string
}

export type EnquiryPriority = "high" | "medium" | "low";

export type EnquirySort = "received_desc" | "received_asc";

export const STATUS_LABELS: Record<EnquiryStatus, string> = {
  active: "Active",
  needs_attention: "Needs attention",
  completed: "Completed",
  archived: "Archived",
};

export const STAGE_LABELS: Record<EnquiryStage, string> = {
  new: "New",
  clarification: "Clarification",
  consultation: "Consultation",
  qualified: "Qualified",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

export const SOURCE_LABELS: Record<EnquirySource, string> = {
  website: "Website",
  referral: "Referral",
  partner: "Partner",
  franchise: "Franchise",
  direct: "Direct",
};

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  residential: "Residential",
  commercial: "Commercial",
  hospitality: "Hospitality",
  multi_family: "Multi-family",
  landscape: "Landscape",
  retail: "Retail",
};
