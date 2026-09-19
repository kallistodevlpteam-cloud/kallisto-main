"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Download,
  FileText,
  Send,
  Eye,
} from "lucide-react";
import styles from "./project-basics-workspace.module.css";

export interface ProjectBasicsWorkspaceProps {
  projectId: string;
  projectName?: string;
  builtUpArea?: string;
  timeline?: string;
}

export interface BasicsComment {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  text: string;
}

export interface BasicsDeliverableOutput {
  title: string;
  version: string;
  fileName: string;
  fileSize: string;
  fileFormat: string;
  uploadedAt: string;
  uploadedBy: string;
  summary: string;
  specifications: Array<{ label: string; value: string }>;
}

export interface BasicsApprovalRecord {
  approvedBy: string;
  approvedAt: string;
  decision: "approved" | "sanctioned" | "revision_requested";
}

export interface BasicsServiceItem {
  id: string;
  name: string;
  category: string;
  provider: string;
  lead: string;
  fee: string;
  status: "active" | "completed";
  statusText: string;
  latestUpdate: string;
  updateTime: string;
  output: BasicsDeliverableOutput;
  initialApprovalStatus: "approved" | "pending" | "revision_requested";
  initialComments: BasicsComment[];
  approvalRecord?: BasicsApprovalRecord;
}

