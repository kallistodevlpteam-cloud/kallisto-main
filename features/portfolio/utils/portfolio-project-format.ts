import type {
  ConstructionAreaUnit,
  ConstructionProjectStatus,
  ConstructionProjectType,
  ConstructionSiteAreaUnit,
  PortfolioProject,
} from "@/features/portfolio/types/portfolio.types";

const PROJECT_TYPE_LABELS: Record<ConstructionProjectType, string> = {
  residential: "Residential",
  commercial: "Commercial",
  interior: "Interior",
  renovation: "Renovation",
  hospitality: "Hospitality",
  retail: "Retail",
  institutional: "Institutional",
  landscape: "Landscape",
  multi_residential: "Multi-residential",
};

const PROJECT_CATEGORY_LABELS: Record<ConstructionProjectType, string> = {
  residential: "Residential architecture",
  commercial: "Commercial architecture",
  interior: "Interior design",
  renovation: "Renovation",
  hospitality: "Hospitality design",
  retail: "Retail interiors",
  institutional: "Institutional architecture",
  landscape: "Landscape architecture",
  multi_residential: "Multi-residential architecture",
};

const PROJECT_STATUS_LABELS: Record<ConstructionProjectStatus, string> = {
  draft: "Draft",
  concept: "Concept",
  design_development: "Design development",
  approval: "Approval",
  tender: "Tender",
  ongoing: "Ongoing",
  completed: "Completed",
  on_hold: "On hold",
  archived: "Archived",
};

const AREA_UNIT_LABELS: Record<ConstructionAreaUnit, string> = {
  sq_ft: "sq.ft",
  sq_m: "sq.m",
};

const SITE_AREA_UNIT_LABELS: Record<ConstructionSiteAreaUnit, string> = {
  cent: "cents",
  acre: "acres",
  sq_ft: "sq.ft",
  sq_m: "sq.m",
};

export function formatProjectType(
  projectType: ConstructionProjectType,
): string {
  return PROJECT_TYPE_LABELS[projectType];
}

export function formatProjectCategory(
  projectType: ConstructionProjectType,
): string {
  return PROJECT_CATEGORY_LABELS[projectType];
}

export function formatProjectStatus(
  status: ConstructionProjectStatus,
): string {
  return PROJECT_STATUS_LABELS[status];
}

export function formatProjectLocation(project: PortfolioProject): string {
  return `${project.location.city}, ${project.location.state}`;
}

export function formatBuiltUpArea(project: PortfolioProject): string {
  if (!project.builtUpArea) {
    return "Area on request";
  }

  return `${project.builtUpArea.value.toLocaleString("en-IN")} ${
    AREA_UNIT_LABELS[project.builtUpArea.unit]
  }`;
}

export function formatSiteArea(project: PortfolioProject): string {
  if (!project.siteArea) {
    return "Not specified";
  }

  return `${project.siteArea.value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })} ${SITE_AREA_UNIT_LABELS[project.siteArea.unit]}`;
}

export function formatProjectCompletion(project: PortfolioProject): string {
  if (project.status === "completed" && project.completionYear) {
    return `Completed ${project.completionYear}`;
  }

  if (project.expectedCompletionYear) {
    return `Expected ${project.expectedCompletionYear}`;
  }

  return formatProjectStatus(project.status);
}

export function formatProjectYear(project: PortfolioProject): string {
  return String(
    project.completionYear ??
      project.expectedCompletionYear ??
      "To be confirmed",
  );
}
