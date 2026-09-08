import { notFound } from "next/navigation";
import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { ActiveDeploymentWorkspace } from "@/features/hands/components/active-deployment-workspace";
import { getDeploymentById } from "@/features/hands/services/hands.mock";

interface PartnerDeploymentPageRouteProps {
  params: Promise<{ deploymentId: string }>;
}

export default async function PartnerActiveDeploymentPage({
  params,
}: PartnerDeploymentPageRouteProps) {
  const resolvedParams = await params;
  const deploymentId = resolvedParams.deploymentId;

  const deployment = getDeploymentById(deploymentId);

  if (!deployment) {
    notFound();
  }

  return (
    <PartnerAppShell>
      <ActiveDeploymentWorkspace
        deployment={deployment}
        basePath="/partner/hands"
        isPartner={true}
      />
    </PartnerAppShell>
  );
}
