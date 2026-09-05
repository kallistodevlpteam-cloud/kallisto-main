"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  HardHat,
  MapPin,
  Star,
  UserPlus,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { RupeeIcon } from "@/components/layout/sidebar-icons";
import { useRef } from "react";
import type { Deployment, HandsTab } from "../types/hands.types";
import {
  formatAttendance,
  formatInr,
} from "../utils/hands-formatters";
import { useDrawerBehaviour } from "./use-drawer-behaviour";
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

interface DeploymentDetailsDrawerProps {
  deployment: Deployment;
  onClose: () => void;
  onNavigateTab: (tab: HandsTab) => void;
  onRequestWorkers?: (deployment: Deployment) => void;
}

export function DeploymentDetailsDrawer({
  deployment,
  onClose,
  onNavigateTab,
  onRequestWorkers,
}: DeploymentDetailsDrawerProps) {
  const panelRef = useRef<HTMLElement>(null);
  useDrawerBehaviour(panelRef, onClose);

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
        status: (deployment.attendance.state === "recorded"
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

  const contractors =
    deployment.contractors && deployment.contractors.length > 0
      ? deployment.contractors.map((c) =>
          typeof c === "string" ? { name: c } : c,
        )
      : deployment.contractorName
        ? [{ name: deployment.contractorName }]
        : [];

  const activity = deployment.todayActivity || defaultActivity;

  return (
    <div
      className={styles.drawerBackdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <aside
        ref={panelRef}
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="deployment-drawer-title"
        aria-describedby="deployment-drawer-description"
        tabIndex={-1}
      >
        <header className={styles.drawerHeader}>
          <div>
            <p>Active deployment</p>
            <h2 id="deployment-drawer-title">{deployment.projectName}</h2>
            <span id="deployment-drawer-description">
              {deployment.location}
            </span>
          </div>
          <button
            type="button"
            className={styles.drawerCloseButton}
            aria-label="Close deployment details"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className={styles.drawerBody}>
          <div className={styles.drawerStatusRow}>
            <span className={`${styles.statusBadge} ${statusClass}`}>
              <span className={styles.statusDot} aria-hidden="true" />
              {deployment.status}
            </span>
            <span>
              {deployment.startDate} – {deployment.endDate}
            </span>
          </div>

          <section
            className={styles.detailSection}
            aria-labelledby="deployment-assignment-title"
          >
            <h3 id="deployment-assignment-title">Site assignment</h3>
            <dl className={styles.detailList}>
              <div>
                <dt>
                  <MapPin size={15} aria-hidden="true" />
                  Project site
                </dt>
                <dd>
                  {deployment.projectName}, {deployment.location}
                </dd>
              </div>
              {contractors.length > 0 ? (
                <div>
                  <dt>
                    <Building2 size={15} aria-hidden="true" />
                    {contractors.length > 1
                      ? `Contractors (${contractors.length})`
                      : "Contractor"}
                  </dt>
                  <dd>
                    {contractors
                      .map(
                        (c) =>
                          `${c.name}${
                            c.trade || c.workerCount
                              ? ` (${c.workerCount ? `${c.workerCount} ` : ""}${
                                  c.trade || ""
                                })`
                              : ""
                          }`,
                      )
                      .join(", ")}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt>
                  <HardHat size={15} aria-hidden="true" />
                  Workforce
                </dt>
                <dd>{deployment.workforce}</dd>
              </div>
              <div>
                <dt>
                  <CalendarClock size={15} aria-hidden="true" />
                  Shift
                </dt>
                <dd>{deployment.shift}</dd>
              </div>
              <div>
                <dt>
                  <UserRound size={15} aria-hidden="true" />
                  Supervisor
                </dt>
                <dd>{deployment.supervisor}</dd>
              </div>
              <div>
                <dt>Attendance today</dt>
                <dd>{formatAttendance(deployment.attendance)}</dd>
              </div>
              <div>
                <dt>
                  <RupeeIcon size={15} aria-hidden="true" />
                  Daily cost
                </dt>
                <dd>{formatInr(deployment.dailyCost)}</dd>
              </div>
            </dl>
          </section>

          {/* Assigned Labour Contractors Section */}
          {contractors.length > 0 && (
            <section
              className={`${styles.detailSection} ${styles.contractorsSection}`}
              aria-labelledby="deployment-contractors-title"
            >
              <div className={styles.sectionHeaderRow}>
                <h3 id="deployment-contractors-title">
                  {contractors.length > 1
                    ? `Labour Contractor Profiles (${contractors.length})`
                    : "Labour Contractor Profile"}
                </h3>
                <span className={styles.contractorCountPill}>
                  <Users size={12} aria-hidden="true" />
                  {contractors.length} {contractors.length > 1 ? "contractors" : "contractor"}
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
                            <h4 className={styles.contractorName}>{c.name}</h4>
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
                                size={11}
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
                          href={`/hands/trades/${crewId}`}
                          className={styles.contractorViewProfileBtn}
                          title={`View full profile for ${c.name}`}
                        >
                          <span>View Contractor Profile</span>
                          <ArrowRight size={13} aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {hasShortfall ? (
            <div className={styles.drawerNotice} role="status">
              <div className={styles.drawerNoticeContent}>
                <AlertTriangle
                  size={16}
                  className={styles.drawerNoticeIcon}
                  aria-hidden="true"
                />
                <div className={styles.drawerNoticeText}>
                  <p>
                    Two workers have not checked in. Review today&apos;s attendance
                    before confirming the daily record.
                  </p>
                  {onRequestWorkers ? (
                    <button
                      type="button"
                      className={styles.noticeActionBtn}
                      onClick={() => onRequestWorkers(deployment)}
                    >
                      <UserPlus size={13} aria-hidden="true" />
                      Request replacement / extra workers
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {/* Today's Activity Section */}
          <section
            className={`${styles.detailSection} ${styles.activitySection}`}
            aria-labelledby="deployment-activity-title"
          >
            <div className={styles.sectionHeaderRow}>
              <h3 id="deployment-activity-title">Today&apos;s activity</h3>
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
                <h4 className={styles.activityHeadline}>{activity.headline}</h4>
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
                            <CheckCircle2 size={13} />
                          ) : task.status === "in-progress" ? (
                            <Clock size={13} />
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
        </div>

        <footer className={styles.drawerFooter}>
          {onRequestWorkers ? (
            <button
              type="button"
              className={styles.drawerRequestWorkersBtn}
              onClick={() => onRequestWorkers(deployment)}
              title={`Request additional workers for ${deployment.projectName}`}
            >
              <UserPlus size={14} aria-hidden="true" />
              Request workers
            </button>
          ) : null}
          <div className={styles.drawerFooterActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => {
                onClose();
                onNavigateTab("deployments");
              }}
            >
              View deployment
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => {
                onClose();
                onNavigateTab("attendance");
              }}
            >
              Record attendance
            </button>
          </div>
        </footer>
      </aside>
    </div>
  );
}
