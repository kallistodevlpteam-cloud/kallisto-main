/**
 * Shared accessible Dialog primitive.
 *
 * Uses the native <dialog> element in browser environments (showModal available).
 * Falls back to a div[role=dialog] in jsdom (testing) environments where
 * showModal is not implemented, ensuring dialog children are always in the DOM.
 *
 * Used by: SendToClientDialog (and any future confirmation sheets)
 */

"use client";

import React, { useEffect, useRef } from "react";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** Aria label for the dialog. Use when there is no visible heading. */
  "aria-label"?: string;
  /** ID of the element that labels the dialog. Prefer this when a heading is visible. */
  "aria-labelledby"?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  /** If true, pressing Escape is suppressed (e.g. during a send in progress). */
  preventEscapeClose?: boolean;
}

const sharedDialogStyle: React.CSSProperties = {
  padding: 0,
  border: "none",
  borderRadius: "16px",
  boxShadow: "0 20px 60px rgba(15, 23, 42, 0.18), 0 4px 16px rgba(15, 23, 42, 0.08)",
  background: "#ffffff",
  maxWidth: "min(480px, calc(100vw - 32px))",
  width: "100%",
};

export function Dialog({
  open,
  onClose,
  className,
  style,
  children,
  preventEscapeClose = false,
  ...ariaProps
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const hasNativeDialog =
    typeof window !== "undefined" &&
    typeof (window as unknown as { HTMLDialogElement?: unknown }).HTMLDialogElement !== "undefined" &&
    typeof HTMLDialogElement !== "undefined" &&
    typeof (document.createElement("dialog") as HTMLDialogElement).showModal === "function";

  useEffect(() => {
    if (!hasNativeDialog) return;
    const el = dialogRef.current;
    if (!el) return;

    if (open) {
      if (typeof el.showModal === "function" && !el.open) {
        el.showModal();
      }
    } else {
      if (el.open) {
        el.close();
      }
    }
  }, [open, hasNativeDialog]);

  // Intercept the native "cancel" event (fired on Escape)
  useEffect(() => {
    if (!hasNativeDialog) return;
    const el = dialogRef.current;
    if (!el) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      if (!preventEscapeClose) {
        onClose();
      }
    };

    el.addEventListener("cancel", handleCancel);
    return () => el.removeEventListener("cancel", handleCancel);
  }, [preventEscapeClose, onClose, hasNativeDialog]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLElement>) => {
    if (e.target === dialogRef.current && !preventEscapeClose) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape" && !preventEscapeClose) {
      onClose();
    }
  };

  const mergedStyle: React.CSSProperties = { ...sharedDialogStyle, ...style };

  // Native <dialog> path (real browser)
  if (hasNativeDialog) {
    return (
      <dialog
        ref={dialogRef}
        className={className}
        style={mergedStyle}
        aria-modal="true"
        {...ariaProps}
        onClick={handleBackdropClick}
      >
        {children}
      </dialog>
    );
  }

  // Fallback path for jsdom (testing): div with role="dialog" so children are
  // always rendered in the DOM. Visibility controlled by open prop.
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={className}
      style={mergedStyle}
      {...ariaProps}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
    >
      {children}
    </div>
  );
}

