import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { RoutePageContainer } from "@/components/ui/route-page-container";
import { StudioCreatePage } from "@/features/studio/components/studio-create-page";

export default function StudioPage() {
  return (
    <AppShell>
      <RoutePageContainer
        title="Hive Studio"
        variant="studio"
        showHeading={false}
      >
        <Suspense fallback={<div style={{ padding: "24px", color: "#64748b" }}>Loading Hive Studio Workspace...</div>}>
          <StudioCreatePage />
        </Suspense>
      </RoutePageContainer>
    </AppShell>
  );
}
