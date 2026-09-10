"use client";

import React, { useState } from "react";
import { 
  SendHorizontal, 
  Mic, 
  Check, 
  MessageSquare, 
  Plus,
  ChevronDown,
  AudioLines,
  X
} from "lucide-react";
import { AssignmentSiteUpdate, AssignmentSiteUpdateReply } from "../../types/assignment-domain";
import styles from "./assignment-detail.module.css";

interface AssignmentUpdatesPanelProps {
  assignmentId: string;
  initialUpdates?: AssignmentSiteUpdate[];
  supervisorName: string;
  contractorName?: string;
}

function UpdateAuthorAvatar({
  src,
  name,
  role,
}: {
  src?: string;
  name: string;
  role?: string;
}) {
  const [hasError, setHasError] = useState(false);
  const initials =
    name === "You"
      ? "AI"
      : name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase() || "KP";

  const isSupervisor = role?.toLowerCase().includes("supervisor");
  const isProvider = role?.toLowerCase().includes("provider");
  const bgColor = isSupervisor ? "#059669" : isProvider ? "#7c3aed" : "#2563eb";

  return (
    <div
      className={styles.updateAvatar}
      style={{
        backgroundColor: bgColor,
      }}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={name}
          className={styles.updateAvatarImg}
          onError={() => setHasError(true)}
        />
      ) : (
        initials
      )}
    </div>
  );
}

function ReplyAuthorAvatar({
  src,
  name,
  role,
}: {
  src?: string;
  name: string;
  role?: string;
}) {
  const [hasError, setHasError] = useState(false);
  const initial = name === "You" ? "A" : (name[0] || "U").toUpperCase();
  const isSupervisor = role?.toLowerCase().includes("supervisor");
  const isProvider = role?.toLowerCase().includes("provider");
  const bgColor = isSupervisor ? "#059669" : isProvider ? "#7c3aed" : "#2563eb";

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setHasError(true)}
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        backgroundColor: bgColor,
        color: "#ffffff",
        fontSize: "9px",
        fontWeight: 700,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}

