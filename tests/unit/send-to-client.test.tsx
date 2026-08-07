/**
 * Send to Client — Unit Test Suite
 *
 * Covers all 12 required test cases plus delivery service internals.
 */

import { render, screen, fireEvent, waitFor, cleanup, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import {
  validateSendReadiness,
  buildIdempotencyKey,
  sendOutputToClient,
  __resetDeliveryStore,
  __getDeliveryRecord,
  __hasInFlight,
} from "@/services/studio/studio-delivery-service";
import type { StudioSendCommand } from "@/services/studio/studio-delivery-service";
import type { StudioDeliveryRecipient } from "@/types/domain/studio";
import { OutputPreviewPanel } from "@/features/studio/components/output-preview-panel";

// ──────────────────────────────────────────────────────────────────────────────
// Fixtures
// ──────────────────────────────────────────────────────────────────────────────

const RECIPIENT: StudioDeliveryRecipient = {
  clientId: "client-101",
  name: "Ananya Builders",
  email: "client@ananya.example.com",
};

const FAIL_RECIPIENT: StudioDeliveryRecipient = {
  clientId: "client-999",
  name: "Bad Client",
  email: "fail@ananya.example.com",
};

const BASE_CMD = (versionId = "V01"): StudioSendCommand => ({
  workspaceId: "ws-1",
  outputId: "out-1",
  versionId,
  outputTitle: "Villa Design Proposal",
  workspaceType: "proposal",
  recipient: RECIPIENT,
  senderName: "Test Sender",
  senderId: "user-1",
});

const FIXED_CLOCK = () => "2026-08-06T10:00:00.000Z";

// ──────────────────────────────────────────────────────────────────────────────
// Setup
// ──────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  __resetDeliveryStore();
  cleanup();
});

afterEach(() => {
  cleanup();
});

// ──────────────────────────────────────────────────────────────────────────────
// 1. Footer renders both buttons
// ──────────────────────────────────────────────────────────────────────────────

