/**
 * StudioDeliveryService
 *
 * Authoritative delivery orchestration for Hive Studio outputs.
 *
 * Idempotency key format:
 *   workspaceId:outputId:versionId:normalizedRecipientEmail
 *
 * Concurrency guarantees:
 *   - A delivered record returns the existing record immediately (no re-send).
 *   - An in-flight delivery returns the same Promise (no duplicate dispatch).
 *   - A failed delivery clears the in-flight entry and may be retried.
 *   - Only one initial delivery occurs for concurrent identical requests.
 *
 * Production path: replace the in-memory maps with a Firestore server-action
 * or Cloud Function. The idempotencyKey becomes the document ID, written with
 * { merge: false } to guarantee atomic single-write semantics.
 */

import type {
  StudioDeliveryRecord,
  StudioDeliveryRecipient,
  StudioDeliveryStatus,
  StudioVersionDeliveryState,
  StudioWorkspaceType,
} from "@/types/domain/studio";

// ──────────────────────────────────────────────────────────────────────────────
// Clock abstraction — injectable for deterministic tests
// ──────────────────────────────────────────────────────────────────────────────

export type DeliveryClock = () => string;

const defaultClock: DeliveryClock = () => new Date().toISOString();

// ──────────────────────────────────────────────────────────────────────────────
// Send command
// ──────────────────────────────────────────────────────────────────────────────

