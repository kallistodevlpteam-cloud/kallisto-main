import React, { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { RoutePageContainer } from "@/components/ui/route-page-container";
import { DocumentsTitleRowActions } from "@/features/documents/components/documents-title-row-actions";
import { ProjectDocumentsWorkspace } from "@/features/projects/components/documents/project-documents-workspace";
import { Maximize2 } from "lucide-react";

export default function DocumentsPage() {
  return (
    <AppShell>
      <RoutePageContainer
        title="Nila Residence"
        titleRowContent={<DocumentsTitleRowActions />}
      >
        <Suspense fallback={<div className="skeleton-card" style={{ height: "300px" }} />}>
          <ProjectDocumentsWorkspace projectId="proj-001" projectCode="PRJ-2024-0186" />
        </Suspense>
      </RoutePageContainer>
    </AppShell>
  );
}

