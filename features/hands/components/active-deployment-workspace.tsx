"use client";

import React, { useState } from "react";
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
  Clock,
  ExternalLink,
  Eye,
  HardHat,
  MapPin,
  Plus,
  ShieldCheck,
  Star,
  UserPlus,
  Users,
} from "lucide-react";
import { RupeeIcon } from "@/components/layout/sidebar-icons";
import type {
  ContractorPaymentRecord,
  Deployment,
  WorkerTrade,
  WorkforceRequestDraft,
} from "../types/hands.types";
import { formatAttendance, formatInr } from "../utils/hands-formatters";
import { WorkforceRequestDrawer } from "./workforce-request-drawer";
import { ContractorPaymentModal } from "./contractor-payment-modal";
import { ProjectUpdatesCard } from "./project-updates-card";
import styles from "./hands-overview.module.css";

function getContractorBrandVisual(name: string) {
  const n = name.toLowerCase();
  if (n.includes("apex")) return { initials: "AP", bg: "#ea580c", text: "#ffffff" };
  if (n.includes("malabar")) return { initials: "MS", bg: "#0d9488", text: "#ffffff" };
  if (n.includes("chroma")) return { initials: "CF", bg: "#e11d48", text: "#ffffff" };
  if (n.includes("circuit")) return { initials: "CM", bg: "#0284c7", text: "#ffffff" };
  if (n.includes("forma")) return { initials: "FW", bg: "#d97706", text: "#ffffff" };
  if (n.includes("heritage")) return { initials: "HJ", bg: "#7c3aed", text: "#ffffff" };

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return { initials: initials || "LC", bg: "#334155", text: "#ffffff" };
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
  const [selectedPaymentContractor, setSelectedPaymentContractor] = useState<string>("");
  const [requestConfig, setRequestConfig] = useState<{
    initialProjectId?: string;
    initialTrade?: WorkerTrade | string;
    initialWorkerCount?: number | string;
    initialValues?: Partial<WorkforceRequestDraft>;
  } | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<
    "overview" | "contractors" | "activity" | "transactions"
  >("overview");

  const contractors =
    deployment.contractors && deployment.contractors.length > 0
      ? deployment.contractors.map((c) =>
          typeof c === "string" ? { name: c } : c,
        )
      : deployment.contractorName
        ? [{ name: deployment.contractorName }]
        : [];

  const [transactions, setTransactions] = useState<ContractorPaymentRecord[]>(() => [
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

  const defaultActivity = {
    headline: `${deployment.workforce} active shift`,
    description: `Executing daily scheduled site operations under supervisor ${deployment.supervisor}.`,
    tasks: [
      {
        id: "task-1",
        title: `Site work execution (${deployment.workforce})`,
        status: (deployment.status === "Active" || deployment.status === "Needs attention"
          ? "in-progress"
          : "pending") as "in-progress" | "pending" | "completed",
        time: deployment.shift,
        trade: deployment.workforce,
      },
      {
        id: "task-2",
        title: "Daily supervisor attendance muster and verification",
        status: (deployment.attendance?.state === "recorded"
          ? "completed"
          : "in-progress") as "in-progress" | "pending" | "completed",
        time: "End of shift",
        trade: deployment.supervisor,
      },
    ],
    siteLog: deployment.workerUpdate
      ? `Supervisor ${deployment.supervisor} update: ${deployment.workerUpdate}`
      : `Supervisor ${deployment.supervisor} assigned for ${deployment.shift} shift coordination.`,
    loggedAt: "Today, active shift",
  };

  const activity = deployment.todayActivity || defaultActivity;
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
              Today&apos;s Activity
            </button>
            <button
              type="button"
              className={`${styles.subTabButton} ${
                activeSubTab === "transactions" ? styles.subTabActive : ""
              }`}
              onClick={() => setActiveSubTab("transactions")}
            >
              Transactions ({transactions.length})
            </button>
          </nav>

          {/* ── Shortfall Alert Banner ── */}
          {hasShortfall && (
            <div className={styles.drawerNotice} role="status" style={{ margin: "0 0 24px 0" }}>
              <div className={styles.drawerNoticeContent}>
                <AlertTriangle
                  size={18}
                  className={styles.drawerNoticeIcon}
                  aria-hidden="true"
                />
                <div className={styles.drawerNoticeText}>
                  <p style={{ fontSize: "14px", fontWeight: 600 }}>
                    Attendance Shortfall Alert — {deployment.projectName}
                  </p>
                  <p>
                    Two workers have not checked in for today&apos;s shift. Review today&apos;s attendance or request replacement workers to keep site execution on schedule.
                  </p>
                  <button
                    type="button"
                    className={styles.noticeActionBtn}
                    onClick={handleOpenRequest}
                    style={{ marginTop: "8px" }}
                  >
                    <UserPlus size={14} aria-hidden="true" />
                    Request Replacement / Extra Workers
                  </button>
                </div>
              </div>
            </div>
          )}
          {(activeSubTab === "overview" || activeSubTab === "contractors") && (
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

              <div className={styles.contractorCardsList}>
                {contractors.map((c, idx) => {
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

                  return (
                    <div
                      key={c.id || idx}
                      className={styles.contractorProfileCard}
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
                        <Link
                          href={tradeProfileUrl}
                          className={styles.contractorViewProfileBtn}
                          title={`View full profile for ${c.name}`}
                        >
                          <span>View Contractor Profile</span>
                          <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {(activeSubTab === "overview" || activeSubTab === "activity") && (
            <section
              className={`${styles.sectionCard} ${styles.activitySection}`}
              aria-labelledby="deployment-page-activity-heading"
            >
              <div className={styles.sectionHeaderRow}>
                <h2 id="deployment-page-activity-heading" className={styles.sectionTitle}>
                  <Clock size={18} aria-hidden="true" />
                  Today&apos;s Site Activity & Supervisor Log
                </h2>
                <span className={styles.activityBadge}>
                  <span className={styles.activityDot} aria-hidden="true" />
                  {activity.tasks?.some((t) => t.status === "in-progress")
                    ? "Shift in progress"
                    : activity.tasks?.some((t) => t.status === "completed")
                      ? "Active tasks"
                      : "Scheduled"}
                </span>
              </div>

              <div className={styles.activityCard}>
                <div className={styles.activityHeadRow}>
                  <h3 className={styles.activityHeadline}>{activity.headline}</h3>
                  {activity.description ? (
                    <p className={styles.activityDescription}>
                      {activity.description}
                    </p>
                  ) : null}
                </div>

                {activity.tasks && activity.tasks.length > 0 ? (
                  <div className={styles.activityTaskList}>
                    {activity.tasks.map((task) => {
                      const taskStatusClass =
                        task.status === "completed"
                          ? styles.taskStatusCompleted
                          : task.status === "in-progress"
                            ? styles.taskStatusInProgress
                            : styles.taskStatusPending;

                      const pillClass =
                        task.status === "completed"
                          ? styles.taskPillCompleted
                          : task.status === "in-progress"
                            ? styles.taskPillInProgress
                            : styles.taskPillPending;

                      const statusLabel =
                        task.status === "completed"
                          ? "Completed"
                          : task.status === "in-progress"
                            ? "In progress"
                            : "Scheduled";

                      return (
                        <div key={task.id} className={styles.activityTaskItem}>
                          <span
                            className={`${styles.taskStatusIcon} ${taskStatusClass}`}
                            aria-hidden="true"
                          >
                            {task.status === "completed" ? (
                              <CheckCircle2 size={15} />
                            ) : task.status === "in-progress" ? (
                              <Clock size={15} />
                            ) : (
                              <span className={styles.taskBulletDot} />
                            )}
                          </span>
                          <div className={styles.activityTaskDetails}>
                            <strong className={styles.activityTaskTitle}>
                              {task.title}
                            </strong>
                            <div className={styles.activityTaskMeta}>
                              {task.trade ? <span>{task.trade}</span> : null}
                              {task.time ? <span>• {task.time}</span> : null}
                              <span className={`${styles.taskStatusPill} ${pillClass}`}>
                                {statusLabel}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                {activity.siteLog ? (
                  <div className={styles.activitySiteLog}>
                    <div className={styles.siteLogHeader}>
                      <span className={styles.siteLogTitle}>Site supervisor log</span>
                      {activity.loggedAt ? (
                        <span className={styles.siteLogTime}>
                          {activity.loggedAt}
                        </span>
                      ) : null}
                    </div>
                    <p className={styles.siteLogText}>{activity.siteLog}</p>
                  </div>
                ) : null}
              </div>
            </section>
          )}

          {(activeSubTab === "overview" || activeSubTab === "transactions") && (
            <section
              className={`${styles.sectionCard} ${styles.transactionsSection}`}
              aria-labelledby="deployment-page-transactions-heading"
            >
              <div className={styles.sectionHeaderRow}>
                <div>
                  <h2 id="deployment-page-transactions-heading" className={styles.sectionTitle}>
                    <RupeeIcon size={18} aria-hidden="true" />
                    Labour Payouts & Verified Transactions
                  </h2>
                  <p className={styles.sectionSubTitle}>
                    Direct contractor payment receipts, Bank UTR & UPI settlement audit log for {deployment.projectName}
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => {
                    setSelectedPaymentContractor(
                      contractors[0]?.name || deployment.contractorName || "Apex Integrated Civil",
                    );
                    setPaymentModalOpen(true);
                  }}
                >
                  <RupeeIcon size={14} aria-hidden="true" />
                  <span>Pay Contractor</span>
                </button>
              </div>

              <div className={styles.transactionsListWrap}>
                {transactions.map((tx) => (
                  <div key={tx.id} className={styles.transactionCardRow}>
                    <div className={styles.transactionMainInfo}>
                      <div className={styles.transactionIconBadge}>
                        <RupeeIcon size={16} aria-hidden="true" />
                      </div>
                      <div>
                        <strong className={styles.transactionContractorName}>
                          {tx.contractorName}
                        </strong>
                        <div className={styles.transactionMetaLine}>
                          <span className={styles.transactionMethodBadge}>
                            {tx.paymentMethod === "bank_transfer"
                              ? "Bank Transfer (NEFT/UTR)"
                              : "UPI Transfer"}
                          </span>
                          <span className={styles.transactionRefText}>
                            Ref: {tx.bankDetails?.utrReference || tx.upiDetails?.transactionId || tx.id}
                          </span>
                          <span className={styles.transactionTimeText}>{tx.paidAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.transactionRightCol}>
                      <div className={styles.transactionAmountBadge}>
                        ₹{tx.totalAmount.toLocaleString("en-IN")}
                        <span className={styles.transactionWorkersSub}>
                          for {tx.workerCount} workers
                        </span>
                      </div>
                      <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                        <ShieldCheck size={12} aria-hidden="true" />
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
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
          }}
        />
      )}
    </div>
  );
}
