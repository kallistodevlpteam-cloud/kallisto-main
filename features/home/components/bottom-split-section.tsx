"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, CheckCircle2, CreditCard, FileText, UserCheck } from "lucide-react";
import { PriorityPreview, RecentActivityItem } from "@/types/domain/home";
import styles from "../home-workspace.module.css";

export interface BottomSplitSectionProps {
  actionRequiredItems: PriorityPreview[];
  recentActivities: RecentActivityItem[];
}

export function BottomSplitSection({
  actionRequiredItems,
  recentActivities,
}: BottomSplitSectionProps) {
  const visibleActions = actionRequiredItems.slice(0, 3);
  const visibleActivities = recentActivities.slice(0, 4);

  const getActivityIcon = (iconType: string) => {
    switch (iconType) {
      case "boq":
        return <CheckCircle2 size={16} className={styles.iconGreen} />;
      case "site":
        return <Calendar size={16} className={styles.iconBlue} />;
      case "task":
        return <UserCheck size={16} className={styles.iconAmber} />;
      case "document":
        return <FileText size={16} className={styles.iconPurple} />;
      case "payment":
        return <CreditCard size={16} className={styles.iconGreen} />;
      default:
        return <FileText size={16} className={styles.iconGray} />;
    }
  };

  return (
    <div className={styles.bottomSplitGridContainer}>
      {/* Left Panel: Action Required (~60% Width, matching SVG x=0.5, y=2099.5, w=683, h=488) */}
      <div className={styles.actionRequiredPanel}>
        <div className={styles.panelHeaderRow}>
          <div>
            <h3 className={styles.panelTitleLarge}>Action Required</h3>
            <p className={styles.panelSubtitle}>Urgent items requiring your immediate decision or submission.</p>
          </div>
          <Link href="/projects" className={styles.headerActionLink}>
            <span>View all</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className={styles.actionRowsStack}>
          {visibleActions.length === 0 ? (
            <div className={styles.emptyStateBox}>
              <p>You’re clear for now. No urgent actions require your attention.</p>
            </div>
          ) : (
            visibleActions.map((item) => {
              let priorityBadgeClass = styles.badgeMedium;
              if (item.priorityLevel === "critical") priorityBadgeClass = styles.badgeCritical;
              else if (item.priorityLevel === "high") priorityBadgeClass = styles.badgeHigh;

              return (
                <div key={item.id} className={styles.largeActionRowCard}>
                  <div className={styles.actionRowMainGroup}>
                    <div className={styles.actionRowTitleLine}>
                      <span className={`${styles.priorityLevelBadge} ${priorityBadgeClass}`}>
                        {item.priorityLevel.toUpperCase()}
                      </span>
                      <strong className={styles.actionItemTitle}>{item.tag}</strong>
                      <span className={styles.metaDot}>·</span>
                      <span className={styles.actionProjectContext}>{item.projectName}</span>
                    </div>

                    {item.subtitle && <p className={styles.actionSubText}>{item.subtitle}</p>}

                    <div className={styles.actionMetaSubLine}>
                      {item.dueText && <span>Due: <strong>{item.dueText}</strong></span>}
                      {item.assignedTo && <span>Assigned: {item.assignedTo}</span>}
                    </div>
                  </div>

                  <div className={styles.actionRowBtnCell}>
                    {item.destination.availability === "available" ? (
                      <Link href={item.destination.route} className={styles.btnActionRowPrimary}>
                        <span>{item.actionLabel}</span>
                      </Link>
                    ) : (
                      <button type="button" className={styles.btnActionRowPrimary} disabled>
                        <span>{item.actionLabel}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Panel: Recent Activity (~40% Width, matching SVG x=708.5, y=2099.5, w=447, h=488) */}
      <div className={styles.recentActivityPanel}>
        <div className={styles.panelHeaderRow}>
          <div>
            <h3 className={styles.panelTitleLarge}>Recent Activity</h3>
            <p className={styles.panelSubtitle}>Operational audit log</p>
          </div>
          <Link href="/documents" className={styles.headerActionLink}>
            <span>View all</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className={styles.activityRowsStack}>
          {visibleActivities.length === 0 ? (
            <div className={styles.emptyStateBoxSmall}>
              <p>Project activity will appear here.</p>
            </div>
          ) : (
            visibleActivities.map((act) => (
              <div key={act.id} className={styles.compactActivityRowCard}>
                <div className={styles.activityIconCircle}>
                  {getActivityIcon(act.iconType)}
                </div>

                <div className={styles.activityInfoGroup}>
                  <div className={styles.actTitleLine}>
                    <strong className={styles.actTitleText}>{act.title}</strong>
                  </div>
                  <div className={styles.actSubLine}>
                    <span>{act.projectName}</span>
                    <span className={styles.metaDot}>·</span>
                    <span>{act.actor}</span>
                  </div>
                  <span className={styles.actTimeText}>{act.timeAgo}</span>
                </div>

                <Link href={act.route} className={styles.btnActivityRowLink} aria-label={`Open ${act.title}`}>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
