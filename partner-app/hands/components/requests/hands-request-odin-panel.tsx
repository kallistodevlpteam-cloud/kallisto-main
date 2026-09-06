"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  RotateCcw,
  SendHorizontal,
  Mic,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Users,
} from "lucide-react";
import {
  StudioDuotoneIcon,
  TeamDuotoneIcon,
  ProjectsDuotoneIcon,
  AnalyticsDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { LabourRequest } from "../../types/request-domain";
import { calculateRequestMatch } from "../../mock/requests-mock-data";
import { INITIAL_WORKERS } from "../workers/../../mock/workers-mock-data";
import styles from "./hands-requests.module.css";

export interface HandsRequestOdinPanelProps {
  selectedRequest: LabourRequest | null;
  onDeselectRequest: () => void;
  onReviewRequest: (req: LabourRequest) => void;
  onAcceptRequest: (req: LabourRequest) => void;
  onFilterTrade: (trade: string) => void;
  onSearchQuery: (query: string) => void;
  onClose: () => void;
  newRequestsCount: number;
}

interface ChatMessage {
  id: string;
  sender: "odin" | "user";
  text: string;
  timestamp: string;
}

function renderInlineMarkdown(str: string) {
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = str.split(regex);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={i} style={{ color: "#0f172a", fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return (
        <em key={i} style={{ color: "#475569" }}>
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={i}
          style={{
            fontFamily: "monospace",
            backgroundColor: "#f1f5f9",
            padding: "1px 5px",
            borderRadius: "4px",
            fontSize: "11.5px",
            color: "#0f172a",
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function FormattedMessageText({ text }: { text: string }) {
  const paragraphs = text.split("\n\n");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {paragraphs.map((p, pIdx) => {
        const lines = p.split("\n");
        return (
          <p key={pIdx} style={{ fontSize: "13px", lineHeight: 1.5, color: "#0f172a", margin: 0 }}>
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {lIdx > 0 && <br />}
                {renderInlineMarkdown(line)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export function HandsRequestOdinPanel({
  selectedRequest,
  onDeselectRequest,
  onReviewRequest,
  onAcceptRequest,
  onFilterTrade,
  onSearchQuery,
  onClose,
  newRequestsCount,
}: HandsRequestOdinPanelProps) {
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const streamEndRef = useRef<HTMLDivElement>(null);

  const match = selectedRequest ? calculateRequestMatch(selectedRequest) : null;

  useEffect(() => {
    if (streamEndRef.current && typeof streamEndRef.current.scrollIntoView === "function") {
      streamEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedRequest]);

  const handleResetConversation = () => {
    setMessages([]);
    setInputQuery("");
    onDeselectRequest();
    onFilterTrade("All");
    onSearchQuery("");
  };

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;
    const promptText = textToSend.trim();
    setInputQuery("");

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: promptText,
      timestamp: "Just now",
    };
    setMessages((prev) => [...prev, userMsg]);

    const lower = promptText.toLowerCase();

    setTimeout(() => {
      let replyText = "";
      if (selectedRequest) {
        if (lower.includes("fulfil") || lower.includes("fulfill") || lower.includes("can i")) {
          if (match?.matchState === "full") {
            replyText = `Yes! You can **100% fulfil** the requirement for **${selectedRequest.projectName}**. You have all ${match.totalRequired} matching workers available on bench.`;
          } else {
            replyText = `You can currently fulfil **${match?.matchPercentage}%** of the requirement for **${selectedRequest.projectName}** (${match?.totalAvailable} / ${match?.totalRequired} workers). You are short of ${match?.shortages.map((s) => `${s.shortBy} ${s.trade}s`).join(", ")}.`;
          }
        } else if (lower.includes("who") || lower.includes("assign") || lower.includes("candidates")) {
          const candidates = INITIAL_WORKERS.filter(
            (w) => w.availability === "Available" && selectedRequest.requirements.some((r) => r.trade === w.trade)
          ).slice(0, 3);
          replyText = `Top matching available workers for **${selectedRequest.projectName}**:\n\n` +
            candidates.map((c) => `• **${c.name}** (${c.trade}, ${c.level}, ${c.experienceYears} Yrs Exp · ₹${c.dailyRate}/day)`).join("\n");
        } else if (lower.includes("missing") || lower.includes("shortage") || lower.includes("gap")) {
          if (match && match.shortages.length > 0) {
            replyText = `Workforce Deficit for **${selectedRequest.projectName}**:\n` +
              match.shortages.map((s) => `• Need **${s.shortBy} more ${s.trade}s**`).join("\n") +
              `\nConsider redeploying unassigned workers or sourcing from nearby verified contractor benches in Trivandrum.`;
          } else {
            replyText = `No missing trade positions! All requested trades are fully covered by your active bench.`;
          }
        } else if (lower.includes("start") || lower.includes("date") || lower.includes("schedule")) {
          replyText = `Deployment Schedule for **${selectedRequest.projectName}**:\n• Start Date: **${selectedRequest.startDate}**\n• Duration: **${selectedRequest.estimatedDuration}**\n• Working Hours: **${selectedRequest.workingHours}**\n\nAll available crew members are cleared for this timeline.`;
        } else {
          replyText = `Evaluated "${promptText}" for **${selectedRequest.projectName}**. The start date is **${selectedRequest.startDate}** (${selectedRequest.estimatedDuration}).`;
        }
      } else {
        if (lower.includes("urgent") || lower.includes("review")) {
          replyText = "The most urgent demand is **Greenwood Residency** (8 Masons, 4 Helpers needed by Sep 05). You currently match 10 of 12 positions.";
        } else if (lower.includes("mason")) {
          onFilterTrade("Mason");
          replyText = "Filtered incoming requests requiring Mason crews.";
        } else if (lower.includes("full") || lower.includes("100%")) {
          replyText = "Two requests have 100% bench match: **Skyline Apartments** (6 Carpenters) and **Azure Waterfront Towers** (3 Electricians, 2 Plumbers).";
        } else {
          onSearchQuery(promptText);
          replyText = `Searching active contractor demand for "${promptText}".`;
        }
      }

      const odinMsg: ChatMessage = {
        id: `odn-${Date.now()}`,
        sender: "odin",
        text: replyText,
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, odinMsg]);
    }, 280);
  };

  return (
    <div className={styles.aiPanelContainer}>
      <aside className={styles.minimalCard} aria-label="Odin Workforce Intelligence">
        {/* 1. Header Card */}
        <div className={styles.minimalHeader}>
          <div className={styles.minimalBotAvatar}>
            <StudioDuotoneIcon size={19} />
            <span className={styles.minimalOnlineDot} />
          </div>

          <div className={styles.minimalHeaderTitles}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className={styles.minimalHeaderTitle}>Odin</span>
              <span className={styles.minimalBadge}>Demand AI</span>
            </div>
            <span className={styles.minimalHeaderSub}>
              {selectedRequest
                ? `Analyzing ${selectedRequest.projectName}`
                : "Workforce Demand Intelligence"}
            </span>
          </div>

          <button
            type="button"
            className={styles.minimalResetBtn}
            onClick={handleResetConversation}
            title="Reset conversation and filters"
            aria-label="Reset conversation"
          >
            <RotateCcw size={14} />
          </button>

          <button
            type="button"
            className={styles.minimalResetBtn}
            onClick={onClose}
            title="Close Odin Panel"
            aria-label="Close Odin Panel"
          >
            <X size={15} />
          </button>
        </div>

        {/* 2. Conversational Chat Stream */}
        <div className={styles.minimalChatStream}>
          {/* Initial Bot Greeting Row */}
          {messages.length === 0 && (
            <div className={styles.odinChatRow}>
              <div className={styles.odinAvatarIcon}>
                <StudioDuotoneIcon size={17} />
              </div>
              <div className={styles.odinChatContent}>
                <p style={{ fontSize: "13px", lineHeight: 1.5, color: "#0f172a", margin: 0 }}>
                  {selectedRequest ? (
                    <>
                      I have analysed <strong>{selectedRequest.projectName}</strong>.
                    </>
                  ) : (
                    <>
                      Hello Vikram. <strong>{newRequestsCount} new workforce requests</strong> require review. <strong>2 requests can be 100% fulfilled</strong> immediately from your bench.
                    </>
                  )}
                </p>

                {/* Selected Request Match Preview Card in Odin */}
                {selectedRequest && match && (
                  <div className={styles.matchBreakdownCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                          {selectedRequest.projectName}
                        </div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                          {selectedRequest.location} · Start {selectedRequest.startDate}
                        </div>
                      </div>
                      <button
                        type="button"
                        style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "11px", cursor: "pointer", textDecoration: "underline" }}
                        onClick={onDeselectRequest}
                      >
                        Clear
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", borderTop: "1px solid #1e293b", paddingTop: "8px", fontSize: "11.5px" }}>
                      <div>
                        <span style={{ color: "#94a3b8" }}>WORKFORCE REQUIRED</span>
                        <div style={{ fontWeight: 700, color: "#ffffff" }}>{match.totalRequired} Workers</div>
                      </div>
                      <div>
                        <span style={{ color: "#94a3b8" }}>BENCH AVAILABLE</span>
                        <div style={{ fontWeight: 700, color: match.totalAvailable >= match.totalRequired ? "#34d399" : "#fbbf24" }}>
                          {match.totalAvailable} Workers ({match.matchPercentage}%)
                        </div>
                      </div>
                    </div>

                    {match.shortages.length > 0 ? (
                      <div className={styles.shortageWarning} style={{ marginTop: "2px" }}>
                        <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                        <span>Short of: {match.shortages.map((s) => `${s.shortBy} ${s.trade}s`).join(", ")}</span>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#34d399", fontSize: "11.5px" }}>
                        <CheckCircle2 size={13} />
                        <span>Full Bench Match — Ready for immediate acceptance</span>
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                      <button
                        type="button"
                        className={styles.reviewActionBtn}
                        style={{ padding: "6px 12px", fontSize: "11.5px", background: "#ffffff", color: "#0f172a" }}
                        onClick={() => onReviewRequest(selectedRequest)}
                      >
                        <Users size={12} />
                        <span>View Matching Workers</span>
                      </button>

                      {selectedRequest.status !== "accepted" && (
                        <button
                          type="button"
                          className={styles.reviewActionBtn}
                          style={{ padding: "6px 12px", fontSize: "11.5px", background: "#059669", color: "#ffffff" }}
                          onClick={() => onAcceptRequest(selectedRequest)}
                        >
                          <UserCheck size={12} />
                          <span>Accept</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Action Cards (when no request is selected) */}
                {!selectedRequest && (
                  <div className={styles.quickActionGrid}>
                    <button
                      type="button"
                      className={styles.quickActionCard}
                      onClick={() => handleSendMessage("Review most urgent demand")}
                    >
                      <div className={styles.quickActionIconWrap}>
                        <TeamDuotoneIcon size={18} />
                      </div>
                      <div className={styles.quickActionTexts}>
                        <span className={styles.quickActionTitle}>Review Most Urgent Demand</span>
                        <span className={styles.quickActionSub}>
                          Greenwood Residency needs 12 tradesmen by Sep 05
                        </span>
                      </div>
                      <ArrowRight size={14} style={{ color: "#94a3b8" }} />
                    </button>

                    <button
                      type="button"
                      className={styles.quickActionCard}
                      onClick={() => handleSendMessage("Show 100% match requests")}
                    >
                      <div className={styles.quickActionIconWrap} style={{ background: "#f1f5f9", color: "#0f172a" }}>
                        <ProjectsDuotoneIcon size={18} />
                      </div>
                      <div className={styles.quickActionTexts}>
                        <span className={styles.quickActionTitle}>Show 100% Match Requests</span>
                        <span className={styles.quickActionSub}>
                          2 requests can be immediately accepted & assigned
                        </span>
                      </div>
                      <ArrowRight size={14} style={{ color: "#94a3b8" }} />
                    </button>

                    <button
                      type="button"
                      className={styles.quickActionCard}
                      onClick={() => handleSendMessage("Workforce gap analysis")}
                    >
                      <div className={styles.quickActionIconWrap} style={{ background: "#f1f5f9", color: "#0f172a" }}>
                        <AnalyticsDuotoneIcon size={18} />
                      </div>
                      <div className={styles.quickActionTexts}>
                        <span className={styles.quickActionTitle}>Workforce Gap Analysis</span>
                        <span className={styles.quickActionSub}>
                          Shortage of 2 Masons & 6 Steel Fixers across pipeline
                        </span>
                      </div>
                      <ArrowRight size={14} style={{ color: "#94a3b8" }} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dynamic Message Timeline */}
          {messages.map((msg) => {
            if (msg.sender === "user") {
              return (
                <div key={msg.id} className={styles.userChatRow}>
                  <div className={styles.userMessageBubble}>{msg.text}</div>
                </div>
              );
            }
            return (
              <div key={msg.id} className={styles.odinChatRow}>
                <div className={styles.odinAvatarIcon}>
                  <StudioDuotoneIcon size={17} />
                </div>
                <div className={styles.odinChatContent}>
                  <FormattedMessageText text={msg.text} />
                </div>
              </div>
            );
          })}

          <div ref={streamEndRef} />
        </div>

        {/* 3. Prompt Suggestions Bar */}
        <div className={styles.suggestedChipsBar}>
          {(selectedRequest
            ? [
                "Can I fulfil this request?",
                "Who should I assign?",
                "What workers am I missing?",
                "Can this crew start on time?",
              ]
            : [
                "Review most urgent demand",
                "Show full match requests",
                "Mason crew shortages",
                "Available tomorrow",
              ]
          ).map((query) => (
            <button
              key={query}
              type="button"
              className={styles.suggestedChip}
              onClick={() => handleSendMessage(query)}
            >
              {query}
            </button>
          ))}
        </div>

        {/* 4. Chat Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputQuery);
          }}
          className={styles.minimalComposer}
        >
          <textarea
            className={styles.minimalInput}
            rows={2}
            placeholder={
              selectedRequest
                ? `Ask Odin about ${selectedRequest.projectName}...`
                : "Ask Odin about incoming workforce demand..."
            }
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(inputQuery);
              }
            }}
            aria-label="Ask Odin about this request"
          />

          <div className={styles.composerBottomBar}>
            <div className={styles.composerLeftGroup}>
              <button
                type="button"
                className={styles.composerMicBtn}
                title="Voice dictation"
                onClick={() => handleSendMessage("Can I fulfil this request?")}
                aria-label="Voice dictation"
              >
                <Mic size={15} />
              </button>
            </div>

            <div className={styles.composerRightGroup}>
              <button
                type="submit"
                className={styles.minimalSendBtn}
                disabled={!inputQuery.trim()}
                style={
                  inputQuery.trim()
                    ? { backgroundColor: "#0f172a", borderColor: "#0f172a", color: "#ffffff" }
                    : undefined
                }
                title="Send query"
                aria-label="Send query"
              >
                <SendHorizontal size={14} style={{ marginLeft: "1px" }} />
              </button>
            </div>
          </div>
        </form>
      </aside>
    </div>
  );
}
