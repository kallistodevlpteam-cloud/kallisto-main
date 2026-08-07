"use client";

import React, { useState } from "react";
import { CheckCircle2, Download, FileText, Save, Send, Sparkles } from "lucide-react";
import type { StudioTask } from "@/types/domain/studio";

export interface ProposalOutputPanelProps {
  task?: StudioTask | null;
  projectName?: string;
  clientName?: string;
  projectType?: string;
  location?: string;
  budget?: string;
  timeline?: string;
  status?: "Generating" | "Drafting" | "Ready for Review" | "Revision Applied" | "Sent to Client";
}

export function ProposalOutputPanel({
  task,
  projectName = "Villa Design Consultation",
  clientName = "Ananya Builders",
  projectType = "Residential Interior",
  location = "Kochi",
  budget = "₹18L – ₹25L",
  timeline = "Within 6 Months",
  status: initialStatus,
}: ProposalOutputPanelProps) {
  const [activeTab, setActiveTab] = useState<"document" | "commercials" | "timeline">("document");
  const [outputStatus, setOutputStatus] = useState<string>(initialStatus || (task?.status === "processing" ? "Generating" : "Ready for Review"));
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const promptText = task?.prompt?.toLowerCase() || "";
  const isRevisedTimeline = promptText.includes("timeline") || promptText.includes("month") || promptText.includes("4");
  const isRevisedPayment = promptText.includes("payment") || promptText.includes("advance") || promptText.includes("terms");

  const currentTimeline = isRevisedTimeline ? "Within 4 Months" : timeline;
  const advancePercentage = isRevisedPayment ? "20%" : "10%";

  const handleSaveDraft = () => {
    setOutputStatus("Draft Saved");
    setFeedbackNotice("Proposal draft saved successfully.");
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  const handleExportPdf = () => {
    setFeedbackNotice("Proposal PDF exported successfully.");
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  const handleSendToClient = () => {
    setOutputStatus("Sent to Client");
    setFeedbackNotice("Proposal sent to client for review.");
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "100%",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        overflow: "hidden",
        marginTop: "12px",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid #f1f5f9",
          background: "#fafafa",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              display: "grid",
              placeItems: "center",
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              background: "#f0fdf4",
              color: "#16a34a",
              border: "1px solid #bbf7d0",
            }}
          >
            <FileText size={15} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <h3 style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                Proposal Draft
              </h3>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  color: outputStatus === "Sent to Client" ? "#2563eb" : outputStatus === "Draft Saved" ? "#059669" : "#16a34a",
                  background: outputStatus === "Sent to Client" ? "#eff6ff" : outputStatus === "Draft Saved" ? "#ecfdf5" : "#f0fdf4",
                  padding: "1px 6px",
                  borderRadius: "4px",
                  border: `1px solid ${outputStatus === "Sent to Client" ? "#bfdbfe" : outputStatus === "Draft Saved" ? "#a7f3d0" : "#bbf7d0"}`,
                }}
              >
                {outputStatus}
              </span>
            </div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>
              Version V01 • Linked to {projectName}
            </span>
          </div>
        </div>
      </div>

      {/* Feedback Toast Notification */}
      {feedbackNotice && (
        <div
          style={{
            padding: "8px 16px",
            background: "#f0fdf4",
            borderBottom: "1px solid #bbf7d0",
            color: "#15803d",
            fontSize: "11px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <CheckCircle2 size={13} />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Project Meta Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px",
          padding: "10px 16px",
          background: "#f8fafc",
          borderBottom: "1px solid #f1f5f9",
          fontSize: "11px",
        }}
      >
        <div>
          <span style={{ color: "#94a3b8", display: "block", fontSize: "10px", fontWeight: 600, textTransform: "uppercase" }}>Project</span>
          <span style={{ color: "#1e293b", fontWeight: 600 }}>{projectName}</span>
        </div>
        <div>
          <span style={{ color: "#94a3b8", display: "block", fontSize: "10px", fontWeight: 600, textTransform: "uppercase" }}>Client</span>
          <span style={{ color: "#1e293b", fontWeight: 600 }}>{clientName}</span>
        </div>
        <div>
          <span style={{ color: "#94a3b8", display: "block", fontSize: "10px", fontWeight: 600, textTransform: "uppercase" }}>Budget</span>
          <span style={{ color: "#16a34a", fontWeight: 700 }}>{budget}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #f1f5f9",
          background: "#ffffff",
          padding: "0 16px",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("document")}
          style={{
            padding: "8px 12px",
            fontSize: "12px",
            fontWeight: 600,
            color: activeTab === "document" ? "#0f172a" : "#64748b",
            borderBottom: activeTab === "document" ? "2px solid #0f172a" : "2px solid transparent",
            background: "none",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
          }}
        >
          Executive Summary
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("commercials")}
          style={{
            padding: "8px 12px",
            fontSize: "12px",
            fontWeight: 600,
            color: activeTab === "commercials" ? "#0f172a" : "#64748b",
            borderBottom: activeTab === "commercials" ? "2px solid #0f172a" : "2px solid transparent",
            background: "none",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
          }}
        >
          Commercials & Terms
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("timeline")}
          style={{
            padding: "8px 12px",
            fontSize: "12px",
            fontWeight: 600,
            color: activeTab === "timeline" ? "#0f172a" : "#64748b",
            borderBottom: activeTab === "timeline" ? "2px solid #0f172a" : "2px solid transparent",
            background: "none",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
          }}
        >
          Timeline
        </button>
      </div>

      {/* Main Tab Content */}
      <div style={{ flex: 1, padding: "16px", overflowY: "auto", fontSize: "12px", color: "#334155", lineHeight: 1.5 }}>
        {activeTab === "document" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <h4 style={{ margin: "0 0 4px", fontSize: "12px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                1. Executive Overview
              </h4>
              <p style={{ margin: 0, color: "#475569" }}>
                Proposal prepared by Kallisto for <strong>{clientName}</strong> for the <strong>{projectName}</strong> project located in {location}.
                This scope outlines high-end luxury villa design consultation, spatial layout planning, sustainable material selection, and comprehensive site execution oversight.
              </p>
            </div>

            <div>
              <h4 style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                2. Scope of Work & Deliverables
              </h4>
              <ul style={{ margin: 0, paddingLeft: "18px", color: "#475569", display: "flex", flexDirection: "column", gap: "4px" }}>
                <li>Spatial layout optimization & 2D floorplan drawings (Living area, master suite, terrace)</li>
                <li>Full 3D interior visualisations & material palette moodboards</li>
                <li>Detailed Bill of Quantities (BOQ) with itemised rate analysis</li>
                <li>Specification reports for sanitary, lighting, flooring and custom woodwork</li>
                <li>On-site execution supervision & quality compliance assurance</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "commercials" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <h4 style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                Estimated Commercial Terms
              </h4>
              <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span>Estimated Project Value:</span>
                  <strong style={{ color: "#16a34a" }}>{budget}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Target Execution Window:</span>
                  <strong>{currentTimeline}</strong>
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                Milestone Payment Structure
              </h4>
              <ol style={{ margin: 0, paddingLeft: "18px", color: "#475569", display: "flex", flexDirection: "column", gap: "4px" }}>
                <li><strong>{advancePercentage} Advance:</strong> Upon proposal acceptance & initial sign-off</li>
                <li><strong>30% Design Phase:</strong> On 3D renders & working drawing sign-off</li>
                <li><strong>40% Execution Phase:</strong> On-site fit-out mobilization & progress</li>
                <li><strong>10% Completion:</strong> Final handover & snag list resolution</li>
              </ol>
            </div>
          </div>
        )}

        {activeTab === "timeline" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <h4 style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.02em" }}>
              Project Phase Timeline ({currentTimeline})
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ padding: "8px 10px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <strong>Phase 1 (Weeks 1–2):</strong> Design Concept & 3D Visualisations
              </div>
              <div style={{ padding: "8px 10px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <strong>Phase 2 (Weeks 3–4):</strong> BOQ, Material Specs & Working Drawings
              </div>
              <div style={{ padding: "8px 10px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <strong>Phase 3 (Months 2–3):</strong> On-site Execution & Fit-out
              </div>
              <div style={{ padding: "8px 10px", background: "#f0fdf4", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
                <strong>Phase 4 (Month 4):</strong> Quality Inspection & Final Handover
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          padding: "10px 16px",
          borderTop: "1px solid #f1f5f9",
          background: "#ffffff",
        }}
      >
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            onClick={handleSaveDraft}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              fontSize: "11px",
              fontWeight: 600,
              color: "#475569",
              cursor: "pointer",
            }}
          >
            <Save size={12} />
            <span>Save Draft</span>
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              fontSize: "11px",
              fontWeight: 600,
              color: "#475569",
              cursor: "pointer",
            }}
          >
            <Download size={12} />
            <span>Export PDF</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleSendToClient}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "6px 12px",
            borderRadius: "6px",
            border: "1px solid #16a34a",
            background: "#16a34a",
            fontSize: "11px",
            fontWeight: 600,
            color: "#ffffff",
            cursor: "pointer",
          }}
        >
          <Send size={12} />
          <span>Send to Client</span>
        </button>
      </div>
    </div>
  );
}
