import {
  AddBoqItemInput,
  BoqItem,
  ProjectBoqSnapshot,
  UpdateBoqItemInput,
} from "@/types/domain/project-boq";

export interface ProjectBoqRepository {
  getByProjectId(
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
