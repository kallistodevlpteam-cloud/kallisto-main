import { Suspense } from "react";
import { BasicsOverview } from "@/features/basics/components/basics-overview";
import { BasicsLoadingSkeleton } from "@/features/basics/components/basics-shared";
import styles from "@/features/basics/components/basics-workspace.module.css";

export default function BasicsPage() {
  return (
    <Suspense fallback={<BasicsLoadingSkeleton label="Loading Kallisto Basics" />}>
      <BasicsOverview />
    </Suspense>
  );
}
