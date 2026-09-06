import { notFound } from "next/navigation";
import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { PortfolioProjectOverview } from "@/features/portfolio/components/project-overview/portfolio-project-overview";
import {
  getDetailedPortfolioProject,
  getPortfolioPageData,
  getPortfolioProjects,
} from "@/features/portfolio/data/portfolio.mock";

interface PartnerProjectOverviewRouteProps {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PartnerHandsDirectProjectOverviewPage({
  params,
  searchParams,
}: PartnerProjectOverviewRouteProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const projectId = resolvedParams.projectId;
  const isOwner = getSingleValue(resolvedSearchParams.view) !== "public";

  const project = getDetailedPortfolioProject(projectId);
  if (!project) {
    notFound();
  }

  const allProjects = getPortfolioProjects();
  const relatedProjects = allProjects
    .filter((p) =>
      project.relatedProjectIds
        ? project.relatedProjectIds.includes(p.id)
        : p.id !== project.id,
    )
    .slice(0, 3);

  const portfolioData = getPortfolioPageData(isOwner);

  return (
    <PartnerAppShell>
      <div style={{ padding: 0, margin: 0, width: "100%" }}>
        <PortfolioProjectOverview
          project={project}
          profile={portfolioData.profile}
          relatedProjects={relatedProjects}
          isOwner={isOwner}
          basePath="/partner/hands/projects"
        />
      </div>
    </PartnerAppShell>
  );
}
