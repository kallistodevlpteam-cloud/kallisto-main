"use client";

import React, { useState, useEffect, type CSSProperties, type ReactNode, type RefObject } from "react";
import Link from "next/link";
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
  ArrowRight,
  Users,
  HardHat,
  Package,
  Banknote,
  Clock,
  TrendingUp,
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
  type ProjectUpdatesLayoutMode,
} from "@/lib/layout/project-dashboard-responsive-contract";
import type { UpdatePost } from "../hooks/use-project-updates-panel-state";
import {
  EnquiryDetailTabs,
  type EnquiryTabKey,
  UPCOMING_PROJECT_TABS,
  PROJECT_TABS,
  ENQUIRY_TABS,
} from "@/features/enquiries/detail/components/enquiry-detail-tabs";
import { OdinProjectBrief } from "@/features/enquiries/detail/components/odin-project-brief";
import { ClientPrioritiesBar } from "@/features/enquiries/detail/components/client-priorities-bar";
import { EnquirySiteImagesCard } from "@/features/enquiries/detail/components/enquiry-site-images-card";
import { EnquiryProjectDocumentsSection } from "@/features/enquiries/detail/components/enquiry-project-documents-section";
import { ProjectTeamWorkspace } from "@/features/projects/components/team/project-team-workspace";
import { ProjectBasicsWorkspace } from "@/features/projects/components/basics/project-basics-workspace";
import { ProjectMaterialsWorkspace } from "@/features/projects/components/materials/project-materials-workspace";
import { DocumentsTitleRowActions } from "./documents-title-row-actions";
import {
  buildEnquiryDetailViewModel,
  ClientHouseholdMember,
} from "@/features/enquiries/detail/services/enquiry-detail-view-model";
import { getMemberOdinInsightSummary } from "@/features/enquiries/detail/components/enquiry-detail-workspace";
import { ClientPriority, EnquiryRecord } from "@/features/enquiries/types/enquiry.types";
import { projectService } from "@/services/repositories/project-service";
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

const HANDS_LABOUR_CONTRACTORS = [
  {
    id: "kochi-civil",
    firmName: "Kochi Civil & Masonry Works",
    leadName: "Ramesh Kumar",
    role: "Civil & Structural Contractor Lead",
    avatar: "/assets/arjun-avatar.jpg",
    badge: "Grade A Civil",
    phone: "+91 98471 88234",
    email: "ramesh.civil@kallisto.partner",
    deployedWorkers: 14,
    activeOnSite: 12,
    dailyRate: "₹9,950 / day",
    trades: "Masonry (6), Helpers & Logistics (6), Plumbing (2)",
    compliance: "ESIC & Workman Compensation Verified",
  },
  {
    id: "apex-mep",
    firmName: "Apex MEP & Finishing Solutions",
    leadName: "Biju Varghese",
    role: "MEP & Joinery Contractor Lead",
    avatar: "/assets/david-avatar.jpg",
    badge: "Licensed MEP",
    phone: "+91 98472 99451",
    email: "biju.mep@kallisto.partner",
    deployedWorkers: 10,
    activeOnSite: 8,
    dailyRate: "₹8,700 / day",
    trades: "Carpentry & Joinery (4), Electrical (3), Painting (3)",
    compliance: "Class 1 Safety & Electrical Certified",
  },
];

