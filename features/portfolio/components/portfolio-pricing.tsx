"use client";

import { PortfolioPackageSummary } from "./portfolio-package-summary";
import styles from "./portfolio.module.css";

export function PortfolioPricing() {
  return (
    <div className={styles.pricingWrapper}>
      <PortfolioPackageSummary
        onViewPlans={() => {
          const tabBtn = document.getElementById("portfolio-tab-pricing");
          tabBtn?.focus();
        }}
      />
    </div>
  );
}
