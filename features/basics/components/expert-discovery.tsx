"use client";

import {
  Columns3,
  Filter,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BASICS_CODE_KNOWLEDGE,
  BASICS_PROJECT_TYPES,
  BASICS_SERVICE_CATALOGUE,
  BASICS_SOFTWARE_SKILLS,
} from "../constants/service-catalogue";
import { basicsProviderRepository } from "../repositories/basics-repositories";
import type {
  BasicsAvailability,
  BasicsPricingModel,
  BasicsProvider,
  BasicsServiceCategory,
  ProviderFilters,
} from "../types/basics.types";
import { availabilityLabels, formatCurrency, pricingLabels, verificationLabels } from "../utils/basics-formatters";
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
  const [providers, setProviders] = useState<BasicsProvider[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "success" | "error" | "offline">("loading");
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    (searchParams.get("compare") ?? "").split(",").filter(Boolean).slice(0, 3),
  );
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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
      return current.length < 3 ? [...current, providerId] : current;
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

  const comparisonProviders = providers.filter((provider) =>
    selectedIds.includes(provider.id),
  );

  function applyComparison() {
    updateParam("compare", selectedIds.join(","));
  }

  function clearFilters() {
    const params = new URLSearchParams();
    if (projectId) params.set("projectId", projectId);
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }

  const filterPanel = (
    <aside className={styles.filterPanel} aria-label="Expert filters">
      <div className={styles.filterPanelHeader}>
        <strong>Filters</strong>
        <button className={styles.tertiaryButton} type="button" onClick={clearFilters}>
          Clear
        </button>
      </div>
      <label className={styles.filterGroup}>
        <span>Service category</span>
        <select
          className={styles.select}
          value={filters.category ?? ""}
          onChange={(event) => updateParam("category", event.target.value)}
        >
          <option value="">All categories</option>
          {BASICS_SERVICE_CATALOGUE.map((group) => (
            <option key={group.id} value={group.id}>
              {group.label}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.filterGroup}>
        <span>Specialization</span>
        <select
          className={styles.select}
          value={filters.specialization ?? ""}
          onChange={(event) => updateParam("specialization", event.target.value)}
        >
          <option value="">All specializations</option>
          {BASICS_SERVICE_CATALOGUE.flatMap((group) =>
            group.services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            )),
          )}
        </select>
      </label>
      <label className={styles.filterGroup}>
        <span>Project type</span>
        <select
          className={styles.select}
          value={filters.projectType ?? ""}
          onChange={(event) => updateParam("projectType", event.target.value)}
        >
          <option value="">All project types</option>
          {BASICS_PROJECT_TYPES.map((projectType) => (
            <option key={projectType} value={projectType}>
              {projectType}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.filterGroup}>
        <span>City</span>
        <input
          className={styles.input}
          value={filters.city ?? ""}
          placeholder="Kochi"
          onChange={(event) => updateParam("city", event.target.value)}
        />
      </label>
      <label className={styles.filterGroup}>
        <span>State</span>
        <input
          className={styles.input}
          value={filters.state ?? ""}
          placeholder="Kerala"
          onChange={(event) => updateParam("state", event.target.value)}
        />
      </label>
      <label className={styles.filterGroup}>
        <span>Minimum rating</span>
        <select
          className={styles.select}
          value={filters.minimumRating ?? ""}
          onChange={(event) => updateParam("rating", event.target.value)}
        >
          <option value="">Any rating</option>
          <option value="4">4.0 and above</option>
          <option value="4.5">4.5 and above</option>
          <option value="4.8">4.8 and above</option>
        </select>
      </label>
      <label className={styles.filterGroup}>
        <span>Minimum experience</span>
        <select
          className={styles.select}
          value={filters.minimumExperience ?? ""}
          onChange={(event) => updateParam("experience", event.target.value)}
        >
          <option value="">Any experience</option>
          <option value="5">5 years</option>
          <option value="10">10 years</option>
          <option value="15">15 years</option>
        </select>
      </label>
      <label className={styles.filterGroup}>
        <span>Availability</span>
        <select
          className={styles.select}
          value={filters.availability ?? ""}
          onChange={(event) => updateParam("availability", event.target.value)}
        >
          <option value="">Any availability</option>
          {Object.entries(availabilityLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.filterGroup}>
        <span>Pricing model</span>
        <select
          className={styles.select}
          value={filters.pricingModel ?? ""}
          onChange={(event) => updateParam("pricing", event.target.value)}
        >
          <option value="">Any pricing model</option>
          {Object.entries(pricingLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.filterGroup}>
        <span>Software capability</span>
        <select
          className={styles.select}
          value={filters.software ?? ""}
          onChange={(event) => updateParam("software", event.target.value)}
        >
          <option value="">Any software</option>
          {BASICS_SOFTWARE_SKILLS.map((software) => (
            <option key={software} value={software}>
              {software}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.filterGroup}>
        <span>Code knowledge</span>
        <select
          className={styles.select}
          value={filters.code ?? ""}
          onChange={(event) => updateParam("code", event.target.value)}
        >
          <option value="">Any code</option>
          {BASICS_CODE_KNOWLEDGE.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.filterGroup}>
        <span>Language</span>
        <select
          className={styles.select}
          value={filters.language ?? ""}
          onChange={(event) => updateParam("language", event.target.value)}
        >
          <option value="">Any language</option>
          {["English", "Malayalam", "Hindi", "Tamil"].map((language) => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </select>
      </label>
      {[
        ["verified", "Verified only", filters.verified],
        ["remote", "Remote available", filters.remote],
        ["onsite", "On-site available", filters.onsite],
      ].map(([key, label, checked]) => (
        <label className={styles.checkRow} key={String(key)}>
          <input
            type="checkbox"
            checked={Boolean(checked)}
            onChange={(event) =>
              updateParam(String(key), event.target.checked ? "true" : undefined)
            }
          />
          {String(label)}
        </label>
      ))}
    </aside>
  );

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.toolbarMain}>
          <label className={styles.searchInputWrap}>
            <span className="sr-only">Search experts</span>
            <Search size={15} aria-hidden="true" />
            <input
              className={styles.searchInput}
              value={filters.q ?? ""}
              placeholder="Search by service, specialist, software or code"
              onChange={(event) => updateParam("q", event.target.value)}
            />
          </label>
          <span className={styles.resultCount}>
            {loadState === "success" ? `${providers.length} experts` : "Loading results"}
          </span>
        </div>
        <div className={styles.toolbarActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => setMobileFiltersOpen((current) => !current)}
            aria-expanded={mobileFiltersOpen}
          >
            <Filter size={13} aria-hidden="true" />
            Filters
          </button>
          <label>
            <span className="sr-only">Sort expert results</span>
            <select
              className={`${styles.select} ${styles.toolbarSelect}`}
              value={filters.sort}
              onChange={(event) => updateParam("sort", event.target.value)}
            >
              {SORT_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className={styles.filterLayout}>
        <div
          className={`${styles.filterPanelWrap} ${
            mobileFiltersOpen ? styles.filterPanelWrapOpen : ""
          }`}
        >
          {filterPanel}
        </div>
        <div className={styles.detailStack}>
          {loadState === "loading" ? <BasicsLoadingSkeleton label="Loading expert results" /> : null}
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
          {loadState === "success" && providers.length === 0 ? (
            <BasicsEmptyState
              title="No experts match these filters"
              description="Clear one or more filters, or post a requirement so matched providers can respond."
              actionLabel="Post a requirement"
              href="/basics/requirements/new"
            />
          ) : null}
          {loadState === "success" && providers.length > 0 ? (
            <div className={styles.providerGrid}>
              {providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  projectId={projectId}
                  discovery
                  selected={selectedIds.includes(provider.id)}
                  saved={savedIds.includes(provider.id)}
                  compareDisabled={selectedIds.length >= 3}
                  onToggleCompare={toggleCompare}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          ) : null}

          {selectedIds.length > 0 ? (
            <div className={styles.comparisonTray} role="region" aria-label="Provider comparison">
              <div>
                <strong>{selectedIds.length} of 3 experts selected</strong>
                <span> Compare evidence, experience and commercial indications.</span>
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
                  <X size={13} aria-hidden="true" />
                  Clear
                </button>
                <button type="button" className={styles.secondaryButton} onClick={applyComparison}>
                  <Columns3 size={13} aria-hidden="true" />
                  Compare selected
                </button>
              </div>
            </div>
          ) : null}

          {searchParams.get("compare") && comparisonProviders.length > 1 ? (
            <ProviderComparison providers={comparisonProviders} projectId={projectId} />
          ) : null}
        </div>
      </div>
    </>
  );
}

function ProviderComparison({
  providers,
  projectId,
}: {
  providers: BasicsProvider[];
  projectId?: string;
}) {
  const highestRating = Math.max(...providers.map((provider) => provider.rating));
  const mostExperience = Math.max(...providers.map((provider) => provider.yearsOfExperience));
  const lowestFee = Math.min(
    ...providers.map((provider) => provider.pricing.startingFrom ?? Infinity),
  );
  return (
    <section className={styles.section} aria-labelledby="provider-comparison-title">
      <div className={styles.sectionHeader}>
        <div>
          <h2 id="provider-comparison-title">Provider comparison</h2>
          <p>Evidence is highlighted without declaring an automatic best choice.</p>
        </div>
      </div>
      <div className={styles.comparisonPanel}>
        <table className={styles.comparisonTable}>
          <tbody>
            {[
              ["Provider", (provider: BasicsProvider) => provider.name],
              ["Verification", (provider: BasicsProvider) => verificationLabels[provider.verificationLevel]],
              ["Rating", (provider: BasicsProvider) => provider.rating.toFixed(1)],
              ["Relevant experience", (provider: BasicsProvider) => `${provider.yearsOfExperience} years`],
              ["Completed engagements", (provider: BasicsProvider) => String(provider.completedEngagements)],
              ["Starting fee", (provider: BasicsProvider) => provider.pricing.startingFrom ? formatCurrency(provider.pricing.startingFrom, provider.pricing.currency) : "Request quote"],
              ["Availability", (provider: BasicsProvider) => availabilityLabels[provider.availability]],
              ["Software", (provider: BasicsProvider) => provider.softwareSkills.join(", ")],
              ["Code knowledge", (provider: BasicsProvider) => provider.codeKnowledge.join(", ")],
            ].map(([label, getter]) => (
              <tr key={String(label)}>
                <th scope="row">{String(label)}</th>
                {providers.map((provider) => {
                  const value = (getter as (provider: BasicsProvider) => string)(provider);
                  const highlighted =
                    (label === "Rating" && provider.rating === highestRating) ||
                    (label === "Relevant experience" && provider.yearsOfExperience === mostExperience) ||
                    (label === "Starting fee" && provider.pricing.startingFrom === lowestFee);
                  return (
                    <td key={provider.id} className={highlighted ? styles.highlight : undefined}>
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <th scope="row">Action</th>
              {providers.map((provider) => {
                const params = new URLSearchParams({ providerId: provider.id });
                if (projectId) params.set("projectId", projectId);
                return (
                  <td key={provider.id}>
                    <Link
                      className={styles.primaryButton}
                      href={`/basics/requirements/new?${params.toString()}`}
                    >
                      Invite
                    </Link>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
