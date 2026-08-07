"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { StudioAgentType, StudioTask, StudioWorkspaceType } from "@/types/domain/studio";
import { StudioChatMessage, StudioRetryPayload } from "@/types/domain/studio-message";
import { StudioIntent, StudioSource, StudioWorkspaceMode } from "../types/studio-source";
import { StudioMockRepository } from "@/services/repositories/studio-mock-repository";
import { StudioService } from "@/services/studio/studio-service";
import { classifyStudioPrompt } from "../lib/classify-studio-prompt";
import { createStudioAssistantResponse } from "../lib/create-studio-assistant-response";
import { resolveStudioAgent } from "../lib/resolve-studio-agent";
import { STUDIO_AGENT_REGISTRY } from "../lib/agent-registry";

export interface SubmitTaskSessionParams {
  prompt: string;
  sources: StudioSource[];
  selectedProjectId: string | null;
  projectName?: string;
  selectedIntent: StudioIntent;
  selectedAgent: StudioAgentType | "auto";
  selectedOutputType: StudioWorkspaceType | null;
  composerVersion: number;
  clearComposer: () => void;
  clearAttachments: () => void;
  restoreDraft: (draft: { prompt: string; attachments: StudioSource[] }) => void;
  getCurrentComposerState: () => { prompt: string; attachments: StudioSource[]; version: number };
}

export interface UseStudioTaskSessionReturn {
  activeTask: StudioTask | null;
  setActiveTask: (task: StudioTask | null) => void;
  workspaceMode: StudioWorkspaceMode;
  setWorkspaceMode: (mode: StudioWorkspaceMode) => void;
  previewOpen: boolean;
  setPreviewOpen: (open: boolean) => void;
  recentTasks: StudioTask[];
  messages: StudioChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<StudioChatMessage[]>>;
  isSubmitting: boolean;
  submitTask: (params: SubmitTaskSessionParams) => Promise<boolean>;
  retryMessage: (retryPayload: StudioRetryPayload) => Promise<boolean>;
  startNewTask: () => void;
  cancelActiveTask: () => void;
  reopenTask: (taskId: string) => Promise<void>;
}

