import type { TursoSchemaSnapshot } from "@/types/domain/turso-schema";
import type {
  BackendProject,
  BackendInspirationImage,
  BackendProjectDocument,
  BackendProjectRequirement,
  BackendProjectScope,
} from "@/types/domain/backend-project";

function getBackendUrl(): string {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    throw new Error("BACKEND_URL must be configured in the frontend server environment.");
  }
  return backendUrl.replace(/\/$/, "");
}

export async function fetchBackendHealth(): Promise<{ status: string; database: string }> {
  const response = await fetch(`${getBackendUrl()}/api/health`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Backend health check failed with status ${response.status}`);
  }
  return (await response.json()) as { status: string; database: string };
}

export async function fetchBackendSchema(): Promise<TursoSchemaSnapshot> {
  const response = await fetch(`${getBackendUrl()}/api/database/schema`, { cache: "no-store" });
  const payload = (await response.json()) as TursoSchemaSnapshot;
  if (!response.ok) {
    return {
      ...payload,
      connected: false,
      error: payload.error ?? `Backend schema request failed with status ${response.status}`,
    };
  }
  return payload;
}

export async function runBackendQuery(sql: string): Promise<{
  status: string;
  cols: string[];
  rows: unknown[][];
  message?: string;
}> {
  const response = await fetch(`${getBackendUrl()}/api/database/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql }),
    cache: "no-store",
  });
  const payload = (await response.json()) as {
    status: string;
    cols: string[];
    rows: unknown[][];
    message?: string;
  };
  if (!response.ok) {
    throw new Error(payload.message ?? `Backend query failed with status ${response.status}`);
  }
  return payload;
}

export interface BackendInspirationImageRow {
  url: string;
  alt: string | null;
}

export interface BackendProjectDocumentRow {
  id: number;
  name: string | null;
  doc_img_url: string | null;
}

export interface BackendProjectRow {
  id: number;
  project_name: string | null;
  project_type: string | null;
  building_type: string | null;
  project_character: string | null;
  new_construction_or_renovation: string | null;
  purpose_of_project: string | null;
  brief_description: string | null;
  cover_image_url: string | null;
  sq_area: number | string | null;
  client_expected_timeline: string | null;
  created_at: number | null;
  updated_at: number | null;
  client_name: string | null;
  place: string | null;
  estimated_overall_budget: number | string | null;
  view: number | null;
  inspiration_images: BackendInspirationImageRow[];
  project_docs: BackendProjectDocumentRow[];
  site_images: string[] | null;
  project_scopes: BackendProjectScopeRow[] | null;
  requirements: BackendProjectRequirementRow[] | null;
}

export interface BackendProjectScopeRow {
  id: number;
  scope_name: string;
  items: string[];
}

export interface BackendProjectRequirementRow {
  id: string;
  requirement_name: string;
  items: string[];
}