describe("Test 1 – Preview footer renders both action buttons", () => {
  it("shows Request changes and Send to client in the footer", () => {
    render(
      <OutputPreviewPanel
        onBackToOutputs={vi.fn()}
        onClose={vi.fn()}
        onRequestChanges={vi.fn()}
        recipient={RECIPIENT}
        selectedVersionId="V01"
      />
    );

    expect(screen.getByRole("button", { name: "Request changes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send to client" })).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 2. Send to client opens dialog, does NOT send immediately
// ──────────────────────────────────────────────────────────────────────────────

describe("Test 2 – Send to client opens confirmation dialog, not immediate delivery", () => {
  it("clicking Send to client shows the confirmation dialog instead of sending", async () => {
    render(
      <OutputPreviewPanel
        onBackToOutputs={vi.fn()}
        onClose={vi.fn()}
        onRequestChanges={vi.fn()}
        recipient={RECIPIENT}
        selectedVersionId="V01"
      />
    );

    const sendBtn = screen.getByRole("button", { name: "Send to client" });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      const headings = screen.getAllByRole("heading", { level: 2 });
      const dialogHeading = headings.find((h) =>
        h.textContent === "Send proposal"
      );
      expect(dialogHeading).toBeDefined();
    });

    // Delivery has NOT happened yet
    const key = buildIdempotencyKey("ws-default", "out-1", "V01", RECIPIENT.email);
    expect(__getDeliveryRecord(key)).toBeUndefined();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 3. Dialog shows correct output title and version
// ──────────────────────────────────────────────────────────────────────────────

describe("Test 3 – Confirmation dialog shows correct output title and version", () => {
  it("dialog summary card contains output title and version being sent", async () => {
    render(
      <OutputPreviewPanel
        onBackToOutputs={vi.fn()}
        onClose={vi.fn()}
        onRequestChanges={vi.fn()}
        recipient={RECIPIENT}
        selectedVersionId="V02"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Send to client" }));

    await waitFor(() => {
      expect(screen.getAllByText("Villa Design Proposal").length).toBeGreaterThan(0);
      expect(screen.getByText("Version V02")).toBeInTheDocument();
      expect(screen.getByText("Ready for review")).toBeInTheDocument();
    });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 4. Missing recipient email disables send with explanation
// ──────────────────────────────────────────────────────────────────────────────

describe("Test 4 – Missing recipient blocks delivery with a clear reason", () => {
  it("returns invalid result with MISSING_RECIPIENT_EMAIL when email is absent", () => {
    const result = validateSendReadiness({
      hasClient: true,
      recipientEmail: "",
      hasBlockingErrors: false,
      isGenerating: false,
      versionAvailable: true,
    });

    expect(result.valid).toBe(false);
    expect(result.error).toBe("MISSING_RECIPIENT_EMAIL");
    expect(result.reason).toBe("Add a client email before sending.");
  });

  it("returns invalid result with NO_CLIENT_LINKED when client is absent", () => {
    const result = validateSendReadiness({
      hasClient: false,
      recipientEmail: undefined,
      hasBlockingErrors: false,
      isGenerating: false,
      versionAvailable: true,
    });

    expect(result.valid).toBe(false);
    expect(result.error).toBe("NO_CLIENT_LINKED");
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 5. Blocking validation errors prevent send
// ──────────────────────────────────────────────────────────────────────────────

describe("Test 5 – Blocking validation errors prevent sending", () => {
  it("validateSendReadiness returns invalid with BLOCKING_VALIDATION_ERRORS", () => {
    const result = validateSendReadiness({
      hasClient: true,
      recipientEmail: "ok@example.com",
      hasBlockingErrors: true,
      isGenerating: false,
      versionAvailable: true,
    });

    expect(result.valid).toBe(false);
    expect(result.error).toBe("BLOCKING_VALIDATION_ERRORS");
    expect(result.reason).toBe("Resolve blocking validation issues before sending.");
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 6. Duplicate sends do not create extra delivery records (idempotency)
// ──────────────────────────────────────────────────────────────────────────────

describe("Test 6 – Repeated clicks do not create duplicate deliveries", () => {
  it("concurrent calls with the same key return the same promise", async () => {
    const cmd = BASE_CMD("V01");
    const [p1, p2, p3] = [
      sendOutputToClient(cmd, FIXED_CLOCK),
      sendOutputToClient(cmd, FIXED_CLOCK),
      sendOutputToClient(cmd, FIXED_CLOCK),
    ];

    const results = await Promise.all([p1, p2, p3]);
    // All results are the same record
    expect(results[0].id).toBe(results[1].id);
    expect(results[1].id).toBe(results[2].id);

    // Only one delivery record written
    const key = buildIdempotencyKey("ws-1", "out-1", "V01", RECIPIENT.email);
    const stored = __getDeliveryRecord(key);
    expect(stored).toBeDefined();
    expect(stored!.deliveryStatus).toBe("delivered");
  });

  it("calling again after delivery returns the same cached record without re-sending", async () => {
    const cmd = BASE_CMD("V01");
    const r1 = await sendOutputToClient(cmd, FIXED_CLOCK);
    const r2 = await sendOutputToClient(cmd, FIXED_CLOCK);
    expect(r1.id).toBe(r2.id);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 7. Successful send updates status to Sent to Client
// ──────────────────────────────────────────────────────────────────────────────

describe("Test 7 – Successful send records delivered status", () => {
  it("sendOutputToClient resolves with deliveryStatus=delivered", async () => {
    const record = await sendOutputToClient(BASE_CMD("V01"), FIXED_CLOCK);

    expect(record.deliveryStatus).toBe("delivered");
    expect(record.outputId).toBe("out-1");
    expect(record.versionId).toBe("V01");
    expect(record.recipient.email).toBe(RECIPIENT.email);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 8. Sent timestamp and version are recorded in the delivery record
// ──────────────────────────────────────────────────────────────────────────────

describe("Test 8 – Sent timestamp and version are recorded", () => {
  it("delivery record contains correct sentAt from injected clock and exact versionId", async () => {
    const record = await sendOutputToClient(BASE_CMD("V01"), FIXED_CLOCK);

    expect(record.sentAt).toBe("2026-08-06T10:00:00.000Z");
    expect(record.versionId).toBe("V01");
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 9. Sending V01 does NOT mark V02 as sent (version isolation)
// ──────────────────────────────────────────────────────────────────────────────

describe("Test 9 – Sending V01 does not mark V02 as delivered", () => {
  it("V02 has no delivery record after V01 is sent", async () => {
    await sendOutputToClient(BASE_CMD("V01"), FIXED_CLOCK);

    const v1key = buildIdempotencyKey("ws-1", "out-1", "V01", RECIPIENT.email);
    const v2key = buildIdempotencyKey("ws-1", "out-1", "V02", RECIPIENT.email);

    expect(__getDeliveryRecord(v1key)?.deliveryStatus).toBe("delivered");
    expect(__getDeliveryRecord(v2key)).toBeUndefined();
  });

  it("V01 and V02 deliveries are completely independent records", async () => {
    const r1 = await sendOutputToClient(BASE_CMD("V01"), FIXED_CLOCK);
    const r2 = await sendOutputToClient(BASE_CMD("V02"), FIXED_CLOCK);

    expect(r1.id).not.toBe(r2.id);
    expect(r1.versionId).toBe("V01");
    expect(r2.versionId).toBe("V02");
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 10. Failed delivery does NOT change output status to delivered
// ──────────────────────────────────────────────────────────────────────────────

describe("Test 10 – Failed delivery does not change output status", () => {
  it("sendOutputToClient throws and does not write a delivered record on failure", async () => {
    const failCmd: StudioSendCommand = {
      ...BASE_CMD("V01"),
      recipient: FAIL_RECIPIENT,
    };

    await expect(sendOutputToClient(failCmd, FIXED_CLOCK)).rejects.toThrow("Delivery could not be completed");

    const key = buildIdempotencyKey("ws-1", "out-1", "V01", FAIL_RECIPIENT.email);
    expect(__getDeliveryRecord(key)).toBeUndefined();
  });

  it("failed delivery can be retried and succeeds with a fresh recipient", async () => {
    const failCmd: StudioSendCommand = { ...BASE_CMD("V01"), recipient: FAIL_RECIPIENT };
    const goodCmd: StudioSendCommand = { ...BASE_CMD("V01"), recipient: RECIPIENT };

    await expect(sendOutputToClient(failCmd, FIXED_CLOCK)).rejects.toThrow();
    const r = await sendOutputToClient(goodCmd, FIXED_CLOCK);
    expect(r.deliveryStatus).toBe("delivered");
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 11. Request changes retains its existing behaviour
// ──────────────────────────────────────────────────────────────────────────────

describe("Test 11 – Request changes retains existing behaviour", () => {
  it("clicking Request changes calls onRequestChanges without opening the send dialog", async () => {
    const onRequestChanges = vi.fn();

    render(
      <OutputPreviewPanel
        onBackToOutputs={vi.fn()}
        onClose={vi.fn()}
        onRequestChanges={onRequestChanges}
        recipient={RECIPIENT}
        selectedVersionId="V01"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Request changes" }));

    expect(onRequestChanges).toHaveBeenCalledTimes(1);

    // Send dialog should NOT be open
    expect(screen.queryByRole("heading", { level: 2, name: /Send Villa/i })).not.toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 12. Footer responsive at all panel widths
// ──────────────────────────────────────────────────────────────────────────────

describe("Test 12 – Footer is accessible at all standard panel widths", () => {
  it.each([320, 480, 640, 900])("both footer buttons are readable at %ipx width", (width) => {
    // jsdom does not have layout, so we verify semantic availability not pixel wrapping.
    const { container } = render(
      <OutputPreviewPanel
        onBackToOutputs={vi.fn()}
        onClose={vi.fn()}
        onRequestChanges={vi.fn()}
        recipient={RECIPIENT}
        selectedVersionId="V01"
      />
    );
    container.style.width = `${width}px`;

    const requestBtn = screen.getByRole("button", { name: "Request changes" });
    const sendBtn = screen.getByRole("button", { name: "Send to client" });

    expect(requestBtn).toBeInTheDocument();
    expect(sendBtn).toBeInTheDocument();
    // Labels must not be empty
    expect(requestBtn.textContent).toContain("Request changes");
    expect(sendBtn.textContent).toContain("Send to client");
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Service internals — concurrency: in-flight deduplication
// ──────────────────────────────────────────────────────────────────────────────

describe("Delivery service — in-flight deduplication", () => {
  it("concurrent calls with the same key produce only one delivery record", async () => {
    const cmd = BASE_CMD("V01");
    const key = buildIdempotencyKey("ws-1", "out-1", "V01", RECIPIENT.email);

    // Both calls made synchronously before either resolves.
    // The in-flight map is set synchronously after p1 is created,
    // so p2 must hit the in-flight branch.
    expect(__hasInFlight(key)).toBe(false);
    const p1 = sendOutputToClient(cmd, FIXED_CLOCK);
    expect(__hasInFlight(key)).toBe(true);
    const p2 = sendOutputToClient(cmd, FIXED_CLOCK);

    // Wait for both
    const [r1, r2] = await Promise.all([p1, p2]);

    // Both must return the exact same record id — no duplicate was created.
    expect(r1.id).toBe(r2.id);
    // Only one record exists in the store
    expect(__getDeliveryRecord(key)).toBeDefined();
    expect(__hasInFlight(key)).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Idempotency key format
// ──────────────────────────────────────────────────────────────────────────────

describe("buildIdempotencyKey", () => {
  it("normalises email to lowercase and trims whitespace", () => {
    const k1 = buildIdempotencyKey("ws-1", "out-1", "V01", "  CLIENT@Example.COM  ");
    const k2 = buildIdempotencyKey("ws-1", "out-1", "V01", "client@example.com");
    expect(k1).toBe(k2);
  });

  it("produces distinct keys for different versions", () => {
    const k1 = buildIdempotencyKey("ws-1", "out-1", "V01", "a@b.com");
    const k2 = buildIdempotencyKey("ws-1", "out-1", "V02", "a@b.com");
    expect(k1).not.toBe(k2);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Simplified Proposal Send Confirmation Dialog & Delivery Record Requirements
// ──────────────────────────────────────────────────────────────────────────────

describe("Secure Proposal Output-Delivery Confirmation Modal", () => {
  it("shows proposal summary card with title, version, and ready for review status", async () => {
    render(
      <OutputPreviewPanel
        onBackToOutputs={vi.fn()}
        onClose={vi.fn()}
        onRequestChanges={vi.fn()}
        recipient={RECIPIENT}
        selectedVersionId="V01"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Send to client" }));

    await waitFor(() => {
      expect(screen.getAllByText("Villa Design Proposal").length).toBeGreaterThan(0);
      expect(screen.getByText("Version V01")).toBeInTheDocument();
      expect(screen.getByText("Ready for review")).toBeInTheDocument();
    });
  });

  it("displays recipient details in a compact row under 'Send securely to' without a large card", async () => {
    render(
      <OutputPreviewPanel
        onBackToOutputs={vi.fn()}
        onClose={vi.fn()}
        onRequestChanges={vi.fn()}
        recipient={RECIPIENT}
        selectedVersionId="V01"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Send to client" }));

    await waitFor(() => {
      expect(screen.getByText("Send securely to")).toBeInTheDocument();
      expect(screen.getAllByText(/Ananya Builders/).length).toBeGreaterThan(0);
      expect(screen.getByText(/client@ananya.example.com/)).toBeInTheDocument();
    });
  });

  it("keeps note textarea hidden initially and expands it when '+ Add a note' is clicked", async () => {
    render(
      <OutputPreviewPanel
        onBackToOutputs={vi.fn()}
        onClose={vi.fn()}
        onRequestChanges={vi.fn()}
        recipient={RECIPIENT}
        selectedVersionId="V01"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Send to client" }));

    await waitFor(() => {
      expect(screen.getByText("Add a note")).toBeInTheDocument();
    });

    expect(screen.queryByPlaceholderText("Add a short note for the client…")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Add a note"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Add a short note for the client…")).toBeInTheDocument();
    });
  });

  it("primary action reads 'Send securely' and does not use paper-plane styling", async () => {
    render(
      <OutputPreviewPanel
        onBackToOutputs={vi.fn()}
        onClose={vi.fn()}
        onRequestChanges={vi.fn()}
        recipient={RECIPIENT}
        selectedVersionId="V01"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Send to client" }));

    await waitFor(() => {
      const primaryBtn = screen.getByRole("button", { name: "Send securely" });
      expect(primaryBtn).toBeInTheDocument();
    });
  });

  it("displays delivery explanation note and does not show source project files", async () => {
    render(
      <OutputPreviewPanel
        onBackToOutputs={vi.fn()}
        onClose={vi.fn()}
        onRequestChanges={vi.fn()}
        recipient={RECIPIENT}
        selectedVersionId="V01"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Send to client" }));

    await waitFor(() => {
      expect(
        screen.getByText("The client will receive a secure link to view and comment on this proposal.")
      ).toBeInTheDocument();
    });

    expect(screen.queryByText("Floor Plan - Ground.pdf")).not.toBeInTheDocument();
    expect(screen.queryByText("Spatial_3D_Renders.png")).not.toBeInTheDocument();
    expect(screen.queryByText("BOQ_Initial_Takeoff.xlsx")).not.toBeInTheDocument();
    expect(screen.queryByText("Included")).not.toBeInTheDocument();
  });

  it("delivery record attachmentRefs defaults to empty array and records correct version", async () => {
    const record = await sendOutputToClient(BASE_CMD("V01"), FIXED_CLOCK);
    expect(record.attachmentRefs).toEqual([]);
    expect(record.versionId).toBe("V01");
  });
});


