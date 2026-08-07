import {
  AddBoqItemInput,
  BoqItem,
  ProjectBoqSnapshot,
  UpdateBoqItemInput,
} from "@/types/domain/project-boq";
import { MemoryProjectBoqRepository } from "../repositories/memory-project-boq.repository";
import { ProjectBoqRepository } from "../repositories/project-boq.repository";

export interface ProjectBoqService {
  getProjectBoq(
    projectId: string,
    projectName: string,
    projectCode: string
  ): Promise<ProjectBoqSnapshot>;
  updateItem(
    projectId: string,
    input: UpdateBoqItemInput
  ): Promise<BoqItem>;
  addItem(projectId: string, input: AddBoqItemInput): Promise<BoqItem>;
}

export function createProjectBoqService(
  repository: ProjectBoqRepository
): ProjectBoqService {
  return {
    getProjectBoq: (projectId, projectName, projectCode) =>
      repository.getByProjectId(projectId, projectName, projectCode),
    updateItem: (projectId, input) =>
      repository.updateItem(projectId, input),
    addItem: (projectId, input) => repository.addItem(projectId, input),
  };
}

export const projectBoqService = createProjectBoqService(
  new MemoryProjectBoqRepository()
);
