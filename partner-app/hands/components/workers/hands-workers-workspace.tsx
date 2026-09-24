"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, UserPlus, Sparkles, CheckCircle2, X } from "lucide-react";
import { StudioDuotoneIcon } from "@/components/layout/sidebar-icons";
import {
  WorkerProfile,
  WorkerTrade,
  WorkerAvailability,
  WorkforceSummaryMetrics,
  LabourRequestMatch,
} from "../../types/worker-domain";
import {
  INITIAL_WORKERS,
  INITIAL_WORKFORCE_METRICS,
} from "../../mock/workers-mock-data";
import { HandsWorkersSummaryCards } from "./hands-workers-summary-cards";
import { HandsWorkersToolbar } from "./hands-workers-toolbar";
import { HandsWorkersTable } from "./hands-workers-table";
import { HandsWorkerProfileDrawer } from "./hands-worker-profile-drawer";
import { HandsAddWorkerModal } from "./hands-add-worker-modal";
import { HandsWorkerOdinPanel } from "./hands-worker-odin-panel";
import styles from "./hands-workers.module.css";

export function HandsWorkersWorkspace() {
  const router = useRouter();
  const [workers, setWorkers] = useState<WorkerProfile[]>(INITIAL_WORKERS);
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [isRegisteringWorker, setIsRegisteringWorker] = useState(false);
  const [isOdinOpen, setIsOdinOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrade, setSelectedTrade] = useState<WorkerTrade | "All">("All");
  const [selectedAvailability, setSelectedAvailability] = useState<
    WorkerAvailability | "All" | "NeedsAttention"
  >("All");
  const [sortBy, setSortBy] = useState<"default" | "experience_desc" | "name_asc" | "trade_asc">("default");

  // Derived Metrics
  const metrics: WorkforceSummaryMetrics = useMemo(() => {
    const totalWorkers = workers.length;
    const onAssignment = workers.filter((w) => w.availability === "Assigned").length;
    const availableToday = workers.filter((w) => w.availability === "Available").length;
    const needsAttention = workers.filter(
      (w) => w.verificationStatus === "Pending" || Boolean(w.needsAttentionReason)
    ).length;

    // Preserve baseline fleet scale numbers if larger
    return {
      totalWorkers: Math.max(INITIAL_WORKFORCE_METRICS.totalWorkers, totalWorkers),
      onAssignment: Math.max(INITIAL_WORKFORCE_METRICS.onAssignment, onAssignment),
      availableToday: Math.max(INITIAL_WORKFORCE_METRICS.availableToday, availableToday),
      needsAttention: Math.max(INITIAL_WORKFORCE_METRICS.needsAttention, needsAttention),
    };
  }, [workers]);

  // Filtered & Sorted Workers list
  const filteredWorkers = useMemo(() => {
    const list = workers.filter((worker) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = worker.name.toLowerCase().includes(q);
        const matchesTrade = worker.trade.toLowerCase().includes(q);
        const matchesId = worker.id.toLowerCase().includes(q);
        const matchesSkills = worker.skills.some((s) => s.toLowerCase().includes(q));
        const matchesLocation = worker.location.toLowerCase().includes(q);
        const matchesProject = worker.currentAssignment?.projectName
          .toLowerCase()
          .includes(q);

        if (
          !matchesName &&
          !matchesTrade &&
          !matchesId &&
          !matchesSkills &&
          !matchesLocation &&
          !matchesProject
        ) {
          return false;
        }
      }

      // Trade filter
      if (selectedTrade !== "All" && worker.trade !== selectedTrade) {
        return false;
      }

      // Availability filter
      if (selectedAvailability !== "All") {
        if (selectedAvailability === "NeedsAttention") {
          if (
            worker.verificationStatus !== "Pending" &&
            !worker.needsAttentionReason
          ) {
            return false;
          }
        } else if (worker.availability !== selectedAvailability) {
          return false;
        }
      }

      return true;
    });

    if (sortBy === "experience_desc") {
      return [...list].sort((a, b) => b.experienceYears - a.experienceYears);
    }
    if (sortBy === "name_asc") {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === "trade_asc") {
      return [...list].sort((a, b) => a.trade.localeCompare(b.trade));
    }

    return list;
  }, [
    workers,
    searchQuery,
    selectedTrade,
    selectedAvailability,
    sortBy,
  ]);

  const handleSelectWorker = (worker: WorkerProfile) => {
    router.push(`/partner/hands/workers/${worker.id}`);
  };


  const handleAddWorker = (newWorker: WorkerProfile) => {
    setWorkers((prev) => [newWorker, ...prev]);
    setSelectedWorker(newWorker);
    setToastMessage(`${newWorker.name} has been added successfully!`);
  };

  const handleAssignWorker = (
    worker: WorkerProfile,
    targetRequest?: LabourRequestMatch
  ) => {
    const updated = {
      ...worker,
      availability: "Assigned" as WorkerAvailability,
      currentAssignment: {
        projectId: targetRequest?.requestId || "proj-new-01",
        projectName: targetRequest?.projectName || "Direct Work Order",
        role: `${worker.trade} Deployment`,
        startDate: targetRequest?.startDate || "Today",
        endDate: "Ongoing",
        location: targetRequest?.location || worker.location,
      },
    };

    setWorkers((prev) => prev.map((w) => (w.id === worker.id ? updated : w)));
    setSelectedWorker(updated);
    setIsProfileOpen(false);
  };

  return (
    <div
      className={`${styles.workspace} hands-workers-workspace-root`}
      style={{
        gridTemplateColumns: isOdinOpen ? "minmax(0, 1fr) 390px" : "1fr",
      }}
    >
      {/* Light Green Glass Top Toast Notification Banner */}
      {toastMessage && (
        <div className={styles.topToastBannerGlass} role="alert" aria-live="polite">
          <div className={styles.toastIconWrap}>
            <CheckCircle2 size={16} />
          </div>
          <div className={styles.toastContentWrap}>
            <span className={styles.toastTitle}>Success</span>
            <span className={styles.toastSubtitle}>{toastMessage}</span>
          </div>
          <button
            type="button"
            className={styles.toastCloseBtn}
            onClick={() => setToastMessage(null)}
            aria-label="Close notification"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Main Workforce Content Area */}
      <main className={styles.leftMainSection}>
        {/* Page Header */}
        <header className={styles.pageHeader}>
          <div className={styles.headerInfo}>
            <h1 className={styles.pageTitle}>Workers</h1>
            <p className={styles.pageSubtitle}>
              Manage your registered workforce, skills and availability.
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.addWorkerBtn}
              onClick={() => {
                setSelectedWorker(null);
                setIsProfileOpen(false);
                setIsAddWorkerOpen(true);
              }}
              aria-label="Add Worker"
            >
              <Plus size={16} />
              <span>Add Worker</span>
            </button>

            <button
              type="button"
              className={styles.odinToggleBtn}
              onClick={() => setIsOdinOpen((prev) => !prev)}
              aria-label="Ask Odin"
            >
              <Sparkles size={15} style={{ color: "#7c3aed" }} />
              <span>{isOdinOpen ? "Collapse Odin" : "Ask Odin"}</span>
            </button>
          </div>
        </header>

        {/* 1. Top Telemetry & Filters Bar (Matching Hub Products) */}
        <HandsWorkersToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTrade={selectedTrade}
          onTradeChange={setSelectedTrade}
          selectedAvailability={selectedAvailability}
          onAvailabilityChange={setSelectedAvailability}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          totalWorkers={metrics.totalWorkers}
          availableWorkers={metrics.availableToday}
        />

        {/* 2. Operational Summary KPI Cards (4 Cards) */}
        <HandsWorkersSummaryCards metrics={metrics} />

        {/* 3. Worker Directory Scannable Table */}
        <HandsWorkersTable
          workers={filteredWorkers}
          selectedWorkerId={selectedWorker?.id}
          onSelectWorker={handleSelectWorker}
          onOpenAddWorker={() => {
            setSelectedWorker(null);
            setIsProfileOpen(false);
            setIsAddWorkerOpen(true);
          }}
          onAskOdinForWorker={(worker) => {
            setSelectedWorker(worker);
            setIsRegisteringWorker(false);
            setIsOdinOpen(true);
          }}
        />
      </main>

      {/* Right Column: Odin Workforce Intelligence Panel */}
      {isOdinOpen && (
        <div className={styles.rightPanelSection}>
          <HandsWorkerOdinPanel
            selectedWorker={selectedWorker}
            onDeselectWorker={() => setSelectedWorker(null)}
            onFilterAvailability={(avail) => setSelectedAvailability(avail)}
            onFilterTrade={(trade) => setSelectedTrade(trade as WorkerTrade)}
            onSearchQuery={(q) => setSearchQuery(q)}
            onAssignWorker={handleAssignWorker}
            onClose={() => {
              setIsOdinOpen(false);
              setIsRegisteringWorker(false);
            }}
            availableCount={metrics.availableToday}
            isRegisteringWorker={isRegisteringWorker}
            onCancelRegistration={() => setIsRegisteringWorker(false)}
            onAddWorker={(worker) => {
              handleAddWorker(worker);
              setIsRegisteringWorker(false);
            }}
          />
        </div>
      )}

      {/* Worker Profile Slide-over Drawer */}
      {selectedWorker && (
        <HandsWorkerProfileDrawer
          worker={selectedWorker}
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          onAssignToWork={handleAssignWorker}
          onAskOdinForWorker={(worker) => {
            setIsProfileOpen(false);
            setIsOdinOpen(true);
            setSelectedWorker(worker);
          }}
        />
      )}

      {/* Add Worker Modal Overlay */}
      <HandsAddWorkerModal
        isOpen={isAddWorkerOpen}
        onClose={() => setIsAddWorkerOpen(false)}
        onAddWorker={handleAddWorker}
      />
    </div>
  );
}
