"use client";

import React from "react";
import {
  Bookmark,
  CheckCircle2,
  Clock,
  HardHat,
  MapPin,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import type { TradeCrew } from "../services/trade-crews.mock";
import styles from "./hands-overview.module.css";

interface TradeCardProps {
  crew: TradeCrew;
  onRequestCrew: (crew: TradeCrew) => void;
  isSaved?: boolean;
  onToggleSave?: (crewId: string) => void;
}

export function TradeCard({
  crew,
  onRequestCrew,
  isSaved = false,
  onToggleSave,
}: TradeCardProps) {
  const IconComponent = crew.icon;

  return (
    <article className={styles.tradeCard} aria-label={`${crew.name} - ${crew.trade}`}>
      {/* Card Header: Icon/Avatar, Trade Info, Wishlist Button */}
      <div className={styles.tradeCardHeader}>
        <div className={styles.tradeCardHeaderLeft}>
          <div
            className={styles.tradeCardIconWrap}
            style={{ background: crew.bgTint, color: crew.accentColor }}
          >
            <IconComponent size={24} aria-hidden="true" />
          </div>
          <div className={styles.tradeCardMeta}>
            <div className={styles.tradeCardCategoryRow}>
              <span className={styles.tradeCategoryTag}>{crew.category}</span>
              {crew.verified && (
                <span className={styles.tradeVerifiedBadge} title="Kallisto Verified Workforce">
                  <ShieldCheck size={12} aria-hidden="true" />
                  <span>Verified</span>
                </span>
              )}
            </div>
            <h3 className={styles.tradeCardTitle}>{crew.name}</h3>
            <p className={styles.tradeLeadName}>
              Lead: <strong>{crew.leadName}</strong> · {crew.leadRole}
            </p>
          </div>
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          className={`${styles.tradeWishlistBtn} ${isSaved ? styles.tradeWishlistBtnActive : ""}`}
          onClick={() => onToggleSave?.(crew.id)}
          title={isSaved ? "Remove from saved crews" : "Save this crew"}
          aria-label={isSaved ? `Remove ${crew.name} from saved` : `Save ${crew.name}`}
          aria-pressed={isSaved}
        >
          <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} aria-hidden="true" />
        </button>
      </div>

      {/* Badges Row: Rating, Experience, Crew Size */}
      <div className={styles.tradeStatsRow}>
        <div className={styles.tradeStatBadge}>
          <Star size={13} className={styles.tradeStarIcon} aria-hidden="true" />
          <strong>{crew.rating}</strong>
          <span className={styles.tradeReviewCount}>({crew.reviewCount})</span>
        </div>

        <div className={styles.tradeStatBadge}>
          <Clock size={13} aria-hidden="true" />
          <span>{crew.experienceYears}+ yrs exp</span>
        </div>

        <div className={styles.tradeStatBadge}>
          <Users size={13} aria-hidden="true" />
          <span>{crew.crewSizeMin}–{crew.crewSizeMax} workers</span>
        </div>

        <div className={styles.tradeStatBadge}>
          <CheckCircle2 size={13} aria-hidden="true" />
          <span>{crew.completedJobs} shifts</span>
        </div>
      </div>

      {/* Skills Chips */}
      <div className={styles.tradeSkillsWrap} aria-label="Trade skills">
        {crew.skills.map((skill) => (
          <span key={skill} className={styles.tradeSkillPill}>
            {skill}
          </span>
        ))}
      </div>

      {/* Card Footer: Rate, Location, and Action Buttons */}
      <div className={styles.tradeCardFooter}>
        <div className={styles.tradePriceColumn}>
          <span className={styles.tradePriceLabel}>Daily Shift Rate</span>
          <div className={styles.tradePriceValue}>
            <strong>₹{crew.dailyRate.toLocaleString("en-IN")}</strong>
            <span className={styles.tradePriceUnit}>/ day</span>
          </div>
          <div className={styles.tradeLocationRow}>
            <MapPin size={11} aria-hidden="true" />
            <span>{crew.location}</span>
          </div>
        </div>

        <div className={styles.tradeActionGroup}>
          <button
            type="button"
            className={styles.tradeRequestBtn}
            onClick={() => onRequestCrew(crew)}
            aria-label={`Request ${crew.name}`}
          >
            <HardHat size={14} aria-hidden="true" />
            <span>Request Crew</span>
          </button>
        </div>
      </div>
    </article>
  );
}
