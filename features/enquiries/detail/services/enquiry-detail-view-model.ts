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

/** Requirement group straight from backend requirements rows, each with
 * its requirement_items children. Strictly backend-sourced; the workspace
 * must never substitute mock requirement groups when this list is present. */
export interface BackendRequirementGroup {
  id: string;
  requirement_name: string;
  items: string[];
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
    idNumber: "KLS-000000001",
    name: "Primary Contact",
    email: "contact@client.com",
    role: "Primary Owner",
    avatarInitials: "PC",
    status: "Active",
    nextReview: "TBD",
    tag1: "Decision Maker",
    tag2: "Client",
    timeOrOrg: "Client Organization",
    bio: "Primary decision maker for project approvals.",
    meta: { expOrAge: "N/A", roleScope: "Owner", location: "N/A", channel: "Portal", status: "Confirmed" },
    isPrimary: true,
  },
];

export interface ClientHouseholdMember {
  id: string;
  name: string;
  relationship: string;
  avatarInitials: string;
  photoUrl?: string;
  age?: number | string;
  occupation?: string;
  residenceStatus: string;
  isPrimaryClient?: boolean;
  decisionRole: "Primary Decision Maker" | "Co-decision Maker" | "Influencer" | "Household Member";
  /** 2–3 curated design-relevant needs shown in collapsed card state */
  keyNeeds: string[];
  workPattern?: string;
  privacyLevel?: string;
  bedroomRequirement?: string;
  accessibilityNeeds?: string;
  specialNotes?: string;
  /** Optional description from backend family_details.description. */
  description?: string | null;
}

/** Row for backend requirement grid display. */
export interface BackendRequirementRow {
  id: string;
  domain: string;
  requirement_name: string;
  value: string;
  confirmed: boolean;
  source?: string;
  evidence?: string;
}

export const DEFAULT_RESIDENTIAL_HOUSEHOLD: ClientHouseholdMember[] = [
  {
    id: "mem-1",
    name: "Primary Contact",
    relationship: "Owner",
    avatarInitials: "PC",
    age: "N/A",
    occupation: "N/A",
    residenceStatus: "N/A",
    isPrimaryClient: true,
    decisionRole: "Primary Decision Maker",
    keyNeeds: ["Contact for project decisions"],
  },
];

export const DEFAULT_COMMERCIAL_STAKEHOLDERS: ClientHouseholdMember[] = [
  {
    id: "comm-1",
    name: "Primary Contact",
    relationship: "Managing Partner",
    avatarInitials: "PC",
    age: "N/A",
    occupation: "N/A",
    residenceStatus: "N/A",
    isPrimaryClient: true,
    decisionRole: "Primary Decision Maker",
    keyNeeds: ["Contact for project decisions"],
  },
];

export interface EnquiryDetailViewModel {
  enquiryId: string;
  header: ProjectHeaderViewModel;
  brief: OdinBriefViewModel;
  snapshot: ProjectSnapshotViewModel;
  priorities: ClientPriority[];
  requirements: EnquiryRequirement[];
  /** Requirement groups straight from the backend requirements table
   * (requirement_name + requirement_items). Strictly backend-sourced;
   * an empty list means the backend has no requirement rows. */
  backendRequirements: BackendRequirementGroup[];
  clientContextSections: ClientContextSection[];
  owners: ProjectOwner[];
  householdMembers: ClientHouseholdMember[];
  isCommercialProject: boolean;
  scopeGroups: ScopeGroupViewModel[];
  unconfirmedScope: string[];
  intelligence: EnquiryIntelligence;
}

