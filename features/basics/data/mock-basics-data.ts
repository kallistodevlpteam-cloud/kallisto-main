import { DEV_PROJECTS } from "@/services/repositories/development-project-adapter";
import type {
  BasicsDeliverable,
  BasicsEngagement,
  BasicsMilestone,
  BasicsNotification,
  BasicsProjectContext,
  BasicsProposal,
  BasicsProvider,
  BasicsRequirement,
  BasicsReview,
  BasicsServiceCategory,
} from "../types/basics.types";

type ProviderSeed = {
  name: string;
  company?: string;
  specialization: string;
  category: BasicsServiceCategory;
  city: string;
  software: string[];
  codes: string[];
};

const PROVIDER_SEEDS: ProviderSeed[] = [
  { name: "Axis Structures", specialization: "RCC Structural Design", category: "engineering", city: "Kochi", software: ["ETABS", "STAAD.Pro", "AutoCAD"], codes: ["IS 456", "IS 875", "IS 1893"] },
  { name: "Gridline Engineering", specialization: "Structural Peer Review", category: "engineering", city: "Thiruvananthapuram", software: ["ETABS", "Tekla", "Revit"], codes: ["NBC", "IS 456", "IS 1893"] },
  { name: "Enviro MEP Consultants", specialization: "Integrated MEP Design", category: "engineering", city: "Kozhikode", software: ["Revit", "Navisworks", "AutoCAD"], codes: ["NBC", "NFPA", "ASHRAE"] },
  { name: "Vertex Facades", specialization: "Facade Engineering", category: "specialist_consulting", city: "Bengaluru", software: ["AutoCAD", "Revit", "SketchUp"], codes: ["NBC", "IS 875"] },
  { name: "Flow HVAC Studio", specialization: "HVAC Design", category: "engineering", city: "Kochi", software: ["Revit", "AutoCAD", "Navisworks"], codes: ["ASHRAE", "NBC"] },
  { name: "Terra Geotechnics", specialization: "Geotechnical Engineering", category: "engineering", city: "Thrissur", software: ["AutoCAD", "STAAD.Pro"], codes: ["IS 456", "NBC"] },
  { name: "BeamWorks Structural Consultants", specialization: "Steel and RCC Structures", category: "engineering", city: "Kottayam", software: ["STAAD.Pro", "Tekla", "ETABS"], codes: ["IS 456", "IS 875", "IS 1893"] },
  { name: "ModuBIM Studio", specialization: "BIM Coordination", category: "digital_production", city: "Kochi", software: ["Revit", "Navisworks", "AutoCAD"], codes: ["NBC"] },
  { name: "Circuit MEP Design", specialization: "Electrical Design", category: "engineering", city: "Kannur", software: ["AutoCAD", "Revit"], codes: ["NBC", "NFPA"] },
  { name: "AquaLine Consultants", specialization: "Plumbing and Drainage", category: "engineering", city: "Alappuzha", software: ["AutoCAD", "Revit"], codes: ["NBC", "Kerala Municipality Building Rules"] },
  { name: "SafeCore Fire Consultants", specialization: "Fire and Life Safety", category: "engineering", city: "Kochi", software: ["AutoCAD", "Revit"], codes: ["NBC", "NFPA"] },
  { name: "Ledger QS", specialization: "Quantity Surveying", category: "commercial_compliance", city: "Kozhikode", software: ["AutoCAD", "MS Project"], codes: ["NBC"] },
  { name: "CostCraft Advisory", specialization: "Cost Consulting", category: "commercial_compliance", city: "Thrissur", software: ["Primavera", "MS Project"], codes: ["NBC"] },
  { name: "Studio Canopy", specialization: "Landscape Design", category: "design_architecture", city: "Kochi", software: ["AutoCAD", "SketchUp", "Lumion"], codes: ["Kerala Municipality Building Rules"] },
  { name: "Luma Lighting Works", specialization: "Lighting Design", category: "design_architecture", city: "Bengaluru", software: ["AutoCAD", "Revit", "3ds Max"], codes: ["NBC"] },
  { name: "Echo Acoustic Lab", specialization: "Architectural Acoustics", category: "specialist_consulting", city: "Chennai", software: ["AutoCAD", "Revit"], codes: ["NBC"] },
  { name: "GreenMetric India", specialization: "Sustainability Consulting", category: "specialist_consulting", city: "Kochi", software: ["Revit", "MS Project"], codes: ["NBC", "ASHRAE"] },
  { name: "RenderField Studio", specialization: "Architectural Visualization", category: "digital_production", city: "Kozhikode", software: ["3ds Max", "Lumion", "SketchUp"], codes: ["NBC"] },
  { name: "PermitPath Consultants", specialization: "Permit Consulting", category: "commercial_compliance", city: "Thiruvananthapuram", software: ["AutoCAD"], codes: ["Kerala Municipality Building Rules", "Kerala Panchayat Building Rules"] },
  { name: "NorthGrid PM", specialization: "Construction Project Management", category: "commercial_compliance", city: "Kochi", software: ["Primavera", "MS Project"], codes: ["NBC"] },
];

