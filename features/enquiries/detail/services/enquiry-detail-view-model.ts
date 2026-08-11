import {
  EnquiryRecord,
  EnquiryRequirement,
  ClientPriority,
} from "../../types/enquiry.types";
import {
  deriveEnquiryIntelligence,
  EnquiryIntelligence,
  ServiceProviderContext,
  DEFAULT_ENQUIRY_REQUIREMENTS,
  DEFAULT_CLIENT_PRIORITIES,
  DEFAULT_UNCONFIRMED_SCOPE,
  getClientPriorities,
  getUnconfirmedScope,
} from "../../services/enquiry-intelligence";

export interface ProjectHeaderViewModel {
  title: string;
  projectType: string;
  stage: string;
  status: string;
  clientName: string;
  location: string;
  receivedDate: string;
  source: string;
  enquiryRef?: string;
}

export interface OdinBriefViewModel {
  summary: string;
  statusChips: Array<{
    label: string;
    variant: "neutral" | "positive" | "warning" | "purple";
  }>;
}

export interface ProjectSnapshotViewModel {
  projectType: string;
  duration: string;
  builtUpArea: string;
  budget: string;
  client: string;
  budgetCoverageStatus: string;
  areaCoverageStatus: string;
}

export interface ScopeGroupViewModel {
  title: string;
  items: Array<{ label: string; confirmed: boolean }>;
  scopeId?: number;
  sortOrder?: number;
}

export interface ClientContextItem {
  id: string;
  category: string;
  label: string;
  value: string;
  state: "confirmed" | "partial" | "needs_clarification" | "needs_verification" | "odin_inferred";
  priority: "p1" | "p2";
  source?: "client" | "odin" | "field";
}

export interface ClientContextSection {
  key: string;
  title: string;
  subtitle: string;
  iconName: "Users" | "Smile" | "UserCheck" | "MessageSquare";
  iconColor: string;
  items: ClientContextItem[];
}

export interface ProjectOwner {
  id: string;
  idNumber: string;
  name: string;
  email: string;
  role: string;
  avatarInitials: string;
  status: "Active" | "Pending" | "Offline";
  nextReview: string;
  tag1: string;
  tag2: string;
  timeOrOrg: string;
  bio: string;
  meta: {
    expOrAge: string;
    roleScope: string;
    location: string;
    channel: string;
    status: string;
  };
  unreadCount?: number;
  isPrimary?: boolean;
}

export const DEFAULT_PROJECT_OWNERS: ProjectOwner[] = [
  {
    id: "owner-1",
    idNumber: "KLS-756872004",
    name: "Ananya Sharma",
    email: "ananyasharma@ananyabuilders.com",
    role: "Primary Owner & Client Lead",
    avatarInitials: "AS",
    status: "Active",
    nextReview: "21 Sep 2026 (2 yrs)",
    tag1: "Primary Decision Maker",
    tag2: "Ananya Group",
    timeOrOrg: "Ananya Builders • Primary Lead",
    bio: "Managing Director & Primary Client Lead. Key decision maker for overall architectural direction, layout approvals, and master contract sign-off.",
    meta: {
      expOrAge: "12+ yrs",
      roleScope: "Managing Director",
      location: "Kochi, Kerala",
      channel: "Kallisto Portal",
      status: "Confirmed",
    },
    unreadCount: 3,
    isPrimary: true,
  },
  {
    id: "owner-2",
    idNumber: "KLS-756872005",
    name: "David Langston",
    email: "davidlangston@ananyabuilders.com",
    role: "Co-Owner & Design Lead",
    avatarInitials: "DL",
    status: "Active",
    nextReview: "15 Oct 2026 (2 yrs)",
    tag1: "Design Lead",
    tag2: "Aesthetic Preference",
    timeOrOrg: "Author • Updated Friday 3:12 PM",
    bio: "Focuses on interior aesthetic preferences, custom teak joinery selections, lighting scenes, and residential lifestyle requirements.",
    meta: {
      expOrAge: "8+ yrs",
      roleScope: "Interior Lead",
      location: "Bengaluru, KA",
      channel: "WhatsApp / Email",
      status: "Confirmed",
    },
  },
  {
    id: "owner-3",
    idNumber: "KLS-756872006",
    name: "Siddharth Kumar",
    email: "siddharth.k@siteops.com",
    role: "Technical & Site Operations",
    avatarInitials: "SK",
    status: "Active",
    nextReview: "05 Nov 2026 (2 yrs)",
    tag1: "Site Operations",
    tag2: "Civil Coordination",
    timeOrOrg: "Client Representative • Site Lead",
    bio: "Oversees site readiness, municipal setbacks, structural survey coordination, and civil contractor milestone reviews.",
    meta: {
      expOrAge: "10+ yrs",
      roleScope: "Site Representative",
      location: "Kochi, Kerala",
      channel: "Site Inspections",
      status: "Confirmed",
    },
    unreadCount: 1,
  },
  {
    id: "owner-4",
    idNumber: "KLS-756872007",
    name: "Radhika Kulkarni",
    email: "radhikakulkarni@ananyabuilders.com",
    role: "Commercial & Budget Director",
    avatarInitials: "RK",
    status: "Active",
    nextReview: "12 Dec 2026 (2 yrs)",
    tag1: "Commercial Director",
    tag2: "Financial Approver",
    timeOrOrg: "Financial Stakeholder • Ananya Group",
    bio: "Manages financial allocations, stage milestone disbursements, variation approvals, and overall ₹40L–₹60L budget governance.",
    meta: {
      expOrAge: "15+ yrs",
      roleScope: "Finance Director",
      location: "Bengaluru, KA",
      channel: "Kallisto Portal",
      status: "Confirmed",
    },
  },
];

