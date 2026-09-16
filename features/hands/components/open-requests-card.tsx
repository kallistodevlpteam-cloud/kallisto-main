"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight, History, LayoutGrid, List, Search, SlidersHorizontal, UserPlus, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { HandsTab, WorkforceRequest } from "../types/hands.types";
import { getFulfilmentPercentage } from "../utils/hands-formatters";
import { WorkforceRequestCard } from "./workforce-request-card";
import styles from "./hands-overview.module.css";

interface HistoricalRequestItem {
  id: string;
  projectName: string;
  location: string;
  tradesSummary: string;
  contractorName: string;
  fulfilledDate: string;
  status: string;
  workerCount: number;
  primaryTrade: string;
  logNote: string;
  rejectionReason?: string;
}

const HISTORICAL_REQUESTS: HistoricalRequestItem[] = [
  {
    id: "REQ-2026-089",
    projectName: "Nila Residence",
    location: "Thiruvananthapuram, Kerala",
    tradesSummary: "8 Masons, 10 Helpers",
    contractorName: "Apex Integrated Civil & Finishing Crew",
    fulfilledDate: "20 Jul 2026",
    status: "Fulfilled & Active",
    workerCount: 18,
    primaryTrade: "Masons",
    logNote: "Muster verified by Supervisor Rajeev K. Shift active on site.",
  },
  {
    id: "REQ-2026-074",
    projectName: "Arjun Villa",
    location: "Kochi, Kerala",
    tradesSummary: "6 Painters",
    contractorName: "Chroma Finishes & Paint Crew",
    fulfilledDate: "15 Jul 2026",
    status: "Fulfilled & Active",
    workerCount: 6,
    primaryTrade: "Painters",
    logNote: "Exterior weatherproof primer coat completed by Binoy George.",
  },
  {
    id: "REQ-2026-061",
    projectName: "Marina Office",
    location: "Kozhikode, Kerala",
    tradesSummary: "4 Electricians",
    contractorName: "Circuit MEP Solutions",
    fulfilledDate: "10 Jul 2026",
    status: "Handed Over",
    workerCount: 4,
    primaryTrade: "Electricians",
    logNote: "Main feeder line & Distribution Board termination approved by Shafeeq M.",
  },
  {
    id: "REQ-2026-048",
    projectName: "Green Courtyard",
    location: "Thrissur, Kerala",
    tradesSummary: "5 Carpenters",
    contractorName: "Forma Woodworks",
    fulfilledDate: "02 Jul 2026",
    status: "Handed Over",
    workerCount: 5,
    primaryTrade: "Carpenters",
    logNote: "Hardwood door frames fixed & window joinery aligned by Manoj V.",
  },
  {
    id: "REQ-2026-052",
    projectName: "Nila Residence",
    location: "Thiruvananthapuram, Kerala",
    tradesSummary: "6 Welders, 2 Helpers",
    contractorName: "Precision Steel & Welders Gang",
    fulfilledDate: "24 Jun 2026",
    status: "Rejected",
    workerCount: 0,
    primaryTrade: "Welders",
    rejectionReason:
      "Contractor crew capacity exhausted — unable to mobilize certified 6G structural welders on the requested shift window without an unauthorized 35% premium rate escalation.",
    logNote:
      "Formal capacity declination logged. Rate escalation rejected per Kallisto rate-card rules.",
  },
  {
    id: "REQ-2026-031",
    projectName: "Marina Office",
    location: "Kozhikode, Kerala",
    tradesSummary: "8 Helpers",
    contractorName: "Apex Material Staging Crew",
    fulfilledDate: "12 Jun 2026",
    status: "Rejected",
    workerCount: 0,
    primaryTrade: "Helpers",
    rejectionReason:
      "Site safety clearance delayed — municipal permit pending for exterior façade staging. Request rejected prior to mobilization to prevent idle worker charges.",
    logNote:
      "Municipal clearance inspection postponed to 16 Jun. Gate passes cancelled with zero penalty.",
  },
];

interface OpenRequestsCardProps {
  requests: WorkforceRequest[];
  onNavigateTab: (tab: HandsTab) => void;
  onRequestWorkforce: () => void;
  onSelectRequest?: (request: WorkforceRequest) => void;
  defaultViewMode?: "grid" | "list";
  showFilters?: boolean;
}

