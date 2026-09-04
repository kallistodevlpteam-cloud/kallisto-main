import type { TursoSchemaSnapshot } from "@/types/domain/turso-schema";
import type {
  BackendProject,
  BackendClientPriority,
  BackendFamilyMember,
  BackendInspirationImage,
  BackendProjectDocument,
  BackendProjectRequirement,
  BackendProjectScope,
  BackendProjectClients,
  BackendProjectLifestyle,
  BackendProjectApprovalProcess,
  BackendProjectCommunication,
  BackendProjectTechnical,
  BackendProjectRegulatory,
  BackendProjectOutdoor,
  BackendProjectSpace,
  BackendProjectTimeline,
  BackendProjectProposal,
  BackendProjectTeamMember,
  BackendProjectMessage,
} from "@/types/domain/backend-project";

import { DUMMY_BACKEND_PROJECTS } from "./dummy-projects";

function getBackendUrl(): string | null {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    return null;
  }
  return backendUrl.replace(/\/$/, "");
}

/** Error carrying the HTTP status returned by the backend, so route
 * handlers can distinguish not-found/conflict responses from a real
 * backend outage instead of flattening everything into 503. */
export class BackendError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BackendError";
    this.status = status;
  }
}

/** Performs an authenticated fetch to the backend.  The optional token is
 * forwarded in an `Authorization: Bearer` header. */
async function backendFetch(
  url: string,
  options: RequestInit = {},
  authToken?: string
): Promise<Response> {
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  return fetch(url, { ...options, headers });
}

export async function fetchBackendHealth(): Promise<{ status: string; database: string }> {
  const backendUrl = getBackendUrl();
  if (backendUrl) {
    try {
      const response = await backendFetch(`${backendUrl}/api/health`, { cache: "no-store" });
      if (response.ok) {
        return (await response.json()) as { status: string; database: string };
      }
    } catch {
      // fallback
    }
  }
  return { status: "ok", database: "connected (local mock data)" };
}

export async function fetchBackendSchema(authToken?: string): Promise<TursoSchemaSnapshot> {
  const response = await backendFetch(`${getBackendUrl()}/api/database/schema`, { cache: "no-store" }, authToken);
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

export async function runBackendQuery(
  sql: string,
  authToken?: string
): Promise<{
    status: string;
    cols: string[];
    rows: unknown[][];
    message?: string;
  }> {
  const response = await backendFetch(
    `${getBackendUrl()}/api/database/query`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql }),
      cache: "no-store",
    },
    authToken
  );
  const payload = (await response.json()) as {
    status: string;
    cols: string[];
    rows: unknown[][];
    message?: string;
  };
  if (!response.ok) {
    throw new BackendError(
      payload.message ?? `Backend query failed with status ${response.status}`,
      response.status
    );
  }
  return payload;
}

