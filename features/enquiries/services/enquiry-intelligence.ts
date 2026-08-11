import {
  EnquiryRecord,
  EnquiryRequirement,
  RequirementState,
  RequirementPriority,
  ClientPriority,
} from "../types/enquiry.types";

export interface ServiceProviderContext {
  providerId?: string;
  providerName?: string;
  activeServices?: string[];
  serviceableLocations?: string[];
  preferredProjectTypes?: string[];
  maxBudgetLimit?: number;
  teamAvailability?: "available" | "busy" | "unknown";
  hasRelevantExperience?: boolean;
}

export interface OpportunityFitFactor {
  key: string;
  label: string;
  score: number; // 0-100
  status: "match" | "partial" | "mismatch" | "unknown";
  reason: string;
}

export interface OpportunityFitResult {
  score: number;
  label: "Strong Fit" | "Good Fit" | "Moderate Fit" | "Low Fit";
  factors: OpportunityFitFactor[];
  confidence: "high" | "medium" | "low";
}

export interface RequirementStrengthResult {
  score: number;
  label: "High Confidence" | "Strong" | "Moderate" | "Weak";
  explanation: string;
  totalSignals: number;
  clearSignals: number;
}

export interface ProposalReadinessResult {
  state: "PARTIAL" | "READY" | "BLOCKED";
  criticalGapCount: number;
  reason: string;
}

export interface EvidenceSummaryResult {
  siteImagesCount: number;
  documentsCount: number;
  verifiedCount: number;
  needsVerificationCount: number;
  missingCount: number;
}

export type RecommendedActionType =
  | "request_clarification"
  | "accept_enquiry"
  | "reject_enquiry"
  | "create_proposal"
  | "open_proposal"
  | "schedule_consultation";

export interface RecommendedActionResult {
  primaryAction: {
    type: RecommendedActionType;
    label: string;
    description: string;
  };
  secondaryActions: Array<{
    type: RecommendedActionType;
    label: string;
  }>;
}

export interface EnquiryIntelligence {
  odinBrief: {
    summary: string;
    statusChips: Array<{ label: string; variant: "neutral" | "positive" | "warning" | "purple" }>;
  };
  requirementStrength: RequirementStrengthResult;
  opportunityFit: OpportunityFitResult;
  proposalReadiness: ProposalReadinessResult;
  criticalGaps: string[];
  evidenceSummary: EvidenceSummaryResult;
  recommendedAction: RecommendedActionResult;
}

// ─── Default Mock Requirements for Standalone Enquiry Records ────────────────

