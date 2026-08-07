"use client";

import styles from "./portfolio.module.css";

const PACKAGE_TIERS = [
  { id: "basic", label: "BASIC", rate: "₹2.5L+", badgeClass: styles.packageTierLabelBasic },
  { id: "advanced", label: "ADVANCED", rate: "₹5L+", badgeClass: styles.packageTierLabelAdvanced },
  { id: "luxury", label: "LUXURY", rate: "₹15L+", badgeClass: styles.packageTierLabelLuxury },
] as const;

interface PortfolioPackageSummaryProps {
  onViewPlans: () => void;
}

export function PortfolioPackageSummary({
  onViewPlans,
}: PortfolioPackageSummaryProps) {
  return (
    <aside
      className={styles.packageSummary}
      aria-labelledby="portfolio-package-summary-title"
    >
      <div className={styles.packageSummaryInner}>
        <div className={styles.packageSummaryUpper}>
          <div className={styles.packageSummaryHeader}>
            <h2 id="portfolio-package-summary-title">
              Design packages starting from ₹2.5 Lakhs
            </h2>
            <p>Tailored solution for every scale of project.</p>
          </div>

          <div className={styles.packageTiersRow}>
            {PACKAGE_TIERS.map((tier, index) => (
              <div className={styles.packageTierWrapper} key={tier.id}>
                {index > 0 ? <div className={styles.tierDivider} aria-hidden="true" /> : null}
                <div className={styles.packageTierCol}>
                  <div className={`${styles.packageTierPill} ${tier.badgeClass}`}>
                    <span>{tier.label}</span>
                  </div>
                  <strong className={styles.packageTierPrice}>{tier.rate}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          className={styles.viewPlansButton}
          type="button"
          onClick={onViewPlans}
        >
          <span>View Plans</span>
        </button>
      </div>
    </aside>
  );
}
