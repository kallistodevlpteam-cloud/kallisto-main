"use client";

import { useCallback } from "react";
import { StudioIntent } from "../types/studio-source";
import { useStudioComposer, UseStudioComposerReturn } from "./use-studio-composer";
import { useStudioProjectContext, UseStudioProjectContextReturn } from "./use-studio-project-context";
import { useStudioTaskSession, UseStudioTaskSessionReturn } from "./use-studio-task-session";

export interface UseStudioWorkspaceReturn {
  project: UseStudioProjectContextReturn;
  composer: UseStudioComposerReturn;
  taskSession: UseStudioTaskSessionReturn;
  actions: {
    selectIntent: (intent: StudioIntent) => void;
    submitTask: () => Promise<boolean>;
    reopenDraft: (taskId: string) => Promise<void>;
    startNewTask: () => void;
    selectSuggestedPrompt: (promptText: string) => void;
  };
}

export function useStudioWorkspace(): UseStudioWorkspaceReturn {
  const project = useStudioProjectContext();
  const composer = useStudioComposer();
  const taskSession = useStudioTaskSession();

  const selectIntent = useCallback(
    (intent: StudioIntent) => {
      composer.setSelectedIntent(intent);
    },
    [composer]
  );

  const selectSuggestedPrompt = useCallback(
    (promptText: string) => {
      composer.setPrompt(promptText);
    },
    [composer]
  );

  const submitTask = useCallback(async (): Promise<boolean> => {
    const selectedProject = project.projects.find((p) => p.id === project.selectedProjectId);

    return taskSession.submitTask({
      prompt: composer.prompt,
      sources: composer.attachments,
      selectedProjectId: project.selectedProjectId,
      projectName: selectedProject?.name,
      selectedIntent: composer.selectedIntent,
      selectedAgent: composer.selectedAgent,
      selectedOutputType: composer.selectedOutputType,
      composerVersion: composer.version,
      clearComposer: () => composer.setPrompt(""),
      clearAttachments: () => composer.clearAttachments(),
      restoreDraft: (draft) => composer.restoreDraft(draft),
      getCurrentComposerState: () => ({
        prompt: composer.prompt,
        attachments: composer.attachments,
        version: composer.version,
      }),
    });
  }, [composer, project, taskSession]);

  const startNewTask = useCallback(() => {
    taskSession.startNewTask();
    composer.resetComposer();
  }, [composer, taskSession]);

  const reopenDraft = useCallback(
    async (taskId: string) => {
      await taskSession.reopenTask(taskId);
    },
    [taskSession]
  );

  return {
    project,
    composer,
    taskSession,
    actions: {
      selectIntent,
      submitTask,
      reopenDraft,
      startNewTask,
      selectSuggestedPrompt,
    },
  };
}
