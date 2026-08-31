"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  MessageSquare,
  FileText,
  CheckSquare,
  Sparkles,
  Layers,
  Users,
  HardHat,
  Package,
} from "lucide-react";
import styles from "./project-overview-activity-sections.module.css";

interface ProjectOverviewActivitySectionsProps {
  projectId?: string;
}

export function ProjectOverviewActivitySections({
  projectId = "proj-001",
}: ProjectOverviewActivitySectionsProps) {
  return (
    <div className={styles.container} aria-label="Project Activity Command Center">
      {/* ── 1. PROJECT PROGRESS ─────────────────────────────────── */}
      <section className={styles.card} aria-label="Project Progress">
        <h3 className={styles.sectionTitle}>
          <span>PROJECT PROGRESS</span>
          <span className={styles.sectionBadge}>Interior Design Phase</span>
        </h3>

        <div className={styles.progressTopRow}>
          <span className={styles.progressLabel}>Overall Progress</span>
          <span className={styles.progressPercent}>42%</span>
        </div>

        <div className={styles.progressBarTrack} role="progressbar" aria-valuenow={42} aria-valuemin={0} aria-valuemax={100}>
          <div className={styles.progressBarFill} style={{ width: "42%" }} />
        </div>

        <div className={styles.phaseStepper}>
          <div className={styles.stepperItem}>
            <span className={styles.stepperName}>Planning</span>
            <span className={styles.stepperBadgeCompleted}>
              ✓ Completed
            </span>
          </div>

          <div className={styles.stepperItem}>
            <span className={styles.stepperName}>Design</span>
            <span className={styles.stepperBadgeInProgress}>
              ● In Progress
            </span>
          </div>

          <div className={styles.stepperItem}>
            <span className={styles.stepperName}>Execution</span>
            <span className={styles.stepperBadgeUpcoming}>
              ○ Upcoming
            </span>
          </div>

          <div className={styles.stepperItem}>
            <span className={styles.stepperName}>Handover</span>
            <span className={styles.stepperBadgeUpcoming}>
              ○ Upcoming
            </span>
          </div>
        </div>

        <div className={styles.progressMetaStrip}>
          <div className={styles.progressMetaItem}>
            <span>Current Phase:</span>
            <strong>Interior Design</strong>
          </div>
          <div className={styles.progressMetaItem}>
            <span>Next Milestone:</span>
            <strong>MEP Coordination</strong>
          </div>
          <div className={styles.dueChip}>
            <Clock size={12} />
            <span>Due in 4 days</span>
          </div>
        </div>
      </section>

      {/* ── 2. TODAY'S ACTIVITY + PENDING REVIEW ───────────────── */}
      <div className={styles.twoColGrid}>
        {/* Left: TODAY'S ACTIVITY */}
        <section className={styles.card} aria-label="Today's Activity">
          <h3 className={styles.sectionTitle}>
            <span>TODAY&apos;S ACTIVITY</span>
          </h3>

          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <span className={styles.statBoxNum}>08</span>
              <span className={styles.statBoxLabel}>Active Tasks</span>
            </div>
            <div className={styles.statBox}>
              <span className={`${styles.statBoxNum} ${styles.statBoxNumCompleted}`}>05</span>
              <span className={styles.statBoxLabel}>Completed</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statBoxNum}>03</span>
              <span className={styles.statBoxLabel}>Pending</span>
            </div>
            <div className={styles.statBox}>
              <span className={`${styles.statBoxNum} ${styles.statBoxNumOverdue}`}>01</span>
              <span className={styles.statBoxLabel}>Overdue</span>
            </div>
          </div>

          <div className={styles.taskList}>
            <div className={styles.taskItem}>
              <span className={styles.taskItemName}>MEP layout review</span>
              <span className={styles.stepperBadgeInProgress}>In Progress</span>
            </div>
            <div className={styles.taskItem}>
              <span className={styles.taskItemName}>Living room elevation</span>
              <span className={styles.dueChip}>Pending Review</span>
            </div>
            <div className={styles.taskItem}>
              <span className={styles.taskItemName}>Electrical point marking</span>
              <span className={styles.stepperBadgeUpcoming}>Pending</span>
            </div>
            <div className={styles.taskItem}>
              <span className={styles.taskItemName}>Marble specification approval</span>
              <span className={styles.stepperBadgeCompleted}>Completed</span>
            </div>
          </div>

          <Link href={`/projects/${projectId}/tasks`} className={styles.footerLink}>
            <span>View all tasks</span>
            <ArrowRight size={13} />
          </Link>
        </section>

        {/* Right: PENDING REVIEW & REQUESTS */}
        <section className={styles.card} aria-label="Pending Review & Requests">
          <h3 className={styles.sectionTitle}>
            <span>PENDING REVIEW &amp; REQUESTS</span>
          </h3>

          <div className={styles.alertBanner}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>3 items require your attention</span>
          </div>

          <div className={styles.reviewList}>
            <div className={styles.reviewItem}>
              <span className={styles.reviewItemLabel}>Task Reviews</span>
              <span className={styles.reviewItemCount}>02</span>
            </div>
            <div className={styles.reviewItem}>
              <span className={styles.reviewItemLabel}>Client Requests</span>
              <span className={styles.reviewItemCount}>01</span>
            </div>
            <div className={styles.reviewItem}>
              <span className={styles.reviewItemLabel}>Approval Requests</span>
              <span className={styles.reviewItemCount}>02</span>
            </div>
            <div className={styles.reviewItem}>
              <span className={styles.reviewItemLabel}>BOQ / Quote Requests</span>
              <span className={styles.reviewItemCount}>01</span>
            </div>
          </div>

          <Link href={`/projects/${projectId}/approvals`} className={styles.footerLink}>
            <span>Review all</span>
            <ArrowRight size={13} />
          </Link>
        </section>
      </div>

      {/* ── 3. PROJECT TIMELINE ─────────────────────────────────── */}
      <section className={styles.card} aria-label="Project Timeline">
        <h3 className={styles.sectionTitle}>
          <span>PROJECT TIMELINE</span>
          <span className={styles.sectionBadge}>6 Milestones</span>
        </h3>

        <div className={styles.timelineTrackHorizontal}>
          <div className={styles.timelineCardNode}>
            <div className={styles.timelineNodeTitleRow}>
              <span style={{ color: "#16a34a" }}>✓</span>
              <span>Project Brief</span>
            </div>
            <span className={styles.timelineNodeMeta}>Completed · 12 May</span>
          </div>

          <div className={styles.timelineCardNode}>
            <div className={styles.timelineNodeTitleRow}>
              <span style={{ color: "#16a34a" }}>✓</span>
              <span>Site Assessment</span>
            </div>
            <span className={styles.timelineNodeMeta}>Completed · 18 May</span>
          </div>

          <div className={styles.timelineCardNode}>
            <div className={styles.timelineNodeTitleRow}>
              <span style={{ color: "#16a34a" }}>✓</span>
              <span>Concept Design</span>
            </div>
            <span className={styles.timelineNodeMeta}>Completed · 28 May</span>
          </div>

          <div className={`${styles.timelineCardNode} ${styles.timelineCardNodeActive}`}>
            <div className={styles.timelineNodeTitleRow}>
              <span style={{ color: "#7c3aed" }}>●</span>
              <span>Interior Design</span>
            </div>
            <span className={styles.timelineNodeMeta}>In Progress · 65%</span>
          </div>

          <div className={styles.timelineCardNode}>
            <div className={styles.timelineNodeTitleRow}>
              <span style={{ color: "#94a3b8" }}>○</span>
              <span>MEP Coordination</span>
            </div>
            <span className={styles.timelineNodeMeta}>Upcoming · 04 Sep</span>
          </div>

          <div className={styles.timelineCardNode}>
            <div className={styles.timelineNodeTitleRow}>
              <span style={{ color: "#94a3b8" }}>○</span>
              <span>Execution</span>
            </div>
            <span className={styles.timelineNodeMeta}>Upcoming · 20 Sep</span>
          </div>
        </div>

        <Link href={`/projects/${projectId}/timeline`} className={styles.footerLink}>
          <span>View Full Timeline</span>
          <ArrowRight size={13} />
        </Link>
      </section>

      {/* ── 4. HANDS / LABOUR + ACTIVE TEAM ─────────────────────── */}
      <div className={styles.twoColGrid}>
        {/* Left: HANDS */}
        <section className={styles.card} aria-label="Hands Project Labour">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "4px" }}>
            <h3 className={styles.sectionTitle} style={{ margin: 0 }}>
              <span>HANDS</span>
            </h3>
            <span className={styles.sectionBadge}>₹16,850 Today&apos;s Spend</span>
          </div>

          <div className={styles.statsRow} style={{ marginTop: "10px" }}>
            <div className={styles.statBox}>
              <span className={styles.statBoxNum}>24</span>
              <span className={styles.statBoxLabel}>Total Labour</span>
            </div>
            <div className={styles.statBox}>
              <span className={`${styles.statBoxNum} ${styles.statBoxNumCompleted}`}>18</span>
              <span className={styles.statBoxLabel}>Active Today</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statBoxNum}>04</span>
              <span className={styles.statBoxLabel}>On Leave</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statBoxNum}>02</span>
              <span className={styles.statBoxLabel}>Not Assigned</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>
            <span>ACTIVE TODAY (18 WORKERS)</span>
            <span style={{ color: "#15803d", fontWeight: 700 }}>₹16,850 / DAY</span>
          </div>

          <div className={styles.labourTradesGrid}>
            <div className={styles.tradePill}>
              <span>Mason (06)</span>
              <strong>₹5,400</strong>
            </div>
            <div className={styles.tradePill}>
              <span>Carpenter (04)</span>
              <strong>₹3,600</strong>
            </div>
            <div className={styles.tradePill}>
              <span>Electrician (03)</span>
              <strong>₹2,700</strong>
            </div>
            <div className={styles.tradePill}>
              <span>Plumber (02)</span>
              <strong>₹1,800</strong>
            </div>
            <div className={styles.tradePill}>
              <span>Painter (03)</span>
              <strong>₹2,400</strong>
            </div>
            <div className={styles.tradePill}>
              <span>Other (03)</span>
              <strong>₹2,100</strong>
            </div>
          </div>

          <div className={styles.labourStatusBar}>
            <span>18 / 24 active today (75% on-site)</span>
            <span style={{ fontWeight: 700, color: "#15803d" }}>Today&apos;s Labour Spend: ₹16,850</span>
          </div>

          <Link href="/partner/hands" className={styles.footerLink}>
            <span>View Hands</span>
            <ArrowRight size={13} />
          </Link>
        </section>

        {/* Right: ACTIVE PROJECT TEAM */}
        <section className={styles.card} aria-label="Active Project Team">
          <h3 className={styles.sectionTitle}>
            <span>ACTIVE PROJECT TEAM</span>
            <span className={styles.sectionBadge}>08 Members</span>
          </h3>

          <div className={styles.teamList}>
            <div className={styles.teamMemberRow}>
              <div className={styles.teamMemberLeft}>
                <img
                  src="/assets/arjun-avatar.jpg"
                  alt="Arjun Menon"
                  className={styles.teamMemberAvatar}
                />
                <div>
                  <span className={styles.teamMemberName}>Arjun Menon</span>
                  <span className={styles.teamMemberRole}>Project Manager</span>
                </div>
              </div>
              <span className={styles.activeDotBadge}>Active</span>
            </div>

            <div className={styles.teamMemberRow}>
              <div className={styles.teamMemberLeft}>
                <img
                  src="/assets/priya-avatar.jpg"
                  alt="Priya Sharma"
                  className={styles.teamMemberAvatar}
                />
                <div>
                  <span className={styles.teamMemberName}>Priya Sharma</span>
                  <span className={styles.teamMemberRole}>Lead Architect</span>
                </div>
              </div>
              <span className={styles.activeDotBadge}>Active</span>
            </div>

            <div className={styles.teamMemberRow}>
              <div className={styles.teamMemberLeft}>
                <img
                  src="/assets/rahul-avatar.jpg"
                  alt="Rahul Nair"
                  className={styles.teamMemberAvatar}
                />
                <div>
                  <span className={styles.teamMemberName}>Rahul Nair</span>
                  <span className={styles.teamMemberRole}>Structural Engineer</span>
                </div>
              </div>
              <span className={styles.activeDotBadge}>Active</span>
            </div>

            <div className={styles.teamMemberRow}>
              <div className={styles.teamMemberLeft}>
                <img
                  src="/assets/petra-avatar.jpg"
                  alt="Anjali Thomas"
                  className={styles.teamMemberAvatar}
                />
                <div>
                  <span className={styles.teamMemberName}>Anjali Thomas</span>
                  <span className={styles.teamMemberRole}>Interior Designer</span>
                </div>
              </div>
              <span className={styles.activeDotBadge}>Active</span>
            </div>

            <div className={styles.moreMembersPill}>
              +4 more project members
            </div>
          </div>

          <Link href="/team" className={styles.footerLink}>
            <span>View Team</span>
            <ArrowRight size={13} />
          </Link>
        </section>
      </div>

      {/* ── 5. HUB + HIVE PRODUCTS ──────────────────────────────── */}
      <div className={styles.twoColGrid}>
        {/* Left: PROJECT MATERIALS */}
        <section className={styles.card} aria-label="Project Materials">
          <h3 className={styles.sectionTitle}>
            <span>PROJECT MATERIALS</span>
            <span className={styles.sectionBadge}>BOQ Linked</span>
          </h3>

          <div className={styles.materialStatsGrid}>
            <div className={styles.materialStatCard}>
              <span className={styles.materialStatNum} style={{ color: "#16a34a" }}>₹5.6L</span>
              <span className={styles.materialStatLabel}>Total Spent</span>
            </div>
            <div className={styles.materialStatCard}>
              <span className={styles.materialStatNum} style={{ color: "#7c3aed" }}>₹2.8L</span>
              <span className={styles.materialStatLabel}>Available Value</span>
            </div>
            <div className={styles.materialStatCard}>
              <span className={styles.materialStatNum} style={{ color: "#d97706" }}>₹3.6L</span>
              <span className={styles.materialStatLabel}>BOQ Required</span>
            </div>
          </div>

          <div className={styles.materialItemsList}>
            <div className={styles.materialItemCard}>
              <div className={styles.materialItemLeft}>
                <span className={styles.materialItemTitle}>Italian Marble Flooring</span>
                <span className={styles.materialItemSub}>
                  Spent: <strong>₹2.40L</strong> (850 sq ft) · Stock: <strong>₹95K</strong>
                </span>
              </div>
              <span className={`${styles.materialStatusTag} ${styles.materialTagUsed}`}>
                ₹3.35L (BOQ)
              </span>
            </div>

            <div className={styles.materialItemCard}>
              <div className={styles.materialItemLeft}>
                <span className={styles.materialItemTitle}>Structural Cement (53 Grade)</span>
                <span className={styles.materialItemSub}>
                  Spent: <strong>₹85K</strong> (120 Bags) · Stock: <strong>₹42K</strong>
                </span>
              </div>
              <span className={`${styles.materialStatusTag} ${styles.materialTagUsed}`}>
                ₹1.27L (BOQ)
              </span>
            </div>

            <div className={styles.materialItemCard}>
              <div className={styles.materialItemLeft}>
                <span className={styles.materialItemTitle}>Teak Wood Framing &amp; Joinery</span>
                <span className={styles.materialItemSub}>
                  Spent: <strong>₹1.45L</strong> (08 Units) · Stock: <strong>₹75K</strong>
                </span>
              </div>
              <span className={`${styles.materialStatusTag} ${styles.materialTagRequired}`}>
                ₹1.20L Pending
              </span>
            </div>

            <div className={styles.materialItemCard}>
              <div className={styles.materialItemLeft}>
                <span className={styles.materialItemTitle}>Conduit &amp; Electrical Wiring</span>
                <span className={styles.materialItemSub}>
                  Spent: <strong>₹90K</strong> (15 Sets) · Stock: <strong>₹68K</strong>
                </span>
              </div>
              <span className={`${styles.materialStatusTag} ${styles.materialTagRequired}`}>
                ₹1.18L Pending
              </span>
            </div>
          </div>

          <div className={styles.materialBannerNote}>
            <Package size={14} style={{ color: "#7c3aed", flexShrink: 0 }} />
            <span>₹5.6L spent of ₹12.0L allocated · ₹3.6L pending procurement in BOQ</span>
          </div>

          <Link href={`/projects/${projectId}/boq`} className={styles.footerLink}>
            <span>View BOQ Materials</span>
            <ArrowRight size={13} />
          </Link>
        </section>

        {/* Right: HIVE SERVICES */}
        <section className={styles.card} aria-label="Hive Services">
          <h3 className={styles.sectionTitle}>
            <span>HIVE SERVICES</span>
            <span className={styles.sectionBadge}>04 Services Used</span>
          </h3>

          <div className={styles.servicesList}>
            <div className={styles.serviceRow}>
              <div className={styles.serviceInfoCol}>
                <span className={styles.serviceName}>3D Architectural Rendering</span>
                <span className={styles.serviceUpdateNote}>
                  Update: <strong>4 Photorealistic Views Approved</strong>
                </span>
              </div>
              <span className={styles.stepperBadgeCompleted}>Delivered</span>
            </div>

            <div className={styles.serviceRow}>
              <div className={styles.serviceInfoCol}>
                <span className={styles.serviceName}>Structural Load &amp; FEA Stress Analysis</span>
                <span className={styles.serviceUpdateNote}>
                  Update: <strong>Foundation Load Model Verified (v1.2)</strong>
                </span>
              </div>
              <span className={styles.stepperBadgeCompleted}>Verified</span>
            </div>

            <div className={styles.serviceRow}>
              <div className={styles.serviceInfoCol}>
                <span className={styles.serviceName}>MEP BIM Routing &amp; Coordination</span>
                <span className={styles.serviceUpdateNote}>
                  Update: <strong>HVAC &amp; Electrical 65% Synced</strong>
                </span>
              </div>
              <span className={styles.stepperBadgeInProgress}>In Progress</span>
            </div>

            <div className={styles.serviceRow}>
              <div className={styles.serviceInfoCol}>
                <span className={styles.serviceName}>Site Feasibility &amp; Digital Contour Scan</span>
                <span className={styles.serviceUpdateNote}>
                  Update: <strong>ODIN Assessment Report Synchronized</strong>
                </span>
              </div>
              <span className={styles.stepperBadgeCompleted}>Delivered</span>
            </div>
          </div>

          <div className={styles.serviceValueBanner}>
            <span>4 Hive Services Engaged</span>
            <span style={{ fontWeight: 700 }}>3 of 4 Deliverables Cleared</span>
          </div>

          <Link href="/basics" className={styles.footerLink}>
            <span>View Hive Services</span>
            <ArrowRight size={13} />
          </Link>
        </section>
      </div>
    </div>
  );
}
