"use client";

import React from "react";
import {
  Bookmark,
  Columns2,
  Star,
} from "lucide-react";
import type { TradeCrew } from "../services/trade-crews.mock";
import styles from "./hands-overview.module.css";

interface TradeCardProps {
  crew: TradeCrew;
  onRequestCrew: (crew: TradeCrew) => void;
  isSaved?: boolean;
  onToggleSave?: (crewId: string) => void;
}

// Derive clean brand moniker from crew name (e.g. "Circuit MEP Design" -> "circuit", "Master Masons" -> "master", etc.)
function getBrandSlug(name: string): string {
  const firstWord = name.split(" ")[0].toLowerCase();
  return firstWord.replace(/[^a-z0-9]/g, "") || "kallisto";
}

export function TradeCard({
  crew,
  onRequestCrew,
  isSaved = false,
  onToggleSave,
}: TradeCardProps) {
  const brandSlug = getBrandSlug(crew.name);
  const city = crew.location.split(",")[0].trim();

  return (
    <article className={styles.tradeCard} aria-label={`${crew.name} - ${crew.trade}`}>
      {/* 1. Top Graphic Media Banner */}
      <div className={styles.tradeCardBanner}>
        {/* Floating Rating Pill (Top Right) */}
        <div
          className={styles.tradeRatingPill}
          title={`${crew.rating} stars from ${crew.reviewCount} reviews`}
        >
          <Star size={12} className={styles.tradeRatingStar} aria-hidden="true" />
          <span>{crew.rating.toFixed(1)}</span>
        </div>

        {/* Center Brand / Circuit Graphic */}
        <div className={styles.tradeBrandGraphic}>
          <svg
            width="34"
            height="18"
            viewBox="0 0 34 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.tradeCircuitIcon}
            aria-hidden="true"
          >
            <circle cx="9" cy="9" r="6" stroke="#22d3ee" strokeWidth="2.5" />
            <circle cx="9" cy="9" r="2.5" fill="#22d3ee" />
            <path
              d="M15 9H24L29 4H34"
              stroke="#22d3ee"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className={styles.tradeBrandText}>{brandSlug}</span>
          <span className={styles.tradeBrandDot}>°</span>
        </div>
      </div>

      {/* 2. Middle Title & Category Section */}
      <div className={styles.tradeCardBody}>
        <div className={styles.tradeCardTitleRow}>
          <h3 className={styles.tradeCardTitle}>{crew.name}</h3>
          <button
            type="button"
            className={`${styles.tradeWishlistBtn} ${isSaved ? styles.tradeWishlistBtnActive : ""}`}
            onClick={() => onToggleSave?.(crew.id)}
            title={isSaved ? "Remove from saved crews" : "Save this crew"}
            aria-label={isSaved ? `Remove ${crew.name} from saved` : `Save ${crew.name}`}
            aria-pressed={isSaved}
          >
            <Bookmark
              size={16}
              strokeWidth={1.8}
              fill={isSaved ? "currentColor" : "none"}
              aria-hidden="true"
            />
          </button>
        </div>
        <p className={styles.tradeCardSubtitle}>{crew.category || crew.trade}</p>
      </div>

      {/* 3. Three-column Stats Strip */}
      <div className={styles.tradeStatsStrip}>
        <div className={styles.tradeStatCol}>
          <strong className={styles.tradeStatValue}>{crew.experienceYears} yrs</strong>
          <span className={styles.tradeStatLabel}>experience</span>
        </div>
        <div className={`${styles.tradeStatCol} ${styles.tradeStatColDivider}`}>
          <strong className={styles.tradeStatValue}>{crew.completedJobs}+</strong>
          <span className={styles.tradeStatLabel}>consults</span>
        </div>
        <div className={`${styles.tradeStatCol} ${styles.tradeStatColDivider}`}>
          <strong className={styles.tradeStatValue}>{city}</strong>
          <span className={styles.tradeStatLabel}>location</span>
        </div>
      </div>

      {/* 4. Bottom Price & Action Row */}
      <div className={styles.tradeCardFooter}>
        <div className={styles.tradePriceBox}>
          <strong className={styles.tradePriceAmount}>
            ₹{crew.dailyRate.toLocaleString("en-IN")}
          </strong>
          <span className={styles.tradePriceUnit}>Per sq ft</span>
        </div>

        <button
          type="button"
          className={styles.tradeCompareBtn}
          onClick={() => onRequestCrew(crew)}
          aria-label={`Request ${crew.name}`}
          title={`Request ${crew.name}`}
        >
          <Columns2 size={13} aria-hidden="true" />
          <span>Compare</span>
        </button>
      </div>
    </article>
  );
}
