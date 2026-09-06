import { Suspense } from "react";
import { TradeCrewDetail } from "@/features/hands/components/trade-crew-detail";
import { HandsOverviewSkeleton } from "@/features/hands/components/hands-overview";
import styles from "@/features/hands/components/hands-overview.module.css";

export default async function TradeCrewDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ crewId: string }>;
  searchParams: Promise<{ tab?: string; projectId?: string; packageId?: string }>;
}) {
  const [{ crewId }, query] = await Promise.all([params, searchParams]);

  return (
    <Suspense fallback={<HandsOverviewSkeleton />}>
      <TradeCrewDetail
        crewId={crewId}
        projectId={query.projectId}
        tab={query.tab}
        packageId={query.packageId}
      />
    </Suspense>
  );
}
