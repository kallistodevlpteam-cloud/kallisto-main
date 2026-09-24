"use client";

import { CheckCheck, Paperclip, Send, ShieldCheck, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import type { BasicsEngagement, BasicsProvider } from "../types/basics.types";
import styles from "./basics-workspace.module.css";

export interface ProjectChatMessage {
  id: string;
  senderName: string;
  senderRole: string;
  senderAvatar: string;
  timestamp: string;
  text: string;
  isSelf: boolean;
}

export interface EngagementChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  engagement?: { projectName?: string } | BasicsEngagement;
  provider: BasicsProvider;
}

export function EngagementChatModal({
  isOpen,
  onClose,
  engagement,
  provider,
}: EngagementChatModalProps) {
  const projectName = engagement?.projectName ?? "Project";
  const [messages, setMessages] = useState<ProjectChatMessage[]>([]);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const newMessage: ProjectChatMessage = {
      id: `chat-${Date.now()}`,
      senderName: "You",
      senderRole: "Client",
      senderAvatar: "/assets/arjun-avatar.jpg",
      timestamp: "Just now",
      text: trimmed,
      isSelf: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className={styles.chatModalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-modal-title"
    >
      <div
        className={styles.chatModalDialog}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.chatModalHeader}>
          <div className={styles.chatModalHeaderInfo}>
            <div className={styles.chatModalAvatarWrap}>
              <Image
                src={provider.avatarUrl || "/assets/rahul-avatar.jpg"}
                alt={provider.name}
                width={38}
                height={38}
                className={styles.chatModalAvatar}
                unoptimized
              />
              <span className={styles.chatModalOnlineDot} title="Available now" />
            </div>
            <div className={styles.chatModalHeaderTextCol}>
              <h3 id="chat-modal-title" className={styles.chatModalTitle}>
                Chat with {provider.name}
              </h3>
              <p className={styles.chatModalSubtitle}>
                {provider.specializations[0] || "Specialist"} · {projectName}
                <span className={styles.chatOnlineStatusDot}>• Active now</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.chatModalCloseBtn}
            onClick={onClose}
            aria-label="Close chat modal"
            title="Close (Esc)"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>

        {/* Message Feed / Modern Empty State */}
        <div className={styles.chatModalBody}>
          {messages.length === 0 ? (
            <div className={styles.chatFeedEmptyState}>
              <div className={styles.chatEmptyAvatarWrap}>
                <Image
                  src={provider.avatarUrl || "/assets/rahul-avatar.jpg"}
                  alt={provider.name}
                  width={52}
                  height={52}
                  className={styles.chatEmptyAvatar}
                  unoptimized
                />
                <span className={styles.chatEmptyOnlineBadge} title="Available" />
              </div>

              <div className={styles.chatEmptyTextWrap}>
                <div className={styles.chatEmptyNameRow}>
                  <span className={styles.chatEmptyTitle}>{provider.name}</span>
                  <span className={styles.chatVerifiedChip}>
                    <ShieldCheck size={10} aria-hidden="true" />
                    <span>Verified</span>
                  </span>
                </div>
                <span className={styles.chatEmptyRole}>
                  {provider.specializations[0] || "Specialist"} · {projectName}
                </span>
                <p className={styles.chatEmptyDesc}>
                  Direct conversation with {provider.name} for {projectName}. Send a message to coordinate deliverables and milestones.
                </p>
              </div>

              {/* Quick Conversation Starter Chips */}
              <div className={styles.chatQuickPromptsWrap}>
                <span className={styles.chatQuickPromptsLabel}>Quick Messages</span>
                <div className={styles.chatQuickPromptsList}>
                  <button
                    type="button"
                    className={styles.chatPromptChip}
                    onClick={() => {
                      setInputText("Hi, could you please share a quick status update on the upcoming deliverable?");
                    }}
                  >
                    <span>📋 Request deliverable update</span>
                  </button>
                  <button
                    type="button"
                    className={styles.chatPromptChip}
                    onClick={() => {
                      setInputText("Please verify that the latest architectural drawings and site levels are incorporated.");
                    }}
                  >
                    <span>📐 Site dimensions verification</span>
                  </button>
                  <button
                    type="button"
                    className={styles.chatPromptChip}
                    onClick={() => {
                      setInputText("When is the next milestone draft scheduled for client review?");
                    }}
                  >
                    <span>📅 Milestone review schedule</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            messages.map((item) => (
              <div
                key={item.id}
                className={`${styles.chatBubble} ${
                  item.isSelf ? styles.chatBubbleSelf : styles.chatBubbleProvider
                }`}
              >
                {!item.isSelf && (
                  <span className={styles.chatBubbleAuthorName}>{item.senderName}</span>
                )}
                <div className={styles.chatBubbleContent}>{item.text}</div>
                <div className={styles.chatBubbleMeta}>
                  <span>{item.timestamp}</span>
                  {item.isSelf && <CheckCheck size={11} className={styles.chatReadCheck} aria-hidden="true" />}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Fixed Composer at bottom */}
        <div className={styles.chatModalComposerSection}>
          <form onSubmit={handleSendMessage} className={styles.chatFeedComposerBox}>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${provider.name}...`}
              className={styles.chatFeedTextarea}
              rows={2}
            />
            <div className={styles.chatFeedComposerToolbar}>
              <div className={styles.chatFeedToolbarLeft}>
                <button
                  type="button"
                  className={styles.chatFeedToolIconBtn}
                  title="Attach document or drawing"
                  aria-label="Attach file"
                  onClick={() => {
                    setInputText((prev) => (prev ? `${prev} [Attachment]` : "[Attachment]"));
                  }}
                >
                  <Paperclip size={13} aria-hidden="true" />
                  <span className={styles.chatToolBtnLabel}>Attach</span>
                </button>
              </div>

              <div className={styles.chatFeedToolbarRight}>
                <span className={styles.chatSendHint}>Enter ↵</span>
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={styles.chatFeedSendBtn}
                  title="Send message"
                  aria-label="Send message"
                >
                  <Send size={12} aria-hidden="true" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
