import { LabourRequest, RequestMatchSummary, RequestSummaryMetrics } from "../types/request-domain";
import { WorkerTrade } from "../types/worker-domain";

export const INITIAL_LABOUR_REQUESTS: LabourRequest[] = [
  {
    id: "KH-R-1024",
    projectName: "Greenwood Residency",
    clientName: "Greenwood Infra Projects Ltd",
    location: "Kazhakkoottam, Kerala",
    locationDetails: {
      address: "Plot 14, Technopark Phase 3 Road, Kazhakkoottam, Trivandrum 695582",
      landmark: "Opposite UST Global Campus",
    },
    requirements: [
      {
        trade: "Mason",
        requiredCount: 8,
        availableCount: 6,
        matchingWorkerIds: ["KH-W-1042", "KH-W-1132", "KH-W-1136", "KH-W-1148", "KH-W-1152", "KH-W-1154"],
      },
      {
        trade: "Helper",
        requiredCount: 4,
        availableCount: 4,
        matchingWorkerIds: ["KH-W-1120", "KH-W-1140", "KH-W-1144", "KH-W-1156"],
      },
    ],
    startDate: "Sep 05, 2026",
    estimatedDuration: "30 Days",
    endDate: "Oct 05, 2026",
    workingHours: "8:00 AM – 5:00 PM",
    urgency: "urgent",
    status: "new",
    createdAt: "2h ago",
    notes: "Phase 2 boundary block work and external brick masonry. Overtime allowed upon mutual contractor agreement.",
    scopeOfWork: [
      "Exterior 200mm solid block masonry",
      "Internal 100mm partition walls",
      "Lintel casting and curing supervision",
      "Mortar mixing and stage scaffolding support",
    ],
    tasks: [
      {
        id: "task-1024-1",
        title: "RCC Framework & Column Casting",
        category: "Structural",
        trade: "Mason",
        workersCount: 6,
        period: "Sep 05 – Sep 12 (Week 1)",
        estimatedHours: "120h",
        priority: "High",
        status: "in-progress",
      },
      {
        id: "task-1024-2",
        title: "Brick Masonry & Wall Plastering",
        category: "Masonry",
        trade: "Mason",
        workersCount: 4,
        period: "Sep 05 – Sep 18 (Week 1–2)",
        estimatedHours: "96h",
        priority: "High",
        status: "pending-review",
      },
      {
        id: "task-1024-3",
        title: "Internal Electrical Wiring",
        category: "Electrical",
        trade: "Electrician",
        workersCount: 4,
        period: "Sep 13 – Sep 25 (Week 2–3)",
        estimatedHours: "64h",
        priority: "Medium",
        status: "pending",
      },
      {
        id: "task-1024-4",
        title: "Plumbing & Sanitary Fixtures",
        category: "Plumbing",
        trade: "Plumber",
        workersCount: 2,
        period: "Sep 26 – Oct 05 (Week 4)",
        estimatedHours: "48h",
        priority: "Medium",
        status: "completed",
      },
    ],
    contactPerson: {
      name: "Er. Mathew Varghese",
      phone: "+91 94471 88204",
      role: "Chief Site Project Manager",
    },
  },
  {
    id: "KH-R-1025",
    projectName: "Skyline Apartments",
    clientName: "Skyline Builders & Developers",
    location: "Trivandrum, Kerala",
    locationDetails: {
      address: "Tower B, Skyline Riverdale, Pattom, Trivandrum 695004",
      landmark: "Near Pattom Junction",
    },
    requirements: [
      {
        trade: "Carpenter",
        requiredCount: 6,
        availableCount: 6,
        matchingWorkerIds: ["KH-W-1104", "KH-W-1106", "KH-W-1110", "KH-W-1112", "KH-W-1114", "KH-W-1116"],
      },
    ],
    startDate: "Sep 08, 2026",
    estimatedDuration: "15 Days",
    endDate: "Sep 23, 2026",
    workingHours: "8:30 AM – 5:30 PM",
    urgency: "normal",
    status: "new",
    createdAt: "5h ago",
    notes: "Floor 4 slab shuttering and aluminum formwork shuttering crew needed for high-rise residential wing.",
    scopeOfWork: [
      "Mivan shuttering panel assembly",
      "Beam bottom level checking",
      "Safety railing and edge shutter installation",
    ],
    tasks: [
      {
        id: "task-1025-1",
        title: "Mivan shuttering panel assembly & propping",
        category: "Formwork",
        description: "Assembly of aluminum wall formwork panels and adjustable floor slab props.",
        trade: "Carpenter",
        workersCount: 4,
        period: "Sep 08 – Sep 14 (Week 1)",
        estimatedHours: "80h",
        priority: "High",
        status: "in-progress",
      },
      {
        id: "task-1025-2",
        title: "Beam bottom alignment & safety edge barriers",
        category: "Safety & Staging",
        description: "Laser level alignment of beam bottoms and perimeter safety barrier rigging.",
        trade: "Carpenter",
        workersCount: 6,
        period: "Sep 15 – Sep 23 (Week 2)",
        estimatedHours: "60h",
        priority: "Medium",
        status: "pending-review",
      },
    ],
    contactPerson: {
      name: "Sanjay Menon",
      phone: "+91 98470 55120",
      role: "Structural Contractor Lead",
    },
  },
  {
    id: "KH-R-1026",
    projectName: "Azure Waterfront Towers",
    clientName: "Azure Ocean Properties",
    location: "Marine Drive, Kochi",
    locationDetails: {
      address: "Marine Drive North Block, Kochi 682031",
      landmark: "Near Marine Walkway Gate 2",
    },
    requirements: [
      {
        trade: "Electrician",
        requiredCount: 3,
        availableCount: 3,
        matchingWorkerIds: ["KH-W-1160", "KH-W-1162", "KH-W-1164"],
      },
      {
        trade: "Plumber",
        requiredCount: 2,
        availableCount: 2,
        matchingWorkerIds: ["KH-W-1122", "KH-W-1124"],
      },
    ],
    startDate: "Sep 02, 2026",
    estimatedDuration: "14 Days",
    endDate: "Sep 16, 2026",
    workingHours: "8:00 AM – 5:00 PM",
    urgency: "urgent",
    status: "new",
    createdAt: "1d ago",
    notes: "Conduit wiring and pressure piping tests for penthouse level MEP handover.",
    scopeOfWork: [
      "Concealed PVC conduit wiring",
      "Main DB dressing and earthing loop check",
      "CPVC water line hydro-testing",
    ],
    tasks: [
      {
        id: "task-1026-1",
        title: "Concealed conduit wiring & box dressing",
        category: "Electrical",
        description: "Pulling FRLS copper wires through slab conduits and box grounding.",
        trade: "Electrician",
        workersCount: 3,
        period: "Sep 02 – Sep 09 (Week 1)",
        estimatedHours: "72h",
        priority: "High",
        status: "scheduled",
      },
      {
        id: "task-1026-2",
        title: "CPVC water line hydro-testing & manifold fit",
        category: "Plumbing",
        description: "10-bar pressure hydro-testing and bathroom valve manifold fixing.",
        trade: "Plumber",
        workersCount: 2,
        period: "Sep 05 – Sep 12 (Week 1–2)",
        estimatedHours: "48h",
        priority: "Medium",
        status: "scheduled",
      },
      {
        id: "task-1026-3",
        title: "Main DB dressing & earthing loop inspection",
        category: "Electrical",
        description: "Main distribution board cable dressing and earthing pit resistance verification.",
        trade: "Electrician",
        workersCount: 2,
        period: "Sep 13 – Sep 16 (Final Days)",
        estimatedHours: "36h",
        priority: "Medium",
        status: "scheduled",
      },
    ],
    contactPerson: {
      name: "Kishore Nair",
      phone: "+91 98950 44321",
      role: "MEP Project Coordinator",
    },
  },
  {
    id: "KH-R-1027",
    projectName: "Hilite CyberPark Extension",
    clientName: "Hilite Urban Living",
    location: "Kozhikode Bypass, Kerala",
    locationDetails: {
      address: "NH 66 CyberPark Access Road, Kozhikode 673014",
      landmark: "Opposite Hilite Mall Gate 4",
    },
    requirements: [
      {
        trade: "Steel Fixer",
        requiredCount: 6,
        availableCount: 0,
        matchingWorkerIds: [],
      },
      {
        trade: "Helper",
        requiredCount: 4,
        availableCount: 4,
        matchingWorkerIds: ["KH-W-1120", "KH-W-1140", "KH-W-1144", "KH-W-1156"],
      },
    ],
    startDate: "Sep 10, 2026",
    estimatedDuration: "45 Days",
    endDate: "Oct 25, 2026",
    workingHours: "8:00 AM – 5:00 PM",
    urgency: "normal",
    status: "new",
    createdAt: "1d ago",
    notes: "Heavy foundation raft rebar tying and column bar cage erection.",
    scopeOfWork: [
      "32mm rebar bending and cutting",
      "Basement raft mat double mesh tying",
      "Starter column cage placement",
    ],
    tasks: [
      {
        id: "task-1027-1",
        title: "32mm rebar cutting, bending & tagging",
        category: "Steel Fabrication",
        description: "Rebar yard pre-fabrication according to bar bending schedules.",
        trade: "Steel Fixer",
        workersCount: 6,
        period: "Sep 10 – Sep 20 (Week 1–2)",
        estimatedHours: "120h",
        priority: "High",
        status: "scheduled",
      },
      {
        id: "task-1027-2",
        title: "Basement raft mat double mesh tying",
        category: "Raft Foundation",
        description: "Heavy raft slab bottom and top rebar grid placement with spacer chairs.",
        trade: "Helper",
        workersCount: 4,
        period: "Sep 21 – Oct 08 (Week 3–4)",
        estimatedHours: "96h",
        priority: "High",
        status: "scheduled",
      },
      {
        id: "task-1027-3",
        title: "Starter column cage placement & shear walls",
        category: "Columns & Walls",
        description: "Column bar erection with cover block verification and plumb checking.",
        trade: "Steel Fixer",
        workersCount: 6,
        period: "Oct 09 – Oct 25 (Final Phase)",
        estimatedHours: "64h",
        priority: "Medium",
        status: "scheduled",
      },
    ],
    contactPerson: {
      name: "Abdul Rahman",
      phone: "+91 94477 12900",
      role: "Civil Site Engineer",
    },
  },
  {
    id: "KH-R-1018",
    projectName: "Sobha Silver Estate Phase 2",
    clientName: "Sobha Developers Kerala",
    location: "Thrissur City, Kerala",
    locationDetails: {
      address: "Puzhakkal Road, Thrissur 680003",
      landmark: "Near Sobha City Mall",
    },
    requirements: [
      {
        trade: "Tile Worker",
        requiredCount: 4,
        availableCount: 4,
        matchingWorkerIds: ["KH-W-1170", "KH-W-1172", "KH-W-1174", "KH-W-1176"],
      },
      {
        trade: "Helper",
        requiredCount: 2,
        availableCount: 2,
        matchingWorkerIds: ["KH-W-1120", "KH-W-1140"],
      },
    ],
    startDate: "Sep 12, 2026",
    estimatedDuration: "20 Days",
    endDate: "Oct 02, 2026",
    workingHours: "8:30 AM – 5:30 PM",
    urgency: "scheduled",
    status: "reviewing",
    createdAt: "2d ago",
    notes: "Vitrified large format tile laying (800x1600mm) across 12 luxury duplex apartments.",
    scopeOfWork: [
      "Floor screed leveling and adhesive bedding",
      "Tile leveling clip system installation",
      "Epoxy joint grouting and cleaning",
    ],
    tasks: [
      {
        id: "task-1018-1",
        title: "Floor screed leveling and adhesive bedding",
        category: "Floor Prep",
        description: "Laser level screed laying and polymer-modified adhesive spreading.",
        trade: "Tile Worker",
        workersCount: 4,
        period: "Sep 12 – Sep 18 (Week 1)",
        estimatedHours: "96h",
        priority: "High",
        status: "scheduled",
      },
      {
        id: "task-1018-2",
        title: "Large-format vitrified tile laying",
        category: "Tiling",
        description: "800x1600mm vitrified tile placement with clip leveling system.",
        trade: "Tile Worker & Helper",
        workersCount: 6,
        period: "Sep 19 – Sep 26 (Week 2)",
        estimatedHours: "120h",
        priority: "High",
        status: "scheduled",
      },
      {
        id: "task-1018-3",
        title: "Epoxy joint grouting & acid-free cleaning",
        category: "Finishing",
        description: "Two-part epoxy grout packing into tile joints and buff cleaning.",
        trade: "Helper",
        workersCount: 2,
        period: "Sep 27 – Oct 02 (Week 3)",
        estimatedHours: "48h",
        priority: "Medium",
        status: "scheduled",
      },
    ],
    contactPerson: {
      name: "Ramesh Chandran",
      phone: "+91 98460 99120",
      role: "Finishing Works Head",
    },
  },
  {
    id: "KH-R-1019",
    projectName: "Grand Kerala Convention Centre",
    clientName: "Pranavam Convention Hospitality",
    location: "Kollam Bypass, Kerala",
    locationDetails: {
      address: "Mevaram Bypass Junction, Kollam 691020",
      landmark: "Near Medicity Hospital",
    },
    requirements: [
      {
        trade: "Painter",
        requiredCount: 8,
        availableCount: 5,
        matchingWorkerIds: ["KH-W-1180", "KH-W-1182", "KH-W-1184", "KH-W-1186", "KH-W-1188"],
      },
      {
        trade: "Helper",
        requiredCount: 4,
        availableCount: 4,
        matchingWorkerIds: ["KH-W-1120", "KH-W-1140", "KH-W-1144", "KH-W-1156"],
      },
    ],
    startDate: "Sep 15, 2026",
    estimatedDuration: "25 Days",
    endDate: "Oct 10, 2026",
    workingHours: "8:00 AM – 5:00 PM",
    urgency: "urgent",
    status: "reviewing",
    createdAt: "3d ago",
    notes: "Main banquet hall interior acrylic emulsion and exterior weatherproof texture coating.",
    scopeOfWork: [
      "Double coat putty and surface sanding",
      "Airless spray primer application",
      "Two coats premium emulsion finish",
    ],
    tasks: [
      {
        id: "task-1019-1",
        title: "Double coat putty & sanding with staging",
        category: "Surface Prep",
        description: "Scaffold staging erection, surface sanding and double coat putty application.",
        trade: "Painter & Helper",
        workersCount: 12,
        period: "Sep 15 – Sep 22 (Week 1)",
        estimatedHours: "120h",
        priority: "High",
        status: "scheduled",
      },
      {
        id: "task-1019-2",
        title: "Airless spray primer application",
        category: "Undercoat",
        description: "Uniform moisture-resistant primer application across all banquet hall surfaces.",
        trade: "Painter",
        workersCount: 8,
        period: "Sep 23 – Sep 29 (Week 2)",
        estimatedHours: "80h",
        priority: "High",
        status: "scheduled",
      },
      {
        id: "task-1019-3",
        title: "Two coats premium interior emulsion finish",
        category: "Finishing",
        description: "High-grade washable emulsion application, cornice detailing and clean-up.",
        trade: "Painter & Helper",
        workersCount: 8,
        period: "Sep 30 – Oct 10 (Final Stage)",
        estimatedHours: "64h",
        priority: "Medium",
        status: "scheduled",
      },
    ],
    contactPerson: {
      name: "Gopakumar B",
      phone: "+91 94470 12099",
      role: "Project Director",
    },
  },
  // Accepted Requests (Ready for Workforce Deployment / Assignment)
  {
    id: "KH-R-1008",
    projectName: "Prestige CyberGreen Phase 1",
    clientName: "Prestige Group South",
    location: "Kakkanad, Kochi",
    locationDetails: {
      address: "Infopark Phase 2 Road, Kakkanad, Kochi 682042",
    },
    requirements: [
      {
        trade: "Mason",
        requiredCount: 6,
        availableCount: 6,
        matchingWorkerIds: ["KH-W-1042", "KH-W-1132", "KH-W-1136", "KH-W-1148", "KH-W-1152", "KH-W-1154"],
      },
    ],
    startDate: "Sep 01, 2026",
    estimatedDuration: "60 Days",
    workingHours: "8:00 AM – 5:00 PM",
    urgency: "scheduled",
    status: "accepted",
    createdAt: "4d ago",
    notes: "Accepted on Aug 28. Awaiting crew assignment selection.",
    contactPerson: {
      name: "Vivek George",
      phone: "+91 98471 00228",
      role: "Procurement Head",
    },
  },
  {
    id: "KH-R-1009",
    projectName: "Vasudha Luxury Enclave",
    clientName: "Vasudha Homes",
    location: "Kozhikode City, Kerala",
    requirements: [
      {
        trade: "Electrician",
        requiredCount: 4,
        availableCount: 4,
        matchingWorkerIds: ["KH-W-1160", "KH-W-1162", "KH-W-1164", "KH-W-1088"],
      },
    ],
    startDate: "Sep 03, 2026",
    estimatedDuration: "20 Days",
    workingHours: "8:00 AM – 5:00 PM",
    urgency: "normal",
    status: "accepted",
    createdAt: "5d ago",
  },
  {
    id: "KH-R-1011",
    projectName: "Confident Crown Tower",
    clientName: "Confident Group",
    location: "Trivandrum, Kerala",
    requirements: [
      {
        trade: "Carpenter",
        requiredCount: 4,
        availableCount: 4,
        matchingWorkerIds: ["KH-W-1104", "KH-W-1106", "KH-W-1110", "KH-W-1112"],
      },
    ],
    startDate: "Sep 06, 2026",
    estimatedDuration: "30 Days",
    workingHours: "8:30 AM – 5:30 PM",
    urgency: "scheduled",
    status: "accepted",
    createdAt: "6d ago",
  },
  {
    id: "KH-R-1012",
    projectName: "Trinity World Phase 3",
    clientName: "Trinity Builders",
    location: "Edappally, Kochi",
    requirements: [
      {
        trade: "Plumber",
        requiredCount: 3,
        availableCount: 3,
        matchingWorkerIds: ["KH-W-1122", "KH-W-1124", "KH-W-1126"],
      },
    ],
    startDate: "Sep 07, 2026",
    estimatedDuration: "18 Days",
    workingHours: "8:00 AM – 5:00 PM",
    urgency: "normal",
    status: "accepted",
    createdAt: "1w ago",
  },
  {
    id: "KH-R-1013",
    projectName: "Sreerosh Anthea",
    clientName: "Sreerosh Properties",
    location: "Kannur Town, Kerala",
    requirements: [
      {
        trade: "Painter",
        requiredCount: 4,
        availableCount: 4,
        matchingWorkerIds: ["KH-W-1180", "KH-W-1182", "KH-W-1184", "KH-W-1186"],
      },
    ],
    startDate: "Sep 10, 2026",
    estimatedDuration: "15 Days",
    workingHours: "8:00 AM – 5:00 PM",
    urgency: "scheduled",
    status: "accepted",
    createdAt: "1w ago",
  },
  {
    id: "KH-R-1014",
    projectName: "Asset Signature",
    clientName: "Asset Homes",
    location: "Kakkanad, Kochi",
    requirements: [
      {
        trade: "Tile Worker",
        requiredCount: 3,
        availableCount: 3,
        matchingWorkerIds: ["KH-W-1170", "KH-W-1172", "KH-W-1174"],
      },
    ],
    startDate: "Sep 12, 2026",
    estimatedDuration: "25 Days",
    workingHours: "8:00 AM – 5:00 PM",
    urgency: "normal",
    status: "accepted",
    createdAt: "1w ago",
  },
  {
    id: "KH-R-1015",
    projectName: "Prime Meridian Horizons",
    clientName: "Prime Meridian",
    location: "Kochi, Kerala",
    requirements: [
      {
        trade: "Mason",
        requiredCount: 5,
        availableCount: 5,
        matchingWorkerIds: ["KH-W-1042", "KH-W-1132", "KH-W-1136", "KH-W-1148", "KH-W-1152"],
      },
    ],
    startDate: "Sep 14, 2026",
    estimatedDuration: "40 Days",
    workingHours: "8:00 AM – 5:00 PM",
    urgency: "scheduled",
    status: "accepted",
    createdAt: "1w ago",
  },
  {
    id: "KH-R-1016",
    projectName: "Abad Green Terra",
    clientName: "Abad Builders",
    location: "Aluva, Kochi",
    requirements: [
      {
        trade: "Helper",
        requiredCount: 4,
        availableCount: 4,
        matchingWorkerIds: ["KH-W-1120", "KH-W-1140", "KH-W-1144", "KH-W-1156"],
      },
    ],
    startDate: "Sep 15, 2026",
    estimatedDuration: "30 Days",
    workingHours: "8:00 AM – 5:00 PM",
    urgency: "normal",
    status: "accepted",
    createdAt: "1w ago",
  },
  // History: Rejected Requests
  {
    id: "KH-R-1002",
    projectName: "National Highway Flyover Pier 42",
    clientName: "KNR Constructions",
    location: "Kollam, Kerala",
    requirements: [
      {
        trade: "Steel Fixer",
        requiredCount: 12,
        availableCount: 0,
        matchingWorkerIds: [],
      },
    ],
    startDate: "Jul 15, 2026",
    estimatedDuration: "60 Days",
    workingHours: "8:00 AM – 5:00 PM",
    urgency: "urgent",
    status: "rejected",
    createdAt: "1mo ago",
    notes: "Declined due to heavy ongoing demand at Kazhakkoottam site.",
  },
  {
    id: "KH-R-1003",
    projectName: "Kochi Metro Phase 2 Extension",
    clientName: "KMRL Civil Works",
    location: "Kaloor, Kochi",
    requirements: [
      {
        trade: "Mason",
        requiredCount: 8,
        availableCount: 2,
        matchingWorkerIds: ["KH-W-1042", "KH-W-1132"],
      },
    ],
    startDate: "Jun 20, 2026",
    estimatedDuration: "45 Days",
    workingHours: "8:00 AM – 5:00 PM",
    urgency: "urgent",
    status: "rejected",
    createdAt: "2mo ago",
    notes: "Declined due to shift schedule conflict.",
  },
];

