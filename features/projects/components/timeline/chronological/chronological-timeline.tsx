"use client";

import React, { useState } from "react";
import { ArrowRight, Check, AlertCircle, Circle, MoreHorizontal } from "lucide-react";
import {
  ProjectScheduleActivity,
  ProjectSchedulePhase,
  ProjectSchedulePermissions,
  ScheduleSummaryContext,
} from "../../../domain/project-schedule.types";
import { TimelineCategoryFilter } from "../query-state/timeline-query-schema";
import { TimelineToolbar } from "../timeline-toolbar";
import { CurrentPhaseCard } from "../sidebar/current-phase-card";
import { UpcomingMilestonesCard } from "../sidebar/upcoming-milestones-card";
import { TimelineAttentionCard } from "../sidebar/timeline-attention-card";
import styles from "./chronological-timeline.module.css";

interface ChronologicalTimelineProps {
  projectId: string;
  projectName: string;
  activities: ProjectScheduleActivity[];
  phases: ProjectSchedulePhase[];
  permissions: ProjectSchedulePermissions;
  context: ScheduleSummaryContext;
  selectedActivityId: string | null;
  categoryFilter: TimelineCategoryFilter;
  searchValue: string;
  onSelectCategory: (cat: TimelineCategoryFilter) => void;
  onSearchChange: (q: string) => void;
  onSelectActivity: (activityId: string) => void;
  onAddActivityClick: () => void;
}

export interface StructuredTimelineItem {
  id: string;
  dateStr: string;
  timeStr: string;
  title: string;
  category: "all" | "milestones" | "tasks" | "approvals" | "payments" | "site";
  phaseCategoryTag: string;
  responsibleMember: string;
  assigneeName: string;
  statusLabel: string;
  state: "completed" | "active" | "warning" | "upcoming";
  progressPct?: number;
  actionText?: string;
  warningNote?: string;
  groupId: "today" | "this_week" | "july_2026" | "june_2026" | "earlier";
  assigneeInitials?: string[];
  commentsCount?: number;
}

