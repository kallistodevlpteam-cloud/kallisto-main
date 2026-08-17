import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { deriveConversationEvents } from "@/features/studio/lib/derive-conversation-events";
import { ConversationSpine } from "@/features/studio/components/conversation-spine/conversation-spine";
import { ConversationEventCard } from "@/features/studio/components/conversation-spine/conversation-event-card";
import { StudioChatMessage } from "@/types/domain/studio-message";
import { ConversationEvent } from "@/types/domain/studio-conversation-event";

afterEach(() => {
  cleanup();
});

describe("deriveConversationEvents", () => {
  it("returns an empty array when there are no messages", () => {
    const events = deriveConversationEvents({ messages: [] });
    expect(events).toEqual([]);
  });

  it("derives REQUIREMENT event from initial user prompt", () => {
    const messages: StudioChatMessage[] = [
      {
        id: "msg-1",
        taskId: "task-1",
        role: "user",
        kind: "text",
        content: "Create a proposal for Villa Design Consultation",
        createdAt: "2026-08-14T10:00:00Z",
      },
    ];

    const events = deriveConversationEvents({ messages, projectName: "Luxury Villa Horizon" });
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("REQUIREMENT");
    expect(events[0].title).toBe("PROJECT REQUIREMENT");
    expect(events[0].messageId).toBe("msg-1");
    expect(events[0].isImportant).toBe(true);
  });

  it("derives AI_ACTION output creation event for V01 assistant output reference", () => {
    const messages: StudioChatMessage[] = [
      {
        id: "msg-1",
        taskId: "task-1",
        role: "user",
        kind: "text",
        content: "Create a proposal",
        createdAt: "2026-08-14T10:00:00Z",
      },
      {
        id: "msg-2",
        taskId: "task-1",
        role: "assistant",
        kind: "text",
        content: "The proposal draft is ready.",
        createdAt: "2026-08-14T10:01:00Z",
        outputReference: {
          outputId: "out-1",
          versionId: "V01",
          title: "Villa Design Proposal",
          statusBadge: "Ready for Review",
          eventType: "created",
        },
      },
    ];

    const events = deriveConversationEvents({ messages });
    expect(events).toHaveLength(2);
    expect(events[1].type).toBe("AI_ACTION");
    expect(events[1].title).toBe("PROPOSAL V01 READY");
    expect(events[1].relatedEntityType).toBe("output");
    expect(events[1].relatedEntityId).toBe("out-1");
    expect(events[1].relatedEntityVersion).toBe("V01");
    expect(events[1].relatedEntityActionLabel).toBe("Open preview");
  });

  it("derives REVISION events for revision requests and V02 updates", () => {
    const messages: StudioChatMessage[] = [
      {
        id: "msg-1",
        taskId: "task-1",
        role: "user",
        kind: "text",
        content: "Create a proposal",
        createdAt: "2026-08-14T10:00:00Z",
      },
      {
        id: "msg-2",
        taskId: "task-1",
        role: "assistant",
        kind: "text",
        content: "Proposal V01 ready",
        createdAt: "2026-08-14T10:01:00Z",
        outputReference: {
          outputId: "out-1",
          versionId: "V01",
          eventType: "created",
        },
      },
      {
        id: "msg-3",
        taskId: "task-1",
        role: "user",
        kind: "text",
        content: "Revise timeline to 4 months",
        createdAt: "2026-08-14T10:05:00Z",
      },
      {
        id: "msg-4",
        taskId: "task-1",
        role: "assistant",
        kind: "text",
        content: "Updated to V02",
        createdAt: "2026-08-14T10:06:00Z",
        outputReference: {
          outputId: "out-1",
          versionId: "V02",
          eventType: "revised",
        },
      },
    ];

    const events = deriveConversationEvents({ messages });
    expect(events).toHaveLength(4);
    expect(events[2].type).toBe("REVISION");
    expect(events[2].title).toBe("REVISION REQUEST");
    expect(events[3].type).toBe("REVISION");
    expect(events[3].title).toBe("PROPOSAL V02 UPDATED");
    expect(events[3].relatedEntityVersion).toBe("V02");
  });

  it("derives DRAWING or DOCUMENT event when user attaches files", () => {
    const messages: StudioChatMessage[] = [
      {
        id: "msg-1",
        taskId: "task-1",
        role: "user",
        kind: "text",
        content: "Attached ground floor plan",
        createdAt: "2026-08-14T10:00:00Z",
        sources: [
          { id: "s-1", name: "Ground_Floor_Plan.pdf", type: "drawing", size: 2400000, status: "ready" },
        ],
      },
    ];

    const events = deriveConversationEvents({ messages });
    expect(events.some((e) => e.type === "DRAWING")).toBe(true);
    const drawingEvt = events.find((e) => e.type === "DRAWING");
    expect(drawingEvt?.title).toBe("DRAWING UPLOADED");
    expect(drawingEvt?.details).toContain("• Ground_Floor_Plan.pdf");
  });
});

