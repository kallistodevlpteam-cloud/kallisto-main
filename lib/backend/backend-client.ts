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

function getBackendUrl(): string {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    throw new Error("BACKEND_URL must be configured in the frontend server environment.");
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
export async function backendFetch(
  url: string,
  options: RequestInit = {},
  authToken?: string
): Promise<Response> {
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  if (authToken) {
    const token = authToken.startsWith("Bearer ") ? authToken.slice(7) : authToken;
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
}

export async function fetchBackendHealth(): Promise<{ status: string; database: string }> {
  const response = await backendFetch(`${getBackendUrl()}/api/health`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Backend health check failed with status ${response.status}`);
  }
  return (await response.json()) as { status: string; database: string };
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
  const response = await backendFetch(`${getBackendUrl()}/api/auth/me`, { cache: "no-store" }, authToken);
  return (await response.json()) as {
    status: string;
    email?: string;
    sp_id?: string;
    provider_name?: string;
    message?: string;
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
  const url = `${getBackendUrl()}/api/projects`;
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
  if (!response.ok || payload.status !== "ok") {
    throw new BackendError(
      payload.message ?? `Backend projects request failed with status ${response.status}`,
      response.status
    );
  }
  return payload.projects.map(mapBackendProjectRow);
}

export async function fetchBackendProjectById(projectId: string | number, authToken?: string): Promise<BackendProject> {
  const url = `${getBackendUrl()}/api/projects/${projectId}`;
  const response = await backendFetch(url, { cache: "no-store" }, authToken);
  const payload = (await response.json()) as {
    status: string;
    project: BackendProjectRow;
    message?: string;
  };
  if (!response.ok || payload.status !== "ok") {
    throw new BackendError(
      payload.message ?? `Backend project detail request failed with status ${response.status}`,
      response.status
    );
  }
  return mapBackendProjectRow(payload.project);
}

/** Marks an enquiry as viewed on the backend (idempotent). */
export async function markBackendProjectViewed(projectId: number, authToken?: string): Promise<void> {
  const response = await backendFetch(`${getBackendUrl()}/api/projects/${projectId}/view`, {
    method: "POST",
    cache: "no-store",
  }, authToken);
  const payload = (await response.json()) as { status: string; message?: string };
  if (!response.ok || payload.status !== "ok") {
    throw new BackendError(
      payload.message ?? `Backend mark-viewed failed with status ${response.status}`,
      response.status
    );
  }
}

/** Accepts an enquiry on the backend: transitions the project character
 * enq -> pr. Idempotent: already-accepted projects return ok unchanged. */
export async function acceptBackendProject(projectId: number, authToken?: string): Promise<string> {
  const response = await backendFetch(`${getBackendUrl()}/api/projects/${projectId}/accept`, {
    method: "POST",
    cache: "no-store",
  }, authToken);
  const payload = (await response.json()) as {
    status: string;
    project_character?: string;
    message?: string;
  };
  if (!response.ok || payload.status !== "ok") {
    throw new BackendError(
      payload.message ?? `Backend accept failed with status ${response.status}`,
      response.status
    );
  }
  return payload.project_character ?? "pr";
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
  const response = await backendFetch(
    `${getBackendUrl()}/api/projects/${projectId}/reject`,
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
  if (!response.ok || payload.status !== "ok") {
    throw new BackendError(
      payload.message ?? `Backend reject failed with status ${response.status}`,
      response.status
    );
  }
  return payload.project_character ?? "rej";
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
  const response = await backendFetch(
    `${getBackendUrl()}/api/projects/${projectId}/convert`,
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
    if (!response.ok || payload.status !== "ok") {
    throw new BackendError(
      payload.message ?? `Backend convert failed with status ${response.status}`,
      response.status
    );
  }
  return payload;
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
  const response = await backendFetch(
    `${getBackendUrl()}/api/projects/${projectId}/proposal`,
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
  if (!response.ok || payload.status !== "ok") {
    throw new BackendError(
      payload.message ?? `Backend proposal create failed with status ${response.status}`,
      response.status
    );
  }
  return payload;
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
  const response = await backendFetch(
    `${getBackendUrl()}/api/projects/${projectId}/proposal/send`,
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
  if (!response.ok || payload.status !== "ok") {
    throw new BackendError(
      payload.message ?? `Backend proposal send failed with status ${response.status}`,
      response.status
    );
  }
  return payload;
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
  const response = await backendFetch(
    `${getBackendUrl()}/api/projects/${projectId}/proposal/respond`,
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
  if (!response.ok || payload.status !== "ok") {
    throw new BackendError(
      payload.message ?? `Backend proposal respond failed with status ${response.status}`,
      response.status
    );
  }
  return payload;
}

// ── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardData {
  status: string;
  active_projects: Array<{
    id: number;
    name: string;
    type: string;
    status: string;
    character: string;
    coverImageUrl: string | null;
    clientName: string | null;
    location: string | null;
    updatedAt: number | null;
  }>;
  needs_attention: Array<{
    id: number;
    projectId: number;
    title: string;
    status: string;
    priority: string;
    dueDate: string | null;
    phase: string | null;
    type: string;
    financialExposure?: number;
  }>;
  pipeline: Array<{
    id: number;
    name: string;
    type: string;
    clientName: string | null;
    location: string | null;
    budget: number | string | null;
    createdAt: number | null;
  }>;
  schedule_preview: Array<{
    id: number;
    projectId: number;
    title: string;
    dueDate: string | null;
    phase: string | null;
    status: string;
    type: string;
  }>;
  recent_activities: Array<{
    id: number;
    projectId: number;
    type: string;
    title: string;
    actor: string | null;
    createdAt: string;
  }>;
}

export async function fetchBackendDashboard(authToken?: string): Promise<DashboardData> {
  const response = await backendFetch(`${getBackendUrl()}/api/dashboard`, { cache: "no-store" }, authToken);
  const payload = (await response.json()) as DashboardData & { message?: string };
  if (!response.ok || payload.status !== "ok") {
    throw new BackendError(
      payload.message ?? `Backend dashboard request failed with status ${response.status}`,
      response.status
    );
  }
  return payload;
}

// ── Tasks ───────────────────────────────────────────────────────────────────

export interface BackendTask {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignee_id: string | null;
  assignee_name: string | null;
  due_date: string | null;
  completed_at: string | null;
  phase: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  sort_order: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export async function fetchBackendTasks(projectId: number | string, authToken?: string): Promise<{ status: string; tasks: BackendTask[] }> {
  const response = await backendFetch(`${getBackendUrl()}/api/projects/${projectId}/tasks`, { cache: "no-store" }, authToken);
  return (await response.json()) as { status: string; tasks: BackendTask[] };
}

export async function createBackendTask(
  projectId: number | string,
  task: Partial<BackendTask>,
  authToken?: string
): Promise<{ status: string; task_created: boolean }> {
  const response = await backendFetch(
    `${getBackendUrl()}/api/projects/${projectId}/tasks`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(task), cache: "no-store" },
    authToken
  );
  return (await response.json()) as { status: string; task_created: boolean };
}

export async function updateBackendTask(
  projectId: number | string,
  taskId: number,
  updates: Partial<BackendTask>,
  authToken?: string
): Promise<{ status: string; updated: boolean }> {
  const response = await backendFetch(
    `${getBackendUrl()}/api/projects/${projectId}/tasks/${taskId}`,
    { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates), cache: "no-store" },
    authToken
  );
  return (await response.json()) as { status: string; updated: boolean };
}

// ── Events (Timeline) ───────────────────────────────────────────────────────

export interface BackendProjectEvent {
  id: number;
  event_type: string;
  title: string;
  description: string | null;
  status: string | null;
  due_date: string | null;
  completed_at: string | null;
  actor_id: string;
  actor_name: string | null;
  metadata: unknown;
  parent_event_id: number | null;
  sort_order: number;
  created_at: string;
}

export async function fetchBackendEvents(projectId: number | string, authToken?: string): Promise<{ status: string; events: BackendProjectEvent[] }> {
  const response = await backendFetch(`${getBackendUrl()}/api/projects/${projectId}/events`, { cache: "no-store" }, authToken);
  return (await response.json()) as { status: string; events: BackendProjectEvent[] };
}

// ── Milestones ────────────────────────────────────────────────────────────────

export interface BackendMilestone {
  id: number;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  completed_at: string | null;
  approval_status: string | null;
  financial_impact: number;
  actor_id: string | null;
  actor_name: string | null;
  sort_order: number;
  created_at: string;
}

export async function fetchBackendMilestones(projectId: number | string, authToken?: string): Promise<{ status: string; milestones: BackendMilestone[] }> {
  const response = await backendFetch(`${getBackendUrl()}/api/projects/${projectId}/milestones`, { cache: "no-store" }, authToken);
  return (await response.json()) as { status: string; milestones: BackendMilestone[] };
}

// ── BOQ ───────────────────────────────────────────────────────────────────────

export interface BackendBoqItem {
  id: number;
  category: string;
  item_code: string | null;
  item_name: string;
  description: string | null;
  uom: string | null;
  quantity: number;
  rate: number;
  total: number;
  status: string;
  revision: number;
  vendor: string | null;
  notes: string | null;
  sort_order: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export async function fetchBackendBoq(projectId: number | string, authToken?: string): Promise<{ status: string; items: BackendBoqItem[] }> {
  const response = await backendFetch(`${getBackendUrl()}/api/projects/${projectId}/boq`, { cache: "no-store" }, authToken);
  return (await response.json()) as { status: string; items: BackendBoqItem[] };
}

export async function createBackendBoqItem(
  projectId: number | string,
  item: Partial<BackendBoqItem>,
  authToken?: string
): Promise<{ status: string; boq_item_created: boolean }> {
  const response = await backendFetch(
    `${getBackendUrl()}/api/projects/${projectId}/boq`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item), cache: "no-store" },
    authToken
  );
  return (await response.json()) as { status: string; boq_item_created: boolean };
}

export async function updateBackendBoqItem(
  projectId: number | string,
  itemId: number,
  updates: Partial<BackendBoqItem>,
  authToken?: string
): Promise<{ status: string; updated: boolean }> {
  const response = await backendFetch(
    `${getBackendUrl()}/api/projects/${projectId}/boq/${itemId}`,
    { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates), cache: "no-store" },
    authToken
  );
  return (await response.json()) as { status: string; updated: boolean };
}

// ── Audit ─────────────────────────────────────────────────────────────────────

export interface BackendAuditEntry {
  id: number;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_type: string;
  actor_id: string;
  metadata: unknown;
  ip_address: string | null;
  created_at: string;
}

export async function fetchBackendAudit(projectId: number | string, authToken?: string): Promise<{ status: string; audit: BackendAuditEntry[] }> {
  const response = await backendFetch(`${getBackendUrl()}/api/projects/${projectId}/audit`, { cache: "no-store" }, authToken);
  return (await response.json()) as { status: string; audit: BackendAuditEntry[] };
}