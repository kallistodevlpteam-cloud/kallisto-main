import { Suspense } from "react";
import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { PortfolioProfileCard } from "@/features/portfolio/components/portfolio-profile-card";
import { parsePortfolioTab } from "@/features/portfolio/utils/portfolio-query-state";
import { getServiceProviderPortfolioData } from "@/partner-app/hands/mock/provider-profiles-mock-data";

interface PartnerProviderDetailRouteProps {
  params: Promise<{ providerId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PartnerProviderDetailPage({
  params,
  searchParams,
}: PartnerProviderDetailRouteProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const providerSlugOrId = resolvedParams.providerId;

  const isOwner = getSingleValue(resolvedSearchParams.view) === "owner";

  const data = getServiceProviderPortfolioData({
    providerQuery: providerSlugOrId,
    isOwner,
  });

  const initialTab = parsePortfolioTab(
    getSingleValue(resolvedSearchParams.portfolioTab) || "projects",
    isOwner,
  );
  const initialCollectionId =
    getSingleValue(resolvedSearchParams.collection) ?? getSingleValue(resolvedSearchParams.highlight);
  const initialProjectId = getSingleValue(resolvedSearchParams.project);

  return (
    <PartnerAppShell>
      <div style={{ padding: 0, margin: 0, width: "100%" }}>
        <Suspense fallback={<div aria-label="Loading profile" />}>
          <PortfolioProfileCard
            key={data.profile.providerId || data.profile.name}
            data={data}
            initialTab={initialTab}
            initialCollectionId={initialCollectionId}
            initialProjectId={initialProjectId}
            hidePricing={true}
            shareOnly={true}
            hideAddProject={true}
            projectBasePath="/partner/hands/profile/projects"
          />
        </Suspense>
      </div>
    </PartnerAppShell>
  );
}
