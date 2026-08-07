"use client";

import React from "react";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { ProjectScheduleActivity, ProjectSchedulePhase } from "../../../domain/project-schedule.types";
import { getPhaseColorTheme } from "./phase-colors";
import styles from "./gantt-workspace.module.css";

interface GanttTaskTableProps {
  phases: ProjectSchedulePhase[];
  activities: ProjectScheduleActivity[];
  collapsedPhases: Set<string>;
  onTogglePhaseCollapse: (phaseId: string) => void;
  selectedActivityId: string | null;
  hoveredActivityId: string | null;
  onSelectActivity: (activityId: string) => void;
  onHoverActivity: (activityId: string | null) => void;
  bodyRef?: React.Ref<HTMLDivElement>;
  onScroll?: React.UIEventHandler<HTMLDivElement>;
}

function TaskStatusIcon({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <span className={styles.statusIconWrap} title="Status: Completed">
        <CheckCircle2 size={16} fill="#10b981" color="#ffffff" className={styles.statusCompletedIcon} />
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className={styles.statusIconWrap} title="Status: In Progress">
        <span className={styles.statusInProgressDot} />
      </span>
    );
  }
  if (status === "blocked") {
    return (
      <span className={styles.statusIconWrap} title="Status: Blocked">
        <AlertCircle size={15} className={styles.statusBlockedIcon} />
      </span>
    );
  }
  if (status === "at_risk") {
    return (
      <span className={styles.statusIconWrap} title="Status: At Risk">
        <AlertTriangle size={15} className={styles.statusAtRiskIcon} />
      </span>
    );
  }
  return null;
}

export function GanttTaskTable({
  phases,
  activities,
  collapsedPhases,
  onTogglePhaseCollapse,
  selectedActivityId,
  hoveredActivityId,
  onSelectActivity,
  onHoverActivity,
  bodyRef,
  onScroll,
}: GanttTaskTableProps) {
  return (
    <div className={styles.leftTaskColumnPanel}>
      {/* Task Tree Header Column: NAME */}
      <div className={styles.leftPanelHeaderCell}>
        <span className={styles.colHeaderName}>NAME</span>
      </div>

      <div ref={bodyRef} className={styles.leftPanelBody} onScroll={onScroll}>
        {phases.map((phase, idx) => {
          const phaseActivities = activities.filter((a) => a.phaseId === phase.id);
          const isCollapsed = collapsedPhases.has(phase.id);
          const colorTheme = getPhaseColorTheme(phase.id, phase.order || idx);

          return (
            <React.Fragment key={phase.id}>
              {/* Phase Header Row */}
              <div
                className={styles.leftPhaseHeaderRow}
                onClick={() => onTogglePhaseCollapse(phase.id)}
                title={isCollapsed ? `Expand phase ${phase.name}` : `Collapse phase ${phase.name}`}
              >
                <div className={styles.phaseHeaderLeftGroup}>
                  {/* Rounded Color Square */}
                  <span
                    className={styles.phaseColourDot}
                    style={{ backgroundColor: colorTheme.primary }}
                  />

                  {/* Phase Title + Code Inline: SINTERING MACHINE - #15 */}
                  <div className={styles.phaseTitleCol}>
                    <span className={styles.phaseTitleText}>{phase.name.toUpperCase()}</span>
                    <span className={styles.phaseWbsCode}> - #{phase.wbsCode}</span>
                  </div>
                </div>

                {/* Right-aligned Chevron */}
                <span className={styles.phaseCollapseToggle}>
                  {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </span>
              </div>

              {/* Activity Rows */}
              {!isCollapsed &&
                phaseActivities.map((act) => {
                  const isSelected = selectedActivityId === act.id;
                  const isHovered = hoveredActivityId === act.id;

                  return (
                    <div
                      key={act.id}
                      className={`${styles.leftActivityRow} ${
                        isSelected ? styles.timelineRowSelected : ""
                      } ${isHovered ? styles.timelineRowHovered : ""}`}
                      onClick={() => onSelectActivity(act.id)}
                      onMouseEnter={() => onHoverActivity(act.id)}
                      onMouseLeave={() => onHoverActivity(null)}
                      title={`${act.title} - #${act.wbsCode}`}
                    >
                      <div className={styles.taskIdentity}>
                        <span className={styles.taskTitleText}>{act.title}</span>
                        <span className={styles.actWbsCode}> - #{act.wbsCode}</span>
                      </div>

                      <TaskStatusIcon status={act.status} />
                    </div>
                  );
                })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
