"use client";

import React from "react";
import { Sparkles, Star, Bot, ChevronRight } from "lucide-react";
import type { RegisteredServiceProvider } from "../types/client-providers.types";
import styles from "../styles/client-providers.module.css";

interface LatestPracticesCarouselProps {
  providers: RegisteredServiceProvider[];
  onSelectProvider: (provider: RegisteredServiceProvider) => void;
}

export function LatestPracticesCarousel({
  providers,
  onSelectProvider,
}: LatestPracticesCarouselProps) {
  // Show 4 practices in a row for this section
  const displayProviders = providers.length > 4 ? providers.slice(1, 5) : providers.slice(0, 4);

  return (
    <section className={styles.latestSection} aria-label="The latest analyzed practices">
      <div className={styles.sectionHeaderRow}>
        <div className={styles.sectionTitleGroup}>
          <Bot size={15} className={styles.sectionTitleIcon} />
          <h2 className={styles.sectionMainTitle}>The latest analyzed practices</h2>
        </div>

        <button
          className={styles.btnShowAllTheme}
          type="button"
          aria-label="Show all practices"
          onClick={() => {
            if (providers.length > 0) onSelectProvider(providers[0]);
          }}
        >
          <span>Show all</span>
          <ChevronRight size={13} />
        </button>
      </div>

      <div className={styles.latestCardsGrid}>
        {displayProviders.map((provider, index) => (
          <div
            key={provider.id}
            className={styles.analyzedCard}
            onClick={() => onSelectProvider(provider)}
            role="button"
            tabIndex={0}
            aria-label={`View ${provider.name}`}
          >
            <div
              className={styles.analyzedCardImageWrap}
              style={{ backgroundImage: `url(${provider.coverImage})` }}
            >
              <div className={styles.glassRatingBadge}>
                <Star size={11} fill="#ffffff" color="#ffffff" />
                <span>{provider.rating.toFixed(1)}</span>
              </div>
            </div>

            <div className={styles.cardBottomMetaRow}>
              <div
                className={styles.cardAvatarBadge}
                style={{
                  backgroundImage: `url(${provider.leadConsultant.avatar})`,
                  backgroundColor: provider.avatarColor,
                }}
              />
              <div className={styles.cardTextGroup}>
                <h3 className={styles.analyzedCardTitle}>{provider.name}</h3>
                <p className={styles.analyzedCardSubtitle}>
                  {provider.categoryLabel}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