export const DEFAULT_ENQUIRY_REQUIREMENTS: EnquiryRequirement[] = [
  // 1. PROJECT & CLIENT
  {
    id: "req-proj-type",
    category: "project",
    domain: "project_client",
    label: "Building & Project Type",
    value: "Residential Design & Architectural Fit-out",
    state: "confirmed",
    source: "client",
    priority: "p1",
    confidence: 1.0,
  },
  {
    id: "req-proj-area",
    category: "project",
    domain: "project_client",
    label: "Target Built-up Area",
    value: "2,800 – 3,200 sq ft (Ground + 1 Floor)",
    state: "confirmed",
    source: "client",
    priority: "p1",
    confidence: 1.0,
  },
  {
    id: "req-proj-users",
    category: "client",
    domain: "project_client",
    label: "Client / User Profile",
    value: "Family of 4 (Parents + 2 School-age Children) + Elderly Grandparents visiting",
    state: "confirmed",
    source: "client",
    priority: "p1",
    confidence: 1.0,
  },

  // 2. VISION & STYLE
  {
    id: "req-vis-style",
    category: "style",
    domain: "vision_style",
    label: "Architectural & Interior Style",
    value: "Warm Contemporary Minimalist with natural teak accents and microcement finishes",
    state: "confirmed",
    source: "client",
    priority: "p1",
    confidence: 0.9,
  },
  {
    id: "req-vis-light",
    category: "vision",
    domain: "vision_style",
    label: "Natural Light & Ventilation",
    value: "High priority: Courtyard cutout to maximize cross ventilation and natural morning daylight",
    state: "confirmed",
    source: "client",
    priority: "p1",
    confidence: 1.0,
  },
  {
    id: "req-vis-color",
    category: "style",
    domain: "vision_style",
    label: "Colour Palette & Avoidances",
    value: "Earthy tones, warm beige, soft terracotta accents. Avoid glossy white tiles and dark ceiling paint.",
    state: "odin_inferred",
    source: "odin",
    priority: "p2",
    confidence: 0.85,
  },

  // 3. LIFESTYLE / USER BEHAVIOUR
  {
    id: "req-life-wfh",
    category: "lifestyle",
    domain: "lifestyle",
    label: "Work-from-Home & Study Needs",
    value: "Dedicated acoustic Home Office suite for dual monitors + 2 kids study desks in bedroom",
    state: "confirmed",
    source: "client",
    priority: "p1",
    confidence: 0.95,
  },
  {
    id: "req-life-entertain",
    category: "lifestyle",
    domain: "lifestyle",
    label: "Hosting & Social Life",
    value: "Frequent weekend entertaining for 8–12 guests; seamless indoor-outdoor terrace flow",
    state: "confirmed",
    source: "client",
    priority: "p2",
    confidence: 0.9,
  },

  // 4. SPACE / ROOM PROGRAMME
  {
    id: "req-room-living",
    category: "space",
    domain: "room_programme",
    label: "Formal Living Room",
    state: "confirmed",
    source: "client",
    priority: "p1",
    confidence: 1.0,
    spaceValue: {
      name: "Formal Living Room",
      quantity: 1,
      required: true,
      priority: "essential",
      approximateArea: "280–320 sq ft",
      preferredFloor: "Ground Floor",
      adjacency: ["Dining", "Garden / Courtyard"],
      privacy: "high",
      naturalLight: "high",
      ventilation: "high",
      furniture: ["Seating for 8–10", "TV Accent Wall", "Low Credenza Console"],
      storage: ["Concealed AV Storage"],
      equipment: ["Dimmable Ambient LED Profile Lighting", "Smart TV Wall Mount"],
      specialRequirements: ["Garden facing", "Privacy from main entrance foyer"],
      clientNotes: "Should feel open and welcoming, with seamless visual connection to the garden.",
      odinInterpretation: "Core formal entertainment space required on ground floor.",
    },
  },
  {
    id: "req-room-master",
    category: "space",
    domain: "room_programme",
    label: "Master Bedroom Suite",
    state: "confirmed",
    source: "client",
    priority: "p1",
    confidence: 1.0,
    spaceValue: {
      name: "Master Bedroom Suite",
      quantity: 1,
      required: true,
      priority: "essential",
      approximateArea: "250–280 sq ft",
      preferredFloor: "First Floor",
      adjacency: ["Walk-in Closet", "Ensuite Master Bath", "Private Balcony"],
      privacy: "high",
      naturalLight: "high",
      ventilation: "high",
      furniture: ["King Size Bed", "Twin Side Tables", "Lounge Armchair"],
      storage: ["Walk-in Wardrobe System"],
      equipment: ["Split Air Conditioner", "Smart Lighting Control"],
      specialRequirements: ["East-facing morning light balcony access"],
      clientNotes: "Wants a tranquil sanctuary feeling with wooden floor finishes.",
      odinInterpretation: "Primary adult suite with dedicated private balcony.",
    },
  },
  {
    id: "req-room-office",
    category: "space",
    domain: "room_programme",
    label: "Home Office & Library",
    state: "partial",
    source: "client",
    priority: "p1",
    confidence: 0.8,
    spaceValue: {
      name: "Home Office & Library",
      quantity: 1,
      required: true,
      priority: "essential",
      approximateArea: "150–180 sq ft",
      preferredFloor: "Ground or Mezzanine",
      adjacency: ["Main Entrance Foyer"],
      privacy: "high",
      naturalLight: "medium",
      ventilation: "medium",
      furniture: ["Executive Desk", "Ergonomic Office Chair", "Bookcase Wall"],
      storage: ["Filing Storage & Document Safe"],
      equipment: ["Acoustic Wall Panels", "High-speed Data Outlets"],
      specialRequirements: ["Video call backdrop & acoustic isolation"],
      clientNotes: "Requires quiet work environment for video conferences.",
      odinInterpretation: "Requires clarification on acoustic wall treatment scope.",
    },
  },
  {
    id: "req-room-kitchen",
    category: "space",
    domain: "room_programme",
    label: "Island Kitchen & Pantry",
    state: "confirmed",
    source: "client",
    priority: "p1",
    confidence: 0.95,
    spaceValue: {
      name: "Island Kitchen & Pantry",
      quantity: 1,
      required: true,
      priority: "essential",
      approximateArea: "200–220 sq ft",
      preferredFloor: "Ground Floor",
      adjacency: ["Dining Room", "Utility / Wet Kitchen"],
      privacy: "medium",
      naturalLight: "high",
      ventilation: "high",
      furniture: ["Breakfast Island with 3 Stools", "Modular Cabinets"],
      storage: ["Tall Pantry Unit", "Under-counter Drawers"],
      equipment: ["Built-in Hob & Chimney", "Dishwasher Space", "Built-in Oven"],
      specialRequirements: ["Quartz countertop & soft-close Blum fittings"],
      clientNotes: "Open kitchen design with breakfast island.",
      odinInterpretation: "Confirmed modular kitchen with dry island setup.",
    },
  },

  // 5. EXTERIOR & FACADE
  {
    id: "req-ext-facade",
    category: "project",
    domain: "exterior_facade",
    label: "Facade Character & Materials",
    value: "Contemporary slatted louvers + local stone cladding + textured exterior plaster",
    state: "confirmed",
    source: "client",
    priority: "p1",
    confidence: 0.9,
  },
  {
    id: "req-ext-roof",
    category: "project",
    domain: "exterior_facade",
    label: "Roof & Overhang Character",
    value: "Flat roof with deep cantilevered overhang projections for solar shading",
    state: "partial",
    source: "odin",
    priority: "p2",
    confidence: 0.75,
  },
  {
    id: "req-ext-window",
    category: "project",
    domain: "exterior_facade",
    label: "Window / Opening Strategy",
    value: "Large shaded glass openings for morning daylight & cross-ventilation",
    state: "confirmed",
    source: "client",
    priority: "p1",
    confidence: 0.95,
  },
  {
    id: "req-ext-privacy",
    category: "project",
    domain: "exterior_facade",
    label: "Street Privacy Screening",
    value: "High privacy screening towards front west-facing road via vertical timber louvers",
    state: "confirmed",
    source: "client",
    priority: "p1",
    confidence: 0.9,
  },
  {
    id: "req-ext-lighting",
    category: "project",
    domain: "exterior_facade",
    label: "Exterior Architectural Lighting",
    value: "Warm 3000K subtle LED accent illumination highlighting textured stone facades",
    state: "partial",
    source: "odin",
    priority: "p2",
    confidence: 0.8,
  },

  // 6. OUTDOOR & LANDSCAPE
  {
    id: "req-land-courtyard",
    category: "outdoor",
    domain: "outdoor_landscape",
    label: "Courtyard & Garden Lawn",
    value: "Central open courtyard garden + tropical perimeter landscaping with automated drip irrigation",
    state: "confirmed",
    source: "client",
    priority: "p1",
    confidence: 0.9,
  },
  {
    id: "req-land-parking",
    category: "outdoor",
    domain: "outdoor_landscape",
    label: "Parking & Automated Gate",
    value: "2 SUV covered carports + EV charging point + automated sliding entry gate",
    state: "confirmed",
    source: "client",
    priority: "p1",
    confidence: 1.0,
  },
  {
    id: "req-land-sitout",
    category: "outdoor",
    domain: "outdoor_landscape",
    label: "Outdoor Sit-out Deck",
    value: "Garden-facing teak wood deck seating connected to living room terrace",
    state: "confirmed",
    source: "client",
    priority: "p1",
    confidence: 0.9,
  },
  {
    id: "req-land-pool",
    category: "outdoor",
    domain: "outdoor_landscape",
    label: "Swimming Pool / Water Feature",
    value: "Optional compact plunge pool or linear water wall along garden boundary",
    state: "partial",
    source: "odin",
    priority: "p2",
    confidence: 0.7,
  },
  {
    id: "req-land-boundary",
    category: "outdoor",
    domain: "outdoor_landscape",
    label: "Boundary Wall & Fencing",
    value: "Privacy-oriented local stone & composite louver boundary wall",
    state: "confirmed",
    source: "client",
    priority: "p2",
    confidence: 0.95,
  },

  // 7. SITE REQUIREMENTS
  {
    id: "req-site-orientation",
    category: "site",
    domain: "site",
    label: "Plot Orientation",
    value: "West-facing plot",
    state: "needs_verification",
    source: "client",
    priority: "p1",
    confidence: 0.8,
  },
  {
    id: "req-site-access",
    category: "site",
    domain: "site",
    label: "Road Access",
    value: "12m wide asphalt municipal access road",
    state: "needs_verification",
    source: "client",
    priority: "p1",
    confidence: 0.8,
  },
  {
    id: "req-site-area",
    category: "site",
    domain: "site",
    label: "Plot Area",
    value: "10.2 cents (approx. 4,440 sq ft)",
    state: "partial",
    source: "client",
    priority: "p1",
    confidence: 0.75,
  },
  {
    id: "req-site-topo",
    category: "site",
    domain: "site",
    label: "Topography",
    value: "Mostly flat with 0.5m gentle slope to rear boundary",
    state: "needs_verification",
    source: "client",
    priority: "p2",
    confidence: 0.7,
  },
  {
    id: "req-site-trees",
    category: "site",
    domain: "site",
    label: "Existing Trees",
    value: "Mature mango tree at rear boundary to be preserved",
    state: "needs_verification",
    source: "client",
    priority: "p2",
    confidence: 0.85,
  },
  {
    id: "req-site-utils",
    category: "site",
    domain: "site",
    label: "Utility Connections",
    value: "3-Phase electrical power + municipal water supply line available",
    state: "partial",
    source: "client",
    priority: "p2",
    confidence: 0.75,
  },

  // 8. TECHNICAL REQUIREMENTS
  {
    id: "req-tech-hvac",
    category: "technical",
    domain: "technical",
    label: "HVAC System",
    value: "VRF AC system to living spaces + all bedrooms",
    state: "partial",
    source: "client",
    priority: "p1",
    confidence: 0.8,
  },
  {
    id: "req-tech-elec",
    category: "technical",
    domain: "technical",
    label: "Electrical Power",
    value: "3-Phase power load with dedicated sub-panel",
    state: "confirmed",
    source: "client",
    priority: "p1",
    confidence: 0.95,
  },
  {
    id: "req-tech-light",
    category: "technical",
    domain: "technical",
    label: "Lighting System",
    value: "Smart dimmable LED architectural scene lighting",
    state: "partial",
    source: "client",
    priority: "p1",
    confidence: 0.85,
  },
  {
    id: "req-tech-solar",
    category: "technical",
    domain: "technical",
    label: "Solar PV System",
    value: "5kW rooftop solar PV grid-tied installation",
    state: "odin_inferred",
    source: "odin",
    priority: "p2",
    confidence: 0.8,
  },
  {
    id: "req-tech-rain",
    category: "technical",
    domain: "technical",
    label: "Rainwater Harvesting",
    value: "10,000L underground rainwater collection & filtration tank",
    state: "odin_inferred",
    source: "odin",
    priority: "p2",
    confidence: 0.8,
  },
  {
    id: "req-tech-smarthome",
    category: "technical",
    domain: "technical",
    label: "Smart Home",
    value: "Basic lighting, curtain & security automation",
    state: "partial",
    source: "client",
    priority: "p2",
    confidence: 0.75,
  },
  {
    id: "req-tech-security",
    category: "technical",
    domain: "technical",
    label: "Security & Access",
    value: "8-channel IP CCTV surveillance + smart video doorbell",
    state: "confirmed",
    source: "client",
    priority: "p2",
    confidence: 0.9,
  },

  // 9. BUDGET & COMMERCIAL
  {
    id: "req-bud-overall",
    category: "budget",
    domain: "budget_commercial",
    label: "Overall Budget Range",
    value: "₹40L – ₹60L",
    state: "confirmed",
    source: "client",
    priority: "p1",
    confidence: 0.9,
  },
  {
    id: "req-bud-const",
    category: "budget",
    domain: "budget_commercial",
    label: "Civil / Construction Scope",
    value: "Not clearly defined (Structural alterations included?)",
    state: "needs_clarification",
    source: "odin",
    priority: "p1",
    confidence: 0.5,
  },
  {
    id: "req-bud-fitout",
    category: "budget",
    domain: "budget_commercial",
    label: "Interior Fit-out Scope",
    value: "Included (Fixed joinery, wardrobes, wall finishes)",
    state: "partial",
    source: "client",
    priority: "p1",
    confidence: 0.8,
  },
  {
    id: "req-bud-furniture",
    category: "budget",
    domain: "budget_commercial",
    label: "Loose Furniture",
    value: "Coverage not confirmed (Client sourcing vs SP package?)",
    state: "needs_clarification",
    source: "odin",
    priority: "p2",
    confidence: 0.5,
  },
  {
    id: "req-bud-mep",
    category: "budget",
    domain: "budget_commercial",
    label: "MEP Works",
    value: "Needs confirmation on electrical raceway & HVAC budget allocation",
    state: "needs_clarification",
    source: "odin",
    priority: "p1",
    confidence: 0.55,
  },

  // 10. TIMELINE
  {
    id: "req-time-start",
    category: "timeline",
    domain: "timeline",
    label: "Preferred Start Date",
    value: "Dec 2026",
    state: "confirmed",
    source: "client",
    priority: "p1",
    confidence: 0.9,
  },
  {
    id: "req-time-duration",
    category: "timeline",
    domain: "timeline",
    label: "Target Completion",
    value: "Within 6 Months of site handover",
    state: "confirmed",
    source: "client",
    priority: "p1",
    confidence: 0.9,
  },
  {
    id: "req-time-movein",
    category: "timeline",
    domain: "timeline",
    label: "Move-in Target",
    value: "March 2028",
    state: "confirmed",
    source: "client",
    priority: "p2",
    confidence: 0.85,
  },
  {
    id: "req-time-approval",
    category: "timeline",
    domain: "timeline",
    label: "Approval Dependency",
    value: "Local corporation permit submission lead time TBD",
    state: "needs_clarification",
    source: "odin",
    priority: "p1",
    confidence: 0.6,
  },

  // 11. REGULATORY
  {
    id: "req-reg-setbacks",
    category: "regulatory",
    domain: "regulatory",
    label: "Municipal Setbacks",
    value: "Front 3m, Side 1.5m, Rear 2m (Not verified against site survey)",
    state: "needs_verification",
    source: "client",
    priority: "p1",
    confidence: 0.6,
  },
  {
    id: "req-reg-far",
    category: "regulatory",
    domain: "regulatory",
    label: "Coverage / FAR Allowance",
    value: "Max 65% plot coverage / FAR 1.5 (Pending architect verification)",
    state: "needs_verification",
    source: "client",
    priority: "p1",
    confidence: 0.6,
  },
  {
    id: "req-reg-permit",
    category: "regulatory",
    domain: "regulatory",
    label: "Building Permit Submission",
    value: "Corporation approval pending drawings submission",
    state: "needs_clarification",
    source: "odin",
    priority: "p1",
    confidence: 0.5,
  },
  {
    id: "req-reg-liaison",
    category: "regulatory",
    domain: "regulatory",
    label: "Approval Liaison",
    value: "Responsibility allocation unclear (Client vs SP Architect TBD)",
    state: "needs_clarification",
    source: "odin",
    priority: "p1",
    confidence: 0.5,
  },

  // 12. DECISION MAKING
  {
    id: "req-dec-maker",
    category: "decision",
    domain: "decision_making",
    label: "Primary Decision Maker & Process",
    value: "Ananya Builders Managing Partner (Single sign-off for stage approvals)",
    state: "confirmed",
    source: "client",
    priority: "p1",
    confidence: 1.0,
  },

  // 13. COMMUNICATION
  {
    id: "req-comm-channel",
    category: "communication",
    domain: "communication",
    label: "Communication & Review Method",
    value: "Weekly digital progress updates via Kallisto platform + bi-weekly site walk-throughs",
    state: "confirmed",
    source: "client",
    priority: "p2",
    confidence: 0.95,
  },

  // 14. DOCUMENTATION
  {
    id: "req-doc-plan",
    category: "documentation",
    domain: "documentation",
    label: "Existing Floor Plan DWG",
    value: "Received — DWG format (Needs dimension review)",
    state: "needs_verification",
    source: "client",
    priority: "p1",
    confidence: 0.7,
  },
  {
    id: "req-doc-photos",
    category: "documentation",
    domain: "documentation",
    label: "Site Photos",
    value: "7 site photos received from client",
    state: "partial",
    source: "client",
    priority: "p2",
    confidence: 0.85,
  },
  {
    id: "req-doc-moodboard",
    category: "documentation",
    domain: "documentation",
    label: "Reference Moodboards",
    value: "6 reference design images available",
    state: "confirmed",
    source: "client",
    priority: "p2",
    confidence: 0.9,
  },

  // 15. SCOPE
  {
    id: "req-scope-arch",
    category: "scope",
    domain: "scope",
    label: "Architectural Design",
    value: "Full architectural drafting, space planning & GFC drawings",
    state: "confirmed",
    source: "client",
    priority: "p1",
    confidence: 0.95,
  },
  {
    id: "req-scope-interior",
    category: "scope",
    domain: "scope",
    label: "Interior Design",
    value: "Custom joinery, lighting & material specification",
    state: "partial",
    source: "client",
    priority: "p1",
    confidence: 0.85,
  },
  {
    id: "req-scope-consultant",
    category: "scope",
    domain: "scope",
    label: "Consultant Coordination",
    value: "MEP & structural engineer coordination required",
    state: "partial",
    source: "odin",
    priority: "p1",
    confidence: 0.8,
  },
];

