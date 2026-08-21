"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { OdinDuotoneIcon } from "@/components/layout/sidebar-icons";
import styles from "./message.module.css";

export interface MessageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "content"> {
  role: "user" | "assistant" | "system";
  content?: React.ReactNode;
  avatar?: React.ReactNode;
  actions?: React.ReactNode;
  timestamp?: string;
  status?: "thinking" | "ready" | "error";
  children?: React.ReactNode;
}

export function Message({
  role,
  content,
  avatar,
  actions,
  timestamp = "Just now",
  children,
  className = "",
  ...props
}: MessageProps) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  const textContent = typeof content === "string" ? content : "";

  const handleCopy = () => {
    if (textContent && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const defaultAssistantAvatar = (
    <div
      className={status === "thinking" ? styles.avatarThinking : undefined}
      style={{
        width: "28px",
        height: "28px",
        borderRadius: "8px",
        background: "#f7f7f5",
        border: "none",
        color: "#0f172a",
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        marginTop: "2px",
      }}
    >
      <OdinDuotoneIcon size={16} />
    </div>
  );

  return (
    <div
      className={`${styles.messageWrapper} ${isUser ? styles.messageUser : styles.messageAssistant} ${className}`}
      {...props}
    >
      {!isUser && <div className={styles.messageAvatar}>{avatar || defaultAssistantAvatar}</div>}

      <div className={styles.messageBody}>
        {content ? <MessageContent>{content}</MessageContent> : children}
        {actions && <div className={styles.messageActionsRow}>{actions}</div>}

        {isUser && (
          <div className={styles.userHoverBar}>
            <span className={styles.userTimestamp}>{timestamp}</span>
            {textContent && (
              <button
                type="button"
                onClick={handleCopy}
                className={styles.copyBtn}
                title={copied ? "Copied!" : "Copy message"}
                aria-label="Copy message"
              >
                {copied ? <Check size={13} style={{ color: "#16a34a" }} /> : <Copy size={13} />}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={index} style={{ fontWeight: 650, color: "#0f172a" }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export function renderMarkdownContent(content: string): React.ReactNode {
  const blocks = content.split(/\n\n+/);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", maxWidth: "100%", textAlign: "left" }}>
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Heading 3: ### Title
        if (trimmed.startsWith("### ")) {
          const title = trimmed.replace(/^###\s+/, "");
          return (
            <h3
              key={bIdx}
              style={{
                margin: "2px 0 4px",
                fontSize: "15px",
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.01em",
              }}
            >
              {parseInlineMarkdown(title)}
            </h3>
          );
        }

        // Heading 4: #### Section Title (Sentence Case)
        if (trimmed.startsWith("#### ")) {
          const title = trimmed.replace(/^####\s+/, "");
          return (
            <h4
              key={bIdx}
              style={{
                margin: "12px 0 4px",
                fontSize: "13.5px",
                fontWeight: 650,
                color: "#1e293b",
                textTransform: "none",
                letterSpacing: "normal",
              }}
            >
              {parseInlineMarkdown(title)}
            </h4>
          );
        }

        // Horizontal Rule
        if (trimmed === "---" || trimmed === "***") {
          return (
            <hr
              key={bIdx}
              style={{
                margin: "6px 0",
                border: "none",
                borderTop: "1px solid #e2e8f0",
              }}
            />
          );
        }

        // Check for bullet lists
        const lines = trimmed.split("\n");
        const isBulletList = lines.length > 0 && lines.every((l) => /^[\s]*[-•*]\s+/.test(l.trim()));
        if (isBulletList) {
          return (
            <ul
              key={bIdx}
              style={{
                margin: "2px 0 4px",
                paddingLeft: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                fontSize: "13.5px",
                lineHeight: "1.55",
                color: "#334155",
                listStyleType: "disc",
              }}
            >
              {lines.map((line, lIdx) => (
                <li key={lIdx}>{parseInlineMarkdown(line.trim().replace(/^[-•*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }

        // Check for numbered lists
        const isNumberedList = lines.length > 0 && lines.every((l) => /^[\s]*\d+\.\s+/.test(l.trim()));
        if (isNumberedList) {
          return (
            <ol
              key={bIdx}
              style={{
                margin: "2px 0 4px",
                paddingLeft: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                fontSize: "13.5px",
                lineHeight: "1.55",
                color: "#334155",
                listStyleType: "decimal",
              }}
            >
              {lines.map((line, lIdx) => (
                <li key={lIdx}>{parseInlineMarkdown(line.trim().replace(/^\d+\.\s+/, ""))}</li>
              ))}
            </ol>
          );
        }

        // Paragraph with potential inline single-newlines or mixed bullet lines
        return (
          <div
            key={bIdx}
            style={{
              fontSize: "13.5px",
              lineHeight: "1.55",
              color: "#334155",
            }}
          >
            {lines.map((line, lIdx) => {
              const lineTrimmed = line.trim();
              if (/^[-•*]\s+/.test(lineTrimmed)) {
                return (
                  <div key={lIdx} style={{ display: "flex", alignItems: "flex-start", gap: "8px", margin: "3px 0 3px 12px" }}>
                    <span style={{ color: "#64748b", fontWeight: 700 }}>•</span>
                    <span>{parseInlineMarkdown(lineTrimmed.replace(/^[-•*]\s+/, ""))}</span>
                  </div>
                );
              }
              if (/^\d+\.\s+/.test(lineTrimmed)) {
                return (
                  <div key={lIdx} style={{ display: "flex", alignItems: "flex-start", gap: "6px", margin: "3px 0 3px 12px" }}>
                    <span style={{ color: "#64748b", fontWeight: 600 }}>{lineTrimmed.match(/^\d+\./)?.[0]}</span>
                    <span>{parseInlineMarkdown(lineTrimmed.replace(/^\d+\.\s+/, ""))}</span>
                  </div>
                );
              }
              return (
                <p key={lIdx} style={{ margin: lIdx < lines.length - 1 ? "0 0 4px" : 0 }}>
                  {parseInlineMarkdown(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function MessageContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  if (typeof children === "string") {
    return (
      <div className={`${styles.messageContent} ${className}`}>
        {renderMarkdownContent(children)}
      </div>
    );
  }

  return <div className={`${styles.messageContent} ${className}`}>{children}</div>;
}

export function MessageActions({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`${styles.messageActionsRow} ${className}`}>{children}</div>;
}
