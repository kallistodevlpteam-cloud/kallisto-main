import { Suspense } from "react";
import { ProposalDetail } from "@/features/basics/components/proposal-detail";
import { BasicsLoadingSkeleton } from "@/features/basics/components/basics-shared";

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ proposalId: string }>;
}) {
  const { proposalId } = await params;
  return (
    <Suspense fallback={<BasicsLoadingSkeleton label="Loading proposal" />}>
      <ProposalDetail proposalId={proposalId} />
    </Suspense>
  );
}

