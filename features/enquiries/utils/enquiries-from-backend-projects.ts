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
 * string used by the enquiry record.
 */
function toEpochUtc(epochSeconds: number | string | null | undefined): string {
  if (epochSeconds == null) {
    return "";
  }
  if (typeof epochSeconds === "string" && epochSeconds.includes("T")) {
    return epochSeconds;
  }
  const parsed = typeof epochSeconds === "number" ? epochSeconds : Number(epochSeconds);
  if (!Number.isFinite(parsed)) return "";
  const ms = parsed > 1e11 ? parsed : parsed * 1000;
  return new Date(ms).toISOString();
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
      backendProjectType: project.projectType,
      budgetMin: budgetAmount ?? 0,
      budgetMax: budgetAmount ?? 0,
      budget: budgetAmount != null ? formatEnquiryBudgetValue(budgetAmount) : undefined,
      receivedAt: toEpochUtc(project.createdAt),
      viewed: project.viewed === true,
      builtUpArea: formatSqArea(project.sqArea),
      timeline: project.clientExpectedTimeline ?? undefined,
      inspirationImages: (project.inspirationImages ?? []).map((image) => ({
        url: image.url,
        alt: image.alt,
      })),
      projectDocuments: (project.projectDocuments ?? []).flatMap((doc) => {
        if (!doc.name) return [];
        return [{ id: doc.id, name: doc.name, docImageUrl: doc.docImageUrl }];
      }),
      siteImages: project.siteImages ?? [],
      projectScopes: (project.projectScopes ?? []).map((scope) => ({
        id: scope.id,
        scope_name: scope.scope_name,
        items: scope.items ?? [],
      })),
      requirementsList: (project.requirements ?? []).map((requirement) => ({
        id: requirement.id,
        requirement_name: requirement.requirement_name,
        items: requirement.items ?? [],
      })),
      // Map extended context fields from backend project tables
      accessibilityNeeds: project.projectClients?.accessibility_requirements ?? undefined,
      workFromHomeUsers: project.projectClients?.work_from_home ?? undefined,
      entertainingFrequency: project.projectLifestyle?.entertain_guests ?? undefined,
      outdoorUsage: project.projectLifestyle?.outdoor_activities ?? undefined,
      privacyNeeds: project.projectLifestyle?.privacy_importance ?? undefined,
      kitchenPattern: undefined, // not directly mapped in current schema
      maintenancePreference: undefined, // not directly mapped in current schema
      decisionMaker: project.projectApprovalProcess?.primary_decision_maker ?? undefined,
      signOffAuthority: project.projectApprovalProcess?.primary_decision_maker ?? undefined,
      budgetAuthority: undefined, // not directly mapped
      revisionExpectations: project.projectApprovalProcess?.expected_revision_rounds ?? undefined,
      decisionTurnaround: project.projectApprovalProcess?.approval_turnaround_time ?? undefined,
      primaryChannel: project.projectCommunication?.preferred_contact ?? undefined,
      reviewFrequency: project.projectCommunication?.meeting_frequency ?? undefined,
      reviewFormat: undefined, // not directly mapped
      siteMeetingFrequency: undefined, // not directly mapped
      responseTurnaround: undefined, // not directly mapped
      familyMembers: (project.familyMembers ?? []).map((member) => ({
        familyId: member.familyId,
        name: member.name,
        age: member.age,
        job: member.job,
        relation: member.relation,
      })),
      nextAction: { type: "review_enquiry", label: "Review enquiry" },
    };
  });
}