export function useStudioTaskSession(): UseStudioTaskSessionReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeTask, setActiveTask] = useState<StudioTask | null>(null);
  const [workspaceMode, setWorkspaceMode] = useState<StudioWorkspaceMode>("idle");
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [recentTasks, setRecentTasks] = useState<StudioTask[]>([]);
  const [messages, setMessages] = useState<StudioChatMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Restoration Precedence: 1. URL taskId -> 2. Persisted recent task -> 3. Idle
  useEffect(() => {
    let isMounted = true;
    const repository = new StudioMockRepository();
    repository
      .getTasks()
      .then((tasks) => {
        if (!isMounted) return;
        setRecentTasks(tasks);

        const urlTaskId = searchParams.get("task");
        if (urlTaskId) {
          const match = tasks.find((t) => t.id === urlTaskId);
          if (match) {
            setActiveTask(match);
            setWorkspaceMode(match.status === "processing" ? "generating" : "ready");
            return;
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  const startNewTask = useCallback(() => {
    setActiveTask(null);
    setWorkspaceMode("idle");
    setPreviewOpen(false);
    setMessages([]);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem("kallisto_active_studio_prompt");
      window.dispatchEvent(new Event("kallisto_studio_session_updated"));
    }

    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.delete("task");
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.replace(`${pathname}${query}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const cancelActiveTask = useCallback(() => {
    startNewTask();
  }, [startNewTask]);

  const reopenTask = useCallback(
    async (taskId: string) => {
      const repository = new StudioMockRepository();
      const task = await repository.getTaskById(taskId);
      if (task) {
        setActiveTask(task);
        setWorkspaceMode(task.status === "processing" ? "generating" : "ready");
        setPreviewOpen(true);

        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set("task", taskId);
        router.replace(`${pathname}?${current.toString()}`, { scroll: false });
      }
    },
    [pathname, router, searchParams]
  );

  const submitTask = useCallback(
    async (params: SubmitTaskSessionParams): Promise<boolean> => {
      if (isSubmitting || workspaceMode === "validating" || workspaceMode === "generating") {
        return false;
      }

      const submittedPrompt = params.prompt.trim();
      const submittedSources = [...params.sources];

      if (!submittedPrompt && submittedSources.length === 0) {
        return false;
      }

      setIsSubmitting(true);
      setWorkspaceMode("validating");

      // Resolve Task Identity before creating optimistic message
      const taskId = activeTask?.id ?? `task-${Date.now()}`;
      const submissionId = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const userMsgId = `msg-user-${Date.now()}`;
      const composerVersionAtSubmit = params.composerVersion;

      // Create optimistic user message
      const userMsg: StudioChatMessage = {
        id: userMsgId,
        taskId,
        role: "user",
        kind: "text",
        content: submittedPrompt || "[Attachment]",
        createdAt: new Date().toISOString(),
        sources: submittedSources,
      };

      setMessages((prev) => [...prev, userMsg]);

      if (typeof window !== "undefined") {
        window.localStorage.setItem("kallisto_active_studio_prompt", submittedPrompt);
        window.localStorage.setItem("kallisto_active_studio_project", params.projectName ?? "Kallisto Virtual Office");
        window.dispatchEvent(new Event("kallisto_studio_session_updated"));
      }

      // Reset composer & clear queue
      params.clearComposer();
      params.clearAttachments();

      try {

        // Perform classification
        const classification = classifyStudioPrompt(submittedPrompt);

        // Resolve Agent
        const resolution = resolveStudioAgent({
          selectedAgent: params.selectedAgent,
          selectedOutputType: params.selectedOutputType,
          intent: params.selectedIntent,
          sources: submittedSources,
          prompt: submittedPrompt,
        });

        const targetAgent: StudioAgentType =
          params.selectedAgent === "proposal" || params.selectedOutputType === "proposal"
            ? "proposal"
            : resolution.agentId === "auto"
            ? "proposal"
            : resolution.agentId;
        const targetWorkspace: StudioWorkspaceType = params.selectedOutputType || "proposal";

        const task: StudioTask = {
          id: taskId,
          workspaceId: "ws-default",
          projectId: params.selectedProjectId || "proj-default",
          projectCode: "ENQ-2026-01",
          projectName: params.projectName ?? "Villa Design Consultation",
          workspaceType: targetWorkspace,
          useCase: targetWorkspace === "proposal" ? "project_proposal" : "create_detailed_boq",
          startMethod: "scratch",
          status: "draft",
          ownerId: "usr-current",
          ownerName: "Lead Architect",
          createdByAgent: targetAgent,
          intent: params.selectedIntent || "create",
          agentId: targetAgent,
          prompt: submittedPrompt,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setActiveTask(task);

        const isInitialOutputGeneration = messages.length === 0 && (targetAgent === "proposal" || targetWorkspace === "proposal");
        const latestOutputMsg = [...messages].reverse().find((m) => !!m.outputReference);
        const currentVersionId = latestOutputMsg?.outputReference?.versionId || "V01";

        // Pure assistant response factory
        const assistantMsg = createStudioAssistantResponse({
          taskId,
          classification,
          projectName: params.projectName ?? "Villa Design Consultation",
          prompt: submittedPrompt,
          agentResolution: { agentId: targetAgent, agentName: STUDIO_AGENT_REGISTRY[targetAgent]?.name ?? targetAgent },
          isInitialOutputGeneration,
          currentVersionId,
        });

        // Idempotent message append with deduplication guard
        setMessages((prev) => {
          if (prev.some((m) => m.id === assistantMsg.id)) return prev;
          if (
            assistantMsg.outputReference &&
            prev.some(
              (m) =>
                m.outputReference?.outputId === assistantMsg.outputReference?.outputId &&
                m.outputReference?.versionId === assistantMsg.outputReference?.versionId &&
                m.outputReference?.eventType === assistantMsg.outputReference?.eventType
            )
          ) {
            return prev;
          }
          return [...prev, assistantMsg];
        });
        setWorkspaceMode("ready");
        setIsSubmitting(false);
        return true;
      } catch (err) {
        // Safe Rollback check: Only restore if user has NOT edited composer after submission
        const currentComposer = params.getCurrentComposerState();
        const composerWasNotEdited =
          currentComposer.version === composerVersionAtSubmit + 1 &&
          currentComposer.prompt.length === 0 &&
          currentComposer.attachments.length === 0;

        if (composerWasNotEdited) {
          params.restoreDraft({ prompt: submittedPrompt, attachments: submittedSources });
        }

        // Expose retry payload on failed message
        const retryPayload: StudioRetryPayload = {
          taskId,
          submissionId,
          messageId: userMsgId,
          prompt: submittedPrompt,
          sources: submittedSources,
        };

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMsgId
              ? {
                  ...msg,
                  kind: "error",
                  content: `${msg.content} (Submission failed)`,
                  retryPayload,
                }
              : msg
          )
        );

        setWorkspaceMode("failed");
        setIsSubmitting(false);
        return false;
      }
    },
    [activeTask, isSubmitting, workspaceMode]
  );

  const retryMessage = useCallback(
    async (retryPayload: StudioRetryPayload): Promise<boolean> => {
      // Re-use same submissionId, taskId, userMsgId to maintain idempotency
      setWorkspaceMode("validating");
      setIsSubmitting(true);

      // Remove error status on existing user message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === retryPayload.messageId
            ? { ...msg, kind: "text", content: retryPayload.prompt }
            : msg
        )
      );

      try {
        const classification = classifyStudioPrompt(retryPayload.prompt);
        const assistantMsg = createStudioAssistantResponse({
          taskId: retryPayload.taskId,
          classification,
          projectName: activeTask?.projectName ?? "Kallisto Virtual Office",
        });

        setMessages((prev) => [...prev, assistantMsg]);
        setWorkspaceMode("ready");
        setIsSubmitting(false);
        return true;
      } catch (err) {
        setWorkspaceMode("failed");
        setIsSubmitting(false);
        return false;
      }
    },
    [activeTask]
  );

  return {
    activeTask,
    setActiveTask,
    workspaceMode,
    setWorkspaceMode,
    previewOpen,
    setPreviewOpen,
    recentTasks,
    messages,
    setMessages,
    isSubmitting,
    submitTask,
    retryMessage,
    startNewTask,
    cancelActiveTask,
    reopenTask,
  };
}
