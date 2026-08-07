import { AppShell } from "@/components/layout/app-shell";
import { RoutePageContainer } from "@/components/ui/route-page-container";

export default function StudioAIPlansPage() {
  return (
    <AppShell>
      <RoutePageContainer
        title="AI Plans"
        description="Automated architectural floor plan generation and spatial constraint layout engine."
        primaryActionLabel="Generate New Plan"
      />
    </AppShell>
  );
}