const CONNECTED_SERVICES: BasicsServiceItem[] = [
  {
    id: "bs-01",
    name: "RCC Structural Engineering & Peer Review",
    category: "Engineering",
    provider: "Axis Structures (Kochi)",
    lead: "Er. Rahul Nair",
    fee: "₹85,000",
    status: "active",
    statusText: "Active (75%)",
    latestUpdate: "Uploaded Sheet ST-204 for first-floor slab beam reinforcement detailing.",
    updateTime: "Yesterday",
    initialApprovalStatus: "approved",
    approvalRecord: {
      approvedBy: "Priya Sharma (Lead Architect)",
      approvedAt: "Yesterday, 11:20 AM",
      decision: "approved",
    },
    output: {
      title: "Sheet ST-204: First-Floor Slab & Beam Reinforcement Detailing",
      version: "Rev 2.0",
      fileName: "AXIS-ST-204-REV2-REINFORCEMENT.dwg",
      fileSize: "6.4 MB",
      fileFormat: "DWG / CAD Drawing",
      uploadedAt: "Yesterday at 4:30 PM",
      uploadedBy: "Er. Rahul Nair (Axis Structures)",
      summary: "Complete structural shop drawing showing longitudinal beam sections, stirrup spacing, slab rebar curtailment, and beam-column junction reinforcement detailing compliant with IS 456:2000 and SP 34.",
      specifications: [
        { label: "Concrete Grade", value: "M25 (Ready-Mix)" },
        { label: "Steel Reinforcement", value: "Fe 500D TMT High Yield" },
        { label: "Slab Thickness", value: "150 mm (Two-Way Slab)" },
        { label: "Clear Cover", value: "25 mm (50 mm at penetrations)" },
        { label: "Deflection Verification", value: "Span/320 (Safe per code)" },
      ],
    },
    initialComments: [
      {
        id: "c-101",
        author: "Priya Sharma",
        role: "Lead Architect",
        timestamp: "Yesterday, 5:15 PM",
        text: "Beam B-12 bottom bars require additional clear cover consideration near the AC duct penetration.",
      },
      {
        id: "c-102",
        author: "Er. Rahul Nair",
        role: "Structural Lead (Axis Structures)",
        timestamp: "Yesterday, 6:40 PM",
        text: "Updated sheet ST-204 Rev 2 with 50mm offset around duct sleeves and verified shear link adequacy.",
      },
    ],
  },
  {
    id: "bs-02",
    name: "Integrated MEP Engineering (Electrical & Plumbing)",
    category: "MEP Consulting",
    provider: "Enviro MEP Consultants (Kozhikode)",
    lead: "Siddharth K",
    fee: "₹68,000",
    status: "active",
    statusText: "Active (60%)",
    latestUpdate: "Updated solar PV inverter tie-in circuits & breaker schedule in DB Schedule.",
    updateTime: "2 days ago",
    initialApprovalStatus: "pending",
    output: {
      title: "Solar PV Inverter Tie-in Schematics & Distribution Board Circuit Schedule",
      version: "Rev 1.2",
      fileName: "MEP-E-2026-SLD-SOLAR-TIEIN-REV1.2.pdf",
      fileSize: "4.1 MB",
      fileFormat: "PDF / Electrical Schematics",
      uploadedAt: "2 days ago at 2:15 PM",
      uploadedBy: "Siddharth K (Enviro MEP Consultants)",
      summary: "Single-line diagram (SLD) depicting 8kW on-grid solar PV inverter tie-in to the main distribution panel, dual-source automatic changeover, Type-2 surge protection, and updated breaker schedules.",
      specifications: [
        { label: "Inverter Rating", value: "8kW Three-Phase Hybrid (IP65)" },
        { label: "Solar Breaker", value: "40A 4P C-Curve MCB" },
        { label: "Surge Protection", value: "Type-2 SPD (40kA, 4P)" },
        { label: "AC Isolator", value: "63A 4-Pole Lockable Rotary" },
        { label: "Voltage Drop", value: "1.1% (with 10 sq mm Cu cable)" },
      ],
    },
    initialComments: [
      {
        id: "c-201",
        author: "Arjun Menon",
        role: "Project Manager",
        timestamp: "2 days ago, 3:30 PM",
        text: "Please verify if the rooftop solar junction box distance exceeds 15 meters for voltage drop calculation.",
      },
      {
        id: "c-202",
        author: "Siddharth K",
        role: "MEP Lead (Enviro MEP)",
        timestamp: "Yesterday, 10:15 AM",
        text: "Voltage drop calculated at 1.1% with 10 sq mm copper cable, well within the 3% allowable limit.",
      },
    ],
  },
  {
    id: "bs-03",
    name: "Soil Geotechnical Investigation & Bearing Stability",
    category: "Specialist Consulting",
    provider: "Terra Geotechnics (Thrissur)",
    lead: "Dr. Jacob V",
    fee: "₹42,000",
    status: "completed",
    statusText: "Completed",
    latestUpdate: "Soil borehole testing certified 180 kN/m² safe bearing capacity with zero differential settlement risk.",
    updateTime: "18 May",
    initialApprovalStatus: "approved",
    approvalRecord: {
      approvedBy: "Er. Rahul Nair (Structural Consultant)",
      approvedAt: "20 May 2026",
      decision: "approved",
    },
    output: {
      title: "Subsoil Geotechnical Investigation & Safe Bearing Capacity Report",
      version: "Report #TG-2026-GEO-88",
      fileName: "TERRA-GEO-SOIL-INVESTIGATION-FINAL.pdf",
      fileSize: "8.2 MB",
      fileFormat: "PDF / Geotechnical Investigation",
      uploadedAt: "18 May 2026",
      uploadedBy: "Dr. Jacob V (Terra Geotechnics)",
      summary: "Comprehensive soil investigation report including 3 SPT boreholes drilled up to 12.5m depth, core recovery index, shear parameters, groundwater monitoring, and foundation recommendations.",
      specifications: [
        { label: "Safe Bearing Capacity", value: "180 kN/m² @ 2.1m depth" },
        { label: "Foundation Type", value: "Isolated / Combined Footing" },
        { label: "Groundwater Table", value: "4.2m below finished ground" },
        { label: "Subsoil Profile", value: "Medium dense sandy clay to weathered rock" },
        { label: "Differential Settlement", value: "< 12 mm (Safe per IS 1904)" },
      ],
    },
    initialComments: [
      {
        id: "c-301",
        author: "Dr. Jacob V",
        role: "Geotechnical Director",
        timestamp: "18 May 2026",
        text: "Groundwater table encountered at 4.2m depth. Standard shallow excavation will not require specialized dewatering.",
      },
    ],
  },
  {
    id: "bs-04",
    name: "Building Permit & Statutory Sanctions Advisory",
    category: "Compliance",
    provider: "PermitPath Consultants (Thiruvananthapuram)",
    lead: "Anand M",
    fee: "₹35,000",
    status: "completed",
    statusText: "Sanctioned",
    latestUpdate: "Municipal Corporation Town Planning Dept approved residential building permit order #KMBR-2026-0814.",
    updateTime: "02 Jun",
    initialApprovalStatus: "approved",
    approvalRecord: {
      approvedBy: "Municipal Corporation Town Planning Dept",
      approvedAt: "02 Jun 2026",
      decision: "sanctioned",
    },
    output: {
      title: "Municipal Corporation Residential Building Permit Order & Sanctioned Plan",
      version: "Permit Order #KMBR-2026-0814",
      fileName: "KMBR-SANCTION-PERMIT-2026-0814.pdf",
      fileSize: "3.5 MB",
      fileFormat: "Official Municipal PDF",
      uploadedAt: "02 Jun 2026",
      uploadedBy: "Anand M (PermitPath Consultants)",
      summary: "Formal sanctioned building permit order issued under Kerala Municipality Building Rules (KMBR 2026) for G+1 residential structure with approved setbacks, FAR, and rainwater harvesting.",
      specifications: [
        { label: "Permit Order #", value: "#KMBR-2026-0814" },
        { label: "Approved FAR", value: "1.48 (Permissible: 2.0)" },
        { label: "Plot Coverage", value: "44.2% (Permissible: 60%)" },
        { label: "Front Setback", value: "3.05 m minimum clear" },
        { label: "Sanction Validity", value: "3 Years (Valid till Jun 2029)" },
      ],
    },
    initialComments: [
      {
        id: "c-401",
        author: "Anand M",
        role: "Statutory Consultant",
        timestamp: "02 Jun 2026",
        text: "Official sanctioned order and stamped drawings archived. Physical notice board details ready for site erection.",
      },
    ],
  },
];