export function AssignmentUpdatesPanel({
  assignmentId,
  initialUpdates = [],
  supervisorName,
  contractorName = "Apex Integrated Civil",
}: AssignmentUpdatesPanelProps) {
  const [updates, setUpdates] = useState<AssignmentSiteUpdate[]>(initialUpdates);
  const [newMessage, setNewMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [lightboxState, setLightboxState] = useState<{ images: string[]; index: number } | null>(null);

  const getCategoryClass = (category: string) => {
    switch (category) {
      case "Site Progress":
        return styles.cat_site_progress;
      case "Crew Deployment":
        return styles.cat_crew_deployment;
      case "Daily Briefing":
        return styles.cat_daily_briefing;
      case "Safety & Compliance":
        return styles.cat_safety_compliance;
      case "Task Handover":
        return styles.cat_task_handover;
      case "Milestone Update":
        return styles.cat_milestone_update;
      case "Material Check":
        return styles.cat_material_check;
      default:
        return styles.cat_default;
    }
  };

  const renderMediaGrid = (urls: string[]) => {
    if (!urls || urls.length === 0) return null;

    if (urls.length === 1) {
      return (
        <div 
          className={styles.mediaSingleWrapper}
          onClick={() => setLightboxState({ images: urls, index: 0 })}
          role="button"
          tabIndex={0}
          aria-label="View photo"
        >
          <img
            src={urls[0]}
            alt="Site update photo"
            className={styles.mediaSingleImg}
            loading="lazy"
          />
        </div>
      );
    }

    if (urls.length === 2) {
      return (
        <div className={styles.mediaGridTwo}>
          {urls.map((url, idx) => (
            <button
              key={idx}
              type="button"
              className={styles.mediaAspectCard}
              onClick={() => setLightboxState({ images: urls, index: idx })}
              aria-label={`View photo ${idx + 1}`}
            >
              <img
                src={url}
                alt={`Site update photo ${idx + 1}`}
                className={styles.mediaCardImg}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      );
    }

    if (urls.length === 3) {
      return (
        <div className={styles.mediaGridThree}>
          {urls.map((url, idx) => (
            <button
              key={idx}
              type="button"
              className={styles.mediaAspectCard}
              onClick={() => setLightboxState({ images: urls, index: idx })}
              aria-label={`View photo ${idx + 1}`}
            >
              <img
                src={url}
                alt={`Site update photo ${idx + 1}`}
                className={styles.mediaCardImg}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      );
    }

    // 4 or more: mixed combination (3 vertical portrait columns + 1 stacked column on right with +N more overlay)
    const mainCols = urls.slice(0, 3);
    const stackedTop = urls[3];
    const stackedBottom = urls[4] || urls[3];
    const extraCount = urls.length - 4;

    return (
      <div className={styles.mediaGridMixedFour}>
        {/* 3 vertical portrait cards */}
        {mainCols.map((url, idx) => (
          <button
            key={idx}
            type="button"
            className={styles.mediaAspectCard}
            onClick={() => setLightboxState({ images: urls, index: idx })}
            aria-label={`View photo ${idx + 1}`}
          >
            <img
              src={url}
              alt={`Site update photo ${idx + 1}`}
              className={styles.mediaCardImg}
              loading="lazy"
            />
          </button>
        ))}

        {/* 4th column stacked vertically into 2 thumbnails */}
        <div className={styles.mediaGridStackedCol}>
          <button
            type="button"
            className={styles.mediaGridStackedThumb}
            onClick={() => setLightboxState({ images: urls, index: 3 })}
            aria-label="View photo 4"
          >
            <img
              src={stackedTop}
              alt="Site update photo 4"
              className={styles.mediaCardImg}
              loading="lazy"
            />
          </button>
          <button
            type="button"
            className={styles.mediaGridStackedThumb}
            onClick={() => setLightboxState({ images: urls, index: 4 })}
            aria-label={`View photo 5 and ${extraCount} more`}
          >
            <img
              src={stackedBottom}
              alt="Site update photo 5"
              className={styles.mediaCardImg}
              loading="lazy"
            />
            {extraCount > 0 && (
              <div className={styles.mediaOverflowOverlay}>
                <span>+{extraCount} more</span>
              </div>
            )}
          </button>
        </div>
      </div>
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const resolvedAuthorName = contractorName && contractorName !== "You" ? contractorName : "Apex Integrated Civil";

    const newUpdate: AssignmentSiteUpdate = {
      id: `upd-${Date.now()}`,
      authorName: resolvedAuthorName,
      authorRole: "Contractor",
      authorAvatar: "/assets/arjun-avatar.jpg",
      timestamp: "Just now",
      category: (selectedCategory === "All" ? "Site Progress" : selectedCategory) as AssignmentSiteUpdate["category"],
      text: newMessage.trim(),
      acknowledged: false,
      replies: [],
    };

    setUpdates((prev) => [newUpdate, ...prev]);
    setNewMessage("");
  };

  const handleToggleAcknowledge = (updateId: string) => {
    setUpdates((prev) =>
      prev.map((upd) =>
        upd.id === updateId ? { ...upd, acknowledged: !upd.acknowledged } : upd
      )
    );
  };

  const handleSendReply = (updateId: string) => {
    if (!replyText.trim()) return;

    const resolvedAuthorName = contractorName && contractorName !== "You" ? contractorName : "Apex Integrated Civil";

    const reply: AssignmentSiteUpdateReply = {
      id: `rep-${Date.now()}`,
      authorName: resolvedAuthorName,
      authorRole: "Contractor",
      authorAvatar: "/assets/arjun-avatar.jpg",
      timestamp: "Just now",
      text: replyText.trim(),
      acknowledged: true,
    };

    setUpdates((prev) =>
      prev.map((upd) => {
        if (upd.id === updateId) {
          return {
            ...upd,
            replies: [...(upd.replies || []), reply],
          };
        }
        return upd;
      })
    );

    setReplyText("");
    setActiveReplyId(null);
  };

  return (
    <aside className={styles.updatesSideCol} aria-label="Work Updates Feed">
      {/* Rail Header (Aligned with Left Column Title Row) */}
      <div className={styles.updatesRailHeader}>
        <h2 className={styles.updatesTitle}>Work Updates</h2>
      </div>

      {/* Card Container holding Stream and Composer */}
      <div className={styles.updatesCardContainer}>
        {/* Stream List */}
        <div className={styles.updatesStreamList}>
        {updates.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
            No updates posted yet. Use the composer below to begin communication with {supervisorName}.
          </div>
        ) : (
          updates
            // Permanently exclude provider updates — this is the contractor's platform
            .filter((u) => !u.authorRole?.toLowerCase().includes("provider"))
            .map((update) => {
            const isSupervisor = update.authorRole?.toLowerCase().includes("supervisor");
            const resolvedRole = update.authorRole || (isSupervisor ? "Site Supervisor" : "Contractor");
            const resolvedContractorName = contractorName && contractorName !== "You" ? contractorName : "Apex Integrated Civil";
            // Show "You" when this message was authored by the contractor (self)
            const isOwnMessage =
              update.authorRole?.toLowerCase().includes("contractor") ||
              update.authorName === resolvedContractorName ||
              update.authorName === "You" ||
              update.authorName.toLowerCase() === "me";
            const displayName = isOwnMessage ? "You" : update.authorName;


            return (
              <article key={update.id} className={styles.updateItemCard}>
                {/* Author Row */}
                <div className={styles.updateAuthorRow}>
                  <UpdateAuthorAvatar
                    src={update.authorAvatar}
                    name={displayName}
                    role={resolvedRole}
                  />
                  <div className={styles.updateAuthorInfo}>
                    <div className={styles.updateAuthorNameRow}>
                      <span style={{ fontWeight: 650 }}>{displayName}</span>
                      {/* Don't show the role label for own messages ("You") — this is the contractor's platform */}
                      {resolvedRole && displayName !== "You" && (
                        <span className={styles.updateAuthorRole}>· {resolvedRole}</span>
                      )}
                      <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "auto" }}>
                        {update.timestamp}
                      </span>
                    </div>
                    <span className={`${styles.updateCategoryPill} ${getCategoryClass(update.category)}`}>
                      {update.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <p className={styles.updateText}>{update.text}</p>

                {/* Media grid if available */}
                {update.mediaUrls && update.mediaUrls.length > 0 && (
                  <div className={styles.updateMediaContainer}>
                    {renderMediaGrid(update.mediaUrls)}
                  </div>
                )}

                {/* Actions */}
                <div className={styles.updateActionsRow}>
                  <button
                    type="button"
                    onClick={() => handleToggleAcknowledge(update.id)}
                    className={`${styles.updateActionBtn} ${
                      update.acknowledged ? styles.updateActionBtnAcknowledged : ""
                    }`}
                    title="Acknowledge this site report"
                  >
                    <Check size={13} strokeWidth={update.acknowledged ? 3 : 2} />
                    <span>{update.acknowledged ? "Acknowledged" : "Acknowledge"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveReplyId(activeReplyId === update.id ? null : update.id)
                    }
                    className={styles.updateActionBtn}
                    aria-label={
                      update.replies && update.replies.length > 1
                        ? `Reply (${update.replies.length} replies)`
                        : "Reply"
                    }
                  >
                    <MessageSquare size={13} />
                    <span>Reply</span>
                    {update.replies && update.replies.length > 1 && (
                      <span className={styles.replyCountBadge}>
                        {update.replies.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Nested Replies */}
                {update.replies && update.replies.length > 0 && (
                  <div className={styles.repliesContainer}>
                    {update.replies.map((reply) => {
                      const isReplySupervisor = reply.authorRole?.toLowerCase().includes("supervisor");
                      const isReplyProvider = reply.authorRole?.toLowerCase().includes("provider");
                      const replyRoleName = reply.authorRole || (isReplySupervisor ? "Site Supervisor" : isReplyProvider ? "Provider" : "Contractor");
                      const isOwnReply =
                        reply.authorRole?.toLowerCase().includes("contractor") ||
                        reply.authorName === resolvedContractorName ||
                        reply.authorName === "You" ||
                        reply.authorName.toLowerCase() === "me";
                      const replyDisplayName = isOwnReply ? "You" : reply.authorName;

                      return (
                        <div key={reply.id} className={styles.replyItem}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <ReplyAuthorAvatar
                                src={reply.authorAvatar}
                                name={replyDisplayName}
                                role={replyRoleName}
                              />
                              <strong style={{ fontSize: "11px", color: "#0f172a" }}>
                                {replyDisplayName}
                              </strong>
                              {replyRoleName && replyDisplayName !== "You" && (
                                <span className={styles.updateAuthorRole} style={{ fontSize: "11px" }}>
                                  · {replyRoleName}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: "10px", color: "#94a3b8" }}>
                              {reply.timestamp}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: "12px", color: "#334155" }}>
                            {reply.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quick Inline Reply Input */}
                {activeReplyId === update.id && (
                  <div style={{ marginTop: "8px", display: "flex", gap: "6px" }}>
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${displayName}...`}
                      className={styles.composerInput}
                      style={{
                        padding: "5px 10px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        fontSize: "12px",
                        backgroundColor: "transparent",
                        outline: "none",
                        color: "#0f172a",
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSendReply(update.id);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleSendReply(update.id)}
                      style={{
                        padding: "5px 12px",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        backgroundColor: "#0f172a",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "background-color 120ms ease",
                      }}
                    >
                      Reply
                    </button>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Bottom Composer (Matching Reference Image 2) */}
      <div className={styles.composerWrapper}>
        <form className={styles.updateInputCard} onSubmit={handleSendMessage}>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Share update, site progress, or message ${supervisorName}...`}
            className={styles.updateInputTextarea}
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />

          <div className={styles.updateInputToolbar}>
            <div className={styles.updateToolbarLeft}>
              {/* Circular '+' button for attachments */}
              <button
                type="button"
                className={styles.updateAttachBtn}
                title="Add photo or document"
                onClick={() => alert("Attachment dialog: Select photo, site inspection image, or document")}
                aria-label="Add attachment"
              >
                <Plus size={16} strokeWidth={2.2} />
              </button>

              {/* Filter / Category dropdown 'All v' */}
              <button
                type="button"
                className={styles.updateFilterSelect}
                onClick={() => setIsCategoryMenuOpen((prev) => !prev)}
                aria-label={`Filter category: ${selectedCategory}`}
              >
                <span>{selectedCategory}</span>
                <ChevronDown size={13} />
              </button>

              {isCategoryMenuOpen && (
                <div className={styles.filterDropdownMenu}>
                  {(["All", "Site Progress", "Crew Deployment", "Daily Briefing", "Safety & Compliance", "Task Handover", "Milestone Update"] as const).map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={styles.filterDropdownItem}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsCategoryMenuOpen(false);
                        }}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            <div className={styles.updateToolbarRight}>
              <button
                type="button"
                className={styles.chatgptMicBtn}
                title="Voice input"
                aria-label="Voice input"
                onClick={() => alert("Voice input listening...")}
              >
                <Mic size={18} strokeWidth={2} />
              </button>

              {newMessage.trim() ? (
                <button
                  type="submit"
                  className={styles.chatgptSendBtn}
                  title="Send update"
                  aria-label="Send update"
                >
                  <SendHorizontal size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.chatgptVoiceWaveBtn}
                  title="Voice note mode"
                  aria-label="Voice note mode"
                  onClick={() => alert("Voice note mode activated")}
                >
                  <AudioLines size={18} strokeWidth={2.2} />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>

      {/* Lightbox Popover */}
      {lightboxState !== null && (
        <div 
          className={styles.lightboxBackdrop} 
          onClick={() => setLightboxState(null)} 
          role="dialog" 
          aria-modal="true"
        >
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.lightboxCloseBtn}
              onClick={() => setLightboxState(null)}
              aria-label="Close photo"
            >
              <X size={20} />
            </button>
            <img
              src={lightboxState.images[lightboxState.index]}
              alt="Site photo full preview"
              className={styles.lightboxImg}
            />
          </div>
        </div>
      )}
    </aside>
  );
}
