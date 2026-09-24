"use client";

import {
  Check,
  MoreHorizontal,
  Paperclip,
  Send,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
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

export function EngagementChatFeed({
  engagement,
  provider,
}: {
  engagement: BasicsEngagement;
  provider: BasicsProvider;
}) {
  const [messages, setMessages] = useState<ProjectChatMessage[]>([]);
  const [inputText, setInputText] = useState("");

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
    <div className={styles.chatFeedCard} aria-label={`Chat with ${provider.name}`}>
      {/* 1. Header with title and status */}
      <div className={styles.chatFeedHeader}>
        <div className={styles.chatFeedHeaderTitle}>
          <span className={styles.chatFeedOnlineDot} aria-hidden="true" />
          <h3>Chat with {provider.name}</h3>
        </div>
        <div className={styles.chatFeedHeaderRight}>
          <button
            type="button"
            className={styles.chatFeedIconButton}
            aria-label="More options"
            title="Options"
          >
            <MoreHorizontal size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* 2. Messages List or Clean Empty State */}
      <div className={styles.chatFeedList}>
        {messages.length === 0 ? (
          <div className={styles.chatFeedEmptyState}>
            <div className={styles.chatEmptyAvatarWrap}>
              <Image
                src={provider.avatarUrl || "/assets/rahul-avatar.jpg"}
                alt={provider.name}
                width={46}
                height={46}
                className={styles.chatEmptyAvatar}
                unoptimized
              />
              <span className={styles.chatEmptyOnlineBadge} title="Available" />
            </div>
            <div className={styles.chatEmptyTextWrap}>
              <span className={styles.chatEmptyTitle}>{provider.name}</span>
              <span className={styles.chatEmptyRole}>
                {provider.specializations[0] || "Service Provider"}
              </span>
              <p className={styles.chatEmptyDesc}>
                Direct conversation with {provider.name} for {engagement.projectName}. Send a message to coordinate deliverables and milestones.
              </p>
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
                {item.isSelf && <Check size={10} aria-hidden="true" />}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. Bottom Composer sized for 20% width */}
      <div className={styles.chatFeedComposerSection}>
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
            <button
              type="button"
              className={styles.chatFeedToolIconBtn}
              title="Attach document or media"
              aria-label="Attach file"
              onClick={() => {
                setInputText((prev) => (prev ? `${prev} [Attachment]` : "[Attachment]"));
              }}
            >
              <Paperclip size={13} aria-hidden="true" />
            </button>

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
        </form>
      </div>
    </div>
  );
}
