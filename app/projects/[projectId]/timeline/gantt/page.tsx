import React, { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ProjectModuleSubpage } from "@/features/projects/project-module-subpage";

interface GanttRouteProps {
  params: Promise<{
    projectId: string;
  }> | {
    projectId: string;
  };
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}

export default async function GanttRoute({ params }: GanttRouteProps) {
  const resolvedParams = await params;
  const projectId = resolvedParams?.projectId || "proj-001";

  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="workspace-container" style={{ padding: "24px" }}>
            <div className="route-state-box route-state-loading" aria-label="Loading project gantt chart workspace">
              <div className="skeleton-bar skeleton-title" />
              <div className="skeleton-bar skeleton-subtitle" />
            </div>
          </div>
        }
      >
        <ProjectModuleSubpage projectId={projectId} module="gantt" />
      </Suspense>
    </AppShell>
  );
}
