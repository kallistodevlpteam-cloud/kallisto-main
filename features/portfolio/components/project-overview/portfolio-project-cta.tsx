"use client";

import Link from "next/link";
import { MessageSquare, Sparkles } from "lucide-react";
import styles from "./portfolio-project-overview.module.css";

interface PortfolioProjectCTAProps {
  isOwner?: boolean;
  providerName?: string;
}

export function PortfolioProjectCTA({
  isOwner = true,
  providerName = "Arjun Architects",
}: PortfolioProjectCTAProps) {
  return (
    <section className={styles.ctaBox} aria-label="Project collaboration call to action">
      <div className={styles.ctaLeft}>
        <h3 className={styles.ctaTitle}>
          {isOwner
            ? `Interested in working with ${providerName}?`
            : "Start Your Construction Project with Kallisto"}
        </h3>
        <p className={styles.ctaSubtitle}>
          {isOwner
            ? "Let's discuss how we can bring your architectural, interior, or construction vision to life."
            : "Connect with verified top-tier architects, interior designers, and project managers today."}
        </p>
      </div>

      <div className={styles.ctaActions}>
        <Link
          href="/portfolio?portfolioTab=pricing"
          className={styles.ctaPrimaryBtn}
        >
          <Sparkles size={15} />
          <span>{isOwner ? "Request a Service" : "Explore Packages"}</span>
        </Link>

        <Link
          href="/portfolio?portfolioTab=reviews"
          className={styles.ctaSecondaryBtn}
        >
          <MessageSquare size={15} />
          <span>{isOwner ? "Contact Provider" : "Get in Touch"}</span>
        </Link>
      </div>
    </section>
  );
}