export interface EnquiryDetailViewModel {
  enquiryId: string;
  header: ProjectHeaderViewModel;
  brief: OdinBriefViewModel;
  snapshot: ProjectSnapshotViewModel;
  priorities: ClientPriority[];
  requirements: EnquiryRequirement[];
  clientContextSections: ClientContextSection[];
  owners: ProjectOwner[];
  scopeGroups: ScopeGroupViewModel[];
  unconfirmedScope: string[];
  intelligence: EnquiryIntelligence;
}

export function buildClientContextSections(
  requirements: EnquiryRequirement[],
  enquiry: EnquiryRecord
): ClientContextSection[] {
  const userProfileItems: ClientContextItem[] = [
    {
      id: "cc-prof-users",
      category: "client",
      label: "Client / User Profile",
      value: "Family of 4 (Parents + 2 School-age Children) + Elderly Grandparents visiting",
      state: "confirmed",
      priority: "p1",
      source: "client",
    },
    {
      id: "cc-prof-decision-maker",
      category: "client",
      label: "Primary Decision Maker",
      value: "Ananya Builders (Managing Partner / Key Stakeholder)",
      state: "confirmed",
      priority: "p1",
      source: "client",
    },
    {
      id: "cc-prof-children",
      category: "client",
      label: "Children",
      value: "2 school-age children (require bedroom study desks)",
      state: "confirmed",
      priority: "p1",
      source: "client",
    },
    {
      id: "cc-prof-elderly",
      category: "client",
      label: "Elderly Usage",
      value: "Grandparents visiting regularly (prefer ground floor access)",
      state: "confirmed",
      priority: "p1",
      source: "client",
    },
    {
      id: "cc-prof-access",
      category: "client",
      label: "Accessibility Needs",
      value: "Level entry & wide doorways preferred for ground floor",
      state: "needs_clarification",
      priority: "p2",
      source: "odin",
    },
    {
      id: "cc-prof-wfh-users",
      category: "client",
      label: "Work-from-home Users",
      value: "1 dedicated primary user + occasional study user",
      state: "confirmed",
      priority: "p1",
      source: "client",
    },
  ];

  const lifestyleItems: ClientContextItem[] = [
    {
      id: "cc-life-wfh",
      category: "lifestyle",
      label: "Work From Home",
      value: "Regular work-from-home use required (quiet acoustic workspace)",
      state: "confirmed",
      priority: "p1",
      source: "client",
    },
    {
      id: "cc-life-entertaining",
      category: "lifestyle",
      label: "Entertaining Frequency",
      value: "Occasional family gatherings & weekend dinners for 8–12 guests",
      state: "confirmed",
      priority: "p2",
      source: "client",
    },
    {
      id: "cc-life-outdoor",
      category: "lifestyle",
      label: "Outdoor Usage",
      value: "Garden & courtyard frequently used for morning tea and sit-out relaxation",
      state: "confirmed",
      priority: "p1",
      source: "client",
    },
    {
      id: "cc-life-privacy",
      category: "lifestyle",
      label: "Privacy Needs",
      value: "High street-facing privacy towards front road via vertical louvers",
      state: "confirmed",
      priority: "p1",
      source: "client",
    },
    {
      id: "cc-life-cooking",
      category: "lifestyle",
      label: "Cooking & Kitchen Pattern",
      value: "Open kitchen with breakfast island & tall pantry preferred",
      state: "confirmed",
      priority: "p2",
      source: "client",
    },
    {
      id: "cc-life-maintenance",
      category: "lifestyle",
      label: "Maintenance Preference",
      value: "Low-maintenance finishes & durable floor materials",
      state: "confirmed",
      priority: "p1",
      source: "client",
    },
  ];

  const decisionItems: ClientContextItem[] = [
    {
      id: "cc-dec-maker",
      category: "decision",
      label: "Primary Decision Maker",
      value: "Ananya Builders (Single point of contact)",
      state: "confirmed",
      priority: "p1",
      source: "client",
    },
    {
      id: "cc-dec-signoff",
      category: "decision",
      label: "Final Sign-off Authority",
      value: "Single decision-maker approval required for phase transitions",
      state: "confirmed",
      priority: "p1",
      source: "client",
    },
    {
      id: "cc-dec-budget-auth",
      category: "decision",
      label: "Budget Approval Authority",
      value: "Budget approval aligned with primary decision maker",
      state: "confirmed",
      priority: "p1",
      source: "client",
    },
    {
      id: "cc-dec-revisions",
      category: "decision",
      label: "Revision Expectations",
      value: "2–3 major design review rounds expected before GFC release",
      state: "odin_inferred",
      priority: "p2",
      source: "odin",
    },
    {
      id: "cc-dec-turnaround",
      category: "decision",
      label: "Decision Turnaround",
      value: "2–3 business days per milestone review",
      state: "needs_clarification",
      priority: "p2",
      source: "odin",
    },
  ];

  const communicationItems: ClientContextItem[] = [
    {
      id: "cc-comm-channel",
      category: "communication",
      label: "Primary Channel",
      value: "Kallisto Ecosystem Platform & WhatsApp summary updates",
      state: "confirmed",
      priority: "p1",
      source: "client",
    },
    {
      id: "cc-comm-reviews",
      category: "communication",
      label: "Design Reviews",
      value: "Weekly milestone-based review meetings",
      state: "confirmed",
      priority: "p1",
      source: "client",
    },
    {
      id: "cc-comm-format",
      category: "communication",
      label: "Review Format",
      value: "2D Drawings + 3D Visual Walkthrough previews",
      state: "confirmed",
      priority: "p1",
      source: "client",
    },
    {
      id: "cc-comm-site",
      category: "communication",
      label: "Site Meetings",
      value: "Bi-weekly site inspection meetings during construction",
      state: "needs_clarification",
      priority: "p2",
      source: "odin",
    },
    {
      id: "cc-comm-response",
      category: "communication",
      label: "Response Turnaround",
      value: "24-hour response expected for urgent queries",
      state: "confirmed",
      priority: "p2",
      source: "client",
    },
  ];

  return [
    {
      key: "client_user_profile",
      title: "CLIENT & USER PROFILE",
      subtitle: "Household, occupants, accessibility, stakeholder roles & usage context.",
      iconName: "Users",
      iconColor: "#2563eb",
      items: userProfileItems,
    },
    {
      key: "lifestyle_usage",
      title: "LIFESTYLE & USAGE",
      subtitle: "Occupancy patterns, daily routine, entertaining & privacy behavior.",
      iconName: "Smile",
      iconColor: "#059669",
      items: lifestyleItems,
    },
    {
      key: "decision_making",
      title: "DECISION MAKING",
      subtitle: "Stakeholder approval hierarchy, revision expectations & budget authority.",
      iconName: "UserCheck",
      iconColor: "#7c3aed",
      items: decisionItems,
    },
    {
      key: "communication_reviews",
      title: "COMMUNICATION & REVIEWS",
      subtitle: "Preferred communication channels, review formats & meeting frequency.",
      iconName: "MessageSquare",
      iconColor: "#d97706",
      items: communicationItems,
    },
  ];
}

