"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Send, Paperclip, MessageSquare, CheckCircle2 } from "lucide-react";
import { ProjectUpdate, ProjectUpdateReply } from "@/types/domain/project-update";
import styles from "../projects.module.css";

interface ProjectUpdateThreadDrawerProps {
  update: ProjectUpdate | null;
  open: boolean;
  onClose: () => void;
  onAddReply: (updateId: string, text: string) => Promise<void>;
}

export function ProjectUpdateThreadDrawer({
  update,
  open,
  onClose,
  onAddReply,
}: ProjectUpdateThreadDrawerProps) {
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acknowledgedReplyIds, setAcknowledgedReplyIds] = useState<Set<string>>(new Set());

  if (!open || !update) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddReply(update.id, replyText.trim());
      setReplyText("");
    } catch (err) {
      console.error("Failed to add reply:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.threadDrawerBackdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.threadDrawer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.threadDrawerHeader}>
          <div className={styles.threadDrawerTitleGroup}>
            <MessageSquare size={18} className={styles.threadDrawerIcon} />
            <h3 className={styles.threadDrawerTitle}>Project Discussion</h3>
            <span className={styles.threadDrawerCountBadge}>
              {update.replyCount} {update.replyCount === 1 ? "reply" : "replies"}
            </span>
          </div>
          <button
            type="button"
            className={styles.threadDrawerCloseBtn}
            onClick={onClose}
            aria-label="Close thread drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className={styles.threadDrawerBody}>
          {/* Root Post Card */}
          <div className={styles.threadRootPost}>
            <div className={styles.threadRootAuthor}>
              <div className={styles.postAvatarWrapper}>
                {update.authorAvatar ? (
                  <Image
                    src={update.authorAvatar}
                    alt={update.authorName}
                    width={36}
                    height={36}
                    className={styles.postAvatar}
                    unoptimized
                  />
                ) : (
                  <div className={styles.postAvatarFallback}>
                    {update.authorName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <strong className={styles.postAuthorName}>{update.authorName}</strong>
                <span className={styles.postAuthorRole}> · {update.authorRole}</span>
              </div>
            </div>

            {update.title && <h4 className={styles.threadRootTitle}>{update.title}</h4>}
            {update.body && <p className={styles.threadRootText}>{update.body}</p>}
          </div>

          <div className={styles.threadDividerLabel}>
            <span>Discussion Thread</span>
          </div>

          {/* Replies Stream with Threads-Style Connector Line */}
          <div className={styles.threadRepliesList}>
            {update.replies && update.replies.length > 0 && (
              <div className={styles.drawerThreadConnectorLine} />
            )}
            {(!update.replies || update.replies.length === 0) ? (
              <div className={styles.threadEmptyState}>
                <p>No replies yet. Start the conversation with your team.</p>
              </div>
            ) : (
              update.replies.map((reply: ProjectUpdateReply) => (
                <div key={reply.id} className={styles.threadReplyCard}>
                  <div className={styles.drawerThreadBranchLine} />

                  <div className={styles.threadReplyAvatar}>
                    {reply.authorAvatar ? (
                      <Image
                        src={reply.authorAvatar}
                        alt={reply.authorName}
                        width={32}
                        height={32}
                        className={styles.postAvatar}
                        unoptimized
                      />
                    ) : (
                      <div className={styles.postAvatarFallbackSmall}>
                        {reply.authorName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className={styles.threadReplyContent}>
                    <div className={styles.threadReplyHeader}>
                      <span className={styles.threadReplyAuthor}>
                        {reply.authorName.startsWith("@") ? reply.authorName : `@${reply.authorName}`}
                      </span>
                      <span className={styles.threadReplyRole}> · {reply.authorRole}</span>
                      <span className={styles.threadReplyTime}>
                        {new Date(reply.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className={styles.threadReplyText}>{reply.body}</p>

                    {/* Inline Reply Footer Actions */}
                    <div className={styles.replyItemActions}>
                      <button
                        type="button"
                        className={styles.replyItemActionBtn}
                        onClick={() => {
                          const inputEl = document.querySelector<HTMLTextAreaElement>(`.${styles.threadComposerInput}`);
                          if (inputEl) {
                            inputEl.value = `@${reply.authorName} `;
                            inputEl.focus();
                          }
                        }}
                        title="Reply to user"
                      >
                        <MessageSquare size={13} />
                        <span>Reply</span>
                      </button>

                      <button
                        type="button"
                        className={`${styles.replyItemActionBtn} ${
                          acknowledgedReplyIds.has(reply.id) ? styles.replyItemAckActive : ""
                        }`}
                        onClick={() => {
                          setAcknowledgedReplyIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(reply.id)) {
                              next.delete(reply.id);
                            } else {
                              next.add(reply.id);
                            }
                            return next;
                          });
                        }}
                        title="Acknowledge reply"
                      >
                        <CheckCircle2 size={13} />
                        <span>
                          {acknowledgedReplyIds.has(reply.id) ? "Acknowledged" : "Acknowledge"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reply Composer at Bottom */}
        <form className={styles.threadComposerForm} onSubmit={handleSubmit}>
          <div className={styles.threadComposerInputWrapper}>
            <textarea
              className={styles.threadComposerInput}
              rows={2}
              placeholder="Write a response to the project team..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.threadComposerActions}>
            <button
              type="button"
              className={styles.threadComposerAttachBtn}
              title="Attach file to reply"
            >
              <Paperclip size={15} />
            </button>

            <button
              type="submit"
              className={styles.threadComposerSubmitBtn}
              disabled={!replyText.trim() || isSubmitting}
            >
              <Send size={14} />
              <span>{isSubmitting ? "Sending..." : "Reply"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
