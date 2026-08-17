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

const RULER_TOTAL_SLOTS = 36;

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

  // Distribute conversation events along the 36-slot ruler
  const { eventSlotMap, slotEventLookup } = React.useMemo(() => {
    const slotMap = new Map<number, ConversationEvent>();
    const lookup: Array<ConversationEvent | null> = new Array(RULER_TOTAL_SLOTS).fill(null);

    if (events.length === 0) return { eventSlotMap: slotMap, slotEventLookup: lookup };

    if (events.length === 1) {
      slotMap.set(8, events[0]);
      lookup.fill(events[0]);
      return { eventSlotMap: slotMap, slotEventLookup: lookup };
    }

    const startSlot = 2;
    const endSlot = RULER_TOTAL_SLOTS - 4;
    const slotSpan = endSlot - startSlot;

    events.forEach((evt, idx) => {
      const targetSlot = Math.min(
        RULER_TOTAL_SLOTS - 1,
        Math.max(0, Math.round(startSlot + (idx / (events.length - 1)) * slotSpan))
      );
      slotMap.set(targetSlot, evt);
    });

    // Populate lookup with nearest event for every ruler tick
    for (let i = 0; i < RULER_TOTAL_SLOTS; i++) {
      if (slotMap.has(i)) {
        lookup[i] = slotMap.get(i)!;
      } else {
        // Find closest event
        let closest: ConversationEvent = events[0];
        let minDistance = 999;
        slotMap.forEach((evt, slotIdx) => {
          const dist = Math.abs(slotIdx - i);
          if (dist < minDistance) {
            minDistance = dist;
            closest = evt;
          }
        });
        lookup[i] = closest;
      }
    }

    return { eventSlotMap: slotMap, slotEventLookup: lookup };
  }, [events]);

  const handleSelectSlot = (slotIndex: number, eventTarget: HTMLElement) => {
    const targetEvent = slotEventLookup[slotIndex];
    if (!targetEvent) return;

    setInternalSelectedId(targetEvent.id);
    onSelectEvent?.(targetEvent);

    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const targetRect = eventTarget.getBoundingClientRect();
      const relativeTop = targetRect.top - containerRect.top;
      setCardTopOffset(relativeTop);
    } else {
      setCardTopOffset(slotIndex * 8);
    }

    setIsCardOpen(true);
    onJumpToMessage(targetEvent.messageId);
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
        {Array.from({ length: RULER_TOTAL_SLOTS }, (_, slotIdx) => {
          const directEvent = eventSlotMap.get(slotIdx);
          const boundEvent = slotEventLookup[slotIdx];
          const isSelected = boundEvent ? boundEvent.id === selectedEventId : false;
          const isDirectEventSlot = Boolean(directEvent);
          const isImportant = directEvent?.isImportant || directEvent?.type === "REQUIREMENT" || directEvent?.type === "REVISION" || directEvent?.type === "AI_ACTION";

          const ariaLabel = directEvent
            ? `${directEvent.title}: ${directEvent.summary} (${directEvent.timestamp})`
            : boundEvent
            ? `Timeline position (${boundEvent.title})`
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
              <span
                className={`${styles.tickBar} ${
                  isSelected
                    ? styles.tickBarActive
                    : isDirectEventSlot
                    ? isImportant
                      ? styles.tickBarImportant
                      : styles.tickBarEvent
                    : styles.tickBarSubtle
                }`}
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
