import { ClientProject, ClientOdinMessage } from "../types";

export const MOCK_CLIENT_PROJECTS: ClientProject[] = [
  {
    id: "proj-kowdiar",
    code: "KAL-KV-2026",
    name: "Kowdiar Villa",
    category: "Residential Architecture",
    stage: "Design Development",
    location: "Kowdiar, Trivandrum",
    progress: 65,
    totalBudget: "₹85,00,000",
    paidAmount: "₹45,00,000",
    pendingAmount: "₹40,00,000",
    leadProvider: "Arjun Architects",
    fileCount: 14,
    activeTaskCount: 3,
    targetCompletion: "November 2026",
    needsAttention: [
      {
        id: "att-1",
        title: "Review Electrical Layout Drawing V2.1",
        category: "Approval",
        urgency: "high",
        date: "Action by Tomorrow",
        actionLabel: "Review & Sign",
        description: "Arjun Architects uploaded revised conduit routings for Master Suite & Living Terrace.",
      },
      {
        id: "att-2",
        title: "Authorize Milestone 3 Advance Payment",
        category: "Payment",
        urgency: "high",
        date: "Due in 3 days",
        actionLabel: "Authorize ₹7.5L",
        description: "Foundation & Plinth beam casting verified by Kallisto Site Engineer.",
      },
      {
        id: "att-3",
        title: "Confirm Living Room Italian Marble Selection",
        category: "Decision",
        urgency: "medium",
        date: "Due this week",
        actionLabel: "Choose Finish",
        description: "Review sample swatches submitted by Greenline Interiors.",
      },
    ],
    upcoming: [
      {
        id: "up-1",
        title: "Site Progress Review with Structural Consultant",
        date: "Thursday, 28 Aug",
        time: "10:30 AM",
        type: "visit",
        location: "Kowdiar Site",
      },
      {
        id: "up-2",
        title: "Plumbing & Sanitary Quotation Finalization",
        date: "Friday, 29 Aug",
        time: "3:00 PM",
        type: "meeting",
        location: "Odin Virtual Conference",
      },
      {
        id: "up-3",
        title: "Phase 2 Escrow Release Review",
        date: "Monday, 01 Sep",
        time: "11:00 AM",
        type: "payment",
      },
    ],
    recentActivity: [
      {
        id: "act-1",
        actor: "Arjun Architects",
        action: "uploaded revised drawing",
        target: "Electrical_Layout_V2.1.pdf",
        time: "2 hours ago",
        iconType: "doc",
      },
      {
        id: "act-2",
        actor: "Kallisto Site Engineer",
        action: "verified milestone completion",
        target: "Plinth Beam & Column Footings",
        time: "Yesterday",
        iconType: "status",
      },
      {
        id: "act-3",
        actor: "Kowdiar Site Logistics",
        action: "received batch delivery",
        target: "TMT Steel Fe550D (12 Tons)",
        time: "2 days ago",
        iconType: "status",
      },
      {
        id: "act-4",
        actor: "Client Portal",
        action: "cleared milestone invoice",
        target: "Milestone 2 Structural Advance",
        time: "4 days ago",
        iconType: "payment",
      },
    ],
    suggestedPrompts: [
      "Find an electrical contractor.",
      "What's pending on my project?",
      "Show me the latest drawing.",
      "How much have I paid so far?",
      "Schedule a site visit.",
      "Find the quotation from the plumbing provider.",
    ],
  },
  {
    id: "proj-nila",
    code: "KAL-NR-2026",
    name: "Nila Residence",
    category: "Interior Fit-Out & Joinery",
    stage: "Pre-construction",
    location: "Edappally, Kochi",
    progress: 30,
    totalBudget: "₹42,00,000",
    paidAmount: "₹12,60,000",
    pendingAmount: "₹29,40,000",
    leadProvider: "Studio Atelier",
    fileCount: 8,
    activeTaskCount: 2,
    targetCompletion: "January 2027",
    needsAttention: [
      {
        id: "att-n1",
        title: "Approve Modular Kitchen Elevation Plan",
        category: "Approval",
        urgency: "high",
        date: "Action by Friday",
        actionLabel: "Review Elevation",
        description: "Hardware specifications (Hettich soft-close) updated as per client brief.",
      },
    ],
    upcoming: [
      {
        id: "up-n1",
        title: "Carpentry Kickoff & Material Inspection",
        date: "Wednesday, 03 Sep",
        time: "2:30 PM",
        type: "visit",
        location: "Edappally Site",
      },
    ],
    recentActivity: [
      {
        id: "act-n1",
        actor: "Studio Atelier",
        action: "submitted revised estimate",
        target: "BOQ_Joinery_Rev_3.xlsx",
        time: "3 hours ago",
        iconType: "doc",
      },
      {
        id: "act-n2",
        actor: "Kallisto Concierge",
        action: "verified woodwork contractor",
        target: "Malabar Joinery Craft",
        time: "1 day ago",
        iconType: "status",
      },
    ],
    suggestedPrompts: [
      "Find a carpentry contractor.",
      "What's pending on my project?",
      "Show me the kitchen 3D render.",
      "How much have I paid so far?",
      "Schedule a material inspection.",
      "Review the woodwork estimate.",
    ],
  },
  {
    id: "proj-azure",
    code: "KAL-AV-2026",
    name: "Azure Bay Villa",
    category: "Hospitality & Landscape",
    stage: "Feasibility & Concept",
    location: "Varkala Cliff, Kerala",
    progress: 15,
    totalBudget: "₹1,20,00,000",
    paidAmount: "₹18,00,000",
    pendingAmount: "₹1,02,00,000",
    leadProvider: "Coastline Design Lab",
    fileCount: 6,
    activeTaskCount: 1,
    targetCompletion: "May 2027",
    needsAttention: [
      {
        id: "att-a1",
        title: "Sign Coastal Zone Feasibility Clearance",
        category: "Decision",
        urgency: "high",
        date: "Action Required",
        actionLabel: "Sign Clearance",
        description: "CRZ compliance report prepared by Environmental Specialist.",
      },
    ],
    upcoming: [
      {
        id: "up-a1",
        title: "Topographical Contour Survey Presentation",
        date: "Monday, 08 Sep",
        time: "4:00 PM",
        type: "meeting",
        location: "Virtual Meeting",
      },
    ],
    recentActivity: [
      {
        id: "act-a1",
        actor: "Coastline Design Lab",
        action: "uploaded site contours",
        target: "Topography_Survey_V1.dwg",
        time: "Yesterday",
        iconType: "doc",
      },
    ],
    suggestedPrompts: [
      "Find a landscape architect.",
      "What's pending on my project?",
      "Show me the site survey.",
      "How much have I paid so far?",
      "Schedule a virtual consultation.",
      "Review the feasibility report.",
    ],
  },
];

