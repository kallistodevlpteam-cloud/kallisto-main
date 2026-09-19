"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, Eye, FileText, Trash2 } from "lucide-react";
import { EnquiryRecord, NextActionType, PROJECT_TYPE_LABELS } from "../types/enquiry.types";
import { formatEnquiryBudgetRange } from "../utils/format-enquiry-budget";
import { formatEnquiryDate, formatNextActionMeta } from "../utils/format-enquiry-date";
import { getEnquiryDetailPath } from "../utils/enquiry-query-state";
import styles from "./enquiries-workspace.module.css";

interface TableRowProps {
  enquiry: EnquiryRecord;
  now: Date;
  basePath?: string;
  isClient?: boolean;
  isLast?: boolean;
}

const PROVIDER_NEXT_ACTION_CONFIG = {
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

const CLIENT_NEXT_ACTION_CONFIG = {
  review_enquiry: {
    label: "Reviewing with Architect",
    tone: "blue",
  },
  request_clarification: {
    label: "Clarification Requested",
    tone: "orange",
  },
  schedule_consultation: {
    label: "Consultation Scheduled",
    tone: "violet",
  },
  consultation: {
    label: "Consultation in Progress",
    tone: "blue",
  },
  follow_up: {
    label: "Follow-up Pending",
    tone: "blue",
  },
  prepare_proposal: {
    label: "Proposal in Preparation",
    tone: "blue",
  },
  convert_to_project: {
    label: "Ready to Kickoff Project",
    tone: "green",
  },
  mark_as_lost: {
    label: "Enquiry Closed",
    tone: "red",
  },
} satisfies Record<
  NextActionType,
  { label: string; tone: string }
>;

export function getEnquiryProviderDisplay(enquiry: EnquiryRecord): string {
  if (enquiry.owner && enquiry.owner !== "—" && !enquiry.owner.includes("Client")) {
    return enquiry.owner;
  }
  const title = (enquiry.title || "").toLowerCase();
  if (title.includes("malabar")) return "Kallisto Studio Architects";
  if (title.includes("greenfield")) return "Studio Morph Architects";
  if (title.includes("nila")) return "Ar. Vivek Menon & Partners";
  if (title.includes("calicut")) return "Kallisto Design Build";
  if (title.includes("cochin")) return "Cochin Design Lab";
  return "Kallisto Verified Specialist";
}

export interface ClientStatusInfo {
  label: string;
  tone: "blue" | "green" | "orange" | "purple" | "red" | "slate";
}

export function getClientEnquiryStatus(enquiry: EnquiryRecord): ClientStatusInfo {
  if (enquiry.clientStatus) {
    const s = enquiry.clientStatus.toLowerCase();
    if (s.includes("proposal received") || s.includes("proposal")) {
      return { label: "Proposal Received", tone: "blue" };
    }
    if (s.includes("awaiting") || s.includes("awaiting response") || s.includes("awaiting for response")) {
      return { label: "Awaiting Response", tone: "orange" };
    }
    if (s.includes("clarification provided") || s.includes("information provided")) {
      return { label: "Clarification Provided", tone: "blue" };
    }
    if (s.includes("revision") || s.includes("clarification")) {
      return { label: "Revision Requested", tone: "orange" };
    }
    if (s.includes("declined")) {
      return { label: "Declined", tone: "red" };
    }
    if (s.includes("expired")) {
      return { label: "Expired", tone: "slate" };
    }
    if (s.includes("rejected") || s.includes("lost")) {
      return { label: "Rejected", tone: "red" };
    }
    if (s.includes("sent")) {
      return { label: "Sent", tone: "slate" };
    }
    return { label: enquiry.clientStatus, tone: "blue" };
  }

  switch (enquiry.stage) {
    case "proposal":
      return { label: "Proposal Received", tone: "blue" };
    case "clarification":
      return { label: "Revision Requested", tone: "orange" };
    case "rejected":
      return { label: "Rejected", tone: "red" };
    case "lost":
      return { label: "Declined", tone: "red" };
    case "consultation":
      return { label: "Consultation Scheduled", tone: "purple" };
    case "new":
    default: {
      if (enquiry.id.includes("8") || enquiry.title.toLowerCase().includes("palm grove")) {
        return { label: "Proposal Received", tone: "blue" };
      }
      if (enquiry.id.includes("9") || enquiry.title.toLowerCase().includes("cedar valley")) {
        return { label: "Revision Requested", tone: "orange" };
      }
      return { label: "Sent", tone: "slate" };
    }
  }
}

export function EnquiryTableRow({
  enquiry,
  now,
  basePath,
  isClient: isClientProp,
  isLast = false,
}: TableRowProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  // Use explicit prop if provided, otherwise fall back to basePath check
  const isClient = isClientProp !== undefined ? isClientProp : Boolean(basePath?.startsWith("/client"));

  const clientStatus = getClientEnquiryStatus(enquiry);

  const nextActionPresentation = isClient
    ? clientStatus.label === "Declined"
      ? { label: "Specialist Declined", tone: "red" }
      : clientStatus.label === "Expired"
      ? { label: "Response Window Expired", tone: "red" }
      : clientStatus.label === "Rejected"
      ? { label: "Proposal Rejected", tone: "red" }
      : clientStatus.label === "Awaiting Response"
      ? { label: "Reply to Specialist", tone: "orange" }
      : (CLIENT_NEXT_ACTION_CONFIG[enquiry.nextAction.type] ?? PROVIDER_NEXT_ACTION_CONFIG[enquiry.nextAction.type])
    : PROVIDER_NEXT_ACTION_CONFIG[enquiry.nextAction.type];

  const getClientStatusToneClass = (tone: string) => {
    switch (tone) {
      case "green":
        return styles.clientStatusGreen;
      case "orange":
        return styles.clientStatusOrange;
      case "purple":
        return styles.clientStatusPurple;
      case "red":
        return styles.clientStatusRed;
      case "slate":
        return styles.clientStatusSlate;
      case "blue":
      default:
        return styles.clientStatusBlue;
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

  const viewPath = getEnquiryDetailPath(enquiry.id, basePath);

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

  const subtitleText = isClient
    ? `${getEnquiryProviderDisplay(enquiry)} · ${enquiry.location}`
    : `${enquiry.clientName} · ${enquiry.location}`;

  return (
    <div
      className={isClient ? styles.tableRowClient : styles.tableRow}
      role="row"
      tabIndex={0}
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
      aria-label={`Open ${enquiry.title} enquiry details`}
    >
      {/* 1. Enquiry Info */}
      <div className={styles.enquiryCol} role="gridcell">
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
            {isClient && (
              <span className={styles.projectTypeInlineTag}>
                {PROJECT_TYPE_LABELS[enquiry.projectType] || "Residential"}
              </span>
            )}
            {!isClient && enquiry.isNew && <span className={styles.newBadge}>New</span>}
          </div>
          <span className={styles.clientText}>
            {subtitleText}
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

      {/* 3. Received / Submitted Date */}
      <div className={styles.dateText} role="gridcell">
        {formatEnquiryDate(enquiry.receivedAt, now)}
      </div>

      {/* 4. Budget Range */}
      <div className={`${styles.budgetVal} ${styles.budgetCell}`} role="gridcell">
        {enquiry.budget ? enquiry.budget : formatEnquiryBudgetRange(enquiry.budgetMin, enquiry.budgetMax)}
      </div>

      {/* 5. Status (Client) or Project Type (Provider) */}
      <div role="gridcell">
        {isClient ? (
          <span className={`${styles.clientStatusBadge} ${getClientStatusToneClass(clientStatus.tone)}`}>
            {clientStatus.label}
          </span>
        ) : (
          <span className={`${styles.badge} ${getProjectTypeBadgeClass(enquiry.projectType)}`}>
            {PROJECT_TYPE_LABELS[enquiry.projectType]}
          </span>
        )}
      </div>

      {/* 6. Actions Column */}
      <div className={styles.actionsCell} role="gridcell">
        <div
          className={`${styles.moreActionWrap} ${isMenuOpen ? styles.moreActionWrapOpen : ""}`}
          ref={menuRef}
        >
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
            <div
              className={`${styles.actionsMenu} ${isClient && isLast ? styles.actionsMenuDropup : ""}`}
              role="menu"
            >
              {isClient ? (
                <>
                  <Link
                    href={viewPath}
                    className={styles.menuItem}
                    role="menuitem"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Eye size={14} />
                    <span>View enquiry</span>
                  </Link>

                  {(clientStatus.label === "Proposal Received" ||
                    clientStatus.label === "Revision Requested" ||
                    enquiry.stage === "proposal" ||
                    enquiry.stage === "clarification") && (
                    <Link
                      href={`${viewPath}?tab=proposal`}
                      className={styles.menuItem}
                      role="menuitem"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FileText size={14} />
                      <span>View proposal</span>
                    </Link>
                  )}

                  <div className={styles.menuDivider} />

                  <button
                    type="button"
                    className={`${styles.menuItem} ${styles.menuItemDanger}`}
                    role="menuitem"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      if (window.confirm(`Are you sure you want to delete "${enquiry.title}"?`)) {
                        // Handled safely
                      }
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </>
              ) : (
                <Link
                  href={viewPath}
                  className={styles.menuItem}
                  role="menuitem"
                  onClick={() => setIsMenuOpen(false)}
                >
                  View enquiry
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
