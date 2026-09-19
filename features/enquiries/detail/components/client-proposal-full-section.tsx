"use client";

import React, { useState } from "react";
import { Download, FileText, CheckCircle2, RotateCcw, Send, Check } from "lucide-react";
import { EnquiryRecord } from "@/features/enquiries/types/enquiry.types";
import styles from "./client-proposal-full-section.module.css";

export interface ClientProposalFullSectionProps {
  enquiry: EnquiryRecord;
  version?: string;
  isRevision?: boolean;
  onDownloadPdf: () => void;
  onAcceptProposal?: () => void;
  onSubmitRevision?: (comments: string) => void;
}

export function ClientProposalFullSection({
  enquiry,
  version = "V02",
  isRevision = true,
  onDownloadPdf,
  onAcceptProposal,
  onSubmitRevision,
}: ClientProposalFullSectionProps) {
  const [activeTab, setActiveTab] = useState<"executive" | "scope" | "commercials" | "timeline">("executive");
  const [showRevisionBox, setShowRevisionBox] = useState(false);
  const [revisionComments, setRevisionComments] = useState("");
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [isAccepted, setIsAccepted] = useState(false);

  const projectName = enquiry.title || "Project";
  const clientName = enquiry.clientName || "Client";
  const location = enquiry.location || "Kerala";
  const budget = enquiry.budget || "₹95 Lakhs";
  const timeline = enquiry.timeline || "10 months";

  const handleAccept = () => {
    setIsAccepted(true);
    setFeedbackToast("Proposal accepted successfully. Kallisto onboarding workflow initiated.");
    onAcceptProposal?.();
  };

  const handleSendRevision = () => {
    if (!revisionComments.trim()) {
      alert("Please specify the revision notes or changes you require.");
      return;
    }
    onSubmitRevision?.(revisionComments);
    setShowRevisionBox(false);
    setFeedbackToast("Revision request submitted to Kallisto Studio Architects. The service provider will respond with updated deliverables.");
    setRevisionComments("");
  };

  return (
    <section className={styles.proposalContainer} aria-label="Official Proposal Presentation">
      {/* 1. Header Bar */}
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <FileText size={20} />
          </div>
          <div className={styles.titleArea}>
            <div className={styles.titleWithBadge}>
              <h2 className={styles.proposalTitle}>{projectName} Proposal</h2>
              <span className={styles.versionBadge}>{version}</span>
              {isRevision ? (
                <span className={styles.statusBadgeRevision}>Revision Applied</span>
              ) : (
                <span className={styles.statusBadgeProposal}>Proposal Received</span>
              )}
            </div>
            <p className={styles.headerSubtitle}>
              Prepared by Kallisto Studio Architects • Linked to Enquiry #{enquiry.id}
            </p>
          </div>
        </div>

        <div className={styles.headerRightActions}>
          <button
            type="button"
            className={styles.downloadBtn}
            onClick={onDownloadPdf}
            title="Download Proposal Document (PDF)"
            aria-label="Download Proposal PDF"
          >
            <Download size={14} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Service Provider Response Banner (for Revision Requested status) */}
      {isRevision && (
        <div className={styles.providerResponseBanner}>
          <div className={styles.providerResponseHeader}>
            <div className={styles.providerIdentity}>
              <span>Kallisto Studio Architects</span>
              <span className={styles.providerIdentityTitle}>• Ar. Vivek Menon (Response received Aug 12, 2026)</span>
            </div>
            <span className={styles.providerBadge}>Proposal {version} Updated</span>
          </div>
          <p className={styles.providerStatement}>
            &ldquo;We have reviewed your request for exposed rammed earth walls and additional north-facing artist studio skylights. We recalibrated the civil BOQ to ₹95L, incorporated local Wayanad laterite soil tests, and established a 10-month execution schedule. Please review the updated proposal.&rdquo;
          </p>
          <ul className={styles.providerHighlights}>
            <li className={styles.providerHighlightItem}>✓ Rammed earth wall specifications confirmed</li>
            <li className={styles.providerHighlightItem}>✓ North-light studio clerestories added to structural package</li>
            <li className={styles.providerHighlightItem}>✓ BOQ breakdown aligned with {budget} target</li>
          </ul>
        </div>
      )}

      {/* 3. Section Navigation Tabs */}
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

      {/* 4. Meta Attributes Grid */}
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

      {/* 5. Tab Content Body */}
      <div className={styles.tabContent}>
        {activeTab === "executive" && (
          <div>
            <h3 className={styles.sectionTitle}>1. Executive Summary</h3>
            <p className={styles.bodyText}>
              Kallisto Studio Architects is pleased to submit this comprehensive design and execution proposal for <strong>{projectName}</strong> on behalf of <strong>{clientName}</strong> in {location}. Our proposal incorporates all site contour findings and client specifications for an artistic hillside retreat, featuring stabilized rammed earth construction, passive thermal insulation, and dedicated north-light artist studio clerestories.
            </p>
            <p className={styles.bodyText}>
              This updated revision (<strong>{version}</strong>) addresses your specific revision feedback regarding scope adjustments, cost transparency, and timeline alignment. All quantities and milestone gates have been calibrated to ensure complete transparency throughout construction.
            </p>
          </div>
        )}

        {activeTab === "scope" && (
          <div>
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

        {activeTab === "commercials" && (
          <div>
            <h3 className={styles.sectionTitle}>3. Commercials & Payment Terms</h3>
            <p className={styles.bodyText}>
              The budget estimate for <strong>{projectName}</strong> is itemised based on certified material benchmarks and standard architectural guild rates:
            </p>
            <table className={styles.commercialsTable}>
              <thead>
                <tr>
                  <th>Phase / Deliverable Group</th>
                  <th>Estimated Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Design, Architecture & Engineering Documentation</td>
                  <td>₹12,00,000</td>
                </tr>
                <tr>
                  <td>Civil, Superstructure & Rammed Earth Construction</td>
                  <td>₹52,00,000</td>
                </tr>
                <tr>
                  <td>Interior Fit-out, Joinery & Studio Specialized Fixtures</td>
                  <td>₹23,00,000</td>
                </tr>
                <tr>
                  <td>MEP, Solar Conduit & Dedicated Ventilation Equipment</td>
                  <td>₹8,00,000</td>
                </tr>
                <tr className={styles.commercialsTotalRow}>
                  <td>Total Estimated Contract Value</td>
                  <td>{budget}</td>
                </tr>
              </tbody>
            </table>
            <p className={styles.bodyText}>
              <strong>Payment Schedule:</strong> 10% Advance upon Contract Signing • 30% Foundation & Civil Frame • 40% Envelope, Joinery & Finishes • 20% Final Inspection & Handover.
            </p>
          </div>
        )}

        {activeTab === "timeline" && (
          <div>
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

      {/* 6. Action Footer with Request Revision Textbox Area */}
      <footer className={styles.proposalFooter}>
        {feedbackToast && (
          <div className={styles.feedbackToast}>
            <Check size={16} />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* Action Bar */}
        <div className={styles.footerBar}>
          <span className={styles.footerLeftText}>
            Version {version} • Generated by Kallisto Studio Architects
          </span>

          <div className={styles.footerButtons}>
            <button
              type="button"
              className={styles.revisionBtn}
              onClick={() => setShowRevisionBox(!showRevisionBox)}
            >
              <RotateCcw size={14} />
              <span>Request Revision</span>
            </button>

            <button
              type="button"
              className={styles.acceptBtn}
              onClick={handleAccept}
              disabled={isAccepted}
            >
              <CheckCircle2 size={14} />
              <span>{isAccepted ? "Accepted" : "Accept Proposal"}</span>
            </button>
          </div>
        </div>

        {/* Inline Request Revision Textbox Area */}
        {showRevisionBox && (
          <div className={styles.revisionBox}>
            <h4 className={styles.revisionBoxTitle}>
              <RotateCcw size={15} />
              <span>Request Proposal Revision</span>
            </h4>
            <p className={styles.revisionBoxDesc}>
              Specify the changes or adjustments you require for scope, materials, budget target, or timeline schedule:
            </p>
            <textarea
              className={styles.revisionTextarea}
              value={revisionComments}
              onChange={(e) => setRevisionComments(e.target.value)}
              placeholder="e.g. Please adjust the timeline milestone schedule or provide an alternate specification for flooring..."
              autoFocus
            />
            <div className={styles.revisionActions}>
              <button
                type="button"
                className={styles.cancelRevisionBtn}
                onClick={() => {
                  setShowRevisionBox(false);
                  setRevisionComments("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.submitRevisionBtn}
                onClick={handleSendRevision}
              >
                <Send size={13} />
                <span>Submit Revision Request</span>
              </button>
            </div>
          </div>
        )}
      </footer>
    </section>
  );
}
