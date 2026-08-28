"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FileText, MessageSquare, Calendar, Send, CheckCircle2, XCircle } from "lucide-react";
import { EnquiryRecord, NextActionType, PROJECT_TYPE_LABELS } from "../types/enquiry.types";
import { formatEnquiryBudgetRange } from "../utils/format-enquiry-budget";
import { formatEnquiryDate, formatNextActionMeta } from "../utils/format-enquiry-date";
import { getEnquiryDetailPath } from "../utils/enquiry-query-state";
import { getEnquiryProviderDisplay } from "./enquiry-table-row";
import styles from "./enquiries-workspace.module.css";

interface MobileCardProps {
  enquiry: EnquiryRecord;
  now: Date;
  basePath?: string;
}

const PROVIDER_NEXT_ACTION_CONFIG = {
  review_enquiry: {
    label: "Review enquiry",
    icon: FileText,
    tone: "blue",
  },
  request_clarification: {
    label: "Request clarification",
    icon: MessageSquare,
    tone: "orange",
  },
  schedule_consultation: {
    label: "Schedule consultation",
    icon: Calendar,
    tone: "violet",
  },
  consultation: {
    label: "Consultation",
    icon: Calendar,
    tone: "blue",
  },
  follow_up: {
    label: "Follow up",
    icon: Send,
    tone: "blue",
  },
  prepare_proposal: {
    label: "Prepare proposal",
    icon: FileText,
    tone: "blue",
  },
  convert_to_project: {
    label: "Convert to project",
    icon: CheckCircle2,
    tone: "green",
  },
  mark_as_lost: {
    label: "Mark as lost",
    icon: XCircle,
    tone: "red",
  },
} satisfies Record<
  NextActionType,
  { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; tone: string }
>;

const CLIENT_NEXT_ACTION_CONFIG = {
  review_enquiry: {
    label: "Reviewing with Architect",
    icon: FileText,
    tone: "blue",
  },
  request_clarification: {
    label: "Clarification Requested",
    icon: MessageSquare,
    tone: "orange",
  },
  schedule_consultation: {
    label: "Consultation Scheduled",
    icon: Calendar,
    tone: "violet",
  },
  consultation: {
    label: "Consultation in Progress",
    icon: Calendar,
    tone: "blue",
  },
  follow_up: {
    label: "Follow-up Pending",
    icon: Send,
    tone: "blue",
  },
  prepare_proposal: {
    label: "Proposal in Preparation",
    icon: FileText,
    tone: "blue",
  },
  convert_to_project: {
    label: "Ready to Kickoff Project",
    icon: CheckCircle2,
    tone: "green",
  },
  mark_as_lost: {
    label: "Enquiry Closed",
    icon: XCircle,
    tone: "red",
  },
} satisfies Record<
  NextActionType,
  { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; tone: string }
>;

export function EnquiryMobileCard({ enquiry, now, basePath }: MobileCardProps) {
  const router = useRouter();
  const isClient = Boolean(basePath?.startsWith("/client"));

  const nextActionPresentation = isClient
    ? (CLIENT_NEXT_ACTION_CONFIG[enquiry.nextAction.type] ?? PROVIDER_NEXT_ACTION_CONFIG[enquiry.nextAction.type])
    : PROVIDER_NEXT_ACTION_CONFIG[enquiry.nextAction.type];
  const IconComponent = nextActionPresentation.icon;

  const getToneClass = (tone: string) => {
    switch (tone) {
      case "blue":
        return styles.iconBlue;
      case "orange":
        return styles.iconOrange;
      case "violet":
        return styles.iconPurple;
      case "green":
        return styles.iconGreen;
      case "red":
        return styles.iconRed;
      default:
        return styles.iconBlue;
    }
  };

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

  const viewPath = getEnquiryDetailPath(enquiry.id, basePath);

  const handleCardClick = () => {
    router.push(viewPath);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push(viewPath);
    }
  };

  const subtitleText = isClient
    ? `${getEnquiryProviderDisplay(enquiry)} · ${enquiry.location}`
    : `${enquiry.clientName} · ${enquiry.location}`;

  return (
    <div
      className={styles.mobileCard}
      role="listitem"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      style={{ cursor: "pointer" }}
      aria-label={`Open ${enquiry.title} enquiry details`}
    >
      {/* Thumbnail + title */}
      <div className={styles.mobileHeader}>
        <div className={styles.mobileThumbnailWrap}>
          <Image
            src={enquiry.thumbnailUrl}
            alt=""
            width={56}
            height={46}
            className={styles.thumbnailImg}
            priority={false}
          />
        </div>
        <div className={styles.mobileTitleWrap}>
          <div className={styles.titleRow}>
            <span className={styles.mobileTitle}>{enquiry.title}</span>
            {enquiry.isNew && <span className={styles.newBadge}>New</span>}
          </div>
          <span className={styles.mobileClientText}>
            {subtitleText}
          </span>
        </div>
      </div>

      {/* Badges & Meta Grid */}
      <div className={styles.mobileBody}>
        {/* Project Type Badge */}
        <div className={styles.mobileMetaRow}>
          <span className={styles.mobileMetaLabel}>Project Type</span>
          <span className={`${styles.badge} ${getProjectTypeBadgeClass(enquiry.projectType)}`}>
            {PROJECT_TYPE_LABELS[enquiry.projectType]}
          </span>
        </div>

        {/* Next Action */}
        <div className={styles.mobileMetaRow}>
          <span className={styles.mobileMetaLabel}>{isClient ? "Next Step" : "Next Action"}</span>
          <div className={styles.mobileActionVal}>
            <span className={`${styles.iconWrap} ${getToneClass(nextActionPresentation.tone)}`}>
              <IconComponent size={14} />
            </span>
            <div className={styles.mobileActionTextCol}>
              <span className={styles.actionLabel}>{nextActionPresentation.label}</span>
              <span
                className={`${styles.actionDueText} ${getDueColorClass(nextActionPresentation.tone)}`}
              >
                {formatNextActionMeta(enquiry.nextAction, now)}
              </span>
            </div>
          </div>
        </div>

        {/* Received / Submitted Date */}
        <div className={styles.mobileMetaRow}>
          <span className={styles.mobileMetaLabel}>{isClient ? "Submitted" : "Received"}</span>
          <span className={styles.mobileDateVal}>
            {formatEnquiryDate(enquiry.receivedAt, now)}
          </span>
        </div>

        {/* Budget */}
        <div className={styles.mobileMetaRow}>
          <span className={styles.mobileMetaLabel}>Budget</span>
          <span className={styles.mobileBudgetVal}>
            {enquiry.budget ? enquiry.budget : formatEnquiryBudgetRange(enquiry.budgetMin, enquiry.budgetMax)}
          </span>
        </div>
      </div>
    </div>
  );
}