export interface StudioSendCommand {
  workspaceId: string;
  outputId: string;
  versionId: string;
  outputTitle: string;
  workspaceType: StudioWorkspaceType;
  recipient: StudioDeliveryRecipient;
  senderName: string;
  senderId: string;
  message?: string;
  attachmentRefs?: string[];
  shareUrl?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────────────────────────────────────

export type StudioSendValidationError =
  | "NO_CLIENT_LINKED"
  | "MISSING_RECIPIENT_EMAIL"
  | "BLOCKING_VALIDATION_ERRORS"
  | "OUTPUT_STILL_GENERATING"
  | "VERSION_UNAVAILABLE";

export interface StudioSendValidationResult {
  valid: boolean;
  error?: StudioSendValidationError;
  /** Human-readable explanation suitable for display in the footer or dialog. */
  reason?: string;
}

export interface StudioSendParams {
  hasClient: boolean;
  recipientEmail?: string;
  hasBlockingErrors: boolean;
  isGenerating: boolean;
  versionAvailable: boolean;
}

export function validateSendReadiness(params: StudioSendParams): StudioSendValidationResult {
  if (!params.hasClient) {
    return { valid: false, error: "NO_CLIENT_LINKED", reason: "No client is linked to this output." };
  }
  if (!params.recipientEmail || params.recipientEmail.trim() === "") {
    return { valid: false, error: "MISSING_RECIPIENT_EMAIL", reason: "Add a client email before sending." };
  }
  if (params.hasBlockingErrors) {
    return {
      valid: false,
      error: "BLOCKING_VALIDATION_ERRORS",
      reason: "Resolve blocking validation issues before sending.",
    };
  }
  if (params.isGenerating) {
    return { valid: false, error: "OUTPUT_STILL_GENERATING", reason: "This version is not ready to send." };
  }
  if (!params.versionAvailable) {
    return { valid: false, error: "VERSION_UNAVAILABLE", reason: "This version is not ready to send." };
  }
  return { valid: true };
}

// ──────────────────────────────────────────────────────────────────────────────
// Idempotency key
// ──────────────────────────────────────────────────────────────────────────────

export function buildIdempotencyKey(
  workspaceId: string,
  outputId: string,
  versionId: string,
  recipientEmail: string
): string {
  return `${workspaceId}:${outputId}:${versionId}:${recipientEmail.trim().toLowerCase()}`;
}

// ──────────────────────────────────────────────────────────────────────────────
// In-memory stores (prototype)
// Production: replace with Firestore writes inside a server action or Cloud Function
// ──────────────────────────────────────────────────────────────────────────────

/** Committed delivery records keyed by idempotencyKey. */
const deliveryRecords = new Map<string, StudioDeliveryRecord>();

/**
 * In-flight delivery promises keyed by idempotencyKey.
 * Cleared on completion (success or failure).
 */
const inFlightDeliveries = new Map<string, Promise<StudioDeliveryRecord>>();

let _recordCounter = 0;
function newRecordId(): string {
  return `del-${Date.now()}-${++_recordCounter}`;
}

// ──────────────────────────────────────────────────────────────────────────────
// Core delivery function
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Send an output version to a client.
 *
 * Concurrency rules:
 *   - Already delivered → return cached record (no re-send).
 *   - In-flight → return same Promise (no duplicate dispatch).
 *   - Previously failed → clear in-flight, retry.
 *   - New → create, cache promise, execute.
 */
export async function sendOutputToClient(
  cmd: StudioSendCommand,
  clock: DeliveryClock = defaultClock
): Promise<StudioDeliveryRecord> {
  const key = buildIdempotencyKey(
    cmd.workspaceId,
    cmd.outputId,
    cmd.versionId,
    cmd.recipient.email
  );

  // 1. Already delivered — short-circuit.
  const existing = deliveryRecords.get(key);
  if (existing && existing.deliveryStatus === "delivered") {
    return existing;
  }

  // 2. In-flight — return same promise.
  const inFlight = inFlightDeliveries.get(key);
  if (inFlight) {
    return inFlight;
  }

  // 3. New delivery (or retry after failure).
  const deliveryPromise = (async (): Promise<StudioDeliveryRecord> => {
    // Simulate async delivery. Production: call Cloud Function / server action.
    await new Promise<void>((resolve) => setTimeout(resolve, 900));

    // Test hook: email containing "fail" triggers failure.
    const willFail = cmd.recipient.email.toLowerCase().includes("fail");

    if (willFail) {
      inFlightDeliveries.delete(key);
      throw new StudioSendError(
        "DELIVERY_FAILED",
        "Delivery could not be completed. Please try again."
      );
    }

    const record: StudioDeliveryRecord = {
      id: newRecordId(),
      workspaceId: cmd.workspaceId,
      outputId: cmd.outputId,
      versionId: cmd.versionId,
      recipient: cmd.recipient,
      senderName: cmd.senderName,
      senderId: cmd.senderId,
      sentAt: clock(),
      deliveryStatus: "delivered",
      deliveryChannel: "email",
      message: cmd.message,
      attachmentRefs: cmd.attachmentRefs ?? [],
      idempotencyKey: key,
    };

    deliveryRecords.set(key, record);
    inFlightDeliveries.delete(key);
    return record;
  })();

  inFlightDeliveries.set(key, deliveryPromise);
  deliveryPromise.catch(() => inFlightDeliveries.delete(key));

  return deliveryPromise;
}

// ──────────────────────────────────────────────────────────────────────────────
// Error class
// ──────────────────────────────────────────────────────────────────────────────

export class StudioSendError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "StudioSendError";
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Version delivery state factory
// ──────────────────────────────────────────────────────────────────────────────

export function makeVersionDeliveryState(
  versionId: string,
  status: StudioDeliveryStatus = "not_sent"
): StudioVersionDeliveryState {
  return { versionId, status };
}

// ──────────────────────────────────────────────────────────────────────────────
// Test helpers — exported for test use only
// ──────────────────────────────────────────────────────────────────────────────

export function __resetDeliveryStore(): void {
  deliveryRecords.clear();
  inFlightDeliveries.clear();
}

export function __getDeliveryRecord(key: string): StudioDeliveryRecord | undefined {
  return deliveryRecords.get(key);
}

export function __hasInFlight(key: string): boolean {
  return inFlightDeliveries.has(key);
}
