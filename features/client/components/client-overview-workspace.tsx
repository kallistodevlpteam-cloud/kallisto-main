"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import {
  Folder,
  ChevronDown,
  ArrowUp,
  ArrowRight,
  Check,
  RotateCcw,
  Sparkles,
  Users,
  Eye,
  FileText,
  CreditCard,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Clock,
  Plus,
  Building,
  X,
} from "lucide-react";
import {
  HomeDuotoneIcon,
  CalendarDuotoneIcon,
  DocumentsDuotoneIcon,
  EnquiriesDuotoneIcon,
  MicDuotoneIcon,
  OdinDuotoneIcon,
  PaymentsDuotoneIcon,
  ProjectsDuotoneIcon,
  TeamDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { Message, MessageContent, renderMarkdownContent } from "@/components/ui/message";
import { ThinkingIndicator } from "@/components/ui/thinking-indicator";
import { ConversationSpine } from "@/features/studio/components/conversation-spine/conversation-spine";
import { deriveConversationEvents } from "@/features/studio/lib/derive-conversation-events";
import { SuggestionChips } from "@/features/studio/components/assistant-task-response/suggestion-chips";
import { ProviderEnquiryGlanceCard } from "@/features/studio/components/assistant-task-response/provider-enquiry-glance-card";
import { ClientRightSidebar } from "./client-right-sidebar";
import { formatRelativeTime } from "@/lib/utils/format-relative-time";
import { StudioChatMessage, StudioMessageAction } from "@/types/domain/studio-message";
import { ConversationEvent } from "@/types/domain/studio-conversation-event";
import {
  getClientProjects,
  getClientProjectById,
  queryOdinForClient,
} from "../services/client-workspace-mock";
import { ClientProject } from "../types";
import styles from "./client-overview.module.css";

const EXISTING_PROJECT_ACTIONS = [
  {
    label: "Find a Provider",
    prompt: "Find an electrical contractor for this project.",
    icon: TeamDuotoneIcon,
    accentColor: "#0284c7",
    bgTint: "#f0f9ff",
  },
  {
    label: "Check Project",
    prompt: "What is the current status and overall progress of my project?",
    icon: ProjectsDuotoneIcon,
    accentColor: "#16a34a",
    bgTint: "#f0fdf4",
  },
  {
    label: "View Documents",
    prompt: "Show me the latest drawings, revisions, and project documents.",
    icon: DocumentsDuotoneIcon,
    accentColor: "#9333ea",
    bgTint: "#faf5ff",
  },
  {
    label: "Check Payments",
    prompt: "How much have I paid so far, and what milestone payments are coming up?",
    icon: PaymentsDuotoneIcon,
    accentColor: "#ea580c",
    bgTint: "#fff7ed",
  },
  {
    label: "Upcoming",
    prompt: "What are the upcoming deadlines, meetings, and site visits scheduled?",
    icon: CalendarDuotoneIcon,
    accentColor: "#0891b2",
    bgTint: "#ecfeff",
  },
  {
    label: "My Enquiries",
    prompt: "Show my active enquiries, contractor proposals, and quotations.",
    icon: EnquiriesDuotoneIcon,
    accentColor: "#e11d48",
    bgTint: "#fff1f2",
  },
  {
    label: "Ask Odin",
    prompt: "What do I need to approve or pay attention to right now?",
    icon: OdinDuotoneIcon,
    accentColor: "#6366f1",
    bgTint: "#f5f3ff",
  },
];

const NEW_CLIENT_ACTIONS = [
  {
    label: "Start a Project",
    prompt: "I want to start a new construction project and scope my requirements.",
    icon: ProjectsDuotoneIcon,
    accentColor: "#16a34a",
    bgTint: "#f0fdf4",
  },
  {
    label: "Find a Provider",
    prompt: "Find verified architects, structural engineers, and builders.",
    icon: TeamDuotoneIcon,
    accentColor: "#0284c7",
    bgTint: "#f0f9ff",
  },
  {
    label: "Estimate Cost",
    prompt: "Help me estimate construction costs and budget for my new build.",
    icon: PaymentsDuotoneIcon,
    accentColor: "#d97706",
    bgTint: "#fefce8",
  },
  {
    label: "Site Feasibility",
    prompt: "What permits, FAR regulations, and soil tests do I need before building?",
    icon: HomeDuotoneIcon,
    accentColor: "#ea580c",
    bgTint: "#fff7ed",
  },
  {
    label: "Consult Expert",
    prompt: "I'd like a preliminary consultation with a Kallisto project advisor.",
    icon: EnquiriesDuotoneIcon,
    accentColor: "#e11d48",
    bgTint: "#fff1f2",
  },
  {
    label: "Ask Odin",
    prompt: "What are the first steps to building a house with Kallisto?",
    icon: OdinDuotoneIcon,
    accentColor: "#6366f1",
    bgTint: "#f5f3ff",
  },
  {
    label: "Explore Portfolio",
    prompt: "Show me recent luxury residential and commercial projects built on Kallisto.",
    icon: DocumentsDuotoneIcon,
    accentColor: "#9333ea",
    bgTint: "#faf5ff",
  },
];

const EXISTING_PROJECT_SUGGESTIONS = [
  "Draft a client presentation",
  "Find an electrical contractor...",
  "What's pending on my project?...",
  "Show me the latest drawing...",
  "How much have I paid so far?...",
  "Do I have anything to approve?...",
  "Schedule a site visit...",
];

const NEW_CLIENT_SUGGESTIONS = [
  "Draft a client presentation",
  "I want to build a 4BHK contemporary villa in Trivandrum...",
  "Find top architectural firms for luxury residences...",
  "How do I estimate construction costs for a 3,000 sq ft house?...",
  "I have land in Kochi, what permits do I need?...",
  "Find a structural consultant for soil testing...",
];

function useAnimatedPlaceholder(
  suggestions: string[],
  typingSpeed = 45,
  pauseTime = 2200,
  deletingSpeed = 20
) {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentSuggestion = suggestions[index % suggestions.length];

    if (!isDeleting) {
      if (displayedText.length < currentSuggestion.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentSuggestion.slice(0, displayedText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTime);
        return () => clearTimeout(timeout);
      }
    } else {
      if (displayedText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentSuggestion.slice(0, displayedText.length - 1));
        }, deletingSpeed);
        return () => clearTimeout(timeout);
      } else {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % suggestions.length);
      }
    }
  }, [displayedText, isDeleting, index, suggestions, typingSpeed, pauseTime, deletingSpeed]);

  return displayedText;
}

