import { Suspense } from "react";
import { BasicsOverview } from "@/features/basics/components/basics-overview";
import { BasicsLoadingSkeleton } from "@/features/basics/components/basics-shared";

export default async function BasicsPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const { projectId } = await searchParams;
  return (
    <Suspense fallback={<BasicsLoadingSkeleton label="Loading Basics overview" />}>
      <BasicsOverview projectId={projectId} />
    </Suspense>
  );
}
