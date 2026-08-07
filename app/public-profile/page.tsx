import { AppShell } from "@/components/layout/app-shell";
import { RoutePageContainer } from "@/components/ui/route-page-container";

export default function PublicProfilePage() {
  return (
    <AppShell>
      <RoutePageContainer
        title="Public Profile"
        description="Your verified Kallisto professional profile and public studio showcase."
        primaryActionLabel="Edit Profile"
      />
    </AppShell>
  );
}