export function getClientPriorities(enquiry?: EnquiryRecord): ClientPriority[] {
  if (enquiry?.clientPriorities && enquiry.clientPriorities.length > 0) {
    return enquiry.clientPriorities;
  }
  const isCommercial = enquiry?.projectType === "commercial";
  if (isCommercial) {
    return [
      { id: "prio-1", label: "Collaborative workspace layout", type: "confirmed" },
      { id: "prio-2", label: "Employee comfort & ergonomics", type: "confirmed" },
      { id: "prio-3", label: "Budget control & pricing", type: "inferred" },
      { id: "prio-4", label: "Fast delivery timeline", type: "confirmed" },
      { id: "prio-5", label: "Low-maintenance commercial materials", type: "inferred" },
    ];
  }
  // Default Residential Priorities
  return [
    { id: "prio-1", label: "Natural light & cross ventilation", type: "confirmed" },
    { id: "prio-2", label: "Teak joinery & premium finishes", type: "confirmed" },
    { id: "prio-3", label: "Dedicated home office & study", type: "confirmed" },
    { id: "prio-4", label: "Budget control & stage milestones", type: "inferred" },
    { id: "prio-5", label: "Energy efficiency & solar PV integration", type: "inferred" },
  ];
}

export const DEFAULT_CLIENT_PRIORITIES: ClientPriority[] = getClientPriorities();

