import React from "react";
import styles from "../projects.module.css";

interface ProjectDueLabelProps {
  dueState: "overdue" | "due_today" | "due_soon" | "on_track" | "no_due_date";
  dueLabel: string;
  isBlocked?: boolean;
}

export function ProjectDueLabel({ dueState, dueLabel, isBlocked }: ProjectDueLabelProps) {
  let colorClass = styles.dueNeutral;

  if (dueState === "overdue") {
    colorClass = styles.dueDanger;
  } else if (dueState === "due_today" || isBlocked) {
    colorClass = styles.dueWarning;
  } else if (dueState === "due_soon") {
    colorClass = styles.dueInfo;
  }

  return <span className={`${styles.dueLabel} ${colorClass}`}>{dueLabel}</span>;
}
