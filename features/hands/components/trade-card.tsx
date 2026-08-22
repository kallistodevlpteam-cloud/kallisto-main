"use client";

import React from "react";
import {
  Bookmark,
  Building2,
  Columns3,
  Compass,
  Droplets,
  Grid3X3,
  Layers,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import type { TradeCrew } from "../services/trade-crews.mock";
import styles from "./hands-overview.module.css";

interface TradeCardProps {
  crew: TradeCrew;
  onRequestCrew: (crew: TradeCrew) => void;
  isSaved?: boolean;
  onToggleSave?: (crewId: string) => void;
}

function getBrandInfo(crew: TradeCrew): { name: string; icon: React.ElementType; color: string } {
  const tradeLower = crew.trade.toLowerCase() + " " + crew.category.toLowerCase();

  if (tradeLower.includes("electric") || tradeLower.includes("mep")) {
    return { name: "circuit", icon: Zap, color: "#06b6d4" };
  }
  if (tradeLower.includes("plumb") || tradeLower.includes("sanitary")) {
    return { name: "hydro", icon: Droplets, color: "#38bdf8" };
  }
  if (tradeLower.includes("wood") || tradeLower.includes("carpenter") || tradeLower.includes("formwork")) {
    return { name: "forma", icon: Layers, color: "#10b981" };
  }
  if (tradeLower.includes("steel") || tradeLower.includes("rebar") || tradeLower.includes("reinforce")) {
    return { name: "struct", icon: Grid3X3, color: "#a855f7" };
  }
  if (tradeLower.includes("paint") || tradeLower.includes("finish") || tradeLower.includes("coat")) {
    return { name: "chroma", icon: Sparkles, color: "#f43f5e" };
  }
  if (tradeLower.includes("supervisor") || tradeLower.includes("qa") || tradeLower.includes("manage")) {
    return { name: "siteguard", icon: ShieldCheck, color: "#eab308" };
  }
  if (tradeLower.includes("survey") || tradeLower.includes("qs")) {
    return { name: "geoscan", icon: Compass, color: "#818cf8" };
  }

  // Default Civil / Masonry
  return { name: "apex", icon: Building2, color: "#f97316" };
}

export function TradeCard({
  crew,
  onRequestCrew,
  isSaved = false,
  onToggleSave,
}: TradeCardProps) {
  const brand = getBrandInfo(crew);
  const BrandIcon = brand.icon;

  // Extract clean city name
  const cityOnly = crew.location.split(",")[0].trim();

  return (
    <article className={styles.tradeCard} aria-label={`${crew.name} - ${crew.trade}`}>
      {/* 1. Top Media / Dark Graphic Cover */}
      <div className={styles.tradeCoverArea}>
        <div className={styles.tradeCoverGrid} aria-hidden="true" />

        {/* Top-Right Floating Rating Badge */}
        <div className={styles.tradeRatingBadge}>
          <Star size={11} className={styles.tradeStarIcon} aria-hidden="true" />
          <span>{crew.rating.toFixed(1)}</span>
        </div>

        {/* Centered Brand Emblem */}
        <div className={styles.tradeBrandMark}>
          <div
            className={styles.tradeBrandIconWrap}
            style={{ color: brand.color, filter: `drop-shadow(0 0 8px ${brand.color}66)` }}
          >
            <BrandIcon size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>
          <span className={styles.tradeBrandText}>
            {brand.name}
            <span className={styles.tradeBrandDot}>°</span>
          </span>
        </div>
      </div>

      {/* 2. Title & Trade Subtitle with Bookmark */}
      <div className={styles.tradeCardBody}>
        <div className={styles.tradeCardTitleRow}>
          <div className={styles.tradeCardTitleWrap}>
            <h3 className={styles.tradeCardTitle} title={crew.name}>
              {crew.name}
            </h3>
            <p className={styles.tradeCardSubtitle}>{crew.trade || crew.category}</p>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            className={`${styles.tradeBookmarkBtn} ${isSaved ? styles.tradeBookmarkBtnActive : ""}`}
            onClick={() => onToggleSave?.(crew.id)}
            title={isSaved ? "Remove from saved crews" : "Save this crew"}
            aria-label={isSaved ? `Remove ${crew.name} from saved` : `Save ${crew.name}`}
            aria-pressed={isSaved}
          >
            <Bookmark
              size={18}
              strokeWidth={1.9}
              fill={isSaved ? "currentColor" : "none"}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* 3. 3-Column Stat Metric Strip */}
        <div className={styles.tradeMetricsRow}>
          {/* Column 1: Experience */}
          <div className={styles.tradeMetricCol}>
            <strong className={styles.tradeMetricValue}>{crew.experienceYears} yrs</strong>
            <span className={styles.tradeMetricLabel}>experience</span>
          </div>

          {/* Column 2: Deployments / Consults */}
          <div className={styles.tradeMetricCol}>
            <strong className={styles.tradeMetricValue}>{crew.completedJobs}+</strong>
            <span className={styles.tradeMetricLabel}>deployments</span>
          </div>

          {/* Column 3: Location */}
          <div className={styles.tradeMetricCol}>
            <strong className={styles.tradeMetricValue}>{cityOnly}</strong>
            <span className={styles.tradeMetricLabel}>location</span>
          </div>
        </div>

        {/* 4. Bottom Rate & Compare Action Button */}
        <div className={styles.tradeCardBottomRow}>
          <div className={styles.tradePriceWrap}>
            <strong className={styles.tradePriceAmount}>
              ₹{crew.dailyRate.toLocaleString("en-IN")}
            </strong>
            <span className={styles.tradePricePeriod}>Per day</span>
          </div>

          <button
            type="button"
            className={styles.tradeCompareBtn}
            onClick={() => onRequestCrew(crew)}
            aria-label={`Request ${crew.name}`}
          >
            <Columns3 size={13} aria-hidden="true" />
            <span>Compare</span>
          </button>
        </div>
      </div>
    </article>
  );
}
