"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronRight, FilePlus, Loader2, Mic, Plus, RefreshCw, Send, Sparkles } from "lucide-react";
import { StudioAgentType, StudioProjectOption, StudioTask, StudioWorkspaceType } from "@/types/domain/studio";
import { StudioChatMessage, StudioMessageAction, StudioRetryPayload } from "@/types/domain/studio-message";
import { ConversationEvent } from "@/types/domain/studio-conversation-event";
import { StudioIntent, StudioSource, StudioWorkspaceMode } from "../types/studio-source";
import { StudioComposer } from "./studio-composer/studio-composer";
import { Message } from "@/components/ui/message";
import { ThinkingIndicator } from "@/components/ui/thinking-indicator";
import { StudioRightSidebar } from "./studio-right-sidebar";
import { ConversationSpine } from "./conversation-spine/conversation-spine";
import { deriveConversationEvents } from "../lib/derive-conversation-events";
import { AssistantTaskResponse } from "./assistant-task-response/assistant-task-response";
import { formatRelativeTime } from "@/lib/utils/format-relative-time";
import { StudioRightPanelMode, StudioRightPanelState } from "@/types/domain/studio-right-panel";
import styles from "./studio-chat-canvas.module.css";

import { StudioIdleContent } from "./studio-idle-view";

/**
 * Authoritative responsive mode for the StudioActiveTaskCanvas container.
 *
 * desktop : ≥1180 px — side-by-side split view; preview shown in the right column; no backdrop.
 * tablet  : 768–1179 px — overlay drawer; dim-only backdrop behind the preview panel.
 * mobile  : <768 px — full-screen preview occupies the entire workspace; no backdrop needed.
 *
 * Never derive mode using negative conditions (e.g. `!== "desktop"`).
 * The backdrop condition must explicitly check `containerMode === "tablet"`.
 */
export type StudioContainerMode = "desktop" | "tablet" | "mobile";

export interface StudioActiveTaskCanvasProps {
  task?: StudioTask | null;
  project: StudioProjectOption;
  projects?: StudioProjectOption[];
  onSelectProject?: (projectId: string) => void;
  messages: StudioChatMessage[];
  recentTasks?: StudioTask[];
  onSelectIntent?: (intent: StudioIntent) => void;
  onReopenTask?: (taskId: string) => void;
  outputs: Array<{ id: string; title: string; workspaceType: string; status: string }>;
  taskStatus: StudioWorkspaceMode;
  outputsOpen: boolean;
  isSubmitting: boolean;
  prompt: string;
  onPromptChange: (text: string) => void;
  attachments: StudioSource[];
  onAddAttachment: (source: StudioSource) => void;
  onRemoveAttachment: (sourceId: string) => void;
  selectedIntent: StudioIntent;
  selectedAgent: StudioAgentType | "auto";
  onAgentChange: (agent: StudioAgentType | "auto") => void;
  selectedOutputType: StudioWorkspaceType | null;
  onOutputTypeSelect: (type: StudioWorkspaceType) => void;
  onActionSelect: (action: StudioMessageAction) => void;
  onOutputsOpenChange: (open: boolean) => void;
  onRetryMessage: (retryPayload: StudioRetryPayload) => void;
  onSubmit: () => void;
  onStartNewTask: () => void;
}

