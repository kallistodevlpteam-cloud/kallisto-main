"use client";

import {
  AlertTriangle,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  HardHat,
  Layers3,
  MapPin,
  Plus,
  Star,
  Users,
  X,
} from "lucide-react";
import { RupeeIcon } from "@/components/layout/sidebar-icons";
import Image from "next/image";
import { useRef, useState } from "react";
import type { HandsTab, WorkforceRequest } from "../types/hands.types";
import { getFulfilmentPercentage } from "../utils/hands-formatters";
import { useDrawerBehaviour } from "./use-drawer-behaviour";
import { getTradeIcon } from "./workforce-request-card";
import styles from "./hands-overview.module.css";

interface RequestDetailsDrawerProps {
  request: WorkforceRequest;
  onClose: () => void;
  onNavigateTab: (tab: HandsTab) => void;
  onRequestMore?: (request: WorkforceRequest) => void;
}

export function RequestDetailsDrawer({
  request,
  onClose,
  onNavigateTab,
  onRequestMore,
}: RequestDetailsDrawerProps) {
  const panelRef = useRef<HTMLElement>(null);
  useDrawerBehaviour(panelRef, onClose);
  const [imageError, setImageError] = useState(false);

  const isMultiTrade = Boolean(
    request.isMultiTrade ||
      (request.tradesBreakdown && request.tradesBreakdown.length > 1),
  );
  const trades = request.tradesBreakdown || [];

  const progress = getFulfilmentPercentage(request.fulfilled, request.quantity);
  const contractorTitle =
    request.contractorName ||
    (isMultiTrade
      ? "Multi-Trade Contractor Crew"
      : `${request.trade} Labour Team`);

  const statusClass =
    request.status === "Fulfilled"
      ? styles.statusActive
      : request.status === "Partially assigned"
        ? styles.statusWaiting
        : styles.statusAttention;

  const isPending = request.fulfilled < request.quantity;

  const tradesListString =
    trades.length > 0
      ? trades.map((t) => `${t.quantity} ${t.trade}`).join(", ")
      : request.trade;

  return (
    <div
      className={styles.drawerBackdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <aside
        ref={panelRef}
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-drawer-title"
        aria-describedby="request-drawer-description"
        tabIndex={-1}
      >
        <header className={styles.drawerHeader}>
          <div>
            <p>
              {isMultiTrade ? "Multi-trade request" : "Workforce request"}
            </p>
            <h2 id="request-drawer-title">{request.projectName}</h2>
            <span id="request-drawer-description">
              {isMultiTrade
                ? `Multi-trade crew (${trades.length} types) · ${request.location || "Site location"}`
                : `${request.trade} requirement · ${request.location || "Site location"}`}
            </span>
          </div>
          <button
            type="button"
            className={styles.drawerCloseButton}
            aria-label="Close workforce request details"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className={styles.drawerBody}>
          <div className={styles.drawerStatusRow}>
            <span className={`${styles.statusBadge} ${statusClass}`}>
              <span className={styles.statusDot} aria-hidden="true" />
              {request.status}
            </span>
            <span>Required by: {request.requiredDate}</span>
          </div>

          {/* Contractor Profile Card / Media Banner */}
          <div className={styles.drawerContractorCard}>
            {request.contractorCoverImage && !imageError ? (
              <div className={styles.drawerContractorImageWrap}>
                <Image
                  src={request.contractorCoverImage}
                  alt={`${contractorTitle} cover`}
                  fill
                  className={styles.drawerContractorImage}
                  onError={() => setImageError(true)}
                  unoptimized
                />
                <div className={styles.drawerContractorOverlay} />
              </div>
            ) : null}

            <div className={styles.drawerContractorMeta}>
              <div className={styles.drawerContractorHeader}>
                <div>
                  <h4 className={styles.drawerContractorTitle}>
                    {contractorTitle}
                  </h4>
                  <p className={styles.drawerContractorSub}>
                    {isMultiTrade
                      ? `Multi-Trade Squad (${trades.length > 0 ? `${trades.length} disciplines` : "Multiple Trades"})`
                      : request.trade}{" "}
                    · {request.contractorExperienceYears ?? 10}+ yrs exp
                  </p>
                </div>
                {request.contractorRating ? (
                  <span className={styles.drawerRatingPill}>
                    <Star
                      size={11}
                      className={styles.reqStarIcon}
                      aria-hidden="true"
                    />
                    {request.contractorRating.toFixed(1)}
                  </span>
                ) : null}
              </div>

              {/* Fulfilment Progress */}
              <div className={styles.drawerFulfilmentRow}>
                <div className={styles.drawerFulfilmentHeader}>
                  <span>Total crew assigned</span>
                  <strong>
                    {request.fulfilled} of {request.quantity} workers ({progress}%)
                  </strong>
                </div>
                <div
                  className={styles.reqProgressTrack}
                  role="progressbar"
                  aria-valuenow={request.fulfilled}
                  aria-valuemin={0}
                  aria-valuemax={request.quantity}
                >
                  <div
                    className={styles.reqProgressFill}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Trade Labour Breakdown Detailed Section */}
          {isMultiTrade && trades.length > 0 ? (
            <section
              className={styles.detailSection}
              aria-labelledby="trade-breakdown-specs-title"
            >
              <div className={styles.sectionHeaderRow}>
                <h3 id="trade-breakdown-specs-title">
                  Labour types breakdown
                </h3>
                <span className={styles.activityBadge}>
                  {trades.length} trades · {request.quantity} workers
                </span>
              </div>

              <div className={styles.drawerTradeBreakdownList}>
                {trades.map((t, idx) => {
                  const TradeIcon = getTradeIcon(t.trade);
                  const fCount = t.fulfilled ?? 0;
                  const tradeProgress = getFulfilmentPercentage(
                    fCount,
                    t.quantity,
                  );
                  const isTradeComplete = fCount >= t.quantity;

                  return (
                    <div key={idx} className={styles.drawerTradeBreakdownCard}>
                      <div className={styles.drawerTradeCardHeader}>
                        <div className={styles.drawerTradeTitleRow}>
                          <div className={styles.drawerTradeIconWrap}>
                            <TradeIcon size={14} aria-hidden="true" />
                          </div>
                          <div>
                            <strong className={styles.drawerTradeName}>
                              {t.trade}
                            </strong>
                            {t.skillLevel ? (
                              <span className={styles.drawerTradeSkill}>
                                {t.skillLevel}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className={styles.drawerTradeBadgeCol}>
                          <span
                            className={`${styles.drawerTradeStatusPill} ${
                              isTradeComplete
                                ? styles.taskPillCompleted
                                : fCount > 0
                                  ? styles.taskPillInProgress
                                  : styles.taskPillPending
                            }`}
                          >
                            {fCount} of {t.quantity} assigned
                          </span>
                        </div>
                      </div>

                      {/* Trade-specific Progress */}
                      <div className={styles.drawerTradeProgressWrap}>
                        <div
                          className={styles.reqProgressTrack}
                          role="progressbar"
                          aria-valuenow={fCount}
                          aria-valuemin={0}
                          aria-valuemax={t.quantity}
                        >
                          <div
                            className={styles.reqProgressFill}
                            style={{ width: `${tradeProgress}%` }}
                          />
                        </div>
                      </div>

                      {/* Trade Rate metadata */}
                      {t.dailyRate ? (
                        <div className={styles.drawerTradeRateMeta}>
                          <span>
                            Daily rate: ₹{t.dailyRate.toLocaleString("en-IN")}{" "}
                            / worker
                          </span>
                          <span>
                            Subtotal: ₹
                            {(t.dailyRate * t.quantity).toLocaleString("en-IN")}
                            /day
                          </span>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* Request Specification Section */}
          <section
            className={styles.detailSection}
            aria-labelledby="request-specs-title"
          >
            <h3 id="request-specs-title">Request specification</h3>
            <dl className={styles.detailList}>
              <div>
                <dt>
                  <MapPin size={15} aria-hidden="true" />
                  Project site
                </dt>
                <dd>
                  {request.projectName}, {request.location || "Kerala"}
                </dd>
              </div>
              <div>
                <dt>
                  {isMultiTrade ? (
                    <Layers3 size={15} aria-hidden="true" />
                  ) : (
                    <HardHat size={15} aria-hidden="true" />
                  )}
                  {isMultiTrade ? "Disciplines" : "Trade / Category"}
                </dt>
                <dd>{tradesListString}</dd>
              </div>
              <div>
                <dt>
                  <Users size={15} aria-hidden="true" />
                  Total requested
                </dt>
                <dd>
                  {request.quantity} workers{" "}
                  {isMultiTrade ? `(${trades.length} types)` : ""}
                </dd>
              </div>
              <div>
                <dt>
                  <CheckCircle2 size={15} aria-hidden="true" />
                  Currently assigned
                </dt>
                <dd>
                  {request.fulfilled} workers (
                  {request.quantity - request.fulfilled} pending)
                </dd>
              </div>
              <div>
                <dt>
                  <CalendarClock size={15} aria-hidden="true" />
                  Shift timing
                </dt>
                <dd>{request.shiftTiming || "8:00 AM – 5:00 PM"}</dd>
              </div>
              {request.dailyRate ? (
                <div>
                  <dt>
                    <RupeeIcon size={15} aria-hidden="true" />
                    Est. avg rate
                  </dt>
                  <dd>
                    ₹{request.dailyRate.toLocaleString("en-IN")} / worker / day
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          {isPending ? (
            <div className={styles.drawerNotice} role="status">
              <div className={styles.drawerNoticeContent}>
                <AlertTriangle
                  size={16}
                  className={styles.drawerNoticeIcon}
                  aria-hidden="true"
                />
                <div className={styles.drawerNoticeText}>
                  <p>
                    {request.quantity - request.fulfilled} worker position
                    {request.quantity - request.fulfilled > 1 ? "s are" : " is"}{" "}
                    still pending assignment under this contractor. Matching
                    with verified Kallisto tradesmen.
                  </p>
                  {onRequestMore ? (
                    <button
                      type="button"
                      className={styles.noticeActionBtn}
                      onClick={() => onRequestMore(request)}
                    >
                      <Plus size={13} aria-hidden="true" />
                      Add / modify requirement
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <footer className={styles.drawerFooter}>
          {onRequestMore ? (
            <button
              type="button"
              className={styles.drawerRequestWorkersBtn}
              onClick={() => onRequestMore(request)}
            >
              <Plus size={14} aria-hidden="true" />
              Request more
            </button>
          ) : null}
          <div className={styles.drawerFooterActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => {
                onClose();
                onNavigateTab("deployments");
              }}
            >
              View deployments
            </button>
          </div>
        </footer>
      </aside>
    </div>
  );
}

