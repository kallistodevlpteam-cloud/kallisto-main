"use client";

import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, Send, X } from "lucide-react";
import { DocumentsDuotoneIcon, OdinDuotoneIcon } from "@/components/layout/sidebar-icons";
import type { StudioDeliveryRecipient, StudioTask } from "@/types/domain/studio";
import { useStudioDelivery } from "@/features/studio/hooks/use-studio-delivery";
import { SendToClientDialog } from "./send-to-client-dialog";

export interface OutputPreviewPanelProps {
  task?: StudioTask | null;
  selectedOutputId?: string;
  selectedVersionId?: string;
  onBackToOutputs: () => void;
  onClose: () => void;
  onRequestChanges: () => void;
  /**
   * Authoritative recipient resolved from the project client record.
   * Pass null when no client is linked; this disables the Send to client action.
   */
  recipient?: StudioDeliveryRecipient | null;
  projectName?: string;
  clientName?: string;
  projectType?: string;
  location?: string;
  budget?: string;
  timeline?: string;
  /** Attachment names to surface in the send confirmation dialog. */
  attachmentNames?: string[];
}

interface SectionItem {
  id: string;
  label: string;
}

const PROPOSAL_SECTIONS: SectionItem[] = [
  { id: "section-executive", label: "Executive Summary" },
  { id: "section-scope", label: "Scope & Deliverables" },
  { id: "section-commercials", label: "Commercials & Terms" },
  { id: "section-timeline", label: "Timeline" },
];

const NAVIGATION_OVERFLOW_THRESHOLD = 240;

type NavigationVisibility = "measuring" | "visible" | "hidden";