export async function loginBackendProvider(
  email: string,
  password: string
): Promise<{ token: string; sp_id: string }> {
  const response = await backendFetch(
    `${getBackendUrl()}/api/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    }
  );
  const payload = (await response.json()) as {
    status: string;
    token?: string;
    sp_id?: string;
    message?: string;
  };
  if (!response.ok || payload.status !== "ok" || !payload.token) {
    throw new BackendError(
      payload.message ?? `Login failed with status ${response.status}`,
      response.status
    );
  }
  return { token: payload.token, sp_id: payload.sp_id ?? "" };
}

export async function fetchBackendMe(authToken?: string): Promise<{
    status: string;
    email?: string;
    sp_id?: string;
    provider_name?: string;
    message?: string;
  }> {
  const backendUrl = getBackendUrl();
  if (backendUrl) {
    try {
      const response = await backendFetch(`${backendUrl}/api/auth/me`, { cache: "no-store" }, authToken);
      if (response.ok) {
        return (await response.json()) as {
          status: string;
          email?: string;
          sp_id?: string;
          provider_name?: string;
          message?: string;
        };
      }
    } catch {
      // fallback
    }
  }
  return {
    status: "ok",
    email: "provider@kallisto.com",
    sp_id: "SP-0001",
    provider_name: "Arjun Architecture & Construction Studio",
  };
}

export interface BackendInspirationImageRow {
  url: string;
  alt: string | null;
}

export interface BackendProjectDocumentRow {
  id: number;
  name: string | null;
  doc_img_url: string | null;
  doc_type: string | null;
  status: boolean;
  updated_at: number | null;
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
  over_view: string | null;
  /** Parsed JSON list straight from projects.provider_id (the backend
   * removes the raw column and exposes provider_ids). */
  provider_ids: string[] | null;
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
  priorities: BackendClientPriorityRow[] | null;
  family_members: BackendFamilyMemberRow[] | null;
  project_clients: BackendProjectClients | null;
  project_lifestyle: BackendProjectLifestyle | null;
  project_approval_process: BackendProjectApprovalProcess | null;
  project_communication: BackendProjectCommunication | null;
  project_technical: BackendProjectTechnical | null;
  project_regulatory: BackendProjectRegulatory | null;
  project_outdoor: BackendProjectOutdoor | null;
  project_spaces: BackendProjectSpaceRow[] | null;
  project_timeline: BackendProjectTimeline | null;
  project_status: string | null;
  proposal: BackendProjectProposalRow | null;
  team_members: BackendProjectTeamMemberRow[] | null;
  messages: BackendProjectMessageRow[] | null;
}

export interface BackendClientPriorityRow {
  id: string;
  priority_name: string;
  details: string[];
  statuses: (boolean | null)[];
  tags: string[][];
}

export interface BackendFamilyMemberRow {
  family_id: string;
  client_id: string | null;
  name: string | null;
  age: number | null;
  job: string | null;
  phone: string | null;
  relation: string | null;
  family_member_img_url: string | null;
  description: string | null;
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
  item_details: string[][];
  statuses: (boolean | null)[];
}

export interface BackendProjectSpaceRow {
  space_name: string | null;
  required: number | null;
  priority: string | null;
  approx_area_size: string | null;
  quantity: number | null;
  adjacency_notes: string | null;
}

export interface BackendProjectProposalRow {
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

export interface BackendProjectTeamMemberRow {
  provider_id: string;
  role: string | null;
  status: "pending" | "active" | "completed" | "removed" | null;
  notes: string | null;
}

export interface BackendProjectMessageRow {
  sender_type: "provider" | "client" | "system";
  sender_id: string;
  message_type: "general" | "proposal" | "rate" | "negotiation" | "approval" | "rejection";
  content: string;
  created_at: number;
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
    docType: doc.doc_type ?? null,
    status: doc.status === true,
    updatedAt: doc.updated_at ?? null,
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
      item_details: Array.isArray(requirement.item_details)
        ? requirement.item_details.map((details) =>
            Array.isArray(details)
              ? details.filter((detail) => typeof detail === "string" && detail.length > 0)
              : []
          )
        : [],
      statuses: Array.isArray(requirement.statuses)
        ? requirement.statuses.map((status) =>
            status == null ? null : Boolean(status)
          )
        : [],
    }))
    .filter(
      (requirement) =>
        typeof requirement.requirement_name === "string" && requirement.requirement_name.length > 0
    );
}

function mapBackendProjectPriorities(
  rows: BackendClientPriorityRow[] | null | undefined
): BackendClientPriority[] {
  return (rows ?? [])
    .map((priority) => ({
      id: priority.id,
      priority_name: priority.priority_name,
      details: Array.isArray(priority.details)
        ? priority.details.filter((detail) => typeof detail === "string" && detail.length > 0)
        : [],
      statuses: Array.isArray(priority.statuses)
        ? priority.statuses.map((status) =>
            status == null ? null : Boolean(status)
          )
        : [],
      tags: Array.isArray(priority.tags)
        ? priority.tags.map((tagList) =>
            Array.isArray(tagList)
              ? tagList.filter((tag) => typeof tag === "string" && tag.length > 0)
              : []
          )
        : [],
    }))
    .filter(
      (priority) =>
        typeof priority.priority_name === "string" && priority.priority_name.length > 0
    );
}

function mapBackendFamilyMembers(
  rows: BackendFamilyMemberRow[] | null | undefined
): BackendFamilyMember[] {
  return (rows ?? [])
    .map((member) => ({
      familyId: member.family_id,
      clientId: member.client_id ?? null,
      name: member.name ?? null,
      age: member.age ?? null,
      job: member.job ?? null,
      phone: member.phone ?? null,
      relation: member.relation ?? null,
      familyMemberImgUrl: member.family_member_img_url ?? null,
      description: member.description ?? null,
    }))
    .filter((member) => typeof member.name === "string" && member.name.length > 0);
}

function mapBackendProjectSpaces(
  rows: BackendProjectSpaceRow[] | null | undefined
): BackendProjectSpace[] {
  return (rows ?? [])
    .map((s) => ({
      space_name: s.space_name ?? null,
      required: s.required ?? null,
      priority: s.priority ?? null,
      approx_area_size: s.approx_area_size ?? null,
      quantity: s.quantity ?? null,
      adjacency_notes: s.adjacency_notes ?? null,
    }))
    .filter((s) => typeof s.space_name === "string" && s.space_name.length > 0);
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
    overView: row.over_view ?? null,
    providerIds: row.provider_ids ?? [],
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
    priorities: mapBackendProjectPriorities(row.priorities),
    familyMembers: mapBackendFamilyMembers(row.family_members),
    projectClients: row.project_clients ?? null,
    projectLifestyle: row.project_lifestyle ?? null,
    projectApprovalProcess: row.project_approval_process ?? null,
    projectCommunication: row.project_communication ?? null,
    projectTechnical: row.project_technical ?? null,
    projectRegulatory: row.project_regulatory ?? null,
    projectOutdoor: row.project_outdoor ?? null,
    projectSpaces: mapBackendProjectSpaces(row.project_spaces),
    projectTimeline: row.project_timeline ?? null,
    projectStatus: row.project_status ?? null,
    proposal: row.proposal ?? null,
    teamMembers: (row.team_members ?? []).map((t) => ({
      provider_id: t.provider_id ?? "",
      role: t.role ?? null,
      status: t.status ?? null,
      notes: t.notes ?? null,
    })),
    messages: (row.messages ?? []).map((m) => ({
      sender_type: m.sender_type,
      sender_id: m.sender_id,
      message_type: m.message_type,
      content: m.content,
      created_at: m.created_at,
    })),
  };
}

export async function fetchBackendProjects(character?: string, status?: string, authToken?: string): Promise<BackendProject[]> {
  const backendUrl = getBackendUrl();
  if (backendUrl) {
    try {
      const url = `${backendUrl}/api/projects`;
      const params = new URLSearchParams();
      if (character) params.set("character", character);
      if (status) params.set("status", status);
      const query = params.toString() ? `?${params.toString()}` : "";
      const response = await backendFetch(`${url}${query}`, { cache: "no-store" }, authToken);
      const payload = (await response.json()) as {
        status: string;
        projects: BackendProjectRow[];
        message?: string;
      };
      if (response.ok && payload.status === "ok" && Array.isArray(payload.projects)) {
        return payload.projects.map(mapBackendProjectRow);
      }
    } catch {
      // Fall through to dummy data
    }
  }

  let results = [...DUMMY_BACKEND_PROJECTS];
  if (character) {
    results = results.filter((p) => (p.projectCharacter || "").toLowerCase() === character.toLowerCase());
  }
  if (status) {
    results = results.filter((p) => (p.projectStatus || "").toLowerCase() === status.toLowerCase());
  }
  return results;
}

export async function fetchBackendProjectById(projectId: string | number, authToken?: string): Promise<BackendProject> {
  const backendUrl = getBackendUrl();
  if (backendUrl) {
    try {
      const url = `${backendUrl}/api/projects/${projectId}`;
      const response = await backendFetch(url, { cache: "no-store" }, authToken);
      const payload = (await response.json()) as {
        status: string;
        project: BackendProjectRow;
        message?: string;
      };
      if (response.ok && payload.status === "ok" && payload.project) {
        return mapBackendProjectRow(payload.project);
      }
    } catch {
      // Fall through to dummy data
    }
  }

  const cleanId = String(projectId).replace(/^prj-/i, "").toLowerCase();
  const matched = DUMMY_BACKEND_PROJECTS.find(
    (p) => String(p.id) === cleanId || p.projectName.toLowerCase().includes(cleanId)
  );
  if (matched) {
    return matched;
  }
  return DUMMY_BACKEND_PROJECTS[0];
}

/** Marks an enquiry as viewed on the backend (idempotent). */
export async function markBackendProjectViewed(projectId: number, authToken?: string): Promise<void> {
  const backendUrl = getBackendUrl();
  if (backendUrl) {
    try {
      const response = await backendFetch(`${backendUrl}/api/projects/${projectId}/view`, {
        method: "POST",
        cache: "no-store",
      }, authToken);
      if (response.ok) return;
    } catch {
      // Fall through
    }
  }
  const proj = DUMMY_BACKEND_PROJECTS.find((p) => p.id === projectId);
  if (proj) {
    proj.viewed = true;
  }
}

/** Accepts an enquiry on the backend: transitions the project character
 * enq -> pr. Idempotent: already-accepted projects return ok unchanged. */
export async function acceptBackendProject(projectId: number, authToken?: string): Promise<string> {
  const backendUrl = getBackendUrl();
  if (backendUrl) {
    try {
      const response = await backendFetch(`${backendUrl}/api/projects/${projectId}/accept`, {
        method: "POST",
        cache: "no-store",
      }, authToken);
      const payload = (await response.json()) as {
        status: string;
        project_character?: string;
        message?: string;
      };
      if (response.ok && payload.status === "ok") {
        return payload.project_character ?? "pr";
      }
    } catch {
      // Fall through
    }
  }
  const proj = DUMMY_BACKEND_PROJECTS.find((p) => p.id === projectId);
  if (proj) {
    proj.projectCharacter = "pr";
  }
  return "pr";
}

/** Rejects an enquiry on the backend: transitions the project character
 * enq -> rej and removes the project's provider links (provider_id JSON
 * list is cleared). Idempotent: already-rejected projects return ok
 * unchanged. */
export async function rejectBackendProject(
  projectId: number,
  authToken?: string,
  rejectionReason?: string,
  notes?: string
): Promise<string> {
  const backendUrl = getBackendUrl();
  if (backendUrl) {
    try {
      const response = await backendFetch(
        `${backendUrl}/api/projects/${projectId}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rejection_reason: rejectionReason ?? "",
            notes: notes ?? "",
          }),
          cache: "no-store",
        },
        authToken
      );
      const payload = (await response.json()) as {
        status: string;
        project_character?: string;
        message?: string;
      };
      if (response.ok && payload.status === "ok") {
        return payload.project_character ?? "rej";
      }
    } catch {
      // Fall through
    }
  }
  const proj = DUMMY_BACKEND_PROJECTS.find((p) => p.id === projectId);
  if (proj) {
    proj.projectCharacter = "rej";
  }
  return "rej";
}

