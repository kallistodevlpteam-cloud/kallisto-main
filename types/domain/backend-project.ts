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
}

/** One client priority entry. */
export interface BackendClientPriority {
  id: string;
  priority_name: string;
  details: string[];
  statuses: (boolean | null)[];
  tags: string[][];
}

/** One family member entry. */
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

/** Project clients context. */
export interface BackendProjectClients {
  about_client?: string | null;
  building_users?: string | null;
  family_or_team_size?: string | null;
  elderly_members?: string | null;
  children?: string | null;
  pets?: string | null;
  work_from_home?: string | null;
  accessibility_requirements?: string | null;
}

/** Project lifestyle context. */
export interface BackendProjectLifestyle {
  daily_routine?: string | null;
  entertain_guests?: string | null;
  host_parties?: string | null;
  relaxation_place?: string | null;
  morning_coffee_location?: string | null;
  outdoor_activities?: string | null;
  hobbies?: string | null;
  privacy_importance?: string | null;
}

/** Project approval process context. */
export interface BackendProjectApprovalProcess {
  primary_decision_maker?: string | null;
  other_approval_stakeholders?: string | null;
  expected_revision_rounds?: string | null;
  design_review_method?: string | null;
  approval_turnaround_time?: string | null;
}

/** Project communication context. */
export interface BackendProjectCommunication {
  preferred_contact?: string | null;
  communication_channel?: string | null;
  meeting_frequency?: string | null;
  best_time_to_reach?: string | null;
  special_instructions?: string | null;
}

/** Project technical context. */
export interface BackendProjectTechnical {
  energy_efficient_design?: string | null;
  solar_panels?: string | null;
  rainwater_harvesting?: string | null;
  smart_home_automation?: string | null;
  hvac_preference?: string | null;
  backup_power?: string | null;
  water_storage_borewell?: string | null;
  security_system_requirements?: string | null;
  preferred_material_techs?: string | null;
}

/** Project regulatory context. */
export interface BackendProjectRegulatory {
  zoning_restrictions?: string | null;
  height_restrictions?: string | null;
  home_owner_association_rules?: string | null;
  permits_obtained?: string | null;
  land_disputes_encumbrances?: string | null;
  setback_requirements?: string | null;
}

/** Project outdoor context. */
export interface BackendProjectOutdoor {
  garden?: string | null;
  swimming_pool?: string | null;
  outdoor_deck_patio?: string | null;
  bbq_area?: string | null;
  parking?: string | null;
  driveway_gate_notes?: string | null;
  landscape_boundary_fencing?: string | null;
  outdoor_lighting?: string | null;
  play_area_children?: string | null;
  pet_friendly_outdoor?: string | null;
}

/** One project space entry. */
export interface BackendProjectSpace {
  space_name: string | null;
  required: number | null;
  priority: string | null;
  approx_area_size: string | null;
  quantity: number | null;
  adjacency_notes: string | null;
}

/** Project timeline context. */
export interface BackendProjectTimeline {
  desired_start_date?: string | null;
  desired_completion_date?: string | null;
  fixed_deadline_notes?: string | null;
  phased?: string | null;
  phases_description?: string | null;
  urgency_level?: string | null;
}

/** Project proposal entry. */
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

/** One team member entry. */
export interface BackendProjectTeamMember {
  provider_id: string;
  role: string | null;
  status: "pending" | "active" | "completed" | "removed" | null;
  notes: string | null;
}

/** One project message entry. */
export interface BackendProjectMessage {
  sender_type: "provider" | "client" | "system";
  sender_id: string;
  message_type: "general" | "proposal" | "rate" | "negotiation" | "approval" | "rejection";
  content: string;
  created_at: number;
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
  /** Overview / detailed description. */
  overView?: string | null;
  /** Provider IDs assigned to this project. */
  providerIds?: string[] | null;
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
  /** Client priorities (clientcontext_priorities + priority_details). */
  priorities?: BackendClientPriority[];
  /** Family members (family_details). */
  familyMembers?: BackendFamilyMember[];
  /** Project clients context. */
  projectClients?: BackendProjectClients | null;
  /** Project lifestyle context. */
  projectLifestyle?: BackendProjectLifestyle | null;
  /** Project approval process context. */
  projectApprovalProcess?: BackendProjectApprovalProcess | null;
  /** Project communication context. */
  projectCommunication?: BackendProjectCommunication | null;
  /** Project technical context. */
  projectTechnical?: BackendProjectTechnical | null;
  /** Project regulatory context. */
  projectRegulatory?: BackendProjectRegulatory | null;
  /** Project outdoor context. */
  projectOutdoor?: BackendProjectOutdoor | null;
  /** Project spaces (project_spaces). */
  projectSpaces?: BackendProjectSpace[];
  /** Project timeline context. */
  projectTimeline?: BackendProjectTimeline | null;
  /** Current project status. */
  projectStatus?: string | null;
  /** Latest proposal for this project. */
  proposal?: BackendProjectProposal | null;
  /** Team members (project_team_members). */
  teamMembers?: BackendProjectTeamMember[];
  /** Messages (project_messages). */
  messages?: BackendProjectMessage[];
}

export interface BackendProjectsResponse {
  status: string;
  projects: BackendProject[];
  message?: string;
}