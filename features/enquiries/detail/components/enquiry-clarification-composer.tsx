"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  SendHorizontal,
  X,
  File,
  Loader2,
} from "lucide-react";
import styles from "./enquiry-clarification-composer.module.css";

export interface ClarificationAttachment {
  id: string;
  name: string;
  type: "image" | "pdf" | "document";
  previewUrl?: string;
}

export type ClarificationComposerStatus =
  | "idle"
  | "drafting"
  | "ready"
  | "sending"
  | "sent"
  | "failed";

export interface EnquiryClarificationComposerProps {
  initialMessage?: string;
  attachments?: ClarificationAttachment[];
  isSending?: boolean;
  status?: ClarificationComposerStatus;
  onMessageChange?: (message: string) => void;
  onAttach?: () => void;
  onRemoveAttachment?: (attachmentId: string) => void;
  onUseTemplate?: () => void;
  onDraftWithOdin?: () => void;
  onSend?: (message: string) => void;
  onCancel?: () => void;
}

const DEFAULT_MOCK_ATTACHMENTS: ClarificationAttachment[] = [
  {
    id: "att-1",
    name: "Floor Plan.pdf",
    type: "image",
    previewUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "att-2",
    name: "Client Requirement.docx",
    type: "document",
    previewUrl:
      "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "att-3",
    name: "Reference Image.jpg",
    type: "image",
    previewUrl:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=120&q=80",
  },
];

const DEFAULT_INITIAL_MESSAGE =
  "Please confirm whether the quoted budget includes furniture, lighting, MEP scope and execution timelines.";

const ODIN_SUGGESTED_DRAFT =
  "Please confirm whether the quoted budget includes furniture, lighting, MEP scope and execution timelines. Also confirm whether the existing floor plan reflects the final site condition.";

export function EnquiryClarificationComposer({
  initialMessage = DEFAULT_INITIAL_MESSAGE,
  attachments: externalAttachments,
  isSending = false,
  status: externalStatus,
  onMessageChange,
  onAttach,
  onRemoveAttachment,
  onUseTemplate,
  onDraftWithOdin,
  onSend,
  onCancel,
}: EnquiryClarificationComposerProps) {
  const [message, setMessage] = useState(initialMessage);
  const [localAttachments, setLocalAttachments] = useState<
    ClarificationAttachment[]
  >(externalAttachments ?? DEFAULT_MOCK_ATTACHMENTS);
  const [internalStatus, setInternalStatus] =
    useState<ClarificationComposerStatus>("ready");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeStatus = externalStatus ?? (isSending ? "sending" : internalStatus);

  const activeAttachments = externalAttachments ?? localAttachments;

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        40,
        Math.max(20, textareaRef.current.scrollHeight)
      )}px`;
    }
  }, [message]);

  // Keep internal state updated if initialMessage or externalAttachments change
  useEffect(() => {
    if (externalAttachments) {
      setLocalAttachments(externalAttachments);
    }
  }, [externalAttachments]);

  useEffect(() => {
    if (isSending) {
      setInternalStatus("sending");
    }
  }, [isSending]);

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    if (val.length <= 500) {
      setMessage(val);
      setInternalStatus("ready");
      onMessageChange?.(val);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") {
      onCancel?.();
    } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleRemove(id: string) {
    if (onRemoveAttachment) {
      onRemoveAttachment(id);
    } else {
      setLocalAttachments((prev) => prev.filter((a) => a.id !== id));
    }
  }

  function handleAttachClick() {
    onAttach?.();
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: ClarificationAttachment[] = Array.from(files).map((file, idx) => ({
      id: `uploaded-${Date.now()}-${idx}`,
      name: file.name,
      type: "image",
      previewUrl: URL.createObjectURL(file),
    }));

    setLocalAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = "";
  }

  function handleClarifyClick() {
    if (onDraftWithOdin) {
      onDraftWithOdin();
    } else {
      setMessage(ODIN_SUGGESTED_DRAFT);
      setInternalStatus("ready");
    }
  }

  function handleSend() {
    if (!message.trim() || isSending) return;
    setInternalStatus("sending");
    onSend?.(message.trim());
  }

  const isMessageEmpty = !message.trim();
  const visibleAttachments = activeAttachments.slice(0, 3);
  const overflowCount = activeAttachments.length - 3;

  return (
    <div
      className={styles.container}
      aria-label="Clarification request composer"
    >
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Request Clarification</h3>
      </div>

      {/* Floating attachment previews (always rendered to preserve fixed section height) */}
      <div
        className={styles.attachmentsRow}
        aria-label="Attached files preview"
      >
        {activeAttachments.length > 0 && (
          <>
            {visibleAttachments.map((att) => (
              <div
                key={att.id}
                className={styles.thumbItem}
                title={`${att.name} (${att.type})`}
              >
                {att.previewUrl ? (
                  <Image
                    src={att.previewUrl}
                    alt={att.name}
                    width={46}
                    height={46}
                    className={styles.thumbImg}
                  />
                ) : (
                  <div className={styles.thumbFallback}>
                    <File size={18} />
                  </div>
                )}
                <button
                  type="button"
                  className={styles.removeThumbBtn}
                  onClick={() => handleRemove(att.id)}
                  aria-label={`Remove ${att.name}`}
                  title={`Remove ${att.name}`}
                >
                  <X size={10} />
                </button>
              </div>
            ))}

            {overflowCount > 0 && (
              <div
                className={styles.overflowBadge}
                title={`${overflowCount} more attachment(s)`}
              >
                +{overflowCount}
              </div>
            )}
          </>
        )}
      </div>

      {/* Main Composer Card */}
      <div className={styles.card}>
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={message}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="What information do you need from the client?"
          maxLength={500}
          aria-label="Clarification message"
        />

        {/* Character Counter (visible after 400 chars) */}
        {message.length >= 400 && (
          <div
            className={`${styles.charCount} ${
              message.length >= 490 ? styles.charCountLimit : styles.charCountWarn
            }`}
          >
            {message.length} / 500
          </div>
        )}

        {/* Compact Toolbar */}
        <div className={styles.toolbar}>
          {/* Left Actions */}
          <div className={styles.leftGroup}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={handleFileChange}
              data-testid="clarification-image-input"
            />
            <button
              type="button"
              className={styles.iconBtn}
              onClick={handleAttachClick}
              aria-label="Attach file"
              title="Attach image"
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          </div>

          {/* Right Actions */}
          <div className={styles.rightGroup}>
            <button
              type="button"
              className={styles.sendBtn}
              onClick={handleSend}
              disabled={isMessageEmpty || isSending}
              aria-label="Send clarification"
              title="Send clarification"
            >
              {isSending ? (
                <Loader2 size={16} className={styles.spinner} />
              ) : (
                <SendHorizontal size={15} style={{ marginLeft: "1px" }} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
