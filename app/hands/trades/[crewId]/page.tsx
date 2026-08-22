import { Suspense } from "react";
import { TradeCrewDetail } from "@/features/hands/components/trade-crew-detail";
import { HandsOverviewSkeleton } from "@/features/hands/components/hands-overview";
import styles from "@/features/hands/components/hands-overview.module.css";

export default async function TradeCrewDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ crewId: string }>;
  searchParams: Promise<{ projectId?: string }>;
}) {
  const [{ crewId }, query] = await Promise.all([params, searchParams]);

  return (
    <div className={`workspace-container ${styles.page}`}>
      <Suspense fallback={<HandsOverviewSkeleton />}>
        <TradeCrewDetail
          crewId={crewId}
          projectId={query.projectId}
        />
      </Suspense>
    </div>
  );
}
