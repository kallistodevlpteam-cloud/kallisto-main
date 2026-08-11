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

export interface BackendProject {
  id: number;
  projectName: string;
  projectType: string | null;
  buildingType: string | null;
  projectCharacter: string | null;
  newConstructionOrRenovation: string | null;
  purposeOfProject: string | null;
  briefDescription: string | null;
  coverImageUrl: string | null;
  /** Built-up area in square feet (projects.sq_area INTEGER column). */
  sqArea: number | null;
  /** Client-expected timeline (projects.client_expected_timeline TEXT). */
  clientExpectedTimeline: string | null;
  clientName: string | null;
  place: string | null;
  estimatedOverallBudget: number | null;
  /** Unix epoch seconds (projects.created_at INTEGER column). */
  createdAt: number | null;
  /** Unix epoch seconds (projects.updated_at INTEGER column). */
  updatedAt: number | null;
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
}

export interface BackendProjectsResponse {
  status: string;
  projects: BackendProject[];
  message?: string;
}