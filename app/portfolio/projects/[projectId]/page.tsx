import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PortfolioProjectOverview } from "@/features/portfolio/components/project-overview/portfolio-project-overview";
import {
  getDetailedPortfolioProject,
  getPortfolioPageData,
  getPortfolioProjects,
} from "@/features/portfolio/data/portfolio.mock";

interface ProjectOverviewRouteProps {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PortfolioProjectOverviewPage({
  params,
  searchParams,
}: ProjectOverviewRouteProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
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
    <AppShell>
      <div style={{ padding: 0, margin: 0, width: "100%" }}>
        <PortfolioProjectOverview
          project={project}
          profile={portfolioData.profile}
          relatedProjects={relatedProjects}
          isOwner={isOwner}
        />
      </div>
    </AppShell>
  );
}