export function getUnconfirmedScope(enquiry?: EnquiryRecord): string[] {
  if (enquiry?.unconfirmedScope && enquiry.unconfirmedScope.length > 0) {
    return enquiry.unconfirmedScope;
  }
  const isCommercial = enquiry?.projectType === "commercial";
  if (isCommercial) {
    return [
      "Furniture & loose workstations",
      "Branding & entrance signage",
      "AV & video conferencing hardware",
      "Loose decorative lighting & planters",
    ];
  }
  // Default Residential Unconfirmed Scope
  return [
    "Loose living room & bedroom furniture package",
    "Outdoor landscape & garden terrace installation",
    "Smart home security & scene automation details",
    "Decorative pendant lighting fixtures & art hardware",
  ];
}

export const DEFAULT_UNCONFIRMED_SCOPE: string[] = getUnconfirmedScope();

// ─── 1. Policy Selector: Is Requirement Blocking? ─────────────────────────────

export function isRequirementBlocking(req: EnquiryRequirement): boolean {
  if (req.state === "not_applicable") return false;
  // P0 or P1 requirements in unresolved or partial states block proposal creation
  const isHighPriority = req.priority === "p0" || req.priority === "p1";
  const isUnresolvedState =
    req.state === "not_provided" ||
    req.state === "needs_clarification" ||
    req.state === "partial" ||
    req.state === "needs_verification";

  return isHighPriority && isUnresolvedState;
}