interface ClientChatMessage {
  id: string;
  taskId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  actionType?: "provider_discovery" | "pending_summary" | "drawing_preview" | "payment_summary" | "schedule_visit" | "quote_lookup" | "general";
  structuredData?: Record<string, unknown>;
  actions?: StudioMessageAction[];
}

interface ClientOverviewWorkspaceProps {
  initialProjectId?: string | null;
}

export function ClientOverviewWorkspace({
  initialProjectId,
}: ClientOverviewWorkspaceProps) {
  const projects = getClientProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    initialProjectId !== undefined ? initialProjectId : (projects[0]?.id ?? null)
  );
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<ClientChatMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const isUserScrolledUpRef = useRef(false);

  const isNewClientMode = !selectedProjectId;
  const activeSuggestions = isNewClientMode ? NEW_CLIENT_SUGGESTIONS : EXISTING_PROJECT_SUGGESTIONS;
  const activeQuickActions = isNewClientMode ? NEW_CLIENT_ACTIONS : EXISTING_PROJECT_ACTIONS;

  const animatedPlaceholder = useAnimatedPlaceholder(activeSuggestions);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeDropdownRef = useRef<HTMLDivElement>(null);
  const conversationViewportRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectedProject = selectedProjectId ? getClientProjectById(selectedProjectId) : null;

  // Convert to StudioChatMessage for deriveConversationEvents
  const studioMessages: StudioChatMessage[] = useMemo(() => {
    return messages.map((m) => ({
      id: m.id,
      taskId: m.taskId,
      role: m.role,
      kind: "text",
      content: m.content,
      createdAt: m.createdAt,
      actions: m.actions,
    }));
  }, [messages]);

  // Derive conversation spine events from messages
  const conversationEvents = useMemo<ConversationEvent[]>(() => {
    return deriveConversationEvents({
      messages: studioMessages,
      projectName: selectedProject?.name || "New Project Exploration",
    });
  }, [studioMessages, selectedProject?.name]);

  const scrollToBottom = useCallback((smooth = true) => {
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
  }, []);

  const handleViewportScroll = () => {
    if (!conversationViewportRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = conversationViewportRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isFarFromBottom = distanceFromBottom > 120;
    isUserScrolledUpRef.current = isFarFromBottom;
    setShowJumpToLatest(isFarFromBottom);
  };

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > 0 && !isUserScrolledUpRef.current) {
      scrollToBottom(true);
    }
  }, [messages, isSubmitting, scrollToBottom]);

  // Close project dropdown on outside click
  useEffect(() => {
    if (!isProjectDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const isInsideHero = dropdownRef.current && dropdownRef.current.contains(e.target as Node);
      const isInsideActive = activeDropdownRef.current && activeDropdownRef.current.contains(e.target as Node);
      if (!isInsideHero && !isInsideActive) {
        setIsProjectDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProjectDropdownOpen]);

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
    }
  };

  const searchParams = useSearchParams();
  const promptParam = searchParams.get("prompt") || searchParams.get("q");
  const initialPromptSubmittedRef = useRef(false);

  const handleSubmitPrompt = useCallback(
    async (text: string) => {
      const cleanText = text.trim();
      if (!cleanText) return;

      const userMessage: ClientChatMessage = {
        id: `user-${Date.now()}`,
        taskId: selectedProject?.id || "proj-client",
        role: "user",
        content: cleanText,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputQuery("");
      setIsSubmitting(true);

      try {
        const odinResponse = await queryOdinForClient(cleanText, selectedProject);

        const actions: StudioMessageAction[] = odinResponse.structuredData?.followUpActions
          ? (odinResponse.structuredData.followUpActions as string[]).map((act, i) => ({
              id: `act-${Date.now()}-${i}`,
              label: act,
              intent: "review" as const,
              suggestedPrompt: act,
            }))
          : [];

        const odinMsg: ClientChatMessage = {
          id: `odin-${Date.now()}`,
          taskId: selectedProject?.id || "proj-client",
          role: "assistant",
          content: odinResponse.text,
          createdAt: new Date().toISOString(),
          actions,
          structuredData: odinResponse.structuredData,
          actionType: odinResponse.actionType,
        };

        setMessages((prev) => [...prev, odinMsg]);
      } catch {
        const fallbackMsg: ClientChatMessage = {
          id: `odin-err-${Date.now()}`,
          taskId: selectedProject?.id || "proj-client",
          role: "assistant",
          content: `I encountered an issue retrieving data for ${selectedProject?.name || "your project"}. Please try again.`,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedProject]
  );

  useEffect(() => {
    if (promptParam && !initialPromptSubmittedRef.current) {
      initialPromptSubmittedRef.current = true;
      handleSubmitPrompt(promptParam);
    }
  }, [promptParam, handleSubmitPrompt]);

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      handleSubmitPrompt(inputQuery.trim());
    }
  };

  const handleClearConversation = () => {
    setMessages([]);
    setInputQuery("");
  };

  const isChatActive = messages.length > 0;
  const projectNameDisplay = selectedProject ? selectedProject.name : "Luxury Villa Horizon";

  // Project Dropdown Menu shared renderer
  const renderProjectDropdownMenu = () => (
    <div className={styles.projectDropdownMenu} role="listbox" aria-label="Available projects">
      <div className={styles.projectDropdownHeader}>
        <span>Project Context</span>
      </div>

      {/* Option to explore or start new project */}
      <button
        type="button"
        role="option"
        aria-selected={selectedProjectId === null}
        onClick={() => {
          setSelectedProjectId(null);
          setIsProjectDropdownOpen(false);
        }}
        className={`${styles.projectDropdownItem} ${selectedProjectId === null ? styles.projectDropdownItemActive : ""}`}
      >
        <div>
          <span className={styles.projectDropdownItemName} style={{ color: "#4f46e5" }}>
            ✦ Start New Project / Explore
          </span>
          <span className={styles.projectDropdownItemSub}>
            General discovery, scoping & provider search
          </span>
        </div>
        {selectedProjectId === null && <Check size={14} style={{ color: "#0f172a" }} />}
      </button>

      {projects.map((p) => {
        const isSelected = p.id === selectedProjectId;
        return (
          <button
            key={p.id}
            type="button"
            role="option"
            aria-selected={isSelected}
            onClick={() => {
              setSelectedProjectId(p.id);
              setIsProjectDropdownOpen(false);
            }}
            className={`${styles.projectDropdownItem} ${isSelected ? styles.projectDropdownItemActive : ""}`}
          >
            <div>
              <span className={styles.projectDropdownItemName}>{p.name}</span>
              <span className={styles.projectDropdownItemSub}>
                {p.category} • {p.stage}
              </span>
            </div>
            {isSelected && <Check size={14} style={{ color: "#0f172a" }} />}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={styles.workspaceRoot} aria-label="Client Overview Odin Workspace">
      {/* =========================================================
          STATE A — INITIAL CENTERING HERO VIEW (Hive Studio Workspace Hub)
          ========================================================= */}
      {!isChatActive ? (
        <section className={styles.initialHeroContainer} aria-label="Odin Command Hub">
          {/* Top-Right Toggle Button */}
          <div className={styles.heroTopRightControls}>
            <button
              type="button"
              onClick={() => setIsRightSidebarOpen((prev) => !prev)}
              className={`${styles.rightPanelToggleBtn} ${isRightSidebarOpen ? styles.rightPanelToggleBtnActive : ""}`}
              title={isRightSidebarOpen ? "Close Project Intelligence" : "Open Project Intelligence"}
              aria-label="Toggle Project Intelligence Panel"
              aria-expanded={isRightSidebarOpen}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="4" />
                <line x1="16" y1="8" x2="16" y2="16" />
              </svg>
            </button>
          </div>

          {/* 1. Centered Kallisto Brand Header */}
          <div className={styles.odinBrandHeader}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/kallisto-logo.png"
              alt="Kallisto"
              className={styles.kallistoHeroLogo}
            />
            <p className={styles.odinTagline}>
              {selectedProject
                ? "Your project is already connected. Tell Odin what you need."
                : "Tell Odin what you want to build, design, or explore."}
            </p>
          </div>

          <div className={styles.composerWrapperHero}>
            {/* Exact Hive Studio Chatbox Card */}
            <div className={styles.studioComposerCard} ref={dropdownRef}>
              <form className={styles.studioComposerForm} onSubmit={handleFormSubmit}>
                {/* Top Input Area */}
                <div className={styles.composerTextareaWrap}>
                  <textarea
                    ref={textareaRef}
                    className={styles.composerTextarea}
                    placeholder={animatedPlaceholder ? `Ask Odin: "${animatedPlaceholder}"` : "Ask Odin what you need..."}
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (inputQuery.trim()) {
                          handleSubmitPrompt(inputQuery.trim());
                        }
                      }
                    }}
                    rows={1}
                    disabled={isSubmitting}
                    aria-label="Ask Odin what you need..."
                  />
                </div>

                {/* Bottom Toolbar Row */}
                <div className={styles.composerBottomToolbar}>
                  {/* Left Toolbar Items: Circular Plus & Orange Project Pill */}
                  <div className={styles.composerToolbarLeft}>
                    <button
                      type="button"
                      className={styles.composerPlusBtn}
                      title="Attach documents, drawings, or photos"
                      aria-label="Add attachment"
                    >
                      <Plus size={16} />
                    </button>

                    <div className={styles.projectPillWrap}>
                      <button
                        type="button"
                        className={styles.composerProjectPill}
                        onClick={() => setIsProjectDropdownOpen((prev) => !prev)}
                        title="Select project context"
                        aria-label="Choose project"
                        aria-expanded={isProjectDropdownOpen}
                      >
                        <ProjectsDuotoneIcon size={14} style={{ color: "#ea580c", flexShrink: 0 }} />
                        <span className={styles.composerProjectPillText}>
                          {selectedProjectId && selectedProject ? selectedProject.name : "✦ Start or select project"}
                        </span>
                        <ChevronDown
                          size={12}
                          style={{
                            color: "#ea580c",
                            transform: isProjectDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.15s ease",
                          }}
                        />
                      </button>

                      {isProjectDropdownOpen && renderProjectDropdownMenu()}
                    </div>
                  </div>

                  {/* Right Toolbar Items: 0% used, Mic, and Circular Send Button */}
                  <div className={styles.composerToolbarRight}>
                    <span className={styles.promptUsageText}>
                      {Math.min(100, Math.round((inputQuery.length / 4000) * 100))}% used
                    </span>

                    <button
                      type="button"
                      className={styles.composerMicBtn}
                      title="Voice mode"
                      aria-label="Voice mode"
                    >
                      <MicDuotoneIcon size={18} />
                    </button>

                    <button
                      type="submit"
                      className={`${styles.composerSendBtn} ${inputQuery.trim() ? styles.composerSendBtnActive : ""}`}
                      disabled={!inputQuery.trim() || isSubmitting}
                      onClick={(e) => {
                        if (inputQuery.trim()) {
                          e.preventDefault();
                          handleSubmitPrompt(inputQuery.trim());
                        }
                      }}
                      aria-label="Send to Odin"
                    >
                      <ArrowUp size={16} strokeWidth={2.4} />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* 4. Client Intent Action Dock (7 Squircles) */}
          <div className={styles.quickActionDock} role="navigation" aria-label="Client quick actions">
            {activeQuickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                className={styles.actionDockItem}
                onClick={() => handleSubmitPrompt(action.prompt)}
                style={{
                  ["--item-accent" as string]: action.accentColor,
                  ["--item-bg" as string]: action.bgTint,
                }}
                title={action.label}
              >
                <span className={styles.actionIconSquircle}>
                  <action.icon size={22} className={styles.dockIconSvg} />
                </span>
                <span className={styles.actionDockLabel}>{action.label}</span>
              </button>
            ))}
          </div>
        </section>
      ) : (
        /* =========================================================
           STATE B — HIVE STUDIO INTELLIGENT WORKSPACE ARCHITECTURE
           ========================================================= */
        <div
          className={styles.studioSplitWorkspace}
          data-panel-mode={isRightSidebarOpen ? "open" : "collapsed"}
          aria-label="Active Odin Conversation"
        >
          {/* Main Conversation Pane with Vertical Spine on Left */}
          <div className={styles.studioTaskPane}>
            {/* 1. Left-side Vertical Activity Conversation Spine */}
            {conversationEvents.length > 0 && (
              <ConversationSpine
                events={conversationEvents}
                onJumpToMessage={handleJumpToMessage}
                className={styles.spinePositioner}
              />
            )}

            {/* 2. Scrollable Message Activity Canvas */}
            <div
              ref={conversationViewportRef}
              onScroll={handleViewportScroll}
              className={styles.taskConversationScrollArea}
              role="log"
              aria-live="polite"
            >
              {/* Messages Container Column */}
              <div className={styles.conversationContentColumn}>
                {messages.map((msg) => {
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

                  return (
                    <div key={msg.id} id={`msg-${msg.id}`} className={styles.messageTurnWrap}>
                      <Message
                        role="assistant"
                        timestamp={formatRelativeTime(msg.createdAt)}
                      >
                        <div className={styles.assistantResponseContainer}>
                          {/* Message Markdown Text */}
                          <div className={styles.assistantMarkdownText}>
                            {renderMarkdownContent(msg.content)}
                          </div>

                          {/* 0.0 Provider Confirmation Card */}
                          {Boolean(msg.structuredData?.isProviderConfirmation) && (
                            <ProviderEnquiryGlanceCard
                              providerCard={{
                                providerId: String(msg.structuredData?.providerId || "provider-selected"),
                                name: String(msg.structuredData?.providerName || "Apex Structural Consultants"),
                                packageTitle: String(msg.structuredData?.packageTitle || "Selected Package"),
                                packagePrice: String(msg.structuredData?.packagePrice || "₹5,00,000"),
                                avatarUrl: String(msg.structuredData?.avatarUrl || "/assets/arjun-avatar.jpg"),
                                rating: Number(msg.structuredData?.rating) || 4.8,
                                isVerified: true,
                              }}
                            />
                          )}

                          {/* 0. New Project Scoping Outcome Box */}
                          {Boolean(msg.structuredData?.isNewProjectScoping) && (
                            <div className={styles.studioOutcomeCard}>
                              <div className={styles.studioOutcomeCardHeader}>
                                <Building size={15} style={{ color: "#16a34a" }} />
                                <span>AI Project Scoping & Preliminary Framework</span>
                              </div>
                              <div className={styles.metricsGrid}>
                                <div className={styles.metricItem}>
                                  <span className={styles.metricLabel}>Project Type</span>
                                  <strong className={styles.metricVal}>
                                    {String(msg.structuredData?.projectTitle)}
                                  </strong>
                                </div>
                                <div className={styles.metricItem}>
                                  <span className={styles.metricLabel}>Scale</span>
                                  <strong className={styles.metricVal}>
                                    {String(msg.structuredData?.scopeScale)}
                                  </strong>
                                </div>
                                <div className={styles.metricItem}>
                                  <span className={styles.metricLabel}>Turnkey Est.</span>
                                  <strong className={styles.metricValHighlight}>
                                    {String(msg.structuredData?.estBudget)}
                                  </strong>
                                </div>
                              </div>
                              <div style={{ fontSize: "12px", color: "#334155" }}>
                                <span style={{ fontWeight: 600, display: "block", marginBottom: "4px" }}>
                                  Recommended Project Roadmap:
                                </span>
                                <ul style={{ margin: 0, paddingLeft: "18px", color: "#64748b", lineHeight: "1.6" }}>
                                  {Array.isArray(msg.structuredData?.milestonePhases) &&
                                    (msg.structuredData.milestonePhases as string[]).map((phase, idx) => (
                                      <li key={idx}>{phase}</li>
                                    ))}
                                </ul>
                              </div>
                              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                                <button
                                  type="button"
                                  className={styles.studioActionBtn}
                                  onClick={() => handleSubmitPrompt("Launch Project Brief & Request Proposals")}
                                >
                                  Launch Project Brief
                                </button>
                              </div>
                            </div>
                          )}

                          {/* 0.1 Cost Breakdown Estimator Box */}
                          {Boolean(msg.structuredData?.isCostEstimation) && (
                            <div className={styles.studioOutcomeCard}>
                              <div className={styles.studioOutcomeCardHeader}>
                                <CreditCard size={15} style={{ color: "#d97706" }} />
                                <span>AI Cost & Budget Benchmark Estimate</span>
                              </div>
                              <div className={styles.metricsGrid}>
                                <div className={styles.metricItem}>
                                  <span className={styles.metricLabel}>Structure</span>
                                  <strong className={styles.metricVal}>
                                    {String(msg.structuredData?.structureCost)}
                                  </strong>
                                </div>
                                <div className={styles.metricItem}>
                                  <span className={styles.metricLabel}>Finishes</span>
                                  <strong className={styles.metricVal}>
                                    {String(msg.structuredData?.finishingCost)}
                                  </strong>
                                </div>
                                <div className={styles.metricItem}>
                                  <span className={styles.metricLabel}>MEP Services</span>
                                  <strong className={styles.metricVal}>
                                    {String(msg.structuredData?.mepCost)}
                                  </strong>
                                </div>
                                <div className={styles.metricItemHighlight}>
                                  <span className={styles.metricLabel}>Total Estimate</span>
                                  <strong className={styles.metricVal}>
                                    {String(msg.structuredData?.totalEstimated)}
                                  </strong>
                                </div>
                              </div>
                              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                                <button
                                  type="button"
                                  className={styles.studioActionBtn}
                                  onClick={() => handleSubmitPrompt("Generate Detailed BOQ for 3000 sq ft villa")}
                                >
                                  Generate Detailed BOQ
                                </button>
                              </div>
                            </div>
                          )}

                          {/* 1. Provider Recommendation Outcome Box */}
                          {msg.actionType === "provider_discovery" && msg.structuredData && (
                            <div className={styles.studioOutcomeCard}>
                              <div className={styles.studioOutcomeCardHeader}>
                                <Users size={15} style={{ color: "#0284c7" }} />
                                <span>Pre-Vetted Specialists {selectedProject ? `for ${selectedProject.name}` : ""}</span>
                              </div>
                              {Array.isArray(msg.structuredData.recommendations) &&
                                (msg.structuredData.recommendations as Array<{
                                  name: string;
                                  rating: string;
                                  experience: string;
                                  estRange: string;
                                  badge: string;
                                  availability: string;
                                }>).map((rec, idx) => (
                                  <div key={idx} className={styles.providerResultCard}>
                                    <div>
                                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span className={styles.providerNameTitle}>{rec.name}</span>
                                        <span className={styles.verifiedBadge}>{rec.badge}</span>
                                      </div>
                                      <div className={styles.providerMetaLine}>
                                        {rec.rating} • {rec.experience} • Est: {rec.estRange}
                                      </div>
                                      <div style={{ fontSize: "11.5px", color: "#6366f1", marginTop: "3px" }}>
                                        ✓ {rec.availability}
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      className={styles.studioActionBtn}
                                      onClick={() => handleSubmitPrompt(`Request quotation from ${rec.name}`)}
                                    >
                                      Request Quote
                                    </button>
                                  </div>
                                ))}
                            </div>
                          )}

                          {/* 2. Pending Actions & Approvals Box */}
                          {msg.actionType === "pending_summary" && msg.structuredData && selectedProject && (
                            <div className={styles.studioOutcomeCard}>
                              <div className={styles.studioOutcomeCardHeader}>
                                <Clock size={15} style={{ color: "#ea580c" }} />
                                <span>Action Required • {selectedProject.name}</span>
                              </div>
                              {selectedProject.needsAttention.map((item) => (
                                <div key={item.id} className={styles.providerResultCard}>
                                  <div>
                                    <div className={styles.providerNameTitle}>{item.title}</div>
                                    <div className={styles.providerMetaLine}>{item.description}</div>
                                  </div>
                                  <button
                                    type="button"
                                    className={styles.studioActionBtn}
                                    onClick={() => handleSubmitPrompt(`Proceed with: ${item.title}`)}
                                  >
                                    {item.actionLabel}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 3. Financial & Escrow Summary Box */}
                          {msg.actionType === "payment_summary" && msg.structuredData && (
                            <div className={styles.studioOutcomeCard}>
                              <div className={styles.studioOutcomeCardHeader}>
                                <CreditCard size={15} style={{ color: "#16a34a" }} />
                                <span>Authoritative Financial Ledger & Escrow Status</span>
                              </div>
                              <div className={styles.metricsGrid}>
                                <div className={styles.metricItem}>
                                  <span className={styles.metricLabel}>Total Contract</span>
                                  <strong className={styles.metricVal}>{String(msg.structuredData.totalBudget)}</strong>
                                </div>
                                <div className={styles.metricItem}>
                                  <span className={styles.metricLabel}>Paid to Date</span>
                                  <strong className={styles.metricValHighlight}>{String(msg.structuredData.paidAmount)}</strong>
                                </div>
                                <div className={styles.metricItem}>
                                  <span className={styles.metricLabel}>Pending</span>
                                  <strong className={styles.metricVal}>{String(msg.structuredData.pendingAmount)}</strong>
                                </div>
                              </div>
                              <div className={styles.escrowProtectedNotice}>
                                <ShieldCheck size={14} />
                                <span>{String(msg.structuredData.escrowProtected)}</span>
                              </div>
                            </div>
                          )}

                          {/* 4. Drawing Review Box */}
                          {msg.actionType === "drawing_preview" && msg.structuredData && (
                            <div className={styles.studioOutcomeCard}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  <FileText size={18} style={{ color: "#3b82f6" }} />
                                  <div>
                                    <span className={styles.providerNameTitle}>{String(msg.structuredData.docName)}</span>
                                    <span className={styles.providerMetaLine}>
                                      {String(msg.structuredData.version)} • {String(msg.structuredData.updated)}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className={styles.studioActionBtn}
                                  onClick={() => handleSubmitPrompt(`Approve and sign ${String(msg.structuredData?.docName || "document")}`)}
                                >
                                  Open & Sign
                                </button>
                              </div>
                            </div>
                          )}

                          {/* 5. Schedule Site Visit Box */}
                          {msg.actionType === "schedule_visit" && msg.structuredData && (
                            <div className={styles.studioOutcomeCard}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  <Calendar size={18} style={{ color: "#6366f1" }} />
                                  <div>
                                    <span className={styles.providerNameTitle}>Site Visit at {String(msg.structuredData.location)}</span>
                                    <span className={styles.providerMetaLine}>
                                      Proposed: {String(msg.structuredData.suggestedSlot)} with {String(msg.structuredData.leadProvider)}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className={styles.studioActionBtn}
                                  onClick={() => handleSubmitPrompt(`Confirm site visit for Thursday 10:30 AM`)}
                                >
                                  Confirm Visit
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Follow-up Suggestion Chips matching Hive Studio */}
                          {msg.actions && msg.actions.length > 0 && (
                            <SuggestionChips
                              actions={msg.actions}
                              onActionSelect={(action) => handleSubmitPrompt(action.suggestedPrompt)}
                            />
                          )}
                        </div>
                      </Message>
                    </div>
                  );
                })}

                {/* Thinking / Shimmer State */}
                <ThinkingIndicator
                  active={isSubmitting}
                  variant="dots"
                  label="Odin is analyzing project intelligence..."
                  showElapsed={true}
                />
                <div ref={bottomAnchorRef} style={{ height: 1 }} />
              </div>
            </div>

            {/* 3. Hive Studio Edge Overlay with Floating Jump Button & Exact Studio Chatbox */}
            <div className={styles.studioEdgeOverlay}>
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

              <div className={styles.composerOverlay}>
                <div className={styles.composerInner} ref={activeDropdownRef}>
                  <div className={styles.studioComposerCard}>
                    <form className={styles.studioComposerForm} onSubmit={handleFormSubmit}>
                      {/* Top Input Area */}
                      <div className={styles.composerTextareaWrap}>
                        <textarea
                          className={styles.composerTextarea}
                          placeholder="Continue with Odin..."
                          value={inputQuery}
                          onChange={(e) => setInputQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              if (inputQuery.trim()) {
                                handleSubmitPrompt(inputQuery.trim());
                              }
                            }
                          }}
                          rows={1}
                          disabled={isSubmitting}
                          aria-label="Continue with Odin..."
                        />
                      </div>

                      {/* Bottom Toolbar Row */}
                      <div className={styles.composerBottomToolbar}>
                        {/* Left Toolbar Items: Circular Plus & Orange Project Pill */}
                        <div className={styles.composerToolbarLeft}>
                          <button
                            type="button"
                            className={styles.composerPlusBtn}
                            title="Attach documents, drawings, or photos"
                            aria-label="Add attachment"
                          >
                            <Plus size={16} />
                          </button>

                          <div className={styles.projectPillWrap}>
                            <button
                              type="button"
                              className={styles.composerProjectPill}
                              onClick={() => setIsProjectDropdownOpen((prev) => !prev)}
                              title="Select project context"
                              aria-label="Choose project"
                              aria-expanded={isProjectDropdownOpen}
                            >
                              <ProjectsDuotoneIcon size={14} style={{ color: "#ea580c", flexShrink: 0 }} />
                              <span className={styles.composerProjectPillText}>
                                {selectedProjectId && selectedProject ? selectedProject.name : "✦ Start or select project"}
                              </span>
                              <ChevronDown
                                size={12}
                                style={{
                                  color: "#ea580c",
                                  transform: isProjectDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                                  transition: "transform 0.15s ease",
                                }}
                              />
                            </button>

                            {isProjectDropdownOpen && renderProjectDropdownMenu()}
                          </div>
                        </div>

                        {/* Right Toolbar Items: 0% used, Mic, and Circular Send Button */}
                        <div className={styles.composerToolbarRight}>
                          <span className={styles.promptUsageText}>
                            {Math.min(100, Math.round((inputQuery.length / 4000) * 100))}% used
                          </span>

                          <button
                            type="button"
                            className={styles.composerMicBtn}
                            title="Voice mode"
                            aria-label="Voice mode"
                          >
                            <MicDuotoneIcon size={18} />
                          </button>

                          <button
                            type="submit"
                            className={`${styles.composerSendBtn} ${inputQuery.trim() ? styles.composerSendBtnActive : ""}`}
                            disabled={!inputQuery.trim() || isSubmitting}
                            onClick={(e) => {
                              if (inputQuery.trim()) {
                                e.preventDefault();
                                handleSubmitPrompt(inputQuery.trim());
                              }
                            }}
                            aria-label="Send to Odin"
                          >
                            <ArrowUp size={16} strokeWidth={2.4} />
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: In-flow Split Sidebar Workspace */}
          <div
            className={`${styles.rightSidebarPanelWrapper} ${
              !isRightSidebarOpen ? styles.rightSidebarPanelWrapperCollapsed : ""
            }`}
          >
            {isRightSidebarOpen ? (
              <ClientRightSidebar
                project={selectedProject}
                onClose={() => setIsRightSidebarOpen(false)}
                onSelectPrompt={(promptText) => handleSubmitPrompt(promptText)}
                onNewChat={() => {
                  setMessages([]);
                  setInputQuery("");
                  setIsSubmitting(false);
                }}
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsRightSidebarOpen(true)}
                className={styles.rightPanelToggleBtn}
                title="Open Project Intelligence"
                aria-label="Toggle Project Intelligence Panel"
                aria-expanded={false}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="16" rx="4" />
                  <line x1="16" y1="8" x2="16" y2="16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
