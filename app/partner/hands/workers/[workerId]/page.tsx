import { notFound } from "next/navigation";
import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { getWorkerById } from "@/partner-app/hands/mock/workers-mock-data";
import { HandsWorkerDetailWorkspace } from "@/partner-app/hands/components/workers/hands-worker-detail-workspace";

interface PageProps {
  params: Promise<{
    workerId: string;
  }> | {
    workerId: string;
  };
}

export default async function HandsWorkerDetailPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const workerId = resolvedParams.workerId;
  const worker = getWorkerById(workerId);

  if (!worker) {
    notFound();
  }

  return (
    <PartnerAppShell>
      <HandsWorkerDetailWorkspace worker={worker} />
    </PartnerAppShell>
  );
}
