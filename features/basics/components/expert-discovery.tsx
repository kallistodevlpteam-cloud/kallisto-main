"use client";

import {
  ArrowUpRight,
  Bookmark,
  Columns3,
  Layers,
  LayoutDashboard,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BASICS_PROJECT_TYPES,
  BASICS_SERVICE_CATALOGUE,
  BASICS_SOFTWARE_SKILLS,
} from "../constants/service-catalogue";
import {
  basicsProviderRepository,
  basicsRequirementRepository,
} from "../repositories/basics-repositories";
import type {
  BasicsAvailability,
  BasicsPricingModel,
  BasicsProvider,
  BasicsRequirement,
  BasicsServiceCategory,
  ProviderFilters,
} from "../types/basics.types";
import {
  availabilityLabels,
  pricingLabels,
  titleCase,
} from "../utils/basics-formatters";
import {
  BasicsEmptyState,
  BasicsLoadingSkeleton,
  BasicsStateView,
} from "./basics-shared";
import { ProviderCard } from "./provider-card";
import styles from "./basics-workspace.module.css";

const SORT_OPTIONS = [
  ["recommended", "Recommended"],
  ["rating", "Highest rated"],
  ["experience", "Most experienced"],
  ["completed", "Most completed engagements"],
  ["availability", "Availability"],
  ["price_low", "Price: low to high"],
  ["price_high", "Price: high to low"],
] as const;

const QUICK_CATEGORIES: { id?: string; label: string; verified?: boolean }[] = [
  { id: undefined, label: "All Disciplines" },
  { id: "engineering", label: "Engineering & MEP" },
  { id: "design_architecture", label: "Architecture & Design" },
  { id: "digital_production", label: "BIM & Digital" },
  { id: "specialist_consulting", label: "Specialist Consulting" },
  { id: "commercial_compliance", label: "Commercial & PM" },
];

function toFilters(params: URLSearchParams): ProviderFilters {
  const numberOrUndefined = (key: string) => {
    const value = params.get(key);
    return value ? Number(value) : undefined;
  };
  return {
    q: params.get("q") ?? undefined,
    category: (params.get("category") as BasicsServiceCategory | null) ?? undefined,
    specialization: params.get("specialization") ?? undefined,
    projectType: params.get("projectType") ?? undefined,
    city: params.get("city") ?? undefined,
    state: params.get("state") ?? undefined,
    remote: params.get("remote") === "true" || undefined,
    onsite: params.get("onsite") === "true" || undefined,
    verified: params.get("verified") === "true" || undefined,
    minimumRating: numberOrUndefined("rating"),
    minimumExperience: numberOrUndefined("experience"),
    availability: (params.get("availability") as BasicsAvailability | null) ?? undefined,
    pricingModel: (params.get("pricing") as BasicsPricingModel | null) ?? undefined,
    software: params.get("software") ?? undefined,
    code: params.get("code") ?? undefined,
    language: params.get("language") ?? undefined,
    sort: params.get("sort") ?? "recommended",
  };
}

