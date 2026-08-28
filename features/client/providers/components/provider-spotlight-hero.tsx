"use client";

import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import type { RegisteredServiceProvider } from "../types/client-providers.types";
import styles from "../styles/client-providers.module.css";

interface ProviderSpotlightHeroProps {
  providers: RegisteredServiceProvider[];
  onSelectProvider: (provider: RegisteredServiceProvider) => void;
  onOpenOdin?: (provider: RegisteredServiceProvider) => void;
}

export function ProviderSpotlightHero({
  providers,
  onSelectProvider,
}: ProviderSpotlightHeroProps) {
  // Render top 2 banners side by side
  const spotlightProviders = providers.slice(0, 2);

  return (
    <section className={styles.heroBannersGrid} aria-label="Featured Spotlight Practices">
      {spotlightProviders.map((provider) => (
        <div
          key={provider.id}
          className={styles.cinematicBannerCard}
          style={{ backgroundImage: `url(${provider.coverImage})` }}
          onClick={() => onSelectProvider(provider)}
          role="button"
          tabIndex={0}
          aria-label={`Inspect ${provider.name}`}
        >
          <div className={styles.cinematicBannerOverlay}>
            <h2 className={styles.cinematicTitle}>{provider.name}</h2>
            <p className={styles.cinematicSubtitle}>
              {provider.tagline}
            </p>
            <button
              className={styles.btnCinematicAction}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectProvider(provider);
              }}
            >
              <span>CONSULT</span>
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}
