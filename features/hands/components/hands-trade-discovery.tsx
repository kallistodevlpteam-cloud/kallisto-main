"use client";

import {
  Bookmark,
  Filter,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MOCK_TRADE_CREWS,
  type TradeCrew,
} from "../services/trade-crews.mock";
import { TradeCard } from "./trade-card";
import { WorkforceRequestDrawer } from "./workforce-request-drawer";
import styles from "./hands-overview.module.css";

const QUICK_TRADE_CATEGORIES = [
  { id: undefined, label: "All Trades" },
  { id: "Civil & Masonry", label: "Civil & Masonry" },
  { id: "Electrical & MEP", label: "Electrical & MEP" },
  { id: "Plumbing & Sanitary", label: "Plumbing & Sanitary" },
  { id: "Woodwork & Formwork", label: "Carpentry & Formwork" },
  { id: "Reinforcement & Steel", label: "Rebar & Steel" },
  { id: "Finishing & Coating", label: "Painting & Finishing" },
  { id: "Site Management & QA", label: "Supervisors & QA" },
  { id: "Surveying & QS", label: "Surveyors & QS" },
];

export function HandsTradeDiscovery() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") || "";
  const categoryFilter = searchParams.get("category") || undefined;
  const verifiedOnly = searchParams.get("verified") === "true";
  const savedOnly = searchParams.get("saved") === "true";
  const minRating = Number(searchParams.get("rating")) || undefined;
  const maxRate = Number(searchParams.get("maxRate")) || undefined;
  const locationFilter = searchParams.get("location") || undefined;
  const projectId = searchParams.get("projectId") || undefined;

  const [internalQuery, setInternalQuery] = useState(query);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [requestDrawerOpen, setRequestDrawerOpen] = useState(false);
  const [prefilledTrade, setPrefilledTrade] = useState<string | undefined>(undefined);
  const [savedCrewIds, setSavedCrewIds] = useState<string[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "success">("loading");

  useEffect(() => {
    setInternalQuery(query);
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadState("success");
    }, 120);
    return () => clearTimeout(timer);
  }, [query, categoryFilter, verifiedOnly, savedOnly, minRating, maxRate, locationFilter]);

  const updateParam = useCallback(
    (key: string, value: string | undefined) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value !== undefined && value !== "") {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      router.push(`${pathname}?${next.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const clearFilters = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  const handleToggleSave = useCallback((crewId: string) => {
    setSavedCrewIds((prev) =>
      prev.includes(crewId) ? prev.filter((id) => id !== crewId) : [...prev, crewId]
    );
  }, []);

  const handleOpenRequest = useCallback((crew?: TradeCrew) => {
    if (crew) {
      setPrefilledTrade(crew.trade);
    } else {
      setPrefilledTrade(undefined);
    }
    setRequestDrawerOpen(true);
  }, []);

  const handleCloseRequest = useCallback(() => {
    setRequestDrawerOpen(false);
    setPrefilledTrade(undefined);
  }, []);

  // Filter trade crews
  const filteredCrews = useMemo(() => {
    const cleanQ = query.trim().toLowerCase();

    return MOCK_TRADE_CREWS.filter((crew) => {
      if (cleanQ) {
        const matchesQuery =
          crew.name.toLowerCase().includes(cleanQ) ||
          crew.trade.toLowerCase().includes(cleanQ) ||
          crew.category.toLowerCase().includes(cleanQ) ||
          crew.leadName.toLowerCase().includes(cleanQ) ||
          crew.skills.some((s) => s.toLowerCase().includes(cleanQ)) ||
          crew.location.toLowerCase().includes(cleanQ);

        if (!matchesQuery) return false;
      }

      if (categoryFilter && crew.category !== categoryFilter) {
        return false;
      }

      if (verifiedOnly && !crew.verified) {
        return false;
      }

      if (savedOnly && !savedCrewIds.includes(crew.id)) {
        return false;
      }

      if (minRating && crew.rating < minRating) {
        return false;
      }

      if (maxRate && crew.dailyRate > maxRate) {
        return false;
      }

      if (locationFilter && !crew.location.toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [query, categoryFilter, verifiedOnly, savedOnly, minRating, maxRate, locationFilter, savedCrewIds]);

  const activeFilters = useMemo(() => {
    const list: { key: string; label: string }[] = [];
    if (query) list.push({ key: "q", label: `"${query}"` });
    if (categoryFilter) list.push({ key: "category", label: categoryFilter });
    if (verifiedOnly) list.push({ key: "verified", label: "Verified Only" });
    if (savedOnly) list.push({ key: "saved", label: "Saved Crews" });
    if (minRating) list.push({ key: "rating", label: `★ ${minRating}+` });
    if (maxRate) list.push({ key: "maxRate", label: `≤ ₹${maxRate}/day` });
    if (locationFilter) list.push({ key: "location", label: locationFilter });
    return list;
  }, [query, categoryFilter, verifiedOnly, savedOnly, minRating, maxRate, locationFilter]);

  return (
    <div className={styles.discoveryStack}>
      {/* 1. Integrated Sticky Top Header: Logo | Search Box | Round Wishlist Option & Category Filters */}
      <header className={styles.discoveryStickyHeader}>
        <div className={styles.discoveryTopNavRow}>
          {/* Left: Kallisto Hands Logo */}
          <Link href="/hands" className={styles.handsLogoLink} title="Back to Hands Landing">
            <Image
              src="/kallisto-hands-logo.png"
              alt="Kallisto Hands"
              width={148}
              height={24}
              className={styles.handsLogoImg}
              priority
              unoptimized
            />
          </Link>

          {/* Center: Search Box Pill */}
          <div className={styles.discoveryTopNavCenter}>
            <form
              className={styles.discoverySearchBox}
              onSubmit={(e) => {
                e.preventDefault();
                updateParam("q", internalQuery.trim() || undefined);
              }}
              role="search"
            >
              <input
                className={styles.discoverySearchInput}
                value={internalQuery}
                placeholder="Search trades, workforce, site supervisors or projects..."
                onChange={(e) => setInternalQuery(e.target.value)}
                aria-label="Search trades, workforce, site supervisors or projects"
              />
              {internalQuery ? (
                <button
                  type="button"
                  className={styles.discoveryClearBtn}
                  onClick={() => {
                    setInternalQuery("");
                    updateParam("q", undefined);
                  }}
                  aria-label="Clear search input"
                >
                  <X size={13} aria-hidden="true" />
                </button>
              ) : null}
              <button
                type="submit"
                className={styles.searchPillSendBtn}
                aria-label="Search"
              >
                <Search size={14} strokeWidth={2.4} aria-hidden="true" />
              </button>
            </form>
          </div>

          {/* Right: Round Wishlist Option & Orders Option */}
          <div className={styles.discoveryTopNavRight}>
            {/* Wishlist Button */}
            <button
              type="button"
              className={`${styles.discoveryWishlistBtn} ${savedOnly ? styles.discoveryWishlistBtnActive : ""}`}
              onClick={() => updateParam("saved", savedOnly ? undefined : "true")}
              title={savedOnly ? "Show all crews" : `Saved Crews (${savedCrewIds.length})`}
              aria-label="Toggle saved workforce crews"
              aria-pressed={savedOnly}
            >
              <Bookmark size={15} fill={savedOnly || savedCrewIds.length > 0 ? "currentColor" : "none"} aria-hidden="true" />
              {savedCrewIds.length > 0 && (
                <span className={styles.discoveryWishlistBadge}>{savedCrewIds.length}</span>
              )}
            </button>

            {/* Deployments Option */}
            <Link
              href={projectId ? `/hands?tab=deployments&projectId=${projectId}` : "/hands?tab=deployments"}
              className={styles.discoveryWishlistBtn}
              title="Active Deployments"
              aria-label="View active deployments"
            >
              <ShoppingBag size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Header Quick Filters */}
      <div className={styles.discoveryHeaderWrap}>
          {/* Quick Category Filter Tabs with Right-Aligned Filter Icon */}
          <div className={styles.discoveryTabDockRow}>
            <div className={styles.discoveryPillDock} role="navigation" aria-label="Quick trade categories">
              {QUICK_TRADE_CATEGORIES.map((item) => {
                const isActive = categoryFilter === item.id;
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`${styles.discoveryPill} ${isActive ? styles.discoveryPillActive : ""}`}
                    onClick={() => updateParam("category", item.id)}
                    aria-pressed={isActive}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <button
                type="button"
                className={`${styles.discoveryPill} ${verifiedOnly ? styles.discoveryPillActive : ""}`}
                onClick={() => updateParam("verified", verifiedOnly ? undefined : "true")}
                aria-pressed={verifiedOnly}
              >
                <Sparkles size={13} aria-hidden="true" />
                <span>Verified only</span>
              </button>
            </div>

            {/* Right-Aligned Icon-Only Filter Trigger with Standard Popover */}
            <div className={styles.tabFilterWrap}>
              <button
                type="button"
                className={`${styles.tabFilterIconBtn} ${drawerOpen ? styles.tabFilterIconBtnActive : ""}`}
                onClick={() => setDrawerOpen((prev) => !prev)}
                aria-expanded={drawerOpen}
                aria-label="Open advanced filters"
                title="Filters"
              >
                <SlidersHorizontal size={15} aria-hidden="true" />
                {activeFilters.length > 0 && (
                  <span className={styles.tabFilterBadge}>{activeFilters.length}</span>
                )}
              </button>

              {/* Popover Filter Drawer */}
              {drawerOpen && (
                <>
                  <div
                    className={styles.popoverBackdrop}
                    onClick={() => setDrawerOpen(false)}
                    aria-hidden="true"
                  />
                  <div className={styles.filterPopover} role="dialog" aria-label="Filter workforce">
                    <div className={styles.popoverHeader}>
                      <h3>Filter Workforce</h3>
                      <button
                        type="button"
                        className={styles.popoverCloseBtn}
                        onClick={() => setDrawerOpen(false)}
                        aria-label="Close filters"
                      >
                        <X size={14} aria-hidden="true" />
                      </button>
                    </div>

                    <div className={styles.popoverBody}>
                      {/* Minimum Rating */}
                      <div className={styles.filterSection}>
                        <span className={styles.sectionTitle}>Minimum Rating</span>
                        <div className={styles.filterPillGrid}>
                          {["", "4.5", "4.8", "4.9"].map((val) => (
                            <button
                              key={val}
                              type="button"
                              className={`${styles.filterPillOption} ${(minRating ? String(minRating) : "") === val ? styles.filterPillOptionActive : ""}`}
                              onClick={() => updateParam("rating", val || undefined)}
                            >
                              {val ? `★ ${val}+` : "Any"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Location Filter */}
                      <div className={styles.filterSection}>
                        <span className={styles.sectionTitle}>Location / District</span>
                        <div className={styles.filterPillGrid}>
                          {["", "Kochi", "Trivandrum", "Calicut", "Thrissur"].map((loc) => (
                            <button
                              key={loc}
                              type="button"
                              className={`${styles.filterPillOption} ${(locationFilter || "") === loc ? styles.filterPillOptionActive : ""}`}
                              onClick={() => updateParam("location", loc || undefined)}
                            >
                              {loc || "All Kerala"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Max Daily Rate */}
                      <div className={styles.filterSection}>
                        <span className={styles.sectionTitle}>Max Shift Rate</span>
                        <div className={styles.filterPillGrid}>
                          {["", "1000", "1200", "1500"].map((r) => (
                            <button
                              key={r}
                              type="button"
                              className={`${styles.filterPillOption} ${(maxRate ? String(maxRate) : "") === r ? styles.filterPillOptionActive : ""}`}
                              onClick={() => updateParam("maxRate", r || undefined)}
                            >
                              {r ? `≤ ₹${r}` : "Any"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className={styles.popoverFooter}>
                      <button
                        type="button"
                        className={styles.popoverResetBtn}
                        onClick={clearFilters}
                      >
                        Clear all
                      </button>
                      <button
                        type="button"
                        className={styles.popoverApplyBtn}
                        onClick={() => setDrawerOpen(false)}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Meta Bar: Results count, Active tags */}
          <div className={styles.discoveryMetaBar}>
            <div className={styles.discoveryMetaLeft}>
              <span className={styles.discoveryResultCount}>
                {loadState === "success"
                  ? `${filteredCrews.length} trade crew${filteredCrews.length === 1 ? "" : "s"} available`
                  : "Loading workforce..."}
              </span>

              {/* Active filter tags */}
              {activeFilters.length > 0 && (
                <div className={styles.activeTagList} role="list" aria-label="Active filters">
                  {activeFilters.map((tag) => (
                    <span key={tag.key} className={styles.activeTag} role="listitem">
                      <span>{tag.label}</span>
                      <button
                        type="button"
                        className={styles.activeTagRemove}
                        aria-label={`Remove filter ${tag.label}`}
                        onClick={() => updateParam(tag.key, undefined)}
                      >
                        <X size={11} aria-hidden="true" />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    className={styles.activeTagClearAll}
                    onClick={clearFilters}
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* 2. Full Width Responsive Trade Crews Grid */}
      <div className={styles.detailStack}>
        {loadState === "loading" ? (
          <div className={styles.tradeGrid}>
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className={styles.tradeCardSkeleton}>
                <div className={styles.skeletonLineShort} />
                <div className={styles.skeletonHeading} />
                <div className={styles.skeletonLine} />
              </div>
            ))}
          </div>
        ) : filteredCrews.length === 0 ? (
          <div className={styles.emptyTradesCard}>
            <div className={styles.emptyTradesIconWrap}>
              <Filter size={24} aria-hidden="true" />
            </div>
            <h3>No trade crews found</h3>
            <p>Try adjusting your search terms or clearing active category filters.</p>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={clearFilters}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className={styles.tradeGrid} role="feed" aria-label="Available trade crews">
            {filteredCrews.map((crew) => (
              <TradeCard
                key={crew.id}
                crew={crew}
                onRequestCrew={handleOpenRequest}
                isSaved={savedCrewIds.includes(crew.id)}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        )}
      </div>

      {/* 3. Workforce Request Drawer */}
      {requestDrawerOpen && (
        <WorkforceRequestDrawer
          onClose={handleCloseRequest}
        />
      )}
    </div>
  );
}
