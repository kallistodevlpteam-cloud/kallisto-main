"use client";

import { MessageSquare } from "lucide-react";
import type { RefObject } from "react";
import { DocumentsTitleRowActions } from "@/features/documents/components/documents-title-row-actions";
import {
  PROJECT_UPDATES_PANEL_ID,
  type ProjectUpdatesLayoutMode,
} from "@/lib/layout/project-dashboard-responsive-contract";

interface ProjectDashboardHeaderActionsProps {
  updatesMode: ProjectUpdatesLayoutMode;
  updatesOpen: boolean;
  updatesTriggerRef: RefObject<HTMLButtonElement | null>;
  onOpenUpdates: () => void;
}

export function ProjectDashboardHeaderActions({
  updatesMode,
  updatesOpen,
  updatesTriggerRef,
  onOpenUpdates,
}: ProjectDashboardHeaderActionsProps) {
  return (
    <div className="project-dashboard-title-actions">
      <DocumentsTitleRowActions />
      {updatesMode === "drawer" ? (
        <button
          ref={updatesTriggerRef}
          type="button"
          className="project-updates-trigger"
          aria-haspopup="dialog"
          aria-expanded={updatesOpen}
          aria-controls={PROJECT_UPDATES_PANEL_ID}
          onClick={onOpenUpdates}
        >
          <MessageSquare size={15} strokeWidth={1.8} aria-hidden="true" />
          <span>Updates</span>
        </button>
      ) : null}
    </div>
  );
}
