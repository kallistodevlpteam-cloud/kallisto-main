import type { TursoSchemaSnapshot } from "@/types/domain/turso-schema";
import type { BackendProject } from "@/types/domain/backend-project";

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
  client_name: string | null;
  place: string | null;
  created_at: string | null;
  updated_at: string | null;
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
    clientName: row.client_name,
    place: row.place,
    createdAt: row.created_at ?? "",
    updatedAt: row.updated_at ?? "",
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