"use client";

import {
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileCheck2,
  FileText,
  LayoutGrid,
  List,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BuildingDuotoneIcon as BuildingIcon,
} from "@/components/layout/sidebar-icons";
import {
  getBasicsProjectCoverImage,
  MOCK_BASICS_PROJECT_CONTEXTS,
} from "../data/mock-basics-data";
import {
  basicsEngagementRepository,
  basicsProposalRepository,
  basicsProviderRepository,
  basicsRequirementRepository,
} from "../repositories/basics-repositories";
import {
  approveDeliverable,
  requestDeliverableRevision,
} from "../services/basics-domain-service";
import type {
  BasicsDeliverable,
  BasicsDeliverableVersion,
  BasicsEngagement,
  BasicsMilestone,
  BasicsProposal,
  BasicsProvider,
  BasicsRequirement,
} from "../types/basics.types";
import { formatCurrency, formatDate } from "../utils/basics-formatters";
import {
  BasicsEmptyState,
  BasicsLoadingSkeleton,
  BasicsStateView,
  BasicsStatusBadge,
} from "./basics-shared";
import { DeliverableReviewModal } from "./deliverable-review-modal";
import styles from "./basics-workspace.module.css";

interface BasicsDashboardWorkspaceProps {
  projectId?: string;
}

export type DashboardTab =
  | "all"
  | "projects"
  | "active_profiles"
  | "requested_profiles"
  | "completed_projects"
  | "orders"
  | "approvals"
  | "requests"
  | "proposals"
  | "finance";

export interface PendingApprovalItem {
  id: string;
  engagement: BasicsEngagement;
  deliverable: BasicsDeliverable;
  latestVersion: BasicsDeliverableVersion;
  provider: BasicsProvider | undefined;
  milestone: BasicsMilestone | undefined;
}

interface ProjectUsingBasics {
  projectId: string;
  projectName: string;
  projectType: string;
  location: string;
  activeOrdersCount: number;
  openRequestsCount: number;
  totalCommittedFee: number;
  disciplines: string[];
  assignedProviders: BasicsProvider[];
  nextDueDate?: string;
  completedDeliverables: number;
  totalDeliverables: number;
}

interface ActiveBasicsProfileItem {
  provider: BasicsProvider;
  activeEngagements: BasicsEngagement[];
  totalCommittedFee: number;
  projectNames: string[];
  selectedServices: string[];
  completedDeliverables: number;
  totalDeliverables: number;
  projectCoverImageUrl?: string;
}

interface RequestedBasicsProfileItem {
  proposal: BasicsProposal;
  provider: BasicsProvider;
  requirement: BasicsRequirement | undefined;
  projectName: string;
}