export function ChronologicalTimeline({
  projectId,
  projectName,
  activities,
  phases,
  permissions,
  context,
  selectedActivityId,
  categoryFilter,
  searchValue,
  onSelectCategory,
  onSearchChange,
  onSelectActivity,
  onAddActivityClick,
}: ChronologicalTimelineProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const defaultLifecycleRecords: StructuredTimelineItem[] = [
    {
      id: "rec-1",
      groupId: "today",
      dateStr: "24 JUL",
      timeStr: "5:00 PM",
      title: "Revised electrical layout submitted",
      category: "approvals",
      phaseCategoryTag: "Procurement",
      responsibleMember: "Submitted by Arun Mehta",
      assigneeName: "Arun Mehta",
      statusLabel: "Awaiting approval",
      state: "warning",
      progressPct: 40,
      actionText: "Review drawing",
      warningNote: "Decision needed before drawing dispatch",
      assigneeInitials: ["AM"],
      commentsCount: 2,
    },
    {
      id: "rec-2",
      groupId: "today",
      dateStr: "24 JUL",
      timeStr: "10:30 AM",
      title: "Foundation excavation & PCC footing",
      category: "site",
      phaseCategoryTag: "Superstructure",
      responsibleMember: "Supervised by Rahul Sharma",
      assigneeName: "Rahul Sharma",
      statusLabel: "In progress",
      state: "active",
      progressPct: 68,
      actionText: "Open report",
      assigneeInitials: ["RS"],
      commentsCount: 1,
    },
    {
      id: "rec-3",
      groupId: "this_week",
      dateStr: "28 JUL",
      timeStr: "11:00 AM",
      title: "Roof Slab Casting",
      category: "milestones",
      phaseCategoryTag: "Superstructure",
      responsibleMember: "Lead Architect: Arjun Mehta",
      assigneeName: "Arjun Mehta",
      statusLabel: "Scheduled",
      state: "upcoming",
      progressPct: 20,
      actionText: "Open milestone",
      warningNote: "Precondition: Rebar quality inspection pass",
      assigneeInitials: ["AM"],
      commentsCount: 3,
    },
    {
      id: "rec-4",
      groupId: "this_week",
      dateStr: "30 JUL",
      timeStr: "2:30 PM",
      title: "Conduit piping & electrical wall chasing",
      category: "site",
      phaseCategoryTag: "MEP",
      responsibleMember: "Assigned to Anil Kumar",
      assigneeName: "Anil Kumar",
      statusLabel: "Scheduled",
      state: "upcoming",
      progressPct: 0,
      actionText: "Open task",
      assigneeInitials: ["AK"],
    },
    {
      id: "rec-5",
      groupId: "july_2026",
      dateStr: "15 JUL",
      timeStr: "4:00 PM",
      title: "HVAC & Electrical Final Drawing Dispatch",
      category: "milestones",
      phaseCategoryTag: "Documentation",
      responsibleMember: "Dispatched by Saran & Rithvik",
      assigneeName: "Saran & Rithvik",
      statusLabel: "Completed",
      state: "completed",
      progressPct: 100,
      actionText: "Open report",
      assigneeInitials: ["SR"],
    },
    {
      id: "rec-6",
      groupId: "july_2026",
      dateStr: "10 JUL",
      timeStr: "11:30 AM",
      title: "Structural Design & Load Calculation Sign-off",
      category: "approvals",
      phaseCategoryTag: "Client approval",
      responsibleMember: "Approved by Anoop Kumar",
      assigneeName: "Anoop Kumar",
      statusLabel: "Completed",
      state: "completed",
      progressPct: 100,
      actionText: "Open report",
      assigneeInitials: ["AK"],
    },
    {
      id: "rec-7",
      groupId: "june_2026",
      dateStr: "20 JUN",
      timeStr: "9:30 AM",
      title: "Site Soil Testing & Geotechnical Audit Report",
      category: "site",
      phaseCategoryTag: "Pre-design",
      responsibleMember: "Audited by GeoLab Kerala",
      assigneeName: "GeoLab Kerala",
      statusLabel: "Completed",
      state: "completed",
      progressPct: 100,
      actionText: "Open report",
      assigneeInitials: ["GL"],
    },
    {
      id: "rec-8",
      groupId: "june_2026",
      dateStr: "05 JUN",
      timeStr: "3:00 PM",
      title: "Initial Client Consultation & Site Survey",
      category: "site",
      phaseCategoryTag: "Pre-design",
      responsibleMember: "Attended by Arjun & Anoop",
      assigneeName: "Arjun Menon",
      statusLabel: "Completed",
      state: "completed",
      progressPct: 100,
      actionText: "Open report",
      assigneeInitials: ["AM"],
    },
    {
      id: "rec-9",
      groupId: "earlier",
      dateStr: "15 MAY",
      timeStr: "12:00 PM",
      title: "Architectural Service Contract Execution",
      category: "payments",
      phaseCategoryTag: "Documentation",
      responsibleMember: "Executed by Kallisto Studio",
      assigneeName: "Kallisto Studio",
      statusLabel: "Completed",
      state: "completed",
      progressPct: 100,
      actionText: "Open task",
      assigneeInitials: ["KS"],
    },
  ];

  const filteredRecords = defaultLifecycleRecords.filter((rec) => {
    if (activeFilter !== "all") {
      if (activeFilter === "milestones" && rec.category !== "milestones") return false;
      if (activeFilter === "tasks" && rec.category !== "tasks") return false;
      if (activeFilter === "approvals" && rec.category !== "approvals") return false;
      if (activeFilter === "payments" && rec.category !== "payments") return false;
      if (activeFilter === "site" && rec.category !== "site") return false;
    }

    if (searchValue.trim()) {
      const q = searchValue.toLowerCase();
      const matchTitle = rec.title.toLowerCase().includes(q);
      const matchTag = rec.phaseCategoryTag.toLowerCase().includes(q);
      const matchResp = rec.responsibleMember.toLowerCase().includes(q);
      return matchTitle || matchTag || matchResp;
    }

    return true;
  });

  const groupHeadings = [
    { id: "today", title: "TODAY · 24 JULY", countText: "2 tasks · 1 awaiting" },
    { id: "this_week", title: "THIS WEEK", countText: "2 tasks" },
    { id: "july_2026", title: "JULY 2026", countText: "2 tasks" },
    { id: "june_2026", title: "JUNE 2026", countText: "2 tasks" },
    { id: "earlier", title: "EARLIER ACTIVITY", countText: "1 task" },
  ] as const;

  return (
    <div className={styles.timelineMainContainer}>
      {/* 1. Single Horizontal Toolbar Aligned with Banner Edges */}
      <TimelineToolbar
        projectId={projectId}
        activeFilter={activeFilter}
        searchValue={searchValue}
        canCreateActivity={permissions.canCreateActivity}
        onFilterChange={(fId) => {
          setActiveFilter(fId);
          onSelectCategory(fId as TimelineCategoryFilter);
        }}
        onSearchChange={onSearchChange}
        onAddActivityClick={onAddActivityClick}
      />

      {/* 2. Main Workspace Grid */}
      <div className={styles.timelineWorkspaceGrid}>
        {/* MAIN CHRONOLOGICAL TIMELINE FEED */}
        <main className={styles.mainTimelineFeedColumn}>
          {groupHeadings.map((group) => {
            const recordsInGroup = filteredRecords.filter((r) => r.groupId === group.id);
            if (recordsInGroup.length === 0) return null;

            return (
              <section key={group.id} className={styles.chronologicalGroupSection}>
                {/* Group Header */}
                <div className={styles.groupHeaderRow}>
                  <div className={styles.groupTitleStack}>
                    <h3 className={styles.groupTitleText}>{group.title}</h3>
                    <span className={styles.groupMetaCount}>{group.countText}</span>
                  </div>
                </div>

                {/* Timeline Cards Stack */}
                <div className={styles.cardsStackList}>
                  {recordsInGroup.map((rec) => {
                    const isSelected = selectedActivityId === rec.id;
                    const isCompleted = rec.state === "completed";
                    const isWarning = rec.state === "warning";
                    const pct = rec.progressPct ?? 0;

                    return (
                      <div
                        key={rec.id}
                        className={`${styles.timelineCardItem} ${
                          isCompleted
                            ? styles.cardStateCompleted
                            : isWarning
                            ? styles.cardStateWarning
                            : rec.state === "active"
                            ? styles.cardStateActive
                            : styles.cardStateUpcoming
                        } ${isSelected ? styles.cardSelected : ""}`}
                        onClick={() => onSelectActivity(rec.id)}
                      >
                        {/* Col 1: Status Icon Circle */}
                        <div className={styles.cardIconCol}>
                          {isCompleted ? (
                            <div className={styles.checkCircleGreen}>
                              <Check size={12} />
                            </div>
                          ) : isWarning ? (
                            <div className={styles.warnCircleYellow}>
                              <AlertCircle size={13} />
                            </div>
                          ) : (
                            <Circle size={16} className={styles.emptyCircleRing} />
                          )}
                        </div>

                        {/* Col 2: Title & Category Subtitle */}
                        <div className={styles.cardTitleCol}>
                          <h4
                            className={`${styles.cardTitleText} ${
                              isCompleted ? styles.completedStrikeText : ""
                            }`}
                          >
                            {rec.title}
                          </h4>
                          <div className={styles.cardSubMetaRow}>
                            <span className={styles.cardCategoryText}>{rec.phaseCategoryTag}</span>
                            {rec.commentsCount && (
                              <span className={styles.cardCommentsChip}>
                                💬 {rec.commentsCount}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Col 3: Assignee Avatar & Name */}
                        <div className={styles.cardAssigneeCol}>
                          <span className={styles.cardAvatarCircle}>
                            {(rec.assigneeInitials && rec.assigneeInitials[0]) || "AM"}
                          </span>
                          <span className={styles.cardAssigneeName}>{rec.assigneeName}</span>
                        </div>

                        {/* Col 4: Pill Status Badge */}
                        <div className={styles.cardStatusBadgeCol}>
                          <span
                            className={`${styles.cardStatusPill} ${
                              isCompleted
                                ? styles.pillCompleted
                                : isWarning
                                ? styles.pillWarning
                                : rec.state === "active"
                                ? styles.pillActive
                                : styles.pillScheduled
                            }`}
                          >
                            <span className={styles.pillDotIcon} />
                            {rec.statusLabel}
                          </span>
                        </div>

                        {/* Col 5: Time / Date Info */}
                        <div className={styles.cardDateCol}>
                          <span className={styles.cardDateText}>{rec.timeStr}</span>
                        </div>

                        {/* Col 6: Progress % & Mini Bar */}
                        <div className={styles.cardProgressCol}>
                          <span className={styles.cardProgressPctText}>{pct}%</span>
                          <div className={styles.miniProgressBarTrack}>
                            <div
                              className={`${styles.miniProgressBarFill} ${
                                isCompleted ? styles.miniFillGreen : styles.miniFillBlue
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {/* Col 7: Action Link / Menu */}
                        <div className={styles.cardActionCol}>
                          {rec.actionText ? (
                            <button
                              type="button"
                              className={`${styles.cardActionBtn} ${
                                isWarning ? styles.btnPrimaryWarning : ""
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectActivity(rec.id);
                              }}
                            >
                              <span>{rec.actionText}</span>
                              <ArrowRight size={12} />
                            </button>
                          ) : (
                            <button type="button" className={styles.cardMoreBtn}>
                              <MoreHorizontal size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {filteredRecords.length === 0 && (
            <div className={styles.emptyFeedState}>
              <p>No timeline entries found matching your current filters.</p>
            </div>
          )}
        </main>

        {/* OPERATIONAL RIGHT RAIL */}
        <aside className={styles.operationalRightRail} aria-label="Project operational rail">
          <CurrentPhaseCard
            scheduleHealth="2 days ahead"
            isAhead={true}
            phaseEndDate="30 Nov 2026"
            criticalPathActivity="Roof Slab Reinforcement & Pouring"
            plannedProgress={65}
            actualProgress={68}
            delayedCount={0}
          />

          <UpcomingMilestonesCard />

          <TimelineAttentionCard totalCount={3} />
        </aside>
      </div>
    </div>
  );
}
