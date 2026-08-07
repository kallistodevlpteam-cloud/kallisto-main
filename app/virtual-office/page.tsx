import { AppShell } from "@/components/layout/app-shell";
import { RoutePageContainer } from "@/components/ui/route-page-container";

export default function VirtualOfficePage() {
  return (
    <AppShell>
      <RoutePageContainer
        title="Kallisto"
        description="Central hub for studio operations, service profile, and team coordination."
        primaryActionLabel="New Studio Action"
      />
    </AppShell>
  );
}
