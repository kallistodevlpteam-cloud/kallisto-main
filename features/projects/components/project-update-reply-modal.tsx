"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Image as ImageIcon, Paperclip, Smile } from "lucide-react";
import { ProjectUpdate, ProjectUpdateReply } from "@/types/domain/project-update";
import styles from "../projects.module.css";

interface ProjectUpdateReplyModalProps {
  open: boolean;
  onClose: () => void;
  update: ProjectUpdate | null;
  targetReply?: ProjectUpdateReply | null;
  replyingToAuthor?: string;
  onSendReply: (updateId: string, text: string) => Promise<void>;
}

export function ProjectUpdateReplyModal({
  open,
  onClose,
  update,
  targetReply,
  replyingToAuthor,
  onSendReply,
}: ProjectUpdateReplyModalProps) {
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setReplyText("");
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }, [open]);

  if (!open || !update) return null;

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSendReply(update.id, replyText.trim());
      setReplyText("");
      onClose();
    } catch (err) {
      console.error("Failed to post reply:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewAuthorName = targetReply ? targetReply.authorName : update.authorName;
  const previewAuthorRole = targetReply ? targetReply.authorRole : update.authorRole;
  const previewAuthorAvatar = targetReply ? targetReply.authorAvatar : update.authorAvatar;
  const previewText = targetReply ? targetReply.body : update.body;
  const previewTime = targetReply ? targetReply.createdAt : update.createdAt;

  const targetAuthor = replyingToAuthor || previewAuthorName;
  const formattedAuthor = targetAuthor.startsWith("@") ? targetAuthor : `@${targetAuthor}`;

  return (
    <div className={styles.replyModalOverlay} onClick={onClose}>
      <div
        className={styles.replyModalCard}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={styles.replyModalHeader}>
          <button
            type="button"
            className={styles.replyModalCloseBtn}
            onClick={onClose}
            aria-label="Close reply modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className={styles.replyModalBody}>
          {/* Target Post Preview Block */}
          <div className={styles.replyModalPostPreview}>
            <div className={styles.replyModalAvatarCol}>
              <div className={styles.replyModalAvatarWrapper}>
                {previewAuthorAvatar ? (
                  <Image
                    src={previewAuthorAvatar}
                    alt={previewAuthorName}
                    width={36}
                    height={36}
                    className={styles.postAvatar}
                    unoptimized
                  />
                ) : (
                  <div className={styles.postAvatarFallback}>
                    {previewAuthorName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className={styles.replyModalThreadLine} />
            </div>

            <div className={styles.replyModalPostContent}>
              <div className={styles.replyModalAuthorHeader}>
                <strong className={styles.replyModalAuthorName}>{previewAuthorName}</strong>
                <span className={styles.replyModalAuthorRole}> · {previewAuthorRole}</span>
                <span className={styles.replyModalPostTime}>
                  {" "}
                  ·{" "}
                  {typeof previewTime === "string" && previewTime.includes("T")
                    ? new Date(previewTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : previewTime}
                </span>
              </div>
              <p className={styles.replyModalPostText}>{previewText}</p>
              <div className={styles.replyModalReplyingTo}>
                Replying to <span className={styles.replyModalHandle}>{formattedAuthor}</span>
              </div>
            </div>
          </div>

          {/* User Reply Input Row */}
          <form onSubmit={handleModalSubmit} className={styles.replyModalForm}>
            <div className={styles.replyModalInputRow}>
              <div className={styles.replyModalAvatarWrapper}>
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="Current User"
                  width={36}
                  height={36}
                  className={styles.postAvatar}
                  unoptimized
                />
              </div>

              <div className={styles.replyModalTextareaWrapper}>
                <textarea
                  ref={textareaRef}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Post your reply"
                  className={styles.replyModalTextarea}
                  rows={3}
                />
              </div>
            </div>

            {/* Footer Toolbar & Action */}
            <div className={styles.replyModalFooter}>
              <div className={styles.replyModalToolbar}>
                <button type="button" className={styles.replyModalToolBtn} title="Add image">
                  <ImageIcon size={18} />
                </button>
                <button type="button" className={styles.replyModalToolBtn} title="Attach file">
                  <Paperclip size={18} />
                </button>
                <button type="button" className={styles.replyModalToolBtn} title="Add emoji">
                  <Smile size={18} />
                </button>
              </div>

              <button
                type="submit"
                className={styles.replyModalSubmitBtn}
                disabled={!replyText.trim() || isSubmitting}
              >
                {isSubmitting ? "Posting..." : "Reply"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
