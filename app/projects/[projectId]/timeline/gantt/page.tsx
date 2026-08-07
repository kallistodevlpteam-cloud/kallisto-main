import React from "react";
import { notFound } from "next/navigation";
import { projectService } from "@/services/repositories/project-service";
import { projectScheduleService } from "@/features/projects/domain/project-schedule.service";
import { DedicatedGanttPage } from "@/features/projects/components/timeline/dedicated-gantt-page";
import { parseGanttQuery } from "@/features/projects/components/timeline/query-state/parse-timeline-query";

import { AppShell } from "@/components/layout/app-shell";

interface GanttRouteProps {
  params: Promise<{
    projectId: string;
  }> | {
    projectId: string;
  };
  searchParams: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}

export default async function GanttRoute({ params, searchParams }: GanttRouteProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const projectId = resolvedParams?.projectId || "proj-001";

  // Server-side data loading
  const project = await projectService.getProjectById("ws-default", projectId);
  if (!project) {
    notFound();
  }

  const schedule = await projectScheduleService.getSchedule({
    projectId: project.id,
    actor: { id: "usr-admin", role: "admin" },
  });

  const initialQuery = parseGanttQuery(resolvedSearchParams, schedule.context.today);

  return (
    <AppShell>
      <DedicatedGanttPage
        projectId={project.id}
        projectName={project.name}
        activities={schedule.activities}
        phases={schedule.phases}
        permissions={schedule.permissions}
        context={schedule.context}
        initialQuery={initialQuery}
      />
    </AppShell>
  );
}
