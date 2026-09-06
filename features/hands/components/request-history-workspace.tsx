"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Filter,
  HardHat,
  History,
  Layers3,
  LayoutGrid,
  List,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
  UserCheck,
  Users,
  X,
  Zap,
} from "lucide-react";
import type { HandsTab, WorkforceRequest } from "../types/hands.types";
import { getFulfilmentPercentage } from "../utils/hands-formatters";
import { getTradeIcon } from "./workforce-request-card";
import { HandsPageHeader } from "./hands-page-header";
import { HandsPageTabs } from "./hands-page-tabs";
import styles from "./hands-overview.module.css";

interface RequestHistoryItem {
  id: string;
  projectId: string;
  projectName: string;
  location: string;
  tradesSummary: string;
  quantity: number;
  fulfilled: number;
  primaryTrade: string;
  contractorName: string;
  contractorRating: number;
  contractorExperienceYears: number;
  contractorCoverImage?: string;
  requestedDate: string;
  fulfilledDate: string;
  status: "Fulfilled & Active" | "Handed Over" | "Multi-Contractor Split" | "Completed";
  dailyRate: number;
  shiftTiming: string;
  supervisor: string;
  logNote: string;
  isMultiTrade?: boolean;
  isSplitContractor?: boolean;
  splitContractorDetails?: string;
  tradesBreakdown?: Array<{
    trade: string;
    quantity: number;
    fulfilled: number;
    dailyRate: number;
  }>;
}

