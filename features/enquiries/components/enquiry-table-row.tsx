"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import { EnquiryRecord, NextActionType, PROJECT_TYPE_LABELS } from "../types/enquiry.types";
import { formatEnquiryBudgetRange } from "../utils/format-enquiry-budget";
import { formatEnquiryDate, formatNextActionMeta } from "../utils/format-enquiry-date";
import { getEnquiryDetailPath } from "../utils/enquiry-query-state";
import styles from "./enquiries-workspace.module.css";

interface TableRowProps {
  enquiry: EnquiryRecord;
  now: Date;
}

const NEXT_ACTION_CONFIG = {
  review_enquiry: {
    label: "Review enquiry",
    tone: "blue",
  },
  request_clarification: {
    label: "Request clarification",
    tone: "orange",
  },
  schedule_consultation: {
    label: "Schedule consultation",
    tone: "violet",
  },
  consultation: {
    label: "Consultation",
    tone: "blue",
  },
  follow_up: {
    label: "Follow up",
    tone: "blue",
  },
  prepare_proposal: {
    label: "Prepare proposal",
    tone: "blue",
  },
  convert_to_project: {
    label: "Convert to project",
    tone: "green",
  },
  mark_as_lost: {
    label: "Mark as lost",
    tone: "red",
  },
} satisfies Record<
  NextActionType,
  { label: string; tone: string }
>;

export function EnquiryTableRow({ enquiry, now }: TableRowProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const nextActionPresentation = NEXT_ACTION_CONFIG[enquiry.nextAction.type];

  const getDueColorClass = (tone: string) => {
    switch (tone) {
      case "blue":
        return styles.dueToday;
      case "orange":
        return styles.dueOrange;
      case "violet":
        return styles.dueTomorrow;
      case "green":
        return styles.dueGreen;
      case "red":
      default:
        return styles.dueCompleted;
    }
  };

  const getProjectTypeBadgeClass = (projectType: string) => {
    switch (projectType) {
      case "residential":
        return styles.badgeResidential;
      case "commercial":
        return styles.badgeCommercial;
      case "hospitality":
        return styles.badgeHospitality;
      case "multi_family":
        return styles.badgeMultifamily;
      case "landscape":
        return styles.badgeLandscape;
      case "retail":
        return styles.badgeRetail;
      default:
        return "";
    }
  };

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const viewPath = getEnquiryDetailPath(enquiry.id);

  const handleRowClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, a, [role='menu'], [role='menuitem']")) {
      return;
    }
    router.push(viewPath);
  };

  const handleRowKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      const target = e.target as HTMLElement;
      if (target.closest("button, a, [role='menu'], [role='menuitem']")) {
        return;
      }
      e.preventDefault();
      router.push(viewPath);
    }
  };

  return (
    <div
      className={styles.tableRow}
      role="row"
      tabIndex={0}
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
      aria-label={`Open ${enquiry.title} enquiry details`}
    >
      {/* 1. Enquiry Info */}
      <div className={styles.enquiryCol} role="gridcell">
        {enquiry.viewed === false && (
          <span
            className={styles.viewDot}
            role="img"
            aria-label="Unviewed enquiry"
            title="Unviewed enquiry"
          />
        )}
        <div className={styles.thumbnailWrap}>
          <Image
            src={enquiry.thumbnailUrl}
            alt=""
            width={64}
            height={48}
            className={styles.thumbnailImg}
            priority={false}
          />
        </div>
        <div className={styles.enquiryMeta}>
          <div className={styles.titleRow}>
            <span className={styles.enquiryTitle}>{enquiry.title}</span>
            {enquiry.isNew && <span className={styles.newBadge}>New</span>}
          </div>
          <span className={styles.clientText}>
            {enquiry.clientName} · {enquiry.location}
          </span>
        </div>
      </div>

      {/* 2. Next Action */}
      <div className={styles.nextActionCol} role="gridcell">
        <div className={styles.actionDetails}>
          <span className={styles.actionLabel}>{nextActionPresentation.label}</span>
          <span
            className={`${styles.actionDueText} ${getDueColorClass(nextActionPresentation.tone)}`}
          >
            {formatNextActionMeta(enquiry.nextAction, now)}
          </span>
        </div>
      </div>

      {/* 3. Received Date */}
      <div className={styles.dateText} role="gridcell">
        {formatEnquiryDate(enquiry.receivedAt, now)}
      </div>

      {/* 4. Budget Range */}
      <div className={`${styles.budgetVal} ${styles.budgetCell}`} role="gridcell">
        {enquiry.budget ?? formatEnquiryBudgetRange(enquiry.budgetMin, enquiry.budgetMax)}
      </div>

      {/* 5. Project Type */}
      <div role="gridcell">
        <span className={`${styles.badge} ${getProjectTypeBadgeClass(enquiry.projectType)}`}>
          {PROJECT_TYPE_LABELS[enquiry.projectType]}
        </span>
      </div>

      {/* 6. Actions Column: Three-dot menu only (entire row is clickable) */}
      <div className={styles.actionsCell} role="gridcell">
        <div className={styles.moreActionWrap} ref={menuRef}>
          <button
            type="button"
            className={styles.moreActionBtn}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={`More actions for ${enquiry.title}`}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
          >
            <MoreVertical size={16} />
          </button>
          {isMenuOpen && (
            <div className={styles.actionsMenu} role="menu">
              <Link
                href={viewPath}
                className={styles.menuItem}
                role="menuitem"
                onClick={() => setIsMenuOpen(false)}
              >
                View enquiry
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
