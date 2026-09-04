"use client";

import React from "react";
import { OdinDuotoneIcon } from "@/components/layout/sidebar-icons";
import { StudioProjectOption } from "@/types/domain/studio";
import { ProjectSelector } from "./project-selector";

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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        width: "100%",
        marginBottom: "28px",
      }}
    >
      {/* Top Center Ask Odin Icon */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#0f172a",
          marginBottom: "16px",
        }}
      >
        <OdinDuotoneIcon size={24} />
      </div>

      {/* Main Welcome Heading */}
      <h2
        style={{
          margin: 0,
          fontSize: "24px",
          fontWeight: 600,
          letterSpacing: "-0.015em",
          color: "#1e293b",
          lineHeight: 1.3,
        }}
      >
        What should we work on in
        <br />
        <ProjectSelector
          value={selectedProjectId}
          projects={projects}
          onChange={onSelectProject}
          variant="inline-link"
        />
      </h2>
    </div>
  );
}