const PORTFOLIO_IMAGES = [
  "/assets/projects/residence-24.png",
  "/assets/projects/greenfield-villa.png",
  "/assets/projects/oak-house.png",
  "/assets/project-banner.jpg",
];

function createReview(index: number, seed: ProviderSeed): BasicsReview {
  const projectNames = [
    "Nila Residence",
    "Lakeview Apartments",
    "Atlas Commercial Centre",
    "Green Courtyard Villa",
    "Orion Medical Clinic",
  ];
  return {
    id: `review-${String(index + 1).padStart(2, "0")}`,
    engagementId: `eng-completed-${String(index + 1).padStart(2, "0")}`,
    reviewerName: ["Arjun Mehta", "Priya Menon", "Riya Thomas"][index % 3],
    projectName: projectNames[index % projectNames.length],
    service: seed.specialization,
    rating: 4 + ((index % 9) + 1) / 10,
    review:
      "Clear technical coordination, dependable documentation and timely responses throughout the engagement.",
    completionDate: `2026-0${(index % 6) + 1}-${String((index % 20) + 8).padStart(2, "0")}`,
    verifiedEngagement: true,
  };
}

export const MOCK_BASICS_PROVIDERS: BasicsProvider[] = PROVIDER_SEEDS.map(
  (seed, index) => {
    const review = createReview(index, seed);
    const price = 18000 + index * 2500;
    return {
      id: `provider-${String(index + 1).padStart(3, "0")}`,
      slug: seed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      providerType: index % 4 === 3 ? "individual" : "company",
      name: seed.name,
      companyName: index % 4 === 3 ? undefined : seed.name,
      headline: `${seed.specialization} for residential and commercial projects`,
      primaryCategory: seed.category,
      specializations: [
        seed.specialization,
        index % 2 === 0 ? "Design documentation" : "Technical coordination",
      ],
      verified: index !== 18,
      verificationLevel:
        index === 18
          ? "identity_verified"
          : index % 3 === 0
            ? "business_verified"
            : "professional_verified",
      location: { city: seed.city, state: index % 5 === 3 ? "Karnataka" : index === 15 ? "Tamil Nadu" : "Kerala", country: "India" },
      remoteAvailable: true,
      onsiteAvailable: index % 4 !== 1,
      yearsOfExperience: 6 + (index % 13),
      completedEngagements: 12 + index * 4,
      rating: review.rating,
      reviewCount: 8 + index * 3,
      responseTimeHours: 2 + (index % 6),
      availability:
        index % 7 === 0
          ? "limited"
          : index % 3 === 0
            ? "available_this_week"
            : "available_now",
      pricing: {
        model: index % 4 === 0 ? "per_sq_ft" : "fixed",
        startingFrom: price,
        currency: "INR",
      },
      softwareSkills: seed.software,
      codeKnowledge: seed.codes,
      projectTypes: [
        index % 2 === 0 ? "Residential Villa" : "Commercial",
        index % 3 === 0 ? "Healthcare" : "Apartment",
      ],
      languages: ["English", "Malayalam", ...(index % 4 === 0 ? ["Hindi"] : [])],
      bio: `${seed.name} provides disciplined ${seed.specialization.toLowerCase()} services with clear deliverable schedules, documented review cycles and project-aware coordination.`,
      services: [
        {
          id: `service-${index + 1}-1`,
          title: seed.specialization,
          category: seed.category,
          description:
            "Project-bound professional service with a defined scope, review checkpoints and coordinated issue packages.",
          deliverables: [
            "Design basis and scope note",
            "Coordinated drawing or report package",
            "Review response schedule",
          ],
          pricingModel: index % 4 === 0 ? "per_sq_ft" : "fixed",
          startingPrice: price,
          estimatedDuration: `${3 + (index % 5)} weeks`,
        },
        {
          id: `service-${index + 1}-2`,
          title: `${seed.specialization} consultation`,
          category: seed.category,
          description:
            "Focused review session with written observations and next-step recommendations.",
          deliverables: ["Review call", "Written observation note"],
          pricingModel: "fixed",
          startingPrice: 7500 + index * 250,
          estimatedDuration: "3 to 5 working days",
        },
      ],
      portfolio: [0, 1, 2].map((portfolioIndex) => ({
        id: `portfolio-${index + 1}-${portfolioIndex + 1}`,
        title: [
          "Courtyard residence coordination",
          "Mid-rise technical package",
          "Commercial fit-out review",
        ][portfolioIndex],
        projectType: ["Residential Villa", "Apartment", "Commercial"][portfolioIndex],
        location: ["Kochi, Kerala", "Kozhikode, Kerala", "Bengaluru, Karnataka"][portfolioIndex],
        scope: seed.specialization,
        contribution: "Lead consultant and drawing coordinator",
        projectScale: ["8,400 sq ft", "62,000 sq ft", "24,000 sq ft"][portfolioIndex],
        completionYear: 2024 + (portfolioIndex % 2),
        imageUrls: [PORTFOLIO_IMAGES[(index + portfolioIndex) % PORTFOLIO_IMAGES.length]],
        relatedService: seed.specialization,
      })),
      credentials: [
        {
          id: `credential-${index + 1}-1`,
          kind: "qualification",
          title: index % 2 === 0 ? "M.Tech / M.E. in relevant engineering discipline" : "Bachelor of Architecture / Engineering",
          issuer: "Recognised Indian university",
          issuedYear: 2012 + (index % 8),
          verified: true,
        },
        {
          id: `credential-${index + 1}-2`,
          kind: "registration",
          title: "Professional practice registration",
          issuer: "Relevant professional council",
          issuedYear: 2015 + (index % 6),
          verified: index !== 18,
        },
      ],
      reviews: [review],
    };
  },
);

