import React, { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ProjectDetailWorkspace } from "@/features/projects/project-detail-workspace";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectUpdatesPage({ params }: PageProps) {
  const resolvedParams = await params;
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="workspace-container">
            <div className="route-state-box route-state-loading" aria-label="Loading project updates">
              <div className="skeleton-bar skeleton-title" />
              <div className="skeleton-bar skeleton-subtitle" />
            </div>
          </div>
        }
      >
        <ProjectDetailWorkspace projectId={resolvedParams.projectId} activeTab="updates" />
      </Suspense>
    </AppShell>
  );
}
