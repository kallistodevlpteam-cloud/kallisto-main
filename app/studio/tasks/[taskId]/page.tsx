import React from "react";
import { StudioWorkspaceShell } from "@/features/studio/workspaces/studio-workspace-shell";

export interface TaskPageProps {
  params: Promise<{
    taskId: string;
  }>;
}

export default async function StudioTaskPage({ params }: TaskPageProps) {
  const resolvedParams = await params;
  return <StudioWorkspaceShell taskId={resolvedParams.taskId} />;
}