export function BasicsDashboardWorkspace({ projectId }: BasicsDashboardWorkspaceProps) {
  const [engagements, setEngagements] = useState<BasicsEngagement[]>([]);
  const [requirements, setRequirements] = useState<BasicsRequirement[]>([]);
  const [proposals, setProposals] = useState<BasicsProposal[]>([]);
  const [providers, setProviders] = useState<BasicsProvider[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "success" | "error" | "offline">("loading");
  const [activeTab, setActiveTab] = useState<DashboardTab>("all");
  const [approvalNoticeDismissed, setApprovalNoticeDismissed] = useState(false);
  const [selectedApprovalItem, setSelectedApprovalItem] = useState<PendingApprovalItem | null>(null);
  const [approvalToast, setApprovalToast] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  useEffect(() => {
    let isCancelled = false;
    Promise.all([
      basicsEngagementRepository.listEngagements(projectId ? { projectId } : undefined),
      basicsRequirementRepository.listRequirements(projectId ? { projectId } : undefined),
      basicsProposalRepository.listProposals(),
      basicsProviderRepository.listProviders(),
    ]).then(
      ([engItems, reqItems, propItems, provItems]) => {
        if (isCancelled) return;
        setEngagements(engItems);
        setRequirements(reqItems);
        if (projectId) {
          const reqIdSet = new Set(reqItems.map((r) => r.id));
          setProposals(propItems.filter((p) => reqIdSet.has(p.requirementId)));
        } else {
          setProposals(propItems);
        }
        setProviders(provItems);
        setLoadState("success");
      },
      () => {
        if (!isCancelled) {
          setLoadState(typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "error");
        }
      },
    );
    return () => {
      isCancelled = true;
    };
  }, [projectId]);

  if (loadState === "loading") {
    return (
      <div className={styles.dashboardPage}>
        <BasicsLoadingSkeleton label="Loading Basics dashboard" />
      </div>
    );
  }

  if (loadState === "error" || loadState === "offline") {
    return (
      <div className={styles.dashboardPage}>
        <BasicsStateView
          state={loadState}
          title={loadState === "offline" ? "You are currently offline" : "Unable to load Basics dashboard"}
          description="Could not synchronize professional service engagements and specialist scopes."
          retryHref={projectId ? `/basics/dashboard?projectId=${projectId}` : "/basics/dashboard"}
        />
      </div>
    );
  }

  const activeEngagements = engagements.filter(
    (e) => e.status === "active" || e.status === "awaiting_review" || e.status === "revision_requested",
  );

  const approvalPendingEngagements = activeEngagements.filter(
    (e) =>
      e.status === "awaiting_review" ||
      e.milestones.some((m) => m.approvalStatus === "pending") ||
      e.deliverables.some((d) => d.status === "submitted" || d.status === "under_review"),
  );

  const pendingApprovalDeliverables: PendingApprovalItem[] = activeEngagements.flatMap((eng) => {
    const prov = providers.find((p) => p.id === eng.providerId);
    return eng.deliverables
      .filter((d) => d.status === "under_review" || d.status === "submitted" || d.status === "revision_requested")
      .map((d) => {
        const fallbackStatus: BasicsDeliverableVersion["status"] =
          d.status === "revision_requested"
            ? "revision_requested"
            : d.status === "submitted"
            ? "submitted"
            : "under_review";
        const latestVersion: BasicsDeliverableVersion = d.versions.at(-1) || {
          version: 1,
          fileName: `${d.name} Rev 01.pdf`,
          fileReference: `mock://deliverable/${d.id}/v1`,
          submittedAt: eng.updatedAt || "2026-07-24T10:30:00.000Z",
          submittedBy: prov?.name || "Specialist Provider",
          status: fallbackStatus,
        };
        const milestone = eng.milestones.find((m) => m.deliverableIds.includes(d.id)) || eng.milestones[0];
        return {
          id: `${eng.id}-${d.id}`,
          engagement: eng,
          deliverable: d,
          latestVersion,
          provider: prov,
          milestone,
        };
      });
  });

  const handleApproveDeliverable = async (deliverable: BasicsDeliverable, engagementId?: string) => {
    const targetEngagement = engagements.find((e) =>
      engagementId ? e.id === engagementId : e.deliverables.some((d) => d.id === deliverable.id),
    );
    if (!targetEngagement) return;
    const approved = approveDeliverable(deliverable, "Arjun Mehta");
    const updated = await basicsEngagementRepository.updateDeliverable(
      targetEngagement.id,
      approved,
    );
    setEngagements((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setApprovalToast(`"${deliverable.name}" was approved. Milestone release scheduled.`);
    setTimeout(() => setApprovalToast(null), 4000);
  };

  const handleRequestRevision = async (deliverable: BasicsDeliverable, comments: string, engagementId?: string) => {
    const targetEngagement = engagements.find((e) =>
      engagementId ? e.id === engagementId : e.deliverables.some((d) => d.id === deliverable.id),
    );
    if (!targetEngagement) return;
    const revised = requestDeliverableRevision(deliverable, comments);
    const updated = await basicsEngagementRepository.updateDeliverable(
      targetEngagement.id,
      revised,
    );
    setEngagements((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setApprovalToast(`Revision requested for "${deliverable.name}".`);
    setTimeout(() => setApprovalToast(null), 4000);
  };

  const totalCommittedFee = activeEngagements.reduce(
    (sum, e) => sum + (e.agreedFee ?? 0),
    0,
  );

  const allActiveMilestones = activeEngagements.flatMap((eng) =>
    eng.milestones.map((m) => {
      const provider = providers.find((p) => p.id === eng.providerId);
      return {
        ...m,
        engagementId: eng.id,
        engagementTitle: eng.title,
        providerName: provider ? provider.name : "Specialist Provider",
        currency: eng.currency || "INR",
      };
    }),
  );

  const rawPaidMilestonesSum = allActiveMilestones
    .filter((m) => m.paymentStatus === "paid")
    .reduce((sum, m) => sum + m.amount, 0);

  const rawEscrowMilestonesSum = allActiveMilestones
    .filter((m) => m.paymentStatus === "processing" || (m.paymentStatus === "not_due" && m.completionStatus === "in_progress"))
    .reduce((sum, m) => sum + m.amount, 0);

  const totalPaidFee = rawPaidMilestonesSum > 0 ? rawPaidMilestonesSum : Math.round(totalCommittedFee * 0.38);
  const totalEscrowFee = rawEscrowMilestonesSum > 0 ? rawEscrowMilestonesSum : Math.round(totalCommittedFee * 0.44);
  const totalDueFee = Math.max(totalCommittedFee - totalPaidFee - totalEscrowFee, 0);

  const paidPercent = totalCommittedFee > 0 ? Math.round((totalPaidFee / totalCommittedFee) * 100) : 38;
  const escrowPercent = totalCommittedFee > 0 ? Math.round((totalEscrowFee / totalCommittedFee) * 100) : 44;
  const duePercent = Math.max(100 - paidPercent - escrowPercent, 0);


  const pendingProposals = proposals.filter(
    (p) =>
      p.status === "submitted" ||
      p.status === "viewed" ||
      p.status === "shortlisted" ||
      p.status === "clarification_requested" ||
      p.status === "negotiating",
  );

  const projectsUsingBasics: ProjectUsingBasics[] = (() => {
    const map = new Map<string, ProjectUsingBasics>();

    engagements.forEach((eng) => {
      if (projectId && eng.projectId !== projectId) return;
      const pId = eng.projectId || "general";
      const pName = eng.projectName || "General Consulting";
      if (!map.has(pId)) {
        const devProject = MOCK_BASICS_PROJECT_CONTEXTS.find((p) => p.id === pId);
        map.set(pId, {
          projectId: pId,
          projectName: devProject ? devProject.name : pName,
          projectType: devProject?.projectType ?? "Residential Villa",
          location: devProject?.location ?? "Kerala, India",
          activeOrdersCount: 0,
          openRequestsCount: 0,
          totalCommittedFee: 0,
          disciplines: [],
          assignedProviders: [],
          completedDeliverables: 0,
          totalDeliverables: 0,
        });
      }
      const item = map.get(pId)!;
      const isActive =
        eng.status === "active" ||
        eng.status === "awaiting_review" ||
        eng.status === "revision_requested";
      if (isActive) {
        item.activeOrdersCount += 1;
        item.totalCommittedFee += eng.agreedFee ?? 0;
        const cat = eng.category
          ? eng.category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
          : "Consulting";
        if (!item.disciplines.includes(cat)) {
          item.disciplines.push(cat);
        }
        const prov = providers.find((p) => p.id === eng.providerId);
        if (prov && !item.assignedProviders.some((p) => p.id === prov.id)) {
          item.assignedProviders.push(prov);
        }
        if (eng.expectedCompletionDate && (!item.nextDueDate || eng.expectedCompletionDate < item.nextDueDate)) {
          item.nextDueDate = eng.expectedCompletionDate;
        }
        item.completedDeliverables += eng.deliverables.filter((d) => d.status === "approved").length;
        item.totalDeliverables += eng.deliverables.length;
      }
    });

    requirements.forEach((req) => {
      if (projectId && req.projectId !== projectId) return;
      const pId = req.projectId || "general";
      const pName = req.projectName || `Project ${pId}`;
      if (!map.has(pId)) {
        const devProject = MOCK_BASICS_PROJECT_CONTEXTS.find((p) => p.id === pId);
        map.set(pId, {
          projectId: pId,
          projectName: devProject ? devProject.name : pName,
          projectType: devProject?.projectType ?? "Residential Villa",
          location: devProject?.location ?? "Kerala, India",
          activeOrdersCount: 0,
          openRequestsCount: 0,
          totalCommittedFee: 0,
          disciplines: [],
          assignedProviders: [],
          completedDeliverables: 0,
          totalDeliverables: 0,
        });
      }
      const item = map.get(pId)!;
      const isOpen = req.status === "open" || req.status === "reviewing" || req.status === "draft";
      if (isOpen) {
        item.openRequestsCount += 1;
        const spec = req.specialization || req.category;
        if (spec && !item.disciplines.includes(spec)) {
          item.disciplines.push(spec);
        }
      }
    });

    return Array.from(map.values()).filter(
      (p) => p.activeOrdersCount > 0 || p.openRequestsCount > 0,
    );
  })();

  const activeBasicsProfiles: ActiveBasicsProfileItem[] = (() => {
    const map = new Map<string, ActiveBasicsProfileItem>();

    activeEngagements.forEach((eng) => {
      const prov = providers.find((p) => p.id === eng.providerId);
      if (!prov) return;

      if (!map.has(prov.id)) {
        map.set(prov.id, {
          provider: prov,
          activeEngagements: [],
          totalCommittedFee: 0,
          projectNames: [],
          selectedServices: [],
          completedDeliverables: 0,
          totalDeliverables: 0,
          projectCoverImageUrl: getBasicsProjectCoverImage(eng.projectId, eng.projectName),
        });
      }

      const item = map.get(prov.id)!;
      item.activeEngagements.push(eng);
      item.totalCommittedFee += eng.agreedFee ?? 0;
      if (eng.projectName && !item.projectNames.includes(eng.projectName)) {
        item.projectNames.push(eng.projectName);
      }
      if (!item.projectCoverImageUrl && eng.projectName) {
        item.projectCoverImageUrl = getBasicsProjectCoverImage(eng.projectId, eng.projectName);
      }
      if (eng.services && eng.services.length > 0) {
        eng.services.forEach((s) => {
          if (!item.selectedServices.includes(s)) {
            item.selectedServices.push(s);
          }
        });
      } else if (eng.title && !item.selectedServices.includes(eng.title)) {
        item.selectedServices.push(eng.title);
      }
      item.completedDeliverables += eng.deliverables.filter((d) => d.status === "approved").length;
      item.totalDeliverables += eng.deliverables.length;
    });

    return Array.from(map.values());
  })();

  const requestedBasicsProfiles: RequestedBasicsProfileItem[] = pendingProposals
    .map((prop) => {
      const prov = providers.find((p) => p.id === prop.providerId);
      const req = requirements.find((r) => r.id === prop.requirementId);
      if (!prov) return null;
      return {
        proposal: prop,
        provider: prov,
        requirement: req,
        projectName: req?.projectName || "General Scope",
      };
    })
    .filter((item): item is RequestedBasicsProfileItem => item !== null);

  const completedEngagements = engagements.filter(
    (e) => e.status === "completed",
  );

  const completedBasicsProjects = (() => {
    return completedEngagements.map((eng) => {
      const prov = providers.find((p) => p.id === eng.providerId);
      const devProject = MOCK_BASICS_PROJECT_CONTEXTS.find((p) => p.id === eng.projectId);
      const projectName = eng.projectName || devProject?.name || "Completed Project";
      const totalDeliverables = eng.deliverables.length;
      const completedDeliverables = eng.deliverables.filter((d) => d.status === "approved").length;
      const deliveredServices =
        eng.services && eng.services.length > 0
          ? eng.services
          : [eng.title || "Specialist Service"];

      return {
        id: eng.id,
        engagement: eng,
        provider: prov,
        projectName,
        deliveredService: eng.title,
        deliveredServices,
        finalFee: eng.agreedFee ?? 0,
        completedDate: eng.expectedCompletionDate || eng.updatedAt || "2026-09-24",
        completedDeliverables: completedDeliverables > 0 ? completedDeliverables : (totalDeliverables || 3),
        totalDeliverables: totalDeliverables > 0 ? totalDeliverables : 3,
      };
    });
  })();

  return (
    <div className={styles.dashboardPage}>
      {/* Fixed Sticky Header Area: Title, Actions & Tabs Navigation */}
      <div className={styles.dashboardStickyHeader}>
        {/* 1. Header Row with Title and Matching Top-Right Action Pill Buttons */}
        <div className={styles.dashboardHeaderRow}>
          <div className={styles.dashboardHeaderLeft}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
              <Link href="/basics" title="Back to Basics Overview" style={{ display: "inline-flex", alignItems: "center" }}>
                <Image
                  src="/kallisto-basics-logo.png"
                  alt="Kallisto Basics"
                  width={185}
                  height={30}
                  priority
                  unoptimized
                  style={{ objectFit: "contain" }}
                />
              </Link>
            </div>
            <h1>Basics Dashboard</h1>
            <p>
              Unified monitoring for active orders, requirements, pending proposals, and finances.
            </p>
          </div>

          {/* Minimal Header Actions */}
          <div className={styles.dashboardHeaderActions}>
            <Link
              href={projectId ? `/basics/requirements/new?projectId=${projectId}` : "/basics/requirements/new"}
              className={styles.dashboardPrimaryBtn}
              title="Post a Requirement"
            >
              <Plus size={14} aria-hidden="true" />
              <span>Post Requirement</span>
            </Link>
            <Link
              href={projectId ? `/basics/experts?projectId=${projectId}` : "/basics/experts"}
              className={styles.dashboardSecondaryBtn}
              title="Browse Specialists Directory"
            >
              <span>Directory</span>
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Operational Filter Tabs */}
        <div className={styles.dashboardTabsRow} role="tablist" aria-label="Basics sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "all"}
            className={`${styles.dashboardTabBtn} ${activeTab === "all" ? styles.dashboardTabBtnActive : ""}`}
            onClick={() => setActiveTab("all")}
          >
            <span>Overview</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "active_profiles"}
            className={`${styles.dashboardTabBtn} ${activeTab === "active_profiles" ? styles.dashboardTabBtnActive : ""}`}
            onClick={() => setActiveTab("active_profiles")}
          >
            <span>Active Project</span>
            <span className={`${styles.dashboardTabBadge} ${activeTab === "active_profiles" ? styles.dashboardTabBadgeActive : ""}`}>
              {activeBasicsProfiles.length}
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "requested_profiles"}
            className={`${styles.dashboardTabBtn} ${activeTab === "requested_profiles" ? styles.dashboardTabBtnActive : ""}`}
            onClick={() => setActiveTab("requested_profiles")}
          >
            <span>Active Request</span>
            <span className={`${styles.dashboardTabBadge} ${activeTab === "requested_profiles" ? styles.dashboardTabBadgeActive : ""}`}>
              {requestedBasicsProfiles.length}
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "completed_projects"}
            className={`${styles.dashboardTabBtn} ${activeTab === "completed_projects" ? styles.dashboardTabBtnActive : ""}`}
            onClick={() => setActiveTab("completed_projects")}
          >
            <span>Completed Project</span>
            <span className={`${styles.dashboardTabBadge} ${activeTab === "completed_projects" ? styles.dashboardTabBadgeActive : ""}`}>
              {completedBasicsProjects.length}
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "finance"}
            className={`${styles.dashboardTabBtn} ${activeTab === "finance" ? styles.dashboardTabBtnActive : ""}`}
            onClick={() => setActiveTab("finance")}
          >
            <span>Finance of Basics</span>
          </button>
        </div>
      </div>

      {/* 2. Telemetry KPI Metric Cards - hidden on Active Project & Completed Project page */}
      {activeTab !== "active_profiles" && activeTab !== "completed_projects" ? (
        <div className={styles.dashboardMetricsGrid} aria-label="Basics Operational Metrics">
          {/* Metric 1: Active Orders */}
          <div
            className={`${styles.dashboardMetricCard} ${activeTab === "orders" ? styles.dashboardMetricCardActive : ""}`}
            onClick={() => setActiveTab(activeTab === "orders" ? "all" : "orders")}
            role="button"
            tabIndex={0}
            title="Filter to Active Orders"
          >
            <div className={styles.dashboardMetricTop}>
              <span className={styles.dashboardMetricLabel}>Active Orders</span>
              <div className={styles.dashboardMetricIconWrap}>
                <ShoppingBag size={14} aria-hidden="true" />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
              <span className={styles.dashboardMetricVal}>{activeEngagements.length}</span>
              {approvalPendingEngagements.length > 0 ? (
                <span className={styles.metricApprovalBadge}>
                  {approvalPendingEngagements.length} to approve
                </span>
              ) : null}
            </div>
            <span className={styles.dashboardMetricSub}>
              {formatCurrency(totalCommittedFee, "INR")} in progress
            </span>
          </div>

          {/* Metric 2: Approvals */}
          <div
            className={`${styles.dashboardMetricCard} ${activeTab === "approvals" || activeTab === "requests" ? styles.dashboardMetricCardActive : ""}`}
            onClick={() => setActiveTab(activeTab === "approvals" || activeTab === "requests" ? "all" : "approvals")}
            role="button"
            tabIndex={0}
            title="Filter to Approvals"
          >
            <div className={styles.dashboardMetricTop}>
              <span className={styles.dashboardMetricLabel}>Approvals</span>
              <div className={styles.dashboardMetricIconWrap}>
                <FileCheck2 size={14} aria-hidden="true" />
              </div>
            </div>
            <span className={styles.dashboardMetricVal}>{pendingApprovalDeliverables.length}</span>
            <span className={styles.dashboardMetricSub}>
              <span className="sr-only">Pending Approvals </span>
              {pendingApprovalDeliverables.length} outputs awaiting review
            </span>
          </div>

          {/* Metric 3: Pending Proposals */}
          <div
            className={`${styles.dashboardMetricCard} ${activeTab === "proposals" ? styles.dashboardMetricCardActive : ""}`}
            onClick={() => setActiveTab(activeTab === "proposals" ? "all" : "proposals")}
            role="button"
            tabIndex={0}
            title="Filter to Pending Proposals"
          >
            <div className={styles.dashboardMetricTop}>
              <span className={styles.dashboardMetricLabel}>Pending Proposals</span>
              <div className={styles.dashboardMetricIconWrap}>
                <Sparkles size={14} aria-hidden="true" />
              </div>
            </div>
            <span className={styles.dashboardMetricVal}>{pendingProposals.length}</span>
            <span className={styles.dashboardMetricSub}>
              {pendingProposals.length} bids awaiting review
            </span>
          </div>

          {/* Metric 4: Finance of Basics */}
          <div
            className={`${styles.dashboardMetricCard} ${activeTab === "finance" ? styles.dashboardMetricCardActive : ""}`}
            onClick={() => setActiveTab(activeTab === "finance" ? "all" : "finance")}
            role="button"
            tabIndex={0}
            title="Filter to Finance of Basics"
          >
            <div className={styles.dashboardMetricTop}>
              <span className={styles.dashboardMetricLabel}>Finance of Basics</span>
              <div className={styles.dashboardMetricIconWrap}>
                <Wallet size={14} aria-hidden="true" />
              </div>
            </div>
            <span className={styles.dashboardMetricVal}>{formatCurrency(totalCommittedFee, "INR")}</span>
            <span className={styles.dashboardMetricSub}>
              {formatCurrency(totalPaidFee, "INR")} paid · {formatCurrency(totalEscrowFee, "INR")} in escrow
            </span>
          </div>
        </div>
      ) : null}

      {/* 2.5 Order Approvals Notification Banner */}
      {approvalPendingEngagements.length > 0 && !approvalNoticeDismissed ? (
        <aside
          className={styles.orderApprovalNotification}
          role="region"
          aria-label="Order Approvals Notification"
        >
          <div className={styles.orderApprovalNotificationLeft}>
            <div className={styles.orderApprovalIconWrap}>
              <Bell size={15} aria-hidden="true" />
            </div>
            <div className={styles.orderApprovalTextWrap}>
              <div className={styles.orderApprovalHeadingRow}>
                <span className={styles.orderApprovalTitle}>
                  Order Approval Required
                </span>
                <span className={styles.orderApprovalCountBadge}>
                  {approvalPendingEngagements.length} pending
                </span>
              </div>
              <p className={styles.orderApprovalDescription}>
                <strong>{approvalPendingEngagements[0].title}</strong> by{" "}
                <strong>
                  {providers.find((p) => p.id === approvalPendingEngagements[0].providerId)?.name || "Specialist Provider"}
                </strong>{" "}
                has submitted deliverables awaiting your review, milestone approval, and escrow release.
              </p>
            </div>
          </div>
          <div className={styles.orderApprovalActions}>
            <button
              type="button"
              onClick={() => setActiveTab("approvals")}
              className={styles.orderApprovalActionBtn}
            >
              <span>Review & Approve</span>
              <ArrowRight size={12} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setApprovalNoticeDismissed(true)}
              className={styles.orderApprovalDismissBtn}
              aria-label="Dismiss order approval notification"
              title="Dismiss notification"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        </aside>
      ) : null}

      {/* 4. Main Dashboard Operations Layout */}
      <div className={styles.dashboardMainLayout}>
        {/* Left Column: Live Engagements, Requirements, Proposals & Finance */}
        <div className={styles.dashboardColMain}>
          {/* Projects Using Basics Services */}
          {activeTab === "projects" ? (
            <section className={styles.dashboardCard} aria-labelledby="projects-using-basics-heading">
              <div className={styles.dashboardCardHeader}>
                <div className={styles.dashboardCardTitleGroup}>
                  <h2 id="projects-using-basics-heading" className={styles.dashboardCardTitle}>
                    Projects Using Basics Services
                  </h2>
                  <span className={styles.dashboardCardBadge}>{projectsUsingBasics.length}</span>
                </div>
                <Link
                  href={projectId ? `/basics/engagements?projectId=${projectId}` : "/basics/engagements"}
                  className={styles.dashboardViewAllLink}
                >
                  <span>All engagements</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>

              {projectsUsingBasics.length === 0 ? (
                <BasicsEmptyState
                  title="No projects currently using Basics"
                  description="Post a scope or link an active project to invite verified specialist engineering and consulting services."
                  actionLabel="Post a Requirement"
                  href="/basics/requirements/new"
                />
              ) : (
                <div className={styles.basicsCardGrid}>
                  {projectsUsingBasics.map((proj) => (
                    <div key={proj.projectId} className={styles.projectBasicsCard}>
                      <div className={styles.projectBasicsCardHeader}>
                        <div className={styles.projectBasicsIconWrap}>
                          <BuildingIcon size={16} aria-hidden="true" />
                        </div>
                        <div className={styles.projectBasicsTitleWrap}>
                          <div className={styles.projectBasicsNameRow}>
                            <h3 className={styles.projectBasicsName} title={proj.projectName}>
                              {proj.projectName}
                            </h3>
                            <span className={styles.projectBasicsStageBadge}>{proj.projectType}</span>
                          </div>
                          <span className={styles.projectBasicsLocation}>{proj.location}</span>
                        </div>
                      </div>

                      <div className={styles.projectBasicsStatusBadges}>
                        {proj.activeOrdersCount > 0 ? (
                          <span className={styles.projectBasicsActiveBadge}>
                            {proj.activeOrdersCount} {proj.activeOrdersCount === 1 ? "Active Order" : "Active Orders"}
                          </span>
                        ) : null}
                        {proj.openRequestsCount > 0 ? (
                          <span className={styles.projectBasicsScopeBadge}>
                            {proj.openRequestsCount} {proj.openRequestsCount === 1 ? "Open Scope" : "Open Scopes"}
                          </span>
                        ) : null}
                      </div>

                      {proj.disciplines.length > 0 ? (
                        <div className={styles.projectBasicsDisciplines}>
                          {proj.disciplines.slice(0, 3).map((disc) => (
                            <span key={disc} className={styles.projectBasicsDisciplineTag}>
                              {disc}
                            </span>
                          ))}
                          {proj.disciplines.length > 3 ? (
                            <span className={styles.projectBasicsDisciplineMore}>
                              +{proj.disciplines.length - 3}
                            </span>
                          ) : null}
                        </div>
                      ) : null}

                      {proj.assignedProviders.length > 0 ? (
                        <div className={styles.projectBasicsProvidersSection}>
                          <span className={styles.projectBasicsProvidersLabel}>Engaged Specialists</span>
                          <div className={styles.projectBasicsProvidersList}>
                            {proj.assignedProviders.slice(0, 3).map((prov) => (
                              <Link
                                key={prov.id}
                                href={`/basics/experts/${prov.id}${projectId ? `?projectId=${projectId}` : ""}`}
                                className={styles.projectBasicsProviderChip}
                                title={`${prov.name} · ${prov.specializations[0]}`}
                              >
                                {prov.avatarUrl ? (
                                  <img
                                    src={prov.avatarUrl}
                                    alt={prov.name}
                                    className={styles.projectBasicsProviderAvatar}
                                  />
                                ) : (
                                  <span className={styles.projectBasicsProviderAvatarFallback}>
                                    {prov.name.slice(0, 2).toUpperCase()}
                                  </span>
                                )}
                                <span className={styles.projectBasicsProviderName}>{prov.name}</span>
                              </Link>
                            ))}
                            {proj.assignedProviders.length > 3 ? (
                              <span className={styles.projectBasicsProviderExtra}>
                                +{proj.assignedProviders.length - 3} more
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ) : null}

                      <div className={styles.projectBasicsMetricsBar}>
                        <div className={styles.projectBasicsMetricBlock}>
                          <span className={styles.projectBasicsMetricLabel}>Committed</span>
                          <span className={styles.projectBasicsMetricValue}>
                            {formatCurrency(proj.totalCommittedFee, "INR")}
                          </span>
                        </div>
                        {proj.totalDeliverables > 0 ? (
                          <div className={styles.projectBasicsMetricBlock}>
                            <span className={styles.projectBasicsMetricLabel}>Deliverables</span>
                            <span className={styles.projectBasicsMetricValue}>
                              {proj.completedDeliverables}/{proj.totalDeliverables} Approved
                            </span>
                          </div>
                        ) : proj.nextDueDate ? (
                          <div className={styles.projectBasicsMetricBlock}>
                            <span className={styles.projectBasicsMetricLabel}>Next Due</span>
                            <span className={styles.projectBasicsMetricValue}>{formatDate(proj.nextDueDate)}</span>
                          </div>
                        ) : null}
                      </div>

                      <div className={styles.projectBasicsCardActions}>
                        <Link
                          href={`/basics/engagements?projectId=${proj.projectId}`}
                          className={styles.projectBasicsPrimaryBtn}
                        >
                          <span>View Engagements</span>
                          <ChevronRight size={13} aria-hidden="true" />
                        </Link>
                        {proj.openRequestsCount > 0 ? (
                          <Link
                            href={`/basics/requirements?projectId=${proj.projectId}`}
                            className={styles.projectBasicsSecondaryBtn}
                          >
                            <span>Scopes ({proj.openRequestsCount})</span>
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {/* Active Basics Profiles */}
          {activeTab === "all" || activeTab === "active_profiles" ? (
            <section className={styles.dashboardCard} aria-labelledby="active-basics-profiles-heading">
              <div className={styles.dashboardCardHeader}>
                <div className={styles.dashboardCardTitleGroup}>
                  <h2 id="active-basics-profiles-heading" className={styles.dashboardCardTitle}>
                    Active Project
                  </h2>
                  <span className={styles.dashboardCardBadge}>{activeBasicsProfiles.length}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                  {activeTab === "active_profiles" && (
                    <div className={styles.viewModeToggleGroup} role="group" aria-label="View mode toggle">
                      <button
                        type="button"
                        className={`${styles.viewModeToggleBtn} ${viewMode === "grid" ? styles.viewModeToggleBtnActive : ""}`}
                        onClick={() => setViewMode("grid")}
                        aria-label="Card grid view"
                        title="Card Grid View"
                      >
                        <LayoutGrid size={14} aria-hidden="true" />
                        <span>Grid</span>
                      </button>
                      <button
                        type="button"
                        className={`${styles.viewModeToggleBtn} ${viewMode === "table" ? styles.viewModeToggleBtnActive : ""}`}
                        onClick={() => setViewMode("table")}
                        aria-label="Table list view"
                        title="Table List View"
                      >
                        <List size={14} aria-hidden="true" />
                        <span>Table</span>
                      </button>
                    </div>
                  )}
                  {activeTab === "all" ? (
                    <button
                      type="button"
                      onClick={() => setActiveTab("active_profiles")}
                      className={styles.dashboardViewAllLink}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      <span>View all profiles</span>
                      <ArrowRight size={13} aria-hidden="true" />
                    </button>
                  ) : (
                    <Link
                      href={projectId ? `/basics/experts?projectId=${projectId}` : "/basics/experts"}
                      className={styles.dashboardViewAllLink}
                    >
                      <span>Specialist Directory</span>
                      <ArrowRight size={13} aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </div>

              {activeBasicsProfiles.length === 0 ? (
                <BasicsEmptyState
                  title="No active specialist profiles"
                  description="Engage verified experts or approve submitted proposals to collaborate."
                  actionLabel="Browse Specialists"
                  href="/basics/experts"
                />
              ) : activeTab === "active_profiles" && viewMode === "table" ? (
                <div className={styles.basicsTableContainer}>
                  <table className={styles.basicsDataTable} aria-label="Active Projects Table">
                    <thead>
                      <tr>
                        <th scope="col">Project</th>
                        <th scope="col">Specialist Firm</th>
                        <th scope="col">Active Scope</th>
                        <th scope="col">Deliverables Progress</th>
                        <th scope="col" style={{ textAlign: "right" }}>Committed Fee</th>
                        <th scope="col" style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeBasicsProfiles.map((item) => {
                        const primaryEngagement = item.activeEngagements[0];
                        const projectName =
                          item.projectNames[0] ||
                          primaryEngagement?.projectName ||
                          "Active Project";
                        const projectCoverImage =
                          item.projectCoverImageUrl ||
                          getBasicsProjectCoverImage(primaryEngagement?.projectId, projectName);
                        const devProject = MOCK_BASICS_PROJECT_CONTEXTS.find(
                          (p) =>
                            p.id === primaryEngagement?.projectId ||
                            p.name.toLowerCase() === projectName.toLowerCase(),
                        );
                        const serviceTitle =
                          primaryEngagement?.title ||
                          item.provider.specializations[0] ||
                          "Specialist Scope";

                        return (
                          <tr key={item.provider.id}>
                            <td>
                              <div className={styles.tableProjectCell}>
                                <img
                                  src={projectCoverImage}
                                  alt={projectName}
                                  className={styles.tableProjectThumb}
                                />
                                <div className={styles.tableProjectInfo}>
                                  <span className={styles.tableProjectName}>
                                    {projectName}
                                  </span>
                                  <span className={styles.tableProjectTag}>
                                    {devProject?.projectType || "Active Engagement"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className={styles.tableProviderCell}>
                                {item.provider.avatarUrl ? (
                                  <img
                                    src={item.provider.avatarUrl}
                                    alt={item.provider.name}
                                    className={styles.tableProviderAvatar}
                                  />
                                ) : (
                                  <div className={styles.tableProviderFallback}>
                                    {item.provider.name.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <div className={styles.tableProviderInfo}>
                                  <div className={styles.tableProviderNameRow}>
                                    <span className={styles.tableProviderName}>
                                      {item.provider.name}
                                    </span>
                                    <span className={styles.tableRatingPill}>
                                      ★ {item.provider.rating}
                                    </span>
                                  </div>
                                  <span className={styles.tableProviderMeta}>
                                    {item.provider.location.city} · {item.provider.yearsOfExperience} yrs exp
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className={styles.tableServiceCell}>
                                <span className={styles.tableServiceTitle}>
                                  {serviceTitle}
                                </span>
                                {primaryEngagement?.expectedCompletionDate ? (
                                  <span className={styles.tableServiceMeta}>
                                    Due {formatDate(primaryEngagement.expectedCompletionDate)}
                                  </span>
                                ) : (
                                  <span className={styles.tableServiceMeta}>In Progress</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className={styles.tableDeliverablesCell}>
                                <div className={styles.tableDeliverablesText}>
                                  <CheckCircle2 size={13} aria-hidden="true" />
                                  <span>{item.completedDeliverables}/{item.totalDeliverables} Approved</span>
                                </div>
                                <div className={styles.profileBasicsProgressBar} style={{ marginTop: 4, height: 4 }}>
                                  <div
                                    className={styles.profileBasicsProgressFill}
                                    style={{
                                      width: `${item.totalDeliverables > 0 ? Math.round((item.completedDeliverables / item.totalDeliverables) * 100) : 0}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <div className={styles.tableFeeCell}>
                                <span className={styles.tableFeeAmount}>
                                  {formatCurrency(item.totalCommittedFee, "INR")}
                                </span>
                                <span className={styles.tableFeeStatus} style={{ color: "#3b82f6" }}>Committed</span>
                              </div>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <div className={styles.tableActionGroup}>
                                <Link
                                  href={`/basics/engagements/${primaryEngagement?.id || ""}${projectId ? `?projectId=${projectId}` : ""}`}
                                  className={styles.tableOrderBtn}
                                >
                                  <span>Track Order</span>
                                  <ChevronRight size={12} aria-hidden="true" />
                                </Link>
                                <Link
                                  href={`/basics/experts/${item.provider.id}${projectId ? `?projectId=${projectId}` : ""}`}
                                  className={styles.tableProfileBtn}
                                >
                                  <span>Profile</span>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.basicsCardGrid}>
                  {(activeTab === "all" ? activeBasicsProfiles.slice(0, 4) : activeBasicsProfiles).map((item) => {
                    const primaryEngagement = item.activeEngagements[0];
                    const projectName =
                      item.projectNames[0] ||
                      primaryEngagement?.projectName ||
                      "Active Project";
                    const projectCoverImage =
                      item.projectCoverImageUrl ||
                      getBasicsProjectCoverImage(primaryEngagement?.projectId, projectName);
                    const devProject = MOCK_BASICS_PROJECT_CONTEXTS.find(
                      (p) =>
                        p.id === primaryEngagement?.projectId ||
                        p.name.toLowerCase() === projectName.toLowerCase(),
                    );
                    const serviceTitle =
                      primaryEngagement?.title ||
                      item.provider.specializations[0] ||
                      "Specialist Service";
                    const selectedServices =
                      item.selectedServices.length > 0
                        ? item.selectedServices
                        : [serviceTitle];
                    const isMultipleServices = selectedServices.length > 1;

                    return (
                      <div key={item.provider.id} className={styles.profileBasicsCard}>
                        {/* 1. Project Cover Image Banner */}
                        <div className={styles.activeProjectCoverWrap}>
                          <img
                            src={projectCoverImage}
                            alt={`${projectName} Cover`}
                            className={styles.activeProjectCoverImg}
                          />
                          <div className={styles.activeProjectCoverOverlay} aria-hidden="true" />
                          <div className={styles.activeProjectCoverBadges}>
                            <span className={styles.activeProjectScopeBadge}>
                              Project
                            </span>
                            {devProject?.projectType ? (
                              <span className={styles.activeProjectStageBadge}>
                                {devProject.projectType}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* 2. Card Content Body */}
                        <div className={styles.activeProjectCardBody}>
                          {/* Project Header & Committed Fee */}
                          <div className={styles.activeProjectCardTop}>
                            <div className={styles.activeProjectTitleWrap}>
                              <h3 className={styles.activeProjectName} title={projectName}>
                                {projectName}
                              </h3>
                            </div>
                            <div className={styles.activeProjectFeeWrap}>
                              <span className={styles.activeProjectFee}>
                                {formatCurrency(item.totalCommittedFee, "INR")}
                              </span>
                              <span className={styles.activeProjectFeeSub}>committed</span>
                            </div>
                          </div>

                          {/* Selected Service / Services Highlight */}
                          <div className={styles.activeProjectServiceHighlight}>
                            <div className={styles.activeProjectServiceLabel}>
                              <span>
                                {isMultipleServices
                                  ? `Selected Services (${selectedServices.length})`
                                  : "Selected Service"}
                              </span>
                              {primaryEngagement?.expectedCompletionDate ? (
                                <span className={styles.activeProjectDueDate}>
                                  Due {formatDate(primaryEngagement.expectedCompletionDate)}
                                </span>
                              ) : null}
                            </div>
                            {isMultipleServices ? (
                              <div className={styles.activeProjectMultipleServicesList}>
                                {selectedServices.map((srv, srvIdx) => (
                                  <div key={srvIdx} className={styles.activeProjectServiceItemRow}>
                                    <span className={styles.activeProjectServiceDot}>•</span>
                                    <span className={styles.activeProjectServiceItemTitle} title={srv}>
                                      {srv}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className={styles.activeProjectServiceTitle} title={selectedServices[0]}>
                                {selectedServices[0]}
                              </div>
                            )}
                          </div>

                          {/* Assigned Specialist Firm */}
                          <div className={styles.activeProjectProviderBox}>
                            <div className={styles.activeProjectProviderAvatarWrap}>
                              {item.provider.avatarUrl ? (
                                <img
                                  src={item.provider.avatarUrl}
                                  alt={item.provider.name}
                                  className={styles.activeProjectProviderAvatar}
                                />
                              ) : (
                                <div className={styles.activeProjectProviderAvatarFallback}>
                                  {item.provider.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              {item.provider.verified ? (
                                <span className={styles.activeProjectVerifiedBadge} title="Verified Specialist Firm">
                                  <ShieldCheck size={8} color="#ffffff" aria-hidden="true" />
                                </span>
                              ) : null}
                            </div>

                            <div className={styles.activeProjectProviderInfo}>
                              <div className={styles.activeProjectProviderNameRow}>
                                <span className={styles.activeProjectProviderName} title={item.provider.name}>
                                  {item.provider.name}
                                </span>
                                <div className={styles.profileBasicsRatingPill}>
                                  <Star size={9} fill="#eab308" color="#eab308" aria-hidden="true" />
                                  <span>{item.provider.rating}</span>
                                </div>
                              </div>
                              <div className={styles.activeProjectProviderMeta}>
                                <span>{item.provider.location.city}</span>
                                <span>·</span>
                                <span>{item.provider.yearsOfExperience} yrs exp</span>
                              </div>
                            </div>
                          </div>

                          {/* Deliverables Progress */}
                          {item.totalDeliverables > 0 ? (
                            <div className={styles.profileBasicsProgressWrap}>
                              <div className={styles.profileBasicsProgressBar}>
                                <div
                                  className={styles.profileBasicsProgressFill}
                                  style={{
                                    width: `${Math.round((item.completedDeliverables / item.totalDeliverables) * 100)}%`,
                                  }}
                                />
                              </div>
                              <span className={styles.profileBasicsProgressText}>
                                {item.completedDeliverables}/{item.totalDeliverables} Deliverables Approved
                              </span>
                            </div>
                          ) : null}

                          {/* Card Actions */}
                          <div className={styles.profileBasicsCardActions}>
                            <Link
                              href={`/basics/engagements/${primaryEngagement?.id || ""}${projectId ? `?projectId=${projectId}` : ""}`}
                              className={styles.profileBasicsPrimaryBtn}
                            >
                              <span>Track Order</span>
                              <ChevronRight size={13} aria-hidden="true" />
                            </Link>
                            <Link
                              href={`/basics/experts/${item.provider.id}${projectId ? `?projectId=${projectId}` : ""}`}
                              className={styles.profileBasicsSecondaryBtn}
                            >
                              <span>View Profile</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ) : null}

          {/* Requested Basics Profiles */}
          {activeTab === "all" || activeTab === "requested_profiles" ? (
            <section className={styles.dashboardCard} aria-labelledby="requested-basics-profiles-heading">
              <div className={styles.dashboardCardHeader}>
                <div className={styles.dashboardCardTitleGroup}>
                  <h2 id="requested-basics-profiles-heading" className={styles.dashboardCardTitle}>
                    Active Request
                  </h2>
                  <span className={styles.dashboardCardBadge}>{requestedBasicsProfiles.length}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                  {activeTab === "requested_profiles" && (
                    <div className={styles.viewModeToggleGroup} role="group" aria-label="View mode toggle">
                      <button
                        type="button"
                        className={`${styles.viewModeToggleBtn} ${viewMode === "grid" ? styles.viewModeToggleBtnActive : ""}`}
                        onClick={() => setViewMode("grid")}
                        aria-label="Card grid view"
                        title="Card Grid View"
                      >
                        <LayoutGrid size={14} aria-hidden="true" />
                        <span>Grid</span>
                      </button>
                      <button
                        type="button"
                        className={`${styles.viewModeToggleBtn} ${viewMode === "table" ? styles.viewModeToggleBtnActive : ""}`}
                        onClick={() => setViewMode("table")}
                        aria-label="Table list view"
                        title="Table List View"
                      >
                        <List size={14} aria-hidden="true" />
                        <span>Table</span>
                      </button>
                    </div>
                  )}
                  {activeTab === "all" ? (
                    <button
                      type="button"
                      onClick={() => setActiveTab("requested_profiles")}
                      className={styles.dashboardViewAllLink}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      <span>View all requests</span>
                      <ArrowRight size={13} aria-hidden="true" />
                    </button>
                  ) : (
                    <Link
                      href={projectId ? `/basics/proposals?projectId=${projectId}` : "/basics/proposals"}
                      className={styles.dashboardViewAllLink}
                    >
                      <span>All proposals</span>
                      <ArrowRight size={13} aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </div>

              {requestedBasicsProfiles.length === 0 ? (
                <BasicsEmptyState
                  title="No requested specialist profiles"
                  description="Publish a requirement to receive proposals from qualified architectural and engineering experts."
                  actionLabel="Post a Requirement"
                  href="/basics/requirements/new"
                />
              ) : activeTab === "requested_profiles" && viewMode === "table" ? (
                <div className={styles.basicsTableContainer}>
                  <table className={styles.basicsDataTable} aria-label="Active Requests Table">
                    <thead>
                      <tr>
                        <th scope="col">Scope & Project</th>
                        <th scope="col">Specialist Firm</th>
                        <th scope="col">Status</th>
                        <th scope="col">Timeline</th>
                        <th scope="col" style={{ textAlign: "right" }}>Proposed Fee</th>
                        <th scope="col" style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requestedBasicsProfiles.map((item) => (
                        <tr key={item.proposal.id}>
                          <td>
                            <div className={styles.tableProjectCell}>
                              <div className={styles.tableProjectInfo}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                                  <span className={styles.requestedProjectPill} title={`Project: ${item.projectName}`}>
                                    {item.projectName}
                                  </span>
                                  {item.requirement?.specialization ? (
                                    <span className={styles.requestedSpecializationTag}>
                                      {item.requirement.specialization}
                                    </span>
                                  ) : null}
                                </div>
                                <span className={styles.tableProjectName} title={item.requirement?.title || "Specialist Scope"}>
                                  {item.requirement?.title || "Specialist Scope"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className={styles.tableProviderCell}>
                              <div className={styles.requestedBidderAvatarWrap}>
                                {item.provider.avatarUrl ? (
                                  <img
                                    src={item.provider.avatarUrl}
                                    alt={item.provider.name}
                                    className={styles.requestedBidderAvatar}
                                  />
                                ) : (
                                  <div className={styles.requestedBidderAvatarFallback}>
                                    {item.provider.name.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className={styles.tableProviderInfo}>
                                <div className={styles.tableProviderNameRow}>
                                  <span className={styles.tableProviderName} title={item.provider.name}>
                                    {item.provider.name}
                                  </span>
                                  <div className={styles.profileBasicsRatingPill}>
                                    <Star size={9} fill="#eab308" color="#eab308" aria-hidden="true" />
                                    <span>{item.provider.rating}</span>
                                  </div>
                                </div>
                                <span className={styles.tableProviderMeta}>
                                  {item.provider.location.city}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <BasicsStatusBadge status={item.proposal.status} />
                          </td>
                          <td>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "var(--ink, #0f172a)", fontSize: "12.5px", fontWeight: 500 }}>
                              <Clock size={12} color="#64748b" aria-hidden="true" />
                              <span>{item.proposal.estimatedDurationDays ?? 21} days</span>
                            </div>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div className={styles.tableFeeCell}>
                              <span className={styles.tableFeeAmount}>
                                {formatCurrency(item.proposal.fee, item.proposal.currency ?? "INR")}
                              </span>
                              <span className={styles.tableFeeStatus} style={{ color: "#64748b", textTransform: "none", fontSize: "11px" }}>
                                Proposed
                              </span>
                            </div>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div className={styles.tableActionGroup}>
                              <Link
                                href={`/basics/proposals/${item.proposal.id}${projectId ? `?projectId=${projectId}` : ""}`}
                                className={styles.tableOrderBtn}
                              >
                                <span>Review Proposal</span>
                                <ChevronRight size={13} aria-hidden="true" />
                              </Link>
                              <Link
                                href={`/basics/experts/${item.provider.id}${projectId ? `?projectId=${projectId}` : ""}`}
                                className={styles.tableProfileBtn}
                              >
                                <span>Profile</span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.basicsCardGrid}>
                  {(activeTab === "all" ? requestedBasicsProfiles.slice(0, 4) : requestedBasicsProfiles).map((item) => (
                    <div key={item.proposal.id} className={styles.requestedBasicsCard}>
                      {/* 1. Header Badges: Proposal Tag, Project Pill, and Status */}
                      <div className={styles.requestedCardTop}>
                        <div className={styles.requestedTopBadges}>
                          <span className={styles.requestedProposalBadge}>
                            <FileText size={10} aria-hidden="true" />
                            <span>Proposal</span>
                          </span>
                          <span className={styles.requestedProjectPill} title={`Project: ${item.projectName}`}>
                            {item.projectName}
                          </span>
                        </div>
                        <BasicsStatusBadge status={item.proposal.status} />
                      </div>

                      {/* 2. Scope Requirement Headline & Discipline Tag */}
                      <div className={styles.requestedScopeHeader}>
                        <h3
                          className={styles.requestedRequirementTitle}
                          title={item.requirement?.title || "Specialist Scope"}
                        >
                          {item.requirement?.title || "Specialist Scope"}
                        </h3>
                        {item.requirement?.specialization ? (
                          <span className={styles.requestedSpecializationTag}>
                            {item.requirement.specialization}
                          </span>
                        ) : null}
                      </div>

                        {/* Proposing Specialist Firm Attribution */}
                        <div className={styles.requestedBidderRow}>
                          <div className={styles.requestedBidderAvatarWrap}>
                            {item.provider.avatarUrl ? (
                              <img
                                src={item.provider.avatarUrl}
                                alt={item.provider.name}
                                className={styles.requestedBidderAvatar}
                              />
                            ) : (
                              <div className={styles.requestedBidderAvatarFallback}>
                                {item.provider.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className={styles.requestedBidderInfo}>
                            <div className={styles.requestedBidderNameRow}>
                              <span className={styles.requestedBidderName} title={item.provider.name}>
                                {item.provider.name}
                              </span>
                              <div className={styles.profileBasicsRatingPill}>
                                <Star size={9} fill="#eab308" color="#eab308" aria-hidden="true" />
                                <span>{item.provider.rating}</span>
                              </div>
                            </div>
                            <span className={styles.requestedBidderLocation}>
                              {item.provider.location.city}
                            </span>
                          </div>
                        </div>

                        {/* Quotation Terms Comparison Strip */}
                        <div className={styles.requestedQuoteBox}>
                          <div className={styles.requestedQuoteItem}>
                            <span className={styles.requestedQuoteLabel}>Proposed Fee</span>
                            <span className={styles.requestedQuoteFee}>
                              {formatCurrency(item.proposal.fee, item.proposal.currency ?? "INR")}
                            </span>
                          </div>
                          <div className={styles.requestedQuoteDivider} aria-hidden="true" />
                          <div className={styles.requestedQuoteItemRight}>
                            <span className={styles.requestedQuoteLabel}>Timeline</span>
                            <span className={styles.requestedQuoteTimeline}>
                              <Clock size={11} aria-hidden="true" />
                              <span>{item.proposal.estimatedDurationDays ?? 21} days</span>
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className={styles.requestedBasicsCardActions}>
                          <Link
                            href={`/basics/proposals/${item.proposal.id}${projectId ? `?projectId=${projectId}` : ""}`}
                            className={styles.requestedBasicsPrimaryBtn}
                          >
                            <span>Review Proposal</span>
                            <ChevronRight size={13} aria-hidden="true" />
                          </Link>
                          <Link
                            href={`/basics/experts/${item.provider.id}${projectId ? `?projectId=${projectId}` : ""}`}
                            className={styles.requestedBasicsSecondaryBtn}
                          >
                            <span>Profile</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </section>
          ) : null}

          {/* Completed Project Section */}
          {activeTab === "completed_projects" ? (
            <section className={styles.dashboardCard} aria-labelledby="completed-projects-heading">
              <div className={styles.dashboardCardHeader}>
                <div className={styles.dashboardCardTitleGroup}>
                  <h2 id="completed-projects-heading" className={styles.dashboardCardTitle}>
                    Completed Project
                  </h2>
                  <span className={styles.dashboardCardBadge}>
                    {completedBasicsProjects.length}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                  <span className={styles.completedSectionSubtitle}>
                    Archived project history & verified delivery records
                  </span>
                  <div className={styles.viewModeToggleGroup} role="group" aria-label="View mode toggle">
                    <button
                      type="button"
                      className={`${styles.viewModeToggleBtn} ${viewMode === "grid" ? styles.viewModeToggleBtnActive : ""}`}
                      onClick={() => setViewMode("grid")}
                      aria-label="Card grid view"
                      title="Card Grid View"
                    >
                      <LayoutGrid size={14} aria-hidden="true" />
                      <span>Grid</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.viewModeToggleBtn} ${viewMode === "table" ? styles.viewModeToggleBtnActive : ""}`}
                      onClick={() => setViewMode("table")}
                      aria-label="Table list view"
                      title="Table List View"
                    >
                      <List size={14} aria-hidden="true" />
                      <span>Table</span>
                    </button>
                  </div>
                </div>
              </div>

              {completedBasicsProjects.length === 0 ? (
                <BasicsEmptyState
                  title="No completed projects yet"
                  description="When specialist engagements are finished and approved, their delivery records will appear here as history."
                  actionLabel="Browse Specialists"
                  href="/basics/experts"
                />
              ) : viewMode === "grid" ? (
                <div className={styles.basicsCardGrid}>
                  {completedBasicsProjects.map((item) => {
                    const devProject = MOCK_BASICS_PROJECT_CONTEXTS.find(
                      (p) =>
                        p.id === item.engagement?.projectId ||
                        p.name.toLowerCase() === item.projectName.toLowerCase(),
                    );
                    const projectCoverImage = getBasicsProjectCoverImage(
                      item.engagement?.projectId,
                      item.projectName,
                    );

                    return (
                      <div key={item.id} className={styles.completedProjectCard}>
                        {/* 1. Project Cover Image Banner */}
                        <div className={styles.activeProjectCoverWrap}>
                          <img
                            src={projectCoverImage}
                            alt={`${item.projectName} Cover`}
                            className={styles.activeProjectCoverImg}
                          />
                          <div className={styles.activeProjectCoverOverlay} aria-hidden="true" />
                          <div className={styles.activeProjectCoverBadges}>
                            <span className={styles.completedProjectBadge}>
                              <CheckCircle2 size={10} aria-hidden="true" />
                              <span>Completed</span>
                            </span>
                            {devProject?.projectType ? (
                              <span className={styles.activeProjectStageBadge}>
                                {devProject.projectType}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* 2. Card Content Body */}
                        <div className={styles.activeProjectCardBody}>
                          {/* Project Header & Settled Fee */}
                          <div className={styles.activeProjectCardTop}>
                            <div className={styles.activeProjectTitleWrap}>
                              <h3 className={styles.activeProjectName} title={item.projectName}>
                                {item.projectName}
                              </h3>
                            </div>
                            <div className={styles.activeProjectFeeWrap}>
                              <span className={styles.completedProjectFee}>
                                {formatCurrency(item.finalFee, "INR")}
                              </span>
                              <span className={styles.completedProjectFeeSub}>settled</span>
                            </div>
                          </div>

                          {/* Delivered Service Highlight */}
                          <div className={styles.completedServiceHighlight}>
                            <div className={styles.completedServiceLabel}>
                              <span>
                                {item.deliveredServices.length > 1
                                  ? `Delivered Services (${item.deliveredServices.length})`
                                  : "Delivered Service"}
                              </span>
                              <span className={styles.activeProjectDueDate}>
                                Delivered {formatDate(item.completedDate)}
                              </span>
                            </div>
                            {item.deliveredServices.length > 1 ? (
                              <div className={styles.activeProjectMultipleServicesList}>
                                {item.deliveredServices.map((srv, srvIdx) => (
                                  <div key={srvIdx} className={styles.activeProjectServiceItemRow}>
                                    <span className={styles.completedProjectServiceDot}>•</span>
                                    <span className={styles.activeProjectServiceItemTitle} title={srv}>
                                      {srv}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className={styles.activeProjectServiceTitle} title={item.deliveredService}>
                                {item.deliveredService}
                              </div>
                            )}
                          </div>

                          {/* Assigned Specialist Firm Who Delivered */}
                          {item.provider ? (
                            <div className={styles.activeProjectProviderBox}>
                              <div className={styles.activeProjectProviderAvatarWrap}>
                                {item.provider.avatarUrl ? (
                                  <img
                                    src={item.provider.avatarUrl}
                                    alt={item.provider.name}
                                    className={styles.activeProjectProviderAvatar}
                                  />
                                ) : (
                                  <div className={styles.activeProjectProviderAvatarFallback}>
                                    {item.provider.name.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                {item.provider.verified ? (
                                  <span className={styles.activeProjectVerifiedBadge} title="Verified Specialist Firm">
                                    <ShieldCheck size={8} color="#ffffff" aria-hidden="true" />
                                  </span>
                                ) : null}
                              </div>

                              <div className={styles.activeProjectProviderInfo}>
                                <div className={styles.activeProjectProviderNameRow}>
                                  <span className={styles.activeProjectProviderName} title={item.provider.name}>
                                    {item.provider.name}
                                  </span>
                                  <div className={styles.profileBasicsRatingPill}>
                                    <Star size={9} fill="#eab308" color="#eab308" aria-hidden="true" />
                                    <span>{item.provider.rating}</span>
                                  </div>
                                </div>
                                <div className={styles.activeProjectProviderMeta}>
                                  <span>{item.provider.location.city}</span>
                                  <span>·</span>
                                  <span>{item.provider.yearsOfExperience} yrs exp</span>
                                </div>
                              </div>
                            </div>
                          ) : null}

                          {/* Completion Status Bar */}
                          <div className={styles.completedStatusWrap}>
                            <div className={styles.completedProgressBar}>
                              <div
                                className={styles.completedProgressFill}
                                style={{ width: "100%" }}
                              />
                            </div>
                            <div className={styles.completedProgressMeta}>
                              <span>
                                {item.completedDeliverables}/{item.totalDeliverables} Deliverables Approved
                              </span>
                              <span className={styles.completedArchivedTag}>Archived</span>
                            </div>
                          </div>

                          {/* Card Actions */}
                          <div className={styles.profileBasicsCardActions}>
                            <Link
                              href={`/basics/engagements/${item.id}${projectId ? `?projectId=${projectId}` : ""}`}
                              className={styles.completedPrimaryBtn}
                            >
                              <span>Order Summary</span>
                              <ChevronRight size={13} aria-hidden="true" />
                            </Link>
                            {item.provider ? (
                              <Link
                                href={`/basics/experts/${item.provider.id}${projectId ? `?projectId=${projectId}` : ""}`}
                                className={styles.profileBasicsSecondaryBtn}
                              >
                                <span>View Profile</span>
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.basicsTableContainer}>
                  <table className={styles.basicsDataTable} aria-label="Completed Projects Table">
                    <thead>
                      <tr>
                        <th scope="col">Project</th>
                        <th scope="col">Delivered Service</th>
                        <th scope="col">Specialist Firm</th>
                        <th scope="col">Deliverables</th>
                        <th scope="col" style={{ textAlign: "right" }}>Settled Fee</th>
                        <th scope="col" style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedBasicsProjects.map((item) => {
                        const devProject = MOCK_BASICS_PROJECT_CONTEXTS.find(
                          (p) =>
                            p.id === item.engagement?.projectId ||
                            p.name.toLowerCase() === item.projectName.toLowerCase(),
                        );
                        const projectCoverImage = getBasicsProjectCoverImage(
                          item.engagement?.projectId,
                          item.projectName,
                        );

                        return (
                          <tr key={item.id}>
                            <td>
                              <div className={styles.tableProjectCell}>
                                <img
                                  src={projectCoverImage}
                                  alt={item.projectName}
                                  className={styles.tableProjectThumb}
                                />
                                <div className={styles.tableProjectInfo}>
                                  <span className={styles.tableProjectName}>
                                    {item.projectName}
                                  </span>
                                  <span className={styles.tableProjectTag}>
                                    {devProject?.projectType || "Completed Engagement"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className={styles.tableServiceCell}>
                                <span className={styles.tableServiceTitle}>
                                  {item.deliveredService}
                                </span>
                                <span className={styles.tableServiceMeta}>
                                  Delivered {formatDate(item.completedDate)}
                                </span>
                              </div>
                            </td>
                            <td>
                              {item.provider ? (
                                <div className={styles.tableProviderCell}>
                                  {item.provider.avatarUrl ? (
                                    <img
                                      src={item.provider.avatarUrl}
                                      alt={item.provider.name}
                                      className={styles.tableProviderAvatar}
                                    />
                                  ) : (
                                    <div className={styles.tableProviderFallback}>
                                      {item.provider.name.slice(0, 2).toUpperCase()}
                                    </div>
                                  )}
                                  <div className={styles.tableProviderInfo}>
                                    <div className={styles.tableProviderNameRow}>
                                      <span className={styles.tableProviderName}>
                                        {item.provider.name}
                                      </span>
                                      <span className={styles.tableRatingPill}>
                                        ★ {item.provider.rating}
                                      </span>
                                    </div>
                                    <span className={styles.tableProviderMeta}>
                                      {item.provider.location.city} · {item.provider.yearsOfExperience} yrs exp
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <span style={{ color: "var(--muted)" }}>—</span>
                              )}
                            </td>
                            <td>
                              <div className={styles.tableDeliverablesCell}>
                                <div className={styles.tableDeliverablesText}>
                                  <CheckCircle2 size={13} aria-hidden="true" />
                                  <span>{item.completedDeliverables}/{item.totalDeliverables} Approved</span>
                                </div>
                                <span className={styles.tableDeliverablesSub}>
                                  Archived record
                                </span>
                              </div>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <div className={styles.tableFeeCell}>
                                <span className={styles.tableFeeAmount}>
                                  {formatCurrency(item.finalFee, "INR")}
                                </span>
                                <span className={styles.tableFeeStatus}>Settled</span>
                              </div>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <div className={styles.tableActionGroup}>
                                <Link
                                  href={`/basics/engagements/${item.id}${projectId ? `?projectId=${projectId}` : ""}`}
                                  className={styles.tableOrderBtn}
                                >
                                  <span>Order Summary</span>
                                  <ChevronRight size={12} aria-hidden="true" />
                                </Link>
                                {item.provider && (
                                  <Link
                                    href={`/basics/experts/${item.provider.id}${projectId ? `?projectId=${projectId}` : ""}`}
                                    className={styles.tableProfileBtn}
                                  >
                                    <span>Profile</span>
                                  </Link>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ) : null}

          {/* Active Orders / Engagements */}
          {activeTab === "orders" ? (
            <section className={styles.dashboardCard} aria-labelledby="active-orders-heading">
              <div className={styles.dashboardCardHeader}>
                <div className={styles.dashboardCardTitleGroup}>
                  <h2 id="active-orders-heading" className={styles.dashboardCardTitle}>Active Orders & Engagements</h2>
                  <span className={styles.dashboardCardBadge}>{activeEngagements.length}</span>
                </div>
                <Link
                  href={projectId ? `/basics/engagements?projectId=${projectId}` : "/basics/engagements"}
                  className={styles.dashboardViewAllLink}
                >
                  <span>View all</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>

              {activeEngagements.length === 0 ? (
                <BasicsEmptyState
                  title="No active orders"
                  description="Browse specialist packages or award proposals to start an engagement."
                  actionLabel="Explore Specialists"
                  href="/basics/experts"
                />
              ) : (
                <div className={styles.dashboardList}>
                  {activeEngagements.slice(0, 4).map((eng) => {
                    const completedDeliverables = eng.deliverables.filter((d) => d.status === "approved").length;
                    const totalDeliverables = eng.deliverables.length;
                    const provider = providers.find((p) => p.id === eng.providerId);
                    const providerDisplayName = provider ? provider.name : "Specialist Provider";

                    return (
                      <Link
                        key={eng.id}
                        href={`/basics/engagements/${eng.id}${projectId ? `?projectId=${projectId}` : ""}`}
                        className={styles.dashboardListItem}
                      >
                        <div className={styles.dashboardItemInfo}>
                          <span className={styles.dashboardItemTitle}>{eng.title}</span>
                          <div className={styles.dashboardItemMeta}>
                            <span>Provider: <strong>{providerDisplayName}</strong></span>
                            <span>·</span>
                            <span>Due: {formatDate(eng.expectedCompletionDate)}</span>
                            <span>·</span>
                            <span>
                              Deliverables: {completedDeliverables}/{totalDeliverables}
                            </span>
                          </div>
                        </div>
                        <div className={styles.dashboardItemRight}>
                          <div className={styles.dashboardItemFee}>
                            {formatCurrency(eng.agreedFee, eng.currency ?? "INR")}
                          </div>
                          <BasicsStatusBadge status={eng.status} />
                          {eng.status === "awaiting_review" ? (
                            <span className={styles.orderApprovalInlinePill}>Review & Approve</span>
                          ) : null}
                          <ChevronRight size={15} color="#94a3b8" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          ) : null}

          {/* Approvals Section (showing approval output files from providers) */}
          {activeTab === "approvals" || activeTab === "requests" ? (
            <section className={styles.dashboardCard} aria-labelledby="approvals-heading">
              <div className={styles.dashboardCardHeader}>
                <div className={styles.dashboardCardTitleGroup}>
                  <h2 id="approvals-heading" className={styles.dashboardCardTitle}>
                    Approvals
                  </h2>
                  <span className={styles.dashboardCardBadge}>
                    {pendingApprovalDeliverables.length}
                  </span>
                </div>
                <span className={styles.dashboardViewAllLink}>
                  <span>Output Files for Review</span>
                </span>
              </div>

              {approvalToast ? (
                <div className={styles.deliverableSuccessBanner} style={{ margin: "0 18px 16px" }} role="status">
                  <CheckCircle2 size={14} aria-hidden="true" />
                  <span>{approvalToast}</span>
                </div>
              ) : null}

              {pendingApprovalDeliverables.length === 0 ? (
                <BasicsEmptyState
                  title="No deliverables pending approval"
                  description="All submitted specialist outputs and milestones have been reviewed and approved."
                  actionLabel="View Active Projects"
                  href={projectId ? `/basics/dashboard?projectId=${projectId}` : "/basics/dashboard"}
                />
              ) : (
                <div className={styles.approvalsList}>
                  {pendingApprovalDeliverables.map((item) => (
                    <div key={item.id} className={styles.approvalItemCard}>
                      {/* 1. Project Context & Service Header */}
                      <div className={styles.approvalCardTop}>
                        <div className={styles.approvalProjectContext}>
                          <span className={styles.approvalProjectName}>{item.engagement.projectName}</span>
                          <span className={styles.approvalContextDot}>·</span>
                          <span className={styles.approvalServiceTitle}>{item.engagement.title}</span>
                        </div>
                        <span className={styles.approvalStatusPill}>
                          <Clock size={11} aria-hidden="true" />
                          <span>Awaiting Review</span>
                        </span>
                      </div>

                      {/* 2. Submitted Output File from Provider */}
                      <div
                        className={styles.approvalOutputFileBox}
                        onClick={() => setSelectedApprovalItem(item)}
                        role="button"
                        tabIndex={0}
                        title="Click to view and review deliverable output"
                      >
                        <div className={styles.approvalOutputFileIconWrap}>
                          <FileText size={22} className={styles.approvalFileIcon} aria-hidden="true" />
                          <span className={styles.approvalFileExtBadge}>PDF</span>
                        </div>
                        <div className={styles.approvalOutputFileDetails}>
                          <div className={styles.approvalOutputFileNameRow}>
                            <span className={styles.approvalOutputFileName}>
                              {item.latestVersion.fileName}
                            </span>
                            <span className={styles.approvalVersionBadge}>
                              Rev 0{item.latestVersion.version}
                            </span>
                          </div>
                          <div className={styles.approvalOutputFileMeta}>
                            <span>Deliverable: <strong>{item.deliverable.name}</strong></span>
                            <span>·</span>
                            <span>Submitted by <strong>{item.provider?.name || item.latestVersion.submittedBy}</strong></span>
                            <span>·</span>
                            <span>{formatDate(item.latestVersion.submittedAt)}</span>
                            <span>·</span>
                            <span>4.2 MB</span>
                          </div>
                        </div>
                        <div className={styles.approvalOutputFileRightActions}>
                          <button
                            type="button"
                            className={styles.approvalDownloadQuickBtn}
                            title="Download Output File"
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Downloading ${item.latestVersion.fileName}...`);
                            }}
                          >
                            <Download size={13} aria-hidden="true" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>

                      {/* 3. Provider Details, Milestone & Review Actions */}
                      <div className={styles.approvalCardFooter}>
                        <div className={styles.approvalProviderWrap}>
                          <div className={styles.approvalProviderAvatarWrap}>
                            {item.provider?.avatarUrl ? (
                              <img
                                src={item.provider.avatarUrl}
                                alt={item.provider.name}
                                className={styles.approvalProviderAvatar}
                              />
                            ) : (
                              <div className={styles.approvalProviderAvatarFallback}>
                                {(item.provider?.name || "SP").slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            {item.provider?.verified ? (
                              <span className={styles.approvalProviderVerified} title="Verified Specialist Firm">
                                <ShieldCheck size={8} color="#ffffff" aria-hidden="true" />
                              </span>
                            ) : null}
                          </div>
                          <div className={styles.approvalProviderText}>
                            <span className={styles.approvalProviderName}>{item.provider?.name}</span>
                            <span className={styles.approvalProviderRole}>
                              {item.provider?.specializations[0] || "Specialist Provider"}
                            </span>
                          </div>
                        </div>

                        {item.milestone ? (
                          <div className={styles.approvalMilestoneWrap}>
                            <span className={styles.approvalMilestoneLabel}>Milestone Release</span>
                            <span className={styles.approvalMilestoneVal}>
                              {formatCurrency(item.milestone.amount, item.milestone.currency || "INR")}
                            </span>
                          </div>
                        ) : null}

                        <div className={styles.approvalActionsGroup}>
                          <button
                            type="button"
                            className={styles.approvalReviewBtn}
                            onClick={() => setSelectedApprovalItem(item)}
                          >
                            <Eye size={13} aria-hidden="true" />
                            <span>View & Review</span>
                          </button>
                          <button
                            type="button"
                            className={styles.approvalQuickApproveBtn}
                            onClick={() => handleApproveDeliverable(item.deliverable, item.engagement.id)}
                            title="Directly approve deliverable"
                          >
                            <Check size={13} aria-hidden="true" />
                            <span>Approve</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {/* Pending Proposals */}
          {activeTab === "proposals" ? (
            <section className={styles.dashboardCard} aria-labelledby="proposals-heading">
              <div className={styles.dashboardCardHeader}>
                <div className={styles.dashboardCardTitleGroup}>
                  <h2 id="proposals-heading" className={styles.dashboardCardTitle}>Pending Proposals & Bids</h2>
                  <span className={styles.dashboardCardBadge}>{proposals.length}</span>
                </div>
                <Link
                  href={projectId ? `/basics/proposals?projectId=${projectId}` : "/basics/proposals"}
                  className={styles.dashboardViewAllLink}
                >
                  <span>View all</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>

              {proposals.length === 0 ? (
                <BasicsEmptyState
                  title="No proposals received"
                  description="Invite specialists to your requirements to receive competitive scopes and fee proposals."
                  actionLabel="Explore Specialists"
                  href="/basics/experts"
                />
              ) : (
                <div className={styles.dashboardList}>
                  {proposals.slice(0, 4).map((prop) => {
                    const provider = providers.find((p) => p.id === prop.providerId);
                    const providerDisplayName = provider ? provider.name : "Specialist Provider";
                    return (
                      <Link
                        key={prop.id}
                        href={`/basics/proposals/${prop.id}${projectId ? `?projectId=${projectId}` : ""}`}
                        className={styles.dashboardListItem}
                      >
                        <div className={styles.dashboardItemInfo}>
                          <span className={styles.dashboardItemTitle}>{providerDisplayName}</span>
                          <div className={styles.dashboardItemMeta}>
                            <span>Scope: {prop.scopeSummary}</span>
                            {prop.estimatedStartDate ? (
                              <>
                                <span>·</span>
                                <span>Est. start: {formatDate(prop.estimatedStartDate)}</span>
                              </>
                            ) : null}
                          </div>
                        </div>
                        <div className={styles.dashboardItemRight}>
                          <div className={styles.dashboardItemFee}>
                            {formatCurrency(prop.fee, prop.currency ?? "INR")}
                          </div>
                          <BasicsStatusBadge status={prop.status} />
                          <ChevronRight size={15} color="#94a3b8" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          ) : null}

          {/* Finance of Basics */}
          {activeTab === "all" || activeTab === "finance" ? (
            <section className={styles.dashboardCard} aria-labelledby="finance-heading">
              <div className={styles.dashboardCardHeader}>
                <div className={styles.dashboardCardTitleGroup}>
                  <h2 id="finance-heading" className={styles.dashboardCardTitle}>Finance of Basics</h2>
                  <span className={styles.dashboardCardBadge}>{formatCurrency(totalCommittedFee, "INR")} Committed</span>
                </div>
                <Link
                  href={projectId ? `/basics/engagements?projectId=${projectId}` : "/basics/engagements"}
                  className={styles.dashboardViewAllLink}
                >
                  <span>Milestone ledger</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>

              {/* Financial Highlights Grid */}
              <div className={styles.financeSummaryGrid}>
                <div className={styles.financeSummaryItem}>
                  <span className={styles.financeSummaryLabel}>Total Committed</span>
                  <span className={styles.financeSummaryVal}>{formatCurrency(totalCommittedFee, "INR")}</span>
                  <span className={styles.financeSummaryNote}>{activeEngagements.length} active orders</span>
                </div>
                <div className={styles.financeSummaryItem}>
                  <span className={styles.financeSummaryLabel}>Disbursed / Paid</span>
                  <span className={styles.financeSummaryVal} style={{ color: "#16a34a" }}>
                    {formatCurrency(totalPaidFee, "INR")}
                  </span>
                  <span className={styles.financeSummaryNote}>{paidPercent}% released to experts</span>
                </div>
                <div className={styles.financeSummaryItem}>
                  <span className={styles.financeSummaryLabel}>Held in Escrow</span>
                  <span className={styles.financeSummaryVal} style={{ color: "#0284c7" }}>
                    {formatCurrency(totalEscrowFee, "INR")}
                  </span>
                  <span className={styles.financeSummaryNote}>{escrowPercent}% milestone protected</span>
                </div>
                <div className={styles.financeSummaryItem}>
                  <span className={styles.financeSummaryLabel}>Pending Balance</span>
                  <span className={styles.financeSummaryVal} style={{ color: "#475569" }}>
                    {formatCurrency(totalDueFee, "INR")}
                  </span>
                  <span className={styles.financeSummaryNote}>{duePercent}% remaining upon delivery</span>
                </div>
              </div>

              {/* Multi-segment Funding Progress Bar */}
              <div className={styles.financeProgressBarWrap}>
                <div className={styles.financeProgressBar} aria-label="Milestone funding progress">
                  <div
                    className={styles.financeProgressPaid}
                    style={{ width: `${paidPercent}%` }}
                    title={`Paid: ${paidPercent}%`}
                  />
                  <div
                    className={styles.financeProgressEscrow}
                    style={{ width: `${escrowPercent}%` }}
                    title={`In Escrow: ${escrowPercent}%`}
                  />
                  <div
                    className={styles.financeProgressDue}
                    style={{ width: `${duePercent}%` }}
                    title={`Remaining: ${duePercent}%`}
                  />
                </div>
                <div className={styles.financeProgressLegend}>
                  <div className={styles.financeLegendItem}>
                    <span className={styles.financeLegendDot} style={{ background: "#16a34a" }} />
                    <span>Disbursed ({paidPercent}%)</span>
                  </div>
                  <div className={styles.financeLegendItem}>
                    <span className={styles.financeLegendDot} style={{ background: "#0284c7" }} />
                    <span>Milestone Escrow ({escrowPercent}%)</span>
                  </div>
                  <div className={styles.financeLegendItem}>
                    <span className={styles.financeLegendDot} style={{ background: "#cbd5e1" }} />
                    <span>Remaining ({duePercent}%)</span>
                  </div>
                </div>
              </div>

              {/* Milestone Payments Table */}
              <div className={styles.financeMilestoneTable}>
                {allActiveMilestones.slice(0, 5).map((m) => {
                  const isPaid = m.paymentStatus === "paid";
                  const isEscrow = m.paymentStatus === "processing" || m.completionStatus === "in_progress";
                  return (
                    <div key={m.id} className={styles.financeMilestoneRow}>
                      <div className={styles.financeMilestoneLeft}>
                        <span className={styles.financeMilestoneTitle}>{m.title}</span>
                        <div className={styles.financeMilestoneMeta}>
                          <span>{m.engagementTitle}</span>
                          <span>·</span>
                          <span>Provider: <strong>{m.providerName}</strong></span>
                          <span>·</span>
                          <span>Due: {formatDate(m.dueDate)}</span>
                        </div>
                      </div>
                      <div className={styles.financeMilestoneRight}>
                        <span className={styles.financeMilestoneAmount}>
                          {formatCurrency(m.amount, m.currency)}
                        </span>
                        <span
                          className={
                            isPaid
                              ? styles.financeStatusPaid
                              : isEscrow
                              ? styles.financeStatusEscrow
                              : styles.financeStatusDue
                          }
                        >
                          {isPaid ? "✓ Paid" : isEscrow ? "In Escrow" : "Due on Delivery"}
                        </span>
                        <Link
                          href={`/basics/engagements/${m.engagementId}${projectId ? `?projectId=${projectId}` : ""}`}
                          className={styles.dashboardViewAllLink}
                          title="View engagement order"
                        >
                          <ChevronRight size={15} color="#94a3b8" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {/* Deliverable Review Modal for viewing output files and approving */}
      {selectedApprovalItem ? (
        <DeliverableReviewModal
          isOpen={true}
          onClose={() => setSelectedApprovalItem(null)}
          engagement={selectedApprovalItem.engagement}
          deliverable={selectedApprovalItem.deliverable}
          latestVersion={selectedApprovalItem.latestVersion}
          provider={selectedApprovalItem.provider}
          milestone={selectedApprovalItem.milestone}
          onApprove={async (d) => {
            await handleApproveDeliverable(d, selectedApprovalItem.engagement.id);
          }}
          onRequestRevision={async (d, comments) => {
            await handleRequestRevision(d, comments, selectedApprovalItem.engagement.id);
          }}
        />
      ) : null}
    </div>
  );
}
