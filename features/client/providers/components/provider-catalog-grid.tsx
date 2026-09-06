"use client";

import React, { useState, useMemo } from "react";
import {
  Star,
  Building2,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { RupeeIcon } from "@/components/layout/sidebar-icons";
import type { RegisteredServiceProvider, ProviderCategory } from "../types/client-providers.types";
import styles from "../styles/client-providers.module.css";

interface ProviderCatalogGridProps {
  providers: RegisteredServiceProvider[];
  searchQuery: string;
  onSelectProvider: (provider: RegisteredServiceProvider) => void;
}

const CATEGORY_FILTERS: { id: ProviderCategory | "all"; label: string }[] = [
  { id: "all", label: "All Specialists" },
  { id: "architecture", label: "Architecture" },
  { id: "interior_design", label: "Interior Design" },
  { id: "structural_engineering", label: "Structural Engg" },
  { id: "general_contracting", label: "Contractors" },
  { id: "mep_engineering", label: "MEP & Solar" },
  { id: "landscape_architecture", label: "Landscape" },
];

export function ProviderCatalogGrid({
  providers,
  searchQuery,
  onSelectProvider,
}: ProviderCatalogGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<ProviderCategory | "all">("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");

  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
      const matchesCity = selectedCity === "all" || p.city.toLowerCase() === selectedCity.toLowerCase();

      return matchesSearch && matchesCategory && matchesCity;
    });
  }, [providers, searchQuery, selectedCategory, selectedCity]);

  return (
    <section className={styles.catalogSection} aria-label="Registered Service Providers Catalog">
      <div className={styles.catalogFilterBar}>
        <div className={styles.categoryPills}>
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.pillBtn} ${selectedCategory === cat.id ? styles.pillBtnActive : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
              type="button"
            >
              {cat.label}
            </button>
          ))}
        </div>

        <select
          className={styles.locationSelect}
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          aria-label="Filter by Location"
        >
          <option value="all">All Kerala Locations</option>
          <option value="kochi">Kochi / Ernakulam</option>
          <option value="calicut">Calicut / Kozhikode</option>
          <option value="trivandrum">Thiruvananthapuram</option>
          <option value="thrissur">Thrissur</option>
        </select>
      </div>

      <div className={styles.providerGrid}>
        {filteredProviders.map((provider) => (
          <div
            key={provider.id}
            className={styles.providerCard}
            onClick={() => onSelectProvider(provider)}
            role="button"
            tabIndex={0}
            aria-label={`View ${provider.name} profile`}
          >
            <div
              className={styles.cardBanner}
              style={{ backgroundImage: `url(${provider.coverImage})` }}
            >
              <div className={styles.cardBannerOverlay}>
                <span className={styles.cardBadge}>{provider.rankBadge}</span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    background: "rgba(255, 255, 255, 0.9)",
                    color: "#0f172a",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: "9999px",
                  }}
                >
                  <ShieldCheck size={12} color="#16a34a" />
                  <span>Verified</span>
                </span>
              </div>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.providerHeaderRow}>
                <div className={styles.providerIdentity}>
                  <h3 className={styles.providerName}>{provider.name}</h3>
                  <p className={styles.providerCategory}>{provider.categoryLabel}</p>
                </div>
                <span className={styles.ratingBadge}>
                  <Star size={12} fill="#92400e" color="#92400e" />
                  {provider.rating.toFixed(1)}
                </span>
              </div>

              <div className={styles.providerStatsRow}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Experience</span>
                  <span className={styles.statValue}>{provider.experienceYears} Yrs</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Delivered</span>
                  <span className={styles.statValue}>{provider.completedProjectsCount} Projects</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Location</span>
                  <span className={styles.statValue}>{provider.city}</span>
                </div>
              </div>

              <div className={styles.providerFooter}>
                <div className={styles.pricingBlock}>
                  <span className={styles.pricingLabel}>Base Pricing</span>
                  <span className={styles.pricingValue}>
                    <RupeeIcon size={13} />
                    {provider.baseFee}
                  </span>
                </div>

                <button
                  className={styles.btnViewOffice}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProvider(provider);
                  }}
                >
                  <span>Virtual Office</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
