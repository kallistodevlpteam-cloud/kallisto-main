import type { BackendProject } from "@/types/domain/backend-project";
import type { EnquiryRecord, ProjectType } from "../types/enquiry.types";

const PROJECT_TYPE_FALLBACK: Record<string, ProjectType> = {
  Residential: "residential",
  Commercial: "commercial",
  Office: "commercial",
  Industrial: "commercial",
  "Mixed Use": "multi_family",
};

const DEFAULT_THUMBNAIL = "/assets/projects/greenfield-villa.png";

export function mapBackendProjectType(project: BackendProject): ProjectType {
  if (!project.projectType) {
    return "residential";
  }
  return PROJECT_TYPE_FALLBACK[project.projectType] ?? "residential";
}

/**
 * Builds enquiry records purely from the backend project list.
 *
 * Fields the projects query returns are mapped onto the enquiry record:
 * project name, project type, brief description, cover image, creation
 * date, linked client name (client_details) and site place (project_site).
 * Enquiry-specific fields with no backend source get neutral defaults.
 */
export function buildEnquiriesFromProjects(projects: BackendProject[]): EnquiryRecord[] {
  return projects.map((project) => ({
    id: `prj-${project.id}`,
    title: project.projectName.trim(),
    requirementSummary: project.briefDescription ?? "",
    clientName: project.clientName || "—",
    location: project.place || "—",
    thumbnailUrl: project.coverImageUrl ?? DEFAULT_THUMBNAIL,
    source: "website",
    status: "active",
    stage: "new",
    projectType: mapBackendProjectType(project),
    budgetMin: 0,
    budgetMax: 0,
    receivedAt: project.createdAt || project.updatedAt,
    nextAction: { type: "review_enquiry", label: "Review enquiry" },
  }));
}