export function ProjectBasicsWorkspace({
  projectId,
  projectName = "Nila Residence",
}: ProjectBasicsWorkspaceProps) {
  // Modal State
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Approvals State
  const [approvals, setApprovals] = useState<
    Record<
      string,
      {
        status: "approved" | "pending" | "revision_requested";
        approvedBy?: string;
        approvedAt?: string;
        decision?: "approved" | "sanctioned" | "revision_requested";
      }
    >
  >(() => {
    const initial: Record<
      string,
      {
        status: "approved" | "pending" | "revision_requested";
        approvedBy?: string;
        approvedAt?: string;
        decision?: "approved" | "sanctioned" | "revision_requested";
      }
    > = {};
    CONNECTED_SERVICES.forEach((svc) => {
      initial[svc.id] = {
        status: svc.initialApprovalStatus,
        approvedBy: svc.approvalRecord?.approvedBy,
        approvedAt: svc.approvalRecord?.approvedAt,
        decision: svc.approvalRecord?.decision,
      };
    });
    return initial;
  });

  // Comments State
  const [comments, setComments] = useState<Record<string, BasicsComment[]>>(() => {
    const initial: Record<string, BasicsComment[]> = {};
    CONNECTED_SERVICES.forEach((svc) => {
      initial[svc.id] = svc.initialComments;
    });
    return initial;
  });

  // Comment input state
  const [commentText, setCommentText] = useState("");

  // Keyboard accessibility: Close modal on Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedServiceId) {
        setSelectedServiceId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedServiceId]);

  const activeService = CONNECTED_SERVICES.find((s) => s.id === selectedServiceId);
  const activeApproval = selectedServiceId ? approvals[selectedServiceId] : null;
  const activeComments = selectedServiceId ? comments[selectedServiceId] || [] : [];

  const handleOpenModal = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setCommentText("");
  };

  const handleCloseModal = () => {
    setSelectedServiceId(null);
    setCommentText("");
  };

  // Submit new review comment
  const handleAddComment = () => {
    if (!commentText.trim() || !selectedServiceId) return;

    const newEntry: BasicsComment = {
      id: `c-${Date.now()}`,
      author: "You (Project Lead)",
      role: "Lead Architect",
      timestamp: "Just now",
      text: commentText.trim(),
    };

    setComments((prev) => ({
      ...prev,
      [selectedServiceId]: [...(prev[selectedServiceId] || []), newEntry],
    }));

    setCommentText("");
  };

  // Approve Deliverable
  const handleApprove = (serviceId: string) => {
    const nowStr = "Just now";
    setApprovals((prev) => ({
      ...prev,
      [serviceId]: {
        status: "approved",
        approvedBy: "You (Project Lead)",
        approvedAt: nowStr,
        decision: "approved",
      },
    }));

    // Add automated audit log comment
    const auditComment: BasicsComment = {
      id: `c-audit-${Date.now()}`,
      author: "System (Approval Audit)",
      role: "Governance Record",
      timestamp: nowStr,
      text: `Deliverable "${activeService?.output.title || "Output"}" signed off and approved by You (Project Lead).`,
    };

    setComments((prev) => ({
      ...prev,
      [serviceId]: [...(prev[serviceId] || []), auditComment],
    }));
  };

  // Request Revision
  const handleRequestRevision = (serviceId: string) => {
    const nowStr = "Just now";
    setApprovals((prev) => ({
      ...prev,
      [serviceId]: {
        status: "revision_requested",
        approvedBy: "You (Project Lead)",
        approvedAt: nowStr,
        decision: "revision_requested",
      },
    }));

    const auditComment: BasicsComment = {
      id: `c-rev-${Date.now()}`,
      author: "You (Project Lead)",
      role: "Lead Architect",
      timestamp: nowStr,
      text: "Revision requested: Please review and address the noted specifications before resubmission.",
    };

    setComments((prev) => ({
      ...prev,
      [serviceId]: [...(prev[serviceId] || []), auditComment],
    }));
  };

  return (
    <div className={styles.workspaceRoot} data-project-id={projectId}>
      {/* ── 1. Top Header Row ─────────────────────────────────── */}
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <h4 className={styles.heading}>Basics Services</h4>
          <span className={styles.countBadge}>
            {CONNECTED_SERVICES.length} Connected Services
          </span>
        </div>
        <Link href="/basics" className={styles.profileBtn}>
          <span>Open Basics Workspace</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* ── 2. Connected Basics Services & Live Updates ─────────── */}
      <div className={styles.servicesSection}>
        <div className={styles.servicesList}>
          {CONNECTED_SERVICES.map((svc) => {
            const currentAppr = approvals[svc.id];
            const isPending = currentAppr?.status === "pending";
            const isApproved = currentAppr?.status === "approved";

            return (
              <div key={svc.id} className={styles.serviceRow}>
                <div className={styles.serviceMain}>
                  <div className={styles.serviceTitleRow}>
                    <span className={styles.serviceTitle}>{svc.name}</span>
                    <span className={styles.serviceCategory}>{svc.category}</span>
                    {isPending && (
                      <span className={styles.pendingIndicatorBadge}>
                        <Clock size={11} />
                        <span>Pending Approval</span>
                      </span>
                    )}
                    {isApproved && currentAppr?.approvedBy?.includes("You") && (
                      <span className={styles.approvedIndicatorBadge}>
                        <CheckCircle2 size={11} />
                        <span>Approved</span>
                      </span>
                    )}
                  </div>
                  <div className={styles.serviceProvider}>
                    <span>
                      Provider: <strong>{svc.provider}</strong>
                    </span>
                    <span style={{ margin: "0 6px" }}>·</span>
                    <span>
                      Lead: <strong>{svc.lead}</strong>
                    </span>
                  </div>
                  <div
                    className={styles.serviceUpdate}
                    onClick={() => handleOpenModal(svc.id)}
                    title="Click to view output details & comments"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleOpenModal(svc.id);
                      }
                    }}
                  >
                    <MessageSquare size={12} color="#0284c7" style={{ flexShrink: 0 }} />
                    <span className={styles.updateText}>{svc.latestUpdate}</span>
                    <span className={styles.updateTime}>{svc.updateTime}</span>
                  </div>
                </div>

                <div className={styles.serviceActions}>
                  <span className={styles.serviceFee}>Fee: {svc.fee}</span>
                  <span
                    className={
                      svc.status === "active"
                        ? styles.statusTagActive
                        : styles.statusTagCompleted
                    }
                  >
                    {isApproved && isPending ? "Approved" : svc.statusText}
                  </span>

                  {/* Primary Output & Approval Action Trigger */}
                  {isPending ? (
                    <button
                      type="button"
                      className={styles.reviewApproveBtn}
                      onClick={() => handleOpenModal(svc.id)}
                      aria-label={`Review and approve ${svc.name} output`}
                    >
                      <Clock size={13} />
                      <span>Review &amp; Approve</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.viewOutputBtn}
                      onClick={() => handleOpenModal(svc.id)}
                      aria-label={`View output of ${svc.name}`}
                    >
                      <Eye size={13} />
                      <span>View Output</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. Deliverable Output, Review & Approval Modal ─────────── */}
      {activeService && activeApproval && (
        <div
          className={styles.modalBackdrop}
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="basics-output-modal-title"
        >
          <div
            className={styles.modalDialog}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <div className={styles.modalCategoryRow}>
                  <span className={styles.modalServiceTag}>{activeService.category}</span>
                  <span className={styles.modalServiceName}>{activeService.name}</span>
                </div>
                <h3 id="basics-output-modal-title" className={styles.modalDeliverableTitle}>
                  {activeService.output.title}
                </h3>
                <div className={styles.modalSubMeta}>
                  <span>Provider: <strong>{activeService.provider}</strong></span>
                  <span style={{ margin: "0 6px" }}>·</span>
                  <span>Lead: <strong>{activeService.lead}</strong></span>
                  <span style={{ margin: "0 6px" }}>·</span>
                  <span>Submitted {activeService.output.uploadedAt}</span>
                </div>
              </div>

              <div className={styles.modalHeaderActions}>
                <a
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent(
                    `KALLISTO BASICS DELIVERABLE OUTPUT\n=================================\nService: ${activeService.name}\nDeliverable: ${activeService.output.title}\nVersion: ${activeService.output.version}\nSummary: ${activeService.output.summary}\n`
                  )}`}
                  download={activeService.output.fileName}
                  className={styles.modalDownloadBtn}
                  title="Download deliverable output file"
                >
                  <Download size={13} />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={styles.modalCloseBtn}
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className={styles.modalBody}>
              {/* Deliverable Document Card */}
              <div className={styles.deliverableCard}>
                <div className={styles.deliverableTopRow}>
                  <div className={styles.deliverableIconBox}>
                    <FileText size={22} color="#0284c7" />
                  </div>
                  <div className={styles.deliverableInfoCol}>
                    <div className={styles.deliverableNameRow}>
                      <span className={styles.deliverableFileName}>
                        {activeService.output.fileName}
                      </span>
                      <span className={styles.versionBadge}>{activeService.output.version}</span>
                      <span className={styles.formatBadge}>{activeService.output.fileFormat}</span>
                    </div>
                    <span className={styles.fileSizeMeta}>
                      File Size: {activeService.output.fileSize} · Uploaded by {activeService.output.uploadedBy}
                    </span>
                  </div>
                </div>

                <p className={styles.deliverableSummaryText}>
                  {activeService.output.summary}
                </p>

                {/* Technical Specifications Matrix */}
                <div className={styles.specMatrixSection}>
                  <h5 className={styles.specMatrixTitle}>Verified Engineering Specifications</h5>
                  <div className={styles.specGrid}>
                    {activeService.output.specifications.map((spec, i) => (
                      <div key={i} className={styles.specCard}>
                        <span className={styles.specLabel}>{spec.label}</span>
                        <span className={styles.specValue}>{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Architectural Blueprint / Stamped Preview Block */}
                <div className={styles.blueprintPreviewBlock}>
                  <div className={styles.blueprintHeaderRow}>
                    <div className={styles.blueprintTitleInfo}>
                      <span className={styles.blueprintProject}>{projectName}</span>
                      <span className={styles.blueprintTitle}>{activeService.output.title}</span>
                    </div>
                    <div className={styles.blueprintStampArea}>
                      {activeApproval.status === "approved" ? (
                        <div className={styles.stampApproved}>
                          <CheckCircle2 size={12} />
                          <span>APPROVED</span>
                        </div>
                      ) : activeApproval.status === "revision_requested" ? (
                        <div className={styles.stampRevision}>
                          <AlertCircle size={12} />
                          <span>REVISION REQ</span>
                        </div>
                      ) : (
                        <div className={styles.stampPending}>
                          <Clock size={12} />
                          <span>PENDING SIGN-OFF</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Comments & Notes Section */}
              <div className={styles.commentsSection}>
                <div className={styles.commentsHeader}>
                  <div className={styles.commentsTitleGroup}>
                    <MessageSquare size={14} color="#334155" />
                    <h5 className={styles.commentsTitle}>Review Comments &amp; Notes</h5>
                    <span className={styles.commentsCountBadge}>{activeComments.length}</span>
                  </div>
                </div>

                <div className={styles.commentsList}>
                  {activeComments.map((c) => (
                    <div key={c.id} className={styles.commentItem}>
                      <div className={styles.commentItemHeader}>
                        <div className={styles.commentAuthorGroup}>
                          <span className={styles.commentAuthor}>{c.author}</span>
                          <span className={styles.commentRole}>{c.role}</span>
                        </div>
                        <span className={styles.commentTime}>{c.timestamp}</span>
                      </div>
                      <p className={styles.commentText}>{c.text}</p>
                    </div>
                  ))}
                </div>

                {/* Comment Composer */}
                <div className={styles.commentComposerBox}>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={`Leave a comment, technical observation, or review feedback for ${activeService.lead}...`}
                    className={styles.commentTextarea}
                    rows={2}
                    aria-label="Add review comment"
                  />
                  <div className={styles.composerActionsRow}>
                    <button
                      type="button"
                      onClick={handleAddComment}
                      disabled={!commentText.trim()}
                      className={styles.commentSubmitBtn}
                    >
                      <Send size={12} />
                      <span>Post Comment</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer: Approvals & Governance Actions */}
            <div className={styles.modalFooter}>
              {activeApproval.status === "pending" ? (
                <div className={styles.pendingApprovalContainer}>
                  <div className={styles.pendingApprovalNotice}>
                    <Clock size={15} color="#d97706" />
                    <div className={styles.pendingApprovalNoticeText}>
                      <strong>Pending Sign-Off:</strong> Review the technical output above. You can approve or request revisions with feedback.
                    </div>
                  </div>

                  <div className={styles.approvalActionsRow}>
                    <button
                      type="button"
                      onClick={() => handleRequestRevision(activeService.id)}
                      className={styles.modalRevisionBtn}
                    >
                      <AlertCircle size={13} />
                      <span>Request Revision</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApprove(activeService.id)}
                      className={styles.modalApproveBtn}
                    >
                      <CheckCircle2 size={13} />
                      <span>Approve Deliverable</span>
                    </button>
                  </div>
                </div>
              ) : activeApproval.status === "approved" ? (
                <div className={styles.approvedConfirmationBar}>
                  <div className={styles.approvedInfo}>
                    <CheckCircle2 size={16} color="#15803d" />
                    <span>
                      <strong>Approved:</strong> Signed off by{" "}
                      <strong>{activeApproval.approvedBy}</strong> ({activeApproval.approvedAt})
                    </span>
                  </div>
                  <span className={styles.approvedStatusPill}>
                    {activeApproval.decision === "sanctioned" ? "Sanctioned" : "Approved"}
                  </span>
                </div>
              ) : (
                <div className={styles.revisionRequestedBar}>
                  <div className={styles.revisionInfo}>
                    <AlertCircle size={16} color="#b45309" />
                    <span>
                      <strong>Revision Requested:</strong> Feedback dispatched to {activeService.lead}.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApprove(activeService.id)}
                    className={styles.modalApproveBtn}
                  >
                    <CheckCircle2 size={13} />
                    <span>Approve Now</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