const MOCK_HISTORICAL_RECORDS: RequestHistoryItem[] = [
  {
    id: "REQ-2026-089",
    projectId: "proj-001",
    projectName: "Nila Residence",
    location: "Thiruvananthapuram, Kerala",
    tradesSummary: "8 Masons, 2 Electricians, 10 Helpers",
    quantity: 20,
    fulfilled: 20,
    primaryTrade: "Masons",
    contractorName: "Apex Integrated Civil & Finishing Crew",
    contractorRating: 4.9,
    contractorExperienceYears: 12,
    contractorCoverImage:
      "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=900&auto=format&fit=crop&q=80",
    requestedDate: "19 Jul 2026",
    fulfilledDate: "20 Jul 2026",
    status: "Multi-Contractor Split",
    dailyRate: 920,
    shiftTiming: "8:00 AM – 5:00 PM",
    supervisor: "Rajeev K.",
    logNote:
      "20/20 workers deployed (11 assigned to Apex Integrated + 9 assigned to Malabar Site Crew). Muster verified.",
    isMultiTrade: true,
    isSplitContractor: true,
    splitContractorDetails:
      "11 workers (Apex Integrated) + 9 workers (Malabar Site Crew • 3.2 km away)",
    tradesBreakdown: [
      { trade: "Masons", quantity: 8, fulfilled: 8, dailyRate: 950 },
      { trade: "Electricians", quantity: 2, fulfilled: 2, dailyRate: 1100 },
      { trade: "Helpers", quantity: 10, fulfilled: 10, dailyRate: 650 },
    ],
  },
  {
    id: "REQ-2026-074",
    projectId: "proj-002",
    projectName: "Arjun Villa",
    location: "Kochi, Kerala",
    tradesSummary: "6 Painters",
    quantity: 6,
    fulfilled: 6,
    primaryTrade: "Painters",
    contractorName: "Chroma Finishes & Paint Crew",
    contractorRating: 4.85,
    contractorExperienceYears: 8,
    contractorCoverImage:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&auto=format&fit=crop&q=80",
    requestedDate: "14 Jul 2026",
    fulfilledDate: "15 Jul 2026",
    status: "Fulfilled & Active",
    dailyRate: 850,
    shiftTiming: "8:30 AM – 5:30 PM",
    supervisor: "Manoj P.",
    logNote:
      "Asian Paints certified exterior primer application underway. 6/6 checked in on time.",
  },
  {
    id: "REQ-2026-061",
    projectId: "proj-003",
    projectName: "Marina Office",
    location: "Kozhikode, Kerala",
    tradesSummary: "4 Electricians",
    quantity: 4,
    fulfilled: 4,
    primaryTrade: "Electricians",
    contractorName: "Circuit MEP Solutions",
    contractorRating: 4.95,
    contractorExperienceYears: 14,
    contractorCoverImage:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&auto=format&fit=crop&q=80",
    requestedDate: "09 Jul 2026",
    fulfilledDate: "10 Jul 2026",
    status: "Handed Over",
    dailyRate: 1100,
    shiftTiming: "9:00 AM – 6:00 PM",
    supervisor: "Shafeeq M.",
    logNote:
      "Class-B DB termination & circuit insulation resistance test completed cleanly.",
  },
  {
    id: "REQ-2026-048",
    projectId: "proj-004",
    projectName: "Green Courtyard",
    location: "Thrissur, Kerala",
    tradesSummary: "5 Carpenters",
    quantity: 5,
    fulfilled: 5,
    primaryTrade: "Carpenters",
    contractorName: "Forma Woodworks",
    contractorRating: 4.9,
    contractorExperienceYears: 11,
    contractorCoverImage:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&auto=format&fit=crop&q=80",
    requestedDate: "01 Jul 2026",
    fulfilledDate: "02 Jul 2026",
    status: "Handed Over",
    dailyRate: 980,
    shiftTiming: "8:00 AM – 5:00 PM",
    supervisor: "Arun S.",
    logNote:
      "Hardwood door frames fixed across ground floor & window shutter alignment approved.",
  },
  {
    id: "REQ-2026-035",
    projectId: "proj-001",
    projectName: "Nila Residence",
    location: "Thiruvananthapuram, Kerala",
    tradesSummary: "4 Tile Workers, 2 Helpers",
    quantity: 6,
    fulfilled: 6,
    primaryTrade: "Tile workers",
    contractorName: "Master Tiling & Stone Guild",
    contractorRating: 4.88,
    contractorExperienceYears: 10,
    contractorCoverImage:
      "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=900&auto=format&fit=crop&q=80",
    requestedDate: "20 Jun 2026",
    fulfilledDate: "21 Jun 2026",
    status: "Completed",
    dailyRate: 950,
    shiftTiming: "8:00 AM – 5:00 PM",
    supervisor: "Rajeev K.",
    logNote:
      "Ground floor vitrified tile laying & laser levelling completed without defect.",
  },
  {
    id: "REQ-2026-019",
    projectId: "proj-002",
    projectName: "Arjun Villa",
    location: "Kochi, Kerala",
    tradesSummary: "3 Plumbers",
    quantity: 3,
    fulfilled: 3,
    primaryTrade: "Plumbers",
    contractorName: "Hydro Sanitations & Piping",
    contractorRating: 4.92,
    contractorExperienceYears: 13,
    contractorCoverImage:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&auto=format&fit=crop&q=80",
    requestedDate: "10 Jun 2026",
    fulfilledDate: "11 Jun 2026",
    status: "Completed",
    dailyRate: 1050,
    shiftTiming: "8:30 AM – 5:30 PM",
    supervisor: "Manoj P.",
    logNote:
      "Hydrostatic pressure test passed at 8 bar. Underground CPVC lines pressure verified.",
  },
];

