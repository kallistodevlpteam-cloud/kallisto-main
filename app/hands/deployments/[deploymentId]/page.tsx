import { notFound } from "next/navigation";
import { ActiveDeploymentWorkspace } from "@/features/hands/components/active-deployment-workspace";
import { getDeploymentById } from "@/features/hands/services/hands.mock";

interface DeploymentPageRouteProps {
  params: Promise<{ deploymentId: string }>;
}

export default async function ActiveDeploymentPage({ params }: DeploymentPageRouteProps) {
  const resolvedParams = await params;
  const deploymentId = resolvedParams.deploymentId;

  const deployment = getDeploymentById(deploymentId);

  if (!deployment) {
    notFound();
  }

  return (
    <ActiveDeploymentWorkspace
      deployment={deployment}
      basePath="/hands"
      isPartner={false}
    />
  );
}
