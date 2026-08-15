export const PROJECT_CHARACTER_ENQ = "enq";

/** One entry of the project's inspiration gallery (inspiration_img row). */
export interface BackendInspirationImage {
  url: string;
  alt: string | null;
}

/** One project document (project_DOC row) with its image preview URL. */
export interface BackendProjectDocument {
  id: number;
  name: string | null;
  docImageUrl: string | null;
  docType?: string | null;
  status?: boolean;
  updatedAt?: number | null;
}

/** One project scope with its nested sub-list (project_scope_item). */
export interface BackendProjectScope {
  id: number;
  scope_name: string;
  items: string[];
}

/** One project requirement group (requirements row) with its nested
 * sub-list of values (requirement_items rows). */
export interface BackendProjectRequirement {
  id: string;
  requirement_name: string;
  items: string[];
  item_details?: string[][];
  statuses?: (boolean | null)[];
}

export interface BackendClientPriority {
  id: string;
  priority_name: string;
  details: string[];
  statuses: (boolean | null)[];
  tags: string[][];
}

export interface BackendFamilyMember {
  familyId: string;
  clientId: string | null;
  name: string | null;
  age: number | null;
  job: string | null;
  phone: string | null;
  relation: string | null;
  familyMemberImgUrl: string | null;
  description: string | null;
}

export interface BackendProjectClients {
  client_id?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  occupation?: string | null;
  location?: string | null;
  notes?: string | null;
  [key: string]: unknown;
}

export interface BackendProjectLifestyle {
  dietary_preferences?: string | null;
  pets?: string | null;
  hobbies?: string | null;
  entertaining_frequency?: string | null;
  work_from_home?: string | null;
  special_requirements?: string | null;
  [key: string]: unknown;
}

export interface BackendProjectApprovalProcess {
  decision_makers?: string[] | null;
  approval_stages?: string[] | null;
  notes?: string | null;
  [key: string]: unknown;
}

export interface BackendProjectCommunication {
  preferred_channel?: string | null;
  frequency?: string | null;
  primary_contact?: string | null;
  notes?: string | null;
  [key: string]: unknown;
}

export interface BackendProjectTechnical {
  soil_testing_status?: string | null;
  structural_specifications?: string | null;
  mep_preferences?: string | null;
  sustainability_goals?: string | null;
  notes?: string | null;
  [key: string]: unknown;
}

export interface BackendProjectRegulatory {
  sanctioning_authority?: string | null;
  approval_status?: string | null;
  zoning_restrictions?: string | null;
  notes?: string | null;
  [key: string]: unknown;
}

export interface BackendProjectOutdoor {
  landscape_style?: string | null;
  hardscaping_elements?: string[] | null;
  features?: string[] | null;
  irrigation?: string | null;
  lighting?: string | null;
  notes?: string | null;
  [key: string]: unknown;
}

export interface BackendProjectSpace {
  space_name: string | null;
  required: number | null;
  priority: string | null;
  approx_area_size: string | null;
  quantity: number | null;
  adjacency_notes: string | null;
}

export interface BackendProjectTimeline {
  expected_start_date?: string | null;
  expected_handover_date?: string | null;
  milestones?: Array<{ name: string; date: string; status: string }>;
  notes?: string | null;
  [key: string]: unknown;
}

export interface BackendProjectProposal {
  id: number;
  provider_id: string | null;
  status: "draft" | "sent" | "accepted" | "rejected" | null;
  total_amount: number | null;
  rate_notes: string | null;
  timeline_notes: string | null;
  scope_summary: string | null;
  rejection_reason: string | null;
  negotiation_notes: string | null;
  sent_at: number | null;
  responded_at: number | null;
}

export interface BackendProjectTeamMember {
  provider_id: string;
  role: string | null;
  status: "pending" | "active" | "completed" | "removed" | null;
  notes: string | null;
}

export interface BackendProjectMessage {
  sender_type: "provider" | "client" | "system";
  sender_id?: string;
  message_type: "general" | "proposal" | "rate" | "negotiation" | "approval" | "rejection";
  content: string;
  created_at?: number;
}

export interface BackendProject {
  id: number;
  projectName: string;
  projectType: string | null;
  buildingType: string | null;
  projectCharacter: string | null;
  newConstructionOrRenovation: string | null;
  purposeOfProject: string | null;
  briefDescription: string | null;
  overView?: string | null;
  providerIds?: string[];
  coverImageUrl: string | null;
  /** Built-up area in square feet (projects.sq_area INTEGER column). */
  sqArea: number | null;
  /** Client-expected timeline (projects.client_expected_timeline TEXT). */
  clientExpectedTimeline: string | null;
  clientName: string | null;
  place: string | null;
  estimatedOverallBudget: number | null;
  /** Unix epoch seconds or ISO string (projects.created_at column). */
  createdAt: number | string | null;
  /** Unix epoch seconds or ISO string (projects.updated_at column). */
  updatedAt: number | string | null;
  /** Enquiry viewed flag (enquiry_details.view INTEGER 0/1). Strictly
   * backend-sourced; null/0 mean the enquiry has not been opened. */
  viewed: boolean;
  /** Inspiration gallery images (inspiration_img). Strictly
   * backend-sourced; an empty list means no gallery images. */
  inspirationImages: BackendInspirationImage[];
  /** Project documents (project_DOC). Strictly backend-sourced; an
   * empty list means no documents are available. */
  projectDocuments: BackendProjectDocument[];
  /** Site images (project_site.site_img_url JSON list). Strictly
   * backend-sourced; an empty list means no site images are available. */
  siteImages: string[];
  /** Project scopes with nested sub-lists (project_scope +
   * project_scope_item). Strictly backend-sourced. */
  projectScopes: BackendProjectScope[];
  /** Requirement groups with nested sub-lists (requirements +
   * requirement_items). Strictly backend-sourced; an empty list means no
   * requirement rows exist for the project. */
  requirements: BackendProjectRequirement[];
  priorities?: BackendClientPriority[];
  familyMembers?: BackendFamilyMember[];
  projectClients?: BackendProjectClients | null;
  projectLifestyle?: BackendProjectLifestyle | null;
  projectApprovalProcess?: BackendProjectApprovalProcess | null;
  projectCommunication?: BackendProjectCommunication | null;
  projectTechnical?: BackendProjectTechnical | null;
  projectRegulatory?: BackendProjectRegulatory | null;
  projectOutdoor?: BackendProjectOutdoor | null;
  projectSpaces?: BackendProjectSpace[];
  projectTimeline?: BackendProjectTimeline | null;
  projectStatus?: string | null;
  proposal?: BackendProjectProposal | null;
  teamMembers?: BackendProjectTeamMember[];
  messages?: BackendProjectMessage[];
}

export interface BackendProjectsResponse {
  status: string;
  projects: BackendProject[];
  message?: string;
}