const REQUIREMENT_SEEDS = [
  ["Structural design for Nila Residence", "Structural Engineering", "engineering"],
  ["Integrated MEP coordination", "MEP Engineering", "engineering"],
  ["Facade performance review", "Facade Engineering", "specialist_consulting"],
  ["BIM coordination and clash report", "BIM Coordination", "digital_production"],
  ["BOQ preparation for villa package", "BOQ Preparation", "digital_production"],
  ["Fire and life safety review", "Fire and Life Safety", "engineering"],
  ["Landscape documentation", "Landscape Design", "design_architecture"],
  ["Permit drawing compliance review", "Permit Consulting", "commercial_compliance"],
] as const;

export const MOCK_BASICS_REQUIREMENTS: BasicsRequirement[] =
  REQUIREMENT_SEEDS.map((seed, index) => ({
    id: `requirement-${String(index + 1).padStart(3, "0")}`,
    projectId: index === 7 ? undefined : DEV_PROJECTS[index % 6].id,
    projectName: index === 7 ? undefined : DEV_PROJECTS[index % 6].name,
    title: seed[0],
    category: seed[2],
    specialization: seed[1],
    description:
      "Coordinate the specialist scope against the current architectural package and provide a versioned submission suitable for project review.",
    deliverables: [
      `${seed[1]} design or review package`,
      "Coordinated issue register",
      "Two documented review cycles",
    ],
    projectType: DEV_PROJECTS[index % 6].projectType,
    location: DEV_PROJECTS[index % 6].location,
    builtUpArea: 5200 + index * 950,
    numberOfFloors: 2 + (index % 5),
    projectStage: DEV_PROJECTS[index % 6].phase,
    engagementMode: index % 3 === 0 ? "milestone_based" : "request_quote",
    budgetMin: 45000 + index * 8000,
    budgetMax: 85000 + index * 12000,
    currency: "INR",
    expectedStartDate: `2026-08-${String(4 + index).padStart(2, "0")}`,
    expectedCompletionDate: `2026-${String(9 + Math.floor(index / 4)).padStart(2, "0")}-${String(12 + index).padStart(2, "0")}`,
    visibility:
      index === 7
        ? "private"
        : index % 3 === 0
          ? "invited_only"
          : "public_to_matched_providers",
    status:
      index === 0
        ? "reviewing"
        : index === 5
          ? "awarded"
          : index === 6
            ? "closed"
            : index === 7
              ? "draft"
              : "open",
    ownerId: "user-current",
    invitedProviderIds: [`provider-${String((index % 10) + 1).padStart(3, "0")}`],
    proposalCount: index === 7 ? 0 : 1 + (index % 4),
    shortlistedProposalIds: index < 3 ? [`proposal-${String(index + 1).padStart(3, "0")}`] : [],
    attachments: index % 2 === 0 ? ["Architectural drawing set Rev 03.pdf", "Project brief.pdf"] : ["Scope note.pdf"],
    createdAt: `2026-07-${String(4 + index).padStart(2, "0")}T09:00:00.000Z`,
    updatedAt: `2026-07-${String(17 + index).padStart(2, "0")}T11:30:00.000Z`,
    closesAt: index === 7 ? undefined : `2026-08-${String(3 + index).padStart(2, "0")}T17:30:00.000Z`,
  }));

