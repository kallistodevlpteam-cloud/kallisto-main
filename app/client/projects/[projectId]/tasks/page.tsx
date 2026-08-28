import React, { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ProjectModuleSubpage } from "@/features/projects/project-module-subpage";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ClientProjectTasksPage({ params }: PageProps) {
  const resolvedParams = await params;
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="workspace-container" style={{ padding: "24px" }}>
            <div className="route-state-box route-state-loading" aria-label="Loading project tasks workspace">
              <div className="skeleton-bar skeleton-title" />
              <div className="skeleton-bar skeleton-subtitle" />
            </div>
          </div>
        }
      >
        <ProjectModuleSubpage projectId={resolvedParams.projectId} module="tasks" />
      </Suspense>
    </AppShell>
  );
}
