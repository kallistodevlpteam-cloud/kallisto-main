import { AppShell } from "@/components/layout/app-shell";
import { RoutePageContainer } from "@/components/ui/route-page-container";

export default function StudioBOQPage() {
  return (
    <AppShell>
      <RoutePageContainer
        title="BOQ Engine"
        description="Structured BOQ calculation and bill of quantities management for active projects."
        primaryActionLabel="New BOQ Revision"
      />
    </AppShell>
  );
}