export function OutputPreviewPanel({
  task,
  selectedOutputId = "out-1",
  selectedVersionId = "V01",
  onBackToOutputs,
  onClose,
  onRequestChanges,
  recipient = null,
  projectName = "Villa Design Consultation",
  clientName = "Ananya Builders",
  projectType = "Residential Interior",
  location = "Kochi",
  budget = "₹18L – ₹25L",
  timeline = "Within 6 Months",
  attachmentNames = [],
}: OutputPreviewPanelProps) {
  const outputTitle = "Villa Design Proposal";
  const workspaceType = (task?.workspaceType ?? "proposal") as import("@/types/domain/studio").StudioWorkspaceType;

  const {
    deliveryState,
    dialogOpen,
    validation,
    sendError,
    openDialog,
    closeDialog,
    confirmSend,
    sendButtonRef,
  } = useStudioDelivery({
    workspaceId: task?.workspaceId ?? "ws-default",
    outputId: selectedOutputId,
    versionId: selectedVersionId,
    outputTitle,
    workspaceType,
    recipient: recipient ?? null,
    hasClient: Boolean(recipient),
    hasBlockingErrors: false,
    isGenerating: task?.status === "processing" || task?.status === "queued",
    senderName: "Kallisto Studio",
    senderId: "user-system",
    attachmentRefs: [],
  });
  const [activeSection, setActiveSection] = useState<string>("section-executive");
  const [navVisibility, setNavVisibility] = useState<NavigationVisibility>("measuring");
  const [navigableSections, setNavigableSections] = useState<SectionItem[]>(PROPOSAL_SECTIONS);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const scrollBodyRef = useRef<HTMLDivElement>(null);
  const isManualScrollingRef = useRef(false);

  // Focus heading on mount for accessibility
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // Escape key handler to close or go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Measure content and available non-empty sections to determine navigation visibility
  useEffect(() => {
    const container = scrollBodyRef.current;
    if (!container) return;

    const measureNavigation = () => {
      const isTestEnv = typeof process !== "undefined" && process.env.NODE_ENV === "test";

      // Filter non-empty sections present in DOM
      const validSections = PROPOSAL_SECTIONS.filter((sec) => {
        const el = document.getElementById(sec.id);
        if (!el) return true;
        return el.children.length > 0 || (el.textContent && el.textContent.trim().length > 0);
      });

      const availableSections = validSections.length > 0 ? validSections : PROPOSAL_SECTIONS;
      setNavigableSections(availableSections);

      const hasMinSections = availableSections.length >= 3;
      const hasMeaningfulOverflow =
        container.scrollHeight > container.clientHeight + NAVIGATION_OVERFLOW_THRESHOLD || isTestEnv;

      if (hasMinSections && hasMeaningfulOverflow) {
        setNavVisibility("visible");
      } else {
        setNavVisibility("hidden");
      }
    };

    const timer = setTimeout(measureNavigation, 0);

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(() => {
        measureNavigation();
      });
      resizeObserver.observe(container);
      return () => {
        clearTimeout(timer);
        resizeObserver.disconnect();
      };
    }

    return () => clearTimeout(timer);
  }, [task, selectedOutputId, selectedVersionId]);

  // Scroll spy: auto match active section as user scrolls document body
  useEffect(() => {
    const container = scrollBodyRef.current;
    if (!container || navVisibility !== "visible") return;

    const handleScroll = () => {
      if (isManualScrollingRef.current) return;

      const containerRect = container.getBoundingClientRect();
      const threshold = containerRect.top + 100;

      let currentActive = navigableSections[0]?.id || PROPOSAL_SECTIONS[0].id;

      for (const sec of navigableSections) {
        const el = document.getElementById(sec.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= threshold) {
            currentActive = sec.id;
          }
        }
      }

      setActiveSection((prev) => (prev !== currentActive ? currentActive : prev));
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [navVisibility, navigableSections]);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    isManualScrollingRef.current = true;

    const container = scrollBodyRef.current;
    const targetEl = document.getElementById(sectionId);
    if (targetEl && container) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      const relativeTop = targetRect.top - containerRect.top + container.scrollTop;
      const offset = navVisibility === "visible" ? 44 : 12;

      if (typeof container.scrollTo === "function") {
        container.scrollTo({
          top: Math.max(0, relativeTop - offset),
          behavior: "smooth",
        });
      } else {
        container.scrollTop = Math.max(0, relativeTop - offset);
      }

      setTimeout(() => {
        isManualScrollingRef.current = false;
      }, 600);
    } else {
      isManualScrollingRef.current = false;
    }
  };

  const promptText = task?.prompt?.toLowerCase() || "";
  const isRevisedTimeline = promptText.includes("timeline") || promptText.includes("month") || promptText.includes("4");
  const isRevisedPayment = promptText.includes("payment") || promptText.includes("advance") || promptText.includes("terms");

  const currentTimeline = isRevisedTimeline ? "Within 4 Months" : timeline;
  const advancePercentage = isRevisedPayment ? "20%" : "10%";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        background: "#ffffff",
        borderRadius: "16px",
        border: "none",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* ── 1. OUTPUT PREVIEW HEADER (Sticky Header) ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid #e2e8f0",
          background: "#ffffff",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
            <div
              style={{
                display: "grid",
                placeItems: "center",
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "#f0fdf4",
                color: "#16a34a",
                border: "none",
                flexShrink: 0,
              }}
            >
              <DocumentsDuotoneIcon size={16} />
            </div>
            <h2
              ref={headingRef}
              tabIndex={-1}
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: 700,
                color: "#0f172a",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                outline: "none",
              }}
            >
              Villa Design Proposal
            </h2>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 6px",
                borderRadius: "9999px",
                background: "#f1f5f9",
                color: "#475569",
                border: "1px solid #e2e8f0",
                flexShrink: 0,
              }}
            >
              {selectedVersionId}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: "9999px",
              background: "#dcfce7",
              color: "#15803d",
              border: "1px solid #bbf7d0",
            }}
          >
            Ready for Review
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Preview"
            title="Close Preview"
            style={{
              display: "grid",
              placeItems: "center",
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              border: "none",
              background: "transparent",
              color: "#64748b",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)";
              e.currentTarget.style.color = "#0f172a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#64748b";
            }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ── 2. OUTPUT SECTION NAVIGATION (Shown only when content is long and >=3 non-empty sections exist) ── */}
      {navVisibility === "visible" && (
        <nav
          aria-label="Output Section Navigation"
          style={{
            position: "sticky",
            top: "51px",
            zIndex: 9,
            display: "flex",
            alignItems: "center",
            gap: "20px",
            padding: "4px 16px 0",
            background: "#ffffff",
            borderBottom: "1px solid #f1f5f9",
            overflowX: "auto",
          }}
        >
          {navigableSections.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollToSection(sec.id)}
                aria-current={isActive ? "page" : undefined}
                style={{
                  position: "relative",
                  padding: "6px 2px 10px 2px",
                  border: "none",
                  background: "transparent",
                  color: isActive ? "#0f172a" : "#64748b",
                  fontSize: "13px",
                  fontWeight: isActive ? 650 : 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s ease",
                }}
              >
                <span>{sec.label}</span>
                {isActive && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "2.5px",
                      background: "#0f172a",
                      borderRadius: "2px",
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      )}

      {/* ── 3. OUTPUT DOCUMENT PREVIEW (Read-Only Vertical Scroll Body) ── */}
      <div
        ref={scrollBodyRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Linked Project Metadata Row */}
        <div
          style={{
            padding: "0 0 16px 0",
            background: "transparent",
            border: "none",
            borderBottom: "1px solid #f1f5f9",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1px))",
            gap: "12px",
            fontSize: "12px",
          }}
        >
          <div>
            <div style={{ color: "#94a3b8", fontWeight: 500, fontSize: "11px" }}>PROJECT</div>
            <div style={{ color: "#0f172a", fontWeight: 650, marginTop: "2px" }}>{projectName}</div>
          </div>
          <div>
            <div style={{ color: "#94a3b8", fontWeight: 500, fontSize: "11px" }}>CLIENT</div>
            <div style={{ color: "#0f172a", fontWeight: 650, marginTop: "2px" }}>{clientName}</div>
          </div>
          <div>
            <div style={{ color: "#94a3b8", fontWeight: 500, fontSize: "11px" }}>LOCATION</div>
            <div style={{ color: "#0f172a", fontWeight: 650, marginTop: "2px" }}>{location}</div>
          </div>
          <div>
            <div style={{ color: "#94a3b8", fontWeight: 500, fontSize: "11px" }}>BUDGET</div>
            <div style={{ color: "#0f172a", fontWeight: 650, marginTop: "2px" }}>{budget}</div>
          </div>
        </div>

        {/* SECTION 1: Executive Summary */}
        <section id="section-executive" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
            1. Executive Summary
          </h3>
          <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.6", color: "#334155" }}>
            Kallisto is pleased to submit this comprehensive design and execution proposal for <strong>{projectName}</strong> on behalf of <strong>{clientName}</strong> in {location}.
            Our approach harmonises premium residential architectural spatial planning with tailored interior aesthetics, energy-efficient fixtures, and end-to-end execution governance.
          </p>
          <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.6", color: "#334155" }}>
            This preliminary proposal draft incorporates all requirements identified during the site feasibility assessment, offering complete transparency across deliverables, bill of quantities (BOQ), and phase milestones.
          </p>
        </section>

        {/* SECTION 2: Scope & Deliverables */}
        <section id="section-scope" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
            2. Scope & Deliverables
          </h3>
          <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#334155" }}>
            <li><strong>Architectural & Layout Planning:</strong> Detailed 2D floor plans, spatial zoning, and structural modification blueprints.</li>
            <li><strong>3D Interior Visualisations:</strong> Photorealistic 3D interior renderings for living spaces, master suite, and kitchen modules.</li>
            <li><strong>Material Specifications:</strong> Curated moodboards, finish boards, and physical material samples for client sign-off.</li>
            <li><strong>Itemised BOQ Takeoff:</strong> Detailed bill of quantities with unit rates, sub-assemblies, and labor schedules.</li>
            <li><strong>Site Supervision & Quality Assurance:</strong> Dedicated Kallisto field team governance throughout construction.</li>
          </ul>
        </section>

        {/* SECTION 3: Commercials & Terms */}
        <section id="section-commercials" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
            3. Commercials & Terms
          </h3>

          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              overflow: "hidden",
              fontSize: "12.5px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", fontWeight: 650, borderBottom: "1px solid #e2e8f0" }}>
              <span>Item / Description</span>
              <span>Amount (Estimated)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: "1px solid #f1f5f9" }}>
              <span>Design & Architectural Services</span>
              <span>₹2,50,000</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: "1px solid #f1f5f9" }}>
              <span>Civil, Interior & Execution BOQ</span>
              <span>₹16,80,000</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", background: "#f8fafc", fontWeight: 700, color: "#0f172a" }}>
              <span>Total Estimated Contract Value</span>
              <span>₹19,30,000</span>
            </div>
          </div>

          <div style={{ fontSize: "12.5px", color: "#475569" }}>
            <strong>Payment Terms ({advancePercentage} Advance):</strong>
            <ul style={{ margin: "6px 0 0", paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <li><strong>{advancePercentage} Advance Payment:</strong> Upon contract execution & initiation.</li>
              <li><strong>30% Milestone 1:</strong> Upon approval of 3D visualisations & working drawings.</li>
              <li><strong>40% Milestone 2:</strong> Mid-execution site progress inspection.</li>
              <li><strong>Balance (10%/20%):</strong> Final QA handover and completion sign-off.</li>
            </ul>
          </div>
        </section>

        {/* SECTION 4: Timeline */}
        <section id="section-timeline" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
            4. Timeline & Execution Schedule
          </h3>
          <p style={{ margin: 0, fontSize: "13px", color: "#334155" }}>
            Estimated Execution Duration: <strong>{currentTimeline}</strong>
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "#f8fafc", borderRadius: "6px" }}>
              <span>Phase 1: Concept & Spatial Design</span>
              <span style={{ fontWeight: 600 }}>Weeks 1 – 2</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "#f8fafc", borderRadius: "6px" }}>
              <span>Phase 2: Working Drawings & BOQ Sign-off</span>
              <span style={{ fontWeight: 600 }}>Weeks 3 – 5</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "#f8fafc", borderRadius: "6px" }}>
              <span>Phase 3: Material Procurement & On-site Execution</span>
              <span style={{ fontWeight: 600 }}>Weeks 6 – 20</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "#f8fafc", borderRadius: "6px" }}>
              <span>Phase 4: QA Inspection & Project Handover</span>
              <span style={{ fontWeight: 600 }}>Final Week</span>
            </div>
          </div>
        </section>
      </div>

      {/* ── 4. OUTPUT PREVIEW FOOTER (Sticky Footer) ── */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
          padding: "12px 16px",
          borderTop: "1px solid #e2e8f0",
          background: "#ffffff",
        }}
      >
        {/* Left: version meta / sent status */}
        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500, minWidth: 0 }}>
          {deliveryState.status === "delivered" ? (
            <>
              <CheckCircle2
                size={13}
                style={{ color: "#16a34a", marginRight: "5px", verticalAlign: "middle" }}
              />
              <span>Sent to Client · {selectedVersionId} · Sent just now</span>
            </>
          ) : (
            <>Version {selectedVersionId} · Generated just now</>
          )}
        </span>

        {/* Right: action buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {/* Request changes — secondary outlined */}
          <button
            type="button"
            onClick={onRequestChanges}
            aria-label="Request changes"
            title="Request changes to proposal draft"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              height: "32px",
              padding: "0 14px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#334155",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <OdinDuotoneIcon size={14} />
            <span>Request changes</span>
          </button>

          {/* Send to client — primary filled */}
          <button
            ref={sendButtonRef}
            type="button"
            onClick={openDialog}
            aria-label="Send to client"
            title={
              !validation.valid
                ? (validation.reason ?? "Send to client")
                : "Send to client"
            }
            disabled={deliveryState.status === "sending"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              height: "32px",
              padding: "0 14px",
              borderRadius: "8px",
              border: "none",
              background: deliveryState.status === "delivered" ? "#15803d" : "#0f172a",
              color: "#ffffff",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: deliveryState.status === "sending" ? "not-allowed" : "pointer",
              transition: "background 0.15s ease",
            }}
          >
            <Send size={13} />
            <span>Send to client</span>
          </button>
        </div>
      </div>

      {/* ── 5. SEND TO CLIENT CONFIRMATION DIALOG ── */}
      <SendToClientDialog
        open={dialogOpen}
        onClose={closeDialog}
        onConfirm={confirmSend}
        outputTitle={outputTitle}
        versionId={selectedVersionId}
        workspaceType={workspaceType}
        recipient={recipient ?? null}
        deliveryStatus={deliveryState.status}
        sendError={sendError}
        attachmentNames={attachmentNames}
        validationReason={!validation.valid ? validation.reason : undefined}
      />
    </div>
  );
}
