"use client";

import React, { useState, useEffect } from "react";
import { Download, X, CheckCircle2, RotateCcw, Pencil, FileText, ChevronDown, XCircle } from "lucide-react";
import { DocumentsDuotoneIcon } from "@/components/layout/sidebar-icons";
import { EnquiryRecord } from "@/features/enquiries/types/enquiry.types";
import styles from "./client-proposal-modal.module.css";

export const REVISION_AREAS = [
  "Scope of Work",
  "Project Timeline",
  "Fee & Budget",
  "Payment Terms",
  "Design Deliverables",
  "Materials Specification",
  "Team & Resources",
] as const;

export const REVISION_REASONS = [
  "Fee & budget exceeds expectation",
  "Project timeline needs adjustment",
  "Scope additions, removals or modifications",
  "Design deliverables & layout revision",
  "Materials & specification changes",
  "Payment terms / milestone structure adjustment",
  "Other adjustments",
] as const;

export interface ClientProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  enquiry: EnquiryRecord;
  version?: string;
  isRevision?: boolean;
  initialMode?: "proposal" | "revision";
  onAccept?: () => void;
  onRequestRevision?: (notes?: string) => void;
  onEditAndResend?: () => void;
  onReject?: (reason?: string) => void;
}

export function ClientProposalModal({
  isOpen,
  onClose,
  enquiry,
  version = "V01",
  isRevision = false,
  initialMode = "proposal",
  onAccept,
  onRequestRevision,
  onEditAndResend,
  onReject,
}: ClientProposalModalProps) {
  const [activeTab, setActiveTab] = useState<"executive" | "scope" | "commercials" | "timeline">("executive");
  const [showRevisionBox, setShowRevisionBox] = useState(initialMode === "revision");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [primaryReason, setPrimaryReason] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setShowRevisionBox(initialMode === "revision");
    }
  }, [isOpen, initialMode]);

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleCancelRevision = () => {
    setShowRevisionBox(false);
    setPrimaryReason("");
    setSelectedAreas([]);
    setRevisionNotes("");
  };

  const handleCancelReject = () => {
    setShowRejectBox(false);
    setRejectReason("");
  };

  const handleSubmitRevision = () => {
    onRequestRevision?.(revisionNotes);
    setShowRevisionBox(false);
    setPrimaryReason("");
    setSelectedAreas([]);
    setRevisionNotes("");
  };

  const handleSubmitReject = () => {
    onReject?.(rejectReason);
    setShowRejectBox(false);
    setRejectReason("");
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (showRevisionBox) {
          handleCancelRevision();
        } else if (showRejectBox) {
          handleCancelReject();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, showRevisionBox, showRejectBox]);

  if (!isOpen) return null;

  const projectName = enquiry.title || "Project";
  const clientName = enquiry.clientName || "Client";
  const location = enquiry.location || "Kerala";
  const budget = enquiry.budget || "₹95L";
  const timeline = enquiry.timeline || "10 months";

  const isCedarValley = enquiry.id?.includes("9") || projectName.toLowerCase().includes("cedar valley");

  const handleDownload = () => {
    // Generate clean print / download view
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocker prevented download. Please allow popups for this site.");
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${projectName} - Proposal ${version}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; }
            h1 { font-size: 24px; margin-bottom: 4px; }
            .meta { color: #64748b; font-size: 13px; margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; background: #f8fafc; padding: 12px; border-radius: 6px; }
            .label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; }
            .val { font-size: 14px; font-weight: 600; }
            h2 { font-size: 16px; margin-top: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f8fafc; }
            .total { font-weight: bold; background: #f1f5f9; }
          </style>
        </head>
        <body>
          <h1>${projectName} • Official Proposal (${version})</h1>
          <div class="meta">Submitted by Kallisto Studio Architects • Date: ${new Date().toLocaleDateString("en-IN")}</div>
          <div class="grid">
            <div><div class="label">Project</div><div class="val">${projectName}</div></div>
            <div><div class="label">Client</div><div class="val">${clientName}</div></div>
            <div><div class="label">Location</div><div class="val">${location}</div></div>
            <div><div class="label">Budget Target</div><div class="val">${budget}</div></div>
          </div>
          <h2>1. Executive Summary</h2>
          <p>Kallisto is pleased to submit this comprehensive architectural and execution proposal for <strong>${projectName}</strong> on behalf of <strong>${clientName}</strong> in ${location}. Our approach harmonises architectural spatial planning with tailored interior aesthetics, resilient structural engineering, and end-to-end execution governance.</p>
          <h2>2. Scope & Deliverables</h2>
          <ul>
            <li>Architectural & Layout Planning (2D floorplans, spatial zoning, cross-ventilation design)</li>
            <li>3D Visualisations & Daylight Diffusion Studies</li>
            <li>Material Specifications (Earth wall compositions, natural stone, certified terracotta roofing)</li>
            <li>Itemised BOQ Takeoff with unit rates and scheduled phase allocations</li>
            <li>On-site supervision and quality assurance by certified Kallisto engineers</li>
          </ul>
          <h2>3. Commercials & Terms</h2>
          <table>
            <thead><tr><th>Item / Description</th><th>Amount (Estimated)</th></tr></thead>
            <tbody>
              <tr><td>Design, Architecture & Engineering Documentation</td><td>₹12,00,000</td></tr>
              <tr><td>Civil, Superstructure & Rammed Earth Construction</td><td>₹52,00,000</td></tr>
              <tr><td>Interior Fit-out, Joinery & Studio Specialized Fixtures</td><td>₹23,00,000</td></tr>
              <tr><td>MEP, Solar Conduit & Dedicated Ventilation Equipment</td><td>₹8,00,000</td></tr>
              <tr class="total"><td>Total Estimated Contract Value</td><td>${budget}</td></tr>
            </tbody>
          </table>
          <p><strong>Payment Terms:</strong> 10% Advance on Kickoff • 30% Milestone 1 • 40% Milestone 2 • 20% Final Handover.</p>
          <h2>4. Timeline</h2>
          <p>Total Estimated Timeline: <strong>${timeline}</strong> across 4 controlled execution phases.</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        className={`${styles.modalContainer} ${showRevisionBox || showRejectBox ? styles.modalContainerRevision : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${projectName} Proposal`}
      >
        {/* Top Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.docIconBadge}>
              <DocumentsDuotoneIcon size={18} />
            </div>
            <div>
              <div className={styles.titleRow}>
                <h2 className={styles.modalTitle}>{projectName} Proposal</h2>
                <span className={styles.versionBadge}>{version}</span>
                <span className={`${styles.statusBadge} ${isRevision ? styles.statusBadgeRevision : ""}`}>
                  {isRevision ? "Revision Applied" : "Ready for Review"}
                </span>
              </div>
              <div className={styles.headerSubtitle}>
                Prepared by Kallisto Studio Architects • Linked to Enquiry #{enquiry.id}
              </div>
            </div>
          </div>

          <div className={styles.headerRight}>
            <button
              type="button"
              className={styles.downloadBtn}
              onClick={handleDownload}
              title="Download Proposal Document (PDF)"
              aria-label="Download Proposal"
            >
              <Download size={14} />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close Proposal Modal"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className={styles.navTabs} aria-label="Proposal Sections">
          <button
            type="button"
            className={`${styles.navTabBtn} ${activeTab === "executive" ? styles.navTabBtnActive : ""}`}
            onClick={() => setActiveTab("executive")}
          >
            Executive Summary
            {activeTab === "executive" && <span className={styles.activeIndicator} />}
          </button>
          <button
            type="button"
            className={`${styles.navTabBtn} ${activeTab === "scope" ? styles.navTabBtnActive : ""}`}
            onClick={() => setActiveTab("scope")}
          >
            Scope & Deliverables
            {activeTab === "scope" && <span className={styles.activeIndicator} />}
          </button>
          <button
            type="button"
            className={`${styles.navTabBtn} ${activeTab === "commercials" ? styles.navTabBtnActive : ""}`}
            onClick={() => setActiveTab("commercials")}
          >
            Commercials & Terms
            {activeTab === "commercials" && <span className={styles.activeIndicator} />}
          </button>
          <button
            type="button"
            className={`${styles.navTabBtn} ${activeTab === "timeline" ? styles.navTabBtnActive : ""}`}
            onClick={() => setActiveTab("timeline")}
          >
            Timeline
            {activeTab === "timeline" && <span className={styles.activeIndicator} />}
          </button>
        </nav>

        {/* Scrollable Document Body */}
        <div className={styles.scrollBody}>
          {/* Metadata Row */}
          <div className={styles.metaGrid}>
            <div className={styles.metaCol}>
              <span className={styles.metaLabel}>PROJECT</span>
              <span className={styles.metaValue}>{projectName}</span>
            </div>
            <div className={styles.metaCol}>
              <span className={styles.metaLabel}>CLIENT</span>
              <span className={styles.metaValue}>{clientName}</span>
            </div>
            <div className={styles.metaCol}>
              <span className={styles.metaLabel}>LOCATION</span>
              <span className={styles.metaValue}>{location}</span>
            </div>
            <div className={styles.metaCol}>
              <span className={styles.metaLabel}>BUDGET</span>
              <span className={styles.metaValue}>{budget}</span>
            </div>
          </div>

          {/* Service Provider Response Highlight Block for Revision */}
          {isRevision && (
            <div style={{ margin: "16px 0 0 0", padding: "14px 18px", background: "#fbfcfe", border: "1px solid #edf2f7", borderLeft: "3px solid #0f4c81", borderRadius: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                  Kallisto Studio Architects <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>• Ar. Vivek Menon (Response received Aug 12, 2026)</span>
                </span>
                <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", background: "#eff6ff", color: "#1d4ed8", borderRadius: "4px" }}>
                  Proposal {version} Updated
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "#334155", fontStyle: "italic", margin: "0 0 8px 0", lineHeight: 1.5 }}>
                &ldquo;We have reviewed your request for exposed rammed earth walls and additional north-facing artist studio skylights. We recalibrated the civil BOQ to ₹95L, incorporated local Wayanad laterite soil tests, and established a 10-month execution schedule. Please review the updated proposal.&rdquo;
              </p>
              <ul style={{ display: "flex", flexWrap: "wrap", gap: "16px", margin: 0, padding: 0, listStyle: "none", fontSize: "12px", color: "#166534", fontWeight: 600 }}>
                <li>✓ Rammed earth wall specifications confirmed</li>
                <li>✓ North-light studio clerestories added to structural package</li>
                <li>✓ BOQ breakdown aligned with {budget} target</li>
              </ul>
            </div>
          )}

          {/* Tab 1: Executive Summary */}
          {activeTab === "executive" && (
            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}>1. Executive Summary</h3>
              <p className={styles.bodyText}>
                Kallisto Studio Architects is pleased to submit this comprehensive design and execution proposal for{" "}
                <strong>{projectName}</strong> on behalf of <strong>{clientName}</strong> in {location}.
                {isCedarValley ? (
                  <>
                    {" "}Our proposal incorporates all site contour findings and client specifications for an artistic hillside retreat, featuring stabilized rammed earth construction, passive thermal insulation, and dedicated north-light artist studio clerestories.
                  </>
                ) : (
                  <>
                    {" "}Our approach harmonises premium architectural spatial planning with tailored interior aesthetics, energy-efficient fixtures, and end-to-end execution governance.
                  </>
                )}
              </p>
              <p className={styles.bodyText}>
                {isRevision ? (
                  <>
                    This updated revision (<strong>{version}</strong>) addresses your specific revision feedback regarding scope adjustments, cost transparency, and timeline alignment. All quantities and milestone gates have been calibrated to ensure complete transparency throughout construction.
                  </>
                ) : (
                  <>
                    This preliminary proposal draft incorporates all requirements identified during the site feasibility assessment, offering complete transparency across deliverables, bill of quantities (BOQ), and phase milestones.
                  </>
                )}
              </p>
            </div>
          )}

          {/* Tab 2: Scope & Deliverables */}
          {activeTab === "scope" && (
            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}>2. Scope & Deliverables</h3>
              <ul className={styles.bulletList}>
                <li>
                  <strong>Architectural & Layout Planning:</strong> Detailed 2D floor plans, spatial zoning, cross-ventilation modeling, and split-level structural modification blueprints.
                </li>
                <li>
                  <strong>3D Interior & Daylight Simulations:</strong> Photorealistic 3D interior renderings for studio spaces, master suite, and north-light window daylight analysis.
                </li>
                <li>
                  <strong>Material Specifications:</strong> Curated moodboards, earth masonry specifications, reclaimed terracotta roof tile standards, and physical finish samples for client sign-off.
                </li>
                <li>
                  <strong>Itemised BOQ Takeoff:</strong> Detailed bill of quantities with certified unit rates, sub-assemblies, and labor schedules.
                </li>
                <li>
                  <strong>Site Supervision & Quality Assurance:</strong> Dedicated Kallisto field team governance, soil stability inspections, and structural audit certificates.
                </li>
              </ul>
            </div>
          )}

          {/* Tab 3: Commercials & Terms */}
          {activeTab === "commercials" && (
            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}>3. Commercials & Terms</h3>

              <div className={styles.commercialsTable}>
                <div className={styles.tableHeaderRow}>
                  <span>Item / Description</span>
                  <span>Amount (Estimated)</span>
                </div>
                <div className={styles.tableRow}>
                  <span>Design, Architectural & Engineering Documentation</span>
                  <span>₹12,00,000</span>
                </div>
                <div className={styles.tableRow}>
                  <span>Civil, Superstructure & Rammed Earth Construction</span>
                  <span>₹52,00,000</span>
                </div>
                <div className={styles.tableRow}>
                  <span>Interior Fit-out, Joinery & Studio Specialized Fixtures</span>
                  <span>₹23,00,000</span>
                </div>
                <div className={styles.tableRow}>
                  <span>MEP, Solar Conduit & Dedicated Ventilation Equipment</span>
                  <span>₹8,00,000</span>
                </div>
                <div className={styles.tableTotalRow}>
                  <span>Total Estimated Contract Value</span>
                  <span>{budget}</span>
                </div>
              </div>

              <div className={styles.paymentTermsBox}>
                <strong style={{ color: "#0f172a" }}>Payment Terms (10% Advance):</strong>
                <ul style={{ margin: "6px 0 0", paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <li><strong>10% Advance Payment:</strong> Upon contract execution & initiation.</li>
                  <li><strong>30% Milestone 1:</strong> Upon approval of 3D visualisations & working drawings.</li>
                  <li><strong>40% Milestone 2:</strong> Mid-execution site progress inspection.</li>
                  <li><strong>20% Balance:</strong> Final QA handover and completion sign-off.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab 4: Timeline */}
          {activeTab === "timeline" && (
            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}>4. Timeline & Execution Schedule</h3>
              <p className={styles.bodyText}>
                Estimated Execution Duration: <strong>{timeline}</strong>
              </p>
              <div className={styles.timelineGrid}>
                <div className={styles.timelinePhaseRow}>
                  <span className={styles.phaseName}>Phase 1: Concept & Spatial Design Blueprints</span>
                  <span className={styles.phaseDuration}>Weeks 1 – 4</span>
                </div>
                <div className={styles.timelinePhaseRow}>
                  <span className={styles.phaseName}>Phase 2: Site Terracing & Earth Masonry Construction</span>
                  <span className={styles.phaseDuration}>Weeks 5 – 22</span>
                </div>
                <div className={styles.timelinePhaseRow}>
                  <span className={styles.phaseName}>Phase 3: Roof Framing, Fenestration & MEP Rough-in</span>
                  <span className={styles.phaseDuration}>Weeks 23 – 34</span>
                </div>
                <div className={styles.timelinePhaseRow}>
                  <span className={styles.phaseName}>Phase 4: Studio Interior Finishes, Kiln Venting & Handover</span>
                  <span className={styles.phaseDuration}>Final Weeks</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Client Actions */}
        <div className={styles.modalFooter}>
          <div className={styles.footerLeft}>
            Version {version} • Generated by Kallisto Studio Architects
          </div>
          <div className={styles.footerActions}>
            {onRequestRevision && (
              <button
                type="button"
                className={styles.requestRevisionBtn}
                onClick={() => setShowRevisionBox(!showRevisionBox)}
              >
                <RotateCcw size={14} />
                <span>Request Revision</span>
              </button>
            )}
            {onEditAndResend && (
              <button
                type="button"
                className={styles.requestRevisionBtn}
                onClick={onEditAndResend}
              >
                <Pencil size={14} />
                <span>Edit & Resend</span>
              </button>
            )}
            {onReject && (
              <button
                type="button"
                className={styles.rejectProposalBtn}
                onClick={() => setShowRejectBox(true)}
              >
                <XCircle size={14} />
                <span>Reject Proposal</span>
              </button>
            )}
            {onAccept && (
              <button
                type="button"
                className={styles.acceptProposalBtn}
                onClick={onAccept}
              >
                <CheckCircle2 size={15} />
                <span>Accept Proposal</span>
              </button>
            )}
          </div>
        </div>

        {/* Form-like Swap Overlay for Request Revision */}
        {showRevisionBox && (
          <div className={styles.revisionOverlay} role="dialog" aria-label="Request Proposal Revision">
            {/* Overlay Header */}
            <div className={styles.revisionOverlayHeader}>
              <div className={styles.revisionOverlayTitleGroup}>
                <div className={styles.revisionOverlayIconBadge}>
                  <RotateCcw size={18} />
                </div>
                <div>
                  <h3 className={styles.revisionOverlayTitle}>Request Proposal Revision</h3>
                  <p className={styles.revisionOverlaySubtitle}>
                    Specify required adjustments for {projectName} ({version})
                  </p>
                </div>
              </div>

              <button
                type="button"
                className={styles.revisionOverlayCloseBtn}
                onClick={handleCancelRevision}
                title="Back to proposal review"
                aria-label="Back to proposal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Overlay Scrollable Body */}
            <div className={styles.revisionOverlayBody}>
              {/* 1. Primary reason for revision */}
              <div className={styles.revisionFieldGroup}>
                <label htmlFor="primary-revision-reason" className={styles.revisionFieldLabel}>
                  <span>Primary reason for revision</span>
                  <span className={styles.requiredStar}>*</span>
                </label>
                <div className={styles.revisionSelectWrapper}>
                  <select
                    id="primary-revision-reason"
                    className={styles.revisionSelect}
                    value={primaryReason}
                    onChange={(e) => setPrimaryReason(e.target.value)}
                  >
                    <option value="" disabled>
                      Select a reason...
                    </option>
                    {REVISION_REASONS.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className={styles.revisionSelectIcon} />
                </div>
              </div>

              {/* 2. Specific areas to revise */}
              <div className={styles.revisionFieldGroup}>
                <label className={styles.revisionFieldLabel}>
                  <span>Specific areas to revise</span>
                </label>
                <div className={styles.revisionChipsContainer}>
                  {REVISION_AREAS.map((area) => {
                    const isSelected = selectedAreas.includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        className={`${styles.revisionChip} ${isSelected ? styles.revisionChipSelected : ""}`}
                        onClick={() => toggleArea(area)}
                      >
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Detailed revision notes */}
              <div className={styles.revisionFieldGroup}>
                <label htmlFor="detailed-revision-notes" className={styles.revisionFieldLabel}>
                  <span>Detailed revision notes</span>
                  <span className={styles.requiredStar}>*</span>
                </label>
                <textarea
                  id="detailed-revision-notes"
                  className={styles.revisionTextarea}
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="Be specific about what needs to change and why. For example: 'The ₹14L fee exceeds our budget of ₹12L. We'd like the podcast studio scope included but need the overall fee reduced. Can the team composition be revisited to achieve this?'"
                  autoFocus
                />
                <div className={styles.revisionCharCountRow}>
                  {revisionNotes.length} characters · Be clear and specific to get the best revised proposal
                </div>
              </div>
            </div>

            {/* Overlay Sticky Footer */}
            <div className={styles.revisionOverlayFooter}>
              <div className={styles.revisionActionsRow}>
                <button
                  type="button"
                  className={styles.cancelRevisionBtn}
                  onClick={handleCancelRevision}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.submitRevisionBtn}
                  onClick={handleSubmitRevision}
                >
                  Submit Revision Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Proposal Confirmation Overlay */}
        {showRejectBox && (
          <div className={styles.revisionOverlay} role="dialog" aria-label="Reject Proposal">
            {/* Header */}
            <div className={styles.revisionOverlayHeader}>
              <div className={styles.revisionOverlayTitleGroup}>
                <div className={`${styles.revisionOverlayIconBadge} ${styles.rejectOverlayIconBadge}`}>
                  <XCircle size={18} />
                </div>
                <div>
                  <h3 className={styles.revisionOverlayTitle}>Reject Proposal</h3>
                  <p className={styles.revisionOverlaySubtitle}>
                    {projectName} ({version}) — this action cannot be undone
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={styles.revisionOverlayCloseBtn}
                onClick={handleCancelReject}
                title="Back to proposal review"
                aria-label="Back to proposal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className={styles.revisionOverlayBody}>
              <div className={styles.revisionFieldGroup}>
                <label htmlFor="reject-reason" className={styles.revisionFieldLabel}>
                  <span>Reason for rejecting this proposal</span>
                  <span className={styles.requiredStar}>*</span>
                </label>
                <div className={styles.revisionSelectWrapper}>
                  <select
                    id="reject-reason"
                    className={styles.revisionSelect}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  >
                    <option value="">Select a reason…</option>
                    <option value="Fee & budget too high">Fee &amp; budget too high</option>
                    <option value="Scope does not match requirements">Scope does not match requirements</option>
                    <option value="Timeline is not acceptable">Timeline is not acceptable</option>
                    <option value="Decided to work with another provider">Decided to work with another provider</option>
                    <option value="Project is no longer proceeding">Project is no longer proceeding</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown size={16} className={styles.revisionSelectIcon} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={styles.revisionOverlayFooter}>
              <div className={styles.revisionActionsRow}>
                <button
                  type="button"
                  className={styles.cancelRevisionBtn}
                  onClick={handleCancelReject}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.confirmRejectBtn}
                  onClick={handleSubmitReject}
                  disabled={!rejectReason}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
