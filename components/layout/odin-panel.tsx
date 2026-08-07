"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  ArrowUp,
  AudioLines,
  ClipboardCheck,
  FileSpreadsheet,
  History,
  MessageSquarePlus,
  Mic,
  Pin,
  PinOff,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { useOdin } from "@/hooks/use-odin";
import { useShellResponsiveState } from "@/lib/layout/shell-responsive-contract";

interface OdinPanelProps {
  onClose: () => void;
}

export function OdinPanel({ onClose }: OdinPanelProps) {
  const { activeContext, activePrompt, odinPinned, toggleOdinPinned } = useOdin();
  const responsiveState = useShellResponsiveState();
  const canDockOdin = responsiveState.canDockOdin;
  const [prevPrompt, setPrevPrompt] = useState(activePrompt);
  const [inputText, setInputText] = useState(activePrompt || "");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (activePrompt !== prevPrompt) {
    setPrevPrompt(activePrompt);
    setInputText(activePrompt);
  }

  const showSendButton = isFocused || inputText.trim().length > 0;

  const pinButtonTitle = !canDockOdin
    ? "More workspace width is required to dock Odin"
    : odinPinned
    ? "Unpin panel (switch to overlay)"
    : "Pin panel to workspace";

  return (
    <aside className="odin-panel" id="odin-panel" aria-label="Odin assistant">
      <header className="odin-header">
        <div className="odin-header-left">
          <button className="odin-action-chip" type="button" aria-label="New chat">
            <Plus size={14} />
            <span>New chat</span>
          </button>
        </div>
        <div className="odin-header-right">
          <button
            type="button"
            className={`odin-icon-btn${odinPinned ? " is-active" : ""}`}
            aria-disabled={!canDockOdin}
            aria-label={pinButtonTitle}
            title={pinButtonTitle}
            tabIndex={0}
            onClick={(e) => {
              if (!canDockOdin) {
                e.preventDefault();
                return;
              }
              toggleOdinPinned();
            }}
            onKeyDown={(e) => {
              if (!canDockOdin && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
              }
            }}
          >
            {odinPinned ? <PinOff size={15} /> : <Pin size={15} />}
          </button>
          <button type="button" className="odin-icon-btn" aria-label="History" title="History">
            <History size={15} />
          </button>
          <button type="button" className="odin-icon-btn" aria-label="New conversation" title="New conversation">
            <MessageSquarePlus size={15} />
          </button>
          <button
            type="button"
            className="odin-icon-btn"
            aria-label="Close assistant panel"
            onClick={onClose}
            title="Close assistant panel"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      <div className="odin-scroll">
        <div className="odin-welcome-card">
          <div className="welcome-header">
            <span className="welcome-orb">
              <Sparkles size={16} />
            </span>
            <h3>Welcome to Odin Assistant!</h3>
          </div>
          <p className="welcome-text">
            These templates are a quick way to manage your workspace, review project requirements, or prepare client deliverables. Tell me what you need and I&apos;ll help you get started.
          </p>
          {activeContext && (
            <div style={{ marginTop: "10px", fontSize: "11px", color: "var(--soft)" }}>
              Context: <strong>{activeContext.source}</strong> ({activeContext.route})
            </div>
          )}
        </div>

        <div className="odin-quick-prompts" aria-label="Suggested prompts">
          <span className="prompts-label">Quick Actions</span>
          <button
            type="button"
            className="prompt-chip"
            onClick={() => setInputText("Summarize today's project activity")}
          >
            <Activity size={15} className="prompt-chip-icon activity-icon" />
            <span>Summarize today&apos;s project activity</span>
          </button>
          <button
            type="button"
            className="prompt-chip"
            onClick={() => setInputText("Review pending client approvals")}
          >
            <ClipboardCheck size={15} className="prompt-chip-icon approval-icon" />
            <span>Review pending client approvals</span>
          </button>
          <button
            type="button"
            className="prompt-chip"
            onClick={() => setInputText("Prepare BOQ variation report")}
          >
            <FileSpreadsheet size={15} className="prompt-chip-icon boq-icon" />
            <span>Prepare BOQ variation report</span>
          </button>
        </div>
      </div>

      <form
        className="odin-chatgpt-bar"
        onSubmit={(event) => event.preventDefault()}
      >
        <button
          type="button"
          className="chatgpt-plus-btn"
          aria-label="Attach file or add action"
          title="Add attachment"
        >
          <Plus size={18} strokeWidth={2} />
        </button>

        <input
          type="text"
          className="chatgpt-input"
          placeholder="Ask Odin"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        <div className="chatgpt-controls-right">
          <button
            type="button"
            className="chatgpt-mic-btn"
            aria-label="Voice input"
            title="Voice input"
          >
            <Mic size={18} strokeWidth={2} />
          </button>

          {showSendButton ? (
            <button
              type="submit"
              className="chatgpt-voice-wave-btn chatgpt-send-btn"
              aria-label="Send message"
              title="Send message"
              onMouseDown={(e) => e.preventDefault()}
            >
              <ArrowUp size={18} strokeWidth={2.5} />
            </button>
          ) : (
            <button
              type="button"
              className="chatgpt-voice-wave-btn"
              aria-label="Voice Mode"
              title="Voice Mode"
            >
              <AudioLines size={18} strokeWidth={2.2} />
            </button>
          )}
        </div>
      </form>
    </aside>
  );
}