function normalizeOptionalNumber(value: number | string | null | undefined): number | null {
  if (value == null || value === "") {
    return null;
  }
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** The projects API stores timestamps as Unix epoch seconds (INTEGER). */
function normalizeOptionalEpochSeconds(value: number | string | null | undefined): number | null {
  if (value == null || value === "") {
    return null;
  }
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapBackendInspirationImages(
  rows: BackendInspirationImageRow[] | null | undefined
): BackendInspirationImage[] {
  return (rows ?? [])
    .map((image) => ({ url: image.url, alt: image.alt ?? null }))
    .filter((image) => typeof image.url === "string" && image.url.length > 0);
}

function mapBackendProjectDocuments(
  rows: BackendProjectDocumentRow[] | null | undefined
): BackendProjectDocument[] {
  return (rows ?? []).map((doc) => ({
    id: doc.id,
    name: doc.name,
    docImageUrl: doc.doc_img_url ?? null,
  }));
}

function mapBackendProjectScopes(
  rows: BackendProjectScopeRow[] | null | undefined
): BackendProjectScope[] {
  return (rows ?? [])
    .map((scope) => ({
      id: scope.id,
      scope_name: scope.scope_name,
      items: Array.isArray(scope.items)
        ? scope.items.filter((item) => typeof item === "string" && item.length > 0)
        : [],
    }))
    .filter((scope) => typeof scope.scope_name === "string" && scope.scope_name.length > 0);
}

function mapBackendProjectRequirements(
  rows: BackendProjectRequirementRow[] | null | undefined
): BackendProjectRequirement[] {
  return (rows ?? [])
    .map((requirement) => ({
      id: requirement.id,
      requirement_name: requirement.requirement_name,
      items: Array.isArray(requirement.items)
        ? requirement.items.filter((item) => typeof item === "string" && item.length > 0)
        : [],
    }))
    .filter(
      (requirement) =>
        typeof requirement.requirement_name === "string" && requirement.requirement_name.length > 0
    );
}

function mapBackendProjectRow(row: BackendProjectRow): BackendProject {
  return {
    id: row.id,
    projectName: row.project_name ?? "",
    projectType: row.project_type,
    buildingType: row.building_type,
    projectCharacter: row.project_character,
    newConstructionOrRenovation: row.new_construction_or_renovation,
    purposeOfProject: row.purpose_of_project,
    briefDescription: row.brief_description,
    coverImageUrl: row.cover_image_url,
    sqArea: normalizeOptionalNumber(row.sq_area),
    clientExpectedTimeline: row.client_expected_timeline ?? null,
    clientName: row.client_name,
    place: row.place,
    estimatedOverallBudget: normalizeOptionalNumber(row.estimated_overall_budget),
    createdAt: normalizeOptionalEpochSeconds(row.created_at),
    updatedAt: normalizeOptionalEpochSeconds(row.updated_at),
    viewed: row.view === 1,
    inspirationImages: mapBackendInspirationImages(row.inspiration_images),
    projectDocuments: mapBackendProjectDocuments(row.project_docs),
    siteImages: Array.isArray(row.site_images)
      ? row.site_images.filter((url) => typeof url === "string" && url.length > 0)
      : [],
    projectScopes: mapBackendProjectScopes(row.project_scopes),
    requirements: mapBackendProjectRequirements(row.requirements),
  };
}

export async function fetchBackendProjects(character?: string): Promise<BackendProject[]> {
  const url = `${getBackendUrl()}/api/projects`;
  const query = character ? `?character=${encodeURIComponent(character)}` : "";
  const response = await fetch(`${url}${query}`, { cache: "no-store" });
  const payload = (await response.json()) as {
    status: string;
    projects: BackendProjectRow[];
    message?: string;
  };
  if (!response.ok || payload.status !== "ok") {
    throw new Error(payload.message ?? `Backend projects request failed with status ${response.status}`);
  }
  return payload.projects.map(mapBackendProjectRow);
}

/** Marks an enquiry as viewed on the backend (idempotent). */
export async function markBackendProjectViewed(projectId: number): Promise<void> {
  const response = await fetch(`${getBackendUrl()}/api/projects/${projectId}/view`, {
    method: "POST",
    cache: "no-store",
  });
  const payload = (await response.json()) as { status: string; message?: string };
  if (!response.ok || payload.status !== "ok") {
    throw new Error(payload.message ?? `Backend mark-viewed failed with status ${response.status}`);
  }
}

/** Accepts an enquiry on the backend: transitions the project character
 * enq -> pr. Idempotent: already-accepted projects return ok unchanged. */
export async function acceptBackendProject(projectId: number): Promise<string> {
  const response = await fetch(`${getBackendUrl()}/api/projects/${projectId}/accept`, {
    method: "POST",
    cache: "no-store",
  });
  const payload = (await response.json()) as {
    status: string;
    project_character?: string;
    message?: string;
  };
  if (!response.ok || payload.status !== "ok") {
    throw new Error(payload.message ?? `Backend accept failed with status ${response.status}`);
  }
  return payload.project_character ?? "pr";
}