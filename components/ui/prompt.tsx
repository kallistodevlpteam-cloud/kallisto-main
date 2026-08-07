"use client";

import React, { useRef, useState } from "react";
import { ArrowUp, AudioLines } from "lucide-react";
import styles from "./prompt.module.css";

export interface PromptProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "onSubmit"> {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onVoiceClick?: () => void;
  placeholder?: string;
  maxLength?: number;
  usagePercentage?: number;
  showUsage?: boolean;
  isSubmitting?: boolean;
  disabled?: boolean;
  attachments?: Array<{ id: string; name: string }>;
  onAddAttachment?: (file: any) => void;
  onRemoveAttachment?: (id: string) => void;
  children?: React.ReactNode;
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
}

export function Prompt({
  value,
  onChange,
  onSubmit,
  onVoiceClick,
  placeholder = "Ask Hive Studio to continue, refine or create an output...",
  maxLength = 4000,
  usagePercentage,
  showUsage = true,
  isSubmitting = false,
  disabled = false,
  attachments = [],
  children,
  leftActions,
  rightActions,
  className = "",
  ...props
}: PromptProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Calculate percentage used based on character length vs max capacity if not provided
  const calculatedUsage = usagePercentage ?? Math.min(100, Math.round((value.length / maxLength) * 100));

  const showSendButton = isFocused || value.trim().length > 0 || attachments.length > 0;
  const canSubmit = (value.trim().length > 0 || attachments.length > 0) && !isSubmitting && !disabled;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit) onSubmit();
    }
  };

  const handleButtonClick = () => {
    if (showSendButton) {
      if (canSubmit) onSubmit();
    } else {
      if (onVoiceClick) onVoiceClick();
      else onSubmit();
    }
  };

  return (
    <div
      className={`${styles.promptContainer} ${isFocused ? styles.focused : ""} ${className}`}
      {...props}
    >
      <div className={styles.textareaWrapper}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          rows={2}
          className={styles.textarea}
        />
      </div>

      <div className={styles.toolbar}>
        <div className={styles.leftActions}>
          {leftActions}
        </div>

        <div className={styles.rightActions}>
          {showUsage && (
            <span
              className={styles.usageBadge}
              title={`${value.length} / ${maxLength} characters (${calculatedUsage}% context limit used)`}
            >
              {calculatedUsage}% used
            </span>
          )}

          {rightActions ? (
            rightActions
          ) : (
            <button
              type="button"
              disabled={disabled || isSubmitting || (showSendButton && !canSubmit)}
              onClick={handleButtonClick}
              className={`${styles.submitBtn} ${
                showSendButton
                  ? canSubmit
                    ? styles.activeSubmit
                    : ""
                  : styles.voiceBtn
              }`}
              title={showSendButton ? "Send task command" : "Start Voice Mode"}
              aria-label={showSendButton ? "Send task command" : "Start Voice Mode"}
            >
              {showSendButton ? <ArrowUp size={18} /> : <AudioLines size={18} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function PromptUsage({
  percentage = 52,
  className = "",
}: {
  percentage?: number;
  className?: string;
}) {
  return (
    <span
      className={`${styles.usageBadge} ${className}`}
      title={`${percentage}% of context window limit used`}
    >
      {percentage}% used
    </span>
  );
}