export function RequestHistoryWorkspace() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrade, setSelectedTrade] = useState("all");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [inspectingItem, setInspectingItem] = useState<RequestHistoryItem | null>(null);

  const projectsList = useMemo(() => {
    return Array.from(
      new Map(MOCK_HISTORICAL_RECORDS.map((r) => [r.projectId, r.projectName]))
    );
  }, []);

  const filteredRecords = useMemo(() => {
    return MOCK_HISTORICAL_RECORDS.filter((r) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.projectName.toLowerCase().includes(q) ||
        r.tradesSummary.toLowerCase().includes(q) ||
        r.contractorName.toLowerCase().includes(q) ||
        r.supervisor.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q);

      const matchesTrade =
        selectedTrade === "all" ||
        r.primaryTrade.toLowerCase().includes(selectedTrade.toLowerCase()) ||
        r.tradesSummary.toLowerCase().includes(selectedTrade.toLowerCase());

      const matchesProject =
        selectedProject === "all" || r.projectId === selectedProject;

      const matchesStatus =
        selectedStatus === "all" ||
        r.status.toLowerCase().includes(selectedStatus.toLowerCase());

      return matchesSearch && matchesTrade && matchesProject && matchesStatus;
    });
  }, [searchQuery, selectedTrade, selectedProject, selectedStatus]);

  const totalWorkersDeployed = useMemo(
    () => filteredRecords.reduce((acc, r) => acc + r.fulfilled, 0),
    [filteredRecords]
  );

  return (
    <div className={`workspace-container ${styles.handsLandingPage}`}>
      {/* ── Sticky Top Header Bar ── */}
      <HandsPageHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* ── Sub Navigation Tabs ── */}
      <div style={{ marginTop: 12, marginBottom: 16 }}>
        <HandsPageTabs
          activeTab="requests"
          onSelect={(tab) => router.push(`/hands?tab=${tab}`)}
        />
      </div>

      {/* ── Top Navigation Bar ── */}
      <div className={styles.historyWorkspaceHeader}>
        <div className={styles.historyBreadcrumbRow}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => router.push("/hands?tab=requests")}
          >
            <ArrowLeft size={14} />
            <span>Back to Requests</span>
          </button>
          <span className={styles.breadcrumbDivider}>/</span>
          <span className={styles.breadcrumbCurrent}>Workforce Request History</span>
        </div>

        <div className={styles.historyHeaderActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              const csvData = filteredRecords
                .map((r) => `${r.id},"${r.projectName}","${r.tradesSummary}",${r.fulfilled},"${r.contractorName}","${r.fulfilledDate}"`)
                .join("\n");
              const blob = new Blob([`ID,Project,Trades,Quantity,Contractor,FulfilledDate\n${csvData}`], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `kallisto-request-history-${Date.now()}.csv`;
              a.click();
            }}
          >
            <Download size={14} />
            <span>Export History CSV</span>
          </button>
          <button
            type="button"
            className={styles.primaryDashboardBtn}
            onClick={() => router.push("/hands?tab=overview&view=dashboard")}
          >
            <History size={14} />
            <span>Operational Dashboard</span>
          </button>
        </div>
      </div>

      {/* ── Page Hero Title ── */}
      <div className={styles.historyHeroSection}>
        <div className={styles.historyHeroBadge}>
          <History size={15} style={{ color: "#0284c7" }} />
          <span>Historical Trade Registry & Audit Trail</span>
        </div>
        <h2>Workforce Request History</h2>
        <p>
          Authoritative, immutable record of fulfilled site workforce requirements, contractor allocations, split deployments, and supervisor shift logs.
        </p>
      </div>

      {/* ── 4 KPI Telemetry Cards ── */}
      <div className={styles.metricsGrid} style={{ marginBottom: 20 }}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Total Fulfilled Requests</span>
          <strong className={styles.metricValue}>{filteredRecords.length}</strong>
          <span className={styles.metricSub}>All project milestones</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Workers Deployed</span>
          <strong className={styles.metricValue}>{totalWorkersDeployed}</strong>
          <span className={styles.metricSub}>Across active sites</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Avg Fulfillment Speed</span>
          <strong className={styles.metricValue}>1.2 Days</strong>
          <span className={styles.metricSub}>From request to site check-in</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Contractor Compliance</span>
          <strong className={styles.metricValue}>98.6%</strong>
          <span className={styles.metricSub}>Verified muster logs</span>
        </div>
      </div>

      {/* ── Toolbar: Search, Filters & View Mode ── */}
      <div className={styles.deploymentToolbar} style={{ marginBottom: 20 }}>
        <div className={styles.filterGroup} style={{ flexWrap: "wrap", gap: 10 }}>
          {/* Search Pill */}
          <div className={styles.searchPillWrap} style={{ minWidth: 260 }}>
            <Search size={14} className={styles.searchPillIcon} />
            <input
              type="text"
              className={styles.searchPillInput}
              placeholder="Search request ID, project, trade or contractor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.searchPillClearBtn}
                onClick={() => setSearchQuery("")}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Project Filter */}
          <label className={styles.selectControl}>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="all">All Projects</option>
              {projectsList.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
            <ChevronDown size={13} />
          </label>

          {/* Trade Filter */}
          <label className={styles.selectControl}>
            <select
              value={selectedTrade}
              onChange={(e) => setSelectedTrade(e.target.value)}
            >
              <option value="all">All Trades</option>
              <option value="Masons">Masons</option>
              <option value="Electricians">Electricians</option>
              <option value="Carpenters">Carpenters</option>
              <option value="Painters">Painters</option>
              <option value="Plumbers">Plumbers</option>
              <option value="Tile workers">Tile workers</option>
              <option value="Helpers">Helpers</option>
            </select>
            <ChevronDown size={13} />
          </label>

          {/* Status Filter */}
          <label className={styles.selectControl}>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Active">Fulfilled & Active</option>
              <option value="Handed Over">Handed Over</option>
              <option value="Split">Multi-Contractor Split</option>
              <option value="Completed">Completed</option>
            </select>
            <ChevronDown size={13} />
          </label>
        </div>

        {/* View Mode Toggle */}
        <div className={styles.viewModeToggle}>
          <button
            type="button"
            className={`${styles.viewModeBtn} ${viewMode === "grid" ? styles.viewModeBtnActive : ""}`}
            onClick={() => setViewMode("grid")}
            title="Cards grid view"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            type="button"
            className={`${styles.viewModeBtn} ${viewMode === "table" ? styles.viewModeBtnActive : ""}`}
            onClick={() => setViewMode("table")}
            title="Table list view"
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* ── Main Content: Grid View or Table View ── */}
      {filteredRecords.length > 0 ? (
        viewMode === "grid" ? (
          <div className={styles.requestCardsGrid}>
            {filteredRecords.map((item) => (
              <article
                key={item.id}
                className={styles.workforceRequestCard}
                style={{ cursor: "pointer" }}
                onClick={() => setInspectingItem(item)}
              >
                <div className={styles.reqCardMedia}>
                  {item.contractorCoverImage ? (
                    <div className={styles.reqCardImageWrap}>
                      <Image
                        src={item.contractorCoverImage}
                        alt={`${item.contractorName} cover`}
                        fill
                        className={styles.reqCardImage}
                        unoptimized
                      />
                      <div className={styles.reqCardOverlayDark} />
                    </div>
                  ) : null}

                  <div className={styles.reqCardRatingBadge}>
                    <Star size={11} className={styles.reqStarIcon} />
                    <span>{item.contractorRating.toFixed(1)}</span>
                  </div>

                  <div className={styles.reqProjectTagsRow}>
                    <div className={styles.reqProjectTag}>
                      <span>{item.projectName}</span>
                    </div>
                    {item.isSplitContractor && (
                      <div className={styles.reqMultiTradeTag} style={{ background: "#0284c7" }}>
                        <Layers3 size={11} />
                        <span>Multi-Contractor Split</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.reqCardBody}>
                  <div className={styles.reqCardHeaderRow}>
                    <div>
                      <h3 className={styles.reqCardTitle}>{item.contractorName}</h3>
                      <div className={styles.reqCardSubtitle}>
                        <span className={styles.reqTradeBadge}>{item.tradesSummary}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.reqMetricsRow}>
                    <div className={styles.reqMetricCol}>
                      <strong className={styles.reqMetricValue}>{item.fulfilled} workers</strong>
                      <span className={styles.reqMetricLabel}>deployed</span>
                    </div>
                    <div className={styles.reqMetricDivider} />
                    <div className={styles.reqMetricCol}>
                      <strong className={styles.reqMetricValue}>{item.fulfilledDate}</strong>
                      <span className={styles.reqMetricLabel}>fulfilled</span>
                    </div>
                    <div className={styles.reqMetricDivider} />
                    <div className={styles.reqMetricCol}>
                      <strong className={styles.reqMetricValue}>₹{item.dailyRate}/d</strong>
                      <span className={styles.reqMetricLabel}>rate</span>
                    </div>
                  </div>

                  {item.logNote && (
                    <div className={styles.historyItemLog}>
                      <strong>Supervisor {item.supervisor}:</strong> {item.logNote}
                    </div>
                  )}

                  <div className={styles.reqCardBottomRow}>
                    <span className={`${styles.reqStatusBadge} ${styles.requestStatusFulfilled}`}>
                      <span className={styles.reqStatusDot} />
                      {item.status}
                    </span>
                    <button
                      type="button"
                      className={styles.reqActionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectingItem(item);
                      }}
                    >
                      <span>Inspect log</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.historyTableContainer}>
            <table className={styles.historyTable}>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Project & Location</th>
                  <th>Trade Breakdown</th>
                  <th>Deployed</th>
                  <th>Contractor</th>
                  <th>Fulfilled Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((item) => (
                  <tr key={item.id} onClick={() => setInspectingItem(item)} style={{ cursor: "pointer" }}>
                    <td style={{ fontWeight: 650 }}>{item.id}</td>
                    <td>
                      <div><strong>{item.projectName}</strong></div>
                      <span style={{ fontSize: 11, color: "#64748b" }}>{item.location}</span>
                    </td>
                    <td>{item.tradesSummary}</td>
                    <td style={{ fontWeight: 600 }}>{item.fulfilled} workers</td>
                    <td>{item.contractorName}</td>
                    <td>{item.fulfilledDate}</td>
                    <td>
                      <span className={styles.historyItemBadge}>
                        ✓ {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectingItem(item);
                        }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className={styles.compactEmptyState}>
          <h3>No historical requests match your filters</h3>
          <p>Try clearing your search query or trade filter.</p>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              setSearchQuery("");
              setSelectedTrade("all");
              setSelectedProject("all");
              setSelectedStatus("all");
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* ── History Inspector Drawer ── */}
      {inspectingItem && (
        <div
          className={styles.historyModalOverlay}
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setInspectingItem(null);
          }}
        >
          <div className={styles.historyModal}>
            <div className={styles.historyModalHeader}>
              <div className={styles.historyModalTitleWrap}>
                <History size={18} style={{ color: "#0284c7" }} />
                <div>
                  <h3 id="history-drawer-title">Request Audit Log — {inspectingItem.id}</h3>
                  <p className={styles.historyModalSubtitle}>
                    {inspectingItem.projectName} • {inspectingItem.location}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={styles.historyModalCloseBtn}
                onClick={() => setInspectingItem(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.historyListBody}>
              <div className={styles.historyItemCard}>
                <strong>Requirement Summary</strong>
                <p style={{ margin: 0, fontSize: 12, color: "#475569" }}>
                  {inspectingItem.tradesSummary} ({inspectingItem.fulfilled} workers deployed)
                </p>
              </div>

              <div className={styles.historyItemCard}>
                <strong>Contractor & Fulfillment Details</strong>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#475569" }}>
                  Contractor: <strong>{inspectingItem.contractorName}</strong> ({inspectingItem.contractorRating}★)<br />
                  {inspectingItem.splitContractorDetails ? (
                    <span style={{ color: "#0284c7", fontWeight: 600 }}>
                      Split Allocation: {inspectingItem.splitContractorDetails}
                    </span>
                  ) : (
                    <span>Assigned 100% capacity</span>
                  )}
                </p>
              </div>

              <div className={styles.historyItemLog}>
                <strong>Supervisor Shift Audit Log ({inspectingItem.supervisor}):</strong><br />
                {inspectingItem.logNote}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
