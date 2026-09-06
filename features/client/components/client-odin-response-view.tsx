"use client";

import React from "react";
import {
  Sparkles,
  RotateCcw,
  CheckCircle,
  FileText,
  CreditCard,
  Calendar,
  Users,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { OdinDuotoneIcon } from "@/components/layout/sidebar-icons";
import { ClientOdinMessage, ClientProject } from "../types";
import styles from "./client-overview.module.css";

interface ClientOdinResponseViewProps {
  messages: ClientOdinMessage[];
  currentProject: ClientProject;
  onClearConversation: () => void;
  onFollowUpPrompt: (promptText: string) => void;
}

export function ClientOdinResponseView({
  messages,
  currentProject,
  onClearConversation,
  onFollowUpPrompt,
}: ClientOdinResponseViewProps) {
  if (messages.length === 0) return null;

  return (
    <div className={styles.conversationArea} aria-label="Odin Conversation Flow">
      {messages.map((msg) => {
        if (msg.sender === "user") {
          return (
            <div key={msg.id} className={styles.userQueryBubble}>
              <span>{msg.text}</span>
            </div>
          );
        }

        return (
          <div key={msg.id} className={styles.odinResponseCard}>
            <div className={styles.odinResponseHeader}>
              <div className={styles.odinResponseBrand}>
                <OdinDuotoneIcon size={15} />
                <span>Odin Project Intelligence • {currentProject.name}</span>
              </div>
              <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>{msg.timestamp}</span>
            </div>

            <div className={styles.odinResponseText}>
              {msg.text}
            </div>

            {/* Provider Discovery Structured Card */}
            {msg.actionType === "provider_discovery" && msg.structuredData && (
              <div className={styles.structuredBox}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>
                  <Users size={14} style={{ color: "#6366f1" }} />
                  <span>Pre-Vetted Contractors for {String(msg.structuredData.projectName)} ({String(msg.structuredData.location)})</span>
                </div>

                {Array.isArray(msg.structuredData.recommendations) &&
                  (msg.structuredData.recommendations as Array<{
                    name: string;
                    rating: string;
                    experience: string;
                    estRange: string;
                    badge: string;
                    availability: string;
                  }>).map((rec, idx) => (
                    <div key={idx} className={styles.recommendationItem}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className={styles.recommendationTitle}>{rec.name}</span>
                          <span style={{ fontSize: "11px", fontWeight: 600, color: "#10b981", background: "#ecfdf5", padding: "2px 8px", border: "1px solid #a7f3d0", borderRadius: "999px" }}>
                            {rec.badge}
                          </span>
                        </div>
                        <div className={styles.recommendationSubtitle}>
                          {rec.rating} • {rec.experience} • Est: {rec.estRange}
                        </div>
                        <div style={{ fontSize: "11.5px", color: "#6366f1", marginTop: "4px" }}>
                          ✓ {rec.availability}
                        </div>
                      </div>
                      <button
                        type="button"
                        className={styles.actionPillBtn}
                        onClick={() => onFollowUpPrompt(`Request quotation from ${rec.name} for ${currentProject.name}`)}
                      >
                        Request Quote
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {/* Payment Summary Structured Card */}
            {msg.actionType === "payment_summary" && msg.structuredData && (
              <div className={styles.structuredBox}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>
                  <CreditCard size={14} style={{ color: "#10b981" }} />
                  <span>Authoritative Financial Ledger & Escrow Status</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", marginTop: "4px" }}>
                  <div style={{ background: "#ffffff", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>Total Approved Contract</span>
                    <strong style={{ display: "block", fontSize: "15px", color: "#0f172a", marginTop: "2px" }}>{String(msg.structuredData.totalBudget)}</strong>
                  </div>
                  <div style={{ background: "#ffffff", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>Settled to Date</span>
                    <strong style={{ display: "block", fontSize: "15px", color: "#16a34a", marginTop: "2px" }}>{String(msg.structuredData.paidAmount)}</strong>
                  </div>
                  <div style={{ background: "#ffffff", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>Remaining in Milestones</span>
                    <strong style={{ display: "block", fontSize: "15px", color: "#6366f1", marginTop: "2px" }}>{String(msg.structuredData.pendingAmount)}</strong>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "8px 12px", borderRadius: "8px" }}>
                  <ShieldCheck size={14} />
                  <span>{String(msg.structuredData.escrowProtected)}</span>
                </div>
              </div>
            )}

            {/* Drawing Preview Structured Card */}
            {msg.actionType === "drawing_preview" && msg.structuredData && (() => {
              const struct = msg.structuredData;
              const docName = String(struct.docName || "Drawing");
              return (
                <div className={styles.structuredBox}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FileText size={16} style={{ color: "#3b82f6" }} />
                      <div>
                        <span style={{ fontWeight: 650, fontSize: "13.5px", color: "#0f172a" }}>{docName}</span>
                        <span style={{ display: "block", fontSize: "11.5px", color: "#64748b" }}>{String(struct.version)} • {String(struct.updated)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.actionPillBtn}
                      onClick={() => onFollowUpPrompt(`Approve drawing ${docName}`)}
                    >
                      Open & Sign
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Site Visit Coordination Card */}
            {msg.actionType === "schedule_visit" && msg.structuredData && (
              <div className={styles.structuredBox}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Calendar size={16} style={{ color: "#6366f1" }} />
                    <div>
                      <span style={{ fontWeight: 650, fontSize: "13.5px", color: "#0f172a" }}>Site Visit at {String(msg.structuredData.location)}</span>
                      <span style={{ display: "block", fontSize: "11.5px", color: "#64748b" }}>Proposed: {String(msg.structuredData.suggestedSlot)} with {String(msg.structuredData.leadProvider)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={styles.actionPillBtn}
                    onClick={() => onFollowUpPrompt(`Confirm site visit for Thursday 10:30 AM`)}
                  >
                    Confirm Visit
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Clear conversation / Follow-up controls */}
      <div className={styles.conversationFooterBar}>
        <button
          type="button"
          onClick={onClearConversation}
          className={styles.clearConvoBtn}
        >
          <RotateCcw size={12} />
          <span>Clear conversation & start new query</span>
        </button>
      </div>
    </div>
  );
}
