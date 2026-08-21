import { render, screen, cleanup, act } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AssistantTaskResponse } from "@/features/studio/components/assistant-task-response/assistant-task-response";
import { StreamingText } from "@/features/studio/components/assistant-task-response/streaming-text";
import { OutputGlanceCard } from "@/features/studio/components/assistant-task-response/output-glance-card";

describe("AssistantTaskResponse & AI Generation Animation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
    cleanup();
  });

  it("renders instantly in static completed state when isNewTurn is false (historical turn)", () => {
    render(
      <AssistantTaskResponse
        content="I have prepared the initial villa design proposal."
        outputReference={{
          outputId: "out-1",
          versionId: "V01",
          title: "Villa Design Proposal",
          statusBadge: "Ready for Review",
          eventType: "created",
        }}
        isNewTurn={false}
        onPreviewClick={vi.fn()}
      />
    );

    // Should immediately show full content without thinking state or skeletons
    expect(screen.getByText("I have prepared the initial villa design proposal.")).toBeInTheDocument();
    expect(screen.getByText("Villa Design Proposal")).toBeInTheDocument();
    expect(screen.getByText("V01")).toBeInTheDocument();
    expect(screen.getByText("Ready for Review")).toBeInTheDocument();
    expect(screen.getByText("Preview")).toBeInTheDocument();
  });

  it("orchestrates thinking state and progressive streaming when isNewTurn is true", async () => {
    const onAnimationComplete = vi.fn();

    render(
      <AssistantTaskResponse
        content="Villa proposal structured."
        outputReference={{
          outputId: "out-1",
          versionId: "V01",
          title: "Villa Design Proposal",
          statusBadge: "Ready for Review",
          eventType: "created",
        }}
        isNewTurn={true}
        onAnimationComplete={onAnimationComplete}
        onPreviewClick={vi.fn()}
      />
    );

    // Initial state: thinking indicator visible
    expect(screen.getByText(/Reviewing project scope/i)).toBeInTheDocument();

    // Advance through thinking state (~450ms)
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(screen.getByText(/Structuring proposal/i)).toBeInTheDocument();

    // Advance to streaming (~500ms)
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Advance through streaming text (~300ms)
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Advance through card assembly (~1200ms)
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    // Content should now be fully assembled
    expect(screen.getByText("Villa Design Proposal")).toBeInTheDocument();
    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(onAnimationComplete).toHaveBeenCalled();
  });

  it("StreamingText streams characters and fires onComplete", () => {
    const onComplete = vi.fn();
    render(<StreamingText text="Hello Studio" speedMs={10} isAnimated={true} onComplete={onComplete} />);

    // Advance timers for streaming
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByText("Hello Studio")).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalled();
  });

  it("OutputGlanceCard renders skeleton during progressive assembly then resolves to full card", () => {
    const onAssemblyComplete = vi.fn();
    render(
      <OutputGlanceCard
        title="Custom Residence BOQ"
        version="V02"
        statusBadge="Updated V02"
        isAnimated={true}
        onPreviewClick={vi.fn()}
        onAssemblyComplete={onAssemblyComplete}
      />
    );

    // Initially shows skeleton
    expect(screen.getByLabelText("Generating proposal skeleton")).toBeInTheDocument();

    // Advance through progressive assembly (~1100ms)
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(screen.getByText("Custom Residence BOQ")).toBeInTheDocument();
    expect(screen.getByText("V02")).toBeInTheDocument();
    expect(screen.getByText("Updated V02")).toBeInTheDocument();
    expect(onAssemblyComplete).toHaveBeenCalled();
  });
});