// ─── 2. Derive Requirement Strength ──────────────────────────────────────────

export function deriveRequirementStrength(enquiry: EnquiryRecord): RequirementStrengthResult {
  const reqs = enquiry.requirements || DEFAULT_ENQUIRY_REQUIREMENTS;
  const applicableReqs = reqs.filter((r) => r.state !== "not_applicable");

  if (applicableReqs.length === 0) {
    return {
      score: 50,
      label: "Moderate",
      explanation: "How well do we currently understand the client requirement?",
      totalSignals: 0,
      clearSignals: 0,
    };
  }

  const PRIORITY_WEIGHTS: Record<RequirementPriority, number> = {
    p0: 3,
    p1: 2,
    p2: 1,
  };

  const STATE_MULTIPLIERS: Record<RequirementState, number> = {
    confirmed: 1.0,
    odin_inferred: 0.85,
    partial: 0.5,
    needs_verification: 0.4,
    needs_clarification: 0.2,
    not_provided: 0.0,
    not_applicable: 0.0, // Excluded from active scoring
  };

  let totalWeight = 0;
  let earnedWeight = 0;
  let clearSignalsCount = 0;

  for (const r of applicableReqs) {
    const weight = PRIORITY_WEIGHTS[r.priority] || 1;
    const multiplier = STATE_MULTIPLIERS[r.state] ?? 0;
    totalWeight += weight;
    earnedWeight += weight * multiplier;
    if (r.state === "confirmed" || r.state === "odin_inferred") {
      clearSignalsCount += 1;
    }
  }

  const rawScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 0;
  const score = Math.round(rawScore);

  let label: "High Confidence" | "Strong" | "Moderate" | "Weak" = "Moderate";
  if (score >= 80) label = "High Confidence";
  else if (score >= 65) label = "Strong";
  else if (score >= 40) label = "Moderate";
  else label = "Weak";

  return {
    score,
    label,
    explanation: "How well do we currently understand the client requirement?",
    totalSignals: applicableReqs.length,
    clearSignals: clearSignalsCount,
  };
}

