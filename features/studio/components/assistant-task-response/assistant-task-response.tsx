"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ResponseSummary } from "./response-summary";
import { OutputGlanceCard } from "./output-glance-card";
import { ProviderEnquiryGlanceCard } from "./provider-enquiry-glance-card";
import { SuggestionChips } from "./suggestion-chips";
import { StreamingText } from "./streaming-text";
import { ThinkingIndicator } from "@/components/ui/thinking-indicator";
import type { StudioTask } from "@/types/domain/studio";
import type {
  StudioMessageAction,
  StudioOutputReference,
  StudioProviderCardReference,
} from "@/types/domain/studio-message";

export interface AssistantTaskResponseProps {
  content: string;
  outputReference?: StudioOutputReference;
  providerCard?: StudioProviderCardReference;
  isProposalMsg?: boolean;
  task?: StudioTask | null;
  projectName?: string;
  clientName?: string;
  budget?: string;
  actions?: StudioMessageAction[];
  isNewTurn?: boolean;
  onAnimationComplete?: () => void;
  onActionSelect?: (action: StudioMessageAction) => void;
  onPreviewClick: (ref?: StudioOutputReference) => void;
}

type TurnStage = "thinking" | "streaming" | "card" | "chips" | "complete";

export function AssistantTaskResponse({
  content,
  outputReference,
  providerCard,
  isProposalMsg,
  projectName = "Villa Design Consultation",
  clientName = "Ananya Builders",
  budget = "₹18L – ₹25L",
  actions = [],
  isNewTurn = false,
  onAnimationComplete,
  onActionSelect,
  onPreviewClick,
}: AssistantTaskResponseProps) {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const shouldAnimate = isNewTurn && !prefersReducedMotion;
  const [stage, setStage] = useState<TurnStage>(shouldAnimate ? "thinking" : "complete");
  const [thinkingStatus, setThinkingStatus] = useState<string>("Reviewing project scope…");
  const onAnimationCompleteRef = useRef(onAnimationComplete);
  onAnimationCompleteRef.current = onAnimationComplete;

  const showGlanceCard = !!outputReference;
  const cardTitle = outputReference?.title || "Villa Design Proposal";
  const cardVersion = outputReference?.versionId || "V01";
  const cardStatus = outputReference?.statusBadge || (cardVersion === "V01" ? "Ready for Review" : `Updated ${cardVersion}`);

  // Orchestrate thinking -> streaming -> card -> chips -> complete
  useEffect(() => {
    if (!shouldAnimate) {
      setStage("complete");
      onAnimationCompleteRef.current?.();
      return;
    }

    setStage("thinking");
    setThinkingStatus("Reviewing project scope…");

    const timers: NodeJS.Timeout[] = [];

    // Stage 1: Dynamic thinking transition (brief ~400ms)
    timers.push(
      setTimeout(() => {
        setThinkingStatus("Structuring proposal…");
      }, 200)
    );

    timers.push(
      setTimeout(() => {
        setStage("streaming");
      }, 450)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [shouldAnimate]);

  const handleTextStreamComplete = () => {
    if (showGlanceCard) {
      setStage("card");
    } else if (actions.length > 0) {
      setStage("chips");
      setTimeout(() => {
        setStage("complete");
        onAnimationCompleteRef.current?.();
      }, 300);
    } else {
      setStage("complete");
      onAnimationCompleteRef.current?.();
    }
  };

  const handleCardAssemblyComplete = () => {
    if (actions.length > 0) {
      setStage("chips");
      setTimeout(() => {
        setStage("complete");
        onAnimationCompleteRef.current?.();
      }, 350);
    } else {
      setStage("complete");
      onAnimationCompleteRef.current?.();
    }
  };

  if (stage === "thinking") {
    return (
      <div style={{ margin: "2px 0" }}>
        <ThinkingIndicator active={true} variant="shimmer" label={thinkingStatus} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {/* AI Text Summary / Streaming */}
      {stage === "streaming" ? (
        <StreamingText
          text={content}
          isAnimated={true}
          onComplete={handleTextStreamComplete}
        />
      ) : (
        <ResponseSummary content={content} />
      )}

      {/* Progressive Structured Proposal Card */}
      {showGlanceCard && (stage === "card" || stage === "chips" || stage === "complete") && (
        <OutputGlanceCard
          title={cardTitle}
          version={cardVersion}
          statusBadge={cardStatus}
          projectName={projectName}
          clientName={clientName}
          budget={budget}
          isAnimated={stage === "card"}
          onPreviewClick={() => onPreviewClick(outputReference)}
          onAssemblyComplete={handleCardAssemblyComplete}
        />
      )}

      {/* Selected Provider Confirmation Card */}
      {providerCard && (
        <ProviderEnquiryGlanceCard providerCard={providerCard} />
      )}

      {/* Suggested Action Chips */}
      {actions.length > 0 && onActionSelect && (stage === "chips" || stage === "complete") && (
        <SuggestionChips
          actions={actions}
          isAnimated={stage === "chips"}
          onActionSelect={onActionSelect}
        />
      )}
    </div>
  );
}