const HANDS_TRADE_CREWS = [
  { trade: "Masons", count: "06 Workers", dailyRate: "₹5,400 / day", supervisor: "Ramesh K", contractorId: "kochi-civil", contractorName: "Kochi Civil", scope: "civil", attendance: "100% Present", isFull: true },
  { trade: "Carpenters", count: "04 Workers", dailyRate: "₹3,600 / day", supervisor: "Biju Varghese", contractorId: "apex-mep", contractorName: "Apex MEP", scope: "woodwork", attendance: "100% Present", isFull: true },
  { trade: "Electricians", count: "03 Workers", dailyRate: "₹2,700 / day", supervisor: "Sunil Kumar", contractorId: "apex-mep", contractorName: "Apex MEP", scope: "mep", attendance: "100% Present", isFull: true },
  { trade: "Plumbers", count: "02 Workers", dailyRate: "₹1,800 / day", supervisor: "Niyas M", contractorId: "kochi-civil", contractorName: "Kochi Civil", scope: "mep", attendance: "100% Present", isFull: true },
  { trade: "Painters", count: "03 Workers", dailyRate: "₹2,400 / day", supervisor: "Gireesh T", contractorId: "apex-mep", contractorName: "Apex MEP", scope: "finishing", attendance: "67% Present", isFull: false },
  { trade: "Helpers / Site Logistics", count: "06 Workers", dailyRate: "₹2,750 / day", supervisor: "Anitha Das (Site Engg)", contractorId: "kochi-civil", contractorName: "Kochi Civil", scope: "logistics", attendance: "83% Present", isFull: false },
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
  projectStatus?: string;
  status?: string;
  isUpcoming?: boolean;
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
  projectStatus,
  status,
  isUpcoming: isUpcomingProp,
  customRightPanel,
  inspirationImages,
  projectScopes,
  priorities,
}: ProjectOverviewCardProps = {}) {
  const [activeTab, setActiveTab] = useState<EnquiryTabKey>("overview");
  const [activeDomainKey, setActiveDomainKey] = useState<string>("room_programme");
  const [selectedRequirementId, setSelectedRequirementId] = useState<string | null>(null);
  const [expandedRoomIds, setExpandedRoomIds] = useState<Record<string, boolean>>({});
  const [handsContractorFilter, setHandsContractorFilter] = useState<string>("all");
  const [handsTradeFilter, setHandsTradeFilter] = useState<string>("all");
  const [handsStatusFilter, setHandsStatusFilter] = useState<string>("all");

  const lookedUpProject = projectId ? projectService.getProjectByIdSync("ws-default", projectId) : null;
  const resolvedStatus = (projectStatus || status || lookedUpProject?.status || "").toLowerCase();
  const isUpcoming = isUpcomingProp !== undefined ? isUpcomingProp : (resolvedStatus === "upcoming" || resolvedStatus === "new");

  useEffect(() => {
    if (isUpcoming && ["team", "materials", "hands", "basics", "activity"].includes(activeTab)) {
      setActiveTab("overview");
    }
  }, [isUpcoming, activeTab]);

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

          <EnquiryDetailTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            mode={isUpcoming ? "upcoming" : "project"}
            tabs={isUpcoming ? UPCOMING_PROJECT_TABS : PROJECT_TABS}
          />
        </div>

        {/* —— TAB 1: OVERVIEW —————————————————————————————————————————————————— */}
        {activeTab === "overview" && (
          <div className={styles.tabSectionGroup}>
            <OdinProjectBrief brief={viewModel.brief} />
            <ProjectStatCardsBar values={statValues} />
            {!isUpcoming && (
              <ProjectOverviewActivitySections
                projectId={projectId}
                onNavigateTab={setActiveTab}
              />
            )}
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

        {/* —— TAB 5: TEAM MEMBERS ————————————————————————————————————————————— */}
        {!isUpcoming && activeTab === "team" && (
          <div className={styles.tabSectionGroup}>
            <ProjectTeamWorkspace
              projectId={projectId}
              projectName={projectName || "Nila Residence"}
            />
          </div>
        )}

        {/* —— TAB 6: MATERIALS ————————————————————————————————————————————— */}
        {!isUpcoming && activeTab === "materials" && (
          <div className={styles.tabSectionGroup}>
            <ProjectMaterialsWorkspace
              projectId={projectId}
              projectName={projectName || "Nila Residence"}
            />
          </div>
        )}

        {/* —— TAB 7: HANDS ————————————————————————————————————————————— */}
        {!isUpcoming && activeTab === "hands" && (() => {
          const displayedCrews = HANDS_TRADE_CREWS.filter((crew) => {
            const matchesContractor =
              handsContractorFilter === "all" || crew.contractorId === handsContractorFilter;
            const matchesTrade =
              handsTradeFilter === "all" || crew.scope === handsTradeFilter;
            const matchesStatus =
              handsStatusFilter === "all" ||
              (handsStatusFilter === "100" ? crew.isFull : !crew.isFull);
            return matchesContractor && matchesTrade && matchesStatus;
          });

          const selectStyle: CSSProperties = {
            height: "36px",
            padding: "0 30px 0 12px",
            border: "none",
            outline: "none",
            borderRadius: "8px",
            backgroundColor: "#f1f5f9",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
            backgroundSize: "13px 13px",
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            fontSize: "12px",
            fontWeight: 600,
            color: "#334155",
            cursor: "pointer",
          };

          return (
            <div className={styles.tabSectionGroup}>
              {/* 1. Header Row */}
              <div className={styles.householdHeaderRow}>
                <div className={styles.householdTitleGroup}>
                  <h4 className={styles.householdHeading}>Hands Project Workforce &amp; Labor Tracking</h4>
                  <span className={styles.householdCountBadge}>₹18,650 Today&apos;s Spend</span>
                </div>
                <Link href="/hands" className={styles.editBriefBtn} style={{ textDecoration: "none" }}>
                  <span>Open Hands Workspace</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              {/* 2. Top Dropdown Filters Toolbar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  flexWrap: "wrap",
                  width: "100%",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  {/* Labour Contractor Dropdown */}
                  <select
                    value={handsContractorFilter}
                    onChange={(e) => setHandsContractorFilter(e.target.value)}
                    style={selectStyle}
                    aria-label="Filter by Labour Contractor"
                  >
                    <option value="all">All Contractors (02 Active on Site)</option>
                    <option value="kochi-civil">Kochi Civil &amp; Masonry — Ramesh Kumar</option>
                    <option value="apex-mep">Apex MEP &amp; Finishing — Biju Varghese</option>
                  </select>

                  {/* Trade Scope Dropdown */}
                  <select
                    value={handsTradeFilter}
                    onChange={(e) => setHandsTradeFilter(e.target.value)}
                    style={selectStyle}
                    aria-label="Filter by Trade Scope"
                  >
                    <option value="all">All Trade Scopes</option>
                    <option value="civil">Civil &amp; Masonry</option>
                    <option value="woodwork">Woodwork &amp; Joinery</option>
                    <option value="mep">Electrical &amp; Plumbing (MEP)</option>
                    <option value="finishing">Painting &amp; Finishing</option>
                    <option value="logistics">Site Logistics &amp; Helpers</option>
                  </select>

                  {/* Attendance Filter */}
                  <select
                    value={handsStatusFilter}
                    onChange={(e) => setHandsStatusFilter(e.target.value)}
                    style={selectStyle}
                    aria-label="Filter by Attendance"
                  >
                    <option value="all">All Attendance</option>
                    <option value="100">100% Present Today</option>
                    <option value="partial">Partial Present</option>
                  </select>
                </div>

                <div style={{ fontSize: "11.5px", fontWeight: 600, color: "#64748b" }}>
                  {displayedCrews.length} trade {displayedCrews.length === 1 ? "crew" : "crews"} active
                </div>
              </div>

              {/* 4. Financial Spend & Escrow 5-Card Strip */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "10px",
                  width: "100%",
                }}
              >
                {/* Total Labor Spent */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#64748b" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Total Labor Spent
                    </span>
                    <Wallet size={15} />
                  </div>
                  <span style={{ fontSize: "20px", fontWeight: 800, color: "#16a34a", letterSpacing: "-0.02em" }}>
                    ₹4.85L
                  </span>
                  <span style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                    <TrendingUp size={11} color="#16a34a" />
                    <span>33.5% of ₹14.50L</span>
                  </span>
                </div>

                {/* Today's Spend */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#64748b" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Today&apos;s Spend
                    </span>
                    <Banknote size={15} />
                  </div>
                  <span style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
                    ₹18,650
                  </span>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>22 of 24 on-site today</span>
                </div>

                {/* Settled via Escrow */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#64748b" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Settled via Escrow
                    </span>
                    <CheckCircle2 size={15} color="#16a34a" />
                  </div>
                  <span style={{ fontSize: "20px", fontWeight: 800, color: "#16a34a", letterSpacing: "-0.02em" }}>
                    ₹4.10L
                  </span>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>Verified &amp; Disbursed</span>
                </div>

                {/* Pending Sign-Off */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#64748b" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Pending Sign-Off
                    </span>
                    <Clock size={15} color="#d97706" />
                  </div>
                  <span style={{ fontSize: "20px", fontWeight: 800, color: "#d97706", letterSpacing: "-0.02em" }}>
                    ₹75,250
                  </span>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>Current cycle in review</span>
                </div>

                {/* Remaining Budget */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#64748b" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Remaining Budget
                    </span>
                    <ShieldCheck size={15} color="#7c3aed" />
                  </div>
                  <span style={{ fontSize: "20px", fontWeight: 800, color: "#7c3aed", letterSpacing: "-0.02em" }}>
                    ₹9.65L
                  </span>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>Available reserve</span>
                </div>
              </div>

              {/* 5. Attendance Summary Strip */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", width: "100%" }}>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 14px", textAlign: "center" }}>
                  <span style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", display: "block" }}>24</span>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginTop: "2px", display: "block" }}>
                    Total Labor
                  </span>
                </div>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 14px", textAlign: "center" }}>
                  <span style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", display: "block" }}>18</span>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginTop: "2px", display: "block" }}>
                    Active Today
                  </span>
                </div>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 14px", textAlign: "center" }}>
                  <span style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", display: "block" }}>04</span>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginTop: "2px", display: "block" }}>
                    On Leave
                  </span>
                </div>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 14px", textAlign: "center" }}>
                  <span style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", display: "block" }}>02</span>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginTop: "2px", display: "block" }}>
                    Not Assigned
                  </span>
                </div>
              </div>

              {/* 6. Filtered Trade Crews Breakdown */}
              {displayedCrews.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", width: "100%" }}>
                  {displayedCrews.map((tr, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        padding: "12px 14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <strong style={{ fontSize: "13px", color: "#0f172a" }}>{tr.trade}</strong>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#15803d" }}>{tr.dailyRate}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11.5px", color: "#64748b" }}>
                        <span>{tr.count}</span>
                        <span>Lead: {tr.supervisor}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "2px" }}>
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "#0369a1",
                            background: "#f0f9ff",
                            border: "1px solid #e0f2fe",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            width: "fit-content",
                          }}
                        >
                          {tr.attendance}
                        </div>
                        <span
                          style={{
                            fontSize: "10.5px",
                            fontWeight: 600,
                            color: "#475569",
                            background: "#f1f5f9",
                            padding: "2px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          By: {tr.contractorName}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px dashed #cbd5e1",
                    borderRadius: "10px",
                    padding: "24px",
                    textAlign: "center",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  <p style={{ margin: 0 }}>No trade crews match the selected filters.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setHandsContractorFilter("all");
                      setHandsTradeFilter("all");
                      setHandsStatusFilter("all");
                    }}
                    style={{
                      marginTop: "8px",
                      padding: "4px 12px",
                      background: "#0f172a",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "11.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {/* —— TAB 8: BASICS ————————————————————————————————————————————— */}
        {!isUpcoming && activeTab === "basics" && (
          <div className={styles.tabSectionGroup}>
            <ProjectBasicsWorkspace
              projectId={projectId}
              projectName={projectName || "Nila Residence"}
              builtUpArea={statValues?.builtUpArea}
              timeline={statValues?.duration}
            />
          </div>
        )}

        {/* —— TAB 9: ACTIVITY ——————————————————————————————————————————————————— */}
        {!isUpcoming && activeTab === "activity" && (
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
