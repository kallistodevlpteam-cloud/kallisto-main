"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Eye,
  Filter,
  FolderKanban,
  HardHat,
  MapPin,
  Plus,
  Star,
  UserPlus,
  Users,
} from "lucide-react";
import { RupeeIcon } from "@/components/layout/sidebar-icons";
import type {
  ContractorPaymentRecord,
  Deployment,
  DeploymentActivityTask,
  DeploymentContractor,
  DeploymentHistoryLogEntry,
  WorkerTrade,
  WorkforceRequestDraft,
} from "../types/hands.types";
import { formatAttendance, formatInr } from "../utils/hands-formatters";
import { WorkforceRequestDrawer } from "./workforce-request-drawer";
import { ContractorPaymentModal } from "./contractor-payment-modal";
import { ProjectUpdatesCard } from "./project-updates-card";
import { AddTaskModal } from "./add-task-modal";
import { ManageProjectModal } from "./manage-project-modal";
import { DeploymentHistoryLogs } from "./deployment-history-logs";
import { DeploymentActivitiesCalendar } from "./deployment-activities-calendar";
import { INITIAL_DEPLOYMENT_TASKS } from "../utils/deployment-boq-gantt-data";
import { ContractorAssignedWorkersModal } from "./contractor-assigned-workers-modal";
import { getContractorWorkersSummary } from "../utils/contractor-workers";
import { AssignmentAccountsPanel } from "@/partner-app/hands/components/assignment-detail/assignment-accounts-panel";
import type {
  AssignmentAccounts,
  AssignmentTransaction,
} from "@/partner-app/hands/types/assignment-domain";
import styles from "./hands-overview.module.css";

function getContractorBrandVisual(name: string) {
  const n = name.toLowerCase();
  if (n.includes("apex")) return { initials: "AP", bg: "#ea580c", text: "#ffffff" };
  if (n.includes("malabar")) return { initials: "MS", bg: "#0d9488", text: "#ffffff" };
  if (n.includes("chroma")) return { initials: "CF", bg: "#e11d48", text: "#ffffff" };
  if (n.includes("circuit")) return { initials: "CM", bg: "#0284c7", text: "#ffffff" };
  if (n.includes("forma")) return { initials: "FC", bg: "#d97706", text: "#ffffff" };
  if (n.includes("heritage")) return { initials: "HL", bg: "#7c3aed", text: "#ffffff" };
  return { initials: "GC", bg: "#0f172a", text: "#ffffff" };
}

interface ActiveDeploymentWorkspaceProps {
  deployment: Deployment;
  basePath?: string;
  isPartner?: boolean;
}