export function StudioActiveTaskCanvas({
  task,
  project,
  projects = [],
  onSelectProject = () => {},
  messages,
  recentTasks = [],
  onSelectIntent = () => {},
  onReopenTask = () => {},
  outputs,
  taskStatus,
  outputsOpen,
  isSubmitting,
  prompt,
  onPromptChange,
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  selectedIntent,
  selectedAgent,
  onAgentChange,
  selectedOutputType,
  onOutputTypeSelect,
  onActionSelect,
  onOutputsOpenChange,
  onRetryMessage,
  onSubmit,
  onStartNewTask,
}: StudioActiveTaskCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const conversationViewportRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const composerFocusRef = useRef<HTMLTextAreaElement>(null);
  const composerInnerRef = useRef<HTMLDivElement>(null);

  /**
   * Explicit container mode type — never inferred with negative conditions.
   * desktop : ≥1180 px — split preview, no backdrop.
   * tablet  : 768–1179 px — overlay drawer, dim-only backdrop.
   * mobile  : <768 px — full-screen preview, no backdrop.
   */
  const [containerMode, setContainerMode] = useState<StudioContainerMode>("desktop");
  const [panelState, setPanelState] = useState<StudioRightPanelState>({
    mode: "collapsed",
    selectedOutputId: "out-1",
    selectedVersionId: "V01",
  });

  const [outputContextChip, setOutputContextChip] = useState<{ id: string; title: string; version: string } | null>(null);
  const [showJumpToLatest, setShowJumpToLatest] = useState<boolean>(false);
  const [composerHeight, setComposerHeight] = useState<number>(120);
  const [activeGeneratingMsgId, setActiveGeneratingMsgId] = useState<string | null>(() => {
    if (messages.length > 0) {
      const latestMsg = messages[messages.length - 1];
      if (latestMsg && latestMsg.role === "assistant" && latestMsg.kind !== "status") {
        return latestMsg.id;
      }
    }
    return null;
  });
  const prevMessagesCountRef = useRef<number>(messages.length);
  const isUserScrolledUpRef = useRef<boolean>(false);

  useEffect(() => {
    if (messages.length > 0) {
      const latestMsg = messages[messages.length - 1];
      if (latestMsg && latestMsg.role === "assistant" && latestMsg.kind !== "status") {
        if (messages.length > prevMessagesCountRef.current) {
          setActiveGeneratingMsgId(latestMsg.id);
        }
      }
    }
    prevMessagesCountRef.current = messages.length;
  }, [messages]);

  // ResizeObserver for container-width responsiveness (safely guarded for SSR/test envs)
  useEffect(() => {
    if (
      !containerRef.current ||
      typeof window === "undefined" ||
      typeof (window as unknown as { ResizeObserver?: unknown }).ResizeObserver === "undefined"
    ) {
      return;
    }
    const Observer = (
      window as unknown as {
        ResizeObserver: new (cb: (entries: Array<{ contentRect: { width: number } }>) => void) => {
          observe: (el: Element) => void;
          disconnect: () => void;
        };
      }
    ).ResizeObserver;
    const observer = new Observer((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width >= 1180) {
          setContainerMode("desktop");
        } else if (width >= 768) {
          setContainerMode("tablet");
        } else {
          setContainerMode("mobile");
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Dynamic composer height observer
  useEffect(() => {
    if (
      !composerInnerRef.current ||
      typeof window === "undefined" ||
      typeof (window as unknown as { ResizeObserver?: unknown }).ResizeObserver === "undefined"
    ) {
      return;
    }
    const Observer = (
      window as unknown as {
        ResizeObserver: new (cb: (entries: Array<{ contentRect: { height: number } }>) => void) => {
          observe: (el: Element) => void;
          disconnect: () => void;
        };
      }
    ).ResizeObserver;
    const observer = new Observer((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.height > 0) {
          setComposerHeight(Math.round(entry.contentRect.height));
        }
      }
    });
    observer.observe(composerInnerRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToBottom = (smooth = true) => {
    if (conversationViewportRef.current) {
      if (typeof conversationViewportRef.current.scrollTo === "function") {
        conversationViewportRef.current.scrollTo({
          top: conversationViewportRef.current.scrollHeight,
          behavior: smooth ? "smooth" : "auto",
        });
      } else {
        try {
          conversationViewportRef.current.scrollTop = conversationViewportRef.current.scrollHeight;
        } catch {
          // jsdom fallback
        }
      }
      setShowJumpToLatest(false);
      isUserScrolledUpRef.current = false;
    }
  };

  const handleViewportScroll = () => {
    if (!conversationViewportRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = conversationViewportRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    const isFarFromBottom = distanceFromBottom > 100;
    isUserScrolledUpRef.current = isFarFromBottom;
    setShowJumpToLatest(isFarFromBottom);
  };

  // Auto-scroll activity container on new responses only if user is near bottom
  useEffect(() => {
    if (!isUserScrolledUpRef.current) {
      scrollToBottom(true);
    }
  }, [messages, taskStatus]);

  const isProcessing = taskStatus === "validating" || taskStatus === "generating";

  const conversationEvents = useMemo(
    () => deriveConversationEvents({ messages, task, projectName: project.name }),
    [messages, task, project.name]
  );

  const handleJumpToMessage = (messageId: string) => {
    const viewport = conversationViewportRef.current;
    const msgElement = document.getElementById(`msg-${messageId}`);
    if (msgElement && viewport) {
      const viewportRect = viewport.getBoundingClientRect();
      const elementRect = msgElement.getBoundingClientRect();
      const relativeTop = elementRect.top - viewportRect.top + viewport.scrollTop;
      const targetScrollTop = relativeTop - viewport.clientHeight / 2 + elementRect.height / 2;

      if (typeof viewport.scrollTo === "function") {
        viewport.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: "smooth",
        });
      } else {
        viewport.scrollTop = Math.max(0, targetScrollTop);
      }

      msgElement.classList.add(styles.messageHighlighted);
      setTimeout(() => {
        msgElement.classList.remove(styles.messageHighlighted);
      }, 1200);
    }
  };

  const handleOpenEntityFromSpine = (event: ConversationEvent) => {
    if (event.relatedEntityType === "output" || event.relatedEntityType === "proposal" || event.relatedEntityType === "boq") {
      setPanelState({
        mode: "preview",
        selectedOutputId: event.relatedEntityId || "out-1",
        selectedVersionId: event.relatedEntityVersion || "V01",
      });
    }
  };

  const handleRequestChangesFromPreview = () => {
    // Keep preview visible on supported desktop widths!
    if (containerMode !== "desktop") {
      setPanelState({ mode: "outputs", selectedOutputId: "out-1", selectedVersionId: "V01" });
    }
    setOutputContextChip({ id: "out-1", title: "Villa Design Proposal", version: "V01" });
    setTimeout(() => {
      composerFocusRef.current?.focus();
    }, 50);
  };

  const handleRemoveOutputContext = () => {
    setOutputContextChip(null);
  };

  const isSplitPreviewActive = panelState.mode === "preview" && containerMode === "desktop";

  /**
   * Backdrop is rendered only in tablet overlay mode.
   * desktop → split view, no backdrop needed.
   * mobile  → full-screen preview covers the entire workspace, no backdrop.
   * tablet  → overlay drawer over the left task pane; dim the content behind it.
   */
  const showPreviewBackdrop = panelState.mode === "preview" && containerMode === "tablet";

  /**
   * Dismiss the preview overlay while preserving the selected output and version
   * context so reopening returns to the same document.
   */
  const handleBackdropClick = () => {
    setPanelState({
      mode: "outputs",
      selectedOutputId: panelState.selectedOutputId,
      selectedVersionId: panelState.selectedVersionId,
    });
  };

  return (
    <div ref={containerRef} className={styles.studioSplitWorkspace} data-panel-mode={panelState.mode}>
      {/* ── Tablet Backdrop Overlay (dim-only, no blur) ── */}
      {showPreviewBackdrop && (
        <div
          aria-hidden="true"
          onClick={handleBackdropClick}
          className={styles.previewBackdrop}
        />
      )}

      {/* ── LEFT TASK PANE (Positioning owner for conversation viewport & floating composer overlay) ── */}
      <div
        className={styles.studioTaskPane}
        style={{ "--studio-composer-height": `${composerHeight}px` } as React.CSSProperties}
      >
        {/* ── Conversation Spine (Vertical Activity Indicator) ── */}
        {messages.length > 0 && (
          <ConversationSpine
            events={conversationEvents}
            onJumpToMessage={handleJumpToMessage}
            onOpenEntity={handleOpenEntityFromSpine}
          />
        )}

        {/* ROW 1: Task Conversation (Vertical Scroll Owner - Full height) */}
        <div
          ref={conversationViewportRef}
          onScroll={handleViewportScroll}
          className={styles.taskConversationScrollArea}
        >
          <div
            className={`${styles.conversationContentColumn} ${
              isSplitPreviewActive ? styles.conversationContentColumnPreview : ""
            }`}
          >
            {messages.length === 0 ? (
              <StudioIdleContent
                selectedProjectId={project.id}
                projects={projects.length > 0 ? projects : [project]}
                onSelectProject={onSelectProject}
                selectedIntent={selectedIntent}
                onSelectIntent={onSelectIntent}
                recentTasks={recentTasks}
                onReopenTask={onReopenTask}
              />
            ) : (
              messages.map((msg) => {
                if (msg.role === "user") {
                  return (
                    <div key={msg.id} id={`msg-${msg.id}`} className={styles.messageTurnWrap}>
                      <Message
                        role="user"
                        content={msg.content}
                        timestamp={formatRelativeTime(msg.createdAt)}
                      />
                    </div>
                  );
                }

                if (
                  msg.kind === "status" ||
                  msg.kind === "validation" ||
                  msg.content.startsWith("Initialising ") ||
                  msg.content.startsWith("Processing ")
                ) {
                  return (
                    <div key={msg.id} id={`msg-${msg.id}`} className={styles.messageTurnWrap} style={{ margin: "4px 0" }}>
                      <ThinkingIndicator
                        active={true}
                        variant="shimmer"
                        label={msg.content}
                      />
                    </div>
                  );
                }

                const isGeneratingThisMsg = activeGeneratingMsgId === msg.id;

                return (
                  <div key={msg.id} id={`msg-${msg.id}`} className={styles.messageTurnWrap}>
                    <Message
                      role="assistant"
                      status={isGeneratingThisMsg ? "thinking" : "ready"}
                      timestamp={formatRelativeTime(msg.createdAt)}
                    >
                      <AssistantTaskResponse
                        content={msg.content}
                        outputReference={msg.outputReference}
                        task={task}
                        projectName={project.name}
                        clientName="Ananya Builders"
                        budget="₹18L – ₹25L"
                        actions={msg.actions || []}
                        isNewTurn={isGeneratingThisMsg}
                        onAnimationComplete={() => setActiveGeneratingMsgId(null)}
                        onActionSelect={onActionSelect}
                        onPreviewClick={(outputRef) =>
                          setPanelState({
                            mode: "preview",
                            selectedOutputId: outputRef?.outputId || "out-1",
                            selectedVersionId: outputRef?.versionId || "V01",
                          })
                        }
                      />
                      {msg.kind === "error" && msg.retryPayload && (
                        <button
                          type="button"
                          className={styles.retryBtn}
                          onClick={() => onRetryMessage(msg.retryPayload!)}
                        >
                          <RefreshCw size={13} />
                          <span>Retry submission</span>
                        </button>
                      )}
                    </Message>
                  </div>
                );
              })
            )}

            <ThinkingIndicator
              active={isProcessing}
              variant="dots"
              label="Thinking..."
              showElapsed={true}
            />
            <div ref={bottomAnchorRef} style={{ height: 1 }} />
          </div>
        </div>

        {/* ROW 2: Studio Edge Overlay (Unpadded Edge Overlay Layer over Studio Workspace) */}
        <div className={styles.studioEdgeOverlay}>
          {/* Floating "Jump to latest" Control Chip (Separately rendered outside composer) */}
          {showJumpToLatest && (
            <button
              type="button"
              onClick={() => scrollToBottom(true)}
              className={styles.jumpToLatestBtn}
              aria-label="Jump to latest message"
            >
              <ChevronDown size={14} />
              <span>Jump to latest</span>
            </button>
          )}

          {/* Floating Composer Overlay (Overlaid over bottom of Conversation Viewport) */}
          <div className={styles.composerOverlay}>
            <div
              ref={composerInnerRef}
              className={`${styles.composerInner} ${
                isSplitPreviewActive ? styles.composerInnerPreview : ""
              }`}
            >
              <StudioComposer
                variant={messages.length > 0 ? "active" : "idle"}
                prompt={prompt}
                onPromptChange={onPromptChange}
                attachments={attachments}
                onAddAttachment={onAddAttachment}
                onRemoveAttachment={onRemoveAttachment}
                selectedIntent={selectedIntent}
                selectedAgent={selectedAgent}
                onAgentChange={onAgentChange}
                selectedProjectId={project.id}
                projects={[project]}
                onSelectProject={() => {}}
                onSubmit={onSubmit}
                isSubmitting={isProcessing}
                outputContextChip={outputContextChip}
                onRemoveOutputContext={handleRemoveOutputContext}
                placeholderOverride={
                  outputContextChip
                    ? `Request changes to ${outputContextChip.title} ${outputContextChip.version}…`
                    : undefined
                }
                focusRef={composerFocusRef}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN: Authoritative Studio Right Workspace (Outputs & Split Preview Modes) ── */}
      <div
        className={`${styles.rightSidebarPanelWrapper} ${
          panelState.mode === "preview" ? styles.rightSidebarPanelWrapperPreview : ""
        }`}
      >
        <StudioRightSidebar
          task={task}
          panelState={panelState}
          onStateChange={setPanelState}
          onRequestChanges={handleRequestChangesFromPreview}
          recipient={{
            clientId: "client-101",
            name: "Ananya Builders",
            email: "client@ananyabuilders.example.com",
          }}
        />
      </div>
    </div>
  );
}
