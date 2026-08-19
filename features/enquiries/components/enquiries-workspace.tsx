"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Inbox,
  Clock,
} from "lucide-react";
import { parseEnquiryQuery, serializeEnquiryQuery } from "../utils/enquiry-query-state";
import { filterEnquiries, sortEnquiries, paginateEnquiries } from "../utils/filter-enquiries";
import { buildEnquiriesFromProjects } from "../utils/enquiries-from-backend-projects";
import type { BackendProject } from "@/types/domain/backend-project";
import { EnquiryRecord } from "../types/enquiry.types";
import { EnquiryFilterToolbar } from "./enquiry-filter-toolbar";
import { EnquiryTableRow } from "./enquiry-table-row";
import { EnquiryMobileCard } from "./enquiry-mobile-card";
import { authedFetch } from "@/lib/auth/authed-fetch";
import styles from "./enquiries-workspace.module.css";

interface EnquiriesWorkspaceProps {
  isLoading?: boolean;
}

// 2026 Fixed reference time for deterministic date rendering and testing
const FIXED_NOW = new Date("2026-07-23T12:00:00.000Z");
const PAGE_SIZE = 10;

export function EnquiriesWorkspace({ isLoading = false }: EnquiriesWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Ref for first filter control (Status filter)
  const statusFilterRef = useRef<HTMLButtonElement | null>(null);

  // Parse state from URL query parameters
  const queryState = parseEnquiryQuery(searchParams);

  // Single Search State & 280ms Debounce Controller
  const [localSearch, setLocalSearch] = useState(queryState.q);
  const [prevQueryQ, setPrevQueryQ] = useState(queryState.q);

  if (queryState.q !== prevQueryQ) {
    setPrevQueryQ(queryState.q);
    setLocalSearch(queryState.q);
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch.trim() !== queryState.q.trim()) {
        const nextParams = serializeEnquiryQuery(
          { q: localSearch.trim(), page: 1 },
          searchParams
        );
        router.replace(`${pathname}?${nextParams.toString()}`);
      }
    }, 280);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearch, queryState.q, pathname, router, searchParams]);


  // Test seam: e2e and component tests can inject a fixed record list.
  const testEnquiries =
    (typeof window !== "undefined" &&
      (window as unknown as { __TEST_ENQUIRIES__?: EnquiryRecord[] }).__TEST_ENQUIRIES__) ||
    null;

  // Projects are sourced from the backend (project_character = 'enq').
  // The backend URL is used strictly via the API proxy route; the frontend
  // never talks to the Turso database directly.
  const [backendProjects, setBackendProjects] = useState<BackendProject[]>([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    authedFetch("/api/projects?character=enq", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Projects request failed with status ${response.status}`);
        }
        return response.json() as Promise<{ status: string; projects: BackendProject[] }>;
      })
      .then((payload) => {
        if (!isMounted) return;
        if (payload.status === "ok" && Array.isArray(payload.projects)) {
          setBackendProjects(payload.projects);
        }
        setProjectsLoaded(true);
      })
      .catch(() => {
        if (!isMounted) return;
        setBackendProjects([]);
        setProjectsLoaded(true);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // The list is driven exclusively by the backend 'enq' projects. When a
  // test fixture is present it wins, so automated tests stay deterministic.
  const sourceRecords: EnquiryRecord[] = testEnquiries
    ? testEnquiries
    : buildEnquiriesFromProjects(backendProjects);

  const showLoading = isLoading || !projectsLoaded;

  const newTabCount = sourceRecords.filter(
    (item: EnquiryRecord) => item.stage !== "won" && item.stage !== "lost"
  ).length;

  const tabFiltered = sourceRecords.filter((item: EnquiryRecord) => {
    const isHistoryStage = item.stage === "won" || item.stage === "lost";
    const requestedTab = searchParams.get("tab") || "new";
    if (requestedTab === "history") {
      return isHistoryStage;
    }
    return !isHistoryStage;
  });

  // Apply filters and text search
  const filtered = filterEnquiries(tabFiltered, {
    q: queryState.q,
    status: queryState.status,
    source: queryState.source,
    type: queryState.type,
    stage: queryState.stage,
  });

  // Apply sorting (Received Date desc / asc)
  const sorted = sortEnquiries(filtered, queryState.sort);

  // Compute total pages and clamp current page safely
  const total = sorted.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const safePage = totalPages === 0 ? 1 : Math.min(Math.max(1, queryState.page), totalPages);

  // Normalize URL query parameter if current page got clamped (e.g. after filters change)
  useEffect(() => {
    if (safePage !== queryState.page && totalPages > 0) {
      const nextParams = serializeEnquiryQuery({ page: safePage }, searchParams);
      router.replace(`${pathname}?${nextParams.toString()}`);
    }
  }, [safePage, queryState.page, totalPages, pathname, router, searchParams]);

  // Dynamic start and end range calculations
  const start = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const end = total === 0 ? 0 : Math.min(safePage * PAGE_SIZE, total);

  // Paginated subset of records
  const paginated = paginateEnquiries(sorted, safePage, PAGE_SIZE);

  // Toggle received date sorting
  const handleToggleSort = () => {
    const nextSort = queryState.sort === "received_desc" ? "received_asc" : "received_desc";
    const nextParams = serializeEnquiryQuery({ sort: nextSort, page: 1 }, searchParams);
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  // Change page
  const handlePageChange = (newPage: number) => {
    const validMaxPages = Math.max(1, totalPages);
    if (newPage >= 1 && newPage <= validMaxPages) {
      const nextParams = serializeEnquiryQuery({ page: newPage }, searchParams);
      router.push(`${pathname}?${nextParams.toString()}`);
    }
  };

  // Handle Tab Switch
  const handleTabSwitch = (tab: "new" | "history") => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("tab", tab);
    // Reset filters and page when switching tabs
    nextParams.delete("q");
    nextParams.delete("status");
    nextParams.delete("source");
    nextParams.delete("type");
    nextParams.delete("stage");
    nextParams.delete("page");
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  const handleClearAllFilters = () => {
    const nextParams = serializeEnquiryQuery(
      {
        q: "",
        status: null,
        source: null,
        type: null,
        stage: null,
        page: 1,
      },
      searchParams
    );
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  const activeTab = searchParams.get("tab") === "history" ? "history" : "new";

  return (
    <div className={`${styles.workspace} enquiriesWorkspaceRoot`}>
      {/* 1. Enquiries Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageHeaderTitle}>Enquiries</h1>
          <p className={styles.pageHeaderDesc}>
            Review and qualify incoming project leads and requirement reviews.
          </p>
        </div>

        <div className={styles.pageHeaderRight}>
          {/* Local Enquiry Search */}
          <div className={styles.headerSearchContainer}>
            <Search size={16} className={styles.headerSearchIcon} />
            <input
              type="text"
              placeholder="Search by client, requirement or location..."
              className={styles.headerSearchInput}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 2. Nav Tabs */}
      <div className={styles.tabsNav} role="tablist" aria-label="Enquiry views">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "new"}
          className={`${styles.tabBtn} ${activeTab === "new" ? styles.tabBtnActive : ""}`}
          onClick={() => handleTabSwitch("new")}
        >
          <Inbox size={16} className={styles.tabIcon} />
          <span>New</span>
          <span className={styles.countBadge}>{newTabCount}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "history"}
          className={`${styles.tabBtn} ${activeTab === "history" ? styles.tabBtnActive : ""}`}
          onClick={() => handleTabSwitch("history")}
        >
          <Clock size={16} className={styles.tabIcon} />
          <span>History</span>
        </button>
      </div>

      {/* 3. Filter toolbar */}
      <EnquiryFilterToolbar queryState={queryState} statusFilterRef={statusFilterRef} />

      {/* 4. Dedicated Table/List Scroll Region */}
      <div className={styles.enquiryTableScrollRegion}>
        {showLoading ? (
          <div className={styles.tableWrapper}>
            <div className={styles.tableHeader}>
              <div>Enquiry</div>
              <div>Next Action</div>
              <div>Received</div>
              <div className={styles.budgetHeader}>Budget</div>
              <div>Project Type</div>
              <div className={styles.actionsHeader}>Actions</div>
            </div>
            <div className={styles.tableBody}>
              {[1, 2, 3, 4, 5].map((idx) => (
                <div key={idx} className={styles.skeletonRow}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div className={styles.skeletonPulse} style={{ width: "64px", height: "48px", borderRadius: "8px" }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div className={styles.skeletonPulse} style={{ width: "160px", height: "16px" }} />
                      <div className={styles.skeletonPulse} style={{ width: "100px", height: "12px" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div className={styles.skeletonPulse} style={{ width: "34px", height: "34px", borderRadius: "8px" }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div className={styles.skeletonPulse} style={{ width: "110px", height: "14px" }} />
                      <div className={styles.skeletonPulse} style={{ width: "60px", height: "12px" }} />
                    </div>
                  </div>
                  <div className={styles.skeletonPulse} style={{ width: "120px", height: "14px" }} />
                  <div className={`${styles.skeletonPulse} ${styles.budgetCell}`} style={{ width: "80px", height: "14px" }} />
                  <div className={styles.skeletonPulse} style={{ width: "90px", height: "26px", borderRadius: "6px" }} />
                  <div className={styles.actionsCell}>
                    <div className={styles.skeletonPulse} style={{ width: "68px", height: "40px", borderRadius: "6px" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : paginated.length > 0 ? (
          <>
            {/* Desktop/Tablet Grid View */}
            <div className={styles.tableWrapper} role="grid" aria-label="Enquiries List">
              <div className={styles.tableHeader} role="row">
                <div role="columnheader">Enquiry</div>
                <div role="columnheader">Next Action</div>
                <div role="columnheader">
                  <button
                    type="button"
                    aria-label="Sort enquiries by received date"
                    aria-pressed={queryState.sort === "received_asc"}
                    className={styles.sortBtn}
                    onClick={handleToggleSort}
                  >
                    <span>Received</span>
                    {queryState.sort === "received_asc" ? (
                      <ArrowUp size={13} />
                    ) : queryState.sort === "received_desc" ? (
                      <ArrowDown size={13} />
                    ) : (
                      <ArrowUpDown size={13} />
                    )}
                  </button>
                </div>
                <div className={styles.budgetHeader} role="columnheader">
                  Budget
                </div>
                <div role="columnheader">Project Type</div>
                <div className={styles.actionsHeader} role="columnheader">
                  Actions
                </div>
              </div>

              <div className={styles.tableBody}>
                {paginated.map((enquiry: EnquiryRecord) => (
                  <EnquiryTableRow key={enquiry.id} enquiry={enquiry} now={FIXED_NOW} />
                ))}
              </div>
            </div>

            {/* Mobile Stacked list view */}
            <div className={styles.mobileList} role="list">
              {paginated.map((enquiry: EnquiryRecord) => (
                <EnquiryMobileCard key={enquiry.id} enquiry={enquiry} now={FIXED_NOW} />
              ))}
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyStateTitle}>No enquiries found</h3>
            <p className={styles.emptyStateDesc}>Try changing your search or filters.</p>
            <button type="button" className={styles.clearFiltersBtn} onClick={handleClearAllFilters}>
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* 5. Pagination Bar (Always visible outside scroll region) */}
      <div className={styles.paginationBar}>
        <span className={styles.paginationText}>
          Showing {start}–{end} of {total} enquiries
        </span>

        <div className={styles.paginationCtrls}>
          <button
            type="button"
            className={`${styles.pageBtn} ${safePage === 1 ? styles.pageBtnDisabled : ""}`}
            onClick={() => handlePageChange(safePage - 1)}
            disabled={safePage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              className={`${styles.pageBtn} ${safePage === p ? styles.pageBtnActive : ""}`}
              onClick={() => handlePageChange(p)}
              disabled={total === 0}
              aria-label={`Page ${p}`}
              aria-current={safePage === p ? "page" : undefined}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            className={`${styles.pageBtn} ${safePage === totalPages || totalPages === 0 ? styles.pageBtnDisabled : ""}`}
            onClick={() => handlePageChange(safePage + 1)}
            disabled={safePage === totalPages || totalPages === 0}
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function EnquiriesSkeleton() {
  return (
    <div className={`${styles.workspace} enquiriesWorkspaceRoot`}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <div className={styles.skeletonPulse} style={{ width: "140px", height: "26px", marginBottom: "6px" }} />
          <div className={styles.skeletonPulse} style={{ width: "320px", height: "14px" }} />
        </div>
        <div className={styles.pageHeaderRight}>
          <div className={styles.skeletonPulse} style={{ width: "240px", height: "38px", borderRadius: "8px" }} />
        </div>
      </div>

      <div className={styles.tabsNav} role="tablist">
        <div className={styles.skeletonPulse} style={{ width: "60px", height: "24px", marginBottom: "8px" }} />
        <div className={styles.skeletonPulse} style={{ width: "60px", height: "24px", marginBottom: "8px", marginLeft: "20px" }} />
      </div>

      <div className={styles.filtersBar}>
        <div className={styles.pillsRow}>
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className={styles.skeletonPulse} style={{ width: "90px", height: "36px", borderRadius: "8px" }} />
          ))}
        </div>
      </div>

      <div className={styles.enquiryTableScrollRegion}>
        <div className={styles.tableWrapper}>
          <div className={styles.tableHeader}>
            <div>Enquiry</div>
            <div>Next Action</div>
            <div>Received</div>
            <div className={styles.budgetHeader}>Budget</div>
            <div>Project Type</div>
            <div className={styles.viewCell}></div>
          </div>
          <div className={styles.tableBody}>
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className={styles.skeletonRow}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div className={styles.skeletonPulse} style={{ width: "72px", height: "58px", borderRadius: "8px" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div className={styles.skeletonPulse} style={{ width: "160px", height: "16px" }} />
                    <div className={styles.skeletonPulse} style={{ width: "100px", height: "12px" }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div className={styles.skeletonPulse} style={{ width: "38px", height: "38px", borderRadius: "8px" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div className={styles.skeletonPulse} style={{ width: "110px", height: "14px" }} />
                    <div className={styles.skeletonPulse} style={{ width: "60px", height: "12px" }} />
                  </div>
                </div>
                <div className={styles.skeletonPulse} style={{ width: "120px", height: "14px" }} />
                <div className={`${styles.skeletonPulse} ${styles.budgetCell}`} style={{ width: "80px", height: "14px" }} />
                <div className={styles.skeletonPulse} style={{ width: "90px", height: "28px", borderRadius: "7px" }} />
                <div className={styles.viewCell}>
                  <div className={styles.skeletonPulse} style={{ width: "80px", height: "40px", borderRadius: "8px" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
