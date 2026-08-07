"use client";

import React from "react";
import { Terminal } from "lucide-react";
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
      {/* Top Center Speech Bubble / Terminal Badge Icon */}
      <div
        style={{
          display: "grid",
          placeItems: "center",
          width: "38px",
          height: "38px",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          background: "#ffffff",
          color: "#64748b",
          marginBottom: "16px",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
        }}
      >
        <Terminal size={18} strokeWidth={1.5} />
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
