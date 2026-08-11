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
  budget?: string;         // pre-formatted budget summary (overrides min/max when present)
  timeline?: string;       // client-expected timeline (projects.client_expected_timeline)
  duration?: string;       // expected delivery duration summary
  notes?: string;          // free-form context notes
  /** Enquiry viewed flag from the backend enquiry_details.view column. */
  viewed?: boolean;
  /** Built-up area formatted from projects.sq_area (INTEGER sq ft).
   * Strictly backend-sourced. */
  sqArea?: string;
  /** Inspiration gallery images from the backend inspiration_img table.
   * Strictly backend-sourced; empty/absent means no gallery images. */
  inspirationImages?: Array<{ url: string; alt: string | null }>;
  /** Project documents from the backend project_DOC table. Strictly
   * backend-sourced; empty/absent means no documents are available. */
  documents?: Array<{
    id: number;
    name: string | null;
    docImageUrl: string | null;
  }>;
  /** Site images from the backend project_site.site_img_url list.
   * Strictly backend-sourced; empty/absent means no site images. */
  siteImages?: string[];
  /** Project scopes with nested sub-lists (project_scope +
   * project_scope_item). Strictly backend-sourced. */
  projectScopes?: Array<{ id: number; scope_name: string; items: string[] }>;
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
