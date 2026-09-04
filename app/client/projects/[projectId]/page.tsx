import React, { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ClientProjectDetailWorkspace } from "@/features/client/components/client-project-detail-workspace";

interface ClientProjectDetailPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ClientProjectDetailPage({ params }: ClientProjectDetailPageProps) {
  const { projectId } = await params;

  return (
    <AppShell layoutProfile="project-dashboard">
      <Suspense
        fallback={
          <div className="workspace-container">
            <div className="route-state-box route-state-loading" aria-label="Loading project detail">
              <div className="skeleton-bar skeleton-title" />
              <div className="skeleton-bar skeleton-subtitle" />
              <div className="skeleton-grid">
                <div className="skeleton-card" />
                <div className="skeleton-card" />
              </div>
            </div>
          </div>
        }
      >
        <ClientProjectDetailWorkspace projectId={projectId} />
      </Suspense>
    </AppShell>
  );
}
