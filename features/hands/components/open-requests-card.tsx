"use client";

import { ChevronDown, ChevronRight, LayoutGrid, List, Plus, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import type { HandsTab, WorkforceRequest } from "../types/hands.types";
import { getFulfilmentPercentage } from "../utils/hands-formatters";
import { WorkforceRequestCard } from "./workforce-request-card";
import styles from "./hands-overview.module.css";

interface OpenRequestsCardProps {
  requests: WorkforceRequest[];
  onNavigateTab: (tab: HandsTab) => void;
  onRequestWorkforce: () => void;
  onSelectRequest?: (request: WorkforceRequest) => void;
  defaultViewMode?: "grid" | "list";
}

export function OpenRequestsCard({
  requests,
  onNavigateTab,
  onRequestWorkforce,
  onSelectRequest,
  defaultViewMode = "grid",
}: OpenRequestsCardProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">(defaultViewMode);
  const [projectFilter, setProjectFilter] = useState("all");
  const [tradeFilter, setTradeFilter] = useState("all");

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
        return matchesProject && matchesTrade;
      }),
    [requests, projectFilter, tradeFilter],
  );

  const hasFilters = projectFilter !== "all" || tradeFilter !== "all";

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
        <div className={styles.cardHeaderActions}>
          <button
            type="button"
            className={styles.textButton}
            onClick={() => onNavigateTab("requests")}
          >
            View all
          </button>
        </div>
      </div>

      {/* Toolbar with Filters and Grid/List toggle */}
      <div className={styles.deploymentToolbar}>
        <div className={styles.filterGroup}>
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
        </div>

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
      </div>

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
              ? "Change or clear the project and trade filters."
              : "There are currently no unresolved labour requirements."}
          </p>
          {hasFilters ? (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => {
                setProjectFilter("all");
                setTradeFilter("all");
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

      <div className={styles.cardFooter}>
        <button
          type="button"
          className={`${styles.secondaryButton} ${styles.fullWidthButton}`}
          onClick={onRequestWorkforce}
        >
          <Plus size={14} aria-hidden="true" />
          Request more workers
        </button>
      </div>
    </section>
  );
}

