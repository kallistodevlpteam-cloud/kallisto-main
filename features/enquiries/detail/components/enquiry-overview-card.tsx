"use client";

import React, { type CSSProperties, type ReactNode, type RefObject } from "react";
import { Building2, Clock, IndianRupee, Layers, User } from "lucide-react";
import {
  PROJECT_MAIN_MIN_WIDTH,
  PROJECT_UPDATES_GAP,
  type ProjectUpdatesLayoutMode,
} from "@/lib/layout/project-dashboard-responsive-contract";
import { ProjectGallery } from "@/features/documents/components/gallery/project-gallery";
import type { GalleryImage } from "@/features/documents/components/gallery/project-thumbnail-rail";
import { ProjectOverviewSection, type HighlightItem } from "@/features/documents/components/project-overview-section";

import { EnquiryProjectScopeSection } from "./enquiry-project-scope-section";

/** Maps an inspiration_img row to the gallery component contract. */
function toGalleryImages(images?: Array<{ url: string; alt: string | null }>): GalleryImage[] {
  return (images ?? []).map((image, index) => ({
    id: `insp-${index + 1}`,
    src: image.url,
    alt: image.alt ?? `Inspiration ${index + 1}`,
  }));
}

export interface EnquiryStatValues {
  projectType?: string;
  duration?: string;
  builtUpArea?: string;
  budget?: string;
  client?: string;
}

const DEFAULT_ENQUIRY_STAT_VALUES: EnquiryStatValues = {
  projectType: "Commercial Interior",
  client: "Greenleaf Spaces",
};

interface EnquiryStatCard {
  id: string;
  label: string;
  value: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

export function EnquiryStatCardsBar({ values }: { values?: Partial<EnquiryStatValues> }) {
  const resolvedValues = { ...DEFAULT_ENQUIRY_STAT_VALUES, ...values };
  const cards: EnquiryStatCard[] = [
    { id: "project-type", label: "Project Type", value: resolvedValues.projectType || "Commercial Interior", icon: Building2, iconBg: "#EEF2FF", iconColor: "#4F46E5" },
    { id: "duration", label: "Duration", value: resolvedValues.duration || "—", icon: Clock, iconBg: "#F0FDF4", iconColor: "#16A34A" },
    { id: "built-up", label: "Built-up Area", value: resolvedValues.builtUpArea || "—", icon: Layers, iconBg: "#F5F3FF", iconColor: "#7C3AED" },
    { id: "budget", label: "Budget", value: resolvedValues.budget || "—", icon: IndianRupee, iconBg: "#FEF2F2", iconColor: "#E11D48" },
    { id: "client", label: "Client", value: resolvedValues.client || "Greenleaf Spaces", icon: User, iconBg: "#ECFEFF", iconColor: "#0891B2" },
  ];

  return (
    <div className="project-stat-cards-container">
      <div className="project-stat-cards-bar">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.id} className="horiz-stat-card">
              <div className="horiz-stat-icon-box" style={{ backgroundColor: card.iconBg, color: card.iconColor }}>
                <Icon size={18} strokeWidth={2} aria-hidden="true" />
              </div>
              <div className="horiz-stat-info">
                <span className="horiz-stat-label">{card.label}</span>
                <span className="horiz-stat-value">{card.value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface EnquiryOverviewCardProps {
  dashboardRef?: RefObject<HTMLDivElement | null>;
  layoutMode?: ProjectUpdatesLayoutMode;
  updatesOpen?: boolean;
  updatesPanelRef?: RefObject<HTMLDivElement | null>;
  updatesWidth?: number;
  onUpdatesClose?: () => void;
  statValues?: Partial<EnquiryStatValues>;
  overviewTitle?: string;
  projectName?: string;
  description?: string;
  highlights?: Array<string | HighlightItem>;
  customRightPanel?: ReactNode;
  /** Inspiration gallery images from the backend (inspiration_img).
   * Strictly backend-sourced; no hardcoded fallback images are shown. */
  inspirationImages?: Array<{ url: string; alt: string | null }>;
  /** Project scopes with nested sub-lists (project_scope +
   * project_scope_item). Strictly backend-sourced. */
  projectScopes?: Array<{ id: number; scope_name: string; items: string[] }>;
}

export function EnquiryOverviewCard({
  dashboardRef,
  layoutMode = "drawer",
  updatesWidth = 340,
  statValues,
  overviewTitle = "",
  projectName,
  description,
  highlights,
  customRightPanel,
  inspirationImages,
  projectScopes,
}: EnquiryOverviewCardProps) {
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
        <ProjectGallery images={toGalleryImages(inspirationImages)} />
        <EnquiryStatCardsBar values={statValues} />
        <EnquiryProjectScopeSection scopes={projectScopes ?? []} />
      </main>

      {customRightPanel}
    </div>
  );
}
