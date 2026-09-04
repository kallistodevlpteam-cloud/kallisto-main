"use client";

import React from "react";
import type { RegisteredServiceProvider } from "../types/client-providers.types";
import styles from "../styles/client-providers.module.css";

interface FeaturedSpecialistsCirclesProps {
  providers: RegisteredServiceProvider[];
  onSelectProvider: (provider: RegisteredServiceProvider) => void;
}

export function FeaturedSpecialistsCircles({
  providers,
  onSelectProvider,
}: FeaturedSpecialistsCirclesProps) {
  return (
    <section className={styles.featuredSection} aria-label="Featured Specialists This Week">
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionHeading}>FEATURED</h3>
        <p className={styles.sectionSubheading}>this week</p>
      </div>

      <div className={styles.discsTrack}>
        {providers.map((provider) => (
          <button
            key={provider.id}
            className={styles.discCard}
            type="button"
            onClick={() => onSelectProvider(provider)}
            aria-label={`View ${provider.name} - ${provider.categoryLabel}`}
          >
            <div
              className={styles.discVinyl}
              style={{
                background: provider.discArtworkGradient,
              }}
            >
              <div className={styles.discCenterHole}>
                <div className={styles.discCenterDot} />
              </div>
            </div>

            <div className={styles.discMeta}>
              <span className={styles.discName}>{provider.name}</span>
              <span className={styles.discRole}>{provider.leadConsultant.role.split(" ")[0]} · {provider.city}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
