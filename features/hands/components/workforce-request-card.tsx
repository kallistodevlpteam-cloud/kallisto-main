"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Building2,
  Compass,
  Droplets,
  Grid3X3,
  HardHat,
  Layers,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
  ArrowRight,
  Layers3,
} from "lucide-react";
import type { WorkforceRequest, WorkerTrade } from "../types/hands.types";
import { getFulfilmentPercentage } from "../utils/hands-formatters";
import styles from "./hands-overview.module.css";

interface WorkforceRequestCardProps {
  request: WorkforceRequest;
  onSelect?: (request: WorkforceRequest) => void;
  onRequestWorkforce?: () => void;
}

function getBrandInfo(request: WorkforceRequest): {
  name: string;
  icon: React.ElementType;
  color: string;
} {
  const brandLower = (request.contractorBrand || "").toLowerCase();
  const tradeLower = (request.trade || "").toLowerCase();

  if (brandLower === "circuit" || tradeLower.includes("electric") || tradeLower.includes("mep")) {
    return { name: "circuit", icon: Zap, color: "#06b6d4" };
  }
  if (brandLower === "hydro" || tradeLower.includes("plumb") || tradeLower.includes("sanitary")) {
    return { name: "hydro", icon: Droplets, color: "#38bdf8" };
  }
  if (brandLower === "forma" || tradeLower.includes("wood") || tradeLower.includes("carpent")) {
    return { name: "forma", icon: Layers, color: "#10b981" };
  }
  if (brandLower === "struct" || tradeLower.includes("steel") || tradeLower.includes("rebar")) {
    return { name: "struct", icon: Grid3X3, color: "#a855f7" };
  }
  if (brandLower === "chroma" || tradeLower.includes("paint") || tradeLower.includes("finish")) {
    return { name: "chroma", icon: Sparkles, color: "#f43f5e" };
  }
  if (brandLower === "siteguard" || tradeLower.includes("supervisor")) {
    return { name: "siteguard", icon: ShieldCheck, color: "#eab308" };
  }
  if (brandLower === "geoscan" || tradeLower.includes("survey")) {
    return { name: "geoscan", icon: Compass, color: "#818cf8" };
  }

  // Default Apex BuildForce / Multi-trade / Masonry
  return { name: "apex", icon: request.isMultiTrade ? Layers3 : Building2, color: "#f97316" };
}

export function getTradeIcon(trade: WorkerTrade | string): React.ElementType {
  const t = trade.toLowerCase();
  if (t.includes("electric")) return Zap;
  if (t.includes("plumb") || t.includes("sanitary")) return Droplets;
  if (t.includes("carpent") || t.includes("wood")) return Layers;
  if (t.includes("paint")) return Sparkles;
  if (t.includes("mason") || t.includes("brick")) return Building2;
  if (t.includes("tile")) return Grid3X3;
  if (t.includes("helper")) return HardHat;
  return HardHat;
}

