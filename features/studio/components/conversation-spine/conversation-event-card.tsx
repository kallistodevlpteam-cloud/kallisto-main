"use client";

import React from "react";
import { ArrowDown, ExternalLink, FileText, Globe, Layers, X } from "lucide-react";
import { ConversationEvent } from "@/types/domain/studio-conversation-event";
import styles from "./conversation-spine.module.css";

export interface ConversationEventCardProps {
  event: ConversationEvent;
  topOffset: number;
  onClose: () => void;
  onJumpToMessage: (messageId: string) => void;
  onOpenEntity?: (event: ConversationEvent) => void;
}

export function ConversationEventCard({
  event,
  topOffset,
  onClose,
  onJumpToMessage,
  onOpenEntity,
}: ConversationEventCardProps) {
  const getChipIcon = (icon?: string) => {
    switch (icon) {
      case "globe":
        return <Globe size={11} />;
      case "image":
        return <ExternalLink size={11} />;
      case "layers":
        return <Layers size={11} />;
      case "file":
      default:
        return <FileText size={11} />;
    }
  };

  const handleChipClick = (chipId: string) => {
    if (chipId === "preview" && onOpenEntity) {
      onOpenEntity(event);
    } else if (onOpenEntity) {
      onOpenEntity(event);
    }
  };

  return (
    <div
      className={styles.floatingCard}
      style={{ top: `${Math.max(0, topOffset - 24)}px` }}
      role="region"
      aria-label={`Event details: ${event.title}`}
    >
      <div className={styles.cardHeaderRow}>
        <span className={styles.cardCategoryBadge}>{event.title}</span>
        <button
          type="button"
          onClick={onClose}
          className={styles.cardCloseBtn}
          aria-label="Close event card"
          title="Close"
        >
          <X size={13} />
        </button>
      </div>

      <p className={styles.cardSummary}>{event.summary}</p>

      {event.details && event.details.length > 0 && (
        <ul className={styles.cardBulletList}>
          {event.details.map((detail, idx) => (
            <li key={idx} className={styles.cardBulletItem}>
              {detail.startsWith("•") ? detail : `• ${detail}`}
            </li>
          ))}
        </ul>
      )}

      <div className={styles.cardFooter}>
        <div className={styles.cardChipsList}>
          {event.chips && event.chips.length > 0 ? (
            event.chips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                className={styles.cardChip}
                onClick={() => handleChipClick(chip.id)}
                title={chip.label}
              >
                {getChipIcon(chip.icon)}
                <span>{chip.label}</span>
              </button>
            ))
          ) : event.relatedEntityActionLabel && onOpenEntity ? (
            <button
              type="button"
              onClick={() => onOpenEntity(event)}
              className={styles.cardChip}
              title={event.relatedEntityActionLabel}
              aria-label={event.relatedEntityActionLabel}
            >
              <Globe size={11} />
              <span>{event.relatedEntityActionLabel}</span>
            </button>
          ) : (
            <span className={styles.cardTimestamp}>{event.timestamp}</span>
          )}
        </div>

        <div className={styles.cardActions}>
          <button
            type="button"
            onClick={() => onJumpToMessage(event.messageId)}
            className={styles.cardActionBtn}
            title="Jump to message in conversation"
          >
            <ArrowDown size={11} />
            <span>Jump to turn</span>
          </button>
        </div>
      </div>
    </div>
  );
}