describe("ConversationSpine Component", () => {
  const mockEvents: ConversationEvent[] = [
    {
      id: "evt-1",
      type: "REQUIREMENT",
      title: "PROJECT REQUIREMENT",
      summary: "Villa Design Consultation initial scope",
      timestamp: "10:00 AM",
      messageId: "msg-1",
      isImportant: true,
    },
    {
      id: "evt-2",
      type: "AI_ACTION",
      title: "PROPOSAL V01 READY",
      summary: "Created proposal draft V01",
      details: ["• Scope & 3D renders", "• Budget: ₹18L – ₹25L"],
      timestamp: "10:02 AM",
      messageId: "msg-2",
      relatedEntityType: "output",
      relatedEntityId: "out-1",
      relatedEntityVersion: "V01",
      relatedEntityActionLabel: "Open preview",
      isImportant: true,
    },
  ];

  it("renders tick markers along the continuous spine ruler", () => {
    render(
      <ConversationSpine
        events={mockEvents}
        onJumpToMessage={vi.fn()}
      />
    );

    const ticks = screen.getAllByRole("button");
    expect(ticks).toHaveLength(36);
  });

  it("clicking a marker opens the floating event card and calls onJumpToMessage", () => {
    const handleJump = vi.fn();
    const handleSelect = vi.fn();

    render(
      <ConversationSpine
        events={mockEvents}
        onJumpToMessage={handleJump}
        onSelectEvent={handleSelect}
      />
    );

    const ticks = screen.getAllByRole("button");
    // Click a tick slot mapped to the second event (near end of ruler)
    fireEvent.click(ticks[32]);

    expect(handleJump).toHaveBeenCalledWith("msg-2");
    expect(handleSelect).toHaveBeenCalledWith(mockEvents[1]);
    expect(screen.getByText("PROPOSAL V01 READY")).toBeInTheDocument();
    expect(screen.getByText("Created proposal draft V01")).toBeInTheDocument();
    expect(screen.getByText("• Scope & 3D renders")).toBeInTheDocument();
  });

  it("clicking Open preview chip in the event card invokes onOpenEntity", () => {
    const handleOpenEntity = vi.fn();

    render(
      <ConversationSpine
        events={mockEvents}
        selectedEventId="evt-2"
        onJumpToMessage={vi.fn()}
        onOpenEntity={handleOpenEntity}
      />
    );

    // Open card by clicking the second event marker
    const ticks = screen.getAllByRole("button");
    fireEvent.click(ticks[32]);

    const openPreviewBtn = screen.getByRole("button", { name: /Open preview/i });
    expect(openPreviewBtn).toBeInTheDocument();

    fireEvent.click(openPreviewBtn);
    expect(handleOpenEntity).toHaveBeenCalledWith(mockEvents[1]);
  });

  it("Escape key dismisses the floating event card", () => {
    render(
      <ConversationSpine
        events={mockEvents}
        onJumpToMessage={vi.fn()}
      />
    );

    const ticks = screen.getAllByRole("button");
    fireEvent.click(ticks[2]);
    expect(screen.getByText("PROJECT REQUIREMENT")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByText("PROJECT REQUIREMENT")).not.toBeInTheDocument();
  });
});