/**
 * Dynamically computes workforce match state for a given request against available workers.
 */
export function calculateRequestMatch(
  request: LabourRequest
): RequestMatchSummary {
  let totalRequired = 0;
  let totalAvailable = 0;
  const shortages: { trade: WorkerTrade; shortBy: number }[] = [];

  request.requirements.forEach((req) => {
    totalRequired += req.requiredCount;

    const availCount = Math.min(req.requiredCount, req.availableCount);
    totalAvailable += availCount;

    if (availCount < req.requiredCount) {
      shortages.push({
        trade: req.trade,
        shortBy: req.requiredCount - availCount,
      });
    }
  });

  const matchPercentage = totalRequired > 0 ? Math.round((totalAvailable / totalRequired) * 100) : 0;

  let matchState: "full" | "partial" | "none" = "partial";
  if (totalAvailable >= totalRequired && totalRequired > 0) {
    matchState = "full";
  } else if (totalAvailable === 0) {
    matchState = "none";
  }

  return {
    matchState,
    totalRequired,
    totalAvailable,
    shortages,
    matchPercentage,
  };
}

/**
 * Computes the 4 operational summary metrics for the requests dashboard.
 */
export function calculateRequestsMetrics(requests: LabourRequest[]): RequestSummaryMetrics {
  const newRequests = requests.filter((r) => r.status === "new" || r.status === "reviewing");

  let workersNeeded = 0;
  let canFulfil = 0;
  let needAttention = 0;

  newRequests.forEach((req) => {
    const match = calculateRequestMatch(req);
    workersNeeded += match.totalRequired;
    canFulfil += match.totalAvailable;

    if (match.matchState === "partial" || match.matchState === "none" || req.urgency === "urgent") {
      needAttention++;
    }
  });

  return {
    newRequests: newRequests.length,
    workersNeeded,
    canFulfil,
    needAttention,
  };
}
