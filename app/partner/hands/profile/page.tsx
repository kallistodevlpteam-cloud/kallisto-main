import { Suspense } from "react";
import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { PortfolioProfileCard } from "@/features/portfolio/components/portfolio-profile-card";
import { getPortfolioPageData } from "@/features/portfolio/data/portfolio.mock";

export default async function PartnerProfilePage() {
  const data = getPortfolioPageData(false); // Using public view mock for now

  return (
    <PartnerAppShell>
      <div style={{ padding: 0, margin: 0, width: "100%", height: "100%" }}>
        <Suspense fallback={<div aria-label="Loading profile" />}>
          <PortfolioProfileCard
            data={data}
            initialTab="projects"
            initialCollectionId={undefined}
            initialProjectId={undefined}
          />
        </Suspense>
      </div>
    </PartnerAppShell>
  );
}