function createMilestones(
  seed: number,
  fee: number,
  currency = "INR",
): BasicsMilestone[] {
  return [
    {
      id: `milestone-${seed}-1`,
      title: "Design basis and coordinated draft",
      deliverableIds: [`deliverable-${seed}-1`],
      amount: Math.round(fee * 0.4),
      currency,
      dueDate: "2026-08-28",
      completionStatus: seed % 3 === 0 ? "completed" : "in_progress",
      approvalStatus: seed % 3 === 0 ? "approved" : "pending",
      paymentStatus: seed % 3 === 0 ? "paid" : "not_due",
      paymentEvidenceReference: seed % 3 === 0 ? `payment-evidence-${seed}-1` : undefined,
    },
    {
      id: `milestone-${seed}-2`,
      title: "Final issue package",
      deliverableIds: [`deliverable-${seed}-2`],
      amount: fee - Math.round(fee * 0.4),
      currency,
      dueDate: "2026-09-20",
      completionStatus: "not_started",
      approvalStatus: "pending",
      paymentStatus: "not_due",
    },
  ];
}

export const MOCK_BASICS_PROPOSALS: BasicsProposal[] = Array.from(
  { length: 15 },
  (_, index) => {
    const requirementIndex = index % MOCK_BASICS_REQUIREMENTS.length;
    const providerIndex = (index * 3) % MOCK_BASICS_PROVIDERS.length;
    const fee = 62000 + index * 6500;
    const requirement = MOCK_BASICS_REQUIREMENTS[requirementIndex];
    return {
      id: `proposal-${String(index + 1).padStart(3, "0")}`,
      requirementId: requirement.id,
      providerId: MOCK_BASICS_PROVIDERS[providerIndex].id,
      ownerPerspective: index % 4 === 3 ? "provider" : "buyer",
      coverNote:
        "We have reviewed the requirement and can deliver a coordinated, version-controlled package with scheduled technical reviews.",
      scopeSummary: `${requirement.specialization} covering design basis, coordination, documented revisions and final issue support.`,
      includedDeliverables: requirement.deliverables.slice(0, index % 4 === 0 ? 2 : 3),
      excludedDeliverables:
        index % 3 === 0 ? ["Statutory submission fees", "Third-party testing"] : ["Statutory submission fees"],
      fee,
      currency: "INR",
      pricingModel: index % 4 === 0 ? "per_sq_ft" : "fixed",
      estimatedStartDate: `2026-08-${String(4 + (index % 12)).padStart(2, "0")}`,
      estimatedCompletionDate: `2026-09-${String(8 + (index % 16)).padStart(2, "0")}`,
      estimatedDurationDays: 24 + (index % 22),
      revisionCount: 2 + (index % 3),
      siteVisitCount: index % 3,
      milestones: createMilestones(index + 1, fee),
      attachments: ["Technical approach.pdf", "Fee and milestone schedule.pdf"],
      status: ([
        "shortlisted",
        "submitted",
        "viewed",
        "clarification_requested",
        "negotiating",
        "accepted",
        "rejected",
      ] as const)[index % 7],
      submittedAt: `2026-07-${String(10 + (index % 14)).padStart(2, "0")}T10:00:00.000Z`,
      updatedAt: `2026-07-${String(14 + (index % 10)).padStart(2, "0")}T14:30:00.000Z`,
    };
  },
);

