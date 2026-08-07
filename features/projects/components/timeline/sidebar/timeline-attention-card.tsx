"use client";

import React from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import styles from "../chronological/chronological-timeline.module.css";

export interface AttentionItem {
  id: string;
  title: string;
  category: "Approval" | "Procurement" | "Blocked" | "Overdue";
  description: string;
}

export interface TimelineAttentionCardProps {
  items?: AttentionItem[];
  totalCount?: number;
  onViewAllClick?: () => void;
}

export function TimelineAttentionCard({
  items = [
    {
      id: "att-1",
      title: "Revised electrical layout approval",
      category: "Approval",
      description: "Awaiting client sign-off before DB routing",
    },
    {
      id: "att-2",
      title: "Cement OPC 53 delivery delay",
      category: "Procurement",
      description: "Vendor dispatch delayed by 1 day",
    },
    {
      id: "att-3",
      title: "Foundation inspection compliance",
      category: "Blocked",
      description: "Field compliance report pending verification",
    },
  ],
  totalCount = 3,
  onViewAllClick,
}: TimelineAttentionCardProps) {
  const showViewAll = totalCount > items.length;

  return (
    <section className={styles.sidebarCard} aria-labelledby="timeline-attention-card-title">
      <div className={styles.sidebarCardHeader}>
        <h3 id="timeline-attention-card-title" className={styles.sidebarCardHeading}>
          Needs attention
        </h3>
        <span className={styles.attentionCountPill}>{totalCount}</span>
      </div>

      <div className={styles.attentionList}>
        {items.map((item) => (
          <div key={item.id} className={styles.attentionRowItem}>
            <div className={styles.attentionItemHeader}>
              <span
                className={`${styles.attentionCatBadge} ${
                  item.category === "Approval"
                    ? styles.catApproval
                    : item.category === "Procurement"
                    ? styles.catProcurement
                    : styles.catBlocked
                }`}
              >
                {item.category}
              </span>
              <AlertCircle size={13} className={styles.attentionWarnIcon} />
            </div>
            <strong className={styles.attentionItemTitle}>{item.title}</strong>
            <p className={styles.attentionItemDesc}>{item.description}</p>
          </div>
        ))}
      </div>

      {showViewAll && (
        <div className={styles.attentionFooterAction}>
          <button
            type="button"
            className={styles.attentionViewAllLink}
            onClick={onViewAllClick}
          >
            <span>View all ({totalCount})</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}
    </section>
  );
}
