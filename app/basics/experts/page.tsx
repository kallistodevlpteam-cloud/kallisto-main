import { Suspense } from "react";
import { ExpertDiscovery } from "@/features/basics/components/expert-discovery";
import {
  BasicsLoadingSkeleton,
  BasicsPageHeader,
} from "@/features/basics/components/basics-shared";
import styles from "@/features/basics/components/basics-workspace.module.css";

export default function ExpertsPage() {
  return (
    <div className={styles.page}>
      <BasicsPageHeader
        title="Find Experts"
        description="Discover verified construction specialists for your projects."
      />
      <Suspense fallback={<BasicsLoadingSkeleton label="Loading experts" />}>
        <ExpertDiscovery />
      </Suspense>
    </div>
  );
}

