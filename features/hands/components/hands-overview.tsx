"use client";

import {
  BuildingDuotoneIcon,
  DrawingsDuotoneIcon,
  EnergyDuotoneIcon,
  ExploreDuotoneIcon,
  LayersDuotoneIcon,
  ResolveDuotoneIcon,
  SiteDuotoneIcon,
  UserDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import {
  AlertTriangle,
  ChevronDown,
  ClipboardList,
  Plus,
  RefreshCw,
  ShieldAlert,
  WifiOff,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { loadHandsOverview } from "../services/hands.mock";
import type {
  Deployment,
  HandsOverviewData,
  HandsTab,
  WorkerTrade,
  WorkforceRequest,
  WorkforceRequestDraft,
} from "../types/hands.types";
import {
  parseHandsTab,
  serializeHandsTab,
} from "../utils/hands-query-state";
import { ActiveDeploymentsCard } from "./active-deployments-card";
import { DeploymentDetailsDrawer } from "./deployment-details-drawer";
import { HandsMetricCard } from "./hands-metric-card";
import { HandsPageHeader } from "./hands-page-header";
import { HandsPageTabs } from "./hands-page-tabs";
import { HandsSearchBar } from "./hands-search-bar";
import { NeedsAttentionCard } from "./needs-attention-card";
import { OpenRequestsCard } from "./open-requests-card";
import { RequestDetailsDrawer } from "./request-details-drawer";
import { WorkforceDemandCard } from "./workforce-demand-card";
import { WorkforceRequestDrawer } from "./workforce-request-drawer";
import styles from "./hands-overview.module.css";

type LoadState =
  | "loading"
  | "success"
  | "error"
  | "forbidden"
  | "offline";

interface RequestDrawerConfig {
  initialProjectId?: string;
  initialTrade?: WorkerTrade | string;
  initialWorkerCount?: number | string;
  initialStartDate?: string;
  initialDuration?: string;
  initialValues?: Partial<WorkforceRequestDraft>;
}

const TAB_PLACEHOLDERS: Record<
  Exclude<HandsTab, "overview">,
  { title: string; description: string }
> = {
  requests: {
    title: "Workforce requests",
    description:
      "Create, track and resolve site labour requirements from this workspace.",
  },
  deployments: {
    title: "Workforce deployments",
    description:
      "Review current and planned site assignments, supervisors and deployment dates.",
  },
  attendance: {
    title: "Attendance records",
    description:
      "Daily worker check-ins and supervisor approvals will be managed here.",
  },
  payments: {
    title: "Labour payments",
    description:
      "Review approved attendance, payable labour cost and payment coordination.",
  },
};

const QUICK_SEARCH_TRADES = [
  {
    label: "MEP",
    query: "Electricians",
    icon: EnergyDuotoneIcon,
    accentColor: "#0284c7",
    bgTint: "#f0f9ff",
  },
  {
    label: "Masonry",
    query: "Masons",
    icon: BuildingDuotoneIcon,
    accentColor: "#16a34a",
    bgTint: "#f0fdf4",
  },
  {
    label: "Plumbing",
    query: "Plumbers",
    icon: ResolveDuotoneIcon,
    accentColor: "#0891b2",
    bgTint: "#ecfeff",
  },
  {
    label: "Carpentry",
    query: "Carpenters",
    icon: LayersDuotoneIcon,
    accentColor: "#d97706",
    bgTint: "#fffbeb",
  },
  {
    label: "Steel Fixers",
    query: "Steel Fixers",
    icon: SiteDuotoneIcon,
    accentColor: "#64748b",
    bgTint: "#f8fafc",
  },
  {
    label: "Painting",
    query: "Painters",
    icon: DrawingsDuotoneIcon,
    accentColor: "#e11d48",
    bgTint: "#fff1f2",
  },
  {
    label: "Supervisors",
    query: "Supervisors",
    icon: UserDuotoneIcon,
    accentColor: "#9333ea",
    bgTint: "#faf5ff",
  },
  {
    label: "Surveyors",
    query: "Surveyors",
    icon: ExploreDuotoneIcon,
    accentColor: "#ea580c",
    bgTint: "#fff7ed",
  },
];

export function HandsOverview() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = parseHandsTab(searchParams);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [data, setData] = useState<HandsOverviewData | null>(null);
  const [requestDrawerOpen, setRequestDrawerOpen] = useState(false);
  const [requestDrawerConfig, setRequestDrawerConfig] =
    useState<RequestDrawerConfig | null>(null);
  const [selectedDeployment, setSelectedDeployment] =
    useState<Deployment | null>(null);
  const [selectedRequest, setSelectedRequest] =
    useState<WorkforceRequest | null>(null);
  const [headerNotice, setHeaderNotice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullDashboard, setShowFullDashboard] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void loadHandsOverview().then(
      (overview) => {
        if (!cancelled) {
          setData(overview);
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
  }, []);

  const handleRetry = useCallback(() => {
    setLoadState("loading");

    void loadHandsOverview().then(
      (overview) => {
        setData(overview);
        setLoadState("success");
      },
      () => {
        setLoadState(
          typeof navigator !== "undefined" && !navigator.onLine
            ? "offline"
            : "error",
        );
      },
    );
  }, []);

  const handleTabChange = useCallback(
    (tab: HandsTab) => {
      const params = serializeHandsTab(
        tab,
        new URLSearchParams(searchParams.toString()),
      );
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const handleOpenRequest = useCallback(
    (config?: RequestDrawerConfig) => {
      setRequestDrawerConfig(config ?? null);
      setRequestDrawerOpen(true);
    },
    [],
  );

  const handleCloseRequest = useCallback(() => {
    setRequestDrawerOpen(false);
    setRequestDrawerConfig(null);
  }, []);

  const handleCloseDeployment = useCallback(() => {
    setSelectedDeployment(null);
  }, []);

  const handleRequestWorkersForDeployment = useCallback(
    (deployment: Deployment) => {
      setSelectedDeployment(null);

      const projectIdMap: Record<string, string> = {
        "Nila Residence": "proj-001",
        "Arjun Villa": "proj-002",
        "Marina Office": "proj-003",
        "Green Courtyard": "proj-004",
      };

      const resolvedProjectId =
        deployment.projectId ||
        projectIdMap[deployment.projectName] ||
        "proj-001";

      let parsedTrade: WorkerTrade | "" = "";
      const wfLower = deployment.workforce.toLowerCase();
      if (wfLower.includes("mason")) parsedTrade = "Masons";
      else if (wfLower.includes("helper")) parsedTrade = "Helpers";
      else if (wfLower.includes("painter")) parsedTrade = "Painters";
      else if (wfLower.includes("electric")) parsedTrade = "Electricians";
      else if (wfLower.includes("carpent")) parsedTrade = "Carpenters";
      else if (wfLower.includes("plumb")) parsedTrade = "Plumbers";
      else if (wfLower.includes("weld")) parsedTrade = "Welders";
      else if (wfLower.includes("tile")) parsedTrade = "Tile workers";

      const shortfall =
        deployment.attendance &&
        deployment.attendance.total !== undefined &&
        deployment.attendance.present !== undefined
          ? Math.max(
              0,
              deployment.attendance.total - deployment.attendance.present,
            )
          : undefined;

      const workerCount = shortfall && shortfall > 0 ? shortfall : undefined;
      const isAttention =
        deployment.status === "Needs attention" ||
        (shortfall !== undefined && shortfall > 0);

      handleOpenRequest({
        initialProjectId: resolvedProjectId,
        initialTrade: parsedTrade,
        initialWorkerCount: workerCount,
        initialStartDate: "2026-07-27",
        initialDuration: "1 week",
        initialValues: {
          projectId: resolvedProjectId,
          siteLocation: deployment.location,
          siteContact: deployment.supervisor,
          shiftTiming: deployment.shift,
          notes: isAttention
            ? `Urgent shortfall replacement for ${deployment.projectName}. Attendance shortfall: ${deployment.attendance.present}/${deployment.attendance.total} workers on site.`
            : `Additional workforce requested for ${deployment.projectName} (${deployment.workforce}).`,
        },
      });
    },
    [handleOpenRequest],
  );
  const handleHeroSearch = (q: string, projectId?: string | null) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (projectId) params.set("projectId", projectId);
    const queryString = params.toString();
    router.push(`/hands/trades${queryString ? `?${queryString}` : ""}`);
  };

  const isLanding = activeTab === "overview" && searchParams.get("view") !== "dashboard";

  if (isLanding) {
    return (
      <div className={`workspace-container ${styles.handsLandingPage}`}>
        {/* Top Right Quick Actions */}
        <div className={styles.overviewTopNavActions}>
          <button
            type="button"
            className={styles.handsRoundBtn}
            onClick={() => handleOpenRequest()}
            title="Request Workforce"
            aria-label="Request more workers"
          >
            <Plus size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.primaryDashboardBtn}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("view", "dashboard");
              router.push(`${pathname}?${params.toString()}`);
            }}
            title="Operational Dashboard"
            aria-label="Open Operational Dashboard"
          >
            <ClipboardList size={15} aria-hidden="true" />
            <span>Operational Dashboard</span>
          </button>
        </div>

        {/* Centered Intelligence & Workforce Hub */}
        <section className={styles.grokHeroContainer} aria-label="Kallisto Hands Command Hub">
          {/* Brand Header */}
          <div className={styles.grokBrand}>
            <Image
              src="/kallisto-hands-logo.png"
              alt="Kallisto Hands"
              width={260}
              height={44}
              className={styles.grokHandsLogoImg}
              priority
              unoptimized
            />
            <p className={styles.grokTagline}>
              Deploy verified site workforce, track daily shifts, and manage trade teams with precision.
            </p>
          </div>

          {/* Layered Project Search Card */}
          <div className={styles.grokSearchWrapper}>
            <HandsSearchBar
              onSearch={handleHeroSearch}
              initialQuery={searchQuery}
            />
          </div>

          {/* Quick Search Trade Dock */}
          <nav className={styles.quickSearchDock} aria-label="Quick trade filters">
            {QUICK_SEARCH_TRADES.map((trade) => (
              <button
                key={trade.label}
                type="button"
                className={styles.quickSearchCard}
                onClick={() => handleHeroSearch(trade.query)}
              >
                <span
                  className={styles.quickSearchIconWrap}
                  style={{ background: trade.bgTint, color: trade.accentColor }}
                >
                  <trade.icon size={19} aria-hidden="true" />
                </span>
                <span className={styles.quickSearchLabel}>{trade.label}</span>
              </button>
            ))}
          </nav>
        </section>

        {requestDrawerOpen ? (
          <WorkforceRequestDrawer
            onClose={handleCloseRequest}
            initialProjectId={requestDrawerConfig?.initialProjectId}
            initialTrade={requestDrawerConfig?.initialTrade}
            initialWorkerCount={requestDrawerConfig?.initialWorkerCount}
            initialStartDate={requestDrawerConfig?.initialStartDate}
            initialDuration={requestDrawerConfig?.initialDuration}
            initialValues={requestDrawerConfig?.initialValues}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className={`workspace-container ${styles.page}`}>
      <div className={styles.handsStickyNavArea}>
        <HandsPageHeader
          onRequestWorkforce={() => handleOpenRequest()}
          onOverflowAction={(action) =>
            setHeaderNotice(`${action} will open in the Hands settings workspace.`)
          }
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <HandsPageTabs activeTab={activeTab} onSelect={handleTabChange} />
      </div>

      {headerNotice ? (
        <div className={styles.inlineNotice} role="status">
          {headerNotice}
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setHeaderNotice("")}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div
        id={`hands-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`hands-tab-${activeTab}`}
        className={styles.tabPanel}
      >
        {loadState === "loading" ? <HandsOverviewSkeleton /> : null}
        {loadState === "error" ? (
          <HandsStateView
            icon="error"
            title="Hands overview could not be loaded"
            description="The workforce service returned an unexpected error."
            actionLabel="Retry"
            onAction={handleRetry}
          />
        ) : null}
        {loadState === "offline" ? (
          <HandsStateView
            icon="offline"
            title="You appear to be offline"
            description="Reconnect to load the current workforce, attendance and cost records."
            actionLabel="Try again"
            onAction={handleRetry}
          />
        ) : null}
        {loadState === "forbidden" ? (
          <HandsStateView
            icon="forbidden"
            title="Hands access is restricted"
            description="Your provider account does not have permission to view workforce operations."
          />
        ) : null}

        {loadState === "success" && data ? (
          <>
            {activeTab === "overview" && (
              <HandsOverviewContent
                data={data}
                searchQuery={searchQuery}
                onSelectDeployment={setSelectedDeployment}
                onSelectRequest={setSelectedRequest}
                onNavigateTab={handleTabChange}
                onRequestWorkforce={() => handleOpenRequest()}
              />
            )}
            {activeTab === "deployments" && (
              <div className={styles.overviewStack}>
                <ActiveDeploymentsCard
                  deployments={(data.deployments || []).filter((d) => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      d.projectName.toLowerCase().includes(q) ||
                      d.location.toLowerCase().includes(q) ||
                      d.workforce.toLowerCase().includes(q) ||
                      d.supervisor.toLowerCase().includes(q)
                    );
                  })}
                  onSelectDeployment={setSelectedDeployment}
                  onNavigateTab={handleTabChange}
                  onRequestWorkforce={() => handleOpenRequest()}
                />
              </div>
            )}
            {activeTab === "requests" && (
              <div className={styles.overviewStack}>
                <OpenRequestsCard
                  requests={(data.requests || []).filter((r) => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      r.projectName.toLowerCase().includes(q) ||
                      r.trade.toLowerCase().includes(q)
                    );
                  })}
                  onNavigateTab={handleTabChange}
                  onRequestWorkforce={() => handleOpenRequest()}
                  onSelectRequest={setSelectedRequest}
                />
                <WorkforceDemandCard
                  demand={data.demand}
                  onNavigateTab={handleTabChange}
                />
              </div>
            )}
            {activeTab !== "overview" &&
              activeTab !== "deployments" &&
              activeTab !== "requests" && (
                <HandsTabPlaceholder
                  tab={activeTab}
                  onReturn={() => handleTabChange("overview")}
                />
              )}
          </>
        ) : null}
      </div>

      {requestDrawerOpen ? (
        <WorkforceRequestDrawer
          onClose={handleCloseRequest}
          initialProjectId={requestDrawerConfig?.initialProjectId}
          initialTrade={requestDrawerConfig?.initialTrade}
          initialWorkerCount={requestDrawerConfig?.initialWorkerCount}
          initialStartDate={requestDrawerConfig?.initialStartDate}
          initialDuration={requestDrawerConfig?.initialDuration}
          initialValues={requestDrawerConfig?.initialValues}
        />
      ) : null}

      {selectedDeployment ? (
        <DeploymentDetailsDrawer
          deployment={selectedDeployment}
          onClose={handleCloseDeployment}
          onNavigateTab={handleTabChange}
          onRequestWorkers={handleRequestWorkersForDeployment}
        />
      ) : null}

      {selectedRequest ? (
        <RequestDetailsDrawer
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onNavigateTab={handleTabChange}
          onRequestMore={(req) => {
            setSelectedRequest(null);
            handleOpenRequest({
              initialProjectId: req.projectId,
              initialTrade: req.trade,
              initialWorkerCount:
                req.quantity - req.fulfilled > 0
                  ? req.quantity - req.fulfilled
                  : req.quantity,
              initialStartDate: "2026-07-27",
              initialDuration: req.duration || "2 weeks",
              initialValues: {
                projectId: req.projectId,
                siteLocation: req.location || "",
                trade: req.trade,
                isMultiTrade: req.isMultiTrade,
                tradesBreakdown: req.tradesBreakdown?.map((t) => ({
                  trade: t.trade,
                  workerCount: String(
                    (t.quantity - (t.fulfilled || 0)) > 0
                      ? t.quantity - (t.fulfilled || 0)
                      : t.quantity,
                  ),
                  skillLevel: t.skillLevel,
                })),
                notes: `Additional workforce requested for ${req.projectName} (${req.trade}).`,
              },
            });
          }}
        />
      ) : null}
    </div>
  );
}

interface HandsOverviewContentProps {
  data: HandsOverviewData;
  searchQuery?: string;
  onSelectDeployment: (deployment: Deployment) => void;
  onSelectRequest?: (request: WorkforceRequest) => void;
  onNavigateTab: (tab: HandsTab) => void;
  onRequestWorkforce: () => void;
}

function HandsOverviewContent({
  data,
  searchQuery = "",
  onSelectDeployment,
  onSelectRequest,
  onNavigateTab,
  onRequestWorkforce,
}: HandsOverviewContentProps) {
  const filteredDeployments = (data.deployments || []).filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.projectName.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q) ||
      d.workforce.toLowerCase().includes(q) ||
      d.supervisor.toLowerCase().includes(q)
    );
  });

  const filteredRequests = (data.requests || []).filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.projectName.toLowerCase().includes(q) ||
      r.trade.toLowerCase().includes(q)
    );
  });

  return (
    <div className={styles.overviewStack}>
      <section className={styles.metricsGrid} aria-label="Hands metrics">
        {data.metrics.map((metric) => (
          <HandsMetricCard key={metric.id} metric={metric} />
        ))}
      </section>

      <div className={styles.operationalGrid}>
        <ActiveDeploymentsCard
          deployments={filteredDeployments}
          onSelectDeployment={onSelectDeployment}
          onNavigateTab={onNavigateTab}
          onRequestWorkforce={onRequestWorkforce}
        />
        <OpenRequestsCard
          requests={filteredRequests}
          onNavigateTab={onNavigateTab}
          onRequestWorkforce={onRequestWorkforce}
          onSelectRequest={onSelectRequest}
          defaultViewMode="grid"
        />
      </div>

      <NeedsAttentionCard
        items={data.attentionItems}
        onNavigateTab={onNavigateTab}
      />

      <WorkforceDemandCard
        demand={data.demand}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
}

export function HandsOverviewSkeleton() {
  return (
    <div className={styles.overviewStack} aria-label="Loading Hands overview">
      <section className={styles.metricsGrid}>
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className={styles.metricSkeleton}>
            <span className={styles.skeletonLineShort} />
            <span className={styles.skeletonValue} />
            <span className={styles.skeletonLine} />
          </div>
        ))}
      </section>
      <div className={styles.operationalGrid}>
        <div className={`${styles.sectionCard} ${styles.tableSkeleton}`}>
          <span className={styles.skeletonHeading} />
          {[0, 1, 2, 3].map((item) => (
            <span key={item} className={styles.skeletonRow} />
          ))}
        </div>
        <div className={`${styles.sectionCard} ${styles.requestSkeleton}`}>
          <span className={styles.skeletonHeading} />
          {[0, 1, 2].map((item) => (
            <span key={item} className={styles.skeletonRequest} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface HandsStateViewProps {
  icon: "error" | "forbidden" | "offline";
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

function HandsStateView({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: HandsStateViewProps) {
  const Icon =
    icon === "forbidden"
      ? ShieldAlert
      : icon === "offline"
        ? WifiOff
        : AlertTriangle;

  return (
    <section className={styles.stateView}>
      <span className={styles.stateIcon}>
        <Icon size={23} aria-hidden="true" />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onAction}
        >
          <RefreshCw size={14} aria-hidden="true" />
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}

interface HandsTabPlaceholderProps {
  tab: Exclude<HandsTab, "overview">;
  onReturn: () => void;
}

function HandsTabPlaceholder({
  tab,
  onReturn,
}: HandsTabPlaceholderProps) {
  const placeholder = TAB_PLACEHOLDERS[tab];

  return (
    <section className={styles.placeholderState}>
      <span className={styles.placeholderIcon}>
        <ClipboardList size={22} aria-hidden="true" />
      </span>
      <h2>{placeholder.title}</h2>
      <p>{placeholder.description}</p>
      <button
        type="button"
        className={styles.secondaryButton}
        onClick={onReturn}
      >
        Return to overview
      </button>
    </section>
  );
}
