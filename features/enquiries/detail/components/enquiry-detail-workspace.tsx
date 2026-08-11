"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Share2,
  Building2,
  MapPin,
  Calendar,
  Globe,
  FileCheck2,
  HelpCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  LayoutGrid,
  Trees,
  Cpu,
  Wallet,
  ShieldCheck,
  FileText,
  Briefcase,
  UserCheck,
  Sparkles,
  Smile,
  GitPullRequest,
  MessageSquare,
  Info,
  Users,
  Palette,
  MoreVertical,
  MoreHorizontal,
  QrCode,
  Copy,
  X,
} from "lucide-react";

import { RoutePageContainer } from "@/components/ui/route-page-container";
import {
  EnquiryRecord,
  EnquiryStage,
  EnquiryRequirement,
  EnquiryRequirementDomain,
} from "@/features/enquiries/types/enquiry.types";
import {
  buildEnquiryDetailViewModel,
  EnquiryDetailViewModel,
  ClientHouseholdMember,
} from "../services/enquiry-detail-view-model";
import { RequirementStrengthCard } from "./requirement-strength-card";

import styles from "./enquiry-detail-workspace.module.css";
import { OdinProjectBrief } from "./odin-project-brief";
import { EnquiryStatCardsBar } from "./enquiry-overview-card";
import { ClientPrioritiesBar } from "./client-priorities-bar";
import { EnquiryProjectScopeSection } from "./enquiry-project-scope-section";
import { EnquirySiteImagesCard } from "./enquiry-site-images-card";
import { EnquiryProjectDocumentsSection } from "./enquiry-project-documents-section";
import { EnquiryClarificationComposer } from "./enquiry-clarification-composer";
import { EnquiryDetailTabs, EnquiryTabKey, resolveValidTabKey } from "./enquiry-detail-tabs";
import { OdinInsightsPanel } from "./odin-insights-panel";
import { deriveContextualOdinInsights } from "@/features/enquiries/services/enquiry-intelligence";

export function EnquiryDetailSkeleton() {
  return (
    <div className={styles.enquiryWorkspace}>
      <RoutePageContainer className="project-dashboard-page" title="Loading enquiry..." showHeading={false}>
        <div style={{ padding: "40px", color: "#64748b" }}>Loading enquiry details...</div>
      </RoutePageContainer>
    </div>
  );
}

