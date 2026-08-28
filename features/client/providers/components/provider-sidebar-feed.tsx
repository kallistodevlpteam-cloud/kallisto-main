"use client";

import React from "react";
import { MoreHorizontal } from "lucide-react";
import type { RegisteredServiceProvider } from "../types/client-providers.types";
import styles from "../styles/client-providers.module.css";

interface ProviderSidebarFeedProps {
  providers: RegisteredServiceProvider[];
  onSelectProvider: (provider: RegisteredServiceProvider) => void;
}

const RECENT_NEWS = [
  {
    id: "news-1",
    headline: "Arjun Architects completes Kumarakom lakefront residence approval",
    date: "12/08/2026",
    thumbnail: "/assets/nila-hero.jpg",
    providerId: "provider-arjun-architects",
  },
  {
    id: "news-2",
    headline: "Apex Structural publishes deep piling load test standards for coastal soils",
    date: "04/08/2026",
    thumbnail: "/assets/hero-architecture-banner.webp",
    providerId: "provider-apex-structural",
  },
  {
    id: "news-3",
    headline: "Studio Luxe reveals custom teak joinery catalogue for luxury villas",
    date: "28/07/2026",
    thumbnail: "/assets/nila-thumb1.jpg",
    providerId: "provider-studio-luxe",
  },
];

export function ProviderSidebarFeed({
  providers,
  onSelectProvider,
}: ProviderSidebarFeedProps) {
  return (
    <aside className={styles.sideColumn} aria-label="Provider Highlights and Leaderboard">
      {/* Recent News Section */}
      <div className={styles.sidebarBlock}>
        <div className={styles.sidebarBlockHeader}>
          <h3 className={styles.sidebarBlockTitle}>Recent updates</h3>
          <button className={styles.moreOptionsBtn} type="button" aria-label="More updates">
            <MoreHorizontal size={16} />
          </button>
        </div>

        <div className={styles.recentNewsList}>
          {RECENT_NEWS.map((item) => {
            const provider = providers.find((p) => p.id === item.providerId);
            return (
              <div
                key={item.id}
                className={styles.newsItemRow}
                onClick={() => provider && onSelectProvider(provider)}
                role="button"
                tabIndex={0}
              >
                <div className={styles.newsMeta}>
                  <p className={styles.newsHeadline}>{item.headline}</p>
                  <span className={styles.newsDate}>{item.date}</span>
                </div>
                <div
                  className={styles.newsThumbnail}
                  style={{ backgroundImage: `url(${item.thumbnail})` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Practices Ranked Leaderboard */}
      <div className={styles.sidebarBlock}>
        <div className={styles.sidebarBlockHeader}>
          <h3 className={styles.sidebarBlockTitle}>Top Practices</h3>
          <button className={styles.moreOptionsBtn} type="button" aria-label="More top practices">
            <MoreHorizontal size={16} />
          </button>
        </div>

        <ol className={styles.rankedList}>
          {providers.map((provider, index) => (
            <li
              key={provider.id}
              className={styles.rankedRow}
              onClick={() => onSelectProvider(provider)}
            >
              <span className={styles.rankNumber}>{index + 1}</span>
              <span className={styles.rankedPracticeName}>{provider.name}</span>
              <span className={styles.rankScore}>★ {provider.rating.toFixed(1)}</span>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}
