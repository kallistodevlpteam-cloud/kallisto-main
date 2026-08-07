"use client";

import React, { useState, useRef, useLayoutEffect } from "react";
import Image from "next/image";
import {
  MoreHorizontal,
  Pin,
  FileText,
  MessageSquare,
  BadgeCheck,
  Share2,
  Shield,
  ClipboardCheck,
  CheckCircle2,
  Download,
  Lock,
  Flag,
  ChevronRight,
  CheckSquare,
  ShieldCheck,
  ClipboardList,
  FileSpreadsheet,
  CreditCard,
  FileDiff,
} from "lucide-react";
import { ProjectUpdate, ProjectUpdateType, ProjectUpdateReply } from "@/types/domain/project-update";
import { ProjectUpdateMediaGrid } from "./project-update-media-grid";
import { ProjectUpdateReplyModal } from "./project-update-reply-modal";
import styles from "../projects.module.css";

interface ProjectUpdatePostProps {
  update: ProjectUpdate;
  onAcknowledge?: (id: string) => void;
  onSave?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onAddReply?: (updateId: string, text: string) => Promise<void>;
}

export function ProjectUpdatePost({
  update,
  onAcknowledge,
  onSave,
  onTogglePin,
  onAddReply,
}: ProjectUpdatePostProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRepliesExpanded, setIsRepliesExpanded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [acknowledgedReplyIds, setAcknowledgedReplyIds] = useState<Set<string>>(new Set());
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyingAuthor, setReplyingAuthor] = useState<string>(update.authorName);
  const [targetReplyItem, setTargetReplyItem] = useState<ProjectUpdateReply | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  const postRef = useRef<HTMLElement | null>(null);
  const mainAvatarRef = useRef<HTMLDivElement | null>(null);
  const lastReplyAvatarRef = useRef<HTMLDivElement | null>(null);

  const replies = update.replies ?? [];
  const visibleReplies = isRepliesExpanded ? replies : replies.slice(0, 2);
  const lastVisibleReplyId =
    visibleReplies.length > 0 ? visibleReplies[visibleReplies.length - 1].id : null;

  const [connectorStyle, setConnectorStyle] = useState<React.CSSProperties | null>(null);

  useLayoutEffect(() => {
    if (!postRef.current || !mainAvatarRef.current || !lastReplyAvatarRef.current || visibleReplies.length === 0) {
      setConnectorStyle(null);
      return;
    }

    const updateLine = () => {
      if (!postRef.current || !mainAvatarRef.current || !lastReplyAvatarRef.current) return;
      const postRect = postRef.current.getBoundingClientRect();
      const mainAvatarRect = mainAvatarRef.current.getBoundingClientRect();
      const lastAvatarRect = lastReplyAvatarRef.current.getBoundingClientRect();

      const startY = mainAvatarRect.top - postRect.top + mainAvatarRect.height / 2;
      const endY = lastAvatarRect.top - postRect.top + lastAvatarRect.height / 2;

      setConnectorStyle({
        top: `${startY}px`,
        height: `${Math.max(0, endY - startY)}px`,
      });
    };

    updateLine();

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            updateLine();
          })
        : null;

    if (observer) {
      if (postRef.current) observer.observe(postRef.current);
      if (mainAvatarRef.current) observer.observe(mainAvatarRef.current);
      if (lastReplyAvatarRef.current) observer.observe(lastReplyAvatarRef.current);
    }

    window.addEventListener("resize", updateLine);

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener("resize", updateLine);
    };
  }, [lastVisibleReplyId, isRepliesExpanded, update.replies]);

  const handleToggleReplyAck = (replyId: string) => {
    setAcknowledgedReplyIds((prev) => {
      const next = new Set(prev);
      if (next.has(replyId)) {
        next.delete(replyId);
      } else {
        next.add(replyId);
      }
      return next;
    });
  };
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);

  const documentAttachments = update.attachments?.filter((att) => att.type === "document") || [];
  const imageAttachments = update.attachments?.filter((att) => att.type === "image") || [];

  // Relative time helper
  const getRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      if (diffMinutes < 60) return `${Math.max(1, diffMinutes)}m`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d`;
      return date.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
    } catch {
      return isoString;
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}${window.location.pathname}#${update.id}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Render restrained tag pill
  const renderTagPill = (type: ProjectUpdateType) => {
    switch (type) {
      case "milestone":
        return (
          <span className={styles.refTagPillGreen}>
            <span className={styles.tagDotGreen}>◆</span> Milestone update
          </span>
        );
      case "task_completed":
        return (
          <span className={styles.refTagPillGreen}>
            <span className={styles.tagDotGreen}>●</span> Task completed
          </span>
        );
      case "document_uploaded":
        return (
          <span className={styles.refTagPillBlueNeutral}>
            <span className={styles.tagDotBlue}>●</span> Document uploaded
          </span>
        );
      case "approval_requested":
        return (
          <span className={styles.refTagPillAmber}>
            <span className={styles.tagDotAmber}>●</span> Approval requested
          </span>
        );
      case "approval_decided":
        return (
          <span className={styles.refTagPillPurple}>
            <span className={styles.tagDotPurple}>◆</span> Design revision
          </span>
        );
      case "site_report":
        return (
          <span className={styles.refTagPillPurple}>
            <span className={styles.tagDotPurple}>●</span> Site report
          </span>
        );
      case "issue":
        return (
          <span className={styles.refTagPillRed}>
            <span className={styles.tagDotRed}>●</span> Issue raised
          </span>
        );
      case "variation":
        return (
          <span className={styles.refTagPillAmber}>
            <span className={styles.tagDotAmber}>●</span> Variation
          </span>
        );
      case "payment":
        return (
          <span className={styles.refTagPillGreen}>
            <span className={styles.tagDotGreen}>●</span> Payment update
          </span>
        );
      default:
        return (
          <span className={styles.refTagPillBlueNeutral}>
            <span className={styles.tagDotBlue}>●</span> Project update
          </span>
        );
    }
  };

  // Determine if body content is long (>280 chars or multi-line)
  const isLongContent = (update.body?.length || 0) > 280;
  const displayedBody = isLongContent && !isExpanded ? `${update.body?.slice(0, 280)}...` : update.body;

  // Helpers for compact linked-record strip formatting
  const getLinkedEntityIcon = (type: string) => {
    switch (type) {
      case "task":
        return <CheckSquare size={14} />;
      case "milestone":
        return <Flag size={14} />;
      case "document":
        return <FileText size={14} />;
      case "approval":
        return <ShieldCheck size={14} />;
      case "site_report":
        return <ClipboardList size={14} />;
      case "boq":
        return <FileSpreadsheet size={14} />;
      case "payment":
        return <CreditCard size={14} />;
      case "variation":
        return <FileDiff size={14} />;
      default:
        return <Flag size={14} />;
    }
  };

  const getLinkedEntityLabel = (type: string) => {
    switch (type) {
      case "task":
        return "Task";
      case "milestone":
        return "Milestone";
      case "document":
        return "Document";
      case "approval":
        return "Approval";
      case "site_report":
        return "Site Report";
      case "boq":
        return "BOQ";
      case "payment":
        return "Payment";
      case "variation":
        return "Variation";
      default:
        return type.replace("_", " ");
    }
  };

  // Helper for status-based border left color indicator on linked entities
  const getLinkedEntityStatusClass = (status?: string) => {
    if (!status) return "";
    const s = status.toLowerCase();
    if (s === "completed" || s === "approved" || s === "verified") {
      return styles.projectUpdateLinkedEntitySuccess;
    }
    if (s === "pending" || s === "in review" || s === "in_review") {
      return styles.projectUpdateLinkedEntityWarning;
    }
    if (s === "overdue" || s === "rejected" || s === "critical") {
      return styles.projectUpdateLinkedEntityCritical;
    }
    return "";
  };

  return (
    <article
      ref={postRef}
      className={`${styles.projectUpdatePost} ${
        update.replies && update.replies.length > 0 ? styles.hasThreadReplies : ""
      }`}
      id={update.id}
    >
      {/* Dynamic Single Connector Line */}
      {connectorStyle && (
        <div className={styles.mainAvatarThreadLine} style={connectorStyle} />
      )}

      {/* Left Avatar Column */}
      <div className={styles.projectUpdateAvatarColumn}>
        <div ref={mainAvatarRef} className={styles.projectUpdateAvatar}>
          {update.authorAvatar && !avatarError ? (
            <Image
              src={update.authorAvatar}
              alt={update.authorName}
              width={32}
              height={32}
              className={styles.postAvatar}
              onError={() => setAvatarError(true)}
              unoptimized
            />
          ) : (
            <div className={styles.postAvatarFallback}>
              {update.authorName.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Main Post Container */}
      <div className={styles.projectUpdatePostMain}>
          {/* Header Row */}
        <header className={styles.projectUpdateHeader}>
          <div className={styles.projectUpdateAuthorMeta}>
            <div className={styles.refAuthorRow}>
              <strong className={styles.refAuthorName}>
                {update.authorName}
              </strong>
              <BadgeCheck size={14} className={styles.refAuthorVerifiedBadge} />
              <span className={styles.refAuthorRole}>· {update.authorRole}</span>
              <span className={styles.refPostTime}>· {getRelativeTime(update.createdAt)}</span>
            </div>

            {/* Type badge on its own row */}
            <div className={styles.refTagRow}>
              {renderTagPill(update.type)}
            </div>

            {/* Pinned label inline */}
            {update.isPinned && (
              <span className={styles.projectUpdatePinnedInline}>
                <Pin size={12} className={styles.pinnedNoticeIcon} />
                <span>Pinned by {update.pinnedBy || "Arjun Mehta"}</span>
              </span>
            )}

            {/* Visibility Badge if non-standard */}
            {update.visibility === "internal" && (
              <span className={styles.visibilityBadgeInternal} title="Visible to internal team only">
                <Lock size={11} /> Internal
              </span>
            )}
            {update.visibility === "client_visible" && (
              <span className={styles.visibilityBadgeClient} title="Visible to client">
                <Shield size={11} /> Client visible
              </span>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              className={styles.refIconButton}
              onClick={() => setShowOverflowMenu((prev) => !prev)}
              aria-label="Update options"
            >
              <MoreHorizontal size={16} />
            </button>

            {showOverflowMenu && (
              <div className={styles.postOverflowDropdown}>
                <button
                  type="button"
                  onClick={() => {
                    onTogglePin?.(update.id);
                    setShowOverflowMenu(false);
                  }}
                >
                  <Pin size={14} />
                  <span>{update.isPinned ? "Unpin update" : "Pin update"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleShare();
                    setShowOverflowMenu(false);
                  }}
                >
                  <Share2 size={14} />
                  <span>Copy update link</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Update Content Body */}
        <div className={styles.projectUpdateBody}>
          {update.title && <h4 className={styles.refPostTitle}>{update.title}</h4>}

          {update.body && (
            <p className={styles.refPostText}>
              {displayedBody}
              {isLongContent && (
                <button
                  type="button"
                  className={styles.showMoreToggleBtn}
                  onClick={() => setIsExpanded((prev) => !prev)}
                >
                  {isExpanded ? " Show less" : " Show more"}
                </button>
              )}
            </p>
          )}

          {/* Adaptive Media Grid */}
          {imageAttachments.length > 0 && <ProjectUpdateMediaGrid attachments={imageAttachments} />}

          {/* Compact Document Attachment Rows */}
          {documentAttachments.length > 0 && (
            <div className={styles.documentAttachmentsContainer}>
              {documentAttachments.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.projectUpdateAttachment}
                >
                  <div className={styles.docIconBox}>
                    <FileText size={16} />
                  </div>
                  <div className={styles.docMetaColumn}>
                    <strong className={styles.docFileName}>{doc.name}</strong>
                    <span className={styles.docFileDetails}>
                      {doc.sizeBytes ? `${(doc.sizeBytes / 1024).toFixed(0)} KB` : "210 KB"}
                    </span>
                  </div>
                  <Download size={14} className={styles.docDownloadIcon} />
                </a>
              ))}
            </div>
          )}

          {/* Soft Inset Linked Entity Preview */}
          {update.linkedEntity && (
            <button className={styles.projectUpdateMilestoneStrip} type="button">
              <span className={styles.projectUpdateMilestoneAccent} />

              <span className={styles.projectUpdateMilestoneIcon}>
                {getLinkedEntityIcon(update.linkedEntity.type)}
              </span>

              <span className={styles.projectUpdateMilestoneContent}>
                <span className={styles.projectUpdateMilestoneLabel}>
                  Linked {getLinkedEntityLabel(update.linkedEntity.type)}
                </span>

                <span className={styles.projectUpdateMilestoneTitle}>
                  {update.linkedEntity.title}
                </span>

                {update.linkedEntity.subtitle && (
                  <span className={styles.projectUpdateMilestoneMeta}>
                    {update.linkedEntity.subtitle}
                  </span>
                )}
              </span>

              {update.linkedEntity.progress !== undefined && (
                <span className={styles.projectUpdateMilestoneProgress}>
                  {update.linkedEntity.progress}%
                </span>
              )}

              {update.linkedEntity.status && (
                <span className={styles.projectUpdateMilestoneStatus}>
                  {update.linkedEntity.status}
                </span>
              )}

              <ChevronRight className={styles.projectUpdateMilestoneChevron} />
            </button>
          )}
        </div>

        {/* Footer Actions Row */}
        <footer className={styles.projectUpdateActions}>
          {/* Acknowledger avatar stack */}
          {update.acknowledgedAvatars && update.acknowledgedAvatars.length > 0 && (
            <div className={styles.ackAvatarStack} aria-label="People who acknowledged this update">
              {update.acknowledgedAvatars.slice(0, 3).map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <div key={i} className={styles.ackAvatarItem}>
                  <img
                    src={src}
                    alt=""
                    width={28}
                    height={28}
                    className={styles.ackAvatarImg}
                  />
                </div>
              ))}
              {update.acknowledgementCount > 3 && (
                <div className={styles.ackAvatarOverflow}>
                  +{update.acknowledgementCount - 3}
                </div>
              )}
            </div>
          )}

          <div className={styles.postActionsGroup}>
            <button
              type="button"
              className={styles.postActionButton}
              onClick={() => {
                setTargetReplyItem(null);
                setReplyingAuthor(update.authorName);
                setReplyModalOpen(true);
              }}
            >
              <MessageSquare size={15} />
              <span>Reply</span>
              {update.replyCount > 0 && (
                <span className={styles.actionCountBadge}>{update.replyCount}</span>
              )}
            </button>

            <button
              type="button"
              className={`${styles.postActionButton} ${
                update.acknowledgedByCurrentUser ? styles.actionActiveAck : ""
              }`}
              onClick={() => onAcknowledge?.(update.id)}
              title="Acknowledge that you have seen this update"
            >
              <ClipboardCheck size={15} />
              <span>{update.acknowledgedByCurrentUser ? "Acknowledged" : "Acknowledge"}</span>
            </button>
          </div>
        </footer>

        {/* Embedded Inline Reply Preview (Threads Connected Format) */}
        {visibleReplies.length > 0 && (
          <div className={styles.projectUpdateReplyPreview}>
            {visibleReplies.map((reply) => (
              <div key={reply.id} className={styles.inlineReplyItem}>
                <div
                  ref={
                    reply.id === lastVisibleReplyId
                      ? lastReplyAvatarRef
                      : undefined
                  }
                  className={styles.inlineReplyAvatar}
                >
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
                    <div className={styles.postAvatarFallback}>
                      {reply.authorName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className={styles.inlineReplyContentWrapper}>
                  <div className={styles.inlineReplyHeader}>
                    <strong className={styles.inlineReplyAuthor}>
                      {reply.authorName.startsWith("@") ? reply.authorName : `@${reply.authorName}`}
                    </strong>
                    <span className={styles.inlineReplyRole}> · {reply.authorRole}</span>
                  </div>
                  <p className={styles.inlineReplyText}>{reply.body}</p>

                  {/* Inline Reply Footer Actions: Reply & Acknowledge */}
                  <div className={styles.replyItemActions}>
                    <button
                      type="button"
                      className={styles.replyItemActionBtn}
                      onClick={() => {
                        setTargetReplyItem(reply);
                        setReplyingAuthor(reply.authorName);
                        setReplyModalOpen(true);
                      }}
                      title="Reply to this comment"
                    >
                      <MessageSquare size={13} />
                      <span>Reply</span>
                    </button>

                    <button
                      type="button"
                      className={`${styles.replyItemActionBtn} ${
                        acknowledgedReplyIds.has(reply.id) ? styles.replyItemAckActive : ""
                      }`}
                      onClick={() => handleToggleReplyAck(reply.id)}
                      title="Acknowledge this comment"
                    >
                      <CheckCircle2 size={13} />
                      <span>
                        {acknowledgedReplyIds.has(reply.id) ? "Acknowledged" : "Acknowledge"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {update.replyCount > 2 && (
              <button
                type="button"
                className={styles.viewFullThreadBtn}
                onClick={() => setIsRepliesExpanded(!isRepliesExpanded)}
              >
                {isRepliesExpanded
                  ? "Collapse replies ↑"
                  : `View all ${update.replyCount} replies →`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pop-up Reply Modal (X / Threads Style) */}
      <ProjectUpdateReplyModal
        open={replyModalOpen}
        onClose={() => setReplyModalOpen(false)}
        update={update}
        targetReply={targetReplyItem}
        replyingToAuthor={replyingAuthor}
        onSendReply={async (updateId, text) => {
          if (onAddReply) {
            await onAddReply(updateId, text);
          } else {
            update.replies = update.replies || [];
            update.replies.push({
              id: `r-${Date.now()}`,
              updateId,
              authorId: "usr-arjun",
              authorName: "Arjun Menon",
              authorRole: "Project Manager",
              authorAvatar:
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
              body: text,
              createdAt: new Date().toISOString(),
            });
            update.replyCount = (update.replyCount || 0) + 1;
          }
          setIsRepliesExpanded(true);
        }}
      />
    </article>
  );
}
