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

const RULER_TICKS_COUNT = 30;

export function ConversationSpine({
  events,
  selectedEventId: externalSelectedEventId,
  onSelectEvent,
  onJumpToMessage,
  onOpenEntity,
  className = "",
}: ConversationSpineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [activeEvent, setActiveEvent] = useState<ConversationEvent | null>(null);
  const [isCardOpen, setIsCardOpen] = useState<boolean>(false);
  const [cardTopOffset, setCardTopOffset] = useState<number>(0);

  // Map each conversation event to a slot index along the 30-dash ruler
  const slotEventMap = React.useMemo(() => {
    const map = new Map<number, ConversationEvent>();
    if (!events || events.length === 0) return map;

    if (events.length === 1) {
      map.set(10, events[0]);
      return map;
    }

    const startSlot = 2;
    const endSlot = RULER_TICKS_COUNT - 3;
    const slotSpan = endSlot - startSlot;

    events.forEach((evt, idx) => {
      const slot = Math.min(
        RULER_TICKS_COUNT - 1,
        Math.max(0, Math.round(startSlot + (idx / (events.length - 1)) * slotSpan))
      );
      map.set(slot, evt);
    });

    return map;
  }, [events]);

  const handleSelectSlot = (slotIndex: number, eventTarget: HTMLElement) => {
    if (!events || events.length === 0) return;

    // Find direct or closest event for this slot
    let targetEvent = slotEventMap.get(slotIndex);
    if (!targetEvent) {
      let closest: ConversationEvent = events[0];
      let minDistance = 999;
      slotEventMap.forEach((evt, mappedSlot) => {
        const dist = Math.abs(mappedSlot - slotIndex);
        if (dist < minDistance) {
          minDistance = dist;
          closest = evt;
        }
      });
      targetEvent = closest;
    }

    setActiveSlotIndex(slotIndex);
    setActiveEvent(targetEvent);
    onSelectEvent?.(targetEvent);

    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const targetRect = eventTarget.getBoundingClientRect();
      const relativeTop = targetRect.top - containerRect.top;
      setCardTopOffset(relativeTop);
    } else {
      setCardTopOffset(slotIndex * 9);
    }

    setIsCardOpen(true);
    onJumpToMessage(targetEvent.messageId);
  };

  const handleCloseCard = () => {
    setIsCardOpen(false);
    setActiveSlotIndex(null);
    setActiveEvent(null);
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

  return (
    <div
      ref={containerRef}
      className={`${styles.spineRail} ${className}`}
      aria-label="Conversation activity timeline"
      role="navigation"
    >
      <div className={styles.spineAxis} aria-hidden="true" />

      <div className={styles.spineTicksList} role="list" aria-label="Conversation events">
        {Array.from({ length: RULER_TICKS_COUNT }, (_, slotIdx) => {
          const directEvent = slotEventMap.get(slotIdx);
          const isSelected = isCardOpen && activeSlotIndex === slotIdx;

          const ariaLabel = directEvent
            ? `${directEvent.title}: ${directEvent.summary} (${directEvent.timestamp})`
            : `Timeline position ${slotIdx + 1}`;

          return (
            <button
              key={slotIdx}
              type="button"
              onClick={(e) => handleSelectSlot(slotIdx, e.currentTarget)}
              className={`${styles.tickButton} ${isSelected ? styles.tickButtonActive : ""}`}
              aria-label={ariaLabel}
              aria-current={isSelected ? "true" : undefined}
              title={directEvent ? `${directEvent.title} — ${directEvent.summary}` : undefined}
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
        />
      )}
    </div>
  );
}
