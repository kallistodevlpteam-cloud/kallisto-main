"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  Plus,
  Calendar,
} from "lucide-react";
import { LabourRequest } from "../../types/request-domain";
import { calculateRequestMatch } from "../../mock/requests-mock-data";
import { getProviderDisplayDetails } from "../../mock/provider-profiles-mock-data";
import styles from "./hands-requests.module.css";

interface HandsRequestCardProps {
  request: LabourRequest;
  isSelected?: boolean;
  onSelect: (req: LabourRequest) => void;
  onReview: (req: LabourRequest) => void;
}

export function HandsRequestCard({
  request,
  isSelected = false,
  onSelect,
  onReview,
}: HandsRequestCardProps) {
  const router = useRouter();
  const match = calculateRequestMatch(request);
  const totalWorkers = request.requirements.reduce((acc, r) => acc + r.requiredCount, 0);
  const primaryTrade = request.requirements[0]?.trade || "Workforce";
  const providerDisplay = getProviderDisplayDetails(request.clientName, primaryTrade);

  return (
    <article
      className={`${styles.walletCard} ${isSelected ? styles.walletCardSelected : ""}`}
      onClick={() => onSelect(request)}
      tabIndex={0}
      role="button"
      aria-label={`Request from ${providerDisplay.name} for ${request.projectName}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(request);
        }
      }}
    >
      {/* 1. Upper Section (White Container matching reference top) */}
      <div className={styles.walletUpper}>
        {/* Row 1: Profile/Building Icon + Name & Top-Right Pill Button */}
        <div className={styles.walletHeaderRow}>
          <div
            className={styles.walletUserGroup}
            title={`View ${providerDisplay.name} Profile`}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/partner/hands/profile/${providerDisplay.slug}`);
            }}
          >
            <div className={styles.walletUserIconBox}>
              {providerDisplay.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={providerDisplay.avatarUrl}
                  alt={providerDisplay.name}
                  className={styles.walletUserAvatarImg}
                />
              ) : (
                <Building2 size={15} className={styles.walletUserIcon} />
              )}
            </div>
            <div className={styles.walletUserCol}>
              <span className={styles.walletUserName}>{providerDisplay.name}</span>
              <span className={styles.walletUserSub}>{providerDisplay.profession}</span>
            </div>
          </div>

          <span className={styles.walletTopPill}>
            {request.status === "rejected" ? (
              <span className={styles.cardStatusRejected}>Rejected</span>
            ) : request.status === "closed" ? (
              <span className={styles.cardStatusClosed}>Closed</span>
            ) : (
              <span>{request.createdAt}</span>
            )}
          </span>
        </div>

        {/* Row 2: "Available Balance" Label -> Workforce Demand */}
        <div className={styles.walletBalanceLabel}>Workforce Demand</div>

        {/* Row 3: Circular Icon + Hero Metric Number */}
        <div className={styles.walletHeroMetricRow}>
          <div className={styles.walletMetricCircle}>
            <Users size={16} color="#0f172a" />
          </div>
          <div className={styles.walletHeroNumber}>
            <span className={styles.srOnly}>{totalWorkers} Workers</span>
            <span aria-hidden="true" className={styles.walletHeroBig}>
              {totalWorkers}
            </span>
            <span aria-hidden="true" className={styles.walletHeroUnit}>
              Workers
            </span>
          </div>

          <div className={styles.walletBenchTag}>
            <span className={styles.benchDot}>●</span> {match.totalAvailable} Bench
          </div>
        </div>

        {/* Row 4: Trade Breakdown Pill Buttons (Duration removed from near workers) */}
        <div className={styles.walletActionPillsRow}>
          {request.requirements.map((r) => (
            <div key={r.trade} className={styles.walletPillBtn}>
              <Plus size={10} className={styles.walletPillIcon} />
              <span>
                {r.requiredCount} {r.trade}s
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Lower Section: "Last Transaction" / Project Details */}
      <div className={styles.walletLower}>
        {/* Section Header: Right Side Starting Date */}
        <div className={styles.walletSectionHeader}>
          <span className={styles.walletSectionSub}>Starting Date: {request.startDate}</span>
        </div>

        {/* Dashed hairline divider */}
        <div className={styles.walletDashedDivider} />

        {/* Transaction / Detail Item Row */}
        <div className={styles.walletDetailRow}>
          <div className={styles.walletDetailLeft}>
            <div className={styles.walletProjectAvatar}>
              <Calendar size={13} color="#059669" />
            </div>
            <div className={styles.walletProjectTexts}>
              <span className={styles.walletProjectName} title={request.projectName}>
                {request.projectName}
              </span>
              <span className={styles.walletProjectSub} title={request.location}>
                {request.location}
              </span>
            </div>
          </div>

          <div className={styles.walletDetailRight}>
            <span className={styles.walletRightBold}>{request.estimatedDuration}</span>
          </div>
        </div>

        {/* Bottom Review Action Button */}
        <button
          type="button"
          className={styles.cardActionBtn}
          onClick={(e) => {
            e.stopPropagation();
            onReview(request);
          }}
          aria-label={`${request.status === "rejected" || request.status === "closed" ? "View Details" : "Review Request"} for ${request.projectName}`}
        >
          <span>
            {request.status === "rejected" || request.status === "closed"
              ? "View Details"
              : "Review Request"}
          </span>
        </button>
      </div>
    </article>
  );
}
