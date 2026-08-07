"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, CreditCard, FileText, CheckCircle2, UserCheck } from "lucide-react";
import { RecentActivityItem } from "@/types/domain/home";
import styles from "../home-workspace.module.css";

export interface RecentActivityFeedProps {
  activities: RecentActivityItem[];
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  const visibleActivities = activities.slice(0, 6);

  const getActivityIcon = (iconType: string) => {
    switch (iconType) {
      case "boq":
        return <CheckCircle2 size={15} className={styles.iconGreen} />;
      case "site":
        return <Calendar size={15} className={styles.iconBlue} />;
      case "task":
        return <UserCheck size={15} className={styles.iconAmber} />;
      case "document":
        return <FileText size={15} className={styles.iconPurple} />;
      case "payment":
        return <CreditCard size={15} className={styles.iconGreen} />;
      default:
        return <FileText size={15} className={styles.iconGray} />;
    }
  };

  return (
    <section className={styles.sectionContainerSecondary}>
      <div className={styles.sectionHeaderRow}>
        <div>
          <h2 className={styles.sectionTitleSecondary}>Recent Activity</h2>
          <p className={styles.sectionSubtitle}>
            Audit record of recent operational updates, approvals, and site changes.
          </p>
        </div>
        <Link href="/documents" className={styles.headerActionLink}>
          <span>View all activity</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className={styles.activityFeedContainer}>
        {visibleActivities.length === 0 ? (
          <div className={styles.emptyStateBoxSmall}>
            <p>Project activity will appear here.</p>
          </div>
        ) : (
          <div className={styles.activityGrid}>
            {visibleActivities.map((act) => (
              <div key={act.id} className={styles.activityCard}>
                <div className={styles.activityIconCell}>
                  {getActivityIcon(act.iconType)}
                </div>

                <div className={styles.activityMainCell}>
                  <div className={styles.activityTitleLine}>
                    <strong className={styles.actTitle}>{act.title}</strong>
                    <span className={styles.actProject}>{act.projectName}</span>
                  </div>
                  <div className={styles.activityMetaLine}>
                    <span>{act.actor}</span>
                    <span className={styles.metaDot}>·</span>
                    <span className={styles.actTime}>{act.timeAgo}</span>
                  </div>
                </div>

                <div className={styles.activityActionCell}>
                  <Link href={act.route} className={styles.btnActivityLink} aria-label={`Open ${act.title}`}>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
