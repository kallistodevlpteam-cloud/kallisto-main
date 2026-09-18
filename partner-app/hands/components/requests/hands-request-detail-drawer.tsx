"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  ExternalLink,
  AlertTriangle,
  UserX,
  Search,
  CheckCircle2,
  Users,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import {
  TeamDuotoneIcon,
  CalendarDuotoneIcon,
  LocationDuotoneIcon,
  StudioDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { LabourRequest, RequestTaskItem } from "../../types/request-domain";
import { WorkerProfile } from "../../types/worker-domain";
import { calculateRequestMatch } from "../../mock/requests-mock-data";
import { getProviderDisplayDetails } from "../../mock/provider-profiles-mock-data";
import { INITIAL_WORKERS } from "../workers/../../mock/workers-mock-data";
import styles from "./hands-requests.module.css";

function MetricClockDuotoneIcon({
  size = 14,
  style = {},
}: {
  size?: number;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
    >
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.28" />
      <path
        d="M12 7V12L15.5 14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

const BENCH_POOL_BY_TRADE: Record<string, WorkerProfile[]> = {
  Helper: [
    {
      id: "KH-W-1120",
      name: "Vipin Das",
      trade: "Helper",
      level: "Senior",
      experienceYears: 7,
      availability: "Available",
      dailyRate: 1000,
      phone: "+91 94002 99401",
      location: "Tripunithura, Kochi",
      skills: ["Material Handling", "Mortar Mixing", "Scaffolding Assistance"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1140",
      name: "Candidate 1140",
      trade: "Helper",
      level: "Skilled",
      experienceYears: 5,
      availability: "Available",
      dailyRate: 850,
      phone: "+91 98470 11140",
      location: "Trivandrum, Kerala",
      skills: ["Material Staging", "Site Cleaning"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1144",
      name: "Candidate 1144",
      trade: "Helper",
      level: "Skilled",
      experienceYears: 5,
      availability: "Available",
      dailyRate: 850,
      phone: "+91 98470 11144",
      location: "Trivandrum, Kerala",
      skills: ["Concrete Batching Support", "Curing Support"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1156",
      name: "Candidate 1156",
      trade: "Helper",
      level: "Skilled",
      experienceYears: 5,
      availability: "Available",
      dailyRate: 850,
      phone: "+91 98470 11156",
      location: "Trivandrum, Kerala",
      skills: ["Material Staging", "Mortar Mixing"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1168",
      name: "Sunil Thomas",
      trade: "Helper",
      level: "Skilled",
      experienceYears: 4,
      availability: "Available",
      dailyRate: 800,
      phone: "+91 98470 11168",
      location: "Kollam, Kerala",
      skills: ["Block Carrying", "Stage Rigging Support"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1172",
      name: "Anil Kumar",
      trade: "Helper",
      level: "Skilled",
      experienceYears: 3,
      availability: "Available",
      dailyRate: 800,
      phone: "+91 98470 11172",
      location: "Attingal, Trivandrum",
      skills: ["Excavation Support", "Shutter Cleaning"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1178",
      name: "Biju Paul",
      trade: "Helper",
      level: "Senior",
      experienceYears: 6,
      availability: "Available",
      dailyRate: 850,
      phone: "+91 98470 11178",
      location: "Nedumangad, Trivandrum",
      skills: ["Mortar Mixing", "Site Clearing"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1182",
      name: "Santhosh M",
      trade: "Helper",
      level: "Skilled",
      experienceYears: 5,
      availability: "Available",
      dailyRate: 820,
      phone: "+91 98470 11182",
      location: "Kazhakkoottam, Trivandrum",
      skills: ["Staging Rigging", "Floor Level Assistance"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
  ],
  Mason: [
    {
      id: "KH-W-1042",
      name: "Rajesh Kumar",
      trade: "Mason",
      level: "Senior",
      experienceYears: 8,
      availability: "Available",
      dailyRate: 950,
      phone: "+91 98471 20455",
      location: "Kazhakkoottam, Trivandrum",
      skills: ["Brickwork", "Plastering", "Block Work"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1132",
      name: "Ramesh Babu",
      trade: "Mason",
      level: "Senior",
      experienceYears: 8,
      availability: "Available",
      dailyRate: 1050,
      phone: "+91 98470 55132",
      location: "Pattom, Trivandrum",
      skills: ["Solid Block Masonry", "Plastering"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1136",
      name: "Candidate 1136",
      trade: "Mason",
      level: "Skilled",
      experienceYears: 5,
      availability: "Available",
      dailyRate: 850,
      phone: "+91 98470 11136",
      location: "Trivandrum, Kerala",
      skills: ["Partition Blockwork", "Pointing"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1148",
      name: "Candidate 1148",
      trade: "Mason",
      level: "Skilled",
      experienceYears: 5,
      availability: "Available",
      dailyRate: 850,
      phone: "+91 98470 11148",
      location: "Trivandrum, Kerala",
      skills: ["Plastering", "Brick Masonry"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1152",
      name: "Candidate 1152",
      trade: "Mason",
      level: "Skilled",
      experienceYears: 5,
      availability: "Available",
      dailyRate: 850,
      phone: "+91 98470 11152",
      location: "Trivandrum, Kerala",
      skills: ["Wall Plumb Alignment", "Screed"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1154",
      name: "Candidate 1154",
      trade: "Mason",
      level: "Skilled",
      experienceYears: 5,
      availability: "Available",
      dailyRate: 850,
      phone: "+91 98470 11154",
      location: "Trivandrum, Kerala",
      skills: ["Block Masonry", "Pointing"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
  ],
  Carpenter: [
    {
      id: "KH-W-1104",
      name: "Suresh Pillai",
      trade: "Carpenter",
      level: "Senior",
      experienceYears: 9,
      availability: "Available",
      dailyRate: 1100,
      phone: "+91 98470 11104",
      location: "Trivandrum, Kerala",
      skills: ["Mivan Shuttering", "Formwork"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1106",
      name: "Anil Das",
      trade: "Carpenter",
      level: "Skilled",
      experienceYears: 6,
      availability: "Available",
      dailyRate: 950,
      phone: "+91 98470 11106",
      location: "Kazhakkoottam, Trivandrum",
      skills: ["Beam Bottom Alignment", "Timber Scaffolding"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1110",
      name: "Vinod Kumar",
      trade: "Carpenter",
      level: "Skilled",
      experienceYears: 5,
      availability: "Available",
      dailyRate: 900,
      phone: "+91 98470 11110",
      location: "Attingal, Trivandrum",
      skills: ["Shutter Assembly", "Edge Shuttering"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1112",
      name: "Baiju Mohan",
      trade: "Carpenter",
      level: "Senior",
      experienceYears: 8,
      availability: "Available",
      dailyRate: 1050,
      phone: "+91 98470 11112",
      location: "Pattom, Trivandrum",
      skills: ["Aluminum Formwork", "Safety Railings"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1114",
      name: "Manoj K",
      trade: "Carpenter",
      level: "Skilled",
      experienceYears: 6,
      availability: "Available",
      dailyRate: 920,
      phone: "+91 98470 11114",
      location: "Nedumangad, Trivandrum",
      skills: ["Floor Slab Propping", "Panel Fixing"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1116",
      name: "Deepak S",
      trade: "Carpenter",
      level: "Skilled",
      experienceYears: 4,
      availability: "Available",
      dailyRate: 880,
      phone: "+91 98470 11116",
      location: "Trivandrum, Kerala",
      skills: ["Shutter Dismantling", "Formwork Alignment"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1126",
      name: "Rajan K",
      trade: "Carpenter",
      level: "Skilled",
      experienceYears: 7,
      availability: "Available",
      dailyRate: 900,
      phone: "+91 98470 11126",
      location: "Kollam, Kerala",
      skills: ["Aluminum Formwork", "Mivan Shuttering"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1128",
      name: "Pradeep Menon",
      trade: "Carpenter",
      level: "Senior",
      experienceYears: 8,
      availability: "Available",
      dailyRate: 950,
      phone: "+91 98470 11128",
      location: "Ernakulam, Kerala",
      skills: ["Beam Bottom Alignment", "Column Boxing"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1130",
      name: "Vineeth Vijayan",
      trade: "Carpenter",
      level: "Skilled",
      experienceYears: 5,
      availability: "Available",
      dailyRate: 880,
      phone: "+91 98470 11130",
      location: "Alappuzha, Kerala",
      skills: ["Slab Formwork", "Safety Railing"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1134",
      name: "Santhosh Kumar",
      trade: "Carpenter",
      level: "Skilled",
      experienceYears: 7,
      availability: "Available",
      dailyRate: 920,
      phone: "+91 98470 11134",
      location: "Thrissur, Kerala",
      skills: ["Timber Scaffolding", "Edge Shuttering"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
  ],
  Electrician: [
    {
      id: "KH-W-1160",
      name: "Suresh N",
      trade: "Electrician",
      level: "Senior",
      experienceYears: 8,
      availability: "Available",
      dailyRate: 1000,
      phone: "+91 98470 11160",
      location: "Kochi, Kerala",
      skills: ["DB Dressing", "Concealed Conduit"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1162",
      name: "Rahul R",
      trade: "Electrician",
      level: "Skilled",
      experienceYears: 5,
      availability: "Available",
      dailyRate: 900,
      phone: "+91 98470 11162",
      location: "Kochi, Kerala",
      skills: ["FRLS Copper Wiring", "Box Dressing"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1164",
      name: "Jomon V",
      trade: "Electrician",
      level: "Skilled",
      experienceYears: 6,
      availability: "Available",
      dailyRate: 920,
      phone: "+91 98470 11164",
      location: "Kochi, Kerala",
      skills: ["Earthing Loop", "Cable Tray Installation"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1170",
      name: "Anoop Nair",
      trade: "Electrician",
      level: "Senior",
      experienceYears: 7,
      availability: "Available",
      dailyRate: 980,
      phone: "+91 98470 11170",
      location: "Aluva, Kerala",
      skills: ["Lighting Fixtures", "Panel Board Termination"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1174",
      name: "Harish Kumar",
      trade: "Electrician",
      level: "Skilled",
      experienceYears: 4,
      availability: "Available",
      dailyRate: 850,
      phone: "+91 98470 11174",
      location: "Ernakulam, Kerala",
      skills: ["Switchboard Fixing", "Cable Pulling"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1176",
      name: "Manu George",
      trade: "Electrician",
      level: "Skilled",
      experienceYears: 5,
      availability: "Available",
      dailyRate: 880,
      phone: "+91 98470 11176",
      location: "Kakkanad, Kochi",
      skills: ["Earthing Resistance Testing", "Circuit Testing"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
  ],
  Plumber: [
    {
      id: "KH-W-1122",
      name: "Dileep K",
      trade: "Plumber",
      level: "Senior",
      experienceYears: 8,
      availability: "Available",
      dailyRate: 950,
      phone: "+91 98470 11122",
      location: "Kochi, Kerala",
      skills: ["CPVC Pressure Piping", "Valve Manifold Fixing"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1124",
      name: "Naveen S",
      trade: "Plumber",
      level: "Skilled",
      experienceYears: 5,
      availability: "Available",
      dailyRate: 880,
      phone: "+91 98470 11124",
      location: "Kochi, Kerala",
      skills: ["Hydro-testing", "Drainage Laying"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1180",
      name: "Sreejith P",
      trade: "Plumber",
      level: "Skilled",
      experienceYears: 6,
      availability: "Available",
      dailyRate: 900,
      phone: "+91 98470 11180",
      location: "Tripunithura, Kochi",
      skills: ["Sanitary Fitting", "Piping Pressure Test"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1184",
      name: "Varghese Mathew",
      trade: "Plumber",
      level: "Senior",
      experienceYears: 9,
      availability: "Available",
      dailyRate: 1000,
      phone: "+91 98470 11184",
      location: "Kottayam, Kerala",
      skills: ["Manifold Assembly", "Water Tank Connection"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
    {
      id: "KH-W-1186",
      name: "Dileep R",
      trade: "Plumber",
      level: "Skilled",
      experienceYears: 5,
      availability: "Available",
      dailyRate: 880,
      phone: "+91 98470 11186",
      location: "Ernakulam, Kerala",
      skills: ["CPVC Jointing", "Gully Trap Fixing"],
      verificationStatus: "Verified",
      verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
      recentWork: [],
    },
  ],
};

interface HandsRequestDetailDrawerProps {
  request: LabourRequest;
  isOpen: boolean;
  onClose: () => void;
  onAcceptRequest: (req: LabourRequest, assignedWorkerIds?: string[]) => void;
  onDeclineRequest: (req: LabourRequest) => void;
  onAskOdinForRequest?: (req: LabourRequest) => void;
}

export function HandsRequestDetailDrawer({
  request,
  isOpen,
  onClose,
  onAcceptRequest,
  onDeclineRequest,
  onAskOdinForRequest,
}: HandsRequestDetailDrawerProps) {
  const router = useRouter();
  const [overlayStep, setOverlayStep] = useState<"details" | "match_candidates">("details");
  const [isAcceptedSuccess, setIsAcceptedSuccess] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [declineReason, setDeclineReason] = useState("Bench workforce fully committed");
  const [prevRequestId, setPrevRequestId] = useState(request.id);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>(() =>
    request.requirements.flatMap((req) => req.matchingWorkerIds || [])
  );
  if (prevRequestId !== request.id) {
    setPrevRequestId(request.id);
    setSelectedWorkerIds(request.requirements.flatMap((req) => req.matchingWorkerIds || []));
  }
  const [expandedTrades, setExpandedTrades] = useState<Record<string, boolean>>({});

  const toggleTradeExpand = (trade: string) => {
    setExpandedTrades((prev) => ({
      ...prev,
      [trade]: !prev[trade],
    }));
  };

  const toggleSelectWorker = (workerId: string) => {
    setSelectedWorkerIds((prev) =>
      prev.includes(workerId)
        ? prev.filter((id) => id !== workerId)
        : [...prev, workerId]
    );
  };

  const match = calculateRequestMatch(request);
  const totalWorkers = request.requirements.reduce((acc, r) => acc + r.requiredCount, 0);

  // Find candidate available workers for this request
  const candidateWorkers: WorkerProfile[] = useMemo(() => {
    return request.requirements.flatMap((req) =>
      (req.matchingWorkerIds || []).map((id) => {
        const existing = INITIAL_WORKERS.find((w) => w.id === id);
        if (existing && existing.trade === req.trade) {
          return existing;
        }
        const fallbackWorker: WorkerProfile = {
          id,
          name: existing ? existing.name : `Candidate ${id.split("-").pop()}`,
          trade: req.trade,
          level: existing?.level || "Skilled",
          experienceYears: existing?.experienceYears || 5,
          availability: "Available",
          dailyRate: existing?.dailyRate || 850,
          phone: existing?.phone || "+91 98470 00000",
          location: existing?.location || "Trivandrum, Kerala",
          skills: existing?.skills || [req.trade],
          verificationStatus: existing?.verificationStatus || "Verified",
          verificationDetails: existing?.verificationDetails || {
            identityVerified: true,
            phoneVerified: true,
            tradeCertified: true,
          },
          recentWork: existing?.recentWork || [],
        };
        return fallbackWorker;
      })
    );
  }, [request]);

  // Group candidate available workers by trade with bench pool expansion
  const candidateGroups = useMemo(() => {
    const knownTrades = new Set<string>(request.requirements.map((r) => r.trade));
    const groups: Array<{
      trade: string;
      requiredCount: number;
      hasShortage: boolean;
      matchedWorkers: WorkerProfile[];
      allWorkers: WorkerProfile[];
      displayedWorkers: WorkerProfile[];
      isExpanded: boolean;
    }> = request.requirements.map((req) => {
      const matchedWorkers = candidateWorkers.filter((w) => w.trade === req.trade);
      const hasShortage = matchedWorkers.length < req.requiredCount;
      const benchPool = BENCH_POOL_BY_TRADE[req.trade];
      let allWorkers = benchPool && benchPool.length > matchedWorkers.length ? benchPool : matchedWorkers;

      // When available candidates are there (!hasShortage), ensure contractor has a larger bench pool to view and select from
      if (!hasShortage && allWorkers.length <= matchedWorkers.length) {
        const extraCandidates: WorkerProfile[] = [
          {
            id: `KH-W-${req.trade.slice(0, 3).toUpperCase()}-EXTRA-1`,
            name: `Bench ${req.trade} 1`,
            trade: req.trade,
            level: "Skilled",
            experienceYears: 5,
            availability: "Available",
            dailyRate: 850,
            phone: "+91 98470 22001",
            location: "Trivandrum, Kerala",
            skills: [`${req.trade} Execution`, "Safety Protocols"],
            verificationStatus: "Verified",
            verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
            recentWork: [],
          },
          {
            id: `KH-W-${req.trade.slice(0, 3).toUpperCase()}-EXTRA-2`,
            name: `Bench ${req.trade} 2`,
            trade: req.trade,
            level: "Senior",
            experienceYears: 7,
            availability: "Available",
            dailyRate: 900,
            phone: "+91 98470 22002",
            location: "Trivandrum, Kerala",
            skills: [`Advanced ${req.trade}`, "Quality Inspection"],
            verificationStatus: "Verified",
            verificationDetails: { identityVerified: true, phoneVerified: true, tradeCertified: true },
            recentWork: [],
          },
        ];
        allWorkers = [...matchedWorkers, ...extraCandidates];
      }

      const isExpanded = Boolean(expandedTrades[req.trade]);
      const displayedWorkers = isExpanded ? allWorkers : matchedWorkers;

      return {
        trade: req.trade,
        requiredCount: req.requiredCount,
        hasShortage,
        matchedWorkers,
        allWorkers,
        displayedWorkers,
        isExpanded,
      };
    });

    const otherWorkers = candidateWorkers.filter((w) => !knownTrades.has(w.trade));
    if (otherWorkers.length > 0) {
      groups.push({
        trade: "Other",
        requiredCount: otherWorkers.length,
        hasShortage: false,
        matchedWorkers: otherWorkers,
        allWorkers: otherWorkers,
        displayedWorkers: otherWorkers,
        isExpanded: false,
      });
    }

    return groups.filter((g) => g.displayedWorkers.length > 0);
  }, [request.requirements, candidateWorkers, expandedTrades]);

  // Derived tasks for the requisition period, sorted High priority first then Medium
  const periodTasks: RequestTaskItem[] = useMemo(() => {
    let rawTasks: RequestTaskItem[];
    if (request.tasks && request.tasks.length > 0) {
      rawTasks = request.tasks;
    } else {
      const defaultScope = [
        { title: "RCC Framework & Column Casting", trade: "Mason", category: "Structural", hours: "120h", priority: "High" },
        { title: "Brick Masonry & Wall Plastering", trade: "Mason", category: "Masonry", hours: "96h", priority: "High" },
        { title: "Internal Electrical Wiring", trade: "Electrician", category: "Electrical", hours: "64h", priority: "Medium" },
        { title: "Plumbing & Sanitary Fixtures", trade: "Plumber", category: "Plumbing", hours: "48h", priority: "Medium" },
      ];
      rawTasks = defaultScope.map((item, idx) => ({
        id: `task-gen-${idx + 1}`,
        title: item.title,
        trade: item.trade,
        category: item.category,
        estimatedHours: item.hours,
        priority: item.priority,
        status: "in-progress",
      }));
    }

    const priorityRank = (p?: string) => {
      if (p === "High") return 1;
      if (p === "Medium") return 2;
      if (p === "Low") return 3;
      return 2;
    };

    return [...rawTasks].sort((a, b) => {
      const rankA = priorityRank(a.priority);
      const rankB = priorityRank(b.priority);
      return rankA - rankB;
    });
  }, [request]);

  // Effective assigned worker IDs:
  // For trades that are not expanded, all matched displayed workers are automatically assigned.
  // For trades that ARE expanded (selectable), only contractor-selected candidates are assigned.
  const effectiveAssignedWorkerIds = useMemo(() => {
    const ids: string[] = [];
    candidateGroups.forEach((group) => {
      if (group.isExpanded) {
        group.displayedWorkers.forEach((w) => {
          if (selectedWorkerIds.includes(w.id)) {
            ids.push(w.id);
          }
        });
      } else {
        group.displayedWorkers.forEach((w) => {
          ids.push(w.id);
        });
      }
    });
    return ids;
  }, [candidateGroups, selectedWorkerIds]);

  const handleConfirmAssignment = () => {
    setIsAcceptedSuccess(true);
    setSelectedWorkerIds(effectiveAssignedWorkerIds);
    onAcceptRequest(request, effectiveAssignedWorkerIds);
  };

  const handleConfirmDecline = () => {
    setShowDeclineConfirm(false);
    onDeclineRequest(request);
  };

  const handleClose = () => {
    setIsAcceptedSuccess(false);
    setOverlayStep("details");
    setShowDeclineConfirm(false);
    onClose();
  };

  const primaryTrade = request.requirements[0]?.trade || "Workforce";
  const providerDisplay = getProviderDisplayDetails(request.clientName, primaryTrade);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="detail-title">
      <div className={styles.detailCardModal}>
        {/* Header for Request Details */}
        {overlayStep === "details" && (
          <div className={styles.detailModalHeader}>
            <div className={styles.detailModalHeaderLeft}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className={styles.detailModalId}>Request {request.id}</span>
                {request.status === "rejected" && (
                  <span className={`${styles.cardStatusPill} ${styles.cardStatusRejected}`}>
                    Rejected
                  </span>
                )}
                {request.status === "closed" && (
                  <span className={`${styles.cardStatusPill} ${styles.cardStatusClosed}`}>
                    Closed
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    router.push(`/partner/hands/profile/${providerDisplay.slug}`);
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    border: "none",
                    background: "transparent",
                    color: "#2563eb",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <span>View Profile</span>
                  <ExternalLink size={12} />
                </button>
              </div>
              <h2 id="detail-title" className={styles.detailModalTitle}>
                {providerDisplay.name}
              </h2>
              <div className={styles.detailModalLocation}>
                <span style={{ fontWeight: 600, color: "#475569" }}>{providerDisplay.profession}</span>
              </div>
            </div>

            <button
              type="button"
              className={styles.detailCloseBtn}
              onClick={handleClose}
              aria-label="Close request details"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Accepted Success Screen */}
        {isAcceptedSuccess ? (
          <div className={styles.acceptedSuccessBody}>
            <div className={styles.successIconBox}>
              <CheckCircle2 size={36} color="#059669" />
            </div>

            <h3 className={styles.successTitle}>Request Accepted & Crew Assigned!</h3>
            <p className={styles.successSubtitle}>
              Successfully allocated <strong>{selectedWorkerIds.length} candidate(s)</strong> to{" "}
              <strong>{request.projectName}</strong> for{" "}
              <strong>{request.startDate} – {request.endDate || request.estimatedDuration}</strong> ({request.estimatedDuration}).
            </p>

            {/* Workforce Demand, Timeline, Site Location summary box */}
            <div className={styles.confirmDetailsBox}>
              <div className={styles.confirmDetailItem}>
                <span className={styles.confirmDetailLabel}>Workforce Demand:</span>
                <span className={styles.confirmDetailVal}>
                  {totalWorkers} Workers ({request.requirements.map((r) => `${r.requiredCount} ${r.trade}s`).join(", ")})
                </span>
              </div>
              <div className={styles.confirmDetailItem}>
                <span className={styles.confirmDetailLabel}>Timeline:</span>
                <span className={styles.confirmDetailVal}>
                  {request.startDate} · {request.estimatedDuration}
                </span>
              </div>
              <div className={styles.confirmDetailItem}>
                <span className={styles.confirmDetailLabel}>Site Location:</span>
                <span className={styles.confirmDetailVal}>
                  {request.location}
                </span>
              </div>
            </div>

            {/* Actions: Cancel & Confirm (go to assignments) */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", width: "100%", marginTop: "10px" }}>
              <button
                type="button"
                className={styles.reviewSecondaryBtn}
                onClick={handleClose}
              >
                Cancel
              </button>

              <button
                type="button"
                className={styles.acceptPrimaryBtn}
                style={{ marginLeft: 0 }}
                onClick={() => {
                  handleClose();
                  router.push("/partner/hands/assignments");
                }}
              >
                <StudioDuotoneIcon size={14} />
                <span>Confirm</span>
              </button>
            </div>
          </div>
        ) : overlayStep === "details" ? (
          /* Step 1: Main Details Body (with Tasks for Period, without candidates list) */
          <>
            <div className={styles.detailModalBody}>
              {/* 1. Project Brief & Scope Summary */}
              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}>Project Brief & Scope</h4>
                <div className={styles.projectBriefCard}>
                  <div className={styles.projectBriefHeader}>
                    <div className={styles.projectPhaseBadge}>
                      <span className={styles.activePhaseDot} />
                      <span>Construction Stage · Superstructure Phase</span>
                    </div>
                    <span className={styles.clientTag}>{request.projectName}</span>
                  </div>

                  {request.notes && (
                    <p className={styles.projectBriefNotes}>{request.notes}</p>
                  )}

                  {request.contactPerson && (
                    <div className={styles.siteSupervisorRow}>
                      <span className={styles.supervisorLabel}>Site In-Charge:</span>
                      <span className={styles.supervisorName}>
                        {request.contactPerson.name} ({request.contactPerson.role})
                      </span>
                      <span className={styles.supervisorPhone}>{request.contactPerson.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Workforce Required */}
              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}>Workforce Required</h4>
                <div className={styles.requirementsGrid}>
                  {request.requirements.map((req) => (
                    <div key={req.trade} className={styles.reqBox}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <TeamDuotoneIcon size={16} style={{ color: "#2563eb", flexShrink: 0 }} />
                        <span className={styles.reqBoxTrade}>{req.trade}s</span>
                      </div>
                      <span className={styles.reqBoxCount}>{req.requiredCount} Workers Required</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Work Details */}
              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}>Work Details</h4>
                <div className={styles.workDetailsGrid}>
                  <div className={styles.workDetailBox}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <CalendarDuotoneIcon size={13} style={{ color: "#64748b" }} />
                      <span className={styles.workDetailLabel}>Start Date</span>
                    </div>
                    <span className={styles.workDetailValue}>{request.startDate}</span>
                  </div>

                  <div className={styles.workDetailBox}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <MetricClockDuotoneIcon size={13} style={{ color: "#64748b" }} />
                      <span className={styles.workDetailLabel}>Duration</span>
                    </div>
                    <span className={styles.workDetailValue}>{request.estimatedDuration}</span>
                  </div>

                  <div className={styles.workDetailBox}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <MetricClockDuotoneIcon size={13} style={{ color: "#64748b" }} />
                      <span className={styles.workDetailLabel}>Working Hours</span>
                    </div>
                    <span className={styles.workDetailValue}>{request.workingHours}</span>
                  </div>
                </div>
              </div>

              {/* 4. Location */}
              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}>Location</h4>
                <div className={styles.locationDetailBox}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                    <LocationDuotoneIcon size={18} style={{ color: "#2563eb", flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                        {request.projectName}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {request.locationDetails?.address || request.location}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.viewLocationBtn}
                    onClick={() => alert(`Opening map location: ${request.locationDetails?.address || request.location}`)}
                  >
                    <span>View Location</span>
                    <ExternalLink size={11} />
                  </button>
                </div>
              </div>

              {/* 5. Tasks to Complete During This Period */}
              <div className={styles.detailSection}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h4 className={styles.detailSectionTitle}>Tasks to Complete During This Period</h4>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", background: "#eff6ff", padding: "2px 8px", borderRadius: "9999px" }}>
                    {periodTasks.length} Tasks
                  </span>
                </div>

                <div className={styles.periodTasksContainer}>
                  {periodTasks.map((task, idx) => {
                    const priority = task.priority || (idx % 2 === 0 ? "High" : "Medium");
                    const hours =
                      task.estimatedHours ||
                      (idx === 0 ? "120h" : idx === 1 ? "96h" : idx === 2 ? "64h" : "48h");

                    const priorityClass =
                      priority === "High"
                        ? styles.taskPriorityDotHigh
                        : priority === "Low"
                        ? styles.taskPriorityDotLow
                        : styles.taskPriorityDotMedium;

                    const pillClass =
                      priority === "High"
                        ? styles.taskPriorityPillHigh
                        : priority === "Low"
                        ? styles.taskPriorityPillLow
                        : styles.taskPriorityPillMedium;

                    return (
                      <div key={task.id} className={styles.taskItemRow}>
                        <div className={styles.taskItemLeft}>
                          <span className={`${styles.taskPriorityDot} ${priorityClass}`} />
                          <div className={styles.taskItemContent}>
                            <span className={styles.taskItemTitle}>{task.title}</span>
                            <span className={styles.taskItemSubtitle}>
                              {(task.trade || task.category || "General")} · {hours}
                            </span>
                          </div>
                        </div>

                        <div className={styles.taskItemRight}>
                          <span className={`${styles.taskPriorityPill} ${pillClass}`}>
                            {priority}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 6. Workforce Match Intelligence (Placed at bottom, below task section) */}
              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}>Workforce Match Intelligence</h4>
                <div className={styles.matchBreakdownCard}>
                  <div className={styles.matchBreakdownHeader}>
                    <span className={styles.matchBreakdownTitle}>Bench Availability vs Demand</span>
                    <span
                      className={styles.matchBreakdownPill}
                      style={{
                        backgroundColor:
                          match.matchState === "full"
                            ? "#ecfdf5"
                            : match.matchState === "partial"
                            ? "#fffbeb"
                            : "#fef2f2",
                        color:
                          match.matchState === "full"
                            ? "#047857"
                            : match.matchState === "partial"
                            ? "#b45309"
                            : "#dc2626",
                      }}
                    >
                      {match.matchState === "full"
                        ? "✓ Full Match"
                        : match.matchState === "partial"
                        ? "◐ Partial Match"
                        : "✕ No Match"}
                    </span>
                  </div>

                  {request.requirements.map((req) => (
                    <div key={req.trade} className={styles.matchRow}>
                      <span>{req.trade}s</span>
                      <span style={{ fontWeight: 650 }}>
                        {req.availableCount} / {req.requiredCount} Available
                      </span>
                    </div>
                  ))}

                  <div className={`${styles.matchRow} ${styles.matchTotalRow}`}>
                    <span>Overall Workforce Match</span>
                    <span>{match.totalAvailable} / {match.totalRequired} Workers ({match.matchPercentage}%)</span>
                  </div>

                  {match.shortages.length > 0 && (
                    <div className={styles.shortageWarning}>
                      <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                      <span>
                        Short by {match.shortages.map((s) => `${s.shortBy} ${s.trade}s`).join(", ")}. Additional recruitment or bench redeployment required.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className={styles.detailModalFooter}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {request.status !== "accepted" && request.status !== "closed" && request.status !== "rejected" && (
                  <button
                    type="button"
                    className={styles.declineSecondaryBtn}
                    onClick={() => setShowDeclineConfirm(true)}
                  >
                    <UserX size={14} />
                    <span>Decline</span>
                  </button>
                )}

                {onAskOdinForRequest && (
                  <button
                    type="button"
                    className={styles.reviewSecondaryBtn}
                    onClick={() => onAskOdinForRequest(request)}
                  >
                    <Search size={13} />
                    <span>Analyse with Odin</span>
                  </button>
                )}
              </div>

              {request.status !== "accepted" && request.status !== "closed" && request.status !== "rejected" && (
                <button
                  type="button"
                  className={styles.acceptPrimaryBtn}
                  onClick={() => setOverlayStep("match_candidates")}
                >
                  <Check size={14} />
                  <span>Accept & View Matched Candidates</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </>
        ) : (
          /* Step 2: Matched Available Candidates (Clean style matching Image 3) */
          <>
            <div className={styles.matchOverlayHeader}>
              <div className={styles.matchHeaderLeft}>
                <h3 className={styles.matchHeaderTitle}>Matching Available Candidates</h3>
                <div className={styles.matchHeaderSubtitle}>
                  {request.projectName} · {request.startDate} – {request.endDate || request.estimatedDuration} ({request.estimatedDuration})
                </div>
              </div>

              <button
                type="button"
                className={styles.detailCloseBtn}
                onClick={handleClose}
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            <div className={styles.detailModalBody}>
              <div className={styles.detailSection}>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {candidateGroups.map((group) => {
                    const isSelectable = Boolean(group.isExpanded);

                    return (
                      <div key={group.trade} className={styles.candidateTradeGroup}>
                        <div className={styles.candidateTradeHeader}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <h4 className={styles.detailSectionTitle} style={{ margin: 0 }}>
                              {group.trade}s ({group.displayedWorkers.length})
                            </h4>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {!group.hasShortage && group.allWorkers.length > group.matchedWorkers.length && (
                              <button
                                type="button"
                                className={styles.viewAllTradeBtn}
                                onClick={() => toggleTradeExpand(group.trade)}
                              >
                                <Users size={12} />
                                <span>
                                  {group.isExpanded
                                    ? `Show Matched (${group.matchedWorkers.length})`
                                    : `View All Available ${group.trade}s (${group.allWorkers.length})`}
                                </span>
                              </button>
                            )}
                            {group.hasShortage && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  color: "#dc2626",
                                  background: "#fef2f2",
                                  border: "1px solid #fecaca",
                                  padding: "2px 8px",
                                  borderRadius: "9999px",
                                }}
                              >
                                {group.requiredCount} Required
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {group.displayedWorkers.map((worker) => {
                            const isSelected = selectedWorkerIds.includes(worker.id);

                            if (isSelectable) {
                              return (
                                <div
                                  key={worker.id}
                                  className={`${styles.candidateWorkerRow} ${styles.candidateWorkerRowInteractive} ${
                                    isSelected ? styles.candidateWorkerRowSelected : ""
                                  }`}
                                  onClick={() => toggleSelectWorker(worker.id)}
                                  role="checkbox"
                                  aria-checked={isSelected}
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      toggleSelectWorker(worker.id);
                                    }
                                  }}
                                >
                                  <div className={styles.candidateWorkerInfo}>
                                    <div
                                      className={`${styles.candidateCheckbox} ${
                                        isSelected ? styles.candidateCheckboxChecked : ""
                                      }`}
                                    >
                                      {isSelected && <Check size={12} strokeWidth={3} />}
                                    </div>
                                    <div className={styles.candidateAvatar}>
                                      {worker.name
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .slice(0, 2)
                                        .join("")}
                                    </div>
                                    <div>
                                      <div
                                        style={{
                                          fontWeight: 700,
                                          color: "#0f172a",
                                          fontSize: "12.5px",
                                        }}
                                      >
                                        {worker.name}
                                      </div>
                                      <div style={{ fontSize: "11px", color: "#64748b" }}>
                                        {worker.trade} ({worker.level}) · {worker.experienceYears} Yrs Exp · ₹
                                        {worker.dailyRate}/day
                                      </div>
                                    </div>
                                  </div>
                                  <span
                                    className={
                                      isSelected
                                        ? styles.candidateBadgeSelected
                                        : styles.candidateBadgeAvailable
                                    }
                                  >
                                    {isSelected ? "Ready for assignment" : "Available on bench"}
                                  </span>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={worker.id}
                                className={styles.candidateWorkerRow}
                              >
                                <div className={styles.candidateWorkerInfo}>
                                  <div className={styles.candidateAvatar}>
                                    {worker.name
                                      .split(" ")
                                      .map((n: string) => n[0])
                                      .slice(0, 2)
                                      .join("")}
                                  </div>
                                  <div>
                                    <div
                                      style={{
                                        fontWeight: 700,
                                        color: "#0f172a",
                                        fontSize: "12.5px",
                                      }}
                                    >
                                      {worker.name}
                                    </div>
                                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                                      {worker.trade} ({worker.level}) · {worker.experienceYears} Yrs Exp · ₹
                                      {worker.dailyRate}/day
                                    </div>
                                  </div>
                                </div>
                                <span className={styles.candidateBadgeSelected}>
                                  Ready for assignment
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={styles.detailModalFooter}>
              <button
                type="button"
                className={styles.reviewSecondaryBtn}
                onClick={() => setOverlayStep("details")}
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>

              <button
                type="button"
                className={styles.acceptPrimaryBtn}
                onClick={handleConfirmAssignment}
                disabled={effectiveAssignedWorkerIds.length === 0}
              >
                <StudioDuotoneIcon size={14} />
                <span>Assign Candidates</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Pop-up Card: Decline Request */}
      {showDeclineConfirm && (
        <div className={styles.confirmBackdrop}>
          <div className={styles.confirmCardModal}>
            <div className={styles.confirmHeader}>
              <div className={styles.confirmIconBox} style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}>
                <UserX size={20} />
              </div>
              <div>
                <h3 className={styles.confirmTitle}>Decline Request?</h3>
                <p className={styles.confirmSubtitle}>
                  This will close the requisition for <strong>{request.projectName}</strong> and update site management.
                </p>
              </div>
            </div>

            <div className={styles.declineReasonSection}>
              <label className={styles.declineReasonLabel}>Reason for Declining:</label>
              <div className={styles.declineReasonsList}>
                {[
                  "Bench workforce fully committed",
                  "Timeline clash with existing projects",
                  "Site location outside operational radius",
                  "Trade rates or requirements mismatch",
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    className={`${styles.declineReasonPill} ${declineReason === reason ? styles.declineReasonPillActive : ""}`}
                    onClick={() => setDeclineReason(reason)}
                  >
                    <span>{reason}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.confirmActionsRow}>
              <button
                type="button"
                className={styles.confirmCancelBtn}
                onClick={() => setShowDeclineConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmDeclineBtn}
                onClick={handleConfirmDecline}
              >
                <UserX size={14} />
                <span>Confirm Decline</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