export function getClientProjects(): ClientProject[] {
  return MOCK_CLIENT_PROJECTS;
}

export function getClientProjectById(id: string): ClientProject {
  return MOCK_CLIENT_PROJECTS.find((p) => p.id === id) || MOCK_CLIENT_PROJECTS[0];
}

/**
 * Intelligent context-aware Odin response engine for clients
 */
export async function queryOdinForClient(
  prompt: string,
  project?: ClientProject | null
): Promise<ClientOdinMessage> {
  const normalized = prompt.trim().toLowerCase();

  // Simulate network/AI response latency
  await new Promise((resolve) => setTimeout(resolve, 450));

  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const activeProject: ClientProject = project || MOCK_CLIENT_PROJECTS[0];
  const projectLocation = project?.location || "Kerala";

  // 0.1 Package Confirmation / Service Provider Selection
  if (
    normalized.includes("confirm and proceed") ||
    normalized.includes("consultation order") ||
    normalized.includes("package enquiry") ||
    (normalized.includes("package") && (normalized.includes("design package") || normalized.includes("execution") || normalized.includes("from ")))
  ) {
    const packageMatch = prompt.match(/"([^"]+)"/);
    const packageTitle = packageMatch ? packageMatch[1] : "Selected Design Package";

    const priceMatch = prompt.match(/\((₹[^)]+)\)/);
    const packagePrice = priceMatch ? priceMatch[1] : "₹5,00,000";

    const fromMatch = prompt.match(/from\s+([^.]+)/i);
    const providerName = fromMatch ? fromMatch[1].trim() : (project?.leadProvider || "Apex Structural Consultants");

    return {
      id: `odin-${Date.now()}`,
      sender: "odin",
      text: `You have chosen **${providerName}**.\n\nPlease verify your contact details to proceed with this consultation.`,
      timestamp,
      actionType: "general",
      structuredData: {
        isProviderConfirmation: true,
        providerName,
        packageTitle,
        packagePrice,
        avatarUrl: "/assets/arjun-avatar.jpg",
        rating: 4.9,
        isVerified: true,
        followUpActions: ["Proceed"],
      },
    };
  }

  // 0.2 Verification Completed -> Ask to share requirements
  if (
    normalized.includes("proceed") ||
    normalized.includes("verified my contact") ||
    normalized.includes("verified my identity") ||
    normalized.includes("verify details") ||
    normalized.includes("verification complete") ||
    normalized.includes("identity verified")
  ) {
    const providerName = project?.leadProvider || "the service provider";
    return {
      id: `odin-${Date.now()}`,
      sender: "odin",
      text: `Your verification is complete! Would you like to share your requirements with **${providerName}**?`,
      timestamp,
      actionType: "general",
      structuredData: {
        isVerificationComplete: true,
        providerName,
        followUpActions: [
          "Share Project Requirements",
          "Upload Site Survey & Drawings",
          "Schedule Direct Consultation Call",
        ],
      },
    };
  }

  // 1. New Project Scoping / New Client Build Request
  if (
    normalized.includes("start a project") ||
    normalized.includes("build") ||
    normalized.includes("new project") ||
    normalized.includes("scope") ||
    normalized.includes("4bhk") ||
    normalized.includes("villa")
  ) {
    return {
      id: `odin-${Date.now()}`,
      sender: "odin",
      text: `I've initialized project scoping for your new build in ${projectLocation}. Here is the preliminary project framework:`,
      timestamp,
      actionType: "general",
      structuredData: {
        isNewProjectScoping: true,
        projectTitle: "Contemporary Residential Villa",
        scopeScale: "3,200 – 3,800 sq ft (4 BHK Turnkey)",
        estBudget: "₹75,00,000 – ₹92,00,000",
        milestonePhases: [
          "Phase 1: Architectural Concept & Spatial Layout",
          "Phase 2: Structural Engineering & Soil Feasibility",
          "Phase 3: BOQ Tendering & Contractor Selection",
        ],
        topSpecialists: ["Arjun Architects (4.9 ★)", "Studio Terra Kerala (4.8 ★)"],
        followUpActions: ["Launch Project Brief", "Request Architectural Proposals", "Refine Project Budget"],
      },
    };
  }

  // 2. Instant Cost & Budget Estimator
  if (normalized.includes("estimate") || normalized.includes("cost calculator") || normalized.includes("how much to build")) {
    return {
      id: `odin-${Date.now()}`,
      sender: "odin",
      text: `Based on current verified Kerala construction benchmarks, here is the cost breakdown for a premium residential build:`,
      timestamp,
      actionType: "general",
      structuredData: {
        isCostEstimation: true,
        superBuiltUp: "3,000 sq ft",
        structureCost: "₹1,850 / sq ft (₹55.5L)",
        finishingCost: "₹850 / sq ft (₹25.5L)",
        mepCost: "₹350 / sq ft (₹10.5L)",
        totalEstimated: "₹91,50,000",
        followUpActions: ["Generate Detailed BOQ", "Find an Architect", "Ask Something Else"],
      },
    };
  }

  if (
    normalized.includes("electric") ||
    normalized.includes("contractor") ||
    normalized.includes("painter") ||
    normalized.includes("paint") ||
    normalized.includes("plumb") ||
    normalized.includes("provider") ||
    normalized.includes("find a provider")
  ) {
    const trade = normalized.includes("electric")
      ? "electrical"
      : normalized.includes("paint")
      ? "painting"
      : normalized.includes("plumb")
      ? "plumbing"
      : "service";

    return {
      id: `odin-${Date.now()}`,
      sender: "odin",
      text: `I found ${trade} service providers suitable for your ${activeProject.name} project (${activeProject.category}, currently in ${activeProject.stage} at ${activeProject.location}):`,
      timestamp,
      actionType: "provider_discovery",
      structuredData: {
        trade,
        projectName: activeProject.name,
        location: activeProject.location,
        recommendations: [
          {
            name: trade.includes("electric") ? "Apex Electro-Tech Systems" : trade.includes("paint") ? "Apex Finishers & Coat" : "Precision Flow Plumbing",
            rating: "4.9 ★ (28 verified projects)",
            experience: "12+ yrs in luxury residential",
            estRange: "₹3.8L – ₹4.6L",
            badge: "Kallisto Verified Master Trade",
            availability: "Ready to inspect this Thursday",
          },
          {
            name: trade.includes("electric") ? "Kerala Circuit Craft" : trade.includes("paint") ? "Lumina Wall Artistry" : "Coastal Hydro Services",
            rating: "4.8 ★ (19 verified projects)",
            experience: "9+ yrs in turnkey residences",
            estRange: "₹3.4L – ₹4.2L",
            badge: "Verified Contractor",
            availability: "Available for consultation",
          },
        ],
        followUpActions: ["View Providers", "Compare Options", "Ask Something Else"],
      },
    };
  }

  if (
    normalized.includes("pending") ||
    normalized.includes("approve") ||
    normalized.includes("status") ||
    normalized.includes("action") ||
    normalized.includes("check project") ||
    normalized.includes("what's happening")
  ) {
    return {
      id: `odin-${Date.now()}`,
      sender: "odin",
      text: `For ${activeProject.name}, you have ${activeProject.needsAttention.length} pending items requiring client action or approval:`,
      timestamp,
      actionType: "pending_summary",
      structuredData: {
        items: activeProject.needsAttention,
        progress: `${activeProject.progress}% completed`,
        stage: activeProject.stage,
        followUpActions: ["Review All Pending", "View Project Timeline", "Ask Something Else"],
      },
    };
  }

  if (
    normalized.includes("paid") ||
    normalized.includes("cost") ||
    normalized.includes("money") ||
    normalized.includes("payment") ||
    normalized.includes("budget") ||
    normalized.includes("check payments")
  ) {
    return {
      id: `odin-${Date.now()}`,
      sender: "odin",
      text: `Here is the authoritative financial ledger and milestone settlement summary for ${activeProject.name}:`,
      timestamp,
      actionType: "payment_summary",
      structuredData: {
        totalBudget: activeProject.totalBudget,
        paidAmount: activeProject.paidAmount,
        pendingAmount: activeProject.pendingAmount,
        progress: `${activeProject.progress}%`,
        nextMilestone: "Milestone 3 (Plinth & Superstructure Casting)",
        escrowProtected: "All released payments held in verified Kallisto Milestone Escrow",
        followUpActions: ["View Payment History", "Next Milestone Details", "Ask Something Else"],
      },
    };
  }

  if (
    normalized.includes("drawing") ||
    normalized.includes("plan") ||
    normalized.includes("file") ||
    normalized.includes("document") ||
    normalized.includes("view documents") ||
    normalized.includes("blueprint") ||
    normalized.includes("render")
  ) {
    return {
      id: `odin-${Date.now()}`,
      sender: "odin",
      text: `The latest deliverable submitted for ${activeProject.name} is Electrical Layout Drawing V2.1 by ${activeProject.leadProvider}:`,
      timestamp,
      actionType: "drawing_preview",
      structuredData: {
        docName: "Electrical_Layout_V2.1.pdf",
        version: "Revision 2.1",
        author: activeProject.leadProvider,
        updated: "Uploaded 2 hours ago",
        status: "Pending Client Sign-off",
        followUpActions: ["Open & Sign", "Request Revisions", "View All Project Files"],
      },
    };
  }

  if (
    normalized.includes("schedule") ||
    normalized.includes("visit") ||
    normalized.includes("meeting") ||
    normalized.includes("upcoming")
  ) {
    return {
      id: `odin-${Date.now()}`,
      sender: "odin",
      text: `I can coordinate a site visit at ${activeProject.name} (${activeProject.location}) with your lead architect ${activeProject.leadProvider}. Would you like to confirm for this Thursday at 10:30 AM?`,
      timestamp,
      actionType: "schedule_visit",
      structuredData: {
        projectName: activeProject.name,
        location: activeProject.location,
        leadProvider: activeProject.leadProvider,
        suggestedSlot: "Thursday, 28 Aug • 10:30 AM",
        followUpActions: ["Confirm Visit", "Reschedule Time", "Ask Something Else"],
      },
    };
  }

  if (
    normalized.includes("enquir") ||
    normalized.includes("quote") ||
    normalized.includes("quotation") ||
    normalized.includes("proposal") ||
    normalized.includes("my enquiries")
  ) {
    return {
      id: `odin-${Date.now()}`,
      sender: "odin",
      text: `You have 2 active enquiry proposals under review for ${activeProject.name}:`,
      timestamp,
      actionType: "quote_lookup",
      structuredData: {
        title: "Sanitary & Plumbing BOQ Revision 2",
        provider: "Precision Flow Systems",
        amount: "₹6,85,000 (Tax Inclusive)",
        status: "Reviewed by Lead Architect • Ready for Client Confirmation",
        followUpActions: ["Review Proposals", "Send New Enquiry", "Ask Something Else"],
      },
    };
  }

  // General outcome-oriented fallback
  return {
    id: `odin-${Date.now()}`,
    sender: "odin",
    text: `I've registered your request for **${activeProject.name}**. I'm actively coordinating with ${activeProject.leadProvider} and our site engineering team in ${activeProject.location} to organize this outcome.`,
    timestamp,
    actionType: "general",
    structuredData: {
      followUpActions: ["View Project Details", "Check Active Tasks", "Ask Something Else"],
    },
  };
}
