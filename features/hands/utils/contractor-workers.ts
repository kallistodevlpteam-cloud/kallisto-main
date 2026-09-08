import type { AssignedWorker, DeploymentContractor, Deployment } from "../types/hands.types";

export interface ContractorWorkersSummary {
  totalWorkers: number;
  activeWorkers: number;
  onLeaveWorkers: number;
  assignedWorkers: AssignedWorker[];
}

export const APEX_MASONRY_WORKERS: AssignedWorker[] = [
  {
    id: "wrk-apex-1",
    name: "Rajan K.",
    role: "Lead Foreman & Structural Mason",
    trade: "Masonry",
    status: "active",
    shiftTiming: "8:00 AM – 5:00 PM",
    checkInTime: "07:55 AM",
    taskAssignment: "North wing 9-inch wall alignment & plumb lines",
    phone: "+91 98471 10293",
    experience: "14 yrs",
  },
  {
    id: "wrk-apex-2",
    name: "Murugan S.",
    role: "Senior Mason - Plumb & Level",
    trade: "Masonry",
    status: "active",
    shiftTiming: "8:00 AM – 5:00 PM",
    checkInTime: "08:00 AM",
    taskAssignment: "Perimeter brick masonry & jointing",
    phone: "+91 94462 81920",
    experience: "11 yrs",
  },
  {
    id: "wrk-apex-3",
    name: "Dinesh P.",
    role: "Structural Mason",
    trade: "Masonry",
    status: "active",
    shiftTiming: "8:00 AM – 5:00 PM",
    checkInTime: "08:02 AM",
    taskAssignment: "Corner junction bonding & damp-proof course",
    phone: "+91 98460 38291",
    experience: "9 yrs",
  },
  {
    id: "wrk-apex-4",
    name: "Suresh Babu",
    role: "Blockwork Specialist",
    trade: "Masonry",
    status: "active",
    shiftTiming: "8:00 AM – 5:00 PM",
    checkInTime: "08:05 AM",
    taskAssignment: "AAC block cutting & adhesive application",
    phone: "+91 97451 92834",
    experience: "8 yrs",
  },
  {
    id: "wrk-apex-5",
    name: "Vijayan M.",
    role: "Bricklayer - North Facade",
    trade: "Masonry",
    status: "active",
    shiftTiming: "8:00 AM – 5:00 PM",
    checkInTime: "08:00 AM",
    taskAssignment: "Lintel height masonry courses",
    phone: "+91 94950 18273",
    experience: "6 yrs",
  },
  {
    id: "wrk-apex-6",
    name: "Anandhu R.",
    role: "Bricklayer - South Elevation",
    trade: "Masonry",
    status: "active",
    shiftTiming: "8:00 AM – 5:00 PM",
    checkInTime: "08:10 AM",
    taskAssignment: "Window opening reveal construction",
    phone: "+91 94002 81726",
    experience: "5 yrs",
  },
  {
    id: "wrk-apex-7",
    name: "Satheesh T.",
    role: "Pointing & Jointing Mason",
    trade: "Masonry",
    status: "active",
    shiftTiming: "8:00 AM – 5:00 PM",
    checkInTime: "07:58 AM",
    taskAssignment: "Mortar raking & surface finish check",
    phone: "+91 98473 62510",
    experience: "7 yrs",
  },
  {
    id: "wrk-apex-8",
    name: "Manoj V.",
    role: "Lintel & Beam Mason",
    trade: "Masonry",
    status: "active",
    shiftTiming: "8:00 AM – 5:00 PM",
    checkInTime: "08:04 AM",
    taskAssignment: "Eastern elevation brick courses",
    phone: "+91 97471 29481",
    experience: "6 yrs",
  },
];

