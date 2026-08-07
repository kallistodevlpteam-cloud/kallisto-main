/**
 * useStudioDelivery
 *
 * Authoritative orchestration layer for the Send to Client workflow.
 * OutputPreviewPanel may own only presentation state.
 * This hook owns:
 *   - Send readiness validation
 *   - Dialog open/close state
 *   - Delivery execution
 *   - Version-specific delivery state updates
 *   - Delivery record history
 */

"use client";

import { useCallback, useRef, useState } from "react";
import type {
  StudioDeliveryRecord,
  StudioDeliveryRecipient,
  StudioVersionDeliveryState,
  StudioWorkspaceType,
} from "@/types/domain/studio";
import {
  type DeliveryClock,
  type StudioSendCommand,
  type StudioSendValidationResult,
  makeVersionDeliveryState,
  sendOutputToClient,
  validateSendReadiness,
} from "@/services/studio/studio-delivery-service";

// ──────────────────────────────────────────────────────────────────────────────
// Hook params
// ──────────────────────────────────────────────────────────────────────────────

export interface UseStudioDeliveryParams {
  workspaceId: string;
  outputId: string;
  versionId: string;
  outputTitle: string;
  workspaceType: StudioWorkspaceType;
  /** Authoritative recipient resolved from the project client record. */
  recipient: StudioDeliveryRecipient | null;
  /** Whether the linked project has a client record. */
  hasClient: boolean;
  /** Whether the current output version has blocking validation errors. */
  hasBlockingErrors: boolean;
  /** Whether the output is still being generated. */
  isGenerating: boolean;
  senderName: string;
  senderId: string;
  /** Attachment identifiers to include with the delivery. */
  attachmentRefs?: string[];
  /** Share URL if a real preview link exists. */
  shareUrl?: string;
  /** Injectable clock for deterministic tests. Defaults to Date.now. */
  clock?: DeliveryClock;
  /** Called on successful delivery so the parent can sync the Outputs panel. */
  onDeliverySuccess?: (record: StudioDeliveryRecord) => void;
}

// ──────────────────────────────────────────────────────────────────────────────
// Hook return value
// ──────────────────────────────────────────────────────────────────────────────

export interface UseStudioDeliveryReturn {
  /** Version-specific delivery state. Owned by this controller, not the panel. */
  deliveryState: StudioVersionDeliveryState;
  /** Committed delivery records for this output+version. */
  deliveryHistory: StudioDeliveryRecord[];
  /** Whether the confirmation dialog is open. */
  dialogOpen: boolean;
  /** Validation result for the current send readiness. */
  validation: StudioSendValidationResult;
  /** Error message from the last failed delivery attempt. */
  sendError: string | null;
  /** Open the send confirmation dialog. */
  openDialog: () => void;
  /** Close the send confirmation dialog. Prevents close while submitting. */
  closeDialog: () => void;
  /** Execute the delivery. Call from dialog's confirm action. */
  confirmSend: (message?: string) => Promise<void>;
  /** Ref to the Send to client button — used to restore focus after dialog closes. */
  sendButtonRef: React.RefObject<HTMLButtonElement | null>;
}

// ──────────────────────────────────────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────────────────────────────────────

export function useStudioDelivery({
  workspaceId,
  outputId,
  versionId,
  outputTitle,
  workspaceType,
  recipient,
  hasClient,
  hasBlockingErrors,
  isGenerating,
  senderName,
  senderId,
  attachmentRefs = [],
  shareUrl,
  clock,
  onDeliverySuccess,
}: UseStudioDeliveryParams): UseStudioDeliveryReturn {
  const [deliveryState, setDeliveryState] = useState<StudioVersionDeliveryState>(
    makeVersionDeliveryState(versionId)
  );
  const [deliveryHistory, setDeliveryHistory] = useState<StudioDeliveryRecord[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const sendButtonRef = useRef<HTMLButtonElement | null>(null);

  const validation = validateSendReadiness({
    hasClient,
    recipientEmail: recipient?.email,
    hasBlockingErrors,
    isGenerating,
    versionAvailable: true,
  });

  const openDialog = useCallback(() => {
    setSendError(null);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    // Prevent close while a send is in progress.
    if (deliveryState.status === "sending") return;
    setDialogOpen(false);
    // Restore focus to the Send to client button.
    setTimeout(() => sendButtonRef.current?.focus(), 0);
  }, [deliveryState.status]);

  const confirmSend = useCallback(
    async (message?: string) => {
      if (!recipient || !validation.valid || deliveryState.status === "sending") {
        return;
      }

      setSendError(null);
      setDeliveryState((prev) => ({ ...prev, status: "sending" }));

      const cmd: StudioSendCommand = {
        workspaceId,
        outputId,
        versionId,
        outputTitle,
        workspaceType,
        recipient,
        senderName,
        senderId,
        message,
        attachmentRefs,
        shareUrl,
      };

      try {
        const record = await sendOutputToClient(cmd, clock);

        const nextState: StudioVersionDeliveryState = {
          versionId,
          status: "delivered",
          sentAt: record.sentAt,
          deliveryRecordId: record.id,
        };

        setDeliveryState(nextState);
        setDeliveryHistory((prev) => [record, ...prev]);
        setDialogOpen(false);
        onDeliverySuccess?.(record);
        // Restore focus to send button after dialog closes.
        setTimeout(() => sendButtonRef.current?.focus(), 0);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Delivery failed. Please try again.";
        setSendError(message);
        setDeliveryState((prev) => ({
          ...prev,
          status: "failed",
          failureReason: message,
        }));
        // Dialog stays open for retry. Do not close.
      }
    },
    [
      recipient,
      validation.valid,
      deliveryState.status,
      workspaceId,
      outputId,
      versionId,
      outputTitle,
      workspaceType,
      senderName,
      senderId,
      attachmentRefs,
      shareUrl,
      clock,
      onDeliverySuccess,
    ]
  );

  return {
    deliveryState,
    deliveryHistory,
    dialogOpen,
    validation,
    sendError,
    openDialog,
    closeDialog,
    confirmSend,
    sendButtonRef,
  };
}
