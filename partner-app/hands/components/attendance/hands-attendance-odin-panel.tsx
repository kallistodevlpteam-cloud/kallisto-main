"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  RotateCcw,
  SendHorizontal,
  Mic,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  ShieldCheck,
  FileSpreadsheet,
  UserCheck,
} from "lucide-react";
import {
  StudioDuotoneIcon,
  TeamDuotoneIcon,
  ProjectsDuotoneIcon,
  AnalyticsDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { AttendanceRecord, AttendanceStatus } from "../../types/attendance-domain";
import styles from "./hands-attendance.module.css";

export interface HandsAttendanceOdinPanelProps {
  selectedRecord: AttendanceRecord | null;
  onDeselectRecord: () => void;
  onFilterStatus: (status: AttendanceStatus | "All") => void;
  onFilterTrade: (trade: string) => void;
  onSearchQuery: (query: string) => void;
  onOpenExportTimesheet: () => void;
  onClose: () => void;
  activeDeploymentsCount: number;
  shiftCompletionPercentage: number;
  lateCount: number;
  overtimeCount: number;
}

interface ChatMessage {
  id: string;
  sender: "odin" | "user";
  text: string;
  timestamp: string;
  quickOptions?: { label: string; value: string }[];
  inspectedRecord?: AttendanceRecord;
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
          <p key={pIdx} className={styles.odinMessageText}>
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

export function HandsAttendanceOdinPanel({
  selectedRecord,
  onDeselectRecord,
  onFilterStatus,
  onFilterTrade,
  onSearchQuery,
  onOpenExportTimesheet,
  onClose,
  activeDeploymentsCount,
  shiftCompletionPercentage,
  lateCount,
  overtimeCount,
}: HandsAttendanceOdinPanelProps) {
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const streamEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (streamEndRef.current && typeof streamEndRef.current.scrollIntoView === "function") {
      streamEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedRecord]);

  const handleResetConversation = () => {
    setMessages([]);
    setInputQuery("");
    onDeselectRecord();
    onFilterStatus("All");
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
      if (lower.includes("late") || lower.includes("tardy")) {
        onFilterStatus("Late");
        replyText = `Filtered your directory to **${lateCount} late check-ins** today.\n\n• **Suresh P** (Carpenter) at *Malabar Heritage Estate*: Check-in **08:14 AM** (+14m late).\n• **Karan Sharma** (Electrician) at *Skyline Apex Penthouse*: Check-in **08:22 AM** (+22m late).`;
      } else if (lower.includes("overtime") || lower.includes("extra hours") || lower.includes("+1h")) {
        onFilterStatus("Overtime");
        replyText = `Identified **${overtimeCount} crew members** with overtime shifts logged (+4.0 total OT hours):\n\n• **Rajesh Kumar** (+1.5h Overtime) — Greenwood Residency\n• **Vipin Das** (+1.5h Overtime) — Azure Waterfront Towers\n• **Arun S** (+1.0h Overtime) — Sobha Silver Birch Enclave`;
      } else if (lower.includes("export") || lower.includes("timesheet") || lower.includes("download") || lower.includes("report")) {
        onOpenExportTimesheet();
        replyText = "Opened the **Timesheet Export** modal. You can export verified attendance records in **CSV** or **PDF** format with supervisor signatures.";
      } else if (lower.includes("geotag") || lower.includes("gps") || lower.includes("biometric") || lower.includes("audit")) {
        replyText = `**Biometric & Geotag Verification Audit**:\n\n• **100%** of check-ins passed face recognition (avg confidence **99.1%**).\n• **12 out of 12** active logs verified inside approved GPS geofence boundaries.\n• 0 location spoofing alerts reported.`;
      } else if (lower.includes("present") || lower.includes("on time")) {
        onFilterStatus("Present");
        replyText = `Filtered view to **8 Present & On-time** deployment records across 8 active site locations.`;
      } else {
        onSearchQuery(promptText);
        replyText = `Evaluated search query "${promptText}". Filtered attendance logs accordingly.`;
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
      <aside className={styles.minimalCard} aria-label="Odin Attendance Intelligence">
        {/* Header */}
        <div className={styles.minimalHeader}>
          <div className={styles.minimalBotAvatar}>
            <StudioDuotoneIcon size={19} />
            <span className={styles.minimalOnlineDot} />
          </div>

          <div className={styles.minimalHeaderTitles}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className={styles.minimalHeaderTitle}>Odin</span>
              <span className={styles.minimalBadge}>Attendance AI</span>
            </div>
            <span className={styles.minimalHeaderSub}>
              {selectedRecord
                ? `Inspecting ${selectedRecord.workerName}`
                : "Shift Telemetry & Compliance"}
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

        {/* Conversational Stream */}
        <div className={styles.minimalChatStream}>
          {messages.length === 0 && (
            <div className={styles.odinChatRow}>
              <div className={styles.odinAvatarIcon}>
                <StudioDuotoneIcon size={17} />
              </div>
              <div className={styles.odinChatContent}>
                <FormattedMessageText
                  text={
                    selectedRecord
                      ? `Inspecting biometric attendance log for **${selectedRecord.workerName}** (${selectedRecord.trade}) at **${selectedRecord.siteName}**.`
                      : `Hello Vikram. **128 crew members** are deployed today across **8 sites** with **${shiftCompletionPercentage}% shift completion**.\n\n• **${lateCount} late check-ins** flagged for supervisor sign-off.\n• **${overtimeCount} overtime records** logged today.`
                  }
                />

                {selectedRecord && (
                  <div className={styles.selectedRecordCard}>
                    <div className={styles.selectedRecordHeader}>
                      <div className={styles.selectedRecordHeaderLeft}>
                        <div className={styles.selectedRecordAvatar}>
                          {selectedRecord.workerName
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div>
                          <div className={styles.selectedRecordMetaTitle}>
                            {selectedRecord.workerName}
                          </div>
                          <div className={styles.selectedRecordMetaSub}>
                            {selectedRecord.trade} · {selectedRecord.siteName}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={styles.clearSelectionBtn}
                        onClick={onDeselectRecord}
                      >
                        Clear
                      </button>
                    </div>

                    <div className={styles.selectedRecordDetails}>
                      <div className={styles.selectedRecordDetailRow}>
                        <Clock size={13} color="#64748b" />
                        <span>Check-In: <strong>{selectedRecord.checkInTime}</strong> (Out: {selectedRecord.checkOutTime || "Active"})</span>
                      </div>
                      <div className={styles.selectedRecordDetailRow}>
                        <MapPin size={13} color="#64748b" />
                        <span>GPS Coordinates: <strong>{selectedRecord.gpsCoordinates}</strong></span>
                      </div>
                      <div className={styles.selectedRecordDetailRow}>
                        <ShieldCheck size={13} color="#059669" />
                        <span>{selectedRecord.verificationMethod} (<strong>{selectedRecord.faceMatchConfidence}% match</strong>)</span>
                      </div>
                    </div>
                  </div>
                )}

                {!selectedRecord && (
                  <div className={styles.quickActionGrid}>
                    <button
                      type="button"
                      className={styles.quickActionCard}
                      onClick={() => handleSendMessage("Audit Geotag & Biometrics")}
                    >
                      <div className={styles.quickActionIconWrap}>
                        <ShieldCheck size={18} />
                      </div>
                      <div className={styles.quickActionTexts}>
                        <span className={styles.quickActionTitle}>Audit Geotag & Biometrics</span>
                        <span className={styles.quickActionSub}>
                          Verify 12 logs against site GPS geofence boundaries
                        </span>
                      </div>
                      <ArrowRight size={14} style={{ color: "#94a3b8" }} />
                    </button>

                    <button
                      type="button"
                      className={styles.quickActionCard}
                      onClick={() => handleSendMessage("Review Late Check-ins")}
                    >
                      <div
                        className={styles.quickActionIconWrap}
                        style={{ background: "#fef3c7", color: "#d97706" }}
                      >
                        <Clock size={18} />
                      </div>
                      <div className={styles.quickActionTexts}>
                        <span className={styles.quickActionTitle}>Review Late Check-ins</span>
                        <span className={styles.quickActionSub}>
                          Inspect {lateCount} delayed check-ins for supervisor sign-off
                        </span>
                      </div>
                      <ArrowRight size={14} style={{ color: "#94a3b8" }} />
                    </button>

                    <button
                      type="button"
                      className={styles.quickActionCard}
                      onClick={() => handleSendMessage("Review Overtime Logs")}
                    >
                      <div
                        className={styles.quickActionIconWrap}
                        style={{ background: "#f1f5f9", color: "#0f172a" }}
                      >
                        <AnalyticsDuotoneIcon size={18} />
                      </div>
                      <div className={styles.quickActionTexts}>
                        <span className={styles.quickActionTitle}>Review Overtime Logs</span>
                        <span className={styles.quickActionSub}>
                          Audit +4.0 overtime hours logged across 3 sites
                        </span>
                      </div>
                      <ArrowRight size={14} style={{ color: "#94a3b8" }} />
                    </button>

                    <button
                      type="button"
                      className={styles.quickActionCard}
                      onClick={() => handleSendMessage("Export Today's Timesheet")}
                    >
                      <div
                        className={styles.quickActionIconWrap}
                        style={{ background: "#ecfdf5", color: "#047857" }}
                      >
                        <FileSpreadsheet size={18} />
                      </div>
                      <div className={styles.quickActionTexts}>
                        <span className={styles.quickActionTitle}>Export Timesheet</span>
                        <span className={styles.quickActionSub}>
                          Generate CSV or PDF timesheet report for payroll
                        </span>
                      </div>
                      <ArrowRight size={14} style={{ color: "#94a3b8" }} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dynamic Conversation Timeline */}
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

        {/* Input Composer */}
        <div className={styles.minimalComposerBox}>
          <div className={styles.minimalInputWrapper}>
            <input
              type="text"
              className={styles.minimalInput}
              placeholder="Ask Odin about attendance, OT, or GPS logs..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(inputQuery);
                }
              }}
            />
            <div className={styles.minimalComposerActions}>
              <button
                type="button"
                className={styles.minimalIconBtn}
                title="Voice input"
                onClick={() => setInputQuery("Show late check-ins")}
              >
                <Mic size={14} />
              </button>
              <button
                type="button"
                className={styles.minimalSendBtn}
                disabled={!inputQuery.trim()}
                onClick={() => handleSendMessage(inputQuery)}
                title="Send message"
              >
                <SendHorizontal size={14} />
              </button>
            </div>
          </div>
          <div className={styles.minimalComposerFooter}>
            <span>Odin AI · Powered by Kallisto Geofence Telemetry</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
