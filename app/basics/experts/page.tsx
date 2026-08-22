import { Suspense } from "react";
import { ExpertDiscovery } from "@/features/basics/components/expert-discovery";
import { BasicsLoadingSkeleton } from "@/features/basics/components/basics-shared";
import styles from "@/features/basics/components/basics-workspace.module.css";

export default function ExpertsPage() {
  return (
    <div className={styles.page}>
      <Suspense fallback={<BasicsLoadingSkeleton label="Loading experts" />}>
        <ExpertDiscovery />
      </Suspense>
    </div>
  );
}
