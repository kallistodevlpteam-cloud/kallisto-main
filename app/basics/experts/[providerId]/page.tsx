import { ProviderProfile } from "@/features/basics/components/provider-profile";

type ProfileTab = "services" | "overview" | "experience" | "reviews";

export default async function ProviderProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ providerId: string }>;
  searchParams: Promise<{ tab?: string; projectId?: string; serviceId?: string }>;
}) {
  const [{ providerId }, query] = await Promise.all([params, searchParams]);
  const validTabs: ProfileTab[] = [
    "services",
    "overview",
    "experience",
    "reviews",
  ];
  const tab = validTabs.includes(query.tab as ProfileTab)
    ? (query.tab as ProfileTab)
    : "services";

  return (
    <ProviderProfile
      providerId={providerId}
      tab={tab}
      projectId={query.projectId}
      serviceId={query.serviceId}
    />
  );
}

