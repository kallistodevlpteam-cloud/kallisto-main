"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ArrowRight,
  Sparkles,
  Users,
  Eye,
  FileText,
  CreditCard,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { OdinDuotoneIcon } from "@/components/layout/sidebar-icons";
import { ClientProject } from "../types";
import styles from "./client-overview.module.css";

interface ClientOdinComposerProps {
  currentProject: ClientProject;
  prompt: string;
  onPromptChange: (text: string) => void;
  onSubmitPrompt: (text: string) => void;
  isSubmitting?: boolean;
  onQuickAction?: (actionName: string) => void;
}

export function ClientOdinComposer({
  currentProject,
  prompt,
  onPromptChange,
  onSubmitPrompt,
  isSubmitting = false,
  onQuickAction,
}: ClientOdinComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as text grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [prompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim() && !isSubmitting) {
        onSubmitPrompt(prompt.trim());
      }
    }
  };

  const handleChipClick = (chipText: string) => {
    onPromptChange(chipText);
    onSubmitPrompt(chipText);
  };

  return (
    <div className={styles.odinWorkspaceArea}>
      {/* Hero Header */}
      <div className={styles.odinHeroHeader}>
        <div className={styles.odinBadge}>
          <OdinDuotoneIcon size={14} />
          <span>Odin Project Intelligence</span>
        </div>
        <h1 className={styles.odinTitle}>What do you need to get done?</h1>
        <p className={styles.odinSubtitle}>
          Odin knows your active scope for <strong>{currentProject.name}</strong>, location ({currentProject.location}), and milestone schedule.
        </p>
      </div>

      {/* Conversational Input Card */}
      <div className={styles.odinInputCard}>
        <textarea
          ref={textareaRef}
          className={styles.odinTextarea}
          placeholder="Ask Odin anything about your project... (e.g., 'Find an electrical contractor' or 'What is pending?')"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
          aria-label="Ask Odin anything about your project"
        />

        <div className={styles.odinInputBottom}>
          <div className={styles.odinContextPill}>
            <Sparkles size={13} style={{ color: "#6366f1" }} />
            <span>Inherited: {currentProject.name}</span>
          </div>

          <button
            type="button"
            className={styles.odinSubmitBtn}
            onClick={() => {
              if (prompt.trim() && !isSubmitting) {
                onSubmitPrompt(prompt.trim());
              }
            }}
            disabled={!prompt.trim() || isSubmitting}
            aria-label="Send to Odin"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className={styles.promptChipsRow} aria-label="Suggested prompts">
        {currentProject.suggestedPrompts.map((chip) => (
          <button
            key={chip}
            type="button"
            className={styles.promptChip}
            onClick={() => handleChipClick(chip)}
          >
            <span>{chip}</span>
          </button>
        ))}
      </div>

      {/* Quick Actions Row */}
      <div className={styles.quickActionsRow} aria-label="Project Quick Actions">
        <button
          type="button"
          className={styles.quickActionBtn}
          onClick={() => {
            onQuickAction?.("Find a Provider");
            handleChipClick("Find a verified provider for this project stage.");
          }}
        >
          <Users size={15} className={styles.quickActionIcon} />
          <span>Find a Provider</span>
        </button>

        <button
          type="button"
          className={styles.quickActionBtn}
          onClick={() => {
            onQuickAction?.("View Project");
            handleChipClick("Show me the overall status and progress of this project.");
          }}
        >
          <Eye size={15} className={styles.quickActionIcon} />
          <span>View Project</span>
        </button>

        <button
          type="button"
          className={styles.quickActionBtn}
          onClick={() => {
            onQuickAction?.("Review Documents");
            handleChipClick("Show me the latest drawings and project documents.");
          }}
        >
          <FileText size={15} className={styles.quickActionIcon} />
          <span>Review Documents</span>
        </button>

        <button
          type="button"
          className={styles.quickActionBtn}
          onClick={() => {
            onQuickAction?.("Check Payments");
            handleChipClick("How much have I paid so far?");
          }}
        >
          <CreditCard size={15} className={styles.quickActionIcon} />
          <span>Check Payments</span>
        </button>

        <button
          type="button"
          className={styles.quickActionBtn}
          onClick={() => {
            onQuickAction?.("Schedule");
            handleChipClick("Schedule a site visit.");
          }}
        >
          <Calendar size={15} className={styles.quickActionIcon} />
          <span>Schedule</span>
        </button>

        <button
          type="button"
          className={styles.quickActionBtn}
          onClick={() => {
            onQuickAction?.("Ask Odin");
            handleChipClick("What are the key items requiring my attention?");
          }}
        >
          <MessageSquare size={15} className={styles.quickActionIcon} />
          <span>Ask Odin</span>
        </button>
      </div>
    </div>
  );
}
