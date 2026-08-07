"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, FileText, Loader2, Plus, ShieldCheck, X } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import type {
  StudioDeliveryRecipient,
  StudioDeliveryStatus,
  StudioWorkspaceType,
} from "@/types/domain/studio";

// ──────────────────────────────────────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────────────────────────────────────

export interface SendToClientDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (message?: string) => Promise<void>;
  outputTitle: string;
  versionId: string;
  workspaceType: StudioWorkspaceType;
  recipient: StudioDeliveryRecipient | null;
  deliveryStatus: StudioDeliveryStatus;
  /** Inline error from the last failed send attempt. */
  sendError: string | null;
  /** Real share URL. Only shown when truthy. */
  shareUrl?: string;
  /** Actual included attachment names (unused in proposal flow). */
  attachmentNames?: string[];
  /** Validation reason explaining why the send button is disabled. */
  validationReason?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────

export function SendToClientDialog({
  open,
  onClose,
  onConfirm,
  outputTitle,
  versionId,
  recipient,
  deliveryStatus,
  sendError,
  validationReason,
}: SendToClientDialogProps) {
  const [message, setMessage] = useState("");
  const [showNote, setShowNote] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isSending = deliveryStatus === "sending";

  // Focus the dialog heading when opened for accessibility.
  useEffect(() => {
    if (open) {
      setTimeout(() => headingRef.current?.focus(), 40);
    }
  }, [open]);

  // Focus textarea when "Add a note" is clicked
  useEffect(() => {
    if (showNote) {
      setTimeout(() => textareaRef.current?.focus(), 40);
    }
  }, [showNote]);

  const handleConfirm = async () => {
    if (isSending) return;
    await onConfirm(message.trim() || undefined);
  };

  const hasBlockingValidation = Boolean(validationReason);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="send-dialog-heading"
      preventEscapeClose={isSending}
      style={{ maxWidth: "min(440px, calc(100vw - 32px))" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: "16px 20px 14px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2
            id="send-dialog-heading"
            ref={headingRef}
            tabIndex={-1}
            style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: 700,
              color: "#0f172a",
              outline: "none",
            }}
          >
            Send proposal
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              padding: "4px",
              cursor: isSending ? "not-allowed" : "pointer",
              color: "#64748b",
              borderRadius: "4px",
              display: "grid",
              placeItems: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body ── */}
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {/* 1. Output Summary Card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              borderRadius: "8px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
              <div
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  color: "#0f172a",
                  flexShrink: 0,
                }}
              >
                <FileText size={14} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#0f172a",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {outputTitle}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  Version {versionId}
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "9999px",
                background: "#dcfce7",
                color: "#15803d",
                border: "1px solid #bbf7d0",
                flexShrink: 0,
              }}
            >
              Ready for review
            </span>
          </div>

          {/* 2. Recipient Row */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "12px", fontWeight: 500, color: "#64748b" }}>
              Send securely to
            </span>
            {recipient ? (
              <div style={{ fontSize: "13px", color: "#0f172a", fontWeight: 600 }}>
                {recipient.name}{" "}
                <span style={{ color: "#64748b", fontWeight: 400 }}>· {recipient.email}</span>
              </div>
            ) : (
              <div style={{ fontSize: "12.5px", color: "#dc2626" }}>
                No client is linked to this output.
              </div>
            )}
          </div>

          {/* 3. Delivery Explanation */}
          <div
            style={{
              fontSize: "12.5px",
              color: "#475569",
              lineHeight: "1.4",
            }}
          >
            The client will receive a secure link to view and comment on this proposal.
          </div>

          {/* 4. Optional Note (Collapsed by default) */}
          {!showNote ? (
            <div>
              <button
                type="button"
                onClick={() => setShowNote(true)}
                disabled={isSending}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "#2563eb",
                  fontSize: "12.5px",
                  fontWeight: 500,
                  cursor: isSending ? "not-allowed" : "pointer",
                }}
              >
                <Plus size={13} />
                <span>Add a note</span>
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label
                  htmlFor="send-dialog-message"
                  style={{ fontSize: "12px", fontWeight: 500, color: "#64748b" }}
                >
                  Note for client
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowNote(false);
                    setMessage("");
                  }}
                  disabled={isSending}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    color: "#94a3b8",
                    fontSize: "11.5px",
                    cursor: isSending ? "not-allowed" : "pointer",
                  }}
                >
                  Remove note
                </button>
              </div>
              <textarea
                id="send-dialog-message"
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSending}
                placeholder="Add a short note for the client…"
                rows={3}
                style={{
                  width: "100%",
                  minHeight: "72px",
                  maxHeight: "88px",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: isSending ? "#f8fafc" : "#ffffff",
                  fontSize: "12.5px",
                  color: "#334155",
                  resize: "none",
                  outline: "none",
                  fontFamily: "inherit",
                  lineHeight: "1.4",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#94a3b8"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; }}
              />
            </div>
          )}

          {/* Validation or send error feedback */}
          {(hasBlockingValidation || sendError) && (
            <div
              role="alert"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                padding: "10px 12px",
                borderRadius: "8px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
              }}
            >
              <AlertCircle size={14} style={{ color: "#dc2626", flexShrink: 0, marginTop: "1px" }} />
              <span style={{ fontSize: "12.5px", color: "#dc2626" }}>
                {sendError ?? validationReason}
              </span>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            padding: "12px 20px 16px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            style={{
              height: "34px",
              padding: "0 14px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              color: "#475569",
              fontSize: "13px",
              fontWeight: 600,
              cursor: isSending ? "not-allowed" : "pointer",
              opacity: isSending ? 0.5 : 1,
              transition: "all 0.15s",
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSending || !recipient || hasBlockingValidation}
            aria-disabled={isSending || !recipient || hasBlockingValidation}
            style={{
              height: "34px",
              padding: "0 14px",
              borderRadius: "8px",
              border: "none",
              background:
                isSending || !recipient || hasBlockingValidation ? "#94a3b8" : "#0f172a",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              cursor: isSending || !recipient || hasBlockingValidation ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              transition: "background 0.15s",
            }}
          >
            {isSending ? (
              <>
                <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} />
                <span>Sending…</span>
              </>
            ) : (
              <>
                <ShieldCheck size={14} />
                <span>Send securely</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

