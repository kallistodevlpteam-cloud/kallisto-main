"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  MessageSquare,
  Mic,
  MoreHorizontal,
  Plus,
  Radio,
  Send,
} from "lucide-react";
import styles from "./hands-overview.module.css";

export interface ProjectUpdatePost {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  authorInitials: string;
  timestamp: string;
  tagLabel: string;
  tagColor: "green" | "purple" | "blue" | "amber";
  text: string;
  mediaImages?: string[];
  extraMediaCount?: number;
  repliesCount?: number;
  isAcknowledged?: boolean;
}

const DEFAULT_PROJECT_UPDATES: ProjectUpdatePost[] = [
  {
    id: "update-1",
    authorName: "Arjun Menon",
    authorRole: "Project Manager",
    authorAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    authorInitials: "AM",
    timestamp: "Just now",
    tagLabel: "Milestone update",
    tagColor: "green",
    text: "Uploaded 1 media file.",
    mediaImages: [
      "/assets/projectbg.webp",
      "/assets/projectbg.webp",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&auto=format&fit=crop&q=80",
    ],
    extraMediaCount: 2,
    repliesCount: 0,
    isAcknowledged: false,
  },
  {
    id: "update-2",
    authorName: "Priya Sharma",
    authorRole: "Lead Architect",
    authorAvatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    authorInitials: "PS",
    timestamp: "10 May",
    tagLabel: "Design revision",
    tagColor: "purple",
    text: "Updated interior living room elevations and luxury marble flooring specifications approved by client team.",
    mediaImages: [
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=600&auto=format&fit=crop&q=80",
    ],
    extraMediaCount: 1,
    repliesCount: 3,
    isAcknowledged: true,
  },
  {
    id: "update-3",
    authorName: "Rahul Nair",
    authorRole: "Structural Engineer",
    authorAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    authorInitials: "RN",
    timestamp: "08 May",
    tagLabel: "BOQ & Materials",
    tagColor: "green",
    text: "Steel reinforcement stress load testing verified for column grid C4-C8 with zero defects.",
    repliesCount: 1,
    isAcknowledged: false,
  },
];

interface ProjectUpdatesCardProps {
  projectName?: string;
}