export function ExpertDiscovery() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => toFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const projectId = searchParams.get("projectId") ?? undefined;
  const requirementId = searchParams.get("requirementId") ?? undefined;
  const [loadedRequirement, setLoadedRequirement] = useState<BasicsRequirement | null>(null);
  const [providers, setProviders] = useState<BasicsProvider[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "success" | "error" | "offline">("loading");
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    (searchParams.get("compare") ?? "").split(",").filter(Boolean).slice(0, 3),
  );
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savedFilterOnly, setSavedFilterOnly] = useState(
    () => searchParams.get("saved") === "true",
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const filterQ = filters.q ?? "";
  const [internalQuery, setInternalQuery] = useState(filterQ);
  const [prevFilterQ, setPrevFilterQ] = useState(filterQ);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    void basicsProviderRepository.getSavedProviderIds().then(setSavedIds);
  }, []);

  useEffect(() => {
    if (!requirementId) return;
    let cancelled = false;
    void basicsRequirementRepository.getRequirement(requirementId).then((req) => {
      if (!cancelled) {
        setLoadedRequirement(req);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [requirementId]);

  const activeRequirement =
    requirementId && loadedRequirement?.id === requirementId
      ? loadedRequirement
      : null;

  const handleInviteToRequirement = useCallback(
    async (providerId: string) => {
      if (!activeRequirement) return;
      if (activeRequirement.invitedProviderIds.includes(providerId)) return;
      const updatedIds = [...activeRequirement.invitedProviderIds, providerId];
      const updated = await basicsRequirementRepository.updateRequirement(activeRequirement.id, {
        invitedProviderIds: updatedIds,
      });
      setLoadedRequirement(updated);
    },
    [activeRequirement],
  );

  if (filterQ !== prevFilterQ) {
    setPrevFilterQ(filterQ);
    setInternalQuery(filterQ);
  }

  const handleQueryChange = (val: string) => {
    setInternalQuery(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      updateParam("q", val.trim() || undefined);
    }, 300);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    updateParam("q", internalQuery.trim() || undefined);
  };

  const handleClearQuery = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setInternalQuery("");
    updateParam("q", undefined);
  };

  useEffect(() => {
    let cancelled = false;
    void basicsProviderRepository.listProviders(filters).then(
      (result) => {
        if (!cancelled) {
          setProviders(result);
          setLoadState("success");
        }
      },
      () => {
        if (!cancelled) {
          setLoadState(
            typeof navigator !== "undefined" && !navigator.onLine
              ? "offline"
              : "error",
          );
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [filters]);

  const updateParam = useCallback(
    (key: string, value?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      if (key !== "compare") params.delete("compare");
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const toggleCompare = useCallback((providerId: string) => {
    setSelectedIds((current) => {
      if (current.includes(providerId)) {
        return current.filter((id) => id !== providerId);
      }
      if (current.length >= 3) {
        return current;
      }
      return [...current, providerId];
    });
  }, []);

  const toggleSave = useCallback((providerId: string) => {
    void basicsProviderRepository.saveProvider(providerId);
    setSavedIds((current) =>
      current.includes(providerId)
        ? current.filter((id) => id !== providerId)
        : [...current, providerId],
    );
  }, []);

  const displayedProviders = useMemo(() => {
    if (savedFilterOnly) {
      return providers.filter((p) => savedIds.includes(p.id));
    }
    return providers;
  }, [providers, savedFilterOnly, savedIds]);

  function applyComparison() {
    if (selectedIds.length < 2) return;
    const params = new URLSearchParams();
    params.set("ids", selectedIds.join(","));
    if (projectId) params.set("projectId", projectId);
    router.push(`/basics/experts/compare?${params.toString()}`);
  }

  function clearFilters() {
    setSavedFilterOnly(false);
    const params = new URLSearchParams();
    if (projectId) params.set("projectId", projectId);
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }

  // Count active non-default filters
  const activeFilters = useMemo(() => {
    const list: { key: string; label: string }[] = [];
    if (filters.q) list.push({ key: "q", label: `"${filters.q}"` });
    if (filters.category) {
      const cat = BASICS_SERVICE_CATALOGUE.find((c) => c.id === filters.category);
      list.push({ key: "category", label: cat ? cat.label : filters.category });
    }
    if (filters.specialization) list.push({ key: "specialization", label: filters.specialization });
    if (filters.projectType) list.push({ key: "projectType", label: filters.projectType });
    if (filters.city) list.push({ key: "city", label: filters.city });
    if (filters.state) list.push({ key: "state", label: filters.state });
    if (filters.verified) list.push({ key: "verified", label: "Verified only" });
    if (filters.minimumRating) list.push({ key: "rating", label: `★ ${filters.minimumRating}+` });
    if (filters.minimumExperience) list.push({ key: "experience", label: `${filters.minimumExperience}+ yrs` });
    if (filters.availability) list.push({ key: "availability", label: availabilityLabels[filters.availability] });
    if (filters.pricingModel) list.push({ key: "pricing", label: pricingLabels[filters.pricingModel] });
    if (filters.software) list.push({ key: "software", label: filters.software });
    if (filters.code) list.push({ key: "code", label: filters.code });
    if (filters.remote) list.push({ key: "remote", label: "Remote" });
    if (filters.onsite) list.push({ key: "onsite", label: "Onsite" });
    if (savedFilterOnly) list.push({ key: "wishlist", label: "Saved Wishlist" });
    return list;
  }, [filters, savedFilterOnly]);

  return (
    <div className={styles.discoveryStack}>
      {/* 1. Integrated Sticky Top Navbar: Logo | Search Box | Top Nav Action Buttons */}
      <div className={styles.discoveryStickyHeader}>
        <div className={styles.discoveryTopNavRow}>
          {/* Left: Kallisto Basics Logo */}
          <Link href="/basics" className={styles.discoveryLogoLink} title="Back to Basics Overview">
            <Image
              src="/kallisto-basics-logo.png"
              alt="Kallisto Basics"
              width={185}
              height={30}
              className={styles.discoveryLogoImg}
              priority
            />
          </Link>

          {/* Center: Search Box Pill */}
          <div className={styles.discoveryTopNavCenter}>
            <form
              className={styles.discoverySearchBox}
              onSubmit={handleSearchSubmit}
              role="search"
            >
              <input
                type="text"
                className={styles.discoverySearchInput}
                value={internalQuery}
                placeholder="Search specialists, skills, software, location..."
                onChange={(event) => handleQueryChange(event.target.value)}
                aria-label="Search specialists, skills, software, location"
              />
              {internalQuery ? (
                <button
                  type="button"
                  className={styles.paletteClearBtn}
                  onClick={handleClearQuery}
                  aria-label="Clear search input"
                >
                  <X size={13} aria-hidden="true" />
                </button>
              ) : null}
              <button
                type="submit"
                className={styles.searchPillSendBtn}
                aria-label="Search"
                title="Search"
              >
                <Search size={14} strokeWidth={2.4} aria-hidden="true" />
              </button>
            </form>
          </div>

          {/* Right: Quick Action Pill Buttons with Text Labels */}
          <div className={styles.discoveryTopNavRight}>
            {/* Basics Dashboard Button */}
            <Link
              href={projectId ? `/basics/dashboard?projectId=${projectId}` : "/basics/dashboard"}
              className={styles.overviewTopNavBtn}
              title="Basics Dashboard"
              aria-label="View Basics dashboard"
            >
              <LayoutDashboard size={14} className={styles.overviewTopNavIcon} aria-hidden="true" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>

        {/* 2. Header Quick Filters */}
        <div className={styles.discoveryHeaderWrap}>
        {/* Quick Category Filter Tabs with Right-Aligned Filter Icon */}
        <div className={styles.discoveryTabDockRow}>
          <div className={styles.discoveryPillDock} role="navigation" aria-label="Quick discipline categories">
            {QUICK_CATEGORIES.map((item) => {
              const isActive = filters.category === item.id;
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
              className={`${styles.discoveryPill} ${filters.verified ? styles.discoveryPillActive : ""}`}
              onClick={() => updateParam("verified", filters.verified ? undefined : "true")}
              aria-pressed={Boolean(filters.verified)}
            >
              <Sparkles size={13} aria-hidden="true" />
              <span>Verified only</span>
            </button>

            <button
              type="button"
              className={`${styles.discoveryPill} ${savedFilterOnly ? styles.discoveryPillActive : ""}`}
              onClick={() => setSavedFilterOnly((prev) => !prev)}
              aria-pressed={savedFilterOnly}
            >
              <Bookmark size={13} fill={savedFilterOnly ? "currentColor" : "none"} aria-hidden="true" />
              <span>Saved profiles ({savedIds.length})</span>
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
              {activeFilters.length > 0 ? (
                <span className={styles.tabFilterBadge}>{activeFilters.length}</span>
              ) : null}
            </button>

            {drawerOpen && (
              <>
                <div
                  className={styles.popoverBackdrop}
                  onClick={() => setDrawerOpen(false)}
                  aria-hidden="true"
                />
                <div className={styles.filterPopover} role="dialog" aria-label="Filter experts">
                  <div className={styles.popoverHeader}>
                    <h3>Filters</h3>
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
                        {["", "4", "4.5", "4.8"].map((val) => (
                          <button
                            key={val}
                            type="button"
                            className={`${styles.filterPillOption} ${(filters.minimumRating ? String(filters.minimumRating) : "") === val ? styles.filterPillOptionActive : ""}`}
                            onClick={() => updateParam("rating", val || undefined)}
                          >
                            {val ? `★ ${val}+` : "Any"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Minimum Experience */}
                    <div className={styles.filterSection}>
                      <span className={styles.sectionTitle}>Experience</span>
                      <div className={styles.filterPillGrid}>
                        {["", "5", "10", "15"].map((val) => (
                          <button
                            key={val}
                            type="button"
                            className={`${styles.filterPillOption} ${(filters.minimumExperience ? String(filters.minimumExperience) : "") === val ? styles.filterPillOptionActive : ""}`}
                            onClick={() => updateParam("experience", val || undefined)}
                          >
                            {val ? `${val}+ yrs` : "Any"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Availability */}
                    <div className={styles.filterSection}>
                      <span className={styles.sectionTitle}>Availability</span>
                      <div className={styles.filterPillGrid}>
                        <button
                          type="button"
                          className={`${styles.filterPillOption} ${!filters.availability ? styles.filterPillOptionActive : ""}`}
                          onClick={() => updateParam("availability", undefined)}
                        >
                          Any
                        </button>
                        {Object.entries(availabilityLabels).map(([val, label]) => (
                          <button
                            key={val}
                            type="button"
                            className={`${styles.filterPillOption} ${filters.availability === val ? styles.filterPillOptionActive : ""}`}
                            onClick={() => updateParam("availability", val)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Project Type */}
                    <div className={styles.filterSection}>
                      <span className={styles.sectionTitle}>Project Type</span>
                      <select
                        className={styles.filterSelect}
                        value={filters.projectType ?? ""}
                        onChange={(e) => updateParam("projectType", e.target.value || undefined)}
                      >
                        <option value="">All project types</option>
                        {BASICS_PROJECT_TYPES.map((pt) => (
                          <option key={pt} value={pt}>
                            {pt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Software Skills */}
                    <div className={styles.filterSection}>
                      <span className={styles.sectionTitle}>Software Capability</span>
                      <select
                        className={styles.filterSelect}
                        value={filters.software ?? ""}
                        onChange={(e) => updateParam("software", e.target.value || undefined)}
                      >
                        <option value="">Any software</option>
                        {BASICS_SOFTWARE_SKILLS.map((sw) => (
                          <option key={sw} value={sw}>
                            {sw}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Location */}
                    <div className={styles.filterSection}>
                      <span className={styles.sectionTitle}>Location (City / State)</span>
                      <input
                        className={styles.filterInput}
                        value={filters.city ?? ""}
                        placeholder="e.g. Kochi, Bengaluru, Mumbai..."
                        onChange={(e) => updateParam("city", e.target.value || undefined)}
                      />
                    </div>
                  </div>

                  <div className={styles.popoverFooter}>
                    <button
                      type="button"
                      className={styles.popoverClearBtn}
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
                ? `${displayedProviders.length} expert${displayedProviders.length === 1 ? "" : "s"} found`
                : "Loading experts..."}
            </span>

            {/* Active filter tags */}
            {activeFilters.length > 0 ? (
              <div className={styles.activeTagList} role="list" aria-label="Active filters">
                {activeFilters.map((tag) => (
                  <span key={tag.key} className={styles.activeTag} role="listitem">
                    <span>{tag.label}</span>
                    <button
                      type="button"
                      className={styles.activeTagRemove}
                      aria-label={`Remove filter ${tag.label}`}
                      onClick={() => {
                        if (tag.key === "wishlist") {
                          setSavedFilterOnly(false);
                        } else {
                          updateParam(tag.key, undefined);
                        }
                      }}
                    >
                      <X size={11} aria-hidden="true" />
                    </button>
                  </span>
                ))}
                {activeFilters.length > 1 ? (
                  <button
                    type="button"
                    className={styles.tertiaryButton}
                    style={{ fontSize: "11.5px", padding: "2px 6px" }}
                    onClick={clearFilters}
                  >
                    Clear all
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Sort Dropdown */}
          <div className={styles.discoveryMetaRight}>
            <label htmlFor="expert-sort-select" className="sr-only">
              Sort experts
            </label>
            <select
              id="expert-sort-select"
              className={styles.discoverySortSelect}
              value={filters.sort ?? "recommended"}
              onChange={(e) => updateParam("sort", e.target.value)}
              aria-label="Sort experts by"
            >
              {SORT_OPTIONS.map(([val, label]) => (
                <option key={val} value={val}>
                  Sort: {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>

      {/* 2. Full Width Responsive Provider Grid */}
      <div className={styles.detailStack}>
        {activeRequirement ? (
          <div className={styles.expertRequirementBanner} role="region" aria-label="Requirement context">
            <div className={styles.expertRequirementInfo}>
              <div className={styles.expertRequirementIconBox}>
                <Sparkles size={16} strokeWidth={2} aria-hidden="true" />
              </div>
              <div className={styles.expertRequirementTitleGroup}>
                <div className={styles.expertRequirementTitleRow}>
                  <span className={styles.expertRequirementBadge}>Matching for</span>
                  <strong className={styles.expertRequirementTitle}>{activeRequirement.title}</strong>
                </div>
                <div className={styles.expertRequirementTagsRow}>
                  <span className={styles.expertRequirementTag}>
                    <Layers size={11} aria-hidden="true" />
                    {titleCase(activeRequirement.category)}
                  </span>
                  {activeRequirement.specialization ? (
                    <span className={styles.expertRequirementTag}>
                      {activeRequirement.specialization}
                    </span>
                  ) : null}
                  {activeRequirement.deliverables && activeRequirement.deliverables.length > 0 ? (
                    <span className={styles.expertRequirementTag}>
                      {activeRequirement.deliverables.slice(0, 2).join(", ")}
                    </span>
                  ) : null}
                  {activeRequirement.location ? (
                    <span className={styles.expertRequirementTag}>
                      <MapPin size={11} aria-hidden="true" />
                      {activeRequirement.location}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className={styles.expertRequirementActions}>
              <div className={styles.expertRequirementTabs} role="tablist" aria-label="Filter matching experts">
                <button
                  type="button"
                  role="tab"
                  aria-selected={!savedFilterOnly}
                  className={`${styles.expertRequirementTabBtn} ${!savedFilterOnly ? styles.expertRequirementTabBtnActive : ""}`}
                  onClick={() => setSavedFilterOnly(false)}
                >
                  All Matches ({providers.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={savedFilterOnly}
                  className={`${styles.expertRequirementTabBtn} ${savedFilterOnly ? styles.expertRequirementTabBtnActive : ""}`}
                  onClick={() => setSavedFilterOnly(true)}
                >
                  <Bookmark size={12} fill={savedFilterOnly ? "currentColor" : "none"} aria-hidden="true" />
                  Saved Profiles ({providers.filter((p) => savedIds.includes(p.id)).length})
                </button>
              </div>

              <div className={styles.expertRequirementDivider} aria-hidden="true" />

              <Link
                href={`/basics/requirements/${activeRequirement.id}`}
                className={styles.expertRequirementViewBtn}
                title="View requirement scope and details"
              >
                <span>View Requirement</span>
                <ArrowUpRight size={13} aria-hidden="true" />
              </Link>

              <button
                type="button"
                className={styles.expertRequirementClearBtn}
                onClick={() => updateParam("requirementId", undefined)}
                title="Exit requirement matching mode"
                aria-label="Clear requirement matching context"
              >
                <X size={13} aria-hidden="true" />
                <span>Clear context</span>
              </button>
            </div>
          </div>
        ) : null}

        {loadState === "loading" ? <BasicsLoadingSkeleton label="Loading expert directory" /> : null}
        {loadState === "error" ? (
          <BasicsStateView
            state="error"
            title="Experts could not be loaded"
            description="The marketplace service returned an unexpected error."
            retryHref="/basics/experts"
          />
        ) : null}
        {loadState === "offline" ? (
          <BasicsStateView
            state="offline"
            title="You appear to be offline"
            description="Reconnect to load verified provider profiles and current availability."
            retryHref="/basics/experts"
          />
        ) : null}
        {loadState === "success" && displayedProviders.length === 0 ? (
          <BasicsEmptyState
            title={savedFilterOnly ? "Your saved wishlist is empty" : "No experts match your search"}
            description={
              savedFilterOnly
                ? "Click the bookmark icon on any specialist profile card to add them to your saved wishlist."
                : "Try clearing some filters or searching for different disciplines or software."
            }
            actionLabel={savedFilterOnly ? "View all specialists" : "Clear all filters"}
            href="/basics/experts"
          />
        ) : null}
        {loadState === "success" && displayedProviders.length > 0 ? (
          <div className={styles.refProviderGrid}>
            {displayedProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                projectId={projectId}
                requirementId={requirementId}
                discovery
                selected={selectedIds.includes(provider.id)}
                saved={savedIds.includes(provider.id)}
                isInvited={Boolean(activeRequirement?.invitedProviderIds.includes(provider.id))}
                compareDisabled={selectedIds.length >= 3}
                onToggleCompare={toggleCompare}
                onToggleSave={toggleSave}
                onInvite={activeRequirement ? handleInviteToRequirement : undefined}
              />
            ))}
          </div>
        ) : null}

        {/* 3. Comparison Tray */}
        {selectedIds.length > 0 ? (
          <div className={styles.comparisonTray} role="region" aria-label="Provider comparison">
            <div>
              <strong>{selectedIds.length} specialist{selectedIds.length === 1 ? "" : "s"} selected</strong>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Select up to 3 to compare rates and scope</p>
            </div>
            <div className={styles.inlineActions}>
              <button
                type="button"
                className={styles.tertiaryButton}
                onClick={() => {
                  setSelectedIds([]);
                  updateParam("compare", undefined);
                }}
              >
                Clear selection
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                disabled={selectedIds.length < 2}
                onClick={applyComparison}
              >
                <Columns3 size={13} aria-hidden="true" />
                Compare ({selectedIds.length})
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
