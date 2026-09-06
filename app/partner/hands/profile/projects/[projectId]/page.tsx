import { notFound } from "next/navigation";
import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { PortfolioProjectOverview } from "@/features/portfolio/components/project-overview/portfolio-project-overview";
import {
  getDetailedPortfolioProject,
  getPortfolioPageData,
  getPortfolioProjects,
} from "@/features/portfolio/data/portfolio.mock";
import {
  getServiceProviderDetailedProject,
  SERVICE_PROVIDER_RECORDS,
} from "@/partner-app/hands/mock/provider-profiles-mock-data";
import type { PortfolioProfile, PortfolioProject } from "@/features/portfolio/types/portfolio.types";

interface PartnerProjectOverviewRouteProps {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PartnerHandsProjectOverviewPage({
  params,
  searchParams,
}: PartnerProjectOverviewRouteProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const projectId = resolvedParams.projectId;
  const isOwner = getSingleValue(resolvedSearchParams.view) === "owner";

  // Check if this project is from a service provider or default portfolio
  const providerProject = getServiceProviderDetailedProject(projectId);
  const project = providerProject || getDetailedPortfolioProject(projectId);
  if (!project) {
    notFound();
  }

  // Find if a service provider owns this project
  const matchingProvider = SERVICE_PROVIDER_RECORDS.find((p) =>
    p.projects.some((pr) => pr.id === project.id || pr.slug === project.slug)
  );

  let profile: PortfolioProfile;
  let relatedProjects: PortfolioProject[] = [];

  if (matchingProvider) {
    profile = {
      providerId: matchingProvider.id,
      name: matchingProvider.name,
      profession: matchingProvider.profession,
      location: matchingProvider.location,
      bio: matchingProvider.bio,
      websiteLabel: matchingProvider.websiteLabel,
      websiteUrl: matchingProvider.websiteUrl,
      skills: matchingProvider.skills,
      availability: "Active on Kallisto Network",
      verified: matchingProvider.verified,
      avatarUrl: matchingProvider.avatarUrl,
      coverImageUrl: matchingProvider.coverImageUrl,
    };
    relatedProjects = matchingProvider.projects
      .filter((p) => p.id !== project.id)
      .slice(0, 3);
  } else {
    const portfolioData = getPortfolioPageData(isOwner);
    profile = portfolioData.profile;
    const allProjects = getPortfolioProjects();
    relatedProjects = allProjects
      .filter((p) =>
        project.relatedProjectIds
          ? project.relatedProjectIds.includes(p.id)
          : p.id !== project.id,
      )
      .slice(0, 3);
  }

  return (
    <PartnerAppShell>
      <div style={{ padding: 0, margin: 0, width: "100%" }}>
        <PortfolioProjectOverview
          project={project}
          profile={profile}
          relatedProjects={relatedProjects}
          isOwner={isOwner}
          basePath="/partner/hands/profile/projects"
        />
      </div>
    </PartnerAppShell>
  );
}
