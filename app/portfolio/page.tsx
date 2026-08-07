import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PortfolioProfileCard } from "@/features/portfolio/components/portfolio-profile-card";
import { getPortfolioPageData } from "@/features/portfolio/data/portfolio.mock";
import { parsePortfolioTab } from "@/features/portfolio/utils/portfolio-query-state";

interface PortfolioRouteProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PortfolioPage({
  searchParams,
}: PortfolioRouteProps) {
  const params = await searchParams;
  const isOwner = getSingleValue(params.view) !== "public";
  const data = getPortfolioPageData(isOwner);
  const initialTab = parsePortfolioTab(
    getSingleValue(params.portfolioTab),
    isOwner,
  );
  const initialCollectionId =
    getSingleValue(params.collection) ?? getSingleValue(params.highlight);
  const initialProjectId = getSingleValue(params.project);

  return (
    <AppShell>
      <div style={{ padding: 0, margin: 0, width: "100%" }}>
        <Suspense fallback={<div aria-label="Loading portfolio" />}>
          <PortfolioProfileCard
            data={data}
            initialTab={initialTab}
            initialCollectionId={initialCollectionId}
            initialProjectId={initialProjectId}
          />
        </Suspense>
      </div>
    </AppShell>
  );
}
