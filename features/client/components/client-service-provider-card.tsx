"use client";

import React, { useState } from "react";
import {
  Bookmark,
  Building2,
  Compass,
  Eye,
  Grid3X3,
  Layers,
  Star,
} from "lucide-react";
import styles from "./client-service-provider-card.module.css";

interface SpecialistProvider {
  id: string;
  name: string;
  role: string;
  brandName: string;
  brandIcon: React.ElementType;
  brandColor: string;
  rating: number;
  experienceYears: number;
  completedJobs: number;
  location: string;
  price: string;
  pricePeriod: string;
  prompt: string;
}

interface ClientServiceProviderCardProps {
  onOpenOdinWithPrompt?: (prompt: string) => void;
}

const SPECIALIST_PROVIDERS: SpecialistProvider[] = [
  {
    id: "sp-1",
    name: "Arjun Architects",
    role: "Lead Architectural Consultant",
    brandName: "arjun",
    brandIcon: Building2,
    brandColor: "#f97316",
    rating: 4.9,
    experienceYears: 14,
    completedJobs: 24,
    location: "Kochi",
    price: "₹1,85,000",
    pricePeriod: "Fixed fee",
    prompt: "Connect me with Arjun Architects regarding design revisions for Nila Residence",
  },
  {
    id: "sp-2",
    name: "Apex Consultants",
    role: "Structural & Civil Engineering",
    brandName: "struct",
    brandIcon: Grid3X3,
    brandColor: "#a855f7",
    rating: 4.8,
    experienceYears: 12,
    completedJobs: 38,
    location: "Calicut",
    price: "₹75,000",
    pricePeriod: "Fixed fee",
    prompt: "Show structural load testing certificates from Apex Structural Consultants",
  },
  {
    id: "sp-3",
    name: "Studio Luxe",
    role: "Interior & Fit-out Specialist",
    brandName: "forma",
    brandIcon: Layers,
    brandColor: "#10b981",
    rating: 4.9,
    experienceYears: 9,
    completedJobs: 45,
    location: "Ernakulam",
    price: "₹1,20,000",
    pricePeriod: "Fixed fee",
    prompt: "Discuss interior finishes and teak joinery with Studio Luxe",
  },
  {
    id: "sp-4",
    name: "Terra Geotechnics",
    role: "Geotechnical Engineering",
    brandName: "terra",
    brandIcon: Compass,
    brandColor: "#818cf8",
    rating: 4.6,
    experienceYears: 11,
    completedJobs: 32,
    location: "Thrissur",
    price: "₹30,500",
    pricePeriod: "Fixed fee",
    prompt: "Connect with Terra Geotechnics regarding soil testing and foundation report",
  },
];

export function ClientServiceProviderCard({ onOpenOdinWithPrompt }: ClientServiceProviderCardProps) {
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});

  const toggleSave = (id: string) => {
    setSavedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className={styles.container} aria-label="Service Provider & Specialist Team">
      {/* ── Section Header ───────────────────────────────────────────── */}
      <div className={styles.sectionHeader}>
        <div className={styles.titleGroup}>
          <h3 className={styles.sectionTitle}>SERVICE PROVIDER & SPECIALIST TEAM</h3>
          <span className={styles.countBadge}>4 Verified Partners</span>
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.statusDot} />
          <span className={styles.statusText}>Kallisto Verified Partners</span>
        </div>
      </div>

      {/* ── 4-Column Cards Grid (Hands Search Result Page Match) ──────── */}
      <div className={styles.cardsGrid}>
        {SPECIALIST_PROVIDERS.map((sp) => {
          const isBookmarked = Boolean(savedIds[sp.id]);
          const BrandIcon = sp.brandIcon;

          return (
            <article key={sp.id} className={styles.tradeCard} aria-label={`${sp.name} - ${sp.role}`}>
              {/* 1. Top Media / Dark Blueprint Graphic Cover */}
              <div
                className={styles.tradeCoverArea}
                onClick={() => onOpenOdinWithPrompt?.(sp.prompt)}
                title={`View ${sp.name} details`}
              >
                <div className={styles.tradeCoverGrid} aria-hidden="true" />

                {/* Top-Right Floating Rating Badge */}
                <div className={styles.tradeRatingBadge}>
                  <Star size={11} className={styles.tradeStarIcon} aria-hidden="true" />
                  <span>{sp.rating.toFixed(1)}</span>
                </div>

                {/* Centered Brand Emblem */}
                <div className={styles.tradeBrandMark}>
                  <div
                    className={styles.tradeBrandIconWrap}
                    style={{ color: sp.brandColor, filter: `drop-shadow(0 0 8px ${sp.brandColor}66)` }}
                  >
                    <BrandIcon size={22} strokeWidth={2.4} aria-hidden="true" />
                  </div>
                  <span className={styles.tradeBrandText}>
                    {sp.brandName}
                    <span className={styles.tradeBrandDot}>°</span>
                  </span>
                </div>
              </div>

              {/* 2. Title & Role with Bookmark */}
              <div className={styles.tradeCardBody}>
                <div className={styles.tradeCardTitleRow}>
                  <div className={styles.tradeCardTitleWrap}>
                    <h4 className={styles.tradeCardTitle} title={sp.name}>
                      {sp.name}
                    </h4>
                    <p className={styles.tradeCardSubtitle}>{sp.role}</p>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    className={`${styles.tradeBookmarkBtn} ${isBookmarked ? styles.tradeBookmarkBtnActive : ""}`}
                    onClick={() => toggleSave(sp.id)}
                    title={isBookmarked ? "Remove from saved" : "Save this partner"}
                    aria-label={isBookmarked ? `Remove ${sp.name} from saved` : `Save ${sp.name}`}
                    aria-pressed={isBookmarked}
                  >
                    <Bookmark
                      size={18}
                      strokeWidth={1.9}
                      fill={isBookmarked ? "currentColor" : "none"}
                      aria-hidden="true"
                    />
                  </button>
                </div>

                {/* 3. 3-Column Metric Strip (Experience | Deployments | Location) */}
                <div className={styles.tradeMetricsRow}>
                  <div className={styles.tradeMetricCol}>
                    <strong className={styles.tradeMetricValue}>{sp.experienceYears} yrs</strong>
                    <span className={styles.tradeMetricLabel}>experience</span>
                  </div>

                  <div className={styles.tradeMetricDivider} aria-hidden="true" />

                  <div className={styles.tradeMetricCol}>
                    <strong className={styles.tradeMetricValue}>{sp.completedJobs}+</strong>
                    <span className={styles.tradeMetricLabel}>deployments</span>
                  </div>

                  <div className={styles.tradeMetricDivider} aria-hidden="true" />

                  <div className={styles.tradeMetricCol}>
                    <strong className={styles.tradeMetricValue}>{sp.location}</strong>
                    <span className={styles.tradeMetricLabel}>location</span>
                  </div>
                </div>

                {/* 4. Bottom Rate & Compare Action Button */}
                <div className={styles.tradeCardBottomRow}>
                  <div className={styles.tradePriceWrap}>
                    <strong className={styles.tradePriceAmount}>{sp.price}</strong>
                    <span className={styles.tradePricePeriod}>{sp.pricePeriod}</span>
                  </div>

                  <button
                    type="button"
                    className={styles.tradeCompareBtn}
                    onClick={() => onOpenOdinWithPrompt?.(sp.prompt)}
                    aria-label={`View ${sp.name}`}
                  >
                    <Eye size={13} strokeWidth={2.2} aria-hidden="true" />
                    <span>View</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
