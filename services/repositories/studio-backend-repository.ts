import {
  StudioAuditEvent,
  StudioComment,
  StudioOutputVersion,
  StudioProjectOption,
  StudioTask,
  StudioUseCaseDefinition,
} from "@/types/domain/studio";
import { IStudioRepository } from "./studio-repository";
import { getAuthToken } from "@/lib/auth/authed-fetch";

/** Maps a backend project to a StudioProjectOption. */
function mapBackendProjectToStudio(p: Record<string, unknown>): StudioProjectOption {
  const id = String(p.id ?? p.project_id ?? "");
  const name = String(p.project_name ?? p.projectName ?? "Unnamed Project");
  const projectType = String(p.project_type ?? p.projectType ?? "Project");
  const status = String(p.project_status ?? p.projectStatus ?? "upcoming");
  const location = String(
    p.place ?? p.site_place ?? p.location ?? p.client_name ?? ""
  );
  const phase = String(p.project_character ?? p.projectCharacter ?? "enq") === "enq"
    ? "Proposal"
    : String(p.project_status ?? p.projectStatus ?? "upcoming") === "converted"
      ? "Execution"
      : "Design Development";

  return {
    id,
    workspaceId: "ws-kallisto",
    code: `PRJ-${id}`,
    name,
    projectType,
    phase,
    location,
    status: status === "converted" ? "active" : status,
    lastActivityAt: new Date().toISOString(),
  };
}

/** Production repository that fetches projects from the backend and falls
 *  back to mock data for studio-specific features (tasks, versions, audit)
 *  until those endpoints are fully implemented. */
export class StudioBackendRepository implements IStudioRepository {
  private _mock: IStudioRepository;

  constructor(mockFallback: IStudioRepository) {
    this._mock = mockFallback;
  }

  async getAvailableProjects(): Promise<StudioProjectOption[]> {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(
        `${window.location.origin}/api/projects`,
        { headers, cache: "no-store" }
      );
      if (!res.ok) throw new Error(`Projects fetch failed: ${res.status}`);
      const payload = (await res.json()) as {
        status: string;
        projects: Record<string, unknown>[];
      };
      if (payload.status !== "ok" || !Array.isArray(payload.projects)) {
        throw new Error("Invalid projects response");
      }
      const mapped = payload.projects.map(mapBackendProjectToStudio);
      if (mapped.length > 0) return mapped;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("Studio backend project fetch failed, falling back to mock:", error);
    }
    return this._mock.getAvailableProjects();
  }

  async getProjectById(projectId: string): Promise<StudioProjectOption | null> {
    const projects = await this.getAvailableProjects();
    return projects.find((p) => p.id === projectId) ?? null;
  }

  getUseCaseDefinitions(): StudioUseCaseDefinition[] {
    return this._mock.getUseCaseDefinitions();
  }

  getUseCaseDefinition(useCaseId: string): StudioUseCaseDefinition | undefined {
    return this._mock.getUseCaseDefinition(useCaseId);
  }

  async getTaskById(taskId: string): Promise<StudioTask | null> {
    return this._mock.getTaskById(taskId);
  }

  async getTaskVersion(versionId: string): Promise<StudioOutputVersion | null> {
    return this._mock.getTaskVersion(versionId);
  }

  async getLatestTaskVersion(taskId: string): Promise<StudioOutputVersion | null> {
    return this._mock.getLatestTaskVersion(taskId);
  }

  async getAllTaskVersions(taskId: string): Promise<StudioOutputVersion[]> {
    return this._mock.getAllTaskVersions(taskId);
  }

  async saveTask(task: StudioTask, version: StudioOutputVersion): Promise<void> {
    return this._mock.saveTask(task, version);
  }

  async updateTask(task: StudioTask): Promise<void> {
    return this._mock.updateTask(task);
  }

  async saveVersion(version: StudioOutputVersion): Promise<void> {
    return this._mock.saveVersion(version);
  }

  async getAuditEvents(taskId: string): Promise<StudioAuditEvent[]> {
    return this._mock.getAuditEvents(taskId);
  }

  async addAuditEvent(event: StudioAuditEvent): Promise<void> {
    return this._mock.addAuditEvent(event);
  }

  async getComments(taskId: string): Promise<StudioComment[]> {
    return this._mock.getComments(taskId);
  }

  async addComment(comment: StudioComment): Promise<void> {
    return this._mock.addComment(comment);
  }
}