// ─── 3. Derive Opportunity Fit (SP-Contextual) ───────────────────────────────

export function deriveOpportunityFit(
  enquiry: EnquiryRecord,
  providerContext?: ServiceProviderContext
): OpportunityFitResult {
  const factors: OpportunityFitFactor[] = [
    {
      key: "service",
      label: "Service compatibility",
      score: 95,
      status: "match",
      reason: `${enquiry.projectType || "Commercial"} design is an active core offering`,
    },
    {
      key: "location",
      label: "Location & serviceability",
      score: 90,
      status: "match",
      reason: `${enquiry.location || "Location"} is within active operating radius`,
    },
    {
      key: "project_type",
      label: "Project type relevance",
      score: 92,
      status: "match",
      reason: `Strong portfolio track record in ${enquiry.projectType || "commercial"} fitouts`,
    },
    {
      key: "scale",
      label: "Project scale",
      score: 85,
      status: "match",
      reason: `${enquiry.builtUpArea || "2,800–3,200 sq ft"} matches standard project size`,
    },
    {
      key: "budget",
      label: "Budget compatibility",
      score: 82,
      status: "partial",
      reason: `Budget (${enquiry.budget || "₹40L–₹60L"}) is viable; execution breakdown pending`,
    },
  ];

  // Provider context evaluations
  if (providerContext) {
    if (providerContext.teamAvailability) {
      if (providerContext.teamAvailability === "available") {
        factors.push({
          key: "availability",
          label: "Timeline & availability",
          score: 88,
          status: "match",
          reason: "Field team is available for target start date",
        });
      } else if (providerContext.teamAvailability === "busy") {
        factors.push({
          key: "availability",
          label: "Timeline & availability",
          score: 45,
          status: "partial",
          reason: "Team currently assigned to active site; scheduling consultation required",
        });
      } else {
        factors.push({
          key: "availability",
          label: "Timeline & availability",
          score: 0,
          status: "unknown",
          reason: "Not enough data on team availability",
        });
      }
    } else {
      factors.push({
        key: "availability",
        label: "Timeline & availability",
        score: 0,
        status: "unknown",
        reason: "Not enough data",
      });
    }
  } else {
    factors.push({
      key: "availability",
      label: "Timeline & availability",
      score: 0,
      status: "unknown",
      reason: "Not enough data",
    });
  }

  // Calculate average of known factor scores
  const knownFactors = factors.filter((f) => f.status !== "unknown");
  const avgScore =
    knownFactors.length > 0
      ? Math.round(knownFactors.reduce((acc, f) => acc + f.score, 0) / knownFactors.length)
      : 89;

  let label: "Strong Fit" | "Good Fit" | "Moderate Fit" | "Low Fit" = "Strong Fit";
  if (avgScore >= 85) label = "Strong Fit";
  else if (avgScore >= 70) label = "Good Fit";
  else if (avgScore >= 50) label = "Moderate Fit";
  else label = "Low Fit";

  const confidence: "high" | "medium" | "low" = providerContext ? "high" : "medium";

  return {
    score: avgScore,
    label,
    factors,
    confidence,
  };
}

// ─── 4. Derive Proposal Readiness ─────────────────────────────────────────────

export function deriveProposalReadiness(enquiry: EnquiryRecord): ProposalReadinessResult {
  const reqs = enquiry.requirements || DEFAULT_ENQUIRY_REQUIREMENTS;
  const blockingGaps = reqs.filter(isRequirementBlocking);

  if (blockingGaps.length > 0) {
    return {
      state: "PARTIAL",
      criticalGapCount: blockingGaps.length,
      reason: `${blockingGaps.length} critical gap${blockingGaps.length === 1 ? "" : "s"} must be clarified before proposal creation`,
    };
  }

  return {
    state: "READY",
    criticalGapCount: 0,
    reason: "Requirements are clear and validated for proposal creation",
  };
}

// ─── 5. Derive Critical Gaps ──────────────────────────────────────────────────

export function deriveCriticalGaps(enquiry: EnquiryRecord): string[] {
  const reqs = enquiry.requirements || DEFAULT_ENQUIRY_REQUIREMENTS;
  const blockingReqs = reqs.filter(isRequirementBlocking);

  if (blockingReqs.length > 0) {
    return blockingReqs.slice(0, 5).map((r) => r.label);
  }

  // Fallback defaults if requirements array is unpopulated or has no blockers
  return [
    "Budget coverage (confirm furniture & MEP inclusion)",
    "Expected deliverables confirmation",
    "Existing drawing DWG verification",
    "Execution timeline & site handover responsibility",
  ];
}

// ─── 6. Derive Evidence Summary ──────────────────────────────────────────────

