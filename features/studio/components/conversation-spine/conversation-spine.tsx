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
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const [isCardOpen, setIsCardOpen] = useState<boolean>(false);
  const [cardTopOffset, setCardTopOffset] = useState<number>(0);

  const selectedEventId = internalSelectedId ?? externalSelectedEventId ?? (events.length > 0 ? events[events.length - 1].id : null);
  const activeEvent = events.find((e) => e.id === selectedEventId) || null;

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const showEventCard = (event: ConversationEvent, eventIndex: number, eventTarget: HTMLElement) => {
    clearCloseTimer();
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
  };

  const handleHoverEvent = (event: ConversationEvent, eventIndex: number, eventTarget: HTMLElement) => {
    showEventCard(event, eventIndex, eventTarget);
  };

  const handleSelectEvent = (event: ConversationEvent, eventIndex: number, eventTarget: HTMLElement) => {
    showEventCard(event, eventIndex, eventTarget);
    onJumpToMessage(event.messageId);
  };

  const handleScheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setIsCardOpen(false);
    }, 250);
  };

  const handleCloseCard = () => {
    clearCloseTimer();
    setIsCardOpen(false);
  };

  // Keyboard navigation & escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCardOpen) {
        handleCloseCard();
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
        handleCloseCard();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCardOpen]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.spineRail} ${className}`}
      aria-label="Conversation activity timeline"
      role="navigation"
      onMouseEnter={clearCloseTimer}
      onMouseLeave={handleScheduleClose}
    >
      <div className={styles.spineAxis} aria-hidden="true" />

      <div className={styles.spineTicksList} role="list" aria-label="Conversation events">
        {events.map((evt, idx) => {
          const isSelected = isCardOpen && evt.id === selectedEventId;

          return (
            <button
              key={evt.id}
              type="button"
              onMouseEnter={(e) => handleHoverEvent(evt, idx, e.currentTarget)}
              onClick={(e) => handleSelectEvent(evt, idx, e.currentTarget)}
              className={`${styles.tickButton} ${isSelected ? styles.tickButtonActive : ""}`}
              aria-label={`${evt.title}: ${evt.summary} (${evt.timestamp})`}
              aria-current={isSelected ? "true" : undefined}
              title={`${evt.title} — ${evt.summary}`}
            >
              <span className={styles.tickBar} aria-hidden="true" />
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
          onMouseEnter={clearCloseTimer}
          onMouseLeave={handleScheduleClose}
        />
      )}
    </div>
  );
}
