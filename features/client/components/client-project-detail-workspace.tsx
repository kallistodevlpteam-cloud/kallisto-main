"use client";

import React, { useEffect, useRef, useState, type RefObject } from "react";
import { useRouter } from "next/navigation";
import { RoutePageContainer } from "@/components/ui/route-page-container";
import { ProjectOverviewCard } from "@/features/documents/components/project-overview-card";
import { useProjectDashboardLayout } from "@/features/documents/hooks/use-project-dashboard-layout";
import { useDrawerBehaviour } from "@/features/hands/components/use-drawer-behaviour";
import { ClientServiceProviderCard } from "./client-service-provider-card";

interface ClientProjectDetailWorkspaceProps {
  projectId: string;
}

interface UpdatesDrawerFocusManagerProps {
  panelRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}

function UpdatesDrawerFocusManager({ panelRef, onClose }: UpdatesDrawerFocusManagerProps) {
  useDrawerBehaviour(panelRef, onClose);
  return null;
}

interface ProjectDetailPreset {
  name: string;
  description: string;
  projectType: string;
  duration: string;
  builtUpArea: string;
  budget: string;
  client: string;
  leadProvider: string;
}

const PRESET_PROJECTS: Record<string, ProjectDetailPreset> = {
  "proj-nila-residence": {
    name: "Nila Residence",
    description:
      "Ananya Builders is seeking a residential fit-out for approximately 2,800 - 3,200 sq ft in Kochi. The current requirement covers space planning, interior fit-out and MEP coordination with a ₹40L - ₹60L budget and a six-month target. The project is suitable for review, but budget coverage and expected deliverables should be clarified before proposal preparation.",
    projectType: "Residential Design",
    duration: "Within 6 Months",
    builtUpArea: "2,800 – 3,200 sq ft",
    budget: "₹40L – ₹60L",
    client: "Ananya Builders",
    leadProvider: "Arjun Architects",
  },
  "proj-nila-residence-phase2": {
    name: "Nila Residence",
    description:
      "Ananya Builders is seeking a residential fit-out for approximately 2,800 - 3,200 sq ft in Kochi. The current requirement covers space planning, interior fit-out and MEP coordination with a ₹40L - ₹60L budget and a six-month target. The project is suitable for review, but budget coverage and expected deliverables should be clarified before proposal preparation.",
    projectType: "Residential Design",
    duration: "Within 6 Months",
    builtUpArea: "2,800 – 3,200 sq ft",
    budget: "₹40L – ₹60L",
    client: "Ananya Builders",
    leadProvider: "Arjun Architects",
  },
  "proj-greenfield-villa": {
    name: "Greenfield Villa",
    description:
      "Luxury residential villa focusing on natural stone facades, open terrace garden views, and custom teak joinery with a six-month completion target.",
    projectType: "Residential Design",
    duration: "Within 6 Months",
    builtUpArea: "3,500 sq ft",
    budget: "₹1,20,00,000",
    client: "Greenfield Estates",
    leadProvider: "Greenfield Architects",
  },
  "proj-greenfield-resort": {
    name: "Greenfield Eco Resort",
    description:
      "Eco-luxury waterfront resort pavilion in Alappuzha Backwaters featuring treated timber roofing, pool lounge terraces, and sustainable rainwater harvesting.",
    projectType: "Hospitality & Eco-Living",
    duration: "Within 8 Months",
    builtUpArea: "6,500 sq ft",
    budget: "₹2,50,00,000",
    client: "EcoResorts Kerala",
    leadProvider: "Apex Environmental Designs",
  },
  "proj-greenfield-resort-phase2": {
    name: "Greenfield Eco Resort",
    description:
      "Eco-luxury waterfront resort pavilion in Alappuzha Backwaters featuring treated timber roofing, pool lounge terraces, and sustainable rainwater harvesting.",
    projectType: "Hospitality & Eco-Living",
    duration: "Within 8 Months",
    builtUpArea: "6,500 sq ft",
    budget: "₹1,80,00,000",
    client: "EcoResorts Kerala",
    leadProvider: "Apex Environmental Designs",
  },
};

export function ClientProjectDetailWorkspace({ projectId }: ClientProjectDetailWorkspaceProps) {
  const router = useRouter();
  const projectPreset = PRESET_PROJECTS[projectId] || PRESET_PROJECTS["proj-nila-residence"];

  const [updatesOpen, setUpdatesOpen] = useState(false);
  const updatesPanelRef = useRef<HTMLDivElement>(null);
  const updatesTriggerRef = useRef<HTMLButtonElement>(null);
  const { dashboardRef, mode: updatesMode, updatesWidth } = useProjectDashboardLayout(true);

  useEffect(() => {
    if (updatesMode !== "rail") return;
    const closeTimer = window.setTimeout(() => setUpdatesOpen(false), 0);
    return () => window.clearTimeout(closeTimer);
  }, [updatesMode]);

  const handleOpenOdinWithPrompt = (promptText: string) => {
    router.push(`/client/overview?projectId=${projectId}&prompt=${encodeURIComponent(promptText)}`);
  };

  return (
    <RoutePageContainer
      className="project-dashboard-page"
      title={projectPreset.name}
      showHeading={false}
    >
      <ProjectOverviewCard
        projectId={projectId}
        dashboardRef={dashboardRef}
        layoutMode={updatesMode}
        updatesOpen={updatesOpen}
        updatesPanelRef={updatesPanelRef}
        updatesWidth={updatesWidth}
        onUpdatesClose={() => setUpdatesOpen(false)}
        updatesTriggerRef={updatesTriggerRef}
        onOpenUpdates={() => setUpdatesOpen(true)}
        projectName={projectPreset.name}
        description={projectPreset.description}
        statValues={{
          projectType: projectPreset.projectType,
          duration: projectPreset.duration,
          builtUpArea: projectPreset.builtUpArea,
          budget: projectPreset.budget,
          client: projectPreset.client,
          providerLabel: "Service Provider",
          serviceProvider: projectPreset.leadProvider,
        }}
        futureContent={
          <ClientServiceProviderCard onOpenOdinWithPrompt={handleOpenOdinWithPrompt} />
        }
      />

      {updatesMode === "drawer" && updatesOpen ? (
        <UpdatesDrawerFocusManager
          panelRef={updatesPanelRef}
          onClose={() => setUpdatesOpen(false)}
        />
      ) : null}
    </RoutePageContainer>
  );
}