export function ProjectUpdatesCard({ projectName }: ProjectUpdatesCardProps) {
  const [updates, setUpdates] = useState<ProjectUpdatePost[]>(DEFAULT_PROJECT_UPDATES);
  const [newUpdateText, setNewUpdateText] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const handleToggleAcknowledge = (id: string) => {
    setUpdates((prev) =>
      prev.map((up) =>
        up.id === id ? { ...up, isAcknowledged: !up.isAcknowledged } : up,
      ),
    );
  };

  const handleAddUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdateText.trim()) return;

    const newPost: ProjectUpdatePost = {
      id: `update-${Date.now()}`,
      authorName: "Rajeev K.",
      authorRole: "Site Supervisor",
      authorInitials: "RK",
      timestamp: "Just now",
      tagLabel: "Site update",
      tagColor: "green",
      text: newUpdateText.trim(),
      repliesCount: 0,
      isAcknowledged: false,
    };

    setUpdates([newPost, ...updates]);
    setNewUpdateText("");
  };

  return (
    <div className={styles.fixedProjectUpdatesWidget} aria-label="Project Updates Feed">
      {/* ── Fixed Section Header ── */}
      <div className={styles.updatesHeaderRow}>
        <h3 className={styles.updatesHeaderTitle}>Project Updates</h3>
        <button
          type="button"
          className={styles.updatesMenuBtn}
          aria-label="Update options"
          title="More options"
        >
          <MoreHorizontal size={18} aria-hidden="true" />
        </button>
      </div>

      {/* ── Scrollable Updates Feed List ── */}
      <div className={styles.updatesFeedList}>
        {updates.map((post) => {
          const tagClass =
            post.tagColor === "green"
              ? styles.tagGreen
              : post.tagColor === "purple"
                ? styles.tagPurple
                : post.tagColor === "blue"
                  ? styles.tagBlue
                  : styles.tagAmber;

          return (
            <div key={post.id} className={styles.updatePostCard}>
              <div className={styles.updatePostHeader}>
                <div className={styles.updateAuthorAvatarWrap}>
                  {post.authorAvatar ? (
                    <Image
                      src={post.authorAvatar}
                      alt={post.authorName}
                      width={36}
                      height={36}
                      className={styles.updateAuthorAvatar}
                      unoptimized
                    />
                  ) : (
                    <div className={styles.updateAuthorInitials}>
                      {post.authorInitials}
                    </div>
                  )}
                </div>

                <div className={styles.updateAuthorDetails}>
                  <div className={styles.authorMetaLine}>
                    <strong className={styles.authorName}>{post.authorName}</strong>
                    <span className={styles.verifiedCheckBadge} title="Verified Team Member">
                      <Check size={9} aria-hidden="true" />
                    </span>
                    <span className={styles.metaDot}>·</span>
                    <span className={styles.authorRole}>{post.authorRole}</span>
                    <span className={styles.metaDot}>·</span>
                    <span className={styles.postTimestamp}>{post.timestamp}</span>
                  </div>

                  <div className={styles.updateTagRow}>
                    <span className={`${styles.updateTagPill} ${tagClass}`}>
                      <span className={styles.tagDot} aria-hidden="true" />
                      {post.tagLabel}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.updatePostBody}>
                <p className={styles.updateTextContent}>{post.text}</p>

                {post.mediaImages && post.mediaImages.length > 0 && (
                  <div className={styles.updateMediaGrid}>
                    {post.mediaImages.slice(0, 4).map((imgUrl, index) => {
                      const isFourth = index === 3;
                      const hasExtra = isFourth && (post.extraMediaCount ?? 0) > 0;

                      return (
                        <div key={index} className={styles.mediaItemSlot}>
                          <Image
                            src={imgUrl}
                            alt={`Update attachment ${index + 1}`}
                            fill
                            sizes="120px"
                            className={styles.mediaThumbnail}
                            unoptimized
                          />
                          {hasExtra && (
                            <div className={styles.extraMediaOverlay}>
                              <span>+{post.extraMediaCount} more</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className={styles.updatePostActions}>
                <button
                  type="button"
                  className={styles.actionBtnReply}
                  onClick={() => {}}
                >
                  <MessageSquare size={13} aria-hidden="true" />
                  <span>Reply</span>
                  {post.repliesCount ? (
                    <span className={styles.repliesBadge}>({post.repliesCount})</span>
                  ) : null}
                </button>

                <button
                  type="button"
                  className={`${styles.actionBtnAck} ${
                    post.isAcknowledged ? styles.actionBtnAckActive : ""
                  }`}
                  onClick={() => handleToggleAcknowledge(post.id)}
                >
                  <CheckCircle2 size={13} aria-hidden="true" />
                  <span>{post.isAcknowledged ? "Acknowledged" : "Acknowledge"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Fixed Bottom Composer Box ── */}
      <form onSubmit={handleAddUpdate} className={styles.composerCard}>
        <textarea
          className={styles.composerInput}
          placeholder="Share update, site progress, type @ to mention, or / for actions..."
          value={newUpdateText}
          onChange={(e) => setNewUpdateText(e.target.value)}
          rows={2}
        />

        <div className={styles.composerToolbar}>
          <div className={styles.composerLeftControls}>
            <button
              type="button"
              className={styles.composerAddMediaBtn}
              title="Attach media files or documents"
            >
              <Plus size={15} aria-hidden="true" />
            </button>
            <div className={styles.categoryDropdownBtn}>
              <span>{activeCategory}</span>
              <ChevronDown size={12} aria-hidden="true" />
            </div>
          </div>

          <div className={styles.composerRightControls}>
            <button
              type="button"
              className={styles.composerMicBtn}
              title="Voice note update"
            >
              <Mic size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.composerWaveBtn}
              title="Audio waveform update"
            >
              <Radio size={14} aria-hidden="true" />
            </button>
            {newUpdateText.trim() && (
              <button
                type="submit"
                className={styles.composerSubmitBtn}
                title="Post update"
              >
                <Send size={13} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
