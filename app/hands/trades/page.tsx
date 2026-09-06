import { Suspense } from "react";
import { HandsTradeDiscovery } from "@/features/hands/components/hands-trade-discovery";
import { HandsOverviewSkeleton } from "@/features/hands/components/hands-overview";
import styles from "@/features/hands/components/hands-overview.module.css";

export default function HandsTradesPage() {
  return (
    <div className={`workspace-container ${styles.page}`}>
      <Suspense fallback={<HandsOverviewSkeleton />}>
        <HandsTradeDiscovery />
      </Suspense>
    </div>
  );
}
