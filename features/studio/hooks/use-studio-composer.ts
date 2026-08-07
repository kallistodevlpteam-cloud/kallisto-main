"use client";

import { useCallback, useState } from "react";
import { StudioAgentType, StudioWorkspaceType } from "@/types/domain/studio";
import { StudioIntent, StudioSource } from "../types/studio-source";
import { STUDIO_INTENTS } from "../lib/studio-intents";

export interface UseStudioComposerReturn {
  prompt: string;
  setPrompt: (text: string) => void;
  attachments: StudioSource[];
  addAttachment: (source: StudioSource) => void;
  removeAttachment: (sourceId: string) => void;
  clearAttachments: () => void;
  selectedIntent: StudioIntent;
  setSelectedIntent: (intent: StudioIntent) => void;
  selectedAgent: StudioAgentType | "auto";
  setSelectedAgent: (agent: StudioAgentType | "auto") => void;
  selectedOutputType: StudioWorkspaceType | null;
  setSelectedOutputType: (type: StudioWorkspaceType | null) => void;
  resetComposer: () => void;
  version: number;
  restoreDraft: (draft: { prompt: string; attachments: StudioSource[] }) => void;
}

export function useStudioComposer(): UseStudioComposerReturn {
  const [prompt, setPromptState] = useState<string>("");
  const [attachments, setAttachmentsState] = useState<StudioSource[]>([]);
  const [selectedIntent, setSelectedIntentState] = useState<StudioIntent>("create");
  const [selectedAgent, setSelectedAgent] = useState<StudioAgentType | "auto">("auto");
  const [selectedOutputType, setSelectedOutputType] = useState<StudioWorkspaceType | null>(null);
  const [version, setVersion] = useState<number>(0);

  const setPrompt = useCallback((text: string) => {
    setPromptState(text);
    setVersion((v) => v + 1);
  }, []);

  const setSelectedIntent = useCallback((intent: StudioIntent) => {
    setSelectedIntentState(intent);
    const config = STUDIO_INTENTS[intent];
    if (config) {
      setSelectedOutputType(config.defaultWorkspaceType);
    }
  }, []);

  const addAttachment = useCallback((source: StudioSource) => {
    setAttachmentsState((prev) => [...prev.filter((item) => item.id !== source.id), source]);
    setVersion((v) => v + 1);
  }, []);

  const removeAttachment = useCallback((sourceId: string) => {
    setAttachmentsState((prev) => prev.filter((item) => item.id !== sourceId));
    setVersion((v) => v + 1);
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachmentsState([]);
  }, []);

  const restoreDraft = useCallback((draft: { prompt: string; attachments: StudioSource[] }) => {
    setPromptState(draft.prompt);
    setAttachmentsState(draft.attachments);
    setVersion((v) => v + 1);
  }, []);

  const resetComposer = useCallback(() => {
    setPromptState("");
    setAttachmentsState([]);
    setSelectedIntentState("create");
    setSelectedAgent("auto");
    setSelectedOutputType(null);
    setVersion((v) => v + 1);
  }, []);

  return {
    prompt,
    setPrompt,
    attachments,
    addAttachment,
    removeAttachment,
    clearAttachments,
    selectedIntent,
    setSelectedIntent,
    selectedAgent,
    setSelectedAgent,
    selectedOutputType,
    setSelectedOutputType,
    resetComposer,
    version,
    restoreDraft,
  };
}
