import { Suspense } from "react";
import { RequirementDetail } from "@/features/basics/components/requirement-detail";
import { BasicsLoadingSkeleton } from "@/features/basics/components/basics-shared";

export default async function RequirementDetailPage({
  params,
}: {
  params: Promise<{ requirementId: string }>;
}) {
  const { requirementId } = await params;
  return (
    <Suspense fallback={<BasicsLoadingSkeleton label="Loading requirement" />}>
      <RequirementDetail requirementId={requirementId} />
    </Suspense>
  );
}

