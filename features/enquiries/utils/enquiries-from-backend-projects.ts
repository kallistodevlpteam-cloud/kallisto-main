import type { BackendProject } from "@/types/domain/backend-project";
import type { EnquiryRecord, ProjectType } from "../types/enquiry.types";
import { formatEnquiryBudgetValue } from "./format-enquiry-budget";

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

/** Normalizes the budget value at the application boundary: the column is
 * TEXT in the database, so the backend may send a numeric string. */
function parseBudgetAmount(value: number | string | null | undefined): number | null {
  if (value == null || value === "") {
    return null;
  }
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Converts the projects.created_at Unix epoch seconds to the ISO-8601 UTC
 * string used by the enquiry record. The received date is strictly the
 * backend ``created_at`` column; there is no fallback to ``updated_at``
 * or to any client-provided value.
 */
function toEpochUtc(epochSeconds: number | null | undefined): string {
  if (epochSeconds == null) {
    return "";
  }
  const ms = epochSeconds * 1000;
  return Number.isFinite(ms) ? new Date(ms).toISOString() : "";
}

/** Formats the sq_area INTEGER (square feet) at the application boundary. */
function formatSqArea(sqFeet: number | null | undefined): string | undefined {
  if (sqFeet == null || !Number.isFinite(sqFeet)) {
    return undefined;
  }
  return `${sqFeet.toLocaleString("en-IN")} sq ft`;
}

/**
 * Builds enquiry records purely from the backend project list.
 *
 * Fields the projects query returns are mapped onto the enquiry record:
 * project name, project type, brief description, cover image, creation
 * date, linked client name (client_details), site place (project_site)
 * and estimated overall budget (project_budget).
 * Enquiry-specific fields with no backend source get neutral defaults.
 */
export function buildEnquiriesFromProjects(projects: BackendProject[]): EnquiryRecord[] {
  return projects.map((project) => {
    const budgetAmount = parseBudgetAmount(project.estimatedOverallBudget);
    return {
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
      budget: budgetAmount != null ? formatEnquiryBudgetValue(budgetAmount) : undefined,
      receivedAt: toEpochUtc(project.createdAt),
      viewed: project.viewed === true,
      sqArea: formatSqArea(project.sqArea),
      timeline: project.clientExpectedTimeline ?? undefined,
      inspirationImages: (project.inspirationImages ?? []).map((image) => ({
        url: image.url,
        alt: image.alt,
      })),
      documents: (project.projectDocuments ?? []).map((doc) => ({
        id: doc.id,
        name: doc.name,
        docImageUrl: doc.docImageUrl,
      })),
      siteImages: project.siteImages ?? [],
      projectScopes: (project.projectScopes ?? []).map((scope) => ({
        id: scope.id,
        scope_name: scope.scope_name,
        items: scope.items ?? [],
      })),
      nextAction: { type: "review_enquiry", label: "Review enquiry" },
    };
  });
}