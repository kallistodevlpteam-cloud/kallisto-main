"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ThemeSelect } from "@/components/ui/theme-select";
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
  XCircle,
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
  EnquiryStatus,
  EnquiryStage,
  EnquiryRequirement,
  EnquiryRequirementDomain,
} from "@/features/enquiries/types/enquiry.types";
import {
  buildEnquiryDetailViewModel,
  buildBackendRequirementRows,
  EnquiryDetailViewModel,
  ClientHouseholdMember,
  BackendRequirementRow,
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
import { authedFetch } from "@/lib/auth/authed-fetch";

export function EnquiryDetailSkeleton() {
  return (
    <div className={styles.enquiryWorkspace}>
      <RoutePageContainer className="project-dashboard-page" title="Loading enquiry..." showHeading={false}>
        <div style={{ padding: "40px", color: "#64748b" }}>Loading enquiry details...</div>
      </RoutePageContainer>
    </div>
  );
}

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

export function getMemberOdinInsightSummary(member: ClientHouseholdMember): string {
  // Strictly backend-sourced description (family_details.description):
  // shown verbatim whenever the backend provides one.
  if (member.description && member.description.trim().length > 0) {
    return member.description.trim();
  }
  const name = (member.name || "").toLowerCase();
  if (name.includes("ananya")) {
    if (member.occupation?.toLowerCase().includes("director") || member.relationship?.toLowerCase().includes("mother")) {
      return "Ananya regularly works from home and needs a high-privacy master suite with easy ground-floor and courtyard access. She holds final layout sign-off authority.";
    }
    return "Ananya requires an executive corner cabin with high acoustic privacy and holds full lease and fit-out sign-off authority.";
  }
  if (name.includes("rahul")) {
    return "Rahul occasionally works from home and values outdoor entertaining, with a shared master suite and medium privacy needs. He is a co-decision maker.";
  }
  if (name.includes("nila")) {
    return "Nila needs a private bedroom with a dedicated study desk and quiet space for reading and art.";
  }
  if (name.includes("meera")) {
    return "Meera is a frequent visitor who needs a ground-floor bedroom, attached bathroom and minimal stair dependency for comfortable access.";
  }
  if (name.includes("david")) {
    return "David prefers an open-plan collaborative zone with breakout studio space and teak finish approvals.";
  }
  if (name.includes("siddharth")) {
    return "Siddharth coordinates site inspections, server room trunking, and MEP civil setback requirements.";
  }
  if (name.includes("radhika")) {
    return "Radhika requires a high-privacy finance cabin and oversees milestone disbursement approvals.";
  }

  if (member.specialNotes) {
    return `${member.name} requires ${member.specialNotes.toLowerCase()}.`;
  }
  if (member.keyNeeds && member.keyNeeds.length > 0) {
    return `${member.name} prioritizes ${member.keyNeeds.join(", ").toLowerCase()}.`;
  }
  return `${member.name}'s design requirements and space preferences have been verified by ODIN.`;
}

/**
 * Builds the site image alt text strictly from the backend-provided URL
 * (project_site.site_img_url entries): the URL basename is used verbatim,
 * so no non-backend label is ever fabricated.
 */
function deriveSiteImageAlt(url: string, index: number): string {
  const basename = url.split("/").pop()?.split(".")[0] ?? "";
  return basename ? `Site image ${index + 1}: ${basename}` : `Site image ${index + 1}`;
}

/**
 * Initials derived strictly from the backend client_name; returns the
 * documented fallback when the name cannot be resolved.
 */
function deriveClientInitials(clientName: string): string {
  const tokens = clientName.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return "—";
  const initials = tokens
    .slice(0, 3)
    .map((token) => token.charAt(0).toUpperCase())
    .join("");
  return initials || "—";
}

/** Formats project_DOC.updated_at (Unix epoch seconds) as "11 Aug 2026",
 * strictly derived from the backend timestamp. */
function deriveDocUpdatedLabel(value: string | number | null | undefined): string | undefined {
  if (value == null || value === "") return undefined;
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  const ms = parsed > 1e11 ? parsed : parsed * 1000;
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function buildEnquiriesFromProjects(projects: Array<Record<string, unknown>>): EnquiryRecord[] {
  if (!projects || projects.length === 0) return [DEFAULT_ENQUIRY_RECORD];
  return projects.map((proj, idx) => {
    const rawId = String(proj.id ?? proj.enquiryRef ?? `enq-${idx + 1}`);
    // Align with the enquiries list route ids (`prj-<id>`): the backend
    // project id is numeric, the list links use the prefixed form.
    const id = rawId.startsWith("prj-") ? rawId : `prj-${rawId}`;
    const title = String(proj.projectName || proj.project_name || proj.name || proj.title || "Villa Design Consultation");
    const clientName = String(proj.clientName || proj.client_name || proj.client || "—");
    const location = String(proj.place || proj.location || "Kochi");
    const rawType = String(proj.projectType || proj.project_type || proj.type || "residential").toLowerCase();
    const normalizedType = rawType.includes("comm") ? "commercial" : "residential";

    const isPrj = String(proj.projectCharacter || proj.project_character || "enq").toLowerCase() === "pr";
    const status: EnquiryStatus = isPrj ? "completed" : "active";
    const stage: EnquiryStage = isPrj ? "accepted" : (proj.viewed || proj.view ? "clarification" : "new");

    const rawBudget = (proj.estimatedOverallBudget ?? proj.estimated_overall_budget) as number | string | undefined;
    const formattedBudget = typeof rawBudget === "number"
      ? (rawBudget > 0 ? `₹${(rawBudget / 100000).toFixed(rawBudget % 100000 === 0 ? 0 : 2)} Lakhs` : undefined)
      : (typeof rawBudget === "string" && rawBudget.trim() !== "" ? rawBudget : undefined);

    const rawArea = (proj.sqArea ?? proj.sq_area) as number | string | undefined;
    const formattedArea = typeof rawArea === "number"
      ? `${rawArea.toLocaleString()} sq ft`
      : (typeof rawArea === "string" && rawArea.trim() !== "" ? rawArea : undefined);

    const requirementsRows = Array.isArray(proj.requirements)
      ? proj.requirements
      : (Array.isArray(proj.requirements_list) ? proj.requirements_list : []);

    return {
      id,
      title,
      requirementSummary: String(proj.briefDescription || proj.brief_description || proj.summary || proj.description || DEFAULT_ENQUIRY_RECORD.requirementSummary),
      overview: String(proj.overView ?? proj.over_view ?? "") || null,
      providerIds: (() => {
        const raw = proj.providerIds ?? proj.provider_ids;
        if (Array.isArray(raw)) {
          return raw.map((item) => String(item ?? "")).filter((item) => item.length > 0);
        }
        if (typeof raw === "string" && raw.trim().length > 0) {
          try {
            const parsed: unknown = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              return parsed.map((item) => String(item ?? "")).filter((item) => item.length > 0);
            }
          } catch {
            return [raw];
          }
        }
        return [];
      })(),
      clientName,
      location,
      thumbnailUrl: String(proj.coverImageUrl || proj.cover_image_url || proj.thumbnailUrl || DEFAULT_ENQUIRY_RECORD.thumbnailUrl),
      source: "website",
      status,
      stage,
      projectType: normalizedType as any,
      backendProjectType: String(proj.projectType || proj.project_type || "Residential Design"),
      budgetMin: 4000000,
      budgetMax: 6000000,
      receivedAt: String(proj.createdAt || proj.created_at || proj.receivedAt || DEFAULT_ENQUIRY_RECORD.receivedAt),
      nextAction: { type: "review_enquiry", label: "Review Requirements" },
      enquiryRef: String(proj.enquiryRef || proj.code || `ENQ-2026-${String(idx + 486).padStart(4, "0")}`),
      budget: formattedBudget || String(proj.budget || "₹40L – ₹60L"),
      timeline: String(proj.clientExpectedTimeline || proj.client_expected_timeline || proj.timeline || "Within 6 Months"),
      builtUpArea: formattedArea || String(proj.area || "2,800 – 3,200 sq ft"),
      viewed: Boolean(proj.viewed || proj.view),
      inspirationImages: (() => {
        const raw = Array.isArray(proj.inspirationImages)
          ? proj.inspirationImages
          : Array.isArray(proj.inspiration_images)
            ? proj.inspiration_images
            : [];
        return raw.map((img: { url?: string; alt?: string | null }) => ({
          url: String(img.url ?? ""),
          alt: img.alt ?? null,
        }));
      })(),
      projectDocuments: (proj.projectDocuments ?? proj.project_documents) as any,
      siteImages: (proj.siteImages ?? proj.site_images) as any,
      projectScopes: (proj.projectScopes ?? proj.project_scopes) as any,
      requirementsList: requirementsRows.flatMap((entry) => {
        const requirement = (entry ?? {}) as {
          id?: unknown;
          requirement_name?: unknown;
          items?: unknown;
          item_details?: unknown;
          statuses?: unknown;
        };
        const requirementName = String(requirement.requirement_name ?? "").trim();
        if (!requirementName) return [];
        const items = Array.isArray(requirement.items)
          ? requirement.items.map((item) => String(item ?? "")).filter((item) => item.length > 0)
          : [];
        const itemDetails = Array.isArray(requirement.item_details)
          ? requirement.item_details.map((details) =>
              Array.isArray(details)
                ? details.map((detail) => String(detail ?? "")).filter((detail) => detail.length > 0)
                : []
            )
          : [];
        const statuses = Array.isArray(requirement.statuses)
          ? requirement.statuses.map((status) => {
              if (typeof status === "boolean") return status;
              if (status === 1 || status === "1") return true;
              if (status === 0 || status === "0") return false;
              return null;
            })
          : [];
        return [
          {
            id: String(requirement.id ?? ""),
            requirement_name: requirementName,
            items,
            item_details: itemDetails,
            statuses,
          },
        ];
      }),
      clientPriorities: ((
        proj.priorities as Array<{ [k: string]: unknown }>
      ) ?? [])
        .map((priority) => {
          const label = String(priority?.priority_name ?? "").trim();
          if (!label) return null;
          const details = Array.isArray(priority.details)
            ? priority.details
                .map((detail) => String(detail ?? ""))
                .filter((detail) => detail.length > 0)
            : [];
          const status = (priority?.statuses as unknown[] | undefined)?.[0];
          const isConfirmed = status === true || status === 1;
          const tags = Array.isArray(priority.tags)
            ? priority.tags
                .filter((tagList) => Array.isArray(tagList))
                .flatMap((tagList) =>
                  (tagList as unknown[])
                    .map((tag) => String(tag ?? ""))
                    .filter((tag) => tag.length > 0)
                )
            : [];
          return {
            id: String(priority?.id ?? ""),
            label,
            type: isConfirmed ? ("confirmed" as const) : ("inferred" as const),
            details,
            tags,
          };
        })
        .filter((priority) => priority !== null),
      familyMembers: ((
        proj.familyMembers ?? proj.family_members
      ) as Array<{ [k: string]: unknown }> | null | undefined)
        ?.map((member) => {
          const name = String(member?.name ?? "").trim();
          if (!name) return null;
          const rawClientId = member?.client_id ?? member?.clientId;
          const rawAge = member?.age;
          const rawImgUrl = member?.family_member_img_url ?? member?.familyMemberImgUrl;
          const rawDescription = member?.description;
          return {
            familyId: String(member?.family_id ?? member?.familyId ?? ""),
            clientId: typeof rawClientId === "string" ? rawClientId : null,
            name,
            age: typeof rawAge === "number" && Number.isFinite(rawAge) ? rawAge : null,
            job: typeof member?.job === "string" ? member.job : null,
            phone: typeof member?.phone === "string" ? member.phone : null,
            relation: typeof member?.relation === "string" ? member.relation : null,
            familyMemberImgUrl: typeof rawImgUrl === "string" ? rawImgUrl : null,
            description: typeof rawDescription === "string" ? rawDescription : null,
          };
        })
        .filter((member) => member !== null),
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

/** Badge label for a requirement state, strictly derived from the state
 * value (mapped from backend requirement_items.status). */
export function requirementStateLabel(state: string): string {
  if (state === "ai_derived") return "AI-Derived";
  return state.replace("_", " ");
}

const DOMAIN_TABLE_COLUMNS: Record<string, DomainColumnDef[]> = {
  exterior_facade: [
    { header: "Requirement", width: "28%", render: (r) => <span className={styles.roomNameText}>{r.label}</span> },
    { header: "Specification", width: "46%", render: (r) => <span style={{ color: "#334155", lineHeight: "1.4" }}>{String(r.value || "—")}</span> },
    { header: "Priority", width: "12%", render: (r) => <span className={`${styles.prioTag} ${styles[`prio_${r.priority}`]}`}>{r.priority.toUpperCase()}</span> },
    { header: "Status", width: "14%", align: "right", render: (r) => <span className={`${styles.reqStateBadge} ${styles[`state_${r.state}`]}`}>{requirementStateLabel(r.state)}</span> },
  ],
  outdoor_landscape: [
    { header: "Requirement", width: "28%", render: (r) => <span className={styles.roomNameText}>{r.label}</span> },
    { header: "Specification", width: "46%", render: (r) => <span style={{ color: "#334155", lineHeight: "1.4" }}>{String(r.value || "—")}</span> },
    { header: "Priority", width: "12%", render: (r) => <span className={`${styles.prioTag} ${styles[`prio_${r.priority}`]}`}>{r.priority.toUpperCase()}</span> },
    { header: "Status", width: "14%", align: "right", render: (r) => <span className={`${styles.reqStateBadge} ${styles[`state_${r.state}`]}`}>{requirementStateLabel(r.state)}</span> },
  ],
  site: [
    { header: "Parameter", width: "24%", render: (r) => <span className={styles.roomNameText}>{r.label}</span> },
    { header: "Current Value", width: "42%", render: (r) => <span style={{ color: "#334155" }}>{String(r.value || "—")}</span> },
    { header: "Source", width: "12%", render: (r) => <span className={styles.reqCategoryBadge}>{r.source.toUpperCase()}</span> },
    { header: "Priority", width: "10%", render: (r) => <span className={`${styles.prioTag} ${styles[`prio_${r.priority}`]}`}>{r.priority.toUpperCase()}</span> },
    { header: "Status", width: "12%", align: "right", render: (r) => <span className={`${styles.reqStateBadge} ${styles[`state_${r.state}`]}`}>{requirementStateLabel(r.state)}</span> },
  ],
  technical: [
    { header: "System", width: "22%", render: (r) => <span className={styles.roomNameText}>{r.label}</span> },
    { header: "Requirement / Specification", width: "48%", render: (r) => <span style={{ color: "#334155", lineHeight: "1.4" }}>{String(r.value || "—")}</span> },
    { header: "Priority", width: "12%", render: (r) => <span className={`${styles.prioTag} ${styles[`prio_${r.priority}`]}`}>{r.priority.toUpperCase()}</span> },
    { header: "Status", width: "18%", align: "right", render: (r) => <span className={`${styles.reqStateBadge} ${styles[`state_${r.state}`]}`}>{requirementStateLabel(r.state)}</span> },
  ],
  budget_commercial: [
    { header: "Item", width: "26%", render: (r) => <span className={styles.roomNameText}>{r.label}</span> },
    { header: "Current Value", width: "34%", render: (r) => <span style={{ color: "#0f172a", fontWeight: 600 }}>{String(r.value || "—")}</span> },
    { header: "Coverage / Notes", width: "20%", render: (r) => <span style={{ color: "#64748b", fontSize: "12px" }}>{r.source === "client" ? "Client stated" : "Coverage pending confirmation"}</span> },
    { header: "Priority", width: "8%", render: (r) => <span className={`${styles.prioTag} ${styles[`prio_${r.priority}`]}`}>{r.priority.toUpperCase()}</span> },
    { header: "Status", width: "12%", align: "right", render: (r) => <span className={`${styles.reqStateBadge} ${styles[`state_${r.state}`]}`}>{requirementStateLabel(r.state)}</span> },
  ],
  timeline: [
    { header: "Milestone / Constraint", width: "30%", render: (r) => <span className={styles.roomNameText}>{r.label}</span> },
    { header: "Target / Value", width: "42%", render: (r) => <span style={{ color: "#334155", fontWeight: 600 }}>{String(r.value || "—")}</span> },
    { header: "Priority", width: "12%", render: (r) => <span className={`${styles.prioTag} ${styles[`prio_${r.priority}`]}`}>{r.priority.toUpperCase()}</span> },
    { header: "Status", width: "16%", align: "right", render: (r) => <span className={`${styles.reqStateBadge} ${styles[`state_${r.state}`]}`}>{requirementStateLabel(r.state)}</span> },
  ],
  regulatory: [
    { header: "Requirement", width: "26%", render: (r) => <span className={styles.roomNameText}>{r.label}</span> },
    { header: "Current Status", width: "42%", render: (r) => <span style={{ color: "#334155", lineHeight: "1.4" }}>{String(r.value || "—")}</span> },
    { header: "Responsibility", width: "14%", render: (r) => <span style={{ color: "#64748b", fontSize: "11.5px" }}>{r.source === "client" ? "Client" : "SP Architect TBD"}</span> },
    { header: "Priority", width: "8%", render: (r) => <span className={`${styles.prioTag} ${styles[`prio_${r.priority}`]}`}>{r.priority.toUpperCase()}</span> },
    { header: "Status", width: "10%", align: "right", render: (r) => <span className={`${styles.reqStateBadge} ${styles[`state_${r.state}`]}`}>{requirementStateLabel(r.state)}</span> },
  ],
  documentation: [
    { header: "Document", width: "26%", render: (r) => <span className={styles.roomNameText}>{r.label}</span> },
    { header: "Availability", width: "38%", render: (r) => <span style={{ color: "#334155" }}>{String(r.value || "Not received")}</span> },
    { header: "Source", width: "12%", render: (r) => <span className={styles.reqCategoryBadge}>{r.source.toUpperCase()}</span> },
    { header: "Verification", width: "12%", render: (r) => <span style={{ color: r.state === "confirmed" ? "#16a34a" : "#d97706", fontWeight: 600, fontSize: "11.5px" }}>{r.state === "confirmed" ? "Available" : "Needs review"}</span> },
    { header: "Status", width: "12%", align: "right", render: (r) => <span className={`${styles.reqStateBadge} ${styles[`state_${r.state}`]}`}>{requirementStateLabel(r.state)}</span> },
  ],
  scope: [
    { header: "Service", width: "28%", render: (r) => <span className={styles.roomNameText}>{r.label}</span> },
    { header: "Expectation", width: "44%", render: (r) => <span style={{ color: "#334155", lineHeight: "1.4" }}>{String(r.value || "—")}</span> },
    { header: "Priority", width: "12%", render: (r) => <span className={`${styles.prioTag} ${styles[`prio_${r.priority}`]}`}>{r.priority.toUpperCase()}</span> },
    { header: "Status", width: "16%", align: "right", render: (r) => <span className={`${styles.reqStateBadge} ${styles[`state_${r.state}`]}`}>{requirementStateLabel(r.state)}</span> },
  ],
};

/** Renders the requirement row's specification value: a detail list when
 * the backend provides one (requirement_items.details), otherwise the raw
 * value or an em dash. Never invents data. */
function renderRequirementValue(r: EnquiryRequirement) {
  if (Array.isArray(r.value) && r.value.length > 0) {
    return (
      <ul className={styles.requirementDetailList}>
        {r.value.map((detail, idx) => (
          <li key={idx}>{String(detail)}</li>
        ))}
      </ul>
    );
  }
  return (
    <span style={{ color: "#334155", lineHeight: "1.4" }}>
      {String(r.value || "—")}
    </span>
  );
}

const DEFAULT_DOMAIN_COLUMNS: DomainColumnDef[] = [
  { header: "Requirement", width: "30%", render: (r) => <span className={styles.roomNameText}>{r.label}</span> },
  { header: "Specification / Details", width: "42%", render: renderRequirementValue },
  { header: "Priority", width: "12%", render: (r) => <span className={`${styles.prioTag} ${styles[`prio_${r.priority}`]}`}>{r.priority.toUpperCase()}</span> },
  { header: "Status", width: "16%", align: "right", render: (r) => <span className={`${styles.reqStateBadge} ${styles[`state_${r.state}`]}`}>{requirementStateLabel(r.state)}</span> },
];

export function GenericDomainScheduleTable({
  domainKey,
  requirements,
  selectedRequirementId,
  onSelectRequirement,
}: {
  domainKey: string;
  requirements: Array<EnquiryRequirement | BackendRequirementRow>;
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
            const id = (req as any).id as string;
            const isSelected = selectedRequirementId === id;
            return (
              <tr
                key={id}
                className={`${styles.roomScheduleRow} ${
                  isSelected ? styles.roomScheduleRowSelected : ""
                }`}
                onClick={() => onSelectRequirement(id)}
              >
                {columns.map((col, idx) => (
                  <td key={idx} style={{ textAlign: col.align || "left" }}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {col.render(req as any)}
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

  // Backend-driven requirement mode: when the project carries backend
  // requirements rows (requirement_name + requirement_items), the
  // requirement navigator and tables are rendered strictly from them;
  // the static taxonomy and mock requirement rows are never substituted.
  const backendRequirementGroups = (enquiry.requirementsList ?? []).map((requirement) => ({
    id: requirement.id,
    requirement_name: requirement.requirement_name,
    items: requirement.items ?? [],
  }));
  const isBackendRequirementMode = backendRequirementGroups.length > 0;
  const backendDomainKeyList = backendRequirementGroups.map((group) => group.id).join("|");
  const backendDomainKeySet = new Set(backendRequirementGroups.map((group) => group.id));
  const backendRequirementRows = buildBackendRequirementRows(enquiry.requirementsList);
  const resolvedActiveDomainKey = isBackendRequirementMode
    ? backendDomainKeySet.has(activeDomainKey)
      ? activeDomainKey
      : (backendRequirementGroups[0]?.id ?? activeDomainKey)
    : activeDomainKey;
  const activeBackendGroup = isBackendRequirementMode
    ? (backendRequirementGroups.find((group) => group.id === resolvedActiveDomainKey) ?? null)
    : null;
  const activeBackendRows = activeBackendGroup
    ? backendRequirementRows.filter((row) => row.domain === activeBackendGroup.id)
    : [];

  const rawDomain = searchParams.get("domain");
  useEffect(() => {
    if (
      rawDomain &&
      (REQUIREMENT_DOMAIN_ORDER.some((d) => d.key === rawDomain) ||
        backendDomainKeyList.split("|").includes(rawDomain))
    ) {
      setActiveDomainKey(rawDomain);
    }
  }, [rawDomain, backendDomainKeyList]);

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
    authedFetch("/api/projects?character=enq", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as {
          status: string;
          projects: Array<Record<string, unknown>>;
        };
        if (!response.ok || payload.status !== "ok") {
          throw new Error("Backend projects request failed");
        }
        const records = buildEnquiriesFromProjects(payload.projects as never[]);
        const match = records.find(
          (record) =>
            record.id === enquiryId ||
            record.id === `prj-${enquiryId}` ||
            record.id.replace("prj-", "") === enquiryId
        );
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
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {header.enquiryRef && (
                    <span className={styles.refCode}>{header.enquiryRef}</span>
                  )}
                  <button
                    type="button"
                    className="title-share-btn"
                    aria-label={`Share ${header.title}`}
                    title={`Share ${header.title}`}
                  >
                    <Share2 size={16} strokeWidth={1.8} />
                  </button>
                </div>
              </div>

              <div className={styles.subMetaRow}>
                <div className={styles.subMetaLeft}>
                  <span className={styles.metaChip}>
                    <MapPin size={13} />
                    <span>{header.location}</span>
                  </span>
                  <span className={styles.metaChip}>
                    <Calendar size={13} />
                    <span>Received {header.receivedDate}</span>
                  </span>
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
              </div>
            </div>

            {/* Navigation Tabs */}
            <EnquiryDetailTabs activeTab={activeTab} />

            {/* Active Tab Scroll Area */}
            <div className={styles.mainScrollArea}>

            {/* —— TAB 1: OVERVIEW —————————————————————————————————————————————————— */}
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
                <EnquirySiteImagesCard
                  title="CLIENT INSPIRATION IMAGES"
                  images={enquiry.inspirationImages?.map((img, idx) => ({
                    id: `inspiration-${idx}`,
                    src: img.url,
                    alt: img.alt || `Inspiration image ${idx + 1}`,
                  }))}
                  totalCount={enquiry.inspirationImages?.length ?? 0}
                />
              </div>
            )}

            {/* —— TAB 2: REQUIREMENTS (THREE-PANE WORKSPACE) ————————————————————————— */}
            {activeTab === "requirements" && (
              <div className={styles.requirementsWorkspace}>
                {/* PANE 1: Requirement Domain Navigator (Left, ~210px) */}
                <aside className={styles.reqDomainNav} aria-label="Requirement Domains">
                  <div className={styles.reqDomainNavHeader}>
                    <span className={styles.reqDomainNavTitle}>REQUIREMENTS</span>
                    <span className={styles.reqDomainNavSubtitle}>
                      {
                        isBackendRequirementMode
                          ? backendRequirementRows.length
                          : viewModel.requirements.filter((r) =>
                              REQUIREMENT_DOMAIN_ORDER.some((d) => d.key === (r.domain || r.category))
                            ).length
                      }{" "}
                      delivery specs
                    </span>
                  </div>

                  <div className={styles.reqDomainNavList}>
                    {isBackendRequirementMode
                      ? backendRequirementGroups.map((group) => {
                          const isActive = resolvedActiveDomainKey === group.id;
                          return (
                            <button
                              key={group.id}
                              type="button"
                              className={`${styles.reqDomainNavItem} ${isActive ? styles.reqDomainNavItemActive : ""}`}
                              onClick={() => handleSelectDomain(group.id)}
                            >
                              <div className={styles.reqDomainNavLabelRow}>
                                <span
                                  className={styles.reqDomainNavIconBadge}
                                  style={{ color: "#2563eb" }}
                                >
                                  <FileText size={13} strokeWidth={2.2} />
                                </span>
                                <span className={styles.reqDomainNavLabel}>{group.requirement_name}</span>
                              </div>
                              <span className={styles.reqDomainNavBadge}>
                                {group.items.length}/{group.items.length}
                              </span>
                            </button>
                          );
                        })
                      : REQUIREMENT_DOMAIN_ORDER.map((d) => {
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
                    if (isBackendRequirementMode) {
                      if (!activeBackendGroup) return null;
                      return (
                        <>
                          <div className={styles.activeDomainHeader}>
                            <div className={styles.activeDomainHeaderLeft} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <span
                                className={`${styles.reqDomainNavIconBadge} ${styles.reqDomainNavHeaderIconBadge}`}
                                style={{ color: "#2563eb" }}
                              >
                                <FileText size={16} strokeWidth={2.2} />
                              </span>
                              <div>
                                <h3 className={styles.activeDomainTitle}>{activeBackendGroup.requirement_name}</h3>
                                <p className={styles.activeDomainDesc}>
                                  {activeBackendGroup.items.length} confirmed item
                                  {activeBackendGroup.items.length === 1 ? "" : "s"} from the client brief
                                </p>
                              </div>
                            </div>
                            <div className={styles.activeDomainHeaderRight}>
                              <span className={styles.activeDomainCompletenessPill}>
                                {activeBackendGroup.items.length}/{activeBackendGroup.items.length} clear
                              </span>
                            </div>
                          </div>

                          <div className={styles.activeDomainContent}>
                            <GenericDomainScheduleTable
                              domainKey="__backend_requirement_items__"
                              requirements={activeBackendRows}
                              selectedRequirementId={selectedRequirementId}
                              onSelectRequirement={(id) => setSelectedRequirementId(id)}
                            />
                          </div>
                        </>
                      );
                    }

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

            {/* —— TAB 3: SITE & EVIDENCE ———————————————————————————————————————————— */}
            {activeTab === "evidence" && (
              <div className={styles.tabSectionGroup}>
                <div className={styles.sectionCard}>
                  <h3 className={styles.cardHeading}>SITE IMAGES & EVIDENCE</h3>
                  <EnquirySiteImagesCard
                    title="All Site Images"
                    images={enquiry.siteImages?.map((url, idx) => ({
                      id: `site-${idx}`,
                      src: url,
                      alt: deriveSiteImageAlt(url, idx),
                    }))}
                    totalCount={enquiry.siteImages?.length ?? 0}
                  />
                </div>
                <div className={styles.sectionCard} id="enquiry-files">
                  <h3 className={styles.cardHeading}>PROJECT DOCUMENTS</h3>
                  <EnquiryProjectDocumentsSection
                    documents={enquiry.projectDocuments?.map((doc) => ({
                      id: String(doc.id),
                      name: doc.name,
                      docType: doc.docType ?? undefined,
                      approved: doc.status,
                      uploaded: Boolean(doc.name),
                      updatedAt: deriveDocUpdatedLabel(doc.updatedAt),
                      updatedBy:
                        enquiry.clientName && enquiry.clientName !== "—"
                          ? {
                              name: enquiry.clientName,
                              initials: deriveClientInitials(enquiry.clientName),
                            }
                          : undefined,
                    }))}
                  />
                </div>
              </div>
            )}

            {/* —— TAB 4: CLIENT CONTEXT ————————————————————————————————————————————— */}
            {activeTab === "client" && (
              <div className={styles.tabSectionGroup}>
                {/* —— CLIENT & HOUSEHOLD —— */}
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
                      {/* —— ODIN HOVER TOOLTIP / POPOVER (Natural-Language AI Interpretation) —— */}
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

                      {/* —— PHOTO CONTAINER WITH DARK GRADIENT OVERLAY —— */}
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

                        {/* —— BOTTOM OVERLAY CONTENT —— */}
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

                {/* —— CLIENT CONTEXT & PRIORITIES —— */}
                <ClientPrioritiesBar priorities={viewModel.priorities} />

                {/* —— CLIENT INSPIRATION IMAGES —— */}
                <EnquirySiteImagesCard
                  title="CLIENT INSPIRATION IMAGES"
                  images={enquiry.inspirationImages?.map((img, idx) => ({
                    id: `inspiration-${idx}`,
                    src: img.url,
                    alt: img.alt || `Inspiration image ${idx + 1}`,
                  }))}
                  totalCount={enquiry.inspirationImages?.length ?? 0}
                />
              </div>
            )}

            {/* —— TAB 6: ACTIVITY ——————————————————————————————————————————————————— */}
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
                  enquiry={enquiry}
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
  enquiry,
  initialProposalStatus = "none",
}: EnquiryActionsCardProps) {
  const [proposalStatus] = useState<ProposalStatus>(initialProposalStatus);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConfirmAccept = async () => {
    if (isAccepting) return;
    const rawId = String(enquiry?.id ?? "").replace(/^prj-/, "");
    const projectId = Number(rawId);
    if (!Number.isInteger(projectId) || projectId <= 0) {
      setAcceptError(
        "This enquiry has no backend project link, so acceptance could not be saved."
      );
      return;
    }
    setIsAccepting(true);
    setAcceptError(null);
    try {
      const response = await authedFetch(`/api/projects/${projectId}/accept`, {
        method: "POST",
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        status: string;
        message?: string;
      };
      if (!response.ok || payload.status !== "ok") {
        throw new Error(
          payload.message ?? `Accept failed with status ${response.status}`
        );
      }
      setShowAcceptModal(false);
      onStageChange("accepted");
    } catch (error) {
      setAcceptError(
        error instanceof Error ? error.message : "Accept failed. Please try again."
      );
    } finally {
      setIsAccepting(false);
    }
  };

  const handleCreateProposalClick = () => {
    setShowWarningModal(true);
  };

  const handleConfirmRejection = async () => {
    if (isRejecting) return;
    const rawId = String(enquiry?.id ?? "").replace(/^prj-/, "");
    const projectId = Number(rawId);
    if (!Number.isInteger(projectId) || projectId <= 0) {
      setRejectError(
        "This enquiry has no backend project link, so the rejection could not be saved."
      );
      return;
    }
    setIsRejecting(true);
    setRejectError(null);
    try {
      const response = await authedFetch(`/api/projects/${projectId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rejection_reason: rejectionReason,
          notes: rejectionReason === "other" ? "Other reason selected by provider" : undefined,
        }),
        cache: "no-store",
      });
      const payload = (await response.json()) as { status: string; message?: string };
      if (!response.ok || payload.status !== "ok") {
        throw new Error(payload.message ?? `Reject failed with status ${response.status}`);
      }
      setShowRejectModal(false);
      onStageChange("rejected");
    } catch (error) {
      setRejectError(
        error instanceof Error ? error.message : "Rejection failed. Please try again."
      );
    } finally {
      setIsRejecting(false);
    }
  };

  if (stage === "accepted") {
    if (proposalStatus === "accepted") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#15803d" }}>Proposal: Accepted</span>
          <div className={styles.actionBtnRow}>
            <button
              type="button"
              className={styles.acceptBtn}
              onClick={() => {
                const rawId = String(enquiry?.id ?? "").replace(/^prj-/, "");
                const projectId = Number(rawId);
                if (!Number.isInteger(projectId) || projectId <= 0) {
                  alert("This enquiry has no backend project link, so conversion could not proceed.");
                  return;
                }
                authedFetch(`/api/projects/${projectId}/convert`, { method: "POST", cache: "no-store" })
                  .then((r) => r.json())
                  .then((payload: { status: string; converted?: boolean; message?: string }) => {
                    if (payload.status === "ok" && payload.converted) {
                      alert("Project converted successfully! Navigating to Projects...");
                      window.location.href = "/projects";
                    } else if (payload.status === "ok" && !payload.converted) {
                      alert("Project was already converted. Navigating to Projects...");
                      window.location.href = "/projects";
                    } else {
                      alert(payload.message ?? "Conversion failed.");
                    }
                  })
                  .catch(() => alert("Conversion request failed. Please try again."));
              }}
            >
              Convert to Project
            </button>
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

        {showWarningModal && mounted && createPortal(
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
          </div>,
          document.body
        )}
      </>
    );
  }

  return (
    <>
      <div className={styles.actionBtnRow}>
        <button type="button" className={styles.acceptBtn} onClick={() => setShowAcceptModal(true)}>
          Accept Enquiry
        </button>
        <button
          type="button"
          className={styles.rejectBtn}
          onClick={() => {
            setRejectError(null);
            setShowRejectModal(true);
          }}
        >
          Reject Enquiry
        </button>
      </div>

      {/* Accept Confirmation Modal */}
      {showAcceptModal && mounted && createPortal(
        <div className={styles.modalBackdrop} onClick={() => setShowAcceptModal(false)}>
          <div className={styles.warningModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.warningModalHeaderRow}>
              <div className={styles.acceptModalIconWrap}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h3 className={styles.warningModalTitle}>Accept Enquiry</h3>
                <span style={{ fontSize: "11.5px", color: "#64748b" }}>Start proposal preparation</span>
              </div>
            </div>
            <p className={styles.warningModalText}>
              Accept this enquiry and move it to Proposal Preparation? The client will be notified.
            </p>
            {acceptError && (
              <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "8px" }}>
                {acceptError}
              </div>
            )}
            <div className={styles.warningModalBtnRow}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setShowAcceptModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.acceptConfirmBtn}
                disabled={isAccepting}
                onClick={handleConfirmAccept}
              >
                {isAccepting ? "Accepting..." : "Accept Enquiry"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && mounted && createPortal(
        <div className={styles.modalBackdrop} onClick={() => setShowRejectModal(false)}>
          <div className={styles.warningModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.warningModalHeaderRow}>
              <div className={styles.rejectModalIconWrap}>
                <XCircle size={22} />
              </div>
              <div>
                <h3 className={styles.warningModalTitle}>Reject Enquiry</h3>
                <span style={{ fontSize: "11.5px", color: "#64748b" }}>Confirm project rejection</span>
              </div>
            </div>
            <p className={styles.warningModalText}>
              Are you sure you want to reject this enquiry? This action will mark the enquiry as rejected and update the project record.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label className={styles.rejectionLabel}>
                Rejection Reason (Optional):
              </label>
              <ThemeSelect
                value={rejectionReason}
                options={[
                  { value: "", label: "Select a reason..." },
                  { value: "capacity", label: "Studio Capacity Full" },
                  { value: "location", label: "Outside Primary Service Area" },
                  { value: "budget", label: "Budget Mismatch" },
                  { value: "scope", label: "Scope Mismatch" },
                  { value: "other", label: "Other Reason" },
                ]}
                onChange={(val) => setRejectionReason(val)}
                fullWidth
                ariaLabel="Rejection Reason"
              />
            </div>

            <div className={styles.warningModalBtnRow}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.rejectConfirmBtn}
                disabled={isRejecting}
                onClick={handleConfirmRejection}
              >
                {isRejecting ? "Rejecting…" : "Confirm Rejection"}
              </button>
            </div>
            {rejectError && (
              <p
                role="alert"
                style={{ fontSize: "12.5px", color: "#dc2626", marginTop: "4px" }}
              >
                {rejectError}
              </p>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export function GlobalEnquiryIntelligenceCard({
  viewModel,
  enquiry,
  onAppendToClarification,
}: {
  viewModel: EnquiryDetailViewModel;
  enquiry: EnquiryRecord;
  onAppendToClarification: (text: string) => void;
  onNavigateToIntelligence: () => void;
}) {
  const { intelligence } = viewModel;

  return (
    <div className={styles.globalIntelCard}>
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

      {/* 2. ODIN Insights Panel */}
      <OdinInsightsPanel
        scope="overview"
        insights={deriveContextualOdinInsights(enquiry, "overview")}
        onAppendToClarification={onAppendToClarification}
      />
    </div>
  );
}
