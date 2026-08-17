"use client";

import React, { useEffect, useRef, useState } from "react";
import { ConversationEvent } from "@/types/domain/studio-conversation-event";
import { ConversationEventCard } from "./conversation-event-card";
import styles from "./conversation-spine.module.css";

export interface ConversationSpineProps {
  events: ConversationEvent[];
  selectedEventId?: string | null;
  onSelectEvent?: (event: ConversationEvent) => void;
  onJumpToMessage: (messageId: string) => void;
  onOpenEntity?: (event: ConversationEvent) => void;
  className?: string;
}

export function ConversationSpine({
  events,
  selectedEventId: externalSelectedEventId,
  onSelectEvent,
  onJumpToMessage,
  onOpenEntity,
  className = "",
}: ConversationSpineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const [isCardOpen, setIsCardOpen] = useState<boolean>(false);
  const [cardTopOffset, setCardTopOffset] = useState<number>(0);

  const selectedEventId = internalSelectedId ?? externalSelectedEventId ?? (events.length > 0 ? events[events.length - 1].id : null);
  const activeEvent = events.find((e) => e.id === selectedEventId) || null;

  const handleSelectEvent = (event: ConversationEvent, eventIndex: number, eventTarget: HTMLElement) => {
    setInternalSelectedId(event.id);
    onSelectEvent?.(event);

    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const targetRect = eventTarget.getBoundingClientRect();
      const relativeTop = targetRect.top - containerRect.top;
      setCardTopOffset(relativeTop);
    } else {
      setCardTopOffset(eventIndex * 24);
    }

    setIsCardOpen(true);
    onJumpToMessage(event.messageId);
  };

  const handleCloseCard = () => {
    setIsCardOpen(false);
  };

  // Keyboard navigation & escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCardOpen) {
        setIsCardOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCardOpen]);

  // Click outside to dismiss card
  useEffect(() => {
    if (!isCardOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsCardOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCardOpen]);

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.spineRail} ${className}`}
      aria-label="Conversation activity timeline"
      role="navigation"
    >
      <div className={styles.spineAxis} aria-hidden="true" />

      <div className={styles.spineTicksList} role="list" aria-label="Conversation events">
        {events.map((evt, idx) => {
          const isSelected = evt.id === selectedEventId;
          const isImportant = evt.isImportant || evt.type === "REQUIREMENT" || evt.type === "REVISION" || evt.type === "AI_ACTION";

          return (
            <button
              key={evt.id}
              type="button"
              onClick={(e) => handleSelectEvent(evt, idx, e.currentTarget)}
              className={`${styles.tickButton} ${isSelected ? styles.tickButtonActive : ""}`}
              aria-label={`${evt.title}: ${evt.summary} (${evt.timestamp})`}
              aria-current={isSelected ? "true" : undefined}
              title={`${evt.title} — ${evt.summary}`}
            >
              <span
                className={`${styles.tickBar} ${isImportant ? styles.tickBarImportant : ""}`}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>

      {isCardOpen && activeEvent && (
        <ConversationEventCard
          event={activeEvent}
          topOffset={cardTopOffset}
          onClose={handleCloseCard}
          onJumpToMessage={onJumpToMessage}
          onOpenEntity={onOpenEntity}
        />
      )}
    </div>
  );
}
