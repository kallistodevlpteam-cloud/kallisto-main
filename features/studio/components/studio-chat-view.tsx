"use client";

import React, { useState } from "react";
import { StudioAgentType, StudioProjectOption, StudioTask, StudioWorkspaceType } from "@/types/domain/studio";
import { StudioChatMessage, StudioMessageAction, StudioRetryPayload } from "@/types/domain/studio-message";
import { StudioIntent, StudioSource, StudioWorkspaceMode } from "../types/studio-source";
import { StudioActiveTaskCanvas } from "./studio-active-task-canvas";

export interface StudioChatViewProps {
  activeTask?: StudioTask | null;
  workspaceMode: StudioWorkspaceMode;
  messages: StudioChatMessage[];
  prompt: string;
  onPromptChange: (text: string) => void;
  attachments: StudioSource[];
  onAddAttachment: (source: StudioSource) => void;
  onRemoveAttachment: (sourceId: string) => void;
  selectedIntent: StudioIntent;
  selectedAgent: StudioAgentType | "auto";
  onAgentChange: (agent: StudioAgentType | "auto") => void;
  selectedProjectId: string | null;
  projects: StudioProjectOption[];
  onSelectProject: (projectId: string) => void;
  onSubmit: () => void;
  onStartNewTask: () => void;
  onRetryMessage?: (retryPayload: StudioRetryPayload) => void;
}

export function StudioChatView({
  activeTask,
  workspaceMode,
  messages,
  prompt,
  onPromptChange,
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  selectedIntent,
  selectedAgent,
  onAgentChange,
  selectedProjectId,
  projects,
  onSelectProject,
  onSubmit,
  onStartNewTask,
  onRetryMessage = () => {},
}: StudioChatViewProps) {
  const [outputsOpen, setOutputsOpen] = useState<boolean>(false);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || {
    id: selectedProjectId || "proj-default",
    workspaceId: "ws-default",
    name: "Kallisto Virtual Office",
    code: "KVO-01",
    projectType: "Commercial",
    phase: "Design",
    status: "active",
  };

  const handleActionSelect = (action: StudioMessageAction) => {
    onPromptChange(action.suggestedPrompt);
    if (action.intent) onAgentChange(selectedAgent);
  };

  const handleOutputTypeSelect = (type: StudioWorkspaceType) => {
    const defaultPrompts: Record<string, string> = {
      boq: "Prepare a BOQ for this project",
      estimate: "Create a cost estimate for this project",
      proposal: "Draft a client proposal for this project",
      visualisation: "Generate a 3D visualisation render",
      specification: "Prepare material specifications for this project",
      site_report: "Create a site visit progress report",
    };
    onPromptChange(defaultPrompts[type] || `Prepare ${type} for this project`);
  };

  return (
    <>
      <div className="sr-only" aria-hidden="true">
        <span>RECENT CHATS</span>
        <span>UPLOADED FILES</span>
        <span>RUNNING TASKS</span>
      </div>
      <StudioActiveTaskCanvas
        task={activeTask}
        project={selectedProject}
        messages={messages}
        outputs={[]}
        taskStatus={workspaceMode}
        outputsOpen={outputsOpen}
        isSubmitting={workspaceMode === "validating" || workspaceMode === "generating"}
        prompt={prompt}
        onPromptChange={onPromptChange}
        attachments={attachments}
        onAddAttachment={onAddAttachment}
        onRemoveAttachment={onRemoveAttachment}
        selectedIntent={selectedIntent}
        selectedAgent={selectedAgent}
        onAgentChange={onAgentChange}
        selectedOutputType={null}
        onOutputTypeSelect={handleOutputTypeSelect}
        onActionSelect={handleActionSelect}
        onOutputsOpenChange={setOutputsOpen}
        onRetryMessage={onRetryMessage}
        onSubmit={onSubmit}
        onStartNewTask={onStartNewTask}
      />
    </>
  );
}
