"use client";

import React, { useState, useMemo } from "react";
import { LabourRequest, LabourRequestStatus } from "../../types/request-domain";
import { INITIAL_LABOUR_REQUESTS, calculateRequestsMetrics } from "../../mock/requests-mock-data";
import { HandsRequestsTabs } from "./hands-requests-tabs";
import { HandsRequestsSummaryCards } from "./hands-requests-summary-cards";
import { HandsRequestsToolbar } from "./hands-requests-toolbar";
import { HandsRequestsList } from "./hands-requests-list";
import { HandsRequestDetailDrawer } from "./hands-request-detail-drawer";
import styles from "./hands-requests.module.css";

export function HandsRequestsWorkspace() {
  const [requests, setRequests] = useState<LabourRequest[]>(INITIAL_LABOUR_REQUESTS);
  const [activeTab, setActiveTab] = useState<string>("new");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrade, setSelectedTrade] = useState("All");
  const [selectedSort, setSelectedSort] = useState("default");
  const [dispatchCity, setDispatchCity] = useState("Trivandrum, Kerala");
  const [dispatchRadius, setDispatchRadius] = useState(45);

  const [selectedRequest, setSelectedRequest] = useState<LabourRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      new: requests.filter((r) => r.status === "new").length,
      history: requests.filter((r) => r.status === "closed" || r.status === "accepted").length,
    };
  }, [requests]);

  // Operational metrics
  const metrics = useMemo(() => {
    return calculateRequestsMetrics(requests);
  }, [requests]);

  // Filtered and sorted requests
  const filteredRequests = useMemo(() => {
    let list = requests.filter((req) => {
      // 1. Status tab filter
      if (activeTab === "new" && req.status !== "new") {
        return false;
      }
      if (activeTab === "history" && req.status !== "closed" && req.status !== "accepted") {
        return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesProject = req.projectName.toLowerCase().includes(q);
        const matchesLocation = req.location.toLowerCase().includes(q);
        const matchesClient = req.clientName.toLowerCase().includes(q);
        const matchesTrade = req.requirements.some((r) => r.trade.toLowerCase().includes(q));

        if (!matchesProject && !matchesLocation && !matchesClient && !matchesTrade) {
          return false;
        }
      }

      // 3. Trade filter
      if (selectedTrade !== "All") {
        if (!req.requirements.some((r) => r.trade === selectedTrade)) {
          return false;
        }
      }

      return true;
    });

    // Sort options
    if (selectedSort === "workers_desc") {
      list = [...list].sort((a, b) => {
        const aTotal = a.requirements.reduce((acc, r) => acc + r.requiredCount, 0);
        const bTotal = b.requirements.reduce((acc, r) => acc + r.requiredCount, 0);
        return bTotal - aTotal;
      });
    } else if (selectedSort === "workers_asc") {
      list = [...list].sort((a, b) => {
        const aTotal = a.requirements.reduce((acc, r) => acc + r.requiredCount, 0);
        const bTotal = b.requirements.reduce((acc, r) => acc + r.requiredCount, 0);
        return aTotal - bTotal;
      });
    } else if (selectedSort === "urgency") {
      list = [...list].sort((a, b) => (a.urgency === "urgent" ? -1 : 1));
    }

    return list;
  }, [requests, activeTab, searchQuery, selectedTrade, selectedSort]);

  const handleSelectRequest = (req: LabourRequest) => {
    setSelectedRequest(req);
  };

  const handleReviewRequest = (req: LabourRequest) => {
    setSelectedRequest(req);
    setIsDetailOpen(true);
  };

  const handleAcceptRequest = (req: LabourRequest) => {
    const updated = { ...req, status: "accepted" as LabourRequestStatus };
    setRequests((prev) =>
      prev.map((r) => (r.id === req.id ? updated : r))
    );
    setIsDetailOpen(false);
    setSelectedRequest(updated);
    setActiveTab("history");
  };

  const handleDeclineRequest = (req: LabourRequest) => {
    const updated = { ...req, status: "closed" as LabourRequestStatus };
    setRequests((prev) =>
      prev.map((r) => (r.id === req.id ? updated : r))
    );
    setIsDetailOpen(false);
    setSelectedRequest(updated);
    setActiveTab("history");
  };

  return (
    <div className={styles.workspace}>
      <main className={styles.leftMainSection}>
        {/* 1. Header (Title + Subtitle) */}
        <div className={styles.pageHeader}>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>Requests</h1>
            <span className={styles.pageTitleSub}>· Active Requisitions & Demands</span>
          </div>
          <p className={styles.pageDescription}>
            Incoming workforce requirements from site managers and contractors with bench allocation and trade readiness.
          </p>
        </div>

        {/* 2. Top Telemetry & Filters Bar */}
        <HandsRequestsToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTrade={selectedTrade}
          onTradeChange={setSelectedTrade}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          dispatchCity={dispatchCity}
          dispatchRadius={dispatchRadius}
          onUpdateDispatchZone={(city, radius) => {
            setDispatchCity(city);
            setDispatchRadius(radius);
          }}
        />

        {/* 3. Operational Summary 4-Card Grid */}
        <HandsRequestsSummaryCards metrics={metrics} />

        {/* 4. Workflow Stage Navigation Pills */}
        <HandsRequestsTabs
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setSelectedRequest(null);
          }}
          counts={tabCounts}
        />

        {/* 5. Request List Cards */}
        <HandsRequestsList
          requests={filteredRequests}
          selectedRequestId={selectedRequest?.id}
          onSelectRequest={handleSelectRequest}
          onReviewRequest={handleReviewRequest}
        />
      </main>

      {/* Request Detail Workspace Modal */}
      {selectedRequest && (
        <HandsRequestDetailDrawer
          request={selectedRequest}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onAcceptRequest={handleAcceptRequest}
          onDeclineRequest={handleDeclineRequest}
        />
      )}
    </div>
  );
}
