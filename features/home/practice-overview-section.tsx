"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Calendar, CreditCard, Inbox, AlertCircle } from "lucide-react";
import { CommitmentItem, PipelineItem } from "@/types/domain/home";
import styles from "./home-workspace.module.css";

export interface PracticeOverviewSectionProps {
  pipelineItems: PipelineItem[];
  commitmentItems: CommitmentItem[];
}

export function PracticeOverviewSection({
  pipelineItems,
  commitmentItems,
}: PracticeOverviewSectionProps) {
  return (
    <section className={styles.sectionContainer}>
      <div className={styles.sectionHeaderRow}>
        <div>
          <h2 className={styles.sectionTitle}>Practice Overview</h2>
          <p className={styles.sectionSubtitle}>
            A compact view of enquiries, commitments and financial movement.
          </p>
        </div>
      </div>

      {/* Two-Column Layout Container */}
      <div className={styles.overviewGridContainer}>
        {/* Left Column: Pipeline */}
        <div className={styles.overviewCol}>
          <div className={styles.colHeader}>
            <span className={styles.colHeaderTitle}>Practice Pipeline</span>
            <span className={styles.colHeaderSubtitle}>Inquiries & Proposals</span>
          </div>

          <div className={styles.overviewList}>
            {pipelineItems.slice(0, 3).map((item) => (
              <div key={item.id} className={styles.overviewRow}>
                <div className={styles.rowLeft}>
                  <Inbox size={16} className={styles.iconBlue} />
                  <div className={styles.rowTextStack}>
                    <span className={styles.rowItemTitle}>{item.title}</span>
                    <small className={styles.rowItemSubtitle}>{item.category}</small>
                  </div>
                </div>

                <div className={styles.rowRight}>
                  <span className={styles.countBadge}>{item.countLabel}</span>
                  {item.destination.availability === "available" ? (
                    <Link href={item.destination.route} className={styles.iconLinkBtn} aria-label={`Open ${item.title}`}>
                      <ChevronRight size={14} />
                    </Link>
                  ) : (
                    <span className={styles.iconLinkBtnDisabled}>
                      <ChevronRight size={14} />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Commitments */}
        <div className={styles.overviewCol}>
          <div className={styles.colHeader}>
            <span className={styles.colHeaderTitle}>Commitments & Schedule</span>
            <span className={styles.colHeaderSubtitle}>Payments & Milestones</span>
          </div>

          <div className={styles.overviewList}>
            {commitmentItems.slice(0, 3).map((item) => (
              <div key={item.id} className={styles.overviewRow}>
                <div className={styles.rowLeft}>
                  {item.category === "payment" && <CreditCard size={16} className={styles.iconAmber} />}
                  {item.category === "meeting" && <Calendar size={16} className={styles.iconBlue} />}
                  {item.category === "deadline" && <AlertCircle size={16} className={styles.iconRed} />}
                  <div className={styles.rowTextStack}>
                    <span className={styles.rowItemTitle}>{item.title}</span>
                    <small className={styles.rowItemSubtitle}>{item.subtitle}</small>
                  </div>
                </div>

                <div className={styles.rowRight}>
                  <span className={styles.dueTextBadge}>{item.dueLabel}</span>
                  {item.destination.availability === "available" ? (
                    <Link href={item.destination.route} className={styles.iconLinkBtn} aria-label={`Open ${item.title}`}>
                      <ChevronRight size={14} />
                    </Link>
                  ) : (
                    <span className={styles.iconLinkBtnDisabled}>
                      <ChevronRight size={14} />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
