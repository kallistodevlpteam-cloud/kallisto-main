"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, CornerDownLeft, Bot, User, Check, Copy } from "lucide-react";
import { usePartnerAuth } from "../auth/context/partner-auth-context";
import { getPartnerConfig } from "../shared/config/partner-config";
import { getOdinQueriesForPartner, getMockOdinResponse } from "./partner-odin-prompts";

interface PartnerOdinPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: "user" | "odin";
  text: string;
  timestamp: string;
}

export function PartnerOdinPanel({ isOpen, onClose }: PartnerOdinPanelProps) {
  const { partnerType, user } = usePartnerAuth();
  const config = getPartnerConfig(partnerType);
  const sampleQueries = getOdinQueriesForPartner(partnerType);

  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-welcome",
      sender: "odin",
      text: `Hello ${user?.name ? user.name.split(" ")[0] : "Partner"}! I am **Odin**, your **${config.displayName} Intelligence Assistant**.\n\nAsk me about workforce availability, pending material requests, dispatch logistics, attendance, or operational metrics.`,
      timestamp: "Just now",
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && typeof messagesEndRef.current?.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendPrompt = (promptText: string) => {
    const text = promptText.trim();
    if (!text || isThinking) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsThinking(true);

    setTimeout(() => {
      const reply = getMockOdinResponse(text, partnerType);
      const odinMsg: Message = {
        id: `odn-${Date.now()}`,
        sender: "odin",
        text: reply,
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, odinMsg]);
      setIsThinking(false);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.2)",
          backdropFilter: "blur(2px)",
          zIndex: 70,
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          maxWidth: "440px",
          backgroundColor: "#ffffff",
          boxShadow: "-8px 0 30px rgba(0, 0, 0, 0.12)",
          zIndex: 80,
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid rgba(226, 232, 240, 0.9)",
          animation: "slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#f8fafc",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "10px",
                backgroundColor: config.lightBgColor,
                border: `1px solid ${config.borderColor}`,
                color: config.accentColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={16} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>Odin Intelligence</span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: "9999px",
                    backgroundColor: config.lightBgColor,
                    color: config.accentColor,
                    border: `1px solid ${config.borderColor}`,
                    textTransform: "uppercase",
                  }}
                >
                  {config.shortName}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>{config.odinRoleName}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Odin drawer"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "6px",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Thread Scroll Area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            backgroundColor: "#ffffff",
          }}
        >
          {messages.map((msg) => {
            const isOdin = msg.sender === "odin";
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  gap: "10px",
                  alignSelf: isOdin ? "flex-start" : "flex-end",
                  maxWidth: "90%",
                }}
              >
                {isOdin && (
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      backgroundColor: config.lightBgColor,
                      border: `1px solid ${config.borderColor}`,
                      color: config.accentColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  >
                    <Bot size={15} />
                  </div>
                )}
                <div
                  style={{
                    backgroundColor: isOdin ? "#f8fafc" : "#0f172a",
                    color: isOdin ? "#0f172a" : "#ffffff",
                    border: isOdin ? "1px solid #e2e8f0" : "none",
                    borderRadius: isOdin ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
                    padding: "12px 14px",
                    fontSize: "13px",
                    lineHeight: 1.5,
                    whiteSpace: "pre-line",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}

          {isThinking && (
            <div style={{ display: "flex", gap: "10px", alignSelf: "flex-start", maxWidth: "90%" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  backgroundColor: config.lightBgColor,
                  color: config.accentColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Bot size={15} />
              </div>
              <div
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "4px 14px 14px 14px",
                  padding: "10px 14px",
                  fontSize: "12px",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Sparkles size={13} className="animate-spin" />
                <span>Odin is analyzing {config.shortName} operations data...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Context Prompt Chips */}
        <div
          style={{
            padding: "10px 16px",
            borderTop: "1px solid #f1f5f9",
            backgroundColor: "#fcfdfe",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Suggested {config.shortName} Queries
          </span>
          <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
            {sampleQueries.slice(0, 3).map((sq) => (
              <button
                key={sq.id}
                type="button"
                onClick={() => handleSendPrompt(sq.prompt)}
                style={{
                  padding: "5px 10px",
                  borderRadius: "9999px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  color: "#334155",
                  fontSize: "11px",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  flexShrink: 0,
                }}
              >
                {sq.prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Composer */}
        <div style={{ padding: "12px 16px 16px 16px", borderTop: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(inputQuery);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              padding: "4px 6px 4px 12px",
            }}
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask Odin about ${config.displayName}...`}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: "13px",
                color: "#0f172a",
              }}
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isThinking}
              aria-label="Send query"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                backgroundColor: inputQuery.trim() && !isThinking ? "#0f172a" : "#e2e8f0",
                color: "#ffffff",
                border: "none",
                cursor: inputQuery.trim() && !isThinking ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
              }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