function createDeliverables(seed: number, providerName: string): BasicsDeliverable[] {
  return [1, 2, 3].map((item) => {
    const isApproved = seed % 4 === 0 && item === 1;
    const isSubmitted = item <= 2;
    return {
      id: `deliverable-${seed}-${item}`,
      name: ["Design basis report", "Coordinated drawing package", "Final issue register"][item - 1],
      description: "Versioned engagement output linked to the accepted specialist scope.",
      owner: providerName,
      dueDate: `2026-0${8 + Math.floor(item / 3)}-${String(14 + item * 5).padStart(2, "0")}`,
      status: isApproved ? "approved" : isSubmitted ? "under_review" : "not_started",
      versions: isSubmitted
        ? [
            {
              version: 1,
              fileName: `Deliverable ${item} Rev 01.pdf`,
              fileReference: `mock://engagement/${seed}/deliverable/${item}/v1`,
              submittedAt: "2026-07-24T10:30:00.000Z",
              submittedBy: providerName,
              status: isApproved ? "approved" : "under_review",
              approvalActor: isApproved ? "Arjun Mehta" : undefined,
              approvalTimestamp: isApproved ? "2026-07-25T15:00:00.000Z" : undefined,
            },
          ]
        : [],
    };
  });
}

export const MOCK_BASICS_ENGAGEMENTS: BasicsEngagement[] = Array.from(
  { length: 14 },
  (_, index) => {
    const provider = MOCK_BASICS_PROVIDERS[index % MOCK_BASICS_PROVIDERS.length];
    const requirement = MOCK_BASICS_REQUIREMENTS[index % MOCK_BASICS_REQUIREMENTS.length];
    const proposal = MOCK_BASICS_PROPOSALS[index % MOCK_BASICS_PROPOSALS.length];
    const completed = index >= 6;
    const fee = 78000 + index * 8500;
    return {
      id: completed
        ? `eng-completed-${String(index - 5).padStart(2, "0")}`
        : `engagement-${String(index + 1).padStart(3, "0")}`,
      projectId: requirement.projectId ?? "proj-001",
      projectName: requirement.projectName ?? "Independent consultation",
      requirementId: requirement.id,
      acceptedProposalId: proposal.id,
      providerId: provider.id,
      clientId: "user-current",
      title: `${requirement.specialization} engagement`,
      category: requirement.category,
      scope: requirement.deliverables,
      exclusions: proposal.excludedDeliverables,
      deliverables: createDeliverables(index + 1, provider.name),
      milestones: createMilestones(index + 20, fee),
      agreedFee: fee,
      currency: "INR",
      startDate: "2026-07-18",
      expectedCompletionDate: "2026-09-24",
      revisionLimit: 3,
      revisionsUsed: index % 3,
      status: completed
        ? "completed"
        : (["active", "awaiting_review", "revision_requested", "not_started", "active", "active"] as const)[index],
      paymentStatus: completed ? "paid" : index % 3 === 0 ? "partially_paid" : "not_started",
      paymentEvidenceReferences: completed ? [`payment-evidence-engagement-${index + 1}`] : index % 3 === 0 ? [`payment-evidence-engagement-${index + 1}-deposit`] : [],
      progress: completed ? 100 : 18 + index * 13,
      activity: [
        {
          id: `activity-${index + 1}-1`,
          actor: "Arjun Mehta",
          actorRole: "Virtual Office owner",
          action: "Proposal accepted",
          detail: "Scope and commercial milestones confirmed.",
          timestamp: "2026-07-17T11:00:00.000Z",
        },
        {
          id: `activity-${index + 1}-2`,
          actor: provider.name,
          actorRole: "Specialist provider",
          action: "Design basis submitted",
          detail: "Version 1 submitted for coordinated review.",
          timestamp: "2026-07-24T10:30:00.000Z",
        },
      ],
      createdAt: "2026-07-17T11:00:00.000Z",
      updatedAt: "2026-07-25T15:00:00.000Z",
    };
  },
);

export const MOCK_BASICS_PROJECT_CONTEXTS: BasicsProjectContext[] =
  DEV_PROJECTS.slice(0, 8).map((project, index) => ({
    id: project.id,
    name: project.name,
    projectType: project.projectType,
    location: project.location,
    projectStage: project.phase,
    builtUpArea: 4800 + index * 1300,
    numberOfFloors: 2 + (index % 5),
  }));

export const MOCK_BASICS_NOTIFICATIONS: BasicsNotification[] = [
  {
    id: "basics-notification-1",
    type: "proposal_received",
    title: "New structural proposal",
    body: "Axis Structures submitted a proposal for Nila Residence.",
    href: "/basics/proposals/proposal-001",
    read: false,
    createdAt: "2026-07-26T11:20:00.000Z",
  },
  {
    id: "basics-notification-2",
    type: "deliverable_submitted",
    title: "Drawing package ready for review",
    body: "The coordinated drawing package is awaiting review.",
    href: "/basics/engagements/engagement-002",
    read: false,
    createdAt: "2026-07-25T15:10:00.000Z",
  },
];

