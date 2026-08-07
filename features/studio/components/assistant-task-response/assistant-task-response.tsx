"use client";

import React from "react";
import { ResponseSummary } from "./response-summary";
import { OutputGlanceCard } from "./output-glance-card";
import { SuggestionChips } from "./suggestion-chips";
import type { StudioTask } from "@/types/domain/studio";
import type { StudioMessageAction, StudioOutputReference } from "@/types/domain/studio-message";

export interface AssistantTaskResponseProps {
  content: string;
  outputReference?: StudioOutputReference;
  isProposalMsg?: boolean;
  task?: StudioTask | null;
  projectName?: string;
  clientName?: string;
  budget?: string;
  actions?: StudioMessageAction[];
  onActionSelect?: (action: StudioMessageAction) => void;
  onPreviewClick: (ref?: StudioOutputReference) => void;
}

export function AssistantTaskResponse({
  content,
  outputReference,
  isProposalMsg,
  projectName = "Villa Design Consultation",
  clientName = "Ananya Builders",
  budget = "₹18L – ₹25L",
  actions = [],
  onActionSelect,
  onPreviewClick,
}: AssistantTaskResponseProps) {
  // OUTPUT CARD RENDERING RULE:
  // Render OutputGlanceCard ONLY when this specific message event carries an outputReference.
  const showGlanceCard = !!outputReference;
  const cardTitle = outputReference?.title || "Villa Design Proposal";
  const cardVersion = outputReference?.versionId || "V01";
  const cardStatus = outputReference?.statusBadge || (cardVersion === "V01" ? "Ready for Review" : `Updated ${cardVersion}`);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <ResponseSummary content={content} />

      {showGlanceCard && (
        <OutputGlanceCard
          title={cardTitle}
          version={cardVersion}
          statusBadge={cardStatus}
          projectName={projectName}
          clientName={clientName}
          budget={budget}
          onPreviewClick={() => onPreviewClick(outputReference)}
        />
      )}

      {actions.length > 0 && onActionSelect && (
        <SuggestionChips actions={actions} onActionSelect={onActionSelect} />
      )}
    </div>
  );
}
