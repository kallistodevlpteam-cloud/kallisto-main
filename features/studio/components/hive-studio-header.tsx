"use client";

import React from "react";
import { StudioProjectOption } from "@/types/domain/studio";
import { ProjectSelector } from "./project-selector";

export interface HiveStudioHeaderProps {
  selectedProjectId: string | null;
  projects: StudioProjectOption[];
  onSelectProject: (projectId: string) => void;
  onNewOutputClick?: () => void;
  activeTaskOpen?: boolean;
}

export function HiveStudioHeader({
  selectedProjectId,
  projects,
  onSelectProject,
}: HiveStudioHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "24px",
        minHeight: "72px",
        padding: "0 0 16px 0",
        borderBottom: "1px solid #e2e8f0",
        marginBottom: "0",
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: "22px",
            lineHeight: "1.2",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: "#0f172a",
          }}
        >
          Hive Studio
        </h1>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: "13px",
            lineHeight: "1.35",
            color: "#64748b",
            fontWeight: 500,
          }}
        >
          Create professional, project-bound construction outputs.
        </p>
      </div>

      <div style={{ flex: "0 1 400px", minWidth: "240px" }}>
        <ProjectSelector
          value={selectedProjectId}
          projects={projects}
          onChange={onSelectProject}
          variant="header"
        />
      </div>
    </div>
  );
}