export function buildClientContextSections(
  requirements: EnquiryRequirement[],
  enquiry: EnquiryRecord
): ClientContextSection[] {
  // Derive client context from actual backend data when present.
  // Use backend requirements to infer household composition.
  const hasBackendRequirements = (requirements ?? []).length > 0;
  const householdSize = enquiry.familyMembers?.length || 1;

  const userProfileItems: ClientContextItem[] = [
    {
      id: "cc-prof-users",
      category: "client",
      label: "Client / User Profile",
      value: enquiry.clientName || "Not specified",
      state: "confirmed",
      priority: "p1",
      source: "client",
    },
    {
      id: "cc-prof-decision-maker",
      category: "client",
      label: "Primary Decision Maker",
      value: enquiry.decisionMaker || enquiry.clientName || "Not specified",
      state: "confirmed",
      priority: "p1",
      source: "client",
    },
    {
      id: "cc-prof-household",
      category: "client",
      label: "Household / Stakeholders",
      value: `${householdSize} registered member(s)`,
      state: hasBackendRequirements ? "confirmed" : "needs_clarification",
      priority: "p1",
      source: "client",
    },
    {
      id: "cc-prof-access",
      category: "client",
      label: "Accessibility Needs",
      value: enquiry.accessibilityNeeds || "Not specified",
      state: enquiry.accessibilityNeeds ? "confirmed" : "needs_clarification",
      priority: "p2",
      source: enquiry.accessibilityNeeds ? "client" : "odin",
    },
    {
      id: "cc-prof-wfh-users",
      category: "client",
      label: "Work-from-home Users",
      value: enquiry.workFromHomeUsers || "Not specified",
      state: enquiry.workFromHomeUsers ? "confirmed" : "needs_clarification",
      priority: "p1",
      source: enquiry.workFromHomeUsers ? "client" : "odin",
    },
  ];

  const lifestyleItems: ClientContextItem[] = [
    {
      id: "cc-life-entertaining",
      category: "lifestyle",
      label: "Entertaining Frequency",
      value: enquiry.entertainingFrequency || "Not specified",
      state: enquiry.entertainingFrequency ? "confirmed" : "needs_clarification",
      priority: "p2",
      source: enquiry.entertainingFrequency ? "client" : "odin",
    },
    {
      id: "cc-life-outdoor",
      category: "lifestyle",
      label: "Outdoor Usage",
      value: enquiry.outdoorUsage || "Not specified",
      state: enquiry.outdoorUsage ? "confirmed" : "needs_clarification",
      priority: "p1",
      source: enquiry.outdoorUsage ? "client" : "odin",
    },
    {
      id: "cc-life-privacy",
      category: "lifestyle",
      label: "Privacy Needs",
      value: enquiry.privacyNeeds || "Not specified",
      state: enquiry.privacyNeeds ? "confirmed" : "needs_clarification",
      priority: "p1",
      source: enquiry.privacyNeeds ? "client" : "odin",
    },
    {
      id: "cc-life-cooking",
      category: "lifestyle",
      label: "Cooking & Kitchen Pattern",
      value: enquiry.kitchenPattern || "Not specified",
      state: enquiry.kitchenPattern ? "confirmed" : "needs_clarification",
      priority: "p2",
      source: enquiry.kitchenPattern ? "client" : "odin",
    },
    {
      id: "cc-life-maintenance",
      category: "lifestyle",
      label: "Maintenance Preference",
      value: enquiry.maintenancePreference || "Not specified",
      state: enquiry.maintenancePreference ? "confirmed" : "needs_clarification",
      priority: "p1",
      source: enquiry.maintenancePreference ? "client" : "odin",
    },
  ];

  const decisionItems: ClientContextItem[] = [
    {
      id: "cc-dec-maker",
      category: "decision",
      label: "Primary Decision Maker",
      value: enquiry.decisionMaker || enquiry.clientName || "Not specified",
      state: "confirmed",
      priority: "p1",
      source: "client",
    },
    {
      id: "cc-dec-signoff",
      category: "decision",
      label: "Final Sign-off Authority",
      value: enquiry.signOffAuthority || enquiry.clientName || "Not specified",
      state: enquiry.signOffAuthority ? "confirmed" : "needs_clarification",
      priority: "p1",
      source: enquiry.signOffAuthority ? "client" : "odin",
    },
    {
      id: "cc-dec-budget-auth",
      category: "decision",
      label: "Budget Approval Authority",
      value: enquiry.budgetAuthority || enquiry.clientName || "Not specified",
      state: enquiry.budgetAuthority ? "confirmed" : "needs_clarification",
      priority: "p1",
      source: enquiry.budgetAuthority ? "client" : "odin",
    },
    {
      id: "cc-dec-revisions",
      category: "decision",
      label: "Revision Expectations",
      value: enquiry.revisionExpectations || "Not specified",
      state: enquiry.revisionExpectations ? "confirmed" : "needs_clarification",
      priority: "p2",
      source: enquiry.revisionExpectations ? "client" : "odin",
    },
    {
      id: "cc-dec-turnaround",
      category: "decision",
      label: "Decision Turnaround",
      value: enquiry.decisionTurnaround || "Not specified",
      state: enquiry.decisionTurnaround ? "confirmed" : "needs_clarification",
      priority: "p2",
      source: enquiry.decisionTurnaround ? "client" : "odin",
    },
  ];

  const communicationItems: ClientContextItem[] = [
    {
      id: "cc-comm-channel",
      category: "communication",
      label: "Primary Channel",
      value: enquiry.primaryChannel || "Kallisto Portal",
      state: "confirmed",
      priority: "p1",
      source: "client",
    },
    {
      id: "cc-comm-reviews",
      category: "communication",
      label: "Design Reviews",
      value: enquiry.reviewFrequency || "Not specified",
      state: enquiry.reviewFrequency ? "confirmed" : "needs_clarification",
      priority: "p1",
      source: enquiry.reviewFrequency ? "client" : "odin",
    },
    {
      id: "cc-comm-format",
      category: "communication",
      label: "Review Format",
      value: enquiry.reviewFormat || "Not specified",
      state: enquiry.reviewFormat ? "confirmed" : "needs_clarification",
      priority: "p1",
      source: enquiry.reviewFormat ? "client" : "odin",
    },
    {
      id: "cc-comm-site",
      category: "communication",
      label: "Site Meetings",
      value: enquiry.siteMeetingFrequency || "Not specified",
      state: enquiry.siteMeetingFrequency ? "confirmed" : "needs_clarification",
      priority: "p2",
      source: enquiry.siteMeetingFrequency ? "client" : "odin",
    },
    {
      id: "cc-comm-response",
      category: "communication",
      label: "Response Turnaround",
      value: enquiry.responseTurnaround || "Not specified",
      state: enquiry.responseTurnaround ? "confirmed" : "needs_clarification",
      priority: "p2",
      source: enquiry.responseTurnaround ? "client" : "odin",
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
    client: enquiry.clientName || "Ananya Builders",
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
  const householdMembers = isCommercial
    ? DEFAULT_COMMERCIAL_STAKEHOLDERS
    : DEFAULT_RESIDENTIAL_HOUSEHOLD;

  const scopeGroups: ScopeGroupViewModel[] =
    backendScopeGroups.length > 0 ? backendScopeGroups : fallbackScopeGroups;

  return {
    enquiryId: enquiry.id,
    header,
    brief: intelligence.odinBrief,
    snapshot,
    priorities,
    requirements,
    backendRequirements: (enquiry.requirementsList ?? []).map((requirement) => ({
      id: requirement.id,
      requirement_name: requirement.requirement_name,
      items: requirement.items ?? [],
    })),
    clientContextSections,
    owners: DEFAULT_PROJECT_OWNERS,
    householdMembers,
    isCommercialProject: isCommercial,
    scopeGroups,
    unconfirmedScope,
    intelligence,
  };
}

/** Build backend requirement rows for the detail workspace grid.
 *  Maps each backend requirement item into a displayable row. */
export function buildBackendRequirementRows(
  requirementsList: Array<{ id: string; requirement_name: string; items: string[] }> | undefined
): BackendRequirementRow[] {
  if (!requirementsList || requirementsList.length === 0) return [];
  const rows: BackendRequirementRow[] = [];
  for (const group of requirementsList) {
    if (!group.items || group.items.length === 0) {
      rows.push({
        id: group.id,
        domain: group.id,
        requirement_name: group.requirement_name,
        value: "—",
        confirmed: false,
        source: "backend",
        evidence: "",
      });
      continue;
    }
    for (const item of group.items) {
      rows.push({
        id: `${group.id}-${item}`,
        domain: group.id,
        requirement_name: group.requirement_name,
        value: item,
        confirmed: true,
        source: "backend",
        evidence: "",
      });
    }
  }
  return rows;
}
