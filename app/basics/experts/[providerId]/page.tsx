import { ProviderProfile } from "@/features/basics/components/provider-profile";

type ProfileTab = "overview" | "services" | "portfolio" | "experience" | "reviews";

export default async function ProviderProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ providerId: string }>;
  searchParams: Promise<{ tab?: string; projectId?: string }>;
}) {
  const [{ providerId }, query] = await Promise.all([params, searchParams]);
  const validTabs: ProfileTab[] = [
    "overview",
    "services",
    "portfolio",
    "experience",
    "reviews",
  ];
  const tab = validTabs.includes(query.tab as ProfileTab)
    ? (query.tab as ProfileTab)
    : "overview";

  return (
    <ProviderProfile
      providerId={providerId}
      tab={tab}
      projectId={query.projectId}
    />
  );
}

