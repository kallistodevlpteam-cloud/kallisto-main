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
  const getActionIcon = () => {
    switch (event.relatedEntityType) {
      case "output":
      case "proposal":
      case "boq":
      case "estimate":
        return <Layers size={12} />;
      case "document":
      case "drawing":
        return <FileText size={12} />;
      default:
        return <ExternalLink size={12} />;
    }
  };

  return (
    <div
      className={styles.floatingCard}
      style={{ top: `${topOffset}px` }}
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
          <X size={14} />
        </button>
      </div>

      <p className={styles.cardSummary}>{event.summary}</p>

      {event.details && event.details.length > 0 && (
        <ul className={styles.cardBulletList}>
          {event.details.map((detail, idx) => (
            <li key={idx} className={styles.cardBulletItem}>
              {detail}
            </li>
          ))}
        </ul>
      )}

      <div className={styles.cardFooter}>
        <span className={styles.cardTimestamp}>{event.timestamp}</span>

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

          {event.relatedEntityActionLabel && onOpenEntity && (
            <button
              type="button"
              onClick={() => onOpenEntity(event)}
              className={`${styles.cardActionBtn} ${styles.cardActionBtnPrimary}`}
              title={event.relatedEntityActionLabel}
              aria-label={event.relatedEntityActionLabel}
            >
              {getActionIcon()}
              <span>{event.relatedEntityActionLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
