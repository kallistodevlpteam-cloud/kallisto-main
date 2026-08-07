import { AppShell } from "@/components/layout/app-shell";
import { RoutePageContainer } from "@/components/ui/route-page-container";
import { ProjectOverviewCard } from "@/features/documents/components/project-overview-card";

export default function DocsPage() {
  return (
    <AppShell>
      <RoutePageContainer title="Nila Residence">
        <ProjectOverviewCard />
      </RoutePageContainer>
    </AppShell>
  );
}
