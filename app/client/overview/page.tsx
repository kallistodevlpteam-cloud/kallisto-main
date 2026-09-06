import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { RoutePageContainer } from "@/components/ui/route-page-container";
import { ClientOverviewWorkspace } from "@/features/client";

export default function ClientOverviewPage() {
  return (
    <AppShell>
      <RoutePageContainer
        title="Client Overview"
        variant="studio"
        showHeading={false}
      >
        <Suspense fallback={<div style={{ padding: "24px", color: "#64748b" }}>Loading Client Project Workspace...</div>}>
          <ClientOverviewWorkspace />
        </Suspense>
      </RoutePageContainer>
    </AppShell>
  );
}
