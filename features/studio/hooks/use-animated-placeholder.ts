"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface UseAnimatedPlaceholderOptions {
  /** Ordered list of example strings to cycle through. */
  examples: string[];
  /**
   * Master gate. When false the hook immediately stops all timers, clears
   * animated text, and remains idle until the flag becomes true again.
   */
  enabled: boolean;
  /** Delay (ms) before the first character is typed. Default 1500. */
  initialDelay?: number;
  /** Ms per character while typing forward. Default 38. */
  typingSpeed?: number;
  /** Ms per character while deleting. Default 22. */
  deletingSpeed?: number;
  /** How long the completed phrase is held before deletion begins (ms). Default 2100. */
  holdDuration?: number;
  /** Delay between end-of-delete and next phrase (ms). Default 650. */
  betweenDelay?: number;
}

export interface UseAnimatedPlaceholderResult {
  animatedText: string;
  isTyping: boolean;
  isDeleting: boolean;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * Cycles through example prompts with a typewriter effect inside the Studio
 * composer. Never touches the real prompt value.
 *
 * Safe for React Strict Mode: each effect invocation owns its own cancellation
 * token so stale closures cannot restart a new loop after unmount.
 */
export function useAnimatedPlaceholder({
  examples,
  enabled,
  initialDelay = 1500,
  typingSpeed = 38,
  deletingSpeed = 22,
  holdDuration = 2100,
  betweenDelay = 650,
}: UseAnimatedPlaceholderOptions): UseAnimatedPlaceholderResult {
  const [animatedText, setAnimatedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Tracks the index of the phrase currently being animated so we can
  // resume at the *next* phrase rather than always starting from index 0.
  const phraseIndexRef = useRef(0);

  // Each effect run receives a unique id. Async callbacks check this before
  // updating state, preventing stale-closure races and double-invocation in
  // React Strict Mode.
  const runIdRef = useRef(0);

  // Single mutable ref for the active timer handle so we can cancel cleanly.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled || examples.length === 0) {
      cancelTimer();
      setAnimatedText("");
      setIsTyping(false);
      setIsDeleting(false);
      return;
    }

    // Bump run id so any previous async chain sees a stale id and aborts.
    runIdRef.current += 1;
    const myRunId = runIdRef.current;

    const schedule = (fn: () => void, delay: number) => {
      cancelTimer();
      timerRef.current = setTimeout(fn, delay);
    };

    const type = (phrase: string, charIndex: number) => {
      if (runIdRef.current !== myRunId) return;
      const partial = phrase.slice(0, charIndex + 1);
      setAnimatedText(partial);
      setIsTyping(true);
      setIsDeleting(false);

      if (charIndex < phrase.length - 1) {
        schedule(() => type(phrase, charIndex + 1), typingSpeed);
      } else {
        // Phrase complete — hold, then delete.
        schedule(() => erase(phrase, phrase.length - 1), holdDuration);
      }
    };

    const erase = (phrase: string, charIndex: number) => {
      if (runIdRef.current !== myRunId) return;
      const partial = phrase.slice(0, charIndex);
      setAnimatedText(partial);
      setIsTyping(false);
      setIsDeleting(true);

      if (charIndex > 0) {
        schedule(() => erase(phrase, charIndex - 1), deletingSpeed);
      } else {
        // Fully erased — advance to next phrase.
        setIsDeleting(false);
        phraseIndexRef.current = (phraseIndexRef.current + 1) % examples.length;
        schedule(() => startPhrase(), betweenDelay);
      }
    };

    const startPhrase = () => {
      if (runIdRef.current !== myRunId) return;
      const phrase = examples[phraseIndexRef.current % examples.length];
      type(phrase, 0);
    };

    // Start with the initial delay.
    schedule(startPhrase, initialDelay);

    return () => {
      cancelTimer();
      // Invalidate this run's callbacks.
      runIdRef.current += 1;
    };
    // We intentionally exclude `examples` identity from deps and use a deep
    // comparison via JSON to avoid re-triggering on referentially-new but
    // semantically-identical arrays.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enabled,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(examples),
    initialDelay,
    typingSpeed,
    deletingSpeed,
    holdDuration,
    betweenDelay,
    cancelTimer,
  ]);

  // When examples change (e.g. intent switch), reset index so we start from
  // the first example of the new set rather than an out-of-bounds position.
  const prevExamplesRef = useRef<string[]>(examples);
  if (JSON.stringify(prevExamplesRef.current) !== JSON.stringify(examples)) {
    prevExamplesRef.current = examples;
    phraseIndexRef.current = 0;
  }

  return { animatedText, isTyping, isDeleting };
}
