"use client";

import React from "react";
import { StudioProjectOption } from "@/types/domain/studio";
import { StudioProjectContextCard } from "./studio-project-context-card";

export interface StudioWelcomeProps {
  selectedProjectId: string | null;
  projects: StudioProjectOption[];
  onSelectProject: (projectId: string) => void;
}

export function StudioWelcome({
  selectedProjectId,
  projects,
  onSelectProject,
}: StudioWelcomeProps) {
  return (
    <StudioProjectContextCard
      selectedProjectId={selectedProjectId}
      projects={projects}
      onSelectProject={onSelectProject}
    />
  );
}
