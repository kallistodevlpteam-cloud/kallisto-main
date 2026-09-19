"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  SendHorizontal,
  Paperclip,
  FileText,
  Sparkles,
  CheckCircle2,
  FileCheck,
  Plus,
  Mic,
} from "lucide-react";
import { EnquiryStage } from "../../types/enquiry.types";
import {
  EnquiryChatMessage,
  getEnquiryMessages,
  sendEnquiryMessage,
  subscribeToEnquiryMessages,
} from "../../services/enquiry-clarification-store";
import styles from "./enquiry-clarification-chat.module.css";

export interface EnquiryClarificationChatProps {
  enquiryId: string;
  isClient?: boolean;
  providerName?: string;
  clientName?: string;
  enquiryTitle?: string;
  currentStage?: EnquiryStage;
  currentClientStatus?: string;
  onSendProposal?: () => void;
  onStageChange?: (newStage: EnquiryStage) => void;
  onClientStatusChange?: (newStatus: string) => void;
}

export function EnquiryClarificationChat({
  enquiryId,
  isClient = false,
  providerName = "Kallisto Studio Architects",
  clientName = "Client",
  currentStage = "clarification",
  currentClientStatus,
  onSendProposal,
  onStageChange,
  onClientStatusChange,
}: EnquiryClarificationChatProps) {
  const [messages, setMessages] = useState<EnquiryChatMessage[]>(() =>
    getEnquiryMessages(enquiryId)
  );
  const [inputText, setInputText] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Subscribe to store updates
  useEffect(() => {
    setMessages(getEnquiryMessages(enquiryId));
    const unsubscribe = subscribeToEnquiryMessages(enquiryId, (updated) => {
      setMessages(updated);
    });
    return () => unsubscribe();
  }, [enquiryId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  const hasClientReplied = messages.some((m) => m.sender === "client");
  const isProposalSent =
    currentStage === "proposal" ||
    (currentClientStatus && currentClientStatus.includes("Proposal")) ||
    messages.some((m) => m.content.includes("Official Proposal"));

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const attachments = pendingAttachment
      ? [{ id: `att-${Date.now()}`, name: pendingAttachment, type: "document" as const }]
      : undefined;

    if (isClient) {
      // Client sends reply
      sendEnquiryMessage(enquiryId, {
        sender: "client",
        senderName: clientName,
        senderRole: "Client",
        content: trimmed,
        attachments,
      });
      setInputText("");
      setPendingAttachment(null);
      onClientStatusChange?.("Clarification Provided");
    } else {
      // Provider sends question/clarification
      sendEnquiryMessage(enquiryId, {
        sender: "provider",
        senderName: providerName,
        senderRole: "Service Provider",
        content: trimmed,
        attachments,
      });
      setInputText("");
      setPendingAttachment(null);
      onStageChange?.("clarification");
      onClientStatusChange?.("Clarification Requested");
    }
  };

  const handleSendProposal = () => {
    sendEnquiryMessage(enquiryId, {
      sender: "system",
      senderName: "Kallisto System",
      content: `Official Proposal (V01) submitted by ${providerName}.`,
      proposalRef: {
        version: "V01",
        title: "Official Project Proposal",
        date: new Date().toLocaleDateString("en-IN"),
      },
    });
    onStageChange?.("proposal");
    onClientStatusChange?.("Proposal Received");
    onSendProposal?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingAttachment(file.name);
    }
    e.target.value = "";
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const h12 = hours % 12 || 12;
      const hStr = h12 < 10 ? `0${h12}` : `${h12}`;
      const mStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
      return `${hStr}:${mStr} ${ampm}`;
    } catch {
      return "08:30 PM";
    }
  };

  return (
    <div
      className={styles.chatCard}
      aria-label="Enquiry clarifications chat"
      id="enquiry-clarification-chat"
    >
      {/* Header */}
      <div className={styles.chatHeader}>
        <div className={styles.chatHeaderLeft}>
          <MessageSquare size={16} className={styles.chatHeaderIcon} />
          <span className={styles.chatTitle}>Messages & Clarifications</span>
        </div>

      </div>

      {/* Messages Scrollable List */}
      <div className={styles.messagesList} role="log" aria-live="polite">
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyStateTitle}>No messages yet</span>
            <span>
              {isClient
                ? "The service provider will message here if additional requirements are needed."
                : "Ask the client for additional details before preparing the proposal."}
            </span>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.sender === "system") {
              return (
                <div
                  key={msg.id}
                  className={`${styles.systemNotice} ${styles.proposalNotice}`}
                >
                  <FileCheck size={14} />
                  <span>{msg.content}</span>
                </div>
              );
            }

            const isMe = isClient ? msg.sender === "client" : msg.sender === "provider";

            return (
              <div
                key={msg.id}
                className={`${styles.messageTurn} ${
                  isMe ? styles.messageTurnMe : styles.messageTurnThem
                }`}
              >
                <div className={styles.messageMeta}>
                  {!isMe && (
                    <>
                      <div className={styles.senderAvatar}>
                        <img
                          src="/assets/profile_avatar.png"
                          alt={msg.senderName || providerName}
                          className={styles.avatarImg}
                        />
                      </div>
                      <span className={styles.messageSender}>
                        {msg.senderName || providerName}
                      </span>
                      <span className={styles.metaDot}>•</span>
                    </>
                  )}
                  <span className={styles.metaTime}>{formatTime(msg.timestamp)}</span>
                </div>

                <div
                  className={`${styles.messageBubble} ${
                    isMe ? styles.bubbleMe : styles.bubbleThem
                  }`}
                >
                  <div>{msg.content}</div>

                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className={styles.attachmentsRow}>
                      {msg.attachments.map((att) => (
                        <div
                          key={att.id}
                          className={`${styles.attachmentItem} ${
                            isMe ? styles.attachmentItemMe : ""
                          }`}
                        >
                          <FileText size={12} />
                          <span>{att.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>



      {/* Capsule Composer Bar (Matching Reference Image) */}
      {messages.length > 0 && (
        <form className={styles.capsuleComposerForm} onSubmit={handleSendMessage}>
          {pendingAttachment && (
            <div className={styles.pendingAttachmentRow}>
              <span className={styles.pendingAttachmentBadge}>
                <Paperclip size={11} />
                Attached: {pendingAttachment}
                <button
                  type="button"
                  onClick={() => setPendingAttachment(null)}
                  style={{
                    background: "none",
                    border: "none",
                    marginLeft: 4,
                    cursor: "pointer",
                    fontSize: 11,
                  }}
                >
                  ✕
                </button>
              </span>
            </div>
          )}

          <div className={styles.capsuleComposerBar}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileSelected}
            />

            {/* Plus (+) Icon on Far Left */}
            <button
              type="button"
              className={styles.capsulePlusBtn}
              onClick={() => fileInputRef.current?.click()}
              title="Attach document or reference"
              aria-label="Attach file"
            >
              <Plus size={18} />
            </button>

            {/* Text Input in Center */}
            <input
              type="text"
              className={styles.capsuleInput}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              aria-label={isClient ? "Reply to service provider" : "Clarification question"}
            />

            {/* Mic Icon */}
            <button
              type="button"
              className={styles.capsuleMicBtn}
              title="Voice message"
              aria-label="Voice message"
            >
              <Mic size={18} />
            </button>

            {/* Circular Send Button on Far Right */}
            <button
              type="submit"
              className={styles.capsuleSendBtn}
              disabled={!inputText.trim() && !pendingAttachment}
              title="Send message"
              aria-label="Send message"
            >
              <SendHorizontal size={15} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
