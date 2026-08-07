import {
  StudioAuditEvent,
  StudioComment,
  StudioOutputVersion,
  StudioProjectOption,
  StudioTask,
  StudioUseCaseDefinition,
} from "@/types/domain/studio";

export interface IStudioRepository {
  getAvailableProjects(query?: string): Promise<StudioProjectOption[]>;
  getProjectById(projectId: string): Promise<StudioProjectOption | null>;
  getUseCaseDefinitions(): StudioUseCaseDefinition[];
  getUseCaseDefinition(useCaseId: string): StudioUseCaseDefinition | undefined;
  getTaskById(taskId: string): Promise<StudioTask | null>;
  getTaskVersion(versionId: string): Promise<StudioOutputVersion | null>;
  getLatestTaskVersion(taskId: string): Promise<StudioOutputVersion | null>;
  getAllTaskVersions(taskId: string): Promise<StudioOutputVersion[]>;
  saveTask(task: StudioTask, version: StudioOutputVersion): Promise<void>;
  updateTask(task: StudioTask): Promise<void>;
  saveVersion(version: StudioOutputVersion): Promise<void>;
  getAuditEvents(taskId: string): Promise<StudioAuditEvent[]>;
  addAuditEvent(event: StudioAuditEvent): Promise<void>;
  getComments(taskId: string): Promise<StudioComment[]>;
  addComment(comment: StudioComment): Promise<void>;
}
