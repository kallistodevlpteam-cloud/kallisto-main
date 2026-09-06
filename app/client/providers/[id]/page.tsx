import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { REGISTERED_SERVICE_PROVIDERS } from "@/features/client/providers/data/registered-providers.mock";
import { PortfolioProfileCard } from "@/features/portfolio/components/portfolio-profile-card";
import { getPortfolioPageData } from "@/features/portfolio/data/portfolio.mock";
import type { RegisteredServiceProvider } from "@/features/client/providers/types/client-providers.types";
import type { PortfolioPageData } from "@/features/portfolio/types/portfolio.types";

interface ProviderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function getProviderPortfolioData(provider: RegisteredServiceProvider): PortfolioPageData {
  const baseData = getPortfolioPageData(false);
  return {
    ...baseData,
    mode: "public",
    profile: {
      providerId: provider.id,
      name: provider.name,
      profession: provider.tagline,
      location: provider.location,
      bio: provider.bio,
      websiteLabel: `${provider.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.kallisto.design`,
      websiteUrl: `https://${provider.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.kallisto.design`,
      skills: provider.skills,
      availability: "Available for consultation",
      verified: Boolean(provider.verificationBadge),
      avatarUrl: provider.featuredProjects[0]?.coverImage || "/assets/profile_avatar.png",
      coverImageUrl: provider.coverImage || "/assets/hero-architecture-banner.webp",
    },
  };
}

export default async function ProviderDetailPage({ params }: ProviderDetailPageProps) {
  const { id } = await params;
  const provider = REGISTERED_SERVICE_PROVIDERS.find((p) => p.id === id);

  if (!provider) {
    notFound();
  }

  const portfolioData = getProviderPortfolioData(provider);

  return (
    <AppShell>
      <div style={{ padding: 0, margin: 0, width: "100%" }}>
        <PortfolioProfileCard
          data={portfolioData}
          initialTab="projects"
        />
      </div>
    </AppShell>
  );
}
