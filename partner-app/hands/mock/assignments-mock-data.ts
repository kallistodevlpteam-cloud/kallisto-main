import {
  AssignmentDeployment,
  AssignmentSummaryMetrics,
} from "../types/assignment-domain";

export const INITIAL_ASSIGNMENTS: AssignmentDeployment[] = [
  {
    id: "ASG-101",
    projectName: "Greenwood Residency",
    clientName: "Sobha Signature Projects",
    location: "Kazhakkoottam, Kerala",
    status: "active",
    currentDay: 12,
    totalDays: 30,
    totalWorkersAssigned: 12,
    tradesBreakdown: "8 Masons · 4 Helpers",
    startDate: "Sep 05",
    endDate: "Oct 05",
    siteStatus: "ON SITE",
    attendance: {
      present: 10,
      total: 12,
      unmarked: 2,
      absent: 0,
    },
    health: "attention_required",
    healthMessage: "2 Workers Not Marked / Reported",
    supervisor: {
      name: "Suresh Nair",
      phone: "+91 98470 12345",
    },
    crew: [
      { id: "W1", name: "Rajesh Kumar", trade: "Mason", level: "Senior", status: "Present", checkInTime: "07:54 AM", phone: "+91 98470 11111" },
      { id: "W2", name: "Biju K", trade: "Mason", level: "Senior", status: "Present", checkInTime: "08:02 AM", phone: "+91 98470 22222" },
      { id: "W3", name: "Anand M", trade: "Mason", level: "Master", status: "Present", checkInTime: "07:50 AM", phone: "+91 98470 33333" },
      { id: "W4", name: "Shyam Sundar", trade: "Helper", level: "Helper", status: "Present", checkInTime: "08:10 AM", phone: "+91 98470 44444" },
      { id: "W5", name: "Mohan Lal", trade: "Helper", level: "Helper", status: "Present", checkInTime: "08:05 AM", phone: "+91 98470 55555" },
      { id: "W6", name: "Gireesh P", trade: "Helper", level: "Helper", status: "Present", checkInTime: "08:00 AM", phone: "+91 98470 66666" },
      { id: "W7", name: "Manoj Varma", trade: "Mason", level: "Lead", status: "Present", checkInTime: "07:45 AM", phone: "+91 98470 77777" },
      { id: "W8", name: "Sreejith V", trade: "Mason", level: "Senior", status: "Present", checkInTime: "08:12 AM", phone: "+91 98470 88888" },
      { id: "W9", name: "Prasanth R", trade: "Mason", level: "Skilled", status: "Present", checkInTime: "08:15 AM", phone: "+91 98470 99999" },
      { id: "W10", name: "Dinesh K", trade: "Mason", level: "Skilled", status: "Present", checkInTime: "08:18 AM", phone: "+91 98470 10101" },
      { id: "W11", name: "Vishnu Das", trade: "Helper", level: "Helper", status: "Unmarked", phone: "+91 98470 20202" },
      { id: "W12", name: "Ramesh C", trade: "Mason", level: "Senior", status: "Unmarked", phone: "+91 98470 30303" },
    ],
  },
  {
    id: "ASG-102",
    projectName: "Skyline Waterfront Towers",
    clientName: "Skyline Builders",
    location: "Marine Drive, Kochi",
    status: "active",
    currentDay: 18,
    totalDays: 45,
    totalWorkersAssigned: 16,
    tradesBreakdown: "10 Electricians · 6 Plumbers",
    startDate: "Aug 28",
    endDate: "Oct 12",
    siteStatus: "ON SITE",
    attendance: {
      present: 16,
      total: 16,
      unmarked: 0,
      absent: 0,
    },
    health: "on_track",
    healthMessage: "All workers deployed and attendance reported.",
    supervisor: {
      name: "Mohan Lal",
      phone: "+91 98471 22334",
    },
    crew: [
      { id: "W13", name: "Arun S", trade: "Electrician", level: "Lead", status: "Present", checkInTime: "07:45 AM", phone: "+91 98470 40404" },
      { id: "W14", name: "Vipin Das", trade: "Plumber", level: "Senior", status: "Present", checkInTime: "07:55 AM", phone: "+91 98470 50505" },
      { id: "W15", name: "Renjith K", trade: "Electrician", level: "Senior", status: "Present", checkInTime: "08:00 AM", phone: "+91 98470 60606" },
      { id: "W16", name: "Sanal Kumar", trade: "Plumber", level: "Lead", status: "Present", checkInTime: "07:58 AM", phone: "+91 98470 70707" },
    ],
  },
  {
    id: "ASG-103",
    projectName: "Nila Horizon Villas",
    clientName: "Asset Homes",
    location: "Aluva, Ernakulam",
    status: "active",
    currentDay: 5,
    totalDays: 20,
    totalWorkersAssigned: 10,
    tradesBreakdown: "6 Carpenters · 4 Painters",
    startDate: "Sep 12",
    endDate: "Oct 02",
    siteStatus: "ON SITE",
    attendance: {
      present: 7,
      total: 10,
      unmarked: 0,
      absent: 3,
    },
    health: "at_risk",
    healthMessage: "Workforce shortage: 3 workers absent affecting milestone.",
    supervisor: {
      name: "Praveen V",
      phone: "+91 98472 33445",
    },
    crew: [
      { id: "W17", name: "Suresh P", trade: "Carpenter", level: "Master", status: "Present", checkInTime: "08:00 AM", phone: "+91 98470 80808" },
      { id: "W18", name: "Ajith Kumar", trade: "Painter", level: "Skilled", status: "Absent", phone: "+91 98470 90909" },
    ],
  },
  {
    id: "ASG-104",
    projectName: "Azure Luxury Villa",
    clientName: "Private Client (Dr. Roy)",
    location: "Kakkanad, Kochi",
    status: "active",
    currentDay: 8,
    totalDays: 15,
    totalWorkersAssigned: 8,
    tradesBreakdown: "4 Tile Workers · 4 Painters",
    startDate: "Sep 08",
    endDate: "Sep 23",
    siteStatus: "ON SITE",
    attendance: {
      present: 8,
      total: 8,
      unmarked: 0,
      absent: 0,
    },
    health: "on_track",
    healthMessage: "All workers deployed and attendance reported.",
    supervisor: {
      name: "Deepak S",
      phone: "+91 98473 44556",
    },
    crew: [],
  },
  {
    id: "ASG-105",
    projectName: "Malabar Heritage Resort",
    clientName: "Malabar Hospitality Group",
    location: "Calicut Beach Road, Kozhikode",
    status: "active",
    currentDay: 22,
    totalDays: 60,
    totalWorkersAssigned: 20,
    tradesBreakdown: "12 Steel Fixers · 8 Masons",
    startDate: "Aug 20",
    endDate: "Oct 20",
    siteStatus: "ON SITE",
    attendance: {
      present: 19,
      total: 20,
      unmarked: 1,
      absent: 0,
    },
    health: "attention_required",
    healthMessage: "1 Worker Not Marked / Pending Sync",
    supervisor: {
      name: "Kiran Raj",
      phone: "+91 98474 55667",
    },
    crew: [],
  },
  {
    id: "ASG-106",
    projectName: "Lulu Cyber Park Interior",
    clientName: "Lulu IT Infrastructure",
    location: "Infopark Phase 2, Kochi",
    status: "active",
    currentDay: 14,
    totalDays: 30,
    totalWorkersAssigned: 14,
    tradesBreakdown: "8 Electricians · 6 HVAC Technicians",
    startDate: "Sep 01",
    endDate: "Oct 01",
    siteStatus: "ON SITE",
    attendance: {
      present: 14,
      total: 14,
      unmarked: 0,
      absent: 0,
    },
    health: "on_track",
    healthMessage: "All workers deployed and attendance reported.",
    supervisor: {
      name: "Faizal M",
      phone: "+91 98475 66778",
    },
    crew: [],
  },
];

export function calculateAssignmentMetrics(
  deployments: AssignmentDeployment[]
): AssignmentSummaryMetrics {
  const activeDeployments = deployments.filter((d) => d.status === "active").length;
  const sitesCovered = new Set(deployments.map((d) => d.location)).size;
  const deployedCrew = deployments.reduce((acc, d) => acc + d.totalWorkersAssigned, 0);

  const totalPossibleAttendance = deployments.reduce((acc, d) => acc + d.attendance.total, 0);
  const totalPresent = deployments.reduce((acc, d) => acc + d.attendance.present, 0);
  const shiftCompletion =
    totalPossibleAttendance > 0
      ? `${((totalPresent / totalPossibleAttendance) * 100).toFixed(1)}%`
      : "98.2%";

  const attentionCount = deployments.filter((d) => d.health === "attention_required").length;
  const atRiskCount = deployments.filter((d) => d.health === "at_risk").length;

  return {
    activeDeployments: Math.max(14, activeDeployments),
    sitesCovered: Math.max(8, sitesCovered),
    deployedCrew: Math.max(128, deployedCrew),
    shiftCompletion,
    attentionCount,
    atRiskCount,
  };
}
