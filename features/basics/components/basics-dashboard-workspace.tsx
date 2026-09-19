"use client";

import {
  ArrowRight,
  Bell,
  ChevronRight,
  Cpu,
  Layers,
  Plus,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  EnergyDuotoneIcon,
  BuildingDuotoneIcon as BuildingIcon,
  LayersDuotoneIcon,
  StudioDuotoneIcon,
  DocumentsDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import {
  basicsEngagementRepository,
  basicsProposalRepository,
  basicsProviderRepository,
  basicsRequirementRepository,
} from "../repositories/basics-repositories";
import type {
  BasicsEngagement,
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
import styles from "./basics-workspace.module.css";

interface BasicsDashboardWorkspaceProps {
  projectId?: string;
}

type DashboardTab = "all" | "orders" | "requests" | "proposals" | "finance";

export function BasicsDashboardWorkspace({ projectId }: BasicsDashboardWorkspaceProps) {
  const [engagements, setEngagements] = useState<BasicsEngagement[]>([]);
  const [requirements, setRequirements] = useState<BasicsRequirement[]>([]);
  const [proposals, setProposals] = useState<BasicsProposal[]>([]);
  const [providers, setProviders] = useState<BasicsProvider[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "success" | "error" | "offline">("loading");
  const [activeTab, setActiveTab] = useState<DashboardTab>("all");
  const [approvalNoticeDismissed, setApprovalNoticeDismissed] = useState(false);

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

  const openRequirements = requirements.filter(
    (r) => r.status === "open" || r.status === "reviewing" || r.status === "draft",
  );

  const pendingProposals = proposals.filter(
    (p) =>
      p.status === "submitted" ||
      p.status === "viewed" ||
      p.status === "shortlisted" ||
      p.status === "clarification_requested" ||
      p.status === "negotiating",
  );

  const savedProviders = providers.slice(0, 4);

  return (
    <div className={styles.dashboardPage}>
      {/* 1. Header Row with Title and Matching Top-Right Action Pill Buttons */}
      <div className={styles.dashboardHeaderRow}>
        <div className={styles.dashboardHeaderLeft}>
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

      {/* 2. Telemetry KPI Metric Cards */}
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

        {/* Metric 2: Open Requests */}
        <div
          className={`${styles.dashboardMetricCard} ${activeTab === "requests" ? styles.dashboardMetricCardActive : ""}`}
          onClick={() => setActiveTab(activeTab === "requests" ? "all" : "requests")}
          role="button"
          tabIndex={0}
          title="Filter to Open Requests"
        >
          <div className={styles.dashboardMetricTop}>
            <span className={styles.dashboardMetricLabel}>Open Requests</span>
            <div className={styles.dashboardMetricIconWrap}>
              <DocumentsDuotoneIcon size={14} aria-hidden="true" />
            </div>
          </div>
          <span className={styles.dashboardMetricVal}>{openRequirements.length}</span>
          <span className={styles.dashboardMetricSub}>
            <span className="sr-only">Open Requirements </span>
            {openRequirements.length} open for proposals
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
            <Link
              href={
                projectId
                  ? `/basics/engagements/${approvalPendingEngagements[0].id}?projectId=${projectId}`
                  : `/basics/engagements/${approvalPendingEngagements[0].id}`
              }
              className={styles.orderApprovalActionBtn}
            >
              <span>Review & Approve</span>
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
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

      {/* 3. Operational Filter Tabs */}
      <div className={styles.dashboardTabsRow} role="tablist" aria-label="Basics sections">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "all"}
          className={`${styles.dashboardTabBtn} ${activeTab === "all" ? styles.dashboardTabBtnActive : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Overview
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "orders"}
          className={`${styles.dashboardTabBtn} ${activeTab === "orders" ? styles.dashboardTabBtnActive : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          Active Orders ({activeEngagements.length})
          {approvalPendingEngagements.length > 0 ? (
            <span
              style={{
                display: "inline-block",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#f59e0b",
              }}
              title={`${approvalPendingEngagements.length} awaiting approval`}
            />
          ) : null}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "requests"}
          className={`${styles.dashboardTabBtn} ${activeTab === "requests" ? styles.dashboardTabBtnActive : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          Open Requests ({openRequirements.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "proposals"}
          className={`${styles.dashboardTabBtn} ${activeTab === "proposals" ? styles.dashboardTabBtnActive : ""}`}
          onClick={() => setActiveTab("proposals")}
        >
          Pending Proposals ({pendingProposals.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "finance"}
          className={`${styles.dashboardTabBtn} ${activeTab === "finance" ? styles.dashboardTabBtnActive : ""}`}
          onClick={() => setActiveTab("finance")}
        >
          <Wallet size={13} aria-hidden="true" />
          Finance of Basics
        </button>
      </div>

      {/* 4. Main Dashboard Operations Layout */}
      <div className={styles.dashboardMainLayout}>
        {/* Left Column: Live Engagements, Requirements, Proposals & Finance */}
        <div className={styles.dashboardColMain}>
          {/* Active Orders / Engagements */}
          {activeTab === "all" || activeTab === "orders" ? (
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

          {/* Open Requests & Scopes */}
          {activeTab === "all" || activeTab === "requests" ? (
            <section className={styles.dashboardCard} aria-labelledby="open-requirements-heading">
              <div className={styles.dashboardCardHeader}>
                <div className={styles.dashboardCardTitleGroup}>
                  <h2 id="open-requirements-heading" className={styles.dashboardCardTitle}>Open Requests & Scopes</h2>
                  <span className={styles.dashboardCardBadge}>{requirements.length}</span>
                </div>
                <Link
                  href={projectId ? `/basics/requirements?projectId=${projectId}` : "/basics/requirements"}
                  className={styles.dashboardViewAllLink}
                >
                  <span>View all</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>

              {requirements.length === 0 ? (
                <BasicsEmptyState
                  title="No requirements posted"
                  description="Publish your first scope to invite bids from verified specialists."
                  actionLabel="Post a Requirement"
                  href="/basics/requirements/new"
                />
              ) : (
                <div className={styles.dashboardList}>
                  {requirements.slice(0, 4).map((req) => {
                    const budgetAmount = req.budgetMax ?? req.budgetMin;
                    return (
                      <Link
                        key={req.id}
                        href={`/basics/requirements/${req.id}${projectId ? `?projectId=${projectId}` : ""}`}
                        className={styles.dashboardListItem}
                      >
                        <div className={styles.dashboardItemInfo}>
                          <span className={styles.dashboardItemTitle}>{req.title}</span>
                          <div className={styles.dashboardItemMeta}>
                            <span>Discipline: <strong>{req.specialization || req.category}</strong></span>
                            <span>·</span>
                            <span>Project: {req.projectName ?? (projectId ? `Project ${projectId}` : "General")}</span>
                            <span>·</span>
                            <span>Created {formatDate(req.createdAt)}</span>
                          </div>
                        </div>
                        <div className={styles.dashboardItemRight}>
                          {budgetAmount ? (
                            <div className={styles.dashboardItemFee}>
                              {formatCurrency(budgetAmount, req.currency ?? "INR")}
                            </div>
                          ) : null}
                          <BasicsStatusBadge status={req.status} />
                          <ChevronRight size={15} color="#94a3b8" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          ) : null}

          {/* Pending Proposals */}
          {activeTab === "all" || activeTab === "proposals" ? (
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

        {/* Right Column: Quick Actions & Discipline Hub */}
        <div className={styles.dashboardColSide}>
          {/* Quick Actions Panel */}
          <section className={styles.dashboardCard} aria-labelledby="quick-actions-heading">
            <div className={styles.dashboardCardHeader}>
              <h2 id="quick-actions-heading" className={styles.dashboardCardTitle}>Quick Operations</h2>
            </div>
            <div className={styles.dashboardActionBtnGroup}>
              <Link
                href={projectId ? `/basics/requirements/new?projectId=${projectId}` : "/basics/requirements/new"}
                className={styles.primaryButton}
                style={{ width: "100%", justifyContent: "center", height: "38px", fontSize: "13px" }}
              >
                <Plus size={15} aria-hidden="true" />
                <span>Post a Requirement</span>
              </Link>
              {approvalPendingEngagements.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setActiveTab("orders")}
                  className={styles.dashboardSideActionBtnHighlight}
                  title="Review pending order approvals"
                >
                  <Bell size={14} aria-hidden="true" />
                  <span>Order Approvals ({approvalPendingEngagements.length})</span>
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className={styles.dashboardSideActionBtn}
                title="Filter to Active Orders"
              >
                <ShoppingBag size={15} aria-hidden="true" />
                <span>Track Active Orders ({activeEngagements.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("proposals")}
                className={styles.dashboardSideActionBtn}
                title="Filter to Pending Proposals"
              >
                <Sparkles size={15} aria-hidden="true" />
                <span>Review Pending Proposals ({pendingProposals.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("finance")}
                className={styles.dashboardSideActionBtn}
                title="Inspect Basics Finance & Escrow"
              >
                <Wallet size={15} aria-hidden="true" />
                <span>Basics Finance & Escrow</span>
              </button>
              <Link
                href={projectId ? `/basics/experts?projectId=${projectId}` : "/basics/experts"}
                className={styles.dashboardSideActionBtn}
              >
                <StudioDuotoneIcon size={16} aria-hidden="true" />
                <span>Browse Specialists Directory</span>
              </Link>
              <Link
                href={projectId ? `/basics/experts/compare?projectId=${projectId}` : "/basics/experts/compare"}
                className={styles.dashboardSideActionBtn}
              >
                <Layers size={15} aria-hidden="true" />
                <span>Compare Shortlisted Experts</span>
              </Link>
            </div>
          </section>

          {/* Discipline Directory Navigation */}
          <section className={styles.dashboardCard} aria-labelledby="disciplines-heading">
            <div className={styles.dashboardCardHeader}>
              <h2 id="disciplines-heading" className={styles.dashboardCardTitle}>Discipline Coverage</h2>
              <span className={styles.dashboardCardBadge}>7 Active</span>
            </div>
            <div className={styles.dashboardDisciplineWrap}>
              {[
                { label: "MEP Engineering", query: "MEP", icon: EnergyDuotoneIcon, color: "#0284c7" },
                { label: "Structural Design", query: "Structural", icon: BuildingIcon, color: "#16a34a" },
                { label: "3D BIM Coordination", query: "BIM", icon: LayersDuotoneIcon, color: "#9333ea" },
                { label: "Architecture", query: "Architecture", icon: BuildingIcon, color: "#e11d48" },
                { label: "Fire Safety", query: "Fire", icon: Shield, color: "#ea580c" },
                { label: "Geotechnical", query: "Geotechnical", icon: Cpu, color: "#0d9488" },
                { label: "Cost & QS", query: "Cost", icon: Zap, color: "#ca8a04" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={`/basics/experts?q=${encodeURIComponent(item.query)}${projectId ? `&projectId=${projectId}` : ""}`}
                  className={styles.dashboardDisciplineChip}
                >
                  <item.icon size={13} style={{ color: item.color }} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Saved Specialists */}
          <section className={styles.dashboardCard} aria-labelledby="saved-experts-heading">
            <div className={styles.dashboardCardHeader}>
              <h2 id="saved-experts-heading" className={styles.dashboardCardTitle}>Featured Specialists</h2>
              <Link
                href={projectId ? `/basics/experts?projectId=${projectId}` : "/basics/experts"}
                className={styles.dashboardViewAllLink}
              >
                <span>Directory</span>
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
            <div className={styles.dashboardList}>
              {savedProviders.map((prov) => (
                <Link
                  key={prov.id}
                  href={`/basics/experts/${prov.id}${projectId ? `?projectId=${projectId}` : ""}`}
                  className={styles.dashboardListItem}
                >
                  <div className={styles.dashboardItemInfo}>
                    <span className={styles.dashboardItemTitle}>{prov.name}</span>
                    <span className={styles.dashboardItemMeta}>
                      {prov.specializations[0]} · {prov.location.city}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "12px", fontWeight: 700, color: "#854d0e" }}>
                    <Star size={12} fill="#eab308" color="#eab308" />
                    <span>{prov.rating}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
