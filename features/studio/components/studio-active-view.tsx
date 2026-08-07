"use client";

import React, { useState } from "react";
import { StudioProjectOption, StudioTask, StudioWorkspaceType } from "@/types/domain/studio";
import { StudioChatMessage, StudioMessageAction, StudioRetryPayload } from "@/types/domain/studio-message";
import { StudioSource, StudioWorkspaceMode } from "../types/studio-source";
import { StudioActiveTaskCanvas } from "./studio-active-task-canvas";

export interface StudioActiveViewProps {
  task: StudioTask;
  mode: Exclude<StudioWorkspaceMode, "idle">;
  sources: StudioSource[];
  previewOpen: boolean;
  onSubmitFollowUp: (prompt: string) => void;
  onOpenPreview: () => void;
  onClosePreview: () => void;
  onRetry: () => void;
  onStartNewTask: () => void;
}

export function StudioActiveView({
  task,
  mode,
  sources,
  previewOpen,
  onSubmitFollowUp,
  onOpenPreview,
  onClosePreview,
  onRetry,
  onStartNewTask,
}: StudioActiveViewProps) {
  const [followUpText, setFollowUpText] = useState("");
  const [outputsOpen, setOutputsOpen] = useState(true);

  const mockProject: StudioProjectOption = {
    id: task.projectId || "proj-1",
    workspaceId: task.workspaceId || "ws-1",
    name: task.projectName || "Kallisto Virtual Office",
    code: task.projectCode || "KVO-01",
    projectType: "Commercial",
    phase: "Design",
    status: "active",
  };

  const initialMessages: StudioChatMessage[] = [
    {
      id: "msg-user-init",
      taskId: task.id,
      role: "user",
      kind: "text",
      content: task.prompt || "Task Active",
      createdAt: task.createdAt || new Date().toISOString(),
      sources,
    },
    {
      id: "msg-assistant-init",
      taskId: task.id,
      role: "assistant",
      kind: "text",
      content: `Workspace ready for ${task.projectName}.`,
      createdAt: task.createdAt || new Date().toISOString(),
    },
  ];

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", position: "relative" }}>
      <StudioActiveTaskCanvas
        task={task}
        project={mockProject}
        messages={initialMessages}
        outputs={[]}
        taskStatus={mode}
        outputsOpen={outputsOpen}
        isSubmitting={mode === "validating" || mode === "generating"}
        prompt={followUpText}
        onPromptChange={setFollowUpText}
        attachments={sources}
        onAddAttachment={() => {}}
        onRemoveAttachment={() => {}}
        selectedIntent="create"
        selectedAgent={task.createdByAgent || "auto"}
        onAgentChange={() => {}}
        selectedOutputType={task.workspaceType}
        onOutputTypeSelect={(type: StudioWorkspaceType) => setFollowUpText(`Prepare ${type} output`)}
        onActionSelect={(action: StudioMessageAction) => setFollowUpText(action.suggestedPrompt)}
        onOutputsOpenChange={setOutputsOpen}
        onRetryMessage={() => onRetry()}
        onSubmit={() => {
          if (followUpText.trim()) {
            onSubmitFollowUp(followUpText);
            setFollowUpText("");
          }
        }}
        onStartNewTask={onStartNewTask}
      />
    </div>
  );
}
