"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { parseInlineMarkdown } from "@/components/ui/message";

export interface StreamingTextProps {
  text: string;
  speedMs?: number;
  isAnimated?: boolean;
  onComplete?: () => void;
}

export function StreamingText({
  text,
  speedMs = 16,
  isAnimated = false,
  onComplete,
}: StreamingTextProps) {
  // Check prefers-reduced-motion safely
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const shouldStream = isAnimated && !prefersReducedMotion;
  const [revealedLength, setRevealedLength] = useState<number>(shouldStream ? 0 : text.length);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!shouldStream) {
      setRevealedLength(text.length);
      onCompleteRef.current?.();
      return;
    }

    setRevealedLength(0);
    const totalChars = text.length;
    if (totalChars === 0) {
      onCompleteRef.current?.();
      return;
    }

    // Reveal text smoothly by token chunks (~2-4 chars per tick for natural cadence)
    const chunkSize = 3;
    let current = 0;

    const interval = setInterval(() => {
      current = Math.min(current + chunkSize, totalChars);
      setRevealedLength(current);

      if (current >= totalChars) {
        clearInterval(interval);
        onCompleteRef.current?.();
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [text, shouldStream, speedMs]);

  const displayedText = text.slice(0, revealedLength);
  const parsedNodes = useMemo(() => parseInlineMarkdown(displayedText), [displayedText]);

  return (
    <div
      style={{
        lineHeight: 1.55,
        fontSize: "13.5px",
        color: "#1e293b",
        letterSpacing: "-0.005em",
        transition: "opacity 0.15s ease",
      }}
    >
      {parsedNodes}
    </div>
  );
}