export function ActiveDeploymentWorkspace({
  deployment,
  basePath = "/hands",
  isPartner = false,
}: ActiveDeploymentWorkspaceProps) {
  const [requestDrawerOpen, setRequestDrawerOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPaymentContractor] = useState<string>("");
  const [requestConfig, setRequestConfig] = useState<{
    initialProjectId?: string;
    initialTrade?: WorkerTrade | string;
    initialWorkerCount?: number | string;
    initialValues?: Partial<WorkforceRequestDraft>;
  } | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<
    "overview" | "contractors" | "activity" | "history" | "payments" | "transactions"
  >("overview");

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isManageProjectModalOpen, setIsManageProjectModalOpen] = useState(false);
  const [modalContractor, setModalContractor] = useState<DeploymentContractor | null>(null);

  const [tasksList, setTasksList] = useState<DeploymentActivityTask[]>(() => {
    if (deployment.todayActivity?.tasks && deployment.todayActivity.tasks.length > 0) {
      const hasDetailedTasks = deployment.todayActivity.tasks.some(
        (t) => Boolean(t.date) || Boolean(t.boqItemCode),
      );
      if (hasDetailedTasks) {
        return deployment.todayActivity.tasks;
      }
    }
    return INITIAL_DEPLOYMENT_TASKS;
  });

  const [overviewContractorFilter, setOverviewContractorFilter] = useState<string>("all");

  const todayTasks = useMemo(() => {
    return tasksList.filter((t) => {
      const isToday = !t.date || t.date === "2026-09-08";
      if (!isToday) return false;
      if (overviewContractorFilter === "all") return true;
      if (overviewContractorFilter === "Site Supervision") {
        return !t.contractorName || t.contractorName === "Site Supervision";
      }
      return t.contractorName === overviewContractorFilter;
    });
  }, [tasksList, overviewContractorFilter]);

  const [historyLogsList, setHistoryLogsList] = useState<DeploymentHistoryLogEntry[]>(() => [
    {
      id: "log-1",
      date: "Today · Shift 12",
      time: "11:30 AM",
      shiftNumber: "Shift 12",
      author: deployment.supervisor || "Rajeev K.",
      authorRole: "Site Supervisor",
      category: "Muster & Shift Progress",
      content:
        "Morning muster completed with 16 of 18 workers present. 2 helpers reported leave. Perimeter masonry ongoing on North wing wall; plumb lines checked.",
      attendanceSummary: "16 / 18 workers present on site",
      tasksCompleted: [
        "Perimeter brick masonry & plumb line verification",
        "Mortar preparation & material staging",
      ],
    },
    {
      id: "log-2",
      date: "Yesterday · Shift 11",
      time: "05:00 PM",
      shiftNumber: "Shift 11",
      author: deployment.supervisor || "Rajeev K.",
      authorRole: "Site Supervisor",
      category: "Shift Completion Sign-off",
      content:
        "Shift 11 operations wrapped up. 450 sq ft brickwork completed and inspected. Mortar mixer washed, scaffolding safety guard checked and locked.",
      attendanceSummary: "18 / 18 workers present (Full shift)",
      tasksCompleted: [
        "West facade masonry completion",
        "Evening curing of ground-floor columns",
      ],
    },
    {
      id: "log-3",
      date: "Yesterday · Shift 11",
      time: "02:15 PM",
      shiftNumber: "Shift 11",
      author: deployment.supervisor || "Rajeev K.",
      authorRole: "Site Supervisor",
      category: "Safety & Logistics",
      content:
        "Joint thickness verified (10–12mm). Rebar reinforcement in lintel verified with site engineer. Zero safety violations reported during site walkthrough.",
      tasksCompleted: [
        "Structural lintel rebar inspection",
        "Safety harness & helmet compliance check",
      ],
    },
    {
      id: "log-4",
      date: "Sep 06, 2026 · Shift 10",
      time: "09:30 AM",
      shiftNumber: "Shift 10",
      author: deployment.supervisor || "Rajeev K.",
      authorRole: "Site Supervisor",
      category: "Safety & Logistics",
      content:
        "Delivered batch of 3,000 wire-cut red bricks and 40 bags of OPC-53 cement unloaded and stacked safely at staging bay 2.",
      attendanceSummary: "18 / 18 workers present",
    },
    {
      id: "log-5",
      date: "Sep 05, 2026 · Shift 09",
      time: "05:30 PM",
      shiftNumber: "Shift 09",
      author: deployment.supervisor || "Rajeev K.",
      authorRole: "Site Supervisor",
      category: "Task Event",
      content:
        "Scaffolding erected on Eastern facade. Safety netting secured. 4 masons shifted to exterior partition layout per revised structural drawings.",
      attendanceSummary: "17 / 18 workers present",
    },
  ]);

  const contractors = useMemo(() => {
    if (deployment.contractors && deployment.contractors.length > 0) {
      return deployment.contractors.map((c) =>
        typeof c === "string" ? { name: c } : c,
      );
    }
    return deployment.contractorName ? [{ name: deployment.contractorName }] : [];
  }, [deployment.contractors, deployment.contractorName]);

  const handleAddTask = (newTask: DeploymentActivityTask) => {
    const taskWithDate: DeploymentActivityTask = {
      ...newTask,
      date: newTask.date || "2026-09-08",
      boqItemCode: newTask.boqItemCode || "BOQ-04.1",
      boqItemName: newTask.boqItemName || "230mm Wire-Cut Red Clay Brickwork in CM 1:6",
      ganttPhaseId: newTask.ganttPhaseId || "phase-2",
      ganttPhaseName: newTask.ganttPhaseName || "Phase 2: Superstructure Masonry & Lintel Level",
      serviceCategory: newTask.serviceCategory || "Civil & Masonry Works",
    };

    setTasksList((prev) => [taskWithDate, ...prev]);

    const assignedTarget = taskWithDate.contractorName
      ? `${taskWithDate.contractorName} (${taskWithDate.trade})`
      : taskWithDate.trade;

    const newLogEntry: DeploymentHistoryLogEntry = {
      id: `log-task-${taskWithDate.id}`,
      date: "Today · Active Shift",
      time: "Just now",
      shiftNumber: "Shift 12",
      author: deployment.supervisor || "Site Supervisor",
      authorRole: "Site Supervisor",
      category: "Task Event",
      content: `New site task scheduled: "${taskWithDate.title}" assigned to ${assignedTarget} (${taskWithDate.time}).`,
      tasksCompleted: [taskWithDate.title],
    };
    setHistoryLogsList((prev) => [newLogEntry, ...prev]);
  };

  const handleUpdateTask = (updatedTask: DeploymentActivityTask) => {
    setTasksList((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
    );

    const newLog: DeploymentHistoryLogEntry = {
      id: `log-update-${updatedTask.id}-${Date.now()}`,
      date: "Today · Active Shift",
      time: "Just now",
      shiftNumber: "Shift 12",
      author: deployment.supervisor || "Site Supervisor",
      authorRole: "Site Supervisor",
      category: "Task Event",
      content: `Task details updated: "${updatedTask.title}" (${updatedTask.status}) [BOQ: ${updatedTask.boqItemCode || "N/A"}].`,
    };
    setHistoryLogsList((prev) => [newLog, ...prev]);
  };

  const handleCancelTask = (taskId: string, reason: string) => {
    const target = tasksList.find((t) => t.id === taskId);
    if (!target) return;

    const now = new Date().toISOString();
    const updatedTask: DeploymentActivityTask = {
      ...target,
      status: "cancelled",
      cancellationReason: reason,
      cancelledAt: now,
      cancelledBy: deployment.supervisor || "Site Supervisor",
    };

    setTasksList((prev) =>
      prev.map((t) => (t.id === taskId ? updatedTask : t)),
    );

    const newLog: DeploymentHistoryLogEntry = {
      id: `log-cancel-${taskId}-${Date.now()}`,
      date: "Today · Active Shift",
      time: "Just now",
      shiftNumber: "Shift 12",
      author: deployment.supervisor || "Site Supervisor",
      authorRole: "Site Supervisor",
      category: "Safety & Logistics",
      content: `Task cancelled: "${target.title}". Reason: ${reason}`,
    };
    setHistoryLogsList((prev) => [newLog, ...prev]);
  };

  const handleToggleTaskStatus = (taskId: string) => {
    const target = tasksList.find((t) => t.id === taskId);
    if (!target) return;

    const nextStatus: DeploymentActivityTask["status"] =
      target.status === "pending" || target.status === "scheduled"
        ? "in-progress"
        : target.status === "in-progress"
          ? "completed"
          : "pending";

    setTasksList((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t)),
    );

    const statusLabel =
      nextStatus === "completed"
        ? "Completed"
        : nextStatus === "in-progress"
          ? "In progress"
          : "Scheduled";

    const newLog: DeploymentHistoryLogEntry = {
      id: `log-status-${target.id}-${nextStatus}`,
      date: "Today · Active Shift",
      time: "Just now",
      shiftNumber: "Shift 12",
      author: deployment.supervisor || "Site Supervisor",
      authorRole: "Site Supervisor",
      category: nextStatus === "completed" ? "Shift Completion Sign-off" : "Task Event",
      content: `Status updated for task "${target.title}": changed to ${statusLabel}.`,
      tasksCompleted: nextStatus === "completed" ? [target.title] : undefined,
    };
    setHistoryLogsList((prev) => [newLog, ...prev]);
  };

  const handleAddHistoryLog = (entry: DeploymentHistoryLogEntry) => {
    setHistoryLogsList((prev) => [entry, ...prev]);
  };

  const [extraTransactions, setExtraTransactions] = useState<AssignmentTransaction[]>([]);

  const defaultAccountsData: AssignmentAccounts = useMemo(() => {
    return {
      totalContractValue: 270000,
      dailyBillingRate: 9000,
      shiftsDelivered: 12,
      totalShiftsContracted: 30,
      paidAmount: 108000,
      pendingAmount: 162000,
      settlementStatus: "On Track - Weekly Cycle",
      invoiceNumber: "INV-ASG-101-W2",
      nextDisbursementDate: "Sep 15, 2026",
      tradeRates: [
        { trade: "Masons", workersCount: 8, ratePerDay: 850, totalPerDay: 6800 },
        { trade: "Helpers", workersCount: 4, ratePerDay: 550, totalPerDay: 2200 },
      ],
      transactions: [
        {
          id: `TXN-${deployment.id || "ASG-101"}-01`,
          date: "Sep 01, 2026",
          referenceNo: "UTR7710293841",
          paidBy: "Service Provider",
          paidByRole: "Service Provider",
          paidTo: contractors[0]?.name || "Apex Integrated Civil",
          title: "Milestone Deployment Advance",
          description: "Initial mobilization advance & perimeter brick masonry setup (Shifts 1–6).",
          amount: 54000,
          paymentMethod: "NEFT / Bank Transfer",
          status: "settled",
          invoiceRef: "INV-ASG-101-W1",
        },
        {
          id: `TXN-${deployment.id || "ASG-101"}-02`,
          date: "Sep 08, 2026",
          referenceNo: "UTR8829104821",
          paidBy: "Service Provider",
          paidByRole: "Service Provider",
          paidTo: contractors[1]?.name || contractors[0]?.name || "Malabar Site Crew",
          title: "Weekly Deployment Settlement - Cycle 1",
          description: "Perimeter brick masonry & plumb line verification for 12 crew members.",
          amount: 54000,
          paymentMethod: "NEFT / Bank Transfer",
          status: "settled",
          invoiceRef: "INV-ASG-101-W2",
        },
        {
          id: `TXN-${deployment.id || "ASG-101"}-03`,
          date: "Sep 15, 2026",
          referenceNo: "INV-ASG-101-W3",
          paidBy: "Service Provider",
          paidByRole: "Service Provider",
          paidTo: contractors[0]?.name || "Apex Integrated Civil",
          title: "Weekly Deployment Settlement - Cycle 2",
          description: "Mortar preparation, scaffolding staging & lintel shuttering (Shifts 7–12).",
          amount: 54000,
          paymentMethod: "NEFT / Bank Transfer",
          status: "processing",
          invoiceRef: "INV-ASG-101-W3",
        },
        {
          id: `TXN-${deployment.id || "ASG-101"}-04`,
          date: "Sep 22, 2026",
          referenceNo: "INV-ASG-101-W4",
          paidBy: "Service Provider",
          paidByRole: "Service Provider",
          paidTo: contractors[0]?.name || "Apex Integrated Civil",
          title: "Weekly Deployment Settlement - Cycle 3",
          description: "Lintel rebar placement, beam reinforcement & concrete curing (Shifts 13–18).",
          amount: 54000,
          paymentMethod: "NEFT / Bank Transfer",
          status: "pending",
          invoiceRef: "INV-ASG-101-W4",
        },
        {
          id: `TXN-${deployment.id || "ASG-101"}-05`,
          date: "Sep 29, 2026",
          referenceNo: "INV-ASG-101-W5",
          paidBy: "Service Provider",
          paidByRole: "Service Provider",
          paidTo: contractors[0]?.name || "Apex Integrated Civil",
          title: "Milestone Final Retention Settlement",
          description: "Final masonry quality sign-off & project completion handover retention.",
          amount: 54000,
          paymentMethod: "NEFT / Bank Transfer",
          status: "pending",
          invoiceRef: "INV-ASG-101-W5",
        },
        {
          id: `TXN-${deployment.id || "ASG-101"}-06`,
          date: "Oct 06, 2026",
          referenceNo: "UTR9930214812",
          paidBy: "Service Provider",
          paidByRole: "Service Provider",
          paidTo: contractors[1]?.name || contractors[0]?.name || "Malabar Site Crew",
          title: "Specialist Stone Masonry Incentive",
          description: "Performance completion incentive for curved boundary masonry detailing.",
          amount: 18000,
          paymentMethod: "NEFT / Bank Transfer",
          status: "settled",
          invoiceRef: "INV-ASG-101-W6",
        },
        {
          id: `TXN-${deployment.id || "ASG-101"}-07`,
          date: "Oct 13, 2026",
          referenceNo: "UTR9941029411",
          paidBy: "Service Provider",
          paidByRole: "Service Provider",
          paidTo: contractors[0]?.name || "Apex Integrated Civil",
          title: "Night Curing & Shuttering Overtime",
          description: "Verified overtime settlement for weather-proofing and beam curing crew.",
          amount: 22000,
          paymentMethod: "NEFT / Bank Transfer",
          status: "settled",
          invoiceRef: "INV-ASG-101-W7",
        },
        {
          id: `TXN-${deployment.id || "ASG-101"}-08`,
          date: "Oct 20, 2026",
          referenceNo: "INV-ASG-101-W8",
          paidBy: "Service Provider",
          paidByRole: "Service Provider",
          paidTo: contractors[0]?.name || "Apex Integrated Civil",
          title: "Site Demobilization & Final Clearance",
          description: "Scheduled final post-handover site clearance and demobilization disbursement.",
          amount: 25000,
          paymentMethod: "NEFT / Bank Transfer",
          status: "pending",
          invoiceRef: "INV-ASG-101-W8",
        },
      ],
    };
  }, [deployment.id, contractors]);

  const accountsData: AssignmentAccounts = useMemo(() => {
    if (extraTransactions.length === 0) return defaultAccountsData;
    const combined = [...extraTransactions, ...(defaultAccountsData.transactions || [])];
    const paidSum = combined
      .filter((t) => t.status === "settled" || t.status === "paid")
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      ...defaultAccountsData,
      paidAmount: paidSum,
      pendingAmount: Math.max(0, defaultAccountsData.totalContractValue - paidSum),
      transactions: combined,
    };
  }, [defaultAccountsData, extraTransactions]);

  const paymentCount = accountsData.transactions?.length || 8;

  const [, setTransactions] = useState<ContractorPaymentRecord[]>(() => [
    {
      id: "pay-2026-001",
      contractorName: contractors[0]?.name || "Apex Integrated Civil & Finishing Crew",
      workerCount: deployment.activeWorkers || 8,
      totalAmount: (deployment.dailyCost || 19800) * 7,
      paymentMethod: "bank_transfer",
      bankDetails: {
        bankName: "HDFC Bank Ltd.",
        accountNumber: "50100492817264",
        ifscCode: "HDFC0000240",
        beneficiaryName: `${contractors[0]?.name || "Apex Integrated Civil"} Pvt Ltd`,
        utrReference: "UTR948192019482",
      },
      paidAt: "25 Jul 2026, 11:30 AM",
      status: "Completed",
    },
    {
      id: "pay-2026-002",
      contractorName: contractors[1]?.name || contractors[0]?.name || "Malabar Site Crew",
      workerCount: 10,
      totalAmount: 45500,
      paymentMethod: "upi_transfer",
      upiDetails: {
        upiId: "malabarsitecrew@okaxis",
        transactionId: "UPI849201948271",
      },
      paidAt: "22 Jul 2026, 04:15 PM",
      status: "Completed",
    },
  ]);

  const statusClass =
    deployment.status === "Active"
      ? styles.statusActive
      : deployment.status === "Needs attention"
        ? styles.statusAttention
        : styles.statusWaiting;

  const hasShortfall =
    deployment.status === "Needs attention" ||
    (deployment.attendance &&
      deployment.attendance.present !== undefined &&
      deployment.attendance.total !== undefined &&
      deployment.attendance.present < deployment.attendance.total);

  const progressPct = deployment.overallProgress ?? 70;
  const category = deployment.category || "Construction & Structural";
  const dueLabel = deployment.dueLabel || "Active shift";
  const coverImage = deployment.coverImage || "/assets/projectbg.webp";

  const handleOpenRequest = () => {
    const shortfall =
      deployment.attendance &&
      deployment.attendance.total !== undefined &&
      deployment.attendance.present !== undefined
        ? Math.max(0, deployment.attendance.total - deployment.attendance.present)
        : undefined;

    setRequestConfig({
      initialProjectId: deployment.projectId || "proj-001",
      initialWorkerCount: shortfall && shortfall > 0 ? shortfall : undefined,
      initialValues: {
        projectId: deployment.projectId || "proj-001",
        siteLocation: deployment.location,
        siteContact: deployment.supervisor,
        shiftTiming: deployment.shift,
        notes: hasShortfall
          ? `Urgent shortfall replacement for ${deployment.projectName}. Attendance: ${deployment.attendance.present}/${deployment.attendance.total} workers on site.`
          : `Additional workforce requested for ${deployment.projectName} (${deployment.workforce}).`,
      },
    });
    setRequestDrawerOpen(true);
  };

  const renderContractorCard = (c: DeploymentContractor, idx: number) => {
    const brand = getContractorBrandVisual(c.name);
    const crewId =
      c.crewId ||
      (c.trade?.toLowerCase().includes("mason")
        ? "crew-masons-01"
        : c.trade?.toLowerCase().includes("helper")
          ? "crew-helpers-01"
          : c.trade?.toLowerCase().includes("paint")
            ? "crew-painters-01"
            : c.trade?.toLowerCase().includes("elec")
              ? "crew-electricians-01"
              : "crew-carpenters-01");
    const rating = c.rating ?? 4.9;
    const reviewCount = c.reviewCount ?? 38;
    const expYears = c.experienceYears ?? 10;
    const lead = c.leadName || deployment.supervisor;
    const spec =
      c.specialization ||
      (c.trade
        ? `${c.trade} Execution & Finishing`
        : "General Site Operations");

    const tradeProfileUrl = isPartner
      ? `/partner/hands/profile`
      : `/hands/trades/${crewId}`;

    const contractorKey = c.id || c.name || `contractor-${idx}`;
    const workersSummary = getContractorWorkersSummary(c, deployment);
    const { totalWorkers, activeWorkers, onLeaveWorkers } = workersSummary;

    return (
      <div
        key={contractorKey}
        className={`${styles.contractorProfileCard} ${styles.contractorProfileCardClickable}`}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-label={`Labour contractor: ${c.name}`}
        onClick={() => setModalContractor(c)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setModalContractor(c);
          }
        }}
      >
        <div className={styles.contractorProfileHeader}>
          <div
            className={styles.contractorAvatarBadge}
            style={{
              backgroundColor: brand.bg,
              color: brand.text,
            }}
            aria-hidden="true"
          >
            {brand.initials}
          </div>
          <div className={styles.contractorHeaderDetails}>
            <div className={styles.contractorNameRow}>
              <h3 className={styles.contractorName}>{c.name}</h3>
              <span className={styles.contractorVerifiedBadge}>
                <BadgeCheck size={13} aria-hidden="true" />
                {c.badge || "Verified Guild"}
              </span>
            </div>
            <div className={styles.contractorMetaSubRow}>
              {c.trade && (
                <span className={styles.contractorTradeTag}>
                  {c.workerCount ? `${c.workerCount} ` : ""}
                  {c.trade} Deployed
                </span>
              )}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "2.5px 8px",
                  borderRadius: "6px",
                  backgroundColor: activeWorkers === totalWorkers ? "#f0fdf4" : "#fef3c7",
                  color: activeWorkers === totalWorkers ? "#15803d" : "#b45309",
                  border: activeWorkers === totalWorkers ? "1px solid #bbf7d0" : "1px solid #fde68a",
                  fontSize: "11px",
                  fontWeight: 650,
                }}
              >
                <Users size={11} aria-hidden="true" />
                <span>
                  {totalWorkers} Workers ({activeWorkers} Active{onLeaveWorkers > 0 ? ` · ${onLeaveWorkers} on leave` : ""})
                </span>
              </span>
              <span className={styles.contractorRatingChip}>
                <Star
                  size={12}
                  className={styles.contractorStarIcon}
                  aria-hidden="true"
                />
                <strong>{rating.toFixed(1)}</strong> ({reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>

        <div className={styles.contractorProfileBody}>
          <div className={styles.contractorProfileStats}>
            <div className={styles.contractorStatItem}>
              <span className={styles.contractorStatLabel}>
                Lead / Foreman
              </span>
              <span className={styles.contractorStatValue}>
                {lead}
              </span>
            </div>
            <div className={styles.contractorStatItem}>
              <span className={styles.contractorStatLabel}>
                Experience
              </span>
              <span className={styles.contractorStatValue}>
                {expYears}+ yrs verified
              </span>
            </div>
          </div>
          {spec && (
            <div className={styles.contractorSpecRow}>
              <span className={styles.contractorSpecLabel}>
                Scope:
              </span>
              <span className={styles.contractorSpecVal}>
                {spec}
              </span>
            </div>
          )}
        </div>

        <div className={styles.contractorProfileFooter}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setModalContractor(c);
            }}
            className={styles.contractorAssignedWorkersBtn}
            aria-haspopup="dialog"
          >
            <Users size={13} aria-hidden="true" />
            <span>View Labour Details ({activeWorkers}/{totalWorkers} Active)</span>
          </button>

          <Link
            href={tradeProfileUrl}
            className={styles.contractorViewProfileBtn}
            title={`View full profile for ${c.name}`}
            onClick={(e) => e.stopPropagation()}
          >
            <span>View Contractor Profile</span>
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  };

  const backUrl = `${basePath}?tab=deployments`;

  return (
    <div className={`workspace-container ${styles.page}`}>
      {/* ── Breadcrumb & Top Navigation ── */}
      <div className={styles.deploymentBreadcrumbBar}>
        <div className={styles.breadcrumbLeft}>
          <Link href={backUrl} className={styles.backLinkBtn}>
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Back to Deployments</span>
          </Link>
          <div className={styles.breadcrumbPath}>
            <span>Virtual Office</span>
            <ChevronRight size={13} aria-hidden="true" />
            <span>Hands</span>
            <ChevronRight size={13} aria-hidden="true" />
            <Link href={backUrl}>Deployments</Link>
            <ChevronRight size={13} aria-hidden="true" />
            <strong className={styles.breadcrumbCurrent}>{deployment.projectName}</strong>
          </div>
        </div>

        <div className={styles.breadcrumbRightActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleOpenRequest}
          >
            <UserPlus size={14} aria-hidden="true" />
            <span>Request Workers</span>
          </button>
          <Link
            href={`${basePath}?tab=attendance`}
            className={styles.primaryButton}
          >
            <CheckCircle2 size={14} aria-hidden="true" />
            <span>Record Attendance</span>
          </Link>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className={styles.deploymentMainGrid}>
        {/* Left Column: Hero, Navigation & Content */}
        <div className={styles.deploymentPrimaryColumn}>
          {/* ── Hero Banner & Overview Header ── */}
          <section className={styles.deploymentHeroCard} aria-label="Deployment details hero">
            <div className={styles.heroCoverWrapper}>
              <Image
                src={coverImage}
                alt={`${deployment.projectName} cover`}
                fill
                sizes="100vw"
                className={styles.heroCoverImage}
                unoptimized
              />
              <div className={styles.heroCoverOverlay} />
              <div className={styles.heroCoverTagsRow}>
                <span className={styles.heroCategoryPill}>{category}</span>
                <span className={`${styles.statusBadge} ${statusClass}`}>
                  <span className={styles.statusDot} aria-hidden="true" />
                  {deployment.status}
                </span>
              </div>

              <div className={styles.heroCoverBottomBar}>
                <button
                  type="button"
                  className={styles.heroManageProjectBtn}
                  onClick={() => setIsManageProjectModalOpen(true)}
                  title="Manage project modules, tasks, BOQ, timeline and site logs"
                >
                  <FolderKanban size={13} aria-hidden="true" />
                  <span>Manage Project</span>
                </button>
                <Link
                  href={`/projects/${deployment.projectId || "proj-001"}`}
                  className={styles.heroViewProjectBtn}
                >
                  <Eye size={13} aria-hidden="true" />
                  <span>View Project</span>
                  <ExternalLink size={12} aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className={styles.heroContentBody}>
              <div className={styles.heroMainTitleRow}>
                <div>
                  <span className={styles.heroSubLabel}>Active Project Deployment</span>
                  <h1 className={styles.heroTitle}>{deployment.projectName}</h1>
                  <p className={styles.heroSubtitle}>
                    <MapPin size={15} aria-hidden="true" />
                    {deployment.location} · {deployment.startDate} – {deployment.endDate}
                  </p>
                </div>

                <div className={styles.heroProgressBox}>
                  <div className={styles.progressPercentRow}>
                    <span>Overall Progress</span>
                    <strong>{progressPct}%</strong>
                  </div>
                  <div className={styles.progressBarTrack}>
                    <div
                      className={styles.progressBarFill}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className={styles.dueLabelTag}>{dueLabel}</span>
                </div>
              </div>

              {/* Quick Metrics Bar */}
              <div className={styles.heroMetricsGrid}>
                <div className={styles.heroMetricItem}>
                  <span className={styles.heroMetricLabel}>
                    <HardHat size={14} aria-hidden="true" />
                    Workforce Assigned
                  </span>
                  <strong className={styles.heroMetricValue}>{deployment.workforce}</strong>
                  <span className={styles.heroMetricSubText}>
                    {deployment.activeWorkers ?? deployment.attendance.present ?? 0} active ·{" "}
                    {deployment.onLeaveWorkers ?? 0} on leave
                  </span>
                </div>

                <div className={styles.heroMetricItem}>
                  <span className={styles.heroMetricLabel}>
                    <Users size={14} aria-hidden="true" />
                    Attendance Today
                  </span>
                  <strong className={styles.heroMetricValue}>
                    {formatAttendance(deployment.attendance)}
                  </strong>
                  <span className={styles.heroMetricSubText}>
                    {deployment.attendance.state === "recorded" ? "Muster recorded" : "Check-in pending"}
                  </span>
                </div>

                <div className={styles.heroMetricItem}>
                  <span className={styles.heroMetricLabel}>
                    <CalendarClock size={14} aria-hidden="true" />
                    Shift Timings
                  </span>
                  <strong className={styles.heroMetricValue}>{deployment.shift}</strong>
                  <span className={styles.heroMetricSubText}>Supervisor {deployment.supervisor}</span>
                </div>

                <div className={styles.heroMetricItem}>
                  <span className={styles.heroMetricLabel}>
                    <RupeeIcon size={14} aria-hidden="true" />
                    Daily Labour Cost
                  </span>
                  <strong className={styles.heroMetricValue}>
                    {formatInr(deployment.dailyCost)}/d
                  </strong>
                  <span className={styles.heroMetricSubText}>Approved daily rate</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Sub Navigation Tabs ── */}
          <nav className={styles.deploymentSubNavTabs} aria-label="Deployment project subviews">
            <button
              type="button"
              className={`${styles.subTabButton} ${
                activeSubTab === "overview" ? styles.subTabActive : ""
              }`}
              onClick={() => setActiveSubTab("overview")}
            >
              Overview & Site Assignment
            </button>
            <button
              type="button"
              className={`${styles.subTabButton} ${
                activeSubTab === "contractors" ? styles.subTabActive : ""
              }`}
              onClick={() => setActiveSubTab("contractors")}
            >
              Labour Contractors ({contractors.length})
            </button>
            <button
              type="button"
              className={`${styles.subTabButton} ${
                activeSubTab === "activity" ? styles.subTabActive : ""
              }`}
              onClick={() => setActiveSubTab("activity")}
            >
              Activity ({tasksList.length})
            </button>
            <button
              type="button"
              className={`${styles.subTabButton} ${
                activeSubTab === "history" ? styles.subTabActive : ""
              }`}
              onClick={() => setActiveSubTab("history")}
            >
              History Logs ({historyLogsList.length})
            </button>
            <button
              type="button"
              className={`${styles.subTabButton} ${
                activeSubTab === "payments" || activeSubTab === "transactions" ? styles.subTabActive : ""
              }`}
              onClick={() => setActiveSubTab("payments")}
            >
              Payment &amp; Bill ({paymentCount})
            </button>
          </nav>

          {activeSubTab === "overview" && (
            <>
              {/* ── Compact Shortfall Alert Banner ── */}
              {hasShortfall && (
                <div className={styles.overviewNoticeCompact} role="status">
                  <div className={styles.overviewNoticeLeft}>
                    <AlertTriangle
                      size={17}
                      style={{ color: "#d97706", flexShrink: 0 }}
                      aria-hidden="true"
                    />
                    <p className={styles.overviewNoticeText}>
                      <strong>Attendance Shortfall Alert — {deployment.projectName}:</strong> Two workers have not checked in for today&apos;s shift ({deployment.attendance.present}/{deployment.attendance.total} present). Review today&apos;s attendance or request replacement workers to keep site execution on schedule.
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.overviewNoticeBtn}
                    onClick={handleOpenRequest}
                  >
                    <UserPlus size={13} aria-hidden="true" />
                    <span>Request Workers</span>
                  </button>
                </div>
              )}

              {/* ── Assigned Labour Contractors (Compact 2-Col Grid) ── */}
              <section
                className={`${styles.sectionCard} ${styles.contractorsSection}`}
                aria-labelledby="deployment-page-contractors-heading"
              >
                <div className={styles.sectionHeaderRow}>
                  <h2 id="deployment-page-contractors-heading" className={styles.sectionTitle}>
                    <Building2 size={18} aria-hidden="true" />
                    Labour Contractor Profiles ({contractors.length})
                  </h2>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className={styles.contractorCountPill}>
                      <Users size={12} aria-hidden="true" />
                      {contractors.length} {contractors.length > 1 ? "contractors" : "contractor"} assigned
                    </span>
                    <button
                      type="button"
                      className={styles.overviewSectionHeaderLink}
                      onClick={() => setActiveSubTab("contractors")}
                      title="View all contractor profiles and verified credentials"
                    >
                      <span>View Full Directory</span>
                      <ArrowRight size={13} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className={styles.contractorsGrid2Col}>
                  {contractors.map(renderContractorCard)}
                </div>
              </section>

              {/* ── Today's Site Execution & Activity ── */}
              <div className={styles.overviewActivityCard}>
                <div className={styles.overviewActivityHeader}>
                  <div className={styles.overviewActivityTitleRow}>
                    <h3 className={styles.sectionTitle} style={{ fontSize: "14.5px" }}>
                      <CalendarClock size={16} aria-hidden="true" />
                      <span>Today&apos;s Site Execution (Shift 12)</span>
                    </h3>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 650,
                        backgroundColor: "#f0fdf4",
                        color: "#15803d",
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        border: "1px solid #bbf7d0",
                      }}
                    >
                      ● In progress
                    </span>
                  </div>

                  <div className={styles.overviewActivityActions}>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => setIsAddTaskModalOpen(true)}
                      style={{ padding: "5px 12px", fontSize: "12px", height: "30px" }}
                    >
                      <Plus size={13} aria-hidden="true" />
                      <span>Add Task</span>
                    </button>

                    <button
                      type="button"
                      className={styles.overviewSectionHeaderLink}
                      onClick={() => setActiveSubTab("activity")}
                      title="View interactive 5-week month calendar and Gantt schedule"
                    >
                      <span>Open Full Calendar &amp; Gantt ({tasksList.length})</span>
                      <ArrowRight size={13} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Headline & Supervisor Log */}
                {deployment.todayActivity?.headline && (
                  <div style={{ marginBottom: "10px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
                      {deployment.todayActivity.headline}
                    </p>
                    {deployment.todayActivity.siteLog && (
                      <div className={styles.overviewSupervisorLogBox}>
                        <HardHat size={14} style={{ color: "#0284c7", flexShrink: 0, marginTop: "1px" }} aria-hidden="true" />
                        <p style={{ margin: 0 }}>
                          <strong>Site supervisor log:</strong> &ldquo;{deployment.todayActivity.siteLog}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Filter by Contractor */}
                <div className={styles.overviewFilterRow}>
                  <span style={{ fontWeight: 650, color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Filter size={12} aria-hidden="true" />
                    Filter by Contractor:
                  </span>
                  {[
                    { id: "all", label: "All Contractors" },
                    ...contractors.map((c) => ({ id: c.name, label: c.name })),
                    { id: "Site Supervision", label: "Site Supervision" },
                  ].map((item) => {
                    const isSelected = overviewContractorFilter === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setOverviewContractorFilter(item.id)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "2.5px 9px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: isSelected ? 700 : 550,
                          border: isSelected ? "1px solid #0f172a" : "1px solid #e2e8f0",
                          backgroundColor: isSelected ? "#0f172a" : "#ffffff",
                          color: isSelected ? "#ffffff" : "#475569",
                          cursor: "pointer",
                          transition: "all 120ms ease",
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                {/* Today's Tasks List */}
                <div className={styles.overviewTasksList}>
                  {todayTasks.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "16px", color: "#64748b", fontSize: "12px" }}>
                      No site execution tasks match the selected contractor filter.
                    </div>
                  ) : (
                    todayTasks.map((t) => {
                      const isCompleted = t.status === "completed";
                      const isInProgress = t.status === "in-progress";
                      const isCancelled = t.status === "cancelled";
                      const statusLabel = isCompleted
                        ? "Completed"
                        : isInProgress
                          ? "In progress"
                          : isCancelled
                            ? "Cancelled"
                            : "Scheduled";

                      const contractorVisual = getContractorBrandVisual(t.contractorName || "Site Supervision");

                      return (
                        <div key={t.id} className={styles.overviewTaskRow}>
                          <div className={styles.overviewTaskLeft}>
                            {/* Status button */}
                            <button
                              type="button"
                              onClick={() => handleToggleTaskStatus(t.id)}
                              title="Click to cycle status (Scheduled → In progress → Completed)"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "3px 8px",
                                borderRadius: "6px",
                                border: isCompleted
                                  ? "1px solid #bbf7d0"
                                  : isInProgress
                                    ? "1px solid #fed7aa"
                                    : isCancelled
                                      ? "1px solid #fecdd3"
                                      : "1px solid #e2e8f0",
                                backgroundColor: isCompleted
                                  ? "#f0fdf4"
                                  : isInProgress
                                    ? "#fff7ed"
                                    : isCancelled
                                      ? "#fff1f2"
                                      : "#f8fafc",
                                color: isCompleted
                                  ? "#15803d"
                                  : isInProgress
                                    ? "#c2410c"
                                    : isCancelled
                                      ? "#be123c"
                                      : "#475569",
                                fontSize: "11px",
                                fontWeight: 650,
                                cursor: "pointer",
                                flexShrink: 0,
                              }}
                            >
                              <span
                                style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  backgroundColor: isCompleted
                                    ? "#16a34a"
                                    : isInProgress
                                      ? "#ea580c"
                                      : isCancelled
                                        ? "#e11d48"
                                        : "#94a3b8",
                                }}
                                aria-hidden="true"
                              />
                              <span>{statusLabel}</span>
                            </button>

                            <div style={{ minWidth: 0, flex: 1 }}>
                              <p
                                className={styles.overviewTaskTitle}
                                style={{
                                  textDecoration: isCancelled ? "line-through" : "none",
                                  color: isCancelled ? "#94a3b8" : "#0f172a",
                                }}
                              >
                                {t.title}
                              </p>
                              <div className={styles.overviewTaskMeta}>
                                {/* Contractor Attribution Badge */}
                                <span
                                  title={`Assigned to ${t.contractorName || "Site Supervision"}`}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "1px 6px",
                                    borderRadius: "4px",
                                    fontSize: "10.5px",
                                    fontWeight: 650,
                                    backgroundColor: `${contractorVisual.bg}15`,
                                    color: contractorVisual.bg,
                                    border: `1px solid ${contractorVisual.bg}30`,
                                  }}
                                >
                                  <HardHat size={10} aria-hidden="true" />
                                  <span>{t.contractorName || "Site Supervision"}</span>
                                </span>

                                {t.boqItemCode && (
                                  <span
                                    style={{
                                      padding: "1px 6px",
                                      backgroundColor: "#f1f5f9",
                                      color: "#475569",
                                      borderRadius: "4px",
                                      fontSize: "10.5px",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {t.boqItemCode}
                                  </span>
                                )}

                                <span>{t.time}</span>
                                {t.trade && <span>· {t.trade}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* ── Billing & Payout Status Summary ── */}
              <div className={styles.overviewBillingCard}>
                <div className={styles.overviewBillingHeader}>
                  <h3 className={styles.sectionTitle} style={{ fontSize: "14px" }}>
                    <RupeeIcon size={15} aria-hidden="true" />
                    <span>Billing &amp; Payout Status</span>
                  </h3>
                  <button
                    type="button"
                    className={styles.overviewSectionHeaderLink}
                    onClick={() => setActiveSubTab("payments")}
                    title="View full financial accounts, billing cycle, and payment ledger"
                  >
                    <span>View Full Ledger &amp; Invoices ({paymentCount})</span>
                    <ArrowRight size={13} aria-hidden="true" />
                  </button>
                </div>

                <div className={styles.overviewBillingGrid}>
                  <div className={styles.overviewBillingItem}>
                    <span className={styles.overviewBillingLabel}>Total Contract Value</span>
                    <strong className={styles.overviewBillingValue}>
                      {accountsData ? formatInr(accountsData.totalContractValue) : formatInr(1450000)}
                    </strong>
                    <span className={styles.overviewBillingSub}>Approved BOQ baseline</span>
                  </div>

                  <div className={styles.overviewBillingItem}>
                    <span className={styles.overviewBillingLabel}>Total Settled to Date</span>
                    <strong className={styles.overviewBillingValue} style={{ color: "#16a34a" }}>
                      {accountsData ? formatInr(accountsData.paidAmount) : formatInr(420000)}
                    </strong>
                    <span className={styles.overviewBillingSub}>
                      {accountsData
                        ? `${Math.round((accountsData.paidAmount / (accountsData.totalContractValue || 1)) * 100)}% settled`
                        : "29% settled"}
                    </span>
                  </div>

                  <div className={styles.overviewBillingItem}>
                    <span className={styles.overviewBillingLabel}>Pending Settlement</span>
                    <strong className={styles.overviewBillingValue} style={{ color: "#ea580c" }}>
                      {accountsData ? formatInr(accountsData.pendingAmount) : formatInr(180000)}
                    </strong>
                    <span className={styles.overviewBillingSub}>Shift 11 &amp; 12 muster review</span>
                  </div>

                  <div className={styles.overviewBillingItem}>
                    <span className={styles.overviewBillingLabel}>Next Billing Cycle</span>
                    <strong className={styles.overviewBillingValue}>Shift 15</strong>
                    <span className={styles.overviewBillingSub}>12 Sep 2026 · Cycle 2</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSubTab === "contractors" && (
            <section
              className={`${styles.sectionCard} ${styles.contractorsSection}`}
              aria-labelledby="deployment-page-contractors-heading"
            >
              <div className={styles.sectionHeaderRow}>
                <h2 id="deployment-page-contractors-heading" className={styles.sectionTitle}>
                  <Building2 size={18} aria-hidden="true" />
                  Labour Contractor Profiles ({contractors.length})
                </h2>
                <span className={styles.contractorCountPill}>
                  <Users size={12} aria-hidden="true" />
                  {contractors.length} {contractors.length > 1 ? "contractors" : "contractor"} assigned
                </span>
              </div>

              <div className={styles.contractorsGrid2Col}>
                {contractors.map(renderContractorCard)}
              </div>
            </section>
          )}

          {activeSubTab === "activity" && (
            <section
              className={`${styles.sectionCard} ${styles.activitySection}`}
              aria-labelledby="deployment-page-activity-heading"
              style={{ padding: 0, overflow: "hidden", border: "none", background: "transparent" }}
            >
              <h2
                id="deployment-page-activity-heading"
                style={{
                  position: "absolute",
                  width: 1,
                  height: 1,
                  padding: 0,
                  margin: -1,
                  overflow: "hidden",
                  clip: "rect(0, 0, 0, 0)",
                  whiteSpace: "nowrap",
                  border: 0,
                }}
              >
                Site Activity &amp; Labour Calendar
              </h2>
              <DeploymentActivitiesCalendar
                tasks={tasksList}
                contractors={contractors}
                deployment={deployment}
                onAddTaskClick={() => setIsAddTaskModalOpen(true)}
                onUpdateTask={handleUpdateTask}
                onCancelTask={handleCancelTask}
                onToggleStatus={handleToggleTaskStatus}
              />
            </section>
          )}

          {activeSubTab === "history" && (
            <DeploymentHistoryLogs
              deployment={deployment}
              logs={historyLogsList}
              onAddLog={handleAddHistoryLog}
            />
          )}

          {(activeSubTab === "payments" ||
            activeSubTab === "transactions") && (
            <div className={styles.accountsWrapper} style={{ marginTop: "16px" }}>
              <AssignmentAccountsPanel
                assignmentId={deployment.id || "ASG-101"}
                projectName={deployment.projectName}
                contractorName={contractors[0]?.name || deployment.contractorName || "Apex Integrated Civil"}
                contractors={contractors}
                clientName={deployment.supervisor || "Client Partner"}
                supervisorName={deployment.supervisor || "Site Supervisor"}
                accounts={accountsData}
                title="Payment & Bill Details"
              />
            </div>
          )}
        </div>

        {/* Right Column: Project Updates Chat System */}
        <aside className={styles.deploymentSecondaryColumn}>
          <ProjectUpdatesCard projectName={deployment.projectName} />
        </aside>
      </div>

      {requestDrawerOpen && (
        <WorkforceRequestDrawer
          onClose={() => setRequestDrawerOpen(false)}
          initialProjectId={requestConfig?.initialProjectId}
          initialTrade={requestConfig?.initialTrade}
          initialWorkerCount={requestConfig?.initialWorkerCount}
          initialValues={requestConfig?.initialValues}
        />
      )}

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        projectName={deployment.projectName}
        supervisorName={deployment.supervisor}
        contractors={contractors}
        onAddTask={handleAddTask}
      />

      <ManageProjectModal
        isOpen={isManageProjectModalOpen}
        onClose={() => setIsManageProjectModalOpen(false)}
        deployment={deployment}
        basePath={basePath}
      />

      {paymentModalOpen && (
        <ContractorPaymentModal
          contractorName={
            selectedPaymentContractor ||
            contractors[0]?.name ||
            "Apex Integrated Civil"
          }
          assignedWorkersCount={deployment.activeWorkers || 8}
          totalWorkersRequested={deployment.attendance?.total || 10}
          projectName={deployment.projectName}
          location={deployment.location}
          dailyRate={deployment.dailyCost}
          durationDays={1}
          onClose={() => setPaymentModalOpen(false)}
          onPaymentSuccess={(newRecord) => {
            setTransactions((prev) => [newRecord, ...prev]);
            setExtraTransactions((prev) => [
              {
                id: newRecord.id,
                date: "Today",
                referenceNo:
                  newRecord.bankDetails?.utrReference ||
                  newRecord.upiDetails?.transactionId ||
                  `PAY-${Date.now()}`,
                paidBy: "Service Provider",
                paidByRole: "Service Provider",
                paidTo: newRecord.contractorName,
                title: `Contractor Payment · ${newRecord.contractorName}`,
                description: `Verified disbursement for ${newRecord.workerCount} workers via ${
                  newRecord.paymentMethod === "bank_transfer"
                    ? "Bank Transfer (NEFT/UTR)"
                    : "UPI Transfer"
                }.`,
                amount: newRecord.totalAmount,
                paymentMethod:
                  newRecord.paymentMethod === "bank_transfer"
                    ? "NEFT / Bank Transfer"
                    : "UPI Transfer",
                status: "settled",
              },
              ...prev,
            ]);
          }}
        />
      )}

      {modalContractor && (
        <ContractorAssignedWorkersModal
          key={modalContractor.id || modalContractor.name}
          contractor={modalContractor}
          deployment={deployment}
          isOpen={Boolean(modalContractor)}
          onClose={() => setModalContractor(null)}
        />
      )}
    </div>
  );
}
