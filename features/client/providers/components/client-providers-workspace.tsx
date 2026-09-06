"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Bookmark,
  ShoppingBag,
  SlidersHorizontal,
  ShieldCheck,
} from "lucide-react";
import { useOdin } from "@/hooks/use-odin";
import { REGISTERED_SERVICE_PROVIDERS } from "../data/registered-providers.mock";
import { ProviderSpotlightHero } from "./provider-spotlight-hero";
import { LatestPracticesCarousel } from "./latest-practices-carousel";
import { ProviderSidebarFeed } from "./provider-sidebar-feed";
import type { RegisteredServiceProvider, ProviderCategory } from "../types/client-providers.types";
import styles from "../styles/client-providers.module.css";

const PORTAL_TABS: { id: ProviderCategory | "all"; label: string }[] = [
  { id: "all", label: "Home" },
  { id: "architecture", label: "Architecture" },
  { id: "interior_design", label: "Interiors" },
  { id: "structural_engineering", label: "Structural" },
  { id: "general_contracting", label: "Contractors" },
  { id: "mep_engineering", label: "MEP & Solar" },
  { id: "landscape_architecture", label: "Landscape" },
];

export function ClientProvidersWorkspace() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProviderCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { openOdin } = useOdin();

  const handleSelectProvider = (provider: RegisteredServiceProvider) => {
    router.push(`/client/providers/${provider.id}`);
  };

  const filteredProviders = useMemo(() => {
    return REGISTERED_SERVICE_PROVIDERS.filter((p) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      if (activeTab === "all") return matchesSearch;
      return matchesSearch && p.category === activeTab;
    });
  }, [activeTab, searchQuery]);

  const handleOpenOdinWithProvider = (provider: RegisteredServiceProvider) => {
    openOdin({
      prompt: `I would like to review the qualifications, milestone pricing, and architectural portfolio of ${provider.name} for my construction project.`,
      context: {
        route: "/home",
        workspaceId: "client-portal",
        source: "home-templates",
        activeEntityId: provider.id,
        activeEntityType: "provider",
      },
    });
  };

  return (
    <div className={styles.pageContainer}>
      {/* Top Header Navigation Bar: Logo + Capsule Tabs on Left, Search + Actions on Right */}
      <header className={styles.topNavBar}>
        {/* Left: Logo & Capsule Category Tabs */}
        <div className={styles.topNavLeftGroup}>
          <div className={styles.brandLogoWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/kallisto-logo.png"
              alt="Kallisto"
              className={styles.brandImgLogo}
            />
          </div>

          <nav className={styles.capsuleTabBar} aria-label="Provider Categories">
            {PORTAL_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  className={`${styles.capsuleTabBtn} ${isActive ? styles.capsuleTabActive : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  aria-pressed={isActive}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Pill Search Box + Quick Action Icons */}
        <div className={styles.topRightControls}>
          <div className={styles.pillSearchBox}>
            <input
              type="text"
              className={styles.pillSearchInput}
              placeholder="Search practices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search registered providers"
            />
            <button
              className={styles.pillSearchSubmitBtn}
              type="button"
              aria-label="Submit search"
            >
              <Search size={14} />
            </button>
          </div>

          <button
            className={styles.circleActionBtn}
            type="button"
            title="Saved Practices"
            aria-label="Saved Practices"
          >
            <Bookmark size={16} />
          </button>

          <button
            className={styles.circleActionBtn}
            type="button"
            title="Enquiries & Briefs"
            aria-label="Enquiries & Briefs"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </header>

      {/* Main 2-Column Portal Layout */}
      <div className={styles.portalGrid}>
        {/* Left Column: Spotlight Hero + Latest Practices */}
        <main className={styles.mainColumn}>
          <ProviderSpotlightHero
            providers={filteredProviders}
            onSelectProvider={handleSelectProvider}
            onOpenOdin={handleOpenOdinWithProvider}
          />

          <LatestPracticesCarousel
            providers={filteredProviders}
            onSelectProvider={handleSelectProvider}
          />
        </main>

        {/* Right Column: Recent Updates & Top Leaderboard */}
        <ProviderSidebarFeed
          providers={REGISTERED_SERVICE_PROVIDERS}
          onSelectProvider={handleSelectProvider}
        />
      </div>
    </div>
  );
}
