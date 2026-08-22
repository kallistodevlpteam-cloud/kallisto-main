"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUp, Check, ChevronDown, ChevronRight, X } from "lucide-react";
import {
  DocumentsDuotoneIcon,
  EnquiriesDuotoneIcon,
  MicDuotoneIcon,
  ProjectsDuotoneIcon,
  ZapDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { StudioAgentType, StudioProjectOption } from "@/types/domain/studio";
import { StudioIntent, StudioSource } from "../../types/studio-source";
import { STUDIO_INTENTS } from "../../lib/studio-intents";
import { getProjectDisplayName } from "../project-selector";
import { ComposerAttachmentMenu } from "./composer-attachment-menu";
import { PromptUsage } from "@/components/ui/prompt";
import canvasStyles from "../studio-chat-canvas.module.css";
import { useAnimatedPlaceholder } from "../../hooks/use-animated-placeholder";

const DEFAULT_EXAMPLES = [
  "Prepare a BOQ from the uploaded floor plans",
  "Create a preliminary estimate for this project",
  "Draft a professional client proposal",
  "Analyse drawings and identify missing information",
  "Prepare a site report from photos and notes",
];

const SAMPLE_ACTIVE_PROJECTS = [
  { id: "p1", name: "Villa Design Consultation", code: "PRJ-2026-01" },
  { id: "p2", name: "Nila Residence Fit-out", code: "PRJ-2026-02" },
  { id: "p3", name: "Horizon Bay Villa", code: "PRJ-2026-03" },
  { id: "p4", name: "Emerald Heights Penthouse", code: "PRJ-2026-04" },
];

const SAMPLE_ENQUIRIES = [
  { id: "e1", name: "Villa Design Consultation", code: "ENQ-2026-01" },
  { id: "e2", name: "Skyline Apartment Fit-out", code: "ENQ-2026-02" },
  { id: "e3", name: "Coastal Villa Renovation", code: "ENQ-2026-03" },
  { id: "e4", name: "Metro Commercial Office", code: "ENQ-2026-04" },
];

function getExamplesForIntent(intent: StudioIntent | null): string[] {
  if (!intent) return DEFAULT_EXAMPLES;
  return STUDIO_INTENTS[intent]?.suggestedPrompts ?? DEFAULT_EXAMPLES;
}

export interface StudioComposerProps {
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
  onSelectProject?: (projectId: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  variant?: "idle" | "active";
  outputContextChip?: { id: string; title: string; version: string } | null;
  onRemoveOutputContext?: () => void;
  placeholderOverride?: string;
  focusRef?: React.RefObject<HTMLTextAreaElement | null>;
}

function AnimatedCaret({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: "1.5px",
        height: "1em",
        background: "#94a3b8",
        marginLeft: "1px",
        verticalAlign: "text-bottom",
        animation: "studioCaretBlink 1s step-end infinite",
      }}
    />
  );
}

