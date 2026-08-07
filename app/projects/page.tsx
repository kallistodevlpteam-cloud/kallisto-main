import React, { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ProjectsWorkspace } from "@/features/projects/projects-workspace";

export default function ProjectsPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="workspace-container">
            <div className="route-state-box route-state-loading" aria-label="Loading projects">
              <div className="skeleton-bar skeleton-title" />
              <div className="skeleton-bar skeleton-subtitle" />
            </div>
          </div>
        }
      >
        <ProjectsWorkspace />
      </Suspense>
    </AppShell>
  );
}
