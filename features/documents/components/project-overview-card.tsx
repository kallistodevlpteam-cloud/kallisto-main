"use client";

import React, { useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  FileCheck2,
  LayoutGrid,
  Building2,
  Trees,
  MapPin,
  Cpu,
  Wallet,
  Calendar,
  ShieldCheck,
  FileText,
  Briefcase,
  Share2,
  MessageSquare,
} from "lucide-react";
import {
  ClockDuotoneIcon,
  MapPinDuotoneIcon,
  CalendarDuotoneIcon,
  BuildingDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import {
  PROJECT_MAIN_MIN_WIDTH,
  PROJECT_UPDATES_GAP,
  PROJECT_UPDATES_PANEL_ID,
  type ProjectUpdatesLayoutMode,
} from "@/lib/layout/project-dashboard-responsive-contract";
import type { UpdatePost } from "../hooks/use-project-updates-panel-state";
import {
  EnquiryDetailTabs,
  type EnquiryTabKey,
} from "@/features/enquiries/detail/components/enquiry-detail-tabs";
import { OdinProjectBrief } from "@/features/enquiries/detail/components/odin-project-brief";
import { ClientPrioritiesBar } from "@/features/enquiries/detail/components/client-priorities-bar";
import { EnquiryProjectScopeSection } from "@/features/enquiries/detail/components/enquiry-project-scope-section";
import { EnquirySiteImagesCard } from "@/features/enquiries/detail/components/enquiry-site-images-card";
import { EnquiryProjectDocumentsSection } from "@/features/enquiries/detail/components/enquiry-project-documents-section";
import { DocumentsTitleRowActions } from "./documents-title-row-actions";
import {
  buildEnquiryDetailViewModel,
  ClientHouseholdMember,
} from "@/features/enquiries/detail/services/enquiry-detail-view-model";
import { getMemberOdinInsightSummary } from "@/features/enquiries/detail/components/enquiry-detail-workspace";
import { ClientPriority, EnquiryRecord } from "@/features/enquiries/types/enquiry.types";
import {
  ProjectStatCardsBar,
  type ProjectStatValues,
} from "./project-stat-cards-bar";
import { ProjectOverviewActivitySections } from "./project-overview-activity-sections";
import { ProjectUpdatesPanel } from "./project-updates-panel";
import styles from "@/features/enquiries/detail/components/enquiry-detail-workspace.module.css";

const REQUIREMENT_DOMAINS: Array<{
  key: string;
  title: string;
  shortTitle: string;
  desc: string;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
}> = [
  { key: "room_programme", title: "SPACE / ROOM PROGRAMME", shortTitle: "Space / Rooms", desc: "Detailed room requirements, quantities, floors, adjacencies & specs.", icon: <LayoutGrid size={13} strokeWidth={2.2} />, bgColor: "#eff6ff", iconColor: "#2563eb" },
  { key: "exterior_facade", title: "EXTERIOR & FACADE", shortTitle: "Exterior & Facade", desc: "Building envelope, elevation materials, fenestration & roof character.", icon: <Building2 size={13} strokeWidth={2.2} />, bgColor: "#fff7ed", iconColor: "#ea580c" },
  { key: "outdoor_landscape", title: "OUTDOOR & LANDSCAPE", shortTitle: "Outdoor & Landscape", desc: "Garden layout, sit-outs, carports, boundary walls & open space.", icon: <Trees size={13} strokeWidth={2.2} />, bgColor: "#f0fdf4", iconColor: "#16a34a" },
  { key: "site", title: "SITE REQUIREMENTS", shortTitle: "Site", desc: "Plot dimensions, orientation, access road, topography, and utility connections.", icon: <MapPin size={13} strokeWidth={2.2} />, bgColor: "#fef2f2", iconColor: "#dc2626" },
  { key: "technical", title: "TECHNICAL REQUIREMENTS", shortTitle: "Technical", desc: "MEP, HVAC, electrical, smart home, solar PV, and rainwater harvesting.", icon: <Cpu size={13} strokeWidth={2.2} />, bgColor: "#faf5ff", iconColor: "#9333ea" },
  { key: "budget_commercial", title: "BUDGET & COMMERCIAL", shortTitle: "Budget & Commercial", desc: "Overall budget range, inclusions, contingencies, and commercial scope.", icon: <Wallet size={13} strokeWidth={2.2} />, bgColor: "#f0fdfa", iconColor: "#0d9488" },
  { key: "timeline", title: "TIMELINE & MILESTONES", shortTitle: "Timeline", desc: "Target schedule, phasing, completion target, and key delivery dates.", icon: <Calendar size={13} strokeWidth={2.2} />, bgColor: "#fffbe6", iconColor: "#d97706" },
  { key: "regulatory", title: "REGULATORY & APPROVALS", shortTitle: "Regulatory", desc: "Building permit requirements, setbacks, height restrictions & municipal codes.", icon: <ShieldCheck size={13} strokeWidth={2.2} />, bgColor: "#f1f5f9", iconColor: "#475569" },
  { key: "documentation", title: "DOCUMENTATION STATUS", shortTitle: "Documentation", desc: "Submitted drawings, site survey files, reference images & legal documents.", icon: <FileText size={13} strokeWidth={2.2} />, bgColor: "#fce7f3", iconColor: "#db2777" },
  { key: "scope", title: "PROFESSIONAL SCOPE", shortTitle: "Scope", desc: "Design, turnkey fit-out, site supervision, and consultancy inclusions.", icon: <Briefcase size={13} strokeWidth={2.2} />, bgColor: "#e0e7ff", iconColor: "#4f46e5" },
];

const DEFAULT_PROJECT_DOCS = [
  { id: "doc-1", name: "Client Project Requirement Brief.pdf", docType: "Brief", approved: true, uploaded: true, updatedAt: "23 Jul 2026", updatedBy: { name: "Ananya Builders", initials: "AB" } },
  { id: "doc-2", name: "Kochi Plot Boundary Survey & Contours.dwg", docType: "Survey", approved: true, uploaded: true, updatedAt: "24 Jul 2026", updatedBy: { name: "Field Survey Team", initials: "FS" } },
  { id: "doc-3", name: "ODIN Spatial Feasibility Assessment v1.2.pdf", docType: "Feasibility", approved: true, uploaded: true, updatedAt: "26 Jul 2026", updatedBy: { name: "ODIN System", initials: "OD" } },
];

interface ProjectOverviewCardProps {
  projectId?: string;
  dashboardRef?: RefObject<HTMLDivElement | null>;
  layoutMode?: ProjectUpdatesLayoutMode;
  updatesOpen?: boolean;
  updatesPanelRef?: RefObject<HTMLDivElement | null>;
  updatesWidth?: number;
  onUpdatesClose?: () => void;
  statValues?: Partial<ProjectStatValues>;
  initialUpdates?: readonly UpdatePost[];
  futureContent?: ReactNode;
  updatesTitle?: string;
  overviewTitle?: string;
  projectName?: string;
  description?: string;
  highlights?: Array<string | { text: string; status?: "positive" | "neutral" | "danger" }>;
  customRightPanel?: ReactNode;
  inspirationImages?: Array<{ url: string; alt?: string | null }>;
  projectScopes?: Array<{ id: number; scope_name: string; items: string[] }>;
  priorities?: ClientPriority[];
  updatesTriggerRef?: RefObject<HTMLButtonElement | null>;
  onOpenUpdates?: () => void;
}

export function ProjectOverviewCard({
  projectId = "proj-001",
  dashboardRef,
  layoutMode = "drawer",
  updatesOpen = false,
  updatesPanelRef,
  updatesWidth = 340,
  onUpdatesClose = () => undefined,
  updatesTriggerRef,
  onOpenUpdates,
  statValues,
  initialUpdates,
  futureContent,
  updatesTitle,
  projectName,
  description,
  customRightPanel,
  inspirationImages,
  projectScopes,
  priorities,
}: ProjectOverviewCardProps = {}) {
  const [activeTab, setActiveTab] = useState<EnquiryTabKey>("overview");
  const [activeDomainKey, setActiveDomainKey] = useState<string>("room_programme");
  const [selectedRequirementId, setSelectedRequirementId] = useState<string | null>(null);
  const [expandedRoomIds, setExpandedRoomIds] = useState<Record<string, boolean>>({});

  const baseEnquiry: EnquiryRecord = {
    id: projectId || "enq-2026-0486",
    title: projectName || "Calicut Retail Interior",
    requirementSummary:
      description ||
      "Ananya Builders is seeking a residential fit-out for approximately 2,800–3,200 sq ft in Kochi. The current requirement covers space planning, interior fit-out and MEP coordination with a ₹40L–₹60L budget and a six-month target. The project is suitable for review, but budget coverage and expected deliverables should be clarified before proposal preparation.",
    clientName: statValues?.client || "Ananya Builders",
    location: "Kochi",
    thumbnailUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    source: "website",
    status: "active",
    stage: "accepted",
    projectType: statValues?.projectType?.toLowerCase().includes("commercial") ? "commercial" : "residential",
    budgetMin: 4000000,
    budgetMax: 6000000,
    receivedAt: "2026-07-23T10:00:00Z",
    nextAction: { type: "review_enquiry", label: "Review Requirements" },
    enquiryRef: "ENQ-2026-0486",
    budget: statValues?.budget || "₹40L – ₹60L",
    timeline: statValues?.duration || "Within 6 Months",
    builtUpArea: statValues?.builtUpArea || "2,800 – 3,200 sq ft",
    inspirationImages: inspirationImages || [
      { url: "/assets/nila-hero.jpg", alt: "Living Room Modern Architecture" },
      { url: "/assets/nila-thumb2.jpg", alt: "Courtyard Landscape Garden" },
      { url: "/assets/nila-thumb3.jpg", alt: "Pool Deck Elevation View" },
    ],
    clientPriorities: priorities,
    projectScopes: projectScopes,
  };

  const viewModel = buildEnquiryDetailViewModel({ enquiry: baseEnquiry });

  const resolvedImages = (baseEnquiry.inspirationImages || []).map((img, idx) => ({
    id: `inspiration-${idx}`,
    src: img.url,
    alt: img.alt || `Inspiration image ${idx + 1}`,
  }));

  const displayTitle = projectName || baseEnquiry.title || "Calicut Retail Interior";

  return (
    <div
      ref={dashboardRef}
      className="poc-wrapper"
      data-updates-mode={layoutMode}
      style={{
        "--project-main-min-width": `${PROJECT_MAIN_MIN_WIDTH}px`,
        "--project-updates-gap": `${PROJECT_UPDATES_GAP}px`,
        "--project-updates-rail-width": `${updatesWidth}px`,
      } as CSSProperties}
    >
      <main className="poc-left-column">
        {/* Top Project Information Header + Tabs (Sticky in Left Column) */}
        <div className="poc-left-header-sticky">
          <div className={styles.headerBlock}>
            <div className={styles.titleRow}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h1 className={styles.projectTitle}>{displayTitle}</h1>
                <button
                  type="button"
                  className="title-share-btn"
                  aria-label={`Share ${displayTitle}`}
                  title={`Share ${displayTitle}`}
                >
                  <Share2 size={16} strokeWidth={1.8} />
                </button>
              </div>
              <DocumentsTitleRowActions />
            </div>

            <div className={styles.subMetaRow}>
              <div className={styles.subMetaLeft}>
                <span className={styles.metaItem}>
                  <MapPinDuotoneIcon size={15} className={styles.locationPinIcon} />
                  <strong className={styles.metaHighlight}>{viewModel.header.location || "Kochi"}</strong>
                </span>
                <span className={styles.metaDivider}>•</span>
                <span className={styles.metaItem}>
                  <CalendarDuotoneIcon size={14} className={styles.metaIconMuted} />
                  <span>Received {viewModel.header.receivedDate || "Jul 23, 2026"}</span>
                </span>
              </div>

              <div className={styles.subMetaRight}>
                <span className={styles.metaItem}>
                  <BuildingDuotoneIcon size={14} className={styles.metaIconMuted} />
                  <span>{viewModel.header.projectType || "Residential Design"}</span>
                </span>
                <span className={styles.metaDivider}>•</span>
                <span className={`${styles.stagePillInline} ${styles.stageNew}`}>
                  <span className={styles.stageDot} />
                  <span>New</span>
                </span>
              </div>
            </div>
          </div>

          <EnquiryDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* —— TAB 1: OVERVIEW —————————————————————————————————————————————————— */}
        {activeTab === "overview" && (
          <div className={styles.tabSectionGroup}>
            <OdinProjectBrief brief={viewModel.brief} />
            <ProjectStatCardsBar values={statValues} />
            <ProjectOverviewActivitySections projectId={projectId} />
            {futureContent}
          </div>
        )}

        {/* —— TAB 2: CLIENT CONTEXT ————————————————————————————————————————————— */}
        {activeTab === "client" && (
          <div className={styles.tabSectionGroup}>
            <div className={styles.householdHeaderRow}>
              <div className={styles.householdTitleGroup}>
                <h4 className={styles.householdHeading}>
                  {viewModel.isCommercialProject ? "Client & Stakeholders" : "Client & Household"}
                </h4>
                <span className={styles.householdCountBadge}>
                  {(viewModel.householdMembers || []).length} members
                </span>
              </div>
            </div>

            <div className={styles.householdGrid}>
              {(viewModel.householdMembers || []).map((member: ClientHouseholdMember) => (
                <div key={member.id} className={styles.morigCardShell}>
                  <div className={styles.odinHoverTooltip}>
                    <div className={styles.tooltipHeader}>
                      <Sparkles size={12} className={styles.tooltipIcon} />
                      <span className={styles.tooltipTitle}>ODIN Insight</span>
                    </div>
                    <p className={styles.tooltipSummaryText}>
                      {getMemberOdinInsightSummary(member)}
                    </p>
                    <div className={styles.tooltipTail} />
                  </div>

                  <div className={styles.morigPhotoBox}>
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        className={styles.morigPhotoImg}
                      />
                    ) : (
                      <div className={styles.morigFallbackAvatar}>
                        {member.avatarInitials}
                      </div>
                    )}

                    <div className={styles.morigGradientOverlay} />

                    <div className={styles.morigOverlayContent}>
                      <h5 className={styles.morigName}>{member.name}</h5>
                      <p className={styles.morigDesc}>
                        {member.relationship}{member.age ? ` · ${member.age} yrs` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <ClientPrioritiesBar priorities={viewModel.priorities} />

            <EnquirySiteImagesCard
              title="Client Inspiration Images"
              images={resolvedImages}
              totalCount={resolvedImages.length}
            />
          </div>
        )}

        {/* —— TAB 3: REQUIREMENTS (THREE-PANE WORKSPACE) ————————————————————————— */}
        {activeTab === "requirements" && (
          <div className={styles.requirementsWorkspace}>
            {/* PANE 1: Requirement Domain Navigator */}
            <aside className={styles.reqDomainNav} aria-label="Requirement Domains">
              <div className={styles.reqDomainNavHeader}>
                <span className={styles.reqDomainNavTitle}>REQUIREMENTS</span>
                <span className={styles.reqDomainNavSubtitle}>
                  {viewModel.requirements.filter((r) =>
                    REQUIREMENT_DOMAINS.some((d) => d.key === (r.domain || r.category))
                  ).length}{" "}
                  delivery specs
                </span>
              </div>

              <div className={styles.reqDomainNavList}>
                {REQUIREMENT_DOMAINS.map((d) => {
                  const domainReqs = viewModel.requirements.filter(
                    (r) => (r.domain || r.category) === d.key
                  );
                  if (domainReqs.length === 0) return null;

                  const clearCount = domainReqs.filter(
                    (r) => r.state === "confirmed" || r.state === "odin_inferred"
                  ).length;
                  const totalCount = domainReqs.length;
                  const isActive = activeDomainKey === d.key;

                  return (
                    <button
                      key={d.key}
                      type="button"
                      className={`${styles.reqDomainNavItem} ${isActive ? styles.reqDomainNavItemActive : ""}`}
                      onClick={() => setActiveDomainKey(d.key)}
                    >
                      <div className={styles.reqDomainNavLabelRow}>
                        <span className={styles.reqDomainNavIconBadge}>{d.icon}</span>
                        <span className={styles.reqDomainNavLabel}>{d.shortTitle}</span>
                      </div>
                      <span className={styles.reqDomainNavBadge}>
                        {clearCount}/{totalCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* PANE 2: Active Requirement Domain Workspace */}
            <section className={styles.activeDomainWorkspace} aria-label="Active Domain Workspace">
              {(() => {
                const currentDomainMeta =
                  REQUIREMENT_DOMAINS.find((d) => d.key === activeDomainKey) || REQUIREMENT_DOMAINS[0];
                const currentDomainReqs = viewModel.requirements.filter(
                  (r) => (r.domain || r.category) === currentDomainMeta.key
                );
                const domainClearCount = currentDomainReqs.filter(
                  (r) => r.state === "confirmed" || r.state === "odin_inferred"
                ).length;

                return (
                  <>
                    <div className={styles.activeDomainHeader}>
                      <div className={styles.activeDomainHeaderLeft}>
                        <span
                          className={`${styles.reqDomainNavIconBadge} ${styles.reqDomainNavHeaderIconBadge}`}
                          style={{ backgroundColor: currentDomainMeta.bgColor, color: currentDomainMeta.iconColor }}
                        >
                          {currentDomainMeta.icon}
                        </span>
                        <div>
                          <h3 className={styles.activeDomainTitle}>{currentDomainMeta.title}</h3>
                          <p className={styles.activeDomainDesc}>{currentDomainMeta.desc}</p>
                        </div>
                      </div>
                      <div className={styles.activeDomainHeaderRight}>
                        <span className={styles.activeDomainCompletenessPill}>
                          {domainClearCount}/{currentDomainReqs.length} clear
                        </span>
                      </div>
                    </div>

                    <div className={styles.activeDomainContent}>
                      <div className={styles.roomScheduleWrapper}>
                        <table className={styles.roomScheduleTable}>
                          <thead>
                            <tr>
                              <th>Space / Room</th>
                              <th style={{ width: "60px", textAlign: "center" }}>Qty</th>
                              <th style={{ width: "110px" }}>Approx. Area</th>
                              <th style={{ width: "100px" }}>Floor</th>
                              <th style={{ width: "110px" }}>Priority</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentDomainReqs.map((req) => {
                              const space = req.spaceValue;
                              const isSelected = selectedRequirementId === req.id;
                              const isExpanded = Boolean(expandedRoomIds[req.id]);

                              return (
                                <React.Fragment key={req.id}>
                                  <tr
                                    className={`${styles.roomScheduleRow} ${
                                      isSelected ? styles.roomScheduleRowSelected : ""
                                    }`}
                                    onClick={() => {
                                      setSelectedRequirementId(req.id);
                                      setExpandedRoomIds((prev) => ({ ...prev, [req.id]: !prev[req.id] }));
                                    }}
                                  >
                                    <td>
                                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", width: "100%" }}>
                                        <span className={styles.roomNameText}>{space?.name || req.label}</span>
                                        {space && (
                                          <button
                                            type="button"
                                            className={styles.expandToggleBtn}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setExpandedRoomIds((prev) => ({ ...prev, [req.id]: !prev[req.id] }));
                                            }}
                                            aria-label="Toggle details"
                                          >
                                            {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                    <td style={{ textAlign: "center", fontWeight: 600, color: "#0f172a" }}>
                                      {space?.quantity ?? 1}
                                    </td>
                                    <td style={{ color: "#475569" }}>{space?.approximateArea || "—"}</td>
                                    <td style={{ color: "#475569" }}>{space?.preferredFloor || "—"}</td>
                                    <td>
                                      <span className={`${styles.prioTag} ${styles[`prio_${req.priority}`]}`}>
                                        {(space?.priority || req.priority).toUpperCase()}
                                      </span>
                                    </td>
                                  </tr>

                                  {isExpanded && space && (
                                    <tr
                                      className={`${styles.roomInlineDetailRow} ${
                                        isSelected ? styles.roomInlineDetailRowSelected : ""
                                      }`}
                                    >
                                      <td colSpan={5}>
                                        <div className={styles.roomInlineDetailStrip}>
                                          <div className={styles.detailGrid}>
                                            {space.adjacency && space.adjacency.length > 0 && (
                                              <div className={styles.detailItemRow}>
                                                <span className={styles.detailLabel}>Adjacencies</span>
                                                <span className={styles.detailValue}>
                                                  {space.adjacency.join(" · ")}
                                                </span>
                                              </div>
                                            )}

                                            {space.furniture && space.furniture.length > 0 && (
                                              <div className={styles.detailItemRow}>
                                                <span className={styles.detailLabel}>Furniture</span>
                                                <span className={styles.detailValue}>
                                                  {space.furniture.join(" · ")}
                                                </span>
                                              </div>
                                            )}

                                            <div className={styles.detailItemRow}>
                                              <span className={styles.detailLabel}>Environment</span>
                                              <span className={styles.detailValue}>
                                                Natural light: {space.naturalLight || "High"} · Privacy: {space.privacy || "High"}
                                              </span>
                                            </div>

                                            {space.clientNotes && (
                                              <div className={styles.detailItemRow}>
                                                <span className={styles.detailLabel}>Client note</span>
                                                <span className={styles.detailValueMuted}>
                                                  &ldquo;{space.clientNotes}&rdquo;
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                );
              })()}
            </section>
          </div>
        )}

        {/* —— TAB 4: SITE & EVIDENCE ———————————————————————————————————————————— */}
        {activeTab === "evidence" && (
          <div className={styles.tabSectionGroup}>
            <EnquirySiteImagesCard
              title="Site Images & Evidence"
              images={resolvedImages}
              totalCount={resolvedImages.length}
            />
            <div id="enquiry-files" style={{ width: "100%" }}>
              <EnquiryProjectDocumentsSection
                title="Project Documents"
                documents={DEFAULT_PROJECT_DOCS}
              />
            </div>
          </div>
        )}

        {/* —— TAB 5: ACTIVITY ——————————————————————————————————————————————————— */}
        {activeTab === "activity" && (
          <div className={styles.activitySection}>
            <div className={styles.activityHeaderRow}>
              <div className={styles.activityTitleGroup}>
                <span className={styles.activityHeaderIcon}>
                  <ClockDuotoneIcon size={16} />
                </span>
                <h3 className={styles.activityTitle}>Activity Timeline</h3>
              </div>
              <span className={styles.countBadge}>4 events</span>
            </div>

            <div className={styles.activityCard}>
              <div className={styles.timelineTrack}>
                <div className={styles.timelineNode}>
                  <div className={`${styles.timelineNodeIconBox} ${styles.timelineNodeSuccess}`}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div className={styles.timelineNodeContent}>
                    <div className={styles.timelineNodeHeader}>
                      <strong className={styles.timelineNodeTitle}>Project Created & Active</strong>
                      <span className={styles.timelineNodeTimestamp}>Active</span>
                    </div>
                    <p className={styles.timelineNodeDesc}>
                      Enquiry requirement brief accepted and converted to live active project workspace.
                    </p>
                  </div>
                </div>

                <div className={styles.timelineNode}>
                  <div className={`${styles.timelineNodeIconBox} ${styles.timelineNodeSuccess}`}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div className={styles.timelineNodeContent}>
                    <div className={styles.timelineNodeHeader}>
                      <strong className={styles.timelineNodeTitle}>Proposal Accepted</strong>
                      <span className={styles.timelineNodeTimestamp}>24 Jul 2026</span>
                    </div>
                    <p className={styles.timelineNodeDesc}>
                      Commercial proposal and initial scope acknowledged by client.
                    </p>
                  </div>
                </div>

                <div className={styles.timelineNode}>
                  <div className={`${styles.timelineNodeIconBox} ${styles.timelineNodePrimary}`}>
                    <FileCheck2 size={16} />
                  </div>
                  <div className={styles.timelineNodeContent}>
                    <div className={styles.timelineNodeHeader}>
                      <strong className={styles.timelineNodeTitle}>Site Feasibility Verified</strong>
                      <span className={styles.timelineNodeTimestamp}>23 Jul 2026</span>
                    </div>
                    <p className={styles.timelineNodeDesc}>
                      Field survey contours and site evidence documents reviewed by ODIN.
                    </p>
                  </div>
                </div>

                <div className={styles.timelineNode}>
                  <div className={`${styles.timelineNodeIconBox} ${styles.timelineNodeSuccess}`}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div className={styles.timelineNodeContent}>
                    <div className={styles.timelineNodeHeader}>
                      <strong className={styles.timelineNodeTitle}>Enquiry Received</strong>
                      <span className={styles.timelineNodeTimestamp}>23 Jul 2026</span>
                    </div>
                    <p className={styles.timelineNodeDesc}>
                      New requirement brief submitted and logged into Kallisto pipeline.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {customRightPanel ?? (
        <ProjectUpdatesPanel
          projectId={projectId}
          layoutMode={layoutMode}
          open={updatesOpen}
          panelRef={updatesPanelRef ?? { current: null }}
          onClose={onUpdatesClose}
          initialUpdates={initialUpdates}
          updatesTitle={updatesTitle}
        />
      )}
    </div>
  );
}