export function OpenRequestsCard({
  requests,
  onNavigateTab,
  onRequestWorkforce,
  onSelectRequest,
  defaultViewMode = "grid",
  showFilters = false,
}: OpenRequestsCardProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">(defaultViewMode);
  const [projectFilter, setProjectFilter] = useState("all");
  const [tradeFilter, setTradeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyTradeFilter, setHistoryTradeFilter] = useState("all");

  const projects = useMemo(
    () =>
      Array.from(
        new Map(
          requests.map((request) => [request.projectId, request.projectName]),
        ),
      ),
    [requests],
  );

  const trades = useMemo(() => {
    const tradeSet = new Set<string>();
    requests.forEach((r) => {
      tradeSet.add(r.trade);
      if (r.tradesBreakdown) {
        r.tradesBreakdown.forEach((tb) => tradeSet.add(tb.trade));
      }
    });
    return Array.from(tradeSet);
  }, [requests]);

  const filteredRequests = useMemo(
    () =>
      requests.filter((request) => {
        const matchesProject =
          projectFilter === "all" || request.projectId === projectFilter;
        const matchesTrade =
          tradeFilter === "all" ||
          request.trade === tradeFilter ||
          (request.tradesBreakdown &&
            request.tradesBreakdown.some((tb) => tb.trade === tradeFilter));

        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          request.projectName.toLowerCase().includes(q) ||
          (request.contractorName &&
            request.contractorName.toLowerCase().includes(q)) ||
          (request.contractorBrand &&
            request.contractorBrand.toLowerCase().includes(q)) ||
          (request.location && request.location.toLowerCase().includes(q)) ||
          request.trade.toLowerCase().includes(q);

        return matchesProject && matchesTrade && matchesSearch;
      }),
    [requests, projectFilter, tradeFilter, searchQuery],
  );

  const hasFilters =
    projectFilter !== "all" || tradeFilter !== "all" || searchQuery.trim() !== "";

  return (
    <section
      className={`${styles.sectionCard} ${styles.requestsCard}`}
      aria-labelledby="open-requests-title"
    >
      <div className={styles.cardHeader}>
        <div>
          <h2 id="open-requests-title">Open requests</h2>
          <p>Unfulfilled site workforce requirements & contractor matching</p>
        </div>
        <div className={styles.cardHeaderActions} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            className={styles.requestLabourActionBtn}
            onClick={onRequestWorkforce}
            title="Create manual labour request"
            aria-label="Request labour"
          >
            <UserPlus size={14} aria-hidden="true" />
            <span>Request Labour</span>
          </button>

          <div
            className={styles.viewModeToggle}
            role="group"
            aria-label="Requests layout view"
          >
            <button
              type="button"
              className={`${styles.viewModeBtn} ${
                viewMode === "grid" ? styles.viewModeBtnActive : ""
              }`}
              onClick={() => setViewMode("grid")}
              aria-label="Cards grid view"
              title="Cards grid view"
            >
              <LayoutGrid size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`${styles.viewModeBtn} ${
                viewMode === "list" ? styles.viewModeBtnActive : ""
              }`}
              onClick={() => setViewMode("list")}
              aria-label="List view"
              title="List view"
            >
              <List size={15} aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            className={styles.textButton}
            onClick={() => onNavigateTab("requests")}
          >
            View all
          </button>
        </div>
      </div>

      {showFilters && (
        <div className={styles.deploymentToolbar} style={{ padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
          <div className={styles.filterGroup}>
            <div className={styles.searchInputControl}>
              <Search size={14} className={styles.searchControlIcon} aria-hidden="true" />
              <input
                type="text"
                placeholder="Search project or contractor..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                aria-label="Search project or contractor"
              />
              {searchQuery ? (
                <button
                  type="button"
                  className={styles.searchClearBtn}
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <X size={12} aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <SlidersHorizontal size={14} aria-hidden="true" />
            <label className={styles.selectControl}>
              <span className={styles.visuallyHidden}>Filter by project</span>
              <select
                value={projectFilter}
                onChange={(event) => setProjectFilter(event.target.value)}
              >
                <option value="all">All projects</option>
                {projects.map(([projectId, projectName]) => (
                  <option key={projectId} value={projectId}>
                    {projectName}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} aria-hidden="true" />
            </label>
            <label className={styles.selectControl}>
              <span className={styles.visuallyHidden}>Filter by trade</span>
              <select
                value={tradeFilter}
                onChange={(event) => setTradeFilter(event.target.value)}
              >
                <option value="all">All trades</option>
                {trades.map((trade) => (
                  <option key={trade} value={trade}>
                    {trade}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} aria-hidden="true" />
            </label>

            {/* Request History Button next to All trades */}
            <Link
              href="/hands/requests/history"
              className={styles.requestHistoryBtn}
              title="View Request History across trades"
              aria-label="View request history"
            >
              <History size={13} aria-hidden="true" />
              <span>Request History</span>
            </Link>
          </div>
        </div>
      )}

      {filteredRequests.length > 0 ? (
        <>
          {viewMode === "grid" ? (
            <div
              className={styles.requestCardsGrid}
              aria-label="Pending workforce request cards"
            >
              {filteredRequests.map((request) => (
                <WorkforceRequestCard
                  key={request.id}
                  request={request}
                  onSelect={
                    onSelectRequest || (() => onNavigateTab("requests"))
                  }
                  onRequestWorkforce={onRequestWorkforce}
                />
              ))}
            </div>
          ) : (
            <div className={styles.requestList}>
              {filteredRequests.map((request) => {
                const progress = getFulfilmentPercentage(
                  request.fulfilled,
                  request.quantity,
                );

                return (
                  <button
                    key={request.id}
                    type="button"
                    className={styles.requestItem}
                    onClick={() =>
                      onSelectRequest
                        ? onSelectRequest(request)
                        : onNavigateTab("requests")
                    }
                    aria-label={`Open ${request.trade} request for ${request.projectName}`}
                  >
                    <span className={styles.requestTopLine}>
                      <strong>{request.trade}</strong>
                      <ChevronRight size={15} aria-hidden="true" />
                    </span>
                    <span className={styles.requestMeta}>
                      {request.projectName} · Required {request.requiredDate}
                    </span>
                    <span className={styles.requestProgressMeta}>
                      <span>
                        Fulfilled{" "}
                        <strong>
                          {request.fulfilled} of {request.quantity}
                        </strong>
                      </span>
                      <span>{request.quantity} workers</span>
                    </span>
                    <span
                      className={styles.progressTrack}
                      role="progressbar"
                      aria-label={`${request.trade} fulfilment`}
                      aria-valuemin={0}
                      aria-valuemax={request.quantity}
                      aria-valuenow={request.fulfilled}
                    >
                      <span
                        className={styles.progressFill}
                        style={{ width: `${progress}%` }}
                      />
                    </span>
                    <span className={styles.requestStatus}>
                      {request.status}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className={styles.compactEmptyState}>
          <h3>
            {hasFilters
              ? "No requests match these filters"
              : "All workforce requests are fulfilled"}
          </h3>
          <p>
            {hasFilters
              ? "Change or clear the project, contractor search and trade filters."
              : "There are currently no unresolved labour requirements."}
          </p>
          {hasFilters ? (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => {
                setProjectFilter("all");
                setTradeFilter("all");
                setSearchQuery("");
              }}
            >
              Clear filters
            </button>
          ) : (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={onRequestWorkforce}
            >
              Request workforce
            </button>
          )}
        </div>
      )}



      {showHistoryModal ? (
        <div
          className={styles.historyModalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowHistoryModal(false);
          }}
        >
          <div className={styles.historyModal}>
            <div className={styles.historyModalHeader}>
              <div className={styles.historyModalTitleWrap}>
                <History size={18} style={{ color: "#0284c7" }} />
                <div>
                  <h3 id="history-modal-title">Workforce Request History</h3>
                  <p className={styles.historyModalSubtitle}>
                    Historical trade allocations, contractor performance & completed shift logs
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={styles.historyModalCloseBtn}
                onClick={() => setShowHistoryModal(false)}
                aria-label="Close request history"
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.historyFilterBar}>
              {["all", "Masons", "Electricians", "Carpenters", "Painters", "Helpers"].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.historyFilterPill} ${
                    historyTradeFilter === t ? styles.historyFilterPillActive : ""
                  }`}
                  onClick={() => setHistoryTradeFilter(t)}
                >
                  {t === "all" ? "All Trades" : t}
                </button>
              ))}
            </div>

            <div className={styles.historyListBody}>
              {HISTORICAL_REQUESTS.filter(
                (h) =>
                  historyTradeFilter === "all" ||
                  h.primaryTrade.toLowerCase().includes(historyTradeFilter.toLowerCase()) ||
                  h.tradesSummary.toLowerCase().includes(historyTradeFilter.toLowerCase())
              ).map((item) => (
                <div key={item.id} className={styles.historyItemCard}>
                  <div className={styles.historyItemHeader}>
                    <div>
                      <strong>{item.projectName} — {item.tradesSummary}</strong>
                      <div className={styles.historyItemMeta}>
                        <span>{item.id}</span> • <span>{item.location}</span> • <span>{item.status === "Rejected" ? `Rejected: ${item.fulfilledDate}` : `Fulfilled: ${item.fulfilledDate}`}</span>
                      </div>
                    </div>
                    <span
                      className={`${styles.historyItemBadge} ${
                        item.status === "Rejected" ? styles.statusRejected : ""
                      }`}
                    >
                      {item.status === "Rejected" ? "✕ Rejected" : `✓ ${item.status}`}
                    </span>
                  </div>

                  {item.status === "Rejected" && item.rejectionReason ? (
                    <div className={styles.gridRejectionBox}>
                      <strong style={{ color: "#991b1b" }}>Reason for Rejection:</strong> {item.rejectionReason}
                    </div>
                  ) : (
                    <div className={styles.historyItemLog}>
                      <strong>Assigned Contractor:</strong> {item.contractorName} ({item.workerCount} workers deployed)<br />
                      <span>{item.logNote}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