export function StudioComposer({
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
  isSubmitting = false,
  variant = "idle",
  outputContextChip,
  onRemoveOutputContext,
  placeholderOverride,
  focusRef,
}: StudioComposerProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<"projects" | "enquiries" | null>("projects");

  const projectMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (projectMenuRef.current && !projectMenuRef.current.contains(e.target as Node)) {
        setIsProjectMenuOpen(false);
      }
    };
    if (isProjectMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProjectMenuOpen]);

  const isActive = variant === "active";
  const selectedProject = projects.find((p) => p.id === selectedProjectId) || null;
  const projectDisplay = selectedProject
    ? getProjectDisplayName(selectedProject)
    : "Kallisto Virtual Office Design Brief";

  const canSubmit = (prompt.trim().length > 0 || attachments.length > 0) && !isSubmitting;

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const animationEnabled =
    !isActive &&
    !prefersReducedMotion &&
    prompt === "" &&
    !isFocused &&
    !isSubmitting;

  const examples = getExamplesForIntent(selectedIntent ?? null);

  const { animatedText, isTyping, isDeleting } = useAnimatedPlaceholder({
    examples,
    enabled: animationEnabled,
    initialDelay: 300,
    typingSpeed: 32,
    deletingSpeed: 18,
    holdDuration: 2400,
    betweenDelay: 500,
  });

  const staticFallback = isActive
    ? "Ask Hive Studio to continue, refine or create an output…"
    : prefersReducedMotion && prompt === "" && !isFocused
    ? examples[0]
    : "";

  const overlayText = isActive ? staticFallback : prefersReducedMotion ? staticFallback : animatedText;
  const displayOverlayText = placeholderOverride || overlayText;

  const showOverlay = prompt === "" && !isFocused;
  const showCaret = !isActive && !prefersReducedMotion && (isTyping || isDeleting) && showOverlay;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) onSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit) onSubmit();
    }
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div style={{ width: "100%", position: "relative" }}>
      {/* Recommended Next Action Card directly above textbox (Idle mode) */}
      {!isActive && prompt === "" && (
        <div style={{ marginBottom: "12px" }}>
          <div className={canvasStyles.nextActionCard}>
            <div className={canvasStyles.nextActionLeft}>
              <div className={canvasStyles.nextActionIconWrap}>
                <ZapDuotoneIcon size={16} aria-hidden="true" />
              </div>
              <div className={canvasStyles.nextActionMeta}>
                <span className={canvasStyles.nextActionBadge}>Recommended Next Action</span>
                <h3 className={canvasStyles.nextActionTitle}>
                  Complete the preliminary estimate for {projectDisplay}
                </h3>
                <p className={canvasStyles.nextActionDescription}>
                  Odin can synthesize the structural BOQ, living room material specs, and civil labour rates into an authoritative estimate.
                </p>
              </div>
            </div>

            <button
              type="button"
              className={canvasStyles.nextActionBtn}
              onClick={() =>
                onPromptChange(
                  `Complete the preliminary estimate for ${projectDisplay} synthesizing the BOQ, material specs and current civil labour rates.`
                )
              }
              aria-label={`Complete the preliminary estimate for ${projectDisplay}`}
            >
              <span>Complete estimate</span>
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Main Composer Box */}
      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        <div
          className="studio-composer-box"
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: isActive ? "94px" : "106px",
            padding: "14px 12px 12px 12px",
            border: "none",
            borderRadius: "24px",
            background: "#ffffff",
            boxShadow: "0 4px 24px rgba(15, 23, 42, 0.06), 0 1px 4px rgba(15, 23, 42, 0.02)",
            transition: "box-shadow 0.2s ease",
            position: "relative",
          }}
        >
          {/* Removable Output Context Chip */}
          {outputContextChip && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "3px 8px",
                borderRadius: "6px",
                background: "#f7f7f5",
                border: "none",
                fontSize: "12px",
                fontWeight: 600,
                color: "#0f172a",
                marginBottom: "8px",
                alignSelf: "flex-start",
              }}
            >
              <DocumentsDuotoneIcon size={14} style={{ color: "#059669" }} />
              <span>{outputContextChip.title} · {outputContextChip.version}</span>
              <button
                type="button"
                onClick={onRemoveOutputContext}
                style={{
                  border: "none",
                  background: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  padding: 0,
                  marginLeft: "2px",
                  display: "grid",
                  placeItems: "center",
                }}
                title="Remove context"
                aria-label="Remove output context"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <div style={{ position: "relative", width: "100%" }}>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder=""
              aria-label="Describe what you want Hive Studio to create, analyse, review or resolve"
              rows={isActive ? 2 : 2}
              style={{
                width: "100%",
                minHeight: "44px",
                border: "none",
                outline: "none",
                resize: "none",
                background: "transparent",
                color: "#0f172a",
                fontFamily: "inherit",
                fontSize: "14.5px",
                lineHeight: 1.5,
                fontWeight: 450,
                caretColor: showOverlay ? "transparent" : undefined,
              }}
            />

            {showOverlay && (
              <div
                aria-hidden="true"
                data-testid="animated-placeholder"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  minHeight: "44px",
                  fontSize: "14.5px",
                  lineHeight: 1.5,
                  fontWeight: 400,
                  fontFamily: "inherit",
                  color: "#9ca3af",
                  pointerEvents: "none",
                  userSelect: "none",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflow: "hidden",
                  zIndex: 1,
                }}
              >
                {displayOverlayText}
                <AnimatedCaret visible={showCaret} />
              </div>
            )}
          </div>

          {/* Bottom Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              marginTop: "auto",
              paddingTop: "6px",
              flexWrap: "wrap",
            }}
          >
            {/* Toolbar Left */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ComposerAttachmentMenu
                attachments={attachments}
                onAddAttachment={onAddAttachment}
                onRemoveAttachment={onRemoveAttachment}
              />

              {/* Project Selector Pill (Amber badge theme) */}
              <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                <button
                  type="button"
                  title="Select project context"
                  aria-label="Select project context"
                  onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
                  className="composer-project-pill"
                >
                  <ProjectsDuotoneIcon size={14} style={{ color: "#ea580c", flexShrink: 0 }} />
                  <span>{projectDisplay}</span>
                  <ChevronDown size={12} style={{ color: "#ea580c", opacity: 0.8, marginLeft: "1px" }} />
                </button>

                {isProjectMenuOpen && (
                  <div
                    ref={projectMenuRef}
                    onMouseLeave={() => setHoveredCategory("projects")}
                    style={{
                      position: "absolute",
                      bottom: "34px",
                      left: 0,
                      zIndex: 50,
                      display: "flex",
                      gap: "6px",
                      alignItems: "flex-end",
                    }}
                  >
                    {/* Category Selection Card */}
                    <div
                      style={{
                        width: "195px",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.12)",
                        padding: "6px",
                      }}
                    >
                      <div
                        style={{
                          padding: "4px 8px 6px",
                          fontSize: "10.5px",
                          fontWeight: 650,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        SELECT CONTEXT TYPE
                      </div>

                      <button
                        type="button"
                        onMouseEnter={() => setHoveredCategory("projects")}
                        onClick={() => setHoveredCategory("projects")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          padding: "8px 10px",
                          border: "none",
                          borderRadius: "8px",
                          background: hoveredCategory === "projects" ? "#f7f7f5" : "transparent",
                          color: "#0f172a",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "background-color 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <ProjectsDuotoneIcon size={15} style={{ color: "#7c3aed" }} />
                          <span>Active Projects</span>
                        </div>
                        <ChevronRight size={13} style={{ color: "#64748b" }} />
                      </button>

                      <button
                        type="button"
                        onMouseEnter={() => setHoveredCategory("enquiries")}
                        onClick={() => setHoveredCategory("enquiries")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          padding: "8px 10px",
                          border: "none",
                          borderRadius: "8px",
                          background: hoveredCategory === "enquiries" ? "#f7f7f5" : "transparent",
                          color: "#0f172a",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "background-color 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <EnquiriesDuotoneIcon size={15} style={{ color: "#2563eb" }} />
                          <span>Enquiries</span>
                        </div>
                        <ChevronRight size={13} style={{ color: "#64748b" }} />
                      </button>
                    </div>

                    {/* Hover Flyout Submenu Card */}
                    {hoveredCategory && (
                      <div
                        style={{
                          width: "235px",
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          boxShadow: "0 4px 24px rgba(15, 23, 42, 0.14)",
                          padding: "6px",
                        }}
                      >
                        <div
                          style={{
                            padding: "4px 8px 6px",
                            fontSize: "10.5px",
                            fontWeight: 650,
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {hoveredCategory === "projects" ? "ACTIVE PROJECTS" : "ENQUIRIES"}
                        </div>

                        {hoveredCategory === "projects" &&
                          (projects.length > 0 ? projects : SAMPLE_ACTIVE_PROJECTS).map((proj) => {
                            const isSelected = proj.id === selectedProjectId || (selectedProjectId === null && proj.id === "p1");
                            return (
                              <button
                                key={proj.id}
                                type="button"
                                onClick={() => {
                                  onSelectProject?.(proj.id);
                                  setIsProjectMenuOpen(false);
                                }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  width: "100%",
                                  padding: "7px 10px",
                                  border: "none",
                                  borderRadius: "8px",
                                  background: isSelected ? "#f7f7f5" : "transparent",
                                  color: "#0f172a",
                                  fontSize: "12.5px",
                                  fontWeight: isSelected ? 650 : 500,
                                  cursor: "pointer",
                                  textAlign: "left",
                                  gap: "8px",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                                  <ProjectsDuotoneIcon size={14} style={{ color: "#7c3aed", flexShrink: 0 }} />
                                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {proj.name}
                                  </span>
                                </div>
                                {isSelected && <Check size={13} style={{ color: "#0f172a", flexShrink: 0 }} />}
                              </button>
                            );
                          })}

                        {hoveredCategory === "enquiries" &&
                          SAMPLE_ENQUIRIES.map((enq) => {
                            const isSelected = enq.id === "e1" && (selectedProjectId === "p1" || selectedProjectId === null);
                            return (
                              <button
                                key={enq.id}
                                type="button"
                                onClick={() => {
                                  onSelectProject?.(enq.id);
                                  setIsProjectMenuOpen(false);
                                }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  width: "100%",
                                  padding: "7px 10px",
                                  border: "none",
                                  borderRadius: "8px",
                                  background: isSelected ? "#f7f7f5" : "transparent",
                                  color: "#0f172a",
                                  fontSize: "12.5px",
                                  fontWeight: isSelected ? 650 : 500,
                                  cursor: "pointer",
                                  textAlign: "left",
                                  gap: "8px",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                                  <EnquiriesDuotoneIcon size={14} style={{ color: "#2563eb", flexShrink: 0 }} />
                                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {enq.name}
                                  </span>
                                </div>
                                {isSelected && <Check size={13} style={{ color: "#0f172a", flexShrink: 0 }} />}
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Toolbar Right */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <PromptUsage percentage={Math.min(100, Math.round((prompt.length / 4000) * 100))} />

              <button
                type="button"
                className="chatgpt-mic-btn"
                title="Voice mode"
                aria-label="Voice mode"
              >
                <MicDuotoneIcon size={18} />
              </button>

              <button
                type={canSubmit ? "submit" : "button"}
                disabled={!canSubmit}
                className={`chatgpt-voice-wave-btn${canSubmit ? " chatgpt-send-btn" : ""}`}
                aria-label={canSubmit ? "Send task command" : "Submit prompt"}
                title={canSubmit ? "Send task command" : "Submit prompt"}
              >
                <ArrowUp size={16} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
