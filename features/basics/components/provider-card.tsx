"use client";

import {
  Bookmark,
  Check,
  Columns3,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { BasicsProvider } from "../types/basics.types";
import {
  formatCurrency,
  pricingLabels,
} from "../utils/basics-formatters";
import styles from "./basics-workspace.module.css";
import { ProviderLogoTile } from "./provider-logo-tile";

export function ProviderCard({
  provider,
  projectId,
  discovery = false,
  selected = false,
  saved = false,
  compareDisabled = false,
  onToggleCompare,
  onToggleSave,
}: {
  provider: BasicsProvider;
  projectId?: string;
  discovery?: boolean;
  selected?: boolean;
  saved?: boolean;
  compareDisabled?: boolean;
  onToggleCompare?: (providerId: string) => void;
  onToggleSave?: (providerId: string) => void;
}) {
  const router = useRouter();
  const profileHref = `/basics/experts/${provider.id}${
    projectId ? `?projectId=${encodeURIComponent(projectId)}` : ""
  }`;

  function handleCardClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("button")) {
      return;
    }
    router.push(profileHref);
  }

  return (
    <article
      className={styles.refPortraitCard}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(profileHref);
        }
      }}
      aria-label={`View ${provider.name} specialist profile`}
    >
      {/* Top Rounded Brand Logo Tile Container */}
      <div className={styles.refPortraitWrap}>
        <ProviderLogoTile name={provider.name} />

        {/* Top-Right Badge: Star Rating */}
        <div className={styles.refPortraitBadgeWrap}>
          <span className={styles.refRatingBadge}>
            <Star size={11} className={styles.refRatingStar} fill="currentColor" aria-hidden="true" />
            <span>{provider.rating.toFixed(1)}</span>
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className={styles.refPortraitBody}>
        {/* Title Section: Name, Domain Subtitle & Right-Aligned Bookmark Save Button */}
        <div className={styles.refTitleSection}>
          <div className={styles.refTitleTextGroup}>
            <h3 className={styles.refProviderName}>
              <span>{provider.name}</span>
            </h3>
            <p className={styles.refProviderSubtitle}>
              {provider.specializations[0] ?? (provider.companyName && provider.companyName !== provider.name ? provider.companyName : "Specialist")}
            </p>
          </div>

          {onToggleSave ? (
            <button
              type="button"
              className={`${styles.refTitleSaveBtn} ${saved ? styles.refTitleSaveBtnActive : ""}`}
              aria-label={saved ? `Remove ${provider.name} from saved experts` : `Save ${provider.name}`}
              aria-pressed={saved}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(provider.id);
              }}
            >
              {saved ? (
                <Bookmark size={15} fill="currentColor" style={{ color: "#0f172a" }} aria-hidden="true" />
              ) : (
                <Bookmark size={15} aria-hidden="true" />
              )}
            </button>
          ) : null}
        </div>

        {/* 3-Column Stats Metadata Section (Experience | Consults | Location) */}
        <div className={styles.refStatsGrid}>
          <div className={styles.refStatCol}>
            <span className={styles.refStatValue}>
              {provider.yearsOfExperience} yrs
              <span className="sr-only">{provider.yearsOfExperience} years</span>
            </span>
            <span className={styles.refStatLabel}>experience</span>
          </div>

          <div className={styles.refStatDivider} aria-hidden="true" />

          <div className={styles.refStatCol}>
            <span className={styles.refStatValue}>
              {provider.completedEngagements}+
            </span>
            <span className={styles.refStatLabel}>consults</span>
          </div>

          <div className={styles.refStatDivider} aria-hidden="true" />

          <div className={styles.refStatCol}>
            <span className={styles.refStatValue} title={`${provider.location.city}, ${provider.location.state}`}>
              {provider.location.city}
            </span>
            <span className={styles.refStatLabel}>location</span>
          </div>
        </div>

        {/* Footer: Price & Compare Action */}
        <div className={styles.refCardFooter}>
          <div className={styles.refPricingGroup}>
            <span className={styles.refPriceAmount}>
              {provider.pricing.startingFrom
                ? formatCurrency(provider.pricing.startingFrom, provider.pricing.currency)
                : "Quote"}
            </span>
            <span className={styles.refPriceSubtext}>
              {pricingLabels[provider.pricing.model] || "Fixed fee"}
            </span>
          </div>

          {discovery && onToggleCompare ? (
            <div className={styles.refCardActions}>
              <button
                type="button"
                className={`${styles.refCompareBtn} ${selected ? styles.refCompareBtnActive : ""}`}
                aria-pressed={selected}
                disabled={compareDisabled && !selected}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCompare(provider.id);
                }}
              >
                {selected ? <Check size={11} aria-hidden="true" /> : <Columns3 size={11} aria-hidden="true" />}
                <span>{selected ? "Selected" : "Compare"}</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
