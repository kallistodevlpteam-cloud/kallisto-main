import React, { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { RoutePageContainer } from "@/components/ui/route-page-container";
import { DocumentsTitleRowActions } from "@/features/documents/components/documents-title-row-actions";
import { ProjectFinanceWorkspace } from "@/features/projects/finance/components/project-finance-workspace";
import { Project } from "@/types/domain/project";
import { Maximize2 } from "lucide-react";

const MOCK_NILA_PROJECT: Project = {
  id: "proj-001",
  workspaceId: "ws-default",
  clientId: "client-101",
  name: "Nila Residence",
  projectCode: "PRJ-2024-0186",
  projectType: "Luxury Residential Villa",
  status: "active",
  phase: "Construction",
  ownerId: "user-1",
  ownerName: "Arjun Menon",
  location: "Kochi, Kerala",
  nextRequiredAction: "Review slab casting schedule",
  createdAt: "2026-05-12T10:00:00Z",
  updatedAt: "2026-07-29T10:00:00Z",
};

export default function FinancePage() {
  return (
    <AppShell>
      <RoutePageContainer
        title="Nila Residence"
        titleRowContent={<DocumentsTitleRowActions />}
      >
        <Suspense fallback={<div className="skeleton-card" style={{ height: "300px" }} />}>
          <ProjectFinanceWorkspace project={MOCK_NILA_PROJECT} />
        </Suspense>
      </RoutePageContainer>
    </AppShell>
  );
}



