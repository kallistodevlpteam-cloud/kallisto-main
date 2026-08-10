export type EnquiryStatus = "active" | "needs_attention" | "completed" | "archived";

export type EnquiryStage =
  | "new"
  | "idle"
  | "clarification"
  | "consultation"
  | "qualified"
  | "proposal"
  | "accepted"
  | "rejected"
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

export type RequirementCategory =
  | "project"
  | "client"
  | "vision"
  | "style"
  | "lifestyle"
  | "budget"
  | "site"
  | "timeline"
  | "space"
  | "outdoor"
  | "technical"
  | "regulatory"
  | "decision"
  | "communication"
  | "documentation"
  | "scope";

export type RequirementState =
  | "confirmed"
  | "partial"
  | "not_provided"
  | "needs_clarification"
  | "odin_inferred"
  | "needs_verification"
  | "not_applicable";

export type EnquiryRequirementDomain =
  | "project_client"
  | "vision_style"
  | "lifestyle"
  | "room_programme"
  | "exterior_facade"
  | "outdoor_landscape"
  | "site"
  | "technical"
  | "budget_commercial"
  | "timeline"
  | "regulatory"
  | "decision_making"
  | "communication"
  | "documentation"
  | "scope";

export interface SpaceRequirementValue {
  name: string;
  quantity: number;
  required: boolean;
  priority: "essential" | "important" | "optional";
  approximateArea?: string;
  preferredFloor?: string;
  adjacency?: string[];
  privacy?: "high" | "medium" | "low";
  naturalLight?: "high" | "medium" | "low";
  ventilation?: "high" | "medium" | "low";
  furniture?: string[];
  storage?: string[];
  equipment?: string[];
  accessibility?: string[];
  specialRequirements?: string[];
  clientNotes?: string;
  odinInterpretation?: string;
}

export type RequirementSource =
  | "client"
  | "clarification"
  | "document"
  | "odin"
  | "service_provider";

export type RequirementPriority = "p0" | "p1" | "p2";

export interface EnquiryRequirement {
  id: string;
  category: RequirementCategory;
  domain?: EnquiryRequirementDomain;
  label: string;
  value?: unknown;
  spaceValue?: SpaceRequirementValue;
  state: RequirementState;
  source: RequirementSource;
  priority: RequirementPriority;
  confidence?: number;
  updatedAt?: string;
  evidenceIds?: string[];
}

export interface ClientPriority {
  id: string;
  label: string;
  type: "confirmed" | "inferred";
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
  budget?: string;         // pre-formatted budget summary (overrides min/max when present)
  timeline?: string;       // desired schedule summary
  duration?: string;       // expected delivery duration summary
  notes?: string;          // free-form context notes
  builtUpArea?: string;    // e.g. "2,800 – 3,200 sq ft"
  budgetCoverageStatus?: string; // e.g. "Coverage partially defined"
  areaCoverageStatus?: string;   // e.g. "Client supplied"
  requirements?: EnquiryRequirement[];
  clientPriorities?: ClientPriority[];
  unconfirmedScope?: string[];
  proposalStatus?: "none" | "draft" | "sent" | "viewed" | "accepted" | "rejected" | "revision_requested";
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
  idle: "Review",
  clarification: "Clarification",
  consultation: "Consultation",
  qualified: "Qualified",
  proposal: "Proposal",
  accepted: "Accepted",
  rejected: "Rejected",
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
