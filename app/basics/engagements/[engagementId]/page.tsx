import { Suspense } from "react";
import { EngagementDetail } from "@/features/basics/components/engagement-detail";
import { BasicsLoadingSkeleton } from "@/features/basics/components/basics-shared";

export default async function EngagementDetailPage({
  params,
}: {
  params: Promise<{ engagementId: string }>;
}) {
  const { engagementId } = await params;
  return (
    <Suspense fallback={<BasicsLoadingSkeleton label="Loading engagement" />}>
      <EngagementDetail engagementId={engagementId} />
    </Suspense>
  );
}