export const MALABAR_HELPERS_WORKERS: AssignedWorker[] = [
  {
    id: "wrk-malabar-1",
    name: "Gireesh Kumar",
    role: "Labour Foreman & Material Lead",
    trade: "Helpers",
    status: "active",
    shiftTiming: "8:00 AM – 5:00 PM",
    checkInTime: "07:50 AM",
    taskAssignment: "Mixer batching oversight & scaffolding staging",
    phone: "+91 98472 91823",
    experience: "7 yrs",
  },
  {
    id: "wrk-malabar-2",
    name: "Praveen K.",
    role: "Mixer Operator & Batching",
    trade: "Helpers",
    status: "active",
    shiftTiming: "8:00 AM – 5:00 PM",
    checkInTime: "07:55 AM",
    taskAssignment: "Mortar batch mixing (1:4 cement-sand ratio)",
    phone: "+91 94471 20918",
    experience: "6 yrs",
  },
  {
    id: "wrk-malabar-3",
    name: "Sunil Das",
    role: "Scaffolding Rigger Helper",
    trade: "Helpers",
    status: "active",
    shiftTiming: "8:00 AM – 5:00 PM",
    checkInTime: "08:00 AM",
    taskAssignment: "Scaffolding guard rails & work platform erection",
    phone: "+91 98460 19283",
    experience: "5 yrs",
  },
  {
    id: "wrk-malabar-4",
    name: "Akhil Chandran",
    role: "Material Carrier - North Wing",
    trade: "Helpers",
    status: "active",
    shiftTiming: "8:00 AM – 5:00 PM",
    checkInTime: "08:05 AM",
    taskAssignment: "Wire-cut brick transport to 1st floor hoist",
    phone: "+91 94951 82910",
    experience: "4 yrs",
  },
  {
    id: "wrk-malabar-5",
    name: "Sreejith P.",
    role: "Mortar Hauler",
    trade: "Helpers",
    status: "active",
    shiftTiming: "8:00 AM – 5:00 PM",
    checkInTime: "08:00 AM",
    taskAssignment: "Mortar pan delivery to North wall masons",
    phone: "+91 94001 72839",
    experience: "4 yrs",
  },
  {
    id: "wrk-malabar-6",
    name: "Subhash M.",
    role: "Rebar Staging Helper",
    trade: "Helpers",
    status: "active",
    shiftTiming: "8:00 AM – 5:00 PM",
    checkInTime: "08:08 AM",
    taskAssignment: "Lintel rebar bar-bending assistance",
    phone: "+91 98470 38291",
    experience: "3 yrs",
  },
  {
    id: "wrk-malabar-7",
    name: "Biju Narayanan",
    role: "Block Staging & Sand Sifting",
    trade: "Helpers",
    status: "active",
    shiftTiming: "8:00 AM – 5:00 PM",
    checkInTime: "08:00 AM",
    taskAssignment: "Sand screening & water curing staging",
    phone: "+91 97452 81920",
    experience: "5 yrs",
  },
  {
    id: "wrk-malabar-8",
    name: "Haridas K.",
    role: "General Site Helper",
    trade: "Helpers",
    status: "active",
    shiftTiming: "8:00 AM – 5:00 PM",
    checkInTime: "08:12 AM",
    taskAssignment: "Scaffolding safety check & mortar clean-up",
    phone: "+91 94460 91827",
    experience: "3 yrs",
  },
  {
    id: "wrk-malabar-9",
    name: "Ramesh Kumar",
    role: "Material Staging Helper",
    trade: "Helpers",
    status: "on-leave",
    shiftTiming: "8:00 AM – 5:00 PM",
    checkInTime: "Absent today",
    taskAssignment: "Reported absence / Replacement requested",
    phone: "+91 98461 92837",
    experience: "4 yrs",
  },
  {
    id: "wrk-malabar-10",
    name: "Deepu Mohan",
    role: "Helper - Transport Line",
    trade: "Helpers",
    status: "on-leave",
    shiftTiming: "8:00 AM – 5:00 PM",
    checkInTime: "Absent today",
    taskAssignment: "Approved medical leave / Replacement pending",
    phone: "+91 97470 19283",
    experience: "2 yrs",
  },
];

export function getContractorWorkersSummary(
  contractor: DeploymentContractor,
  deployment?: Partial<Deployment>,
): ContractorWorkersSummary {
  if (contractor.assignedWorkers && contractor.assignedWorkers.length > 0) {
    const total = contractor.workerCount || contractor.assignedWorkers.length;
    const active =
      contractor.activeWorkers ??
      contractor.assignedWorkers.filter((w) => w.status === "active").length;
    const onLeave =
      contractor.onLeaveWorkers ?? Math.max(0, total - active);
    return {
      totalWorkers: total,
      activeWorkers: active,
      onLeaveWorkers: onLeave,
      assignedWorkers: contractor.assignedWorkers,
    };
  }

  const nameLower = contractor.name.toLowerCase();
  const tradeLower = (contractor.trade || "").toLowerCase();

  if (nameLower.includes("apex") || tradeLower.includes("mason")) {
    return {
      totalWorkers: 8,
      activeWorkers: 8,
      onLeaveWorkers: 0,
      assignedWorkers: APEX_MASONRY_WORKERS,
    };
  }

  if (nameLower.includes("malabar") || tradeLower.includes("helper")) {
    return {
      totalWorkers: 10,
      activeWorkers: 8,
      onLeaveWorkers: 2,
      assignedWorkers: MALABAR_HELPERS_WORKERS,
    };
  }

  const count = contractor.workerCount || 6;
  const activeCount = Math.max(1, count - 1);
  const onLeaveCount = count - activeCount;

  const generatedWorkers: AssignedWorker[] = Array.from({ length: count }, (_, i) => {
    const isLead = i === 0;
    const isActive = i < activeCount;
    return {
      id: `wrk-${contractor.id || "gen"}-${i + 1}`,
      name:
        isLead && contractor.leadName
          ? contractor.leadName
          : `Worker ${i + 1} (${contractor.trade || "Tradesperson"})`,
      role: isLead
        ? `Lead ${contractor.trade || "Technician"}`
        : `${contractor.trade || "Site"} Operative`,
      trade: contractor.trade || "Site Services",
      status: isActive ? "active" : "on-leave",
      shiftTiming: deployment?.shift || "8:00 AM – 5:00 PM",
      checkInTime: isActive ? `08:0${i} AM` : "Absent today",
      taskAssignment: `Scheduled ${contractor.trade || "works"} in ${deployment?.projectName || "active project"}`,
      experience: `${3 + i} yrs`,
    };
  });

  return {
    totalWorkers: count,
    activeWorkers: activeCount,
    onLeaveWorkers: onLeaveCount,
    assignedWorkers: generatedWorkers,
  };
}