export function deriveEvidenceSummary(enquiry: EnquiryRecord): EvidenceSummaryResult {
  return {
    siteImagesCount: 7,
    documentsCount: 9,
    verifiedCount: 4,
    needsVerificationCount: 3,
    missingCount: 2,
  };
}

// ─── 7. Derive Recommended Action (Deterministic) ────────────────────────────

export function deriveRecommendedAction(
  enquiry: EnquiryRecord,
  readinessState: "PARTIAL" | "READY" | "BLOCKED"
): RecommendedActionResult {
  const stage = enquiry.stage || "new";
  const proposalStatus = enquiry.proposalStatus || "none";

  if (stage === "accepted") {
    if (proposalStatus !== "none") {
      return {
        primaryAction: {
          type: "open_proposal",
          label: "View Proposal",
          description: "Proposal is created and available for review.",
        },
        secondaryActions: [{ type: "schedule_consultation", label: "Schedule Consultation" }],
      };
    }
    return {
      primaryAction: {
        type: "create_proposal",
        label: "Create Proposal",
        description: "Enquiry accepted. Proceed with proposal drafting.",
      },
      secondaryActions: [{ type: "schedule_consultation", label: "Schedule Consultation" }],
    };
  }

  // stage === "new" | "idle" | "clarification" | "consultation" | "qualified"
  if (readinessState === "PARTIAL" || readinessState === "BLOCKED") {
    return {
      primaryAction: {
        type: "request_clarification",
        label: "Request Clarification",
        description: "Budget coverage and execution scope should be confirmed before proposal preparation.",
      },
      secondaryActions: [
        { type: "accept_enquiry", label: "Accept Enquiry" },
        { type: "reject_enquiry", label: "Reject" },
      ],
    };
  }

  // Readiness is READY
  return {
    primaryAction: {
      type: "accept_enquiry",
      label: "Accept Enquiry",
      description: "Requirements are clear and validated. Proceed with acceptance.",
    },
    secondaryActions: [{ type: "reject_enquiry", label: "Reject" }],
  };
}

// ─── 8. Main Intelligence Selector ────────────────────────────────────────────

export function deriveEnquiryIntelligence(
  enquiry: EnquiryRecord,
  providerContext?: ServiceProviderContext
): EnquiryIntelligence {
  const requirementStrength = deriveRequirementStrength(enquiry);
  const opportunityFit = deriveOpportunityFit(enquiry, providerContext);
  const proposalReadiness = deriveProposalReadiness(enquiry);
  const criticalGaps = deriveCriticalGaps(enquiry);
  const evidenceSummary = deriveEvidenceSummary(enquiry);
  const recommendedAction = deriveRecommendedAction(enquiry, proposalReadiness.state);

  const briefSummary = `${enquiry.clientName || "The client"} is seeking a ${
    enquiry.projectType || "commercial"
  } fit-out for approximately ${enquiry.builtUpArea || "2,800–3,200 sq ft"} in ${
    enquiry.location || "Bengaluru"
  }. The current requirement covers space planning, interior fit-out and MEP coordination with a ${
    enquiry.budget || "₹40L–₹60L"
  } budget and a ${
    enquiry.duration || "six-month"
  } target. The project is suitable for review, but budget coverage and expected deliverables should be clarified before proposal preparation.`;

  return {
    odinBrief: {
      summary: briefSummary,
      statusChips: [
        { label: "Ready for provider review", variant: "positive" },
        {
          label: `Proposal readiness: ${proposalReadiness.state === "READY" ? "Ready" : "Partial"}`,
          variant: proposalReadiness.state === "READY" ? "positive" : "warning",
        },
      ],
    },
    requirementStrength,
    opportunityFit,
    proposalReadiness,
    criticalGaps,
    evidenceSummary,
    recommendedAction,
  };
}

// ─── 9. Contextual ODIN Insights Selector ──────────────────────────────────────

export type OdinInsightSeverity =
  | "blocker"
  | "verification"
  | "contradiction"
  | "missing_information"
  | "risk"
  | "strength"
  | "recommendation"
  | "change";

export interface OdinInsightAction {
  label: string;
  type: "add_clarification" | "request_document" | "view_evidence";
  payload?: string;
}

export interface OdinContextualInsight {
  id: string;
  severity: OdinInsightSeverity;
  type?: string;
  text: string;
  relatedRequirementIds?: string[];
  relatedEvidenceIds?: string[];
  action?: OdinInsightAction;
}

