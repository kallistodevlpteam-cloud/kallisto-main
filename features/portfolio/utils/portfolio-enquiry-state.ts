import type {
  PortfolioProfile,
  PortfolioProject,
} from "@/features/portfolio/types/portfolio.types";
import { formatProjectLocation } from "./portfolio-project-format";

type PortfolioEnquiryIntent = "proposal" | "consultation";

export function buildPortfolioEnquiryHref(
  profile: PortfolioProfile,
  intent: PortfolioEnquiryIntent,
  project?: PortfolioProject,
): string {
  const params = new URLSearchParams({
    providerId: profile.providerId,
    intent,
    source: "portfolio",
  });

  if (project) {
    params.set("projectReference", project.id);
    params.set("projectType", project.projectType);
    params.set("projectLocation", formatProjectLocation(project));
    params.set("servicesViewed", project.services.join(","));
  }

  return `/basics/requirements/new?${params.toString()}`;
}

export function buildProviderServicesHref(profile: PortfolioProfile): string {
  return `/basics/experts/${encodeURIComponent(profile.providerId)}?tab=services`;
}
