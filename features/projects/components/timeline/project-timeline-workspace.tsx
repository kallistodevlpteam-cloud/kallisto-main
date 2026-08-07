"use client";

import React, { useLayoutEffect, useRef } from "react";
import { Project } from "@/types/domain/project";
import { ProjectScheduleWorkspace } from "../schedule/project-schedule-workspace";

interface ProjectTimelineWorkspaceProps {
  project: Project;
}

export function ProjectTimelineWorkspace({ project }: ProjectTimelineWorkspaceProps) {
  const workspaceRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const workspace = workspaceRef.current?.closest(".workspace");
    if (workspace instanceof HTMLElement) {
      workspace.scrollTop = 0;
    }
  }, [project.id]);

  return (
    <div ref={workspaceRef}>
      <ProjectScheduleWorkspace
        projectId={project.id}
        projectName={project.name}
      />
    </div>
  );
}
