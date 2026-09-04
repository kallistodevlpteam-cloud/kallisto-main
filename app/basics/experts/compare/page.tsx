import { Suspense } from "react";
import { ExpertComparisonView } from "@/features/basics/components/expert-comparison-view";
import { BasicsLoadingSkeleton } from "@/features/basics/components/basics-shared";

export default function ExpertComparisonPage() {
  return (
    <Suspense fallback={<BasicsLoadingSkeleton label="Loading specialist comparison" />}>
      <ExpertComparisonView />
    </Suspense>
  );
}
