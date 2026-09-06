"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Star,
  Building,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { RupeeIcon } from "@/components/layout/sidebar-icons";
import type { RegisteredServiceProvider } from "../types/client-providers.types";
import styles from "../styles/client-providers.module.css";

interface ProviderCoverflowHeroProps {
  providers: RegisteredServiceProvider[];
  onSelectProvider: (provider: RegisteredServiceProvider) => void;
  onOpenOdinWithProvider?: (provider: RegisteredServiceProvider) => void;
}

export function ProviderCoverflowHero({
  providers,
  onSelectProvider,
  onOpenOdinWithProvider,
}: ProviderCoverflowHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : providers.length - 1));
  }, [providers.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev < providers.length - 1 ? prev + 1 : 0));
  }, [providers.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext]);

  return (
    <section className={styles.heroSection} aria-label="Featured Registered Service Providers">
      <div className={styles.coverflowStage}>
        <button
          className={`${styles.coverflowNavBtn} ${styles.navBtnPrev}`}
          onClick={handlePrev}
          type="button"
          aria-label="Previous Featured Provider"
        >
          <ChevronLeft size={22} />
        </button>

        <div className={styles.coverflowTrack}>
          {providers.map((provider, index) => {
            const offset = index - activeIndex;

            let cardClass = styles.cardHidden;
            if (offset === 0) {
              cardClass = styles.cardActive;
            } else if (offset === -1 || (activeIndex === 0 && index === providers.length - 1 && providers.length > 2)) {
              cardClass = styles.cardPrev;
            } else if (offset === 1 || (activeIndex === providers.length - 1 && index === 0 && providers.length > 2)) {
              cardClass = styles.cardNext;
            } else if (offset === -2) {
              cardClass = styles.cardFarPrev;
            } else if (offset === 2) {
              cardClass = styles.cardFarNext;
            }

            const isCurrent = offset === 0;

            return (
              <div
                key={provider.id}
                className={`${styles.coverflowCard} ${cardClass}`}
                style={{
                  backgroundImage: `url(${provider.coverImage})`,
                }}
                onClick={() => {
                  if (isCurrent) {
                    onSelectProvider(provider);
                  } else {
                    setActiveIndex(index);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`${provider.name} - ${provider.rankBadge}`}
              >
                <div
                  className={styles.cardOverlay}
                  style={{
                    background: `linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(15, 23, 42, 0.88) 100%), ${provider.bannerGradient}`,
                    backgroundBlendMode: "overlay, normal",
                  }}
                >
                  <div className={styles.cardTopRow}>
                    <span className={styles.rankBadge}>{provider.rankBadge}</span>
                    <div className={styles.verifiedPill}>
                      <ShieldCheck size={14} />
                      <span>{provider.verificationBadge}</span>
                    </div>
                  </div>

                  <div className={styles.cardCenterContent}>
                    <p className={styles.cardEyebrow}>{provider.categoryLabel}</p>
                    <h2 className={styles.cardTitle}>{provider.name}</h2>
                    <p className={styles.cardTagline}>{provider.tagline}</p>
                  </div>

                  <div className={styles.cardBottomRow}>
                    <div className={styles.cardMetaGroup}>
                      <div className={styles.metaBlock}>
                        <span className={styles.metaLabel}>Rating & Reviews</span>
                        <span className={styles.metaValue}>
                          <Star size={14} fill="#f59e0b" color="#f59e0b" />
                          {provider.rating.toFixed(1)} ({provider.reviewCount})
                        </span>
                      </div>

                      <div className={styles.metaBlock}>
                        <span className={styles.metaLabel}>Completed Jobs</span>
                        <span className={styles.metaValue}>
                          <Building size={14} />
                          {provider.completedProjectsCount} Projects
                        </span>
                      </div>

                      <div className={styles.metaBlock}>
                        <span className={styles.metaLabel}>Starting Fee</span>
                        <span className={styles.metaValue}>
                          <RupeeIcon size={14} />
                          {provider.baseFee}
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        className={styles.btnCoverflowPrimary}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProvider(provider);
                        }}
                      >
                        <span>View Virtual Office</span>
                        <ArrowRight size={14} />
                      </button>

                      {onOpenOdinWithProvider && (
                        <button
                          className={styles.btnCoverflowSecondary}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenOdinWithProvider(provider);
                          }}
                        >
                          <Sparkles size={14} />
                          <span>Ask Odin</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          className={`${styles.coverflowNavBtn} ${styles.navBtnNext}`}
          onClick={handleNext}
          type="button"
          aria-label="Next Featured Provider"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      <div className={styles.coverflowDots}>
        {providers.map((p, i) => (
          <button
            key={p.id}
            className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ""}`}
            onClick={() => setActiveIndex(i)}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