export function WorkforceRequestCard({
  request,
  onSelect,
  onRequestWorkforce,
}: WorkforceRequestCardProps) {
  const [imageError, setImageError] = useState(false);
  const brand = getBrandInfo(request);
  const BrandIcon = brand.icon;

  const isMultiTrade = Boolean(
    request.isMultiTrade ||
      (request.tradesBreakdown && request.tradesBreakdown.length > 1),
  );
  const trades = request.tradesBreakdown || [];

  const progress = getFulfilmentPercentage(request.fulfilled, request.quantity);
  const rating = request.contractorRating ?? 4.9;
  const contractorTitle =
    request.contractorName ||
    (isMultiTrade
      ? "Multi-Trade Contractor Crew"
      : `${request.trade} Labour Team`);

  const statusClass =
    request.status === "Fulfilled"
      ? styles.requestStatusFulfilled
      : request.status === "Partially assigned"
        ? styles.requestStatusPartial
        : styles.requestStatusMatching;

  const accessibleLabel = isMultiTrade
    ? `Multi-trade workforce request for ${request.projectName} under ${contractorTitle} with ${request.quantity} workers across ${trades.length} trades`
    : `${request.trade} request for ${request.projectName}`;

  return (
    <article
      className={`${styles.workforceRequestCard} ${
        isMultiTrade ? styles.workforceRequestCardMulti : ""
      }`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(request)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect?.(request);
        }
      }}
      aria-label={accessibleLabel}
    >
      {/* ── 1. Top Media / Contractor Cover Image ── */}
      <div className={styles.reqCardMedia}>
        {request.contractorCoverImage && !imageError ? (
          <div className={styles.reqCardImageWrap}>
            <Image
              src={request.contractorCoverImage}
              alt={`${contractorTitle} cover`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={styles.reqCardImage}
              onError={() => setImageError(true)}
              unoptimized
            />
            <div className={styles.reqCardOverlayDark} />
          </div>
        ) : (
          <div className={styles.reqCardCoverGrid} aria-hidden="true" />
        )}

        {/* Top-Right Floating Rating Badge */}
        <div className={styles.reqCardRatingBadge}>
          <Star size={11} className={styles.reqStarIcon} aria-hidden="true" />
          <span>{rating.toFixed(1)}</span>
        </div>

        {/* Top-Left Project & Multi-Trade Tag */}
        <div className={styles.reqProjectTagsRow}>
          <div className={styles.reqProjectTag}>
            <span>{request.projectName}</span>
          </div>
          {isMultiTrade ? (
            <div className={styles.reqMultiTradeTag}>
              <Layers3 size={11} aria-hidden="true" />
              <span>Multi-Trade</span>
            </div>
          ) : null}
        </div>

        {/* Centered Brand Emblem */}
        <div className={styles.reqBrandMark}>
          <div
            className={styles.reqBrandIconWrap}
            style={{
              color: brand.color,
              filter: `drop-shadow(0 0 8px ${brand.color}88)`,
            }}
          >
            <BrandIcon size={20} strokeWidth={2.4} aria-hidden="true" />
          </div>
          <span className={styles.reqBrandText}>
            {brand.name}
            <span className={styles.reqBrandDot}>°</span>
          </span>
        </div>
      </div>

      {/* ── 2. Card Body ── */}
      <div className={styles.reqCardBody}>
        {/* Title & Trade Category */}
        <div className={styles.reqCardHeaderRow}>
          <div className={styles.reqCardTitleWrap}>
            <h3 className={styles.reqCardTitle} title={contractorTitle}>
              {contractorTitle}
            </h3>
            <div className={styles.reqCardSubtitle}>
              {isMultiTrade ? (
                <span className={styles.reqMultiTradePill}>
                  <Layers3 size={11} aria-hidden="true" />
                  Multi-Trade Gang ({trades.length > 0 ? `${trades.length} Types` : "Multiple Trades"})
                </span>
              ) : (
                <span className={styles.reqTradeBadge}>{request.trade}</span>
              )}
              {request.location ? (
                <span className={styles.reqLocationText}>
                  <span>•</span>
                  <span>{request.location.split(",")[0]}</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Multi-Type Labours Breakdown (When contractor has multiple labour types) */}
        {isMultiTrade && trades.length > 0 ? (
          <div
            className={styles.reqMultiTradesBreakdown}
            aria-label="Labour trades breakdown"
          >
            <div className={styles.reqMultiTradesHeader}>
              <span>Labour trades breakdown</span>
              <span>{request.quantity} workers total</span>
            </div>
            <div className={styles.reqTradePillsList}>
              {trades.map((item, idx) => {
                const Icon = getTradeIcon(item.trade);
                const fulfilledCount = item.fulfilled ?? 0;
                return (
                  <div key={idx} className={styles.reqTradePillItem}>
                    <div className={styles.reqTradePillLead}>
                      <Icon
                        size={12}
                        className={styles.reqTradePillIcon}
                        aria-hidden="true"
                      />
                      <span className={styles.reqTradePillName}>
                        {item.trade}
                      </span>
                    </div>
                    <div className={styles.reqTradePillCounts}>
                      <strong className={styles.reqTradePillQty}>
                        {item.quantity} req
                      </strong>
                      <span className={styles.reqTradePillFulfilled}>
                        • {fulfilledCount} assigned
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* 3-Column Metric Strip */}
        <div className={styles.reqMetricsRow}>
          {/* Column 1: Requested Count */}
          <div className={styles.reqMetricCol}>
            <strong className={styles.reqMetricValue}>
              {request.quantity} workers
            </strong>
            <span className={styles.reqMetricLabel}>
              {isMultiTrade && trades.length > 0
                ? `${trades.length} trades req.`
                : "requested"}
            </span>
          </div>

          <div className={styles.reqMetricDivider} aria-hidden="true" />

          {/* Column 2: Fulfilled count */}
          <div className={styles.reqMetricCol}>
            <strong className={styles.reqMetricValue}>
              {request.fulfilled} / {request.quantity}
            </strong>
            <span className={styles.reqMetricLabel}>assigned</span>
          </div>

          <div className={styles.reqMetricDivider} aria-hidden="true" />

          {/* Column 3: Required Date */}
          <div className={styles.reqMetricCol}>
            <strong className={styles.reqMetricValue}>
              {request.requiredDate}
            </strong>
            <span className={styles.reqMetricLabel}>required date</span>
          </div>
        </div>

        {/* Fulfilment Progress Bar */}
        <div className={styles.reqProgressContainer}>
          <div className={styles.reqProgressLabels}>
            <span className={styles.reqProgressLabelText}>
              Contractor assignment
            </span>
            <span className={styles.reqProgressPercent}>{progress}%</span>
          </div>
          <div
            className={styles.reqProgressTrack}
            role="progressbar"
            aria-label={`${
              isMultiTrade ? "Multi-trade squad" : request.trade
            } assignment fulfilment`}
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

        {/* Card Footer: Status Badge & Track Action */}
        <div className={styles.reqCardBottomRow}>
          <span className={`${styles.reqStatusBadge} ${statusClass}`}>
            <span className={styles.reqStatusDot} aria-hidden="true" />
            {request.status}
          </span>

          <div className={styles.reqActionBtn}>
            <span>Track request</span>
            <ArrowRight size={13} aria-hidden="true" />
          </div>
        </div>
      </div>
    </article>
  );
}