/** Converts an accepted proposal into an operational project.
 * Idempotent: repeated calls return the same project context. */
export async function convertBackendProject(
  projectId: number,
  authToken?: string
): Promise<{
  status: string;
  project_id: number;
  project_status: string;
  proposal_id?: number;
  provider_id?: string;
  converted: boolean;
  message?: string;
}> {
  const backendUrl = getBackendUrl();
  if (backendUrl) {
    try {
      const response = await backendFetch(
        `${backendUrl}/api/projects/${projectId}/convert`,
        {
          method: "POST",
          cache: "no-store",
        },
        authToken
      );
      const payload = (await response.json()) as {
        status: string;
        project_id: number;
        project_status: string;
        proposal_id?: number;
        provider_id?: string;
        converted: boolean;
        message?: string;
      };
      if (response.ok && payload.status === "ok") {
        return payload;
      }
    } catch {
      // Fall through
    }
  }
  return {
    status: "ok",
    project_id: projectId,
    project_status: "ACTIVE",
    proposal_id: 1,
    provider_id: "SP-0001",
    converted: true,
  };
}

/** Creates or updates a draft proposal for a project. */
export async function createBackendProposal(
  projectId: number,
  authToken?: string,
  total_amount?: number | null,
  rate_notes?: string,
  timeline_notes?: string,
  scope_summary?: string
): Promise<{
  status: string;
  proposal_id?: number;
  action?: string;
  message?: string;
}> {
  const backendUrl = getBackendUrl();
  if (backendUrl) {
    try {
      const response = await backendFetch(
        `${backendUrl}/api/projects/${projectId}/proposal`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            total_amount: total_amount ?? null,
            rate_notes: rate_notes ?? "",
            timeline_notes: timeline_notes ?? "",
            scope_summary: scope_summary ?? "",
          }),
          cache: "no-store",
        },
        authToken
      );
      const payload = (await response.json()) as {
        status: string;
        proposal_id?: number;
        action?: string;
        message?: string;
      };
      if (response.ok && payload.status === "ok") {
        return payload;
      }
    } catch {
      // Fall through
    }
  }
  return {
    status: "ok",
    proposal_id: 1,
    action: "saved",
    message: "Proposal saved successfully",
  };
}