export function buildEnquiryDetailViewModel({
  enquiry,
  providerContext,
}: {
  enquiry: EnquiryRecord;
  providerContext?: ServiceProviderContext;
}): EnquiryDetailViewModel {
  const intelligence = deriveEnquiryIntelligence(enquiry, providerContext);

  const formattedDate = enquiry.receivedAt
    ? new Date(enquiry.receivedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  const projectTypeLabel =
    enquiry.backendProjectType ||
    (enquiry.projectType === "commercial"
      ? "Commercial Interior"
      : enquiry.projectType === "residential"
      ? "Residential Design"
      : enquiry.projectType === "hospitality"
      ? "Hospitality Fit-out"
      : enquiry.projectType === "multi_family"
      ? "Multi-family Planning"
      : enquiry.projectType === "landscape"
      ? "Landscape Architecture"
      : enquiry.projectType === "retail"
      ? "Retail Store Design"
      : "Interior Project");

  const header: ProjectHeaderViewModel = {
    title: enquiry.title || "Villa Design Consultation",
    projectType: projectTypeLabel,
    stage: enquiry.stage || "new",
    status: enquiry.status || "active",
    clientName: enquiry.clientName || "Client",
    location: enquiry.location || "Bengaluru",
    receivedDate: formattedDate,
    source: enquiry.source || "website",
    enquiryRef: enquiry.enquiryRef || "ENQ-2026-0486",
  };

  const snapshot: ProjectSnapshotViewModel = {
    projectType: projectTypeLabel,
    duration: enquiry.duration || enquiry.timeline || "Within 6 Months",
    builtUpArea: enquiry.builtUpArea || "2,800 – 3,200 sq ft",
    budget: enquiry.budget || "₹40L – ₹60L",
    client: enquiry.clientName || "—",
    budgetCoverageStatus: enquiry.budgetCoverageStatus || "Coverage partially defined",
    areaCoverageStatus: enquiry.areaCoverageStatus || "Client supplied",
  };

  const requirements = enquiry.requirements || DEFAULT_ENQUIRY_REQUIREMENTS;
  const priorities = enquiry.clientPriorities || getClientPriorities(enquiry);
  const unconfirmedScope = enquiry.unconfirmedScope || getUnconfirmedScope(enquiry);

  const isCommercial = enquiry.projectType === "commercial";

  // Strictly backend-sourced scope categories (project_scope + children).
  // Backend data wins whenever the record carries project_scope rows.
  const backendScopeGroups: ScopeGroupViewModel[] =
    enquiry.projectScopes && enquiry.projectScopes.length > 0
      ? enquiry.projectScopes.map((scope, idx) => ({
          title: scope.scope_name,
          items: (scope.items ?? []).map((item) => ({ label: item, confirmed: true })),
          scopeId: scope.id,
          sortOrder: idx + 1,
        }))
      : [];

  // Last-resort default groups for records that have NO backend scope
  // rows (e.g. legacy/mock records). Never used when backend data exists.
  const fallbackScopeGroups: ScopeGroupViewModel[] = isCommercial
    ? [
        {
          title: "Space Planning & Layout",
          items: [
            { label: "Open-plan workstation arrangement (50+ capacity)", confirmed: true },
            { label: "2 Executive Cabins & 1 Conference Room", confirmed: true },
            { label: "Reception Area & Visitor Lounge", confirmed: true },
            { label: "Pantry & Breakout Zone", confirmed: true },
          ],
        },
        {
          title: "Civil & Interior Fit-out",
          items: [
            { label: "Glass acoustic partition walls", confirmed: true },
            { label: "Custom reception desk & credenza storage", confirmed: true },
            { label: "Gypsum & grid false ceiling works", confirmed: true },
            { label: "Commercial grade carpet & vinyl flooring", confirmed: true },
          ],
        },
        {
          title: "MEP & Infrastructure",
          items: [
            { label: "Electrical wiring & floor raceways for workstations", confirmed: true },
            { label: "Modular LED ceiling lighting fixture installation", confirmed: true },
            { label: "HVAC duct relocation & diffuser fitting", confirmed: true },
            { label: "Data cabling & server room trunking", confirmed: true },
          ],
        },
      ]
    : [
        {
          title: "Space & Room Planning",
          items: [
            { label: "Formal Living Room & Dining Suite", confirmed: true },
            { label: "Master Bedroom Suite with Walk-in Closet", confirmed: true },
            { label: "Dedicated Home Office & Study Suite", confirmed: true },
            { label: "Courtyard cutout for daylight & cross ventilation", confirmed: true },
          ],
        },
        {
          title: "Architecture & Interior Fit-out",
          items: [
            { label: "Custom teak joinery & fixed wardrobe units", confirmed: true },
            { label: "Microcement wall finishes & natural stone flooring", confirmed: true },
            { label: "Acoustic insulation for master & study suites", confirmed: true },
            { label: "Terrace pergola & outdoor lounge landscaping", confirmed: true },
          ],
        },
        {
          title: "MEP & Infrastructure",
          items: [
            { label: "3-Phase electrical distribution & smart scene lighting", confirmed: true },
            { label: "High-efficiency VRF HVAC air conditioning layout", confirmed: true },
            { label: "Plumbing layout for master bath & powder room", confirmed: true },
            { label: "5kW Rooftop solar PV & rainwater harvesting", confirmed: false },
          ],
        },
      ];

  const clientContextSections = buildClientContextSections(requirements, enquiry);

  const scopeGroups: ScopeGroupViewModel[] =
    backendScopeGroups.length > 0 ? backendScopeGroups : fallbackScopeGroups;

  return {
    enquiryId: enquiry.id,
    header,
    brief: intelligence.odinBrief,
    snapshot,
    priorities,
    requirements,
    clientContextSections,
    owners: DEFAULT_PROJECT_OWNERS,
    scopeGroups,
    unconfirmedScope,
    intelligence,
  };
}
