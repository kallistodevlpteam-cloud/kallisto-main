import { notFound } from "next/navigation";
import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { getHandsProjectById } from "@/partner-app/hands/mock/projects-mock-data";
import { HandsProjectDetailView } from "@/partner-app/hands/components/projects/hands-project-detail-view";

interface PartnerProjectOverviewRouteProps {
  params: Promise<{ projectId: string }>;
}

export default async function PartnerHandsDirectProjectOverviewPage({
  params,
}: PartnerProjectOverviewRouteProps) {
  const resolvedParams = await params;
  const projectId = resolvedParams.projectId;

  const project = getHandsProjectById(projectId);
  if (!project) {
    notFound();
  }

  return (
    <PartnerAppShell>
      <div style={{ padding: 0, margin: 0, width: "100%" }}>
        <HandsProjectDetailView project={project} />
      </div>
    </PartnerAppShell>
  );
}
