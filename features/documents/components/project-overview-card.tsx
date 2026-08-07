"use client";

import type { CSSProperties, ReactNode, RefObject } from "react";
import {
  PROJECT_MAIN_MIN_WIDTH,
  PROJECT_UPDATES_GAP,
  type ProjectUpdatesLayoutMode,
} from "@/lib/layout/project-dashboard-responsive-contract";
import type { UpdatePost } from "../hooks/use-project-updates-panel-state";
import { ProjectGallery } from "./gallery/project-gallery";
import type { GalleryImage } from "./gallery/project-thumbnail-rail";
import { ProjectOverviewSection, type HighlightItem } from "./project-overview-section";
import { ProjectScopeSection } from "./project-scope-section";
import {
  ProjectStatCardsBar,
  type ProjectStatValues,
} from "./project-stat-cards-bar";
import { ProjectUpdatesPanel } from "./project-updates-panel";

const GALLERY_IMAGES: GalleryImage[] = [
  { id: "img-1", src: "/assets/card01.svg", alt: "Abstract Curved Architectural Structure" },
  { id: "img-2", src: "/assets/nila-thumb1.jpg", alt: "Entrance Facade Architecture" },
  { id: "img-3", src: "/assets/nila-thumb2.jpg", alt: "Living Area Interior Design" },
  { id: "img-4", src: "/assets/nila-thumb3.jpg", alt: "Pool Deck Elevation View" },
];

interface ProjectOverviewCardProps {
  projectId?: string;
  dashboardRef?: RefObject<HTMLDivElement | null>;
  layoutMode?: ProjectUpdatesLayoutMode;
  updatesOpen?: boolean;
  updatesPanelRef?: RefObject<HTMLDivElement | null>;
  updatesWidth?: number;
  onUpdatesClose?: () => void;
  statValues?: Partial<ProjectStatValues>;
  initialUpdates?: readonly UpdatePost[];
  futureContent?: ReactNode;
  updatesTitle?: string;
  overviewTitle?: string;
  projectName?: string;
  description?: string;
  highlights?: Array<string | HighlightItem>;
  customRightPanel?: ReactNode;
}

export function ProjectOverviewCard({
  projectId = "proj-001",
  dashboardRef,
  layoutMode = "drawer",
  updatesOpen = false,
  updatesPanelRef,
  updatesWidth = 340,
  onUpdatesClose = () => undefined,
  statValues,
  initialUpdates,
  futureContent,
  updatesTitle,
  overviewTitle,
  projectName,
  description,
  highlights,
  customRightPanel,
}: ProjectOverviewCardProps = {}) {
  return (
    <div
      ref={dashboardRef}
      className="poc-wrapper"
      data-updates-mode={layoutMode}
      style={{
        "--project-main-min-width": `${PROJECT_MAIN_MIN_WIDTH}px`,
        "--project-updates-gap": `${PROJECT_UPDATES_GAP}px`,
        "--project-updates-rail-width": `${updatesWidth}px`,
      } as CSSProperties}
    >
      <main className="poc-left-column">
        <ProjectOverviewSection
          title={overviewTitle}
          projectName={projectName}
          description={description}
          highlights={highlights}
        />
        <ProjectGallery images={GALLERY_IMAGES} title="INSPIRATION IMAGES" overflowCount={5} />
        <ProjectStatCardsBar values={statValues} />
        <ProjectScopeSection />
        {futureContent}
      </main>

      {customRightPanel ?? (
        <ProjectUpdatesPanel
          projectId={projectId}
          layoutMode={layoutMode}
          open={updatesOpen}
          panelRef={updatesPanelRef ?? { current: null }}
          onClose={onUpdatesClose}
          initialUpdates={initialUpdates}
          updatesTitle={updatesTitle}
        />
      )}
    </div>
  );
}
