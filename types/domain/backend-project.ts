export const PROJECT_CHARACTER_ENQ = "enq";

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
  clientName: string | null;
  place: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackendProjectsResponse {
  status: string;
  projects: BackendProject[];
  message?: string;
}