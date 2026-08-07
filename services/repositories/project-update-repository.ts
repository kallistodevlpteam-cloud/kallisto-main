import {
  ProjectUpdate,
  ProjectUpdatePage,
  ProjectUpdateReply,
  ListProjectUpdatesInput,
  CreateProjectUpdateInput,
  CreateProjectUpdateReplyInput,
} from "@/types/domain/project-update";

export interface ProjectUpdateRepository {
  list(input: ListProjectUpdatesInput): Promise<ProjectUpdatePage>;
  getById(updateId: string): Promise<ProjectUpdate | null>;
  create(input: CreateProjectUpdateInput): Promise<ProjectUpdate>;
  acknowledge(updateId: string, userId: string): Promise<ProjectUpdate>;
  save(updateId: string, userId: string): Promise<ProjectUpdate>;
  togglePin(updateId: string, pinnedBy?: string): Promise<ProjectUpdate>;
  createReply(input: CreateProjectUpdateReplyInput): Promise<{ update: ProjectUpdate; reply: ProjectUpdateReply }>;
  delete(updateId: string): Promise<boolean>;
}
