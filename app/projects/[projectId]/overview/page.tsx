import React, { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ProjectDetailWorkspace } from "@/features/projects/project-detail-workspace";

interface OverviewPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectOverviewShellPage({ params }: OverviewPageProps) {
  const resolvedParams = await params;
  return (
    <AppShell layoutProfile="project-dashboard">
      <Suspense
        fallback={
          <div className="workspace-container">
            <div className="route-state-box route-state-loading" aria-label="Loading project detail">
              <div className="skeleton-bar skeleton-title" />
              <div className="skeleton-bar skeleton-subtitle" />
            </div>
          </div>
        }
      >
        <ProjectDetailWorkspace projectId={resolvedParams.projectId} />
      </Suspense>
    </AppShell>
  );
}