const GALLERY_IMAGES = [
  { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", caption: "Exterior Elevation Reference" },
  { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80", caption: "Living Area & Double-height Volume" },
  { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80", caption: "Teak Joinery & Courtyard View" },
  { url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80", caption: "Master Suite & Balcony Connection" },
];

const DEFAULT_ENQUIRY_RECORD: EnquiryRecord = {
  id: "enq-2026-0486",
  title: "Villa Design Consultation",
  requirementSummary:
    "Ananya Builders is seeking a residential fit-out for approximately 2,800–3,200 sq ft in Kochi. The current requirement covers space planning, interior fit-out and MEP coordination with a ₹40L–₹60L budget and a six-month target. The project is suitable for review, but budget coverage and expected deliverables should be clarified before proposal preparation.",
  clientName: "Ananya Builders",
  location: "Kochi",
  thumbnailUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  source: "website",
  status: "active",
  stage: "new",
  projectType: "residential",
  budgetMin: 4000000,
  budgetMax: 6000000,
  receivedAt: "2026-07-23T10:00:00Z",
  nextAction: { type: "review_enquiry", label: "Review Requirements" },
  enquiryRef: "ENQ-2026-0486",
  budget: "₹40L – ₹60L",
  timeline: "Within 6 Months",
  builtUpArea: "2,800 – 3,200 sq ft",
};

function getReqCategoryIcon(category: string) {
  const cat = (category || "").toLowerCase();
  if (cat.includes("project")) return Building2;
  if (cat.includes("client")) return Users;
  if (cat.includes("style") || cat.includes("vision")) return Palette;
  if (cat.includes("budget") || cat.includes("commercial")) return Wallet;
  if (cat.includes("site") || cat.includes("outdoor")) return MapPin;
  if (cat.includes("timeline")) return Calendar;
  return FileText;
}

function getClientContextSectionIcon(iconName: string) {
  switch (iconName) {
    case "Users":
      return Users;
    case "Smile":
      return Smile;
    case "UserCheck":
      return UserCheck;
    case "MessageSquare":
      return MessageSquare;
    default:
      return Users;
  }
}

export function buildEnquiriesFromProjects(projects: Array<Record<string, unknown>>): EnquiryRecord[] {
  if (!projects || projects.length === 0) return [DEFAULT_ENQUIRY_RECORD];
  return projects.map((proj, idx) => {
    const id = String(proj.id || proj.enquiryRef || `enq-${idx + 1}`);
    const title = String(proj.name || proj.title || "Villa Design Consultation");
    const clientName = String(proj.client || proj.clientName || "Ananya Builders");
    const location = String(proj.location || "Kochi");
    const projectType = String(proj.type || proj.projectType || "residential").toLowerCase();
    const normalizedType = projectType.includes("comm") ? "commercial" : "residential";

    return {
      id,
      title,
      requirementSummary: String(proj.summary || proj.description || DEFAULT_ENQUIRY_RECORD.requirementSummary),
      clientName,
      location,
      thumbnailUrl: String(proj.thumbnailUrl || DEFAULT_ENQUIRY_RECORD.thumbnailUrl),
      source: "website",
      status: "active",
      stage: "new",
      projectType: normalizedType as any,
      budgetMin: 4000000,
      budgetMax: 6000000,
      receivedAt: String(proj.createdAt || proj.receivedAt || DEFAULT_ENQUIRY_RECORD.receivedAt),
      nextAction: { type: "review_enquiry", label: "Review Requirements" },
      enquiryRef: String(proj.enquiryRef || proj.code || `ENQ-2026-${String(idx + 486).padStart(4, "0")}`),
      budget: String(proj.budget || "₹40L – ₹60L"),
      timeline: String(proj.timeline || "Within 6 Months"),
      builtUpArea: String(proj.area || "2,800 – 3,200 sq ft"),
    };
  });
}

const REQUIREMENT_DOMAIN_ORDER: Array<{
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

const CLIENT_DOMAIN_ORDER: Array<{
  key: string;
  title: string;
  shortTitle: string;
  desc: string;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
}> = [
  { key: "project_client", title: "PROJECT & CLIENT PROFILE", shortTitle: "Project & Client", desc: "Project purpose, user profile, family size, team structure & stakeholders.", icon: <UserCheck size={13} strokeWidth={2.2} />, bgColor: "#e0f2fe", iconColor: "#0284c7" },
  { key: "vision_style", title: "VISION & AESTHETIC STYLE", shortTitle: "Vision & Style", desc: "Architectural & interior style preferences, materials, colours & light priority.", icon: <Sparkles size={13} strokeWidth={2.2} />, bgColor: "#fef3c7", iconColor: "#d97706" },
  { key: "lifestyle", title: "LIFESTYLE & WORKING PATTERNS", shortTitle: "Lifestyle", desc: "Work-from-home acoustic needs, daily routines & social entertaining patterns.", icon: <Smile size={13} strokeWidth={2.2} />, bgColor: "#dcfce7", iconColor: "#16a34a" },
  { key: "decision_making", title: "DECISION MAKING & SIGN-OFF", shortTitle: "Decision Making", desc: "Primary decision maker, approval process & budget approval authority.", icon: <GitPullRequest size={13} strokeWidth={2.2} />, bgColor: "#f3e8ff", iconColor: "#9333ea" },
  { key: "communication", title: "COMMUNICATION & REVIEW METHOD", shortTitle: "Communication", desc: "Preferred channels, meeting cadence & document-sharing preferences.", icon: <MessageSquare size={13} strokeWidth={2.2} />, bgColor: "#ffe4e6", iconColor: "#e11d48" },
];

interface DomainColumnDef {
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  render: (req: EnquiryRequirement) => React.ReactNode;
}

const DOMAIN_TABLE_COLUMNS: Record<string, DomainColumnDef[]> = {
  exterior_facade: [
    { header: "Requirement", width: "28%", render: (r) => <span className={styles.roomNameText}>{r.label}</span> },
    { header: "Specification", width: "46%", render: (r) => <span style={{ color: "#334155", lineHeight: "1.4" }}>{String(r.value || "—")}</span> },
    { header: "Priority", width: "12%", render: (r) => <span className={`${styles.prioTag} ${styles[`prio_${r.priority}`]}`}>{r.priority.toUpperCase()}</span> },
    { header: "Status", width: "14%", align: "right", render: (r) => <span className={`${styles.reqStateBadge} ${styles[`state_${r.state}`]}`}>{r.state.replace("_", " ")}</span> },
  ],
  outdoor_landscape: [
    { header: "Requirement", width: "28%", render: (r) => <span className={styles.roomNameText}>{r.label}</span> },
    { header: "Specification", width: "46%", render: (r) => <span style={{ color: "#334155", lineHeight: "1.4" }}>{String(r.value || "—")}</span> },
    { header: "Priority", width: "12%", render: (r) => <span className={`${styles.prioTag} ${styles[`prio_${r.priority}`]}`}>{r.priority.toUpperCase()}</span> },
    { header: "Status", width: "14%", align: "right", render: (r) => <span className={`${styles.reqStateBadge} ${styles[`state_${r.state}`]}`}>{r.state.replace("_", " ")}</span> },
  ],
  site: [
    { header: "Parameter", width: "24%", render: (r) => <span className={styles.roomNameText}>{r.label}</span> },
    { header: "Current Value", width: "42%", render: (r) => <span style={{ color: "#334155" }}>{String(r.value || "—")}</span> },
    { header: "Source", width: "12%", render: (r) => <span className={styles.reqCategoryBadge}>{r.source.toUpperCase()}</span> },
    { header: "Priority", width: "10%", render: (r) => <span className={`${styles.prioTag} ${styles[`prio_${r.priority}`]}`}>{r.priority.toUpperCase()}</span> },
    { header: "Status", width: "12%", align: "right", render: (r) => <span className={`${styles.reqStateBadge} ${styles[`state_${r.state}`]}`}>{r.state.replace("_", " ")}</span> },
  ],
  technical: [
    { header: "System", width: "22%", render: (r) => <span className={styles.roomNameText}>{r.label}</span> },
    { header: "Requirement / Specification", width: "48%", render: (r) => <span style={{ color: "#334155", lineHeight: "1.4" }}>{String(r.value || "—")}</span> },
    { header: "Priority", width: "12%", render: (r) => <span className={`${styles.prioTag} ${styles[`prio_${r.priority}`]}`}>{r.priority.toUpperCase()}</span> },
    { header: "Status", width: "18%", align: "right", render: (r) => <span className={`${styles.reqStateBadge} ${styles[`state_${r.state}`]}`}>{r.state.replace("_", " ")}</span> },
  ],
  budget_commercial: [
    { header: "Item", width: "26%", render: (r) => <span className={styles.roomNameText}>{r.label}</span> },
    { header: "Current Value", width: "34%", render: (r) => <span style={{ color: "#0f172a", fontWeight: 600 }}>{String(r.value || "—")}</span> },
    { header: "Coverage / Notes", width: "20%", render: (r) => <span style={{ color: "#64748b", fontSize: "12px" }}>{r.source === "client" ? "Client stated" : "Coverage pending confirmation"}</span> },
    { header: "Priority", width: "8%", render: (r) => <span className={`${styles.prioTag} ${styles[`prio_${r.priority}`]}`}>{r.priority.toUpperCase()}</span> },
    { header: "Status", width: "12%", align: "right", render: (r) => <span className={`${styles.reqStateBadge} ${styles[`state_${r.state}`]}`}>{r.state.replace("_", " ")}</span> },
  ],
  timeline: [
    { header: "Milestone / Constraint", width: "30%", render: (r) => <span className={styles.roomNameText}>{r.label}</span> },
    { header: "Target / Value", width: "42%", render: (r) => <span style={{ color: "#334155", fontWeight: 600 }}>{String(r.value || "—")}</span> },
    { header: "Priority", width: "12%", render: (r) => <span className={`${styles.prioTag} ${styles[`prio_${r.priority}`]}`}>{r.priority.toUpperCase()}</span> },
    { header: "Status", width: "16%", align: "right", render: (r) => <span className={`${styles.reqStateBadge} ${styles[`state_${r.state}`]}`}>{r.state.replace("_", " ")}</span> },
  ],
  regulatory: [
    { header: "Requirement", width: "26%", render: (r) => <span className={styles.roomNameText}>{r.label}</span> },
    { header: "Current Status", width: "42%", render: (r) => <span style={{ color: "#334155", lineHeight: "1.4" }}>{String(r.value || "—")}</span> },
    { header: "Responsibility", width: "14%", render: (r) => <span style={{ color: "#64748b", fontSize: "11.5px" }}>{r.source === "client" ? "Client" : "SP Architect TBD"}</span> },
    { header: "Priority", width: "8%", render: (r) => <span className={`${styles.prioTag} ${styles[`prio_${r.priority}`]}`}>{r.priority.toUpperCase()}</span> },
    { header: "Status", width: "10%", align: "right", render: (r) => <span className={`${styles.reqStateBadge} ${styles[`state_${r.state}`]}`}>{r.state.replace("_", " ")}</span> },
  ],
  documentation: [
    { header: "Document", width: "26%", render: (r) => <span className={styles.roomNameText}>{r.label}</span> },
    { header: "Availability", width: "38%", render: (r) => <span style={{ color: "#334155" }}>{String(r.value || "Not received")}</span> },
    { header: "Source", width: "12%", render: (r) => <span className={styles.reqCategoryBadge}>{r.source.toUpperCase()}</span> },
    { header: "Verification", width: "12%", render: (r) => <span style={{ color: r.state === "confirmed" ? "#16a34a" : "#d97706", fontWeight: 600, fontSize: "11.5px" }}>{r.state === "confirmed" ? "Available" : "Needs review"}</span> },
    { header: "Status", width: "12%", align: "right", render: (r) => <span className={`${styles.reqStateBadge} ${styles[`state_${r.state}`]}`}>{r.state.replace("_", " ")}</span> },
  ],
  scope: [
    { header: "Service", width: "28%", render: (r) => <span className={styles.roomNameText}>{r.label}</span> },
    { header: "Expectation", width: "44%", render: (r) => <span style={{ color: "#334155", lineHeight: "1.4" }}>{String(r.value || "—")}</span> },
    { header: "Priority", width: "12%", render: (r) => <span className={`${styles.prioTag} ${styles[`prio_${r.priority}`]}`}>{r.priority.toUpperCase()}</span> },
    { header: "Status", width: "16%", align: "right", render: (r) => <span className={`${styles.reqStateBadge} ${styles[`state_${r.state}`]}`}>{r.state.replace("_", " ")}</span> },
  ],
};

const DEFAULT_DOMAIN_COLUMNS: DomainColumnDef[] = [
  { header: "Requirement", width: "30%", render: (r) => <span className={styles.roomNameText}>{r.label}</span> },
  { header: "Specification / Details", width: "42%", render: (r) => <span style={{ color: "#334155", lineHeight: "1.4" }}>{String(r.value || "—")}</span> },
  { header: "Priority", width: "12%", render: (r) => <span className={`${styles.prioTag} ${styles[`prio_${r.priority}`]}`}>{r.priority.toUpperCase()}</span> },
  { header: "Status", width: "16%", align: "right", render: (r) => <span className={`${styles.reqStateBadge} ${styles[`state_${r.state}`]}`}>{r.state.replace("_", " ")}</span> },
];

export function GenericDomainScheduleTable({
  domainKey,
  requirements,
  selectedRequirementId,
  onSelectRequirement,
}: {
  domainKey: string;
  requirements: EnquiryRequirement[];
  selectedRequirementId: string | null;
  onSelectRequirement: (id: string) => void;
}) {
  const columns = DOMAIN_TABLE_COLUMNS[domainKey] || DEFAULT_DOMAIN_COLUMNS;

  return (
    <div className={styles.roomScheduleWrapper}>
      <table className={styles.roomScheduleTable}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{
                  width: col.width,
                  textAlign: col.align || "left",
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {requirements.map((req) => {
            const isSelected = selectedRequirementId === req.id;
            return (
              <tr
                key={req.id}
                className={`${styles.roomScheduleRow} ${
                  isSelected ? styles.roomScheduleRowSelected : ""
                }`}
                onClick={() => onSelectRequirement(req.id)}
              >
                {columns.map((col, idx) => (
                  <td key={idx} style={{ textAlign: col.align || "left" }}>
                    {col.render(req)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function EnquiryDetailWorkspace({
  enquiryId = "enq-2026-0486",
}: {
  enquiryId?: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [enquiry, setEnquiry] = useState<EnquiryRecord>(DEFAULT_ENQUIRY_RECORD);
  const [stage, setStage] = useState<EnquiryStage>(DEFAULT_ENQUIRY_RECORD.stage || "new");
  const [selectedRequirementId, setSelectedRequirementId] = useState<string | null>(null);
  const [activeDomainKey, setActiveDomainKey] = useState<string>("room_programme");
  const [expandedRoomIds, setExpandedRoomIds] = useState<Record<string, boolean>>({});
  const [clarificationText, setClarificationText] = useState<string>("");
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>("owner-1");
  const [detailHouseholdMember, setDetailHouseholdMember] = useState<ClientHouseholdMember | null>(null);

  const activeTab: EnquiryTabKey = resolveValidTabKey(searchParams.get("tab"));

  const rawDomain = searchParams.get("domain");
  useEffect(() => {
    if (rawDomain && REQUIREMENT_DOMAIN_ORDER.some((d) => d.key === rawDomain)) {
      setActiveDomainKey(rawDomain);
    }
  }, [rawDomain]);

  const handleSelectDomain = (domainKey: string) => {
    setActiveDomainKey(domainKey);
    const params = new URLSearchParams(searchParams.toString());
    params.set("domain", domainKey);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const toggleRoomExpand = (id: string) => {
    setExpandedRoomIds((prev: Record<string, boolean>) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAppendToClarification = (textToAppend: string) => {
    setClarificationText((prev) => {
      if (!prev.trim()) return textToAppend;
      if (prev.includes(textToAppend)) return prev;
      return `${prev.trim()}\n\n${textToAppend}`;
    });
  };

  useEffect(() => {
    let cancelled = false;
    fetch("/api/projects?character=enq", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as {
          status: string;
          projects: Array<Record<string, unknown>>;
        };
        if (!response.ok || payload.status !== "ok") {
          throw new Error("Backend projects request failed");
        }
        const records = buildEnquiriesFromProjects(payload.projects as never[]);
        const match = records.find((record) => record.id === enquiryId);
        return match ?? null;
      })
      .then((match) => {
        if (cancelled || !match) return;
        setEnquiry(match);
        if (match.stage) setStage(match.stage);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [enquiryId]);

  useEffect(() => {
    if (enquiry.stage) {
      setStage(enquiry.stage);
    }
  }, [enquiry]);

  const viewModel = buildEnquiryDetailViewModel({ enquiry, providerContext: {} });
  const { header } = viewModel;

  function handleStageChange(newStage: EnquiryStage) {
    setStage(newStage);
    setEnquiry((prev) => ({ ...prev, stage: newStage }));
  }

  function handleSendClarification(msg: string) {
    handleStageChange("clarification");
  }

  function handleViewAllFiles() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "evidence");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  if (enquiryId === "invalid-id") {
    return (
      <div className="workspace-container">
        <div className="route-state-box route-state-error">
          <p>Enquiry not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.enquiryWorkspace}>
      <RoutePageContainer
        className="project-dashboard-page"
        title={header.title}
        showHeading={false}
      >
        <div className={styles.enquiryLayout}>
          {/* Left main content column (LeftWorkspace) */}
          <main className={styles.enquiryMain}>
            {/* Top Project Information Header */}
            <div className={styles.headerBlock}>
              <div className={styles.titleRow}>
                <h1 className={styles.projectTitle}>{header.title}</h1>
                <button
                  type="button"
                  className="title-share-btn"
                  aria-label={`Share ${header.title}`}
                  title={`Share ${header.title}`}
                >
                  <Share2 size={16} strokeWidth={1.8} />
                </button>
              </div>

              <div className={styles.chipsMetaRow}>
                <span className={styles.typeChip}>
                  <Building2 size={13} />
                  <span>{header.projectType}</span>
                </span>
                <span
                  className={`${styles.stageChip} ${
                    stage === "accepted"
                      ? styles.stageAccepted
                      : stage === "clarification"
                      ? styles.stageClarification
                      : stage === "rejected"
                      ? styles.stageRejected
                      : styles.stageNew
                  }`}
                >
                  <span className={styles.stageDot} />
                  <span style={{ textTransform: "capitalize" }}>{stage}</span>
                </span>
              </div>

              <div className={styles.subMetaRow}>
                <span className={styles.metaItem}>
                  <MapPin size={13} />
                  <span>{header.location}</span>
                </span>
                <span className={styles.metaDot}>•</span>
                <span className={styles.metaItem}>
                  <Calendar size={13} />
                  <span>Received {header.receivedDate}</span>
                </span>
                <span className={styles.metaDot}>•</span>
                <span className={styles.metaItem}>
                  <Globe size={13} />
                  <span style={{ textTransform: "capitalize" }}>Via {header.source}</span>
                </span>
                {header.enquiryRef && (
                  <>
                    <span className={styles.metaDot}>•</span>
                    <span className={styles.refCode}>{header.enquiryRef}</span>
                  </>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <EnquiryDetailTabs activeTab={activeTab} />

            {/* Active Tab Scroll Area */}
            <div className={styles.mainScrollArea}>

            {/* ── TAB 1: OVERVIEW ────────────────────────────────────────────────── */}
            {activeTab === "overview" && (
              <div className={styles.tabSectionGroup}>
                <OdinProjectBrief brief={viewModel.brief} />
                <EnquiryStatCardsBar
                  values={{
                    projectType: viewModel.snapshot.projectType,
                    duration: viewModel.snapshot.duration,
                    builtUpArea: viewModel.snapshot.builtUpArea,
                    budget: viewModel.snapshot.budget,
                    client: viewModel.snapshot.client,
                    budgetCoverageStatus: viewModel.snapshot.budgetCoverageStatus,
                    areaCoverageStatus: viewModel.snapshot.areaCoverageStatus,
                  }}
                />
                <ClientPrioritiesBar priorities={viewModel.priorities} />
                <EnquiryProjectScopeSection
                  categories={viewModel.scopeGroups.map((g, idx) => ({
                    id: `cat-${idx + 1}`,
                    title: g.title,
                    items: g.items.map((i) => i.label),
                  }))}
                  unconfirmedItems={viewModel.unconfirmedScope}
                />
              </div>
            )}

            {/* ── TAB 2: REQUIREMENTS (THREE-PANE WORKSPACE) ───────────────────────── */}
            {activeTab === "requirements" && (
              <div className={styles.requirementsWorkspace}>
                {/* PANE 1: Requirement Domain Navigator (Left, ~210px) */}
                <aside className={styles.reqDomainNav} aria-label="Requirement Domains">
                  <div className={styles.reqDomainNavHeader}>
                    <span className={styles.reqDomainNavTitle}>REQUIREMENTS</span>
                    <span className={styles.reqDomainNavSubtitle}>
                      {
                        viewModel.requirements.filter((r) =>
                          REQUIREMENT_DOMAIN_ORDER.some((d) => d.key === (r.domain || r.category))
                        ).length
                      }{" "}
                      delivery specs
                    </span>
                  </div>

                  <div className={styles.reqDomainNavList}>
                    {REQUIREMENT_DOMAIN_ORDER.map((d) => {
                      const domainReqs = viewModel.requirements.filter(
                        (r) => (r.domain || r.category) === d.key
                      );
                      if (domainReqs.length === 0) return null;

                      const clearCount = domainReqs.filter(
                        (r) => r.state === "confirmed" || r.state === "odin_inferred"
                      ).length;
                      const totalCount = domainReqs.length;
                      const hasBlocker = domainReqs.some(
                        (r) => r.state === "needs_clarification" || r.state === "needs_verification"
                      );
                      const isActive = activeDomainKey === d.key;

                      return (
                        <button
                          key={d.key}
                          type="button"
                          className={`${styles.reqDomainNavItem} ${isActive ? styles.reqDomainNavItemActive : ""}`}
                          onClick={() => handleSelectDomain(d.key)}
                        >
                          <div className={styles.reqDomainNavLabelRow}>
                            <span
                              className={styles.reqDomainNavIconBadge}
                              style={{ color: d.iconColor }}
                            >
                              {d.icon}
                            </span>
                            <span className={styles.reqDomainNavLabel}>{d.shortTitle}</span>
                            {hasBlocker && <span className={styles.reqDomainNavBlockerDot} title="Needs attention" />}
                          </div>
                          <span className={styles.reqDomainNavBadge}>
                            {clearCount}/{totalCount}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </aside>

                {/* PANE 2: Active Requirement Domain Workspace (Center, Master-Detail) */}
                <section className={styles.activeDomainWorkspace} aria-label="Active Domain Workspace">
                  {(() => {
                    const currentDomainMeta =
                      REQUIREMENT_DOMAIN_ORDER.find((d) => d.key === activeDomainKey) ||
                      REQUIREMENT_DOMAIN_ORDER[0];

                    const currentDomainReqs = viewModel.requirements.filter(
                      (r) => (r.domain || r.category) === currentDomainMeta.key
                    );

                    const domainClearCount = currentDomainReqs.filter(
                      (r) => r.state === "confirmed" || r.state === "odin_inferred"
                    ).length;

                    return (
                      <>
                        <div className={styles.activeDomainHeader}>
                          <div className={styles.activeDomainHeaderLeft} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span
                              className={`${styles.reqDomainNavIconBadge} ${styles.reqDomainNavHeaderIconBadge}`}
                              style={{ color: currentDomainMeta.iconColor }}
                            >
                              {React.cloneElement(currentDomainMeta.icon as React.ReactElement<{ size?: number }>, { size: 16 })}
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
                          {currentDomainMeta.key === "room_programme" ? (
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
                                            toggleRoomExpand(req.id);
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
                                                    toggleRoomExpand(req.id);
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

                                                {(req.state === "needs_clarification" ||
                                                  req.state === "needs_verification" ||
                                                  req.state === "partial") && (
                                                  <div className={styles.inlineDetailActions}>
                                                    <button
                                                      type="button"
                                                      className={styles.inlineTextActionBtn}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAppendToClarification(
                                                          `Please clarify requirement specifications for ${space.name}.`
                                                        );
                                                      }}
                                                    >
                                                      Add question to clarification
                                                    </button>
                                                  </div>
                                                )}
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
                          ) : (
                            <GenericDomainScheduleTable
                              domainKey={currentDomainMeta.key}
                              requirements={currentDomainReqs}
                              selectedRequirementId={selectedRequirementId}
                              onSelectRequirement={(id) =>
                                setSelectedRequirementId((prev) => (prev === id ? null : id))
                              }
                            />
                          )}
                        </div>
                      </>
                    );
                  })()}
                </section>
              </div>
            )}

            {/* ── TAB 3: SITE & EVIDENCE ──────────────────────────────────────────── */}
            {activeTab === "evidence" && (
              <div className={styles.tabSectionGroup}>
                <div className={styles.sectionCard}>
                  <h3 className={styles.cardHeading}>SITE IMAGES & EVIDENCE</h3>
                  <EnquirySiteImagesCard title="All Site Images" totalCount={7} />
                </div>
                <div className={styles.sectionCard} id="enquiry-files">
                  <h3 className={styles.cardHeading}>PROJECT DOCUMENTS</h3>
                  <EnquiryProjectDocumentsSection />
                </div>
              </div>
            )}

            {/* ── TAB 4: CLIENT CONTEXT ───────────────────────────────────────────── */}
            {activeTab === "client" && (
              <div className={styles.tabSectionGroup}>
                {/* ── CLIENT & HOUSEHOLD ── */}
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
                    <div
                      key={member.id}
                      className={styles.morigCardShell}
                      onClick={() => setDetailHouseholdMember(member)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setDetailHouseholdMember(member);
                        }
                      }}
                    >
                      {/* ── PHOTO CONTAINER WITH DARK GRADIENT OVERLAY ── */}
                      <div
                        className={styles.morigPhotoBox}
                        style={{
                          backgroundImage: member.photoUrl
                            ? `linear-gradient(180deg, rgba(0,0,0,0) 25%, rgba(15,23,42,0.82) 62%, rgba(15,23,42,0.98) 100%), url(${member.photoUrl})`
                            : undefined,
                        }}
                      >
                        {!member.photoUrl && (
                          <div className={styles.morigFallbackAvatar}>
                            {member.avatarInitials}
                          </div>
                        )}

                        {/* ── BOTTOM OVERLAY CONTENT ── */}
                        <div className={styles.morigOverlayContent}>
                          {/* Member Name */}
                          <h5 className={styles.morigName}>{member.name}</h5>

                          {/* Description line */}
                          <p className={styles.morigDesc}>
                            {member.relationship}{member.age ? ` · ${member.age} yrs` : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── HOUSEHOLD MEMBER DETAILS INSPECTOR MODAL ── */}
                {detailHouseholdMember && (
                  <div
                    className={styles.householdModalOverlay}
                    onClick={() => setDetailHouseholdMember(null)}
                  >
                    <div
                      className={styles.householdModalCard}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className={styles.modalHeader}>
                        <div className={styles.modalHeaderMeta}>
                          <div className={styles.modalAvatar}>
                            {detailHouseholdMember.avatarInitials}
                          </div>
                          <div>
                            <h4 className={styles.modalName}>{detailHouseholdMember.name}</h4>
                            <p className={styles.modalSubhead}>
                              {detailHouseholdMember.relationship}
                              {detailHouseholdMember.age ? ` · ${detailHouseholdMember.age}` : ""}
                              {detailHouseholdMember.occupation ? ` · ${detailHouseholdMember.occupation}` : ""}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={styles.modalCloseBtn}
                          onClick={() => setDetailHouseholdMember(null)}
                          aria-label="Close details"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <div className={styles.modalBody}>
                        <dl className={styles.householdDetailGrid}>
                          {(detailHouseholdMember.keyNeeds || []).length > 0 && (
                            <>
                              <dt className={styles.hdLabel}>Design Needs</dt>
                              <dd className={styles.hdValue}>
                                {detailHouseholdMember.keyNeeds.join(" · ")}
                              </dd>
                            </>
                          )}
                          {detailHouseholdMember.workPattern && (
                            <>
                              <dt className={styles.hdLabel}>Work / Study</dt>
                              <dd className={styles.hdValue}>{detailHouseholdMember.workPattern}</dd>
                            </>
                          )}
                          {detailHouseholdMember.bedroomRequirement && (
                            <>
                              <dt className={styles.hdLabel}>Bedroom</dt>
                              <dd className={styles.hdValue}>{detailHouseholdMember.bedroomRequirement}</dd>
                            </>
                          )}
                          {detailHouseholdMember.privacyLevel && (
                            <>
                              <dt className={styles.hdLabel}>Privacy</dt>
                              <dd className={styles.hdValue}>{detailHouseholdMember.privacyLevel}</dd>
                            </>
                          )}
                          {detailHouseholdMember.accessibilityNeeds && (
                            <>
                              <dt className={styles.hdLabel}>Accessibility</dt>
                              <dd className={styles.hdValue}>{detailHouseholdMember.accessibilityNeeds}</dd>
                            </>
                          )}
                          {detailHouseholdMember.decisionRole && (
                            <>
                              <dt className={styles.hdLabel}>Decision Role</dt>
                              <dd className={styles.hdValue}>{detailHouseholdMember.decisionRole}</dd>
                            </>
                          )}
                          {detailHouseholdMember.specialNotes && (
                            <>
                              <dt className={styles.hdLabel}>Special Notes</dt>
                              <dd className={styles.hdValue}>{detailHouseholdMember.specialNotes}</dd>
                            </>
                          )}
                        </dl>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── CLIENT CONTEXT & PRIORITIES ── */}
                <ClientPrioritiesBar priorities={viewModel.priorities} />

                {(viewModel.clientContextSections || []).map((sec) => {
                  const IconComp = getClientContextSectionIcon(sec.iconName);
                  const clearCount = sec.items.filter(
                    (item) => item.state === "confirmed" || item.state === "odin_inferred"
                  ).length;

                  return (
                    <div key={sec.key} className={styles.sectionCard}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span
                            className={`${styles.reqDomainNavIconBadge} ${styles.reqDomainNavHeaderIconBadge}`}
                            style={{ color: sec.iconColor }}
                          >
                            <IconComp size={16} />
                          </span>
                          <div>
                            <h3 className={styles.cardHeading}>{sec.title}</h3>
                            <p className={styles.cardDesc}>{sec.subtitle}</p>
                          </div>
                        </div>
                        <span className={styles.activeDomainCompletenessPill}>
                          {clearCount}/{sec.items.length} clear
                        </span>
                      </div>

                      <div className={styles.reqCardsGrid}>
                        {sec.items.map((item) => {
                          const CategoryIcon = getReqCategoryIcon(item.category);

                          return (
                            <div
                              key={item.id}
                              className={`${styles.cardShell} ${
                                selectedRequirementId === item.id ? styles.cardShellSelected : ""
                              }`}
                              onClick={() =>
                                setSelectedRequirementId((prev) => (prev === item.id ? null : item.id))
                              }
                              role="button"
                              tabIndex={0}
                              aria-selected={selectedRequirementId === item.id}
                            >
                              <div className={styles.headerRow}>
                                <div className={styles.headerTitleGroup}>
                                  <div className={styles.iconBox}>
                                    <CategoryIcon size={13} className={styles.headerIcon} />
                                  </div>
                                  <h4 className={styles.cardTitle}>{item.label}</h4>
                                  <span className={`${styles.prioTag} ${styles[`prio_${item.priority}`]}`}>
                                    {item.priority.toUpperCase()}
                                  </span>
                                </div>
                                <span className={`${styles.reqStateBadge} ${styles[`state_${item.state}`]}`}>
                                  {item.state.replace("_", " ")}
                                </span>
                              </div>

                              {item.value ? (
                                <div className={styles.innerCard}>
                                  <p className={styles.reqValue}>{String(item.value)}</p>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── TAB 6: ODIN INTELLIGENCE ───────────────────────────────────────── */}
            {activeTab === "intelligence" && (
              <div className={styles.tabSectionGroup}>
                <div className={styles.sectionCard}>
                  <h3 className={styles.cardHeading}>FULL ODIN INTELLIGENCE SCORE BREAKDOWN</h3>
                  <div className={styles.intelligenceDetailsGrid}>
                    <div className={styles.detailBox}>
                      <span className={styles.detailTitle}>Requirement Strength</span>
                      <span className={styles.detailValue}>
                        {viewModel.intelligence.requirementStrength.score}% (
                        {viewModel.intelligence.requirementStrength.label})
                      </span>
                      <p className={styles.detailSub}>
                        {viewModel.intelligence.requirementStrength.explanation}
                      </p>
                    </div>

                    <div className={styles.detailBox}>
                      <span className={styles.detailTitle}>Opportunity Fit</span>
                      <span className={styles.detailValue}>
                        {viewModel.intelligence.opportunityFit.score}% (
                        {viewModel.intelligence.opportunityFit.label})
                      </span>
                      <p className={styles.detailSub}>
                        Confidence: {viewModel.intelligence.opportunityFit.confidence}
                      </p>
                    </div>

                    <div className={styles.detailBox}>
                      <span className={styles.detailTitle}>Proposal Readiness</span>
                      <span className={styles.detailValue}>
                        {viewModel.intelligence.proposalReadiness.state}
                      </span>
                      <p className={styles.detailSub}>
                        {viewModel.intelligence.proposalReadiness.reason}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 7: ACTIVITY ─────────────────────────────────────────────────── */}
            {activeTab === "activity" && (
              <div className={styles.tabSectionGroup}>
                <div className={styles.sectionCard}>
                  <h3 className={styles.cardHeading}>ACTIVITY TIMELINE</h3>
                  <div className={styles.activityTimeline}>
                    <div className={styles.activityItem}>
                      <div className={styles.activityIcon}>
                        <Clock size={14} />
                      </div>
                      <div className={styles.activityText}>
                        <strong>Enquiry Received</strong>
                        <span>Received via {header.source} on {header.receivedDate}</span>
                      </div>
                    </div>
                    {stage === "clarification" && (
                      <div className={styles.activityItem}>
                        <div className={styles.activityIcon}>
                          <HelpCircle size={14} />
                        </div>
                        <div className={styles.activityText}>
                          <strong>Clarification Requested</strong>
                          <span>Clarification request sent to client today</span>
                        </div>
                      </div>
                    )}
                    {stage === "accepted" && (
                      <div className={styles.activityItem}>
                        <div className={styles.activityIcon}>
                          <FileCheck2 size={14} />
                        </div>
                        <div className={styles.activityText}>
                          <strong>Enquiry Accepted</strong>
                          <span>Moved to accepted stage for proposal preparation</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

          {/* Right Fixed Context & Intelligence Area */}
          <aside className={styles.enquiryDetails} aria-label="Context & Intelligence">
            <div className={styles.enquiryDetailsTop}>
              {activeTab === "overview" ? (
                <GlobalEnquiryIntelligenceCard
                  viewModel={viewModel}
                  onAppendToClarification={handleAppendToClarification}
                  onNavigateToIntelligence={handleViewAllFiles}
                />
              ) : (
                <OdinInsightsPanel
                  scope={activeTab as "requirements" | "evidence" | "client" | "intelligence" | "activity"}
                  insights={deriveContextualOdinInsights(enquiry, activeTab)}
                  onAppendToClarification={handleAppendToClarification}
                  onNavigateToTab={(tab) => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("tab", tab);
                    router.push(`${pathname}?${params.toString()}`, { scroll: false });
                  }}
                />
              )}
            </div>

            <div className={styles.enquiryDetailsBottom}>
              {/* Persistent Request Clarification Block */}
              <div className={styles.clarificationBlock} id="enquiry-clarification-composer">
                <EnquiryClarificationComposer
                  initialMessage={clarificationText}
                  onMessageChange={setClarificationText}
                  status={stage === "clarification" ? "sent" : undefined}
                  onSend={handleSendClarification}
                />
              </div>

              {/* Accept / Reject CTA Group */}
              <div className={styles.ctaGroup}>
                <EnquiryActionsCard
                  stage={stage}
                  onStageChange={handleStageChange}
                  enquiry={enquiry}
                />
              </div>
            </div>
          </aside>
        </div>
      </RoutePageContainer>
    </div>
  );
}

export type ProposalStatus = "none" | "draft" | "sent" | "viewed" | "accepted" | "rejected" | "revision_requested";

export interface EnquiryActionsCardProps {
  stage: EnquiryStage;
  onStageChange: (stage: EnquiryStage) => void;
  enquiry?: EnquiryRecord;
  initialProposalStatus?: ProposalStatus;
}

export function EnquiryActionsCard({
  stage,
  onStageChange,
  initialProposalStatus = "none",
}: EnquiryActionsCardProps) {
  const [proposalStatus] = useState<ProposalStatus>(initialProposalStatus);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const handleCreateProposalClick = () => {
    setShowWarningModal(true);
  };

  if (stage === "accepted") {
    if (proposalStatus === "accepted") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#15803d" }}>Proposal: Accepted</span>
          <div className={styles.actionBtnRow}>
            <button type="button" className={styles.acceptBtn}>Convert to Project</button>
            <button type="button" className={styles.secondaryBtn}>View Proposal</button>
          </div>
        </div>
      );
    }
    if (proposalStatus === "sent") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#2563eb" }}>Proposal: Sent</span>
          <div className={styles.actionBtnRow}>
            <button type="button" className={styles.secondaryBtn}>View Proposal</button>
            <button type="button" className={styles.secondaryBtn}>Schedule Consultation</button>
          </div>
        </div>
      );
    }
    return (
      <>
        <div className={styles.actionBtnRow}>
          <button type="button" className={styles.acceptBtn} onClick={handleCreateProposalClick}>
            Create Proposal
          </button>
          <button type="button" className={styles.secondaryBtn}>
            Schedule Consultation
          </button>
        </div>

        {showWarningModal && (
          <div className={styles.modalBackdrop} onClick={() => setShowWarningModal(false)}>
            <div className={styles.warningModalCard} onClick={(e) => e.stopPropagation()}>
              <div className={styles.warningModalHeaderRow}>
                <div className={styles.warningModalIconWrap}>
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className={styles.warningModalTitle}>Proposal Readiness Warning</h3>
                  <span style={{ fontSize: "11.5px", color: "#64748b" }}>26 critical requirement gaps</span>
                </div>
              </div>
              <p className={styles.warningModalText}>
                There are <strong>26 critical gaps</strong> that should be clarified before creating a proposal. Proceeding now may result in incomplete scope pricing or requirement discrepancies.
              </p>
              <div className={styles.warningModalBtnRow}>
                <button
                  type="button"
                  className={styles.modalCancelBtn}
                  onClick={() => setShowWarningModal(false)}
                >
                  Back to Clarifications
                </button>
                <button
                  type="button"
                  className={styles.modalProceedBtn}
                  onClick={() => {
                    setShowWarningModal(false);
                    alert("Navigating to Proposal Creator...");
                  }}
                >
                  Proceed to Proposal
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={styles.actionBtnRow}>
      <button type="button" className={styles.acceptBtn} onClick={() => onStageChange("accepted")}>
        Accept Enquiry
      </button>
      <button type="button" className={styles.rejectBtn} onClick={() => onStageChange("rejected")}>
        Reject Enquiry
      </button>
    </div>
  );
}

export function GlobalEnquiryIntelligenceCard({
  viewModel,
  selectedRequirement,
  onDeselectRequirement,
  onAppendToClarification,
  onNavigateToIntelligence,
}: {
  viewModel: EnquiryDetailViewModel;
  selectedRequirement?: EnquiryRequirement | null;
  onDeselectRequirement?: () => void;
  onAppendToClarification: (text: string) => void;
  onNavigateToIntelligence: () => void;
}) {
  const { intelligence } = viewModel;

  const unconfirmedCount = (viewModel.requirements || []).filter(
    (r: EnquiryRequirement) => r.state === "needs_clarification" || r.state === "needs_verification" || r.state === "partial"
  ).length;

  const insights: string[] = [
    "Budget coverage is still unclear.",
    "Site information is largely unverified.",
    "Timeline contains a possible schedule conflict.",
    "Professional scope requires clarification before proposal.",
  ];

  return (
    <div className={styles.globalIntelCard}>
      <h3 className={styles.globalIntelHeader}>ENQUIRY INTELLIGENCE</h3>

      {/* 1. Requirement Strength */}
      <div className={styles.signalBlock}>
        <div className={styles.signalLabelRow}>
          <span className={styles.signalTitle}>Requirement Strength</span>
          <span title="How requirement strength is calculated" style={{ display: "inline-flex", alignItems: "center" }}>
            <Info size={14} className={styles.infoIcon} aria-label="How requirement strength is calculated" />
          </span>
        </div>
        <div className={styles.signalValueRow}>
          <span className={styles.signalScore}>{intelligence.requirementStrength.score}%</span>
          <span className={styles.trendNegative} style={{ fontSize: "11.5px", marginLeft: "4px" }}>
            -1.4% vs last review
          </span>
        </div>
        <div
          className={styles.segmentBar}
          role="progressbar"
          aria-valuenow={intelligence.requirementStrength.score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Requirement strength: ${intelligence.requirementStrength.score}% (${intelligence.requirementStrength.label})`}
        >
          {Array.from({ length: 50 }).map((_, idx) => {
            const filledSegments = Math.min(
              50,
              Math.max(0, Math.round((intelligence.requirementStrength.score / 100) * 50))
            );
            const isFilled = idx < filledSegments;
            const ratio = idx / 49;
            const hue = Math.round(215 - ratio * 80);
            const segmentColor = `hsl(${hue}, 85%, 44%)`;

            return (
              <div
                key={idx}
                className={`${styles.segment} ${!isFilled ? styles.segmentUnfilled : ""}`}
                style={{ backgroundColor: isFilled ? segmentColor : undefined }}
              />
            );
          })}
        </div>
        <div className={styles.footerRow}>
          <span className={styles.footerLeft}>{intelligence.requirementStrength.label}</span>
          <span className={styles.footerCenter}>
            {intelligence.requirementStrength.clearSignals} of {intelligence.requirementStrength.totalSignals} signals clear
          </span>
          <span className={styles.trendNegative}>
            -1.4%
          </span>
        </div>
      </div>

      <div className={styles.signalDivider} />

      {/* 2. Opportunity Fit */}
      <div className={styles.signalBlock}>
        <div className={styles.signalLabelRow}>
          <span className={styles.signalTitle}>Opportunity Fit</span>
        </div>
        <div className={styles.signalValueRow}>
          <span className={styles.signalScore}>{intelligence.opportunityFit.score}%</span>
          <span className={styles.signalDot}>·</span>
          <span className={styles.signalBand}>{intelligence.opportunityFit.label}</span>
        </div>
        <p className={styles.signalSubtext}>
          Confidence: <strong>{intelligence.opportunityFit.confidence}</strong>
        </p>
      </div>

      <div className={styles.signalDivider} />

      {/* 3. Proposal Readiness */}
      <div className={styles.signalBlock}>
        <div className={styles.signalLabelRow}>
          <span className={styles.signalTitle}>Proposal Readiness</span>
        </div>
        <div className={styles.signalValueRow}>
          <span className={`${styles.signalReadinessState} ${intelligence.proposalReadiness.state === "READY" ? styles.stateReady : styles.statePartial}`}>
            {intelligence.proposalReadiness.state}
          </span>
        </div>
        <p className={styles.signalSubtext}>
          {unconfirmedCount > 0
            ? `${unconfirmedCount} critical gaps must be clarified before proposal creation.`
            : intelligence.proposalReadiness.reason}
        </p>
      </div>

      <div className={styles.sectionDivider} />

      {/* ODIN INSIGHTS */}
      <div className={styles.odinInsightsSection}>
        <h4 className={styles.odinInsightsTitle}>ODIN INSIGHTS</h4>
        <ul className={styles.odinInsightsList}>
          {insights.map((insight, idx) => (
            <li key={idx} className={styles.odinInsightItem}>
              <span className={styles.bulletDot}>•</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>

        {selectedRequirement && (
          <div className={styles.selectedContextBlock}>
            <div className={styles.selectedContextHeader}>
              <span className={styles.selectedContextLabel}>SELECTED</span>
              {onDeselectRequirement && (
                <button
                  type="button"
                  className={styles.selectedContextCloseBtn}
                  onClick={onDeselectRequirement}
                >
                  ×
                </button>
              )}
            </div>
            <div className={styles.selectedContextName}>{selectedRequirement.label}</div>
            <div className={styles.selectedContextMeta}>
              <span className={`${styles.reqStateBadge} ${styles[`state_${selectedRequirement.state}`]}`}>
                {selectedRequirement.state.replace("_", " ")}
              </span>
              <span className={`${styles.prioTag} ${styles[`prio_${selectedRequirement.priority}`]}`}>
                {selectedRequirement.priority.toUpperCase()}
              </span>
            </div>
            <p className={styles.selectedContextOdinText}>
              ODIN: &ldquo;{selectedRequirement.id.includes("budget")
                ? "This blocks reliable commercial pricing."
                : selectedRequirement.id.includes("drawings")
                ? "Existing floor plan DWG file must be verified against physical site dimensions."
                : selectedRequirement.id.includes("mep")
                ? "Floor raceways and HVAC duct relocation scope requires contractor confirmation."
                : "Requires verification before finalizing proposal."}&rdquo;
            </p>
            {(selectedRequirement.state === "needs_clarification" ||
              selectedRequirement.state === "needs_verification" ||
              selectedRequirement.state === "partial") && (
              <button
                type="button"
                className={styles.addClarificationSmallBtn}
                onClick={() => {
                  const text = selectedRequirement.id.includes("budget")
                    ? "Please confirm whether the ₹40L–₹60L budget includes furniture, lighting, MEP works and execution."
                    : selectedRequirement.id.includes("drawings")
                    ? "Please confirm whether the uploaded DWG is the latest verified drawing and reflects current site dimensions."
                    : selectedRequirement.id.includes("mep")
                    ? "Please confirm electrical load capacity, floor raceways, and HVAC duct relocation scope."
                    : `Please clarify details regarding ${selectedRequirement.label}.`;
                  onAppendToClarification(text);
                }}
              >
                + Add to clarification
              </button>
            )}
          </div>
        )}

        <button
          type="button"
          className={styles.viewFullOdinBtn}
          onClick={onNavigateToIntelligence}
        >
          View full ODIN Intelligence →
        </button>
      </div>
    </div>
  );
}
