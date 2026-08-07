"use client";

import React from "react";
import { Flag } from "lucide-react";
import styles from "../chronological/chronological-timeline.module.css";

export interface MilestoneItem {
  id: string;
  title: string;
  dueDate: string;
  status: "In Progress" | "Pending" | "Scheduled" | "Completed";
}

export interface UpcomingMilestonesCardProps {
  milestones?: MilestoneItem[];
}

export function UpcomingMilestonesCard({
  milestones = [
    { id: "m2", title: "Electrical layout approval", dueDate: "05 Aug", status: "Pending" },
    { id: "m3", title: "First-floor masonry", dueDate: "15 Aug", status: "Scheduled" },
    { id: "m4", title: "Plumbing & drainage rough-in", dueDate: "25 Aug", status: "Scheduled" },
  ],
}: UpcomingMilestonesCardProps) {
  return (
    <section className={styles.sidebarCard} aria-labelledby="upcoming-milestones-card-title">
      <div className={styles.sidebarCardHeader}>
        <h3 id="upcoming-milestones-card-title" className={styles.sidebarCardHeading}>
          Upcoming milestones
        </h3>
        <Flag size={14} className={styles.headerMutedIcon} />
      </div>

      <div className={styles.milestonesList}>
        {milestones.slice(0, 3).map((item) => (
          <div key={item.id} className={styles.milestoneRowItem}>
            <div className={styles.milestoneTitleCol}>
              <strong className={styles.milestoneItemTitle}>{item.title}</strong>
              <span className={styles.milestoneItemDate}>{item.dueDate}</span>
            </div>
            <span
              className={`${styles.milestoneStatusTag} ${
                item.status === "In Progress"
                  ? styles.tagInProgress
                  : item.status === "Pending"
                  ? styles.tagPending
                  : styles.tagScheduled
              }`}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