export function deriveContextualOdinInsights(
  enquiry: EnquiryRecord,
  scope: string
): OdinContextualInsight[] {
  const isResidential = enquiry.projectType !== "commercial";
  const budgetStr = enquiry.budget || "₹40L–₹60L";

  if (scope === "requirements") {
    return [
      {
        id: "req-insight-1",
        severity: "blocker",
        text: `Budget coverage is unresolved and affects reliable commercial pricing against the target ${budgetStr} range.`,
        action: {
          label: "Add question",
          type: "add_clarification",
          payload: `Please clarify if the budget range (${budgetStr}) covers loose furniture and MEP infrastructure items.`,
        },
      },
      {
        id: "req-insight-2",
        severity: "verification",
        text: "Site orientation and municipal setbacks are client-supplied and require independent surveyor verification.",
        action: {
          label: "Add question",
          type: "add_clarification",
          payload: "Could you confirm plot orientation and official municipal setback boundaries?",
        },
      },
      {
        id: "req-insight-3",
        severity: "missing_information",
        text: isResidential
          ? "Technical requirements contain an ODIN-inferred 5kW rooftop solar PV system requiring client sign-off."
          : "Data cabling and server room trunking requirements contain ODIN-inferred specs needing confirmation.",
      },
      {
        id: "req-insight-4",
        severity: "risk",
        text: "Civil construction scope allocation (structural alterations vs fit-out) has unresolved provider responsibilities.",
        action: {
          label: "Add question",
          type: "add_clarification",
          payload: "Please specify structural alteration responsibilities for the civil scope.",
        },
      },
      {
        id: "req-insight-5",
        severity: "strength",
        text: isResidential
          ? "Room programme is 80% confirmed; courtyard daylight cutout and study suite acoustic specs are clear."
          : "Workstation layout (50+ capacity) and executive cabins scope are fully confirmed.",
      },
    ];
  }

  if (scope === "evidence") {
    return [
      {
        id: "evi-insight-1",
        severity: "verification",
        text: "Site orientation and road access are client-supplied and not yet independently verified on site.",
      },
      {
        id: "evi-insight-2",
        severity: "verification",
        text: "Existing floor-plan DWG requires CAD dimension audit before final space planning.",
        action: {
          label: "Request document",
          type: "request_document",
          payload: "Please provide dimensioned DWG floor plans with site boundary measurements.",
        },
      },
      {
        id: "evi-insight-3",
        severity: "missing_information",
        text: "7 site photos received; rear boundary wall and service shaft details lack sufficient visual coverage.",
        action: {
          label: "Add question",
          type: "add_clarification",
          payload: "Could you share additional site photos covering the rear boundary and service shaft?",
        },
      },
      {
        id: "evi-insight-4",
        severity: "risk",
        text: "No official soil test report or topographical survey document is currently attached to this enquiry.",
      },
      {
        id: "evi-insight-5",
        severity: "recommendation",
        text: "Municipal permit setback calculations should not be finalized until legal title deed & survey plan are verified.",
      },
    ];
  }

  if (scope === "client") {
    return [
      {
        id: "cli-insight-1",
        severity: "strength",
        text: isResidential
          ? "Natural light and courtyard cross-ventilation are consistently high-priority confirmed preferences."
          : "Collaborative workspace layout and ergonomic seating are confirmed priority preferences.",
      },
      {
        id: "cli-insight-2",
        severity: "contradiction",
        text: `Budget control is important, but willingness to trade scope for budget within the ${budgetStr} range is not yet defined.`,
        action: {
          label: "Add question",
          type: "add_clarification",
          payload: "Are there specific material finish trade-offs preferred if budget optimization is required?",
        },
      },
      {
        id: "cli-insight-3",
        severity: "strength",
        text: isResidential
          ? "The client family prioritizes a dedicated acoustic home office suite with dual monitor workstation layout."
          : "Client prioritizes fast delivery timeline with minimum interruption to operations.",
      },
      {
        id: "cli-insight-4",
        severity: "strength",
        text: `Primary decision maker (${enquiry.clientName || "Client"}) has single sign-off authority for stage approvals.`,
      },
      {
        id: "cli-insight-5",
        severity: "missing_information",
        text: "Material aesthetic preferences are clear (teak joinery, microcement), while long-term maintenance expectations need confirmation.",
      },
    ];
  }

  if (scope === "intelligence") {
    return [
      {
        id: "intel-insight-1",
        severity: "blocker",
        text: "Proposal creation is currently blocked by 4 high-impact requirement gaps in civil scope and budget coverage.",
      },
      {
        id: "intel-insight-2",
        severity: "risk",
        text: "Budget scope boundary (loose furniture vs fixed joinery) represents the largest commercial pricing risk.",
        action: {
          label: "Add question",
          type: "add_clarification",
          payload: "Please confirm whether loose furniture items are to be included in the formal BOQ proposal.",
        },
      },
      {
        id: "intel-insight-3",
        severity: "verification",
        text: "Site survey verification is the primary technical pre-construction dependency.",
      },
      {
        id: "intel-insight-4",
        severity: "strength",
        text: `Opportunity Fit remains strong (89% · Strong Fit) due to exact alignment with core ${isResidential ? "residential villa" : "commercial fit-out"} portfolio offerings.`,
      },
      {
        id: "intel-insight-5",
        severity: "recommendation",
        text: "Recommended next action: Consolidate unresolved P1 questions into one single clarification request before accepting.",
      },
    ];
  }

  if (scope === "activity") {
    return [
      {
        id: "act-insight-1",
        severity: "risk",
        text: "The client has not responded to the latest clarification request sent today.",
        action: {
          label: "Add question",
          type: "add_clarification",
          payload: "Following up on our earlier clarification request regarding budget and site survey details.",
        },
      },
      {
        id: "act-insight-2",
        severity: "change",
        text: "Requirement Strength adjusted to 72% after site access notes were flagged for verification.",
      },
      {
        id: "act-insight-3",
        severity: "change",
        text: "7 site photos and DWG floor plans were received and logged during initial onboarding.",
      },
      {
        id: "act-insight-4",
        severity: "blocker",
        text: "Budget coverage remains unresolved despite two related interaction log updates.",
      },
      {
        id: "act-insight-5",
        severity: "recommendation",
        text: "Recommended next action: Follow up on the pending clarification before moving to proposal drafting.",
      },
    ];
  }

  return [];
}