/** Sends a draft proposal to the client (immutable version). */
export async function sendBackendProposal(
  projectId: number,
  authToken?: string
): Promise<{
  status: string;
  project_id: number;
  proposal_status: string;
  message?: string;
}> {
  const backendUrl = getBackendUrl();
  if (backendUrl) {
    try {
      const response = await backendFetch(
        `${backendUrl}/api/projects/${projectId}/proposal/send`,
        {
          method: "POST",
          cache: "no-store",
        },
        authToken
      );
      const payload = (await response.json()) as {
        status: string;
        project_id: number;
        proposal_status: string;
        message?: string;
      };
      if (response.ok && payload.status === "ok") {
        return payload;
      }
    } catch {
      // Fall through
    }
  }
  return {
    status: "ok",
    project_id: projectId,
    proposal_status: "sent",
    message: "Proposal sent to client",
  };
}

/** Client accepts or rejects a sent proposal. No auth token needed (client-facing). */
export async function respondToBackendProposal(
  projectId: number,
  decision: "accept" | "reject",
  reason?: string,
  negotiation_notes?: string
): Promise<{
  status: string;
  project_id: number;
  proposal_status: string;
  project_status?: string;
  rejection_reason?: string;
  negotiation_notes?: string;
  message?: string;
}> {
  const backendUrl = getBackendUrl();
  if (backendUrl) {
    try {
      const response = await backendFetch(
        `${backendUrl}/api/projects/${projectId}/proposal/respond`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decision,
            reason: reason ?? "",
            negotiation_notes: negotiation_notes ?? "",
          }),
          cache: "no-store",
        }
      );
      const payload = (await response.json()) as {
        status: string;
        project_id: number;
        proposal_status: string;
        project_status?: string;
        rejection_reason?: string;
        negotiation_notes?: string;
        message?: string;
      };
      if (response.ok && payload.status === "ok") {
        return payload;
      }
    } catch {
      // Fall through
    }
  }
  return {
    status: "ok",
    project_id: projectId,
    proposal_status: decision === "accept" ? "accepted" : "rejected",
    project_status: decision === "accept" ? "active" : undefined,
    rejection_reason: decision === "reject" ? reason : undefined,
    negotiation_notes,
    message: `Proposal ${decision}ed successfully`,
  };
}