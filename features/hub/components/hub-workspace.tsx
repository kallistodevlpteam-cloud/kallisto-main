"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { getHubWorkspaceData } from "../services/hub.mock";
import type {
  HubQueryState,
  HubWorkspaceData,
  MaterialRequest,
  ProcurementAlert,
  RecentSupplier,
  UpcomingDelivery,
} from "../types/hub.types";
import { filterMaterialRequests } from "../utils/filter-material-requests";
import {
  DEFAULT_HUB_QUERY_STATE,
  parseHubQuery,
  serializeHubQuery,
} from "../utils/hub-query-state";
import { HubHeader } from "./hub-header";
import {
  HubQuickActions,
  type HubQuickActionId,
} from "./hub-quick-actions";
import { MaterialRequestTable } from "./material-request-table";
import { MaterialRequestToolbar } from "./material-request-toolbar";
import { ProcurementAttentionPanel } from "./procurement-attention-panel";
import { ProcurementOverview } from "./procurement-overview";
import { ProcurementPipeline } from "./procurement-pipeline";
import { RecentSuppliers } from "./recent-suppliers";
import styles from "./hub-workspace.module.css";

export type HubWorkspaceLoader = () => Promise<HubWorkspaceData>;

interface HubWorkspaceProps {
  loadWorkspace?: HubWorkspaceLoader;
}

function scrollToElement(elementId: string) {
  const target = document.getElementById(elementId);
  target?.scrollIntoView?.({ behavior: "smooth", block: "start" });
}

export function HubWorkspace({
  loadWorkspace = getHubWorkspaceData,
}: HubWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const urlQuery = useMemo(
    () => parseHubQuery(new URLSearchParams(searchParamsKey)),
    [searchParamsKey],
  );

  const [data, setData] = useState<HubWorkspaceData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [localQuery, setLocalQuery] = useState<{
    sourceKey: string;
    value: HubQueryState;
  } | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [activeQuickAction, setActiveQuickAction] =
    useState<HubQuickActionId | null>(null);
  const [liveMessage, setLiveMessage] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);
  const query =
    localQuery?.sourceKey === searchParamsKey ? localQuery.value : urlQuery;

  useEffect(() => {
    let isCurrent = true;

    loadWorkspace()
      .then((workspaceData) => {
        if (isCurrent) {
          setData(workspaceData);
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Procurement data could not be loaded.",
          );
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [loadAttempt, loadWorkspace]);

  const updateQuery = useCallback(
    (update: Partial<HubQueryState>) => {
      const next = { ...query, ...update };
      setLocalQuery({
        sourceKey: searchParamsKey,
        value: next,
      });
      const nextParams = serializeHubQuery(
        next,
        new URLSearchParams(searchParamsKey),
      );
      const nextQuery = nextParams.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    },
    [pathname, query, router, searchParamsKey],
  );

  const filteredRequests = useMemo(
    () => (data ? filterMaterialRequests(data.requests, query) : []),
    [data, query],
  );

  const selectRequest = useCallback((request: MaterialRequest) => {
    setSelectedRequestId(request.id);
    setLiveMessage(
      `${request.name} selected. ${request.actionLabel} is ready.`,
    );
  }, []);

  const handleQuickAction = (action: HubQuickActionId) => {
    setActiveQuickAction(action);

    if (action === "browse") {
      updateQuery({
        project: "all",
        stage: "requirements",
        category: "all",
      });
      setLiveMessage("All project material requirements are now visible.");
      scrollToElement("material-requests");
      return;
    }

    if (action === "compare") {
      updateQuery({ stage: "quotations", status: null });
      setLiveMessage("Quotation requests are now visible.");
      scrollToElement("material-requests");
      return;
    }

    if (action === "track") {
      updateQuery({ stage: "ordered", status: null });
      setLiveMessage("Ordered materials are now visible.");
      scrollToElement("material-requests");
      return;
    }

    updateQuery({ stage: "requirements" });
    setLiveMessage(
      "Material request workspace selected. Search or review the project requirements below.",
    );
    scrollToElement("material-requests");
    searchInputRef.current?.focus();
  };

  const handleAlert = (alert: ProcurementAlert) => {
    if (alert.targetStage) {
      updateQuery({
        project: "all",
        stage: alert.targetStage,
        status: null,
      });
    }
    if (alert.requestId) {
      setSelectedRequestId(alert.requestId);
    }
    setLiveMessage(`${alert.title} selected.`);
    scrollToElement("material-requests");
  };

  const handleDelivery = (delivery: UpcomingDelivery) => {
    updateQuery({ project: "all", stage: "ordered", status: null });
    setSelectedRequestId(delivery.requestId ?? null);
    setLiveMessage(`${delivery.material} delivery selected.`);
    scrollToElement("material-requests");
  };

  const clearFilters = () => {
    setSelectedRequestId(null);
    setActiveQuickAction(null);
    updateQuery(DEFAULT_HUB_QUERY_STATE);
  };

  if (loadError) {
    return (
      <div className="workspace-container">
        <div className={styles.errorState} role="alert">
          <span>
            <AlertTriangle size={22} aria-hidden="true" />
          </span>
          <h1>Hub could not be loaded</h1>
          <p>{loadError}</p>
          <button
            type="button"
            onClick={() => {
              setLoadError(null);
              setLoadAttempt((value) => value + 1);
            }}
          >
            <RefreshCw size={14} aria-hidden="true" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return <HubWorkspaceSkeleton />;
  }

  return (
    <div className="workspace-container">
      <div className={styles.hubWorkspace}>
        <HubHeader
          onExploreHub={() => handleQuickAction("browse")}
          onCreateRequest={() => handleQuickAction("create")}
        />

        <ProcurementOverview
          projects={data.projects}
          metrics={data.metrics}
          selectedProject={query.project}
          onProjectChange={(project) => updateQuery({ project })}
        />

        <HubQuickActions
          activeAction={activeQuickAction}
          onSelect={handleQuickAction}
        />

        <ProcurementPipeline
          stages={data.pipeline}
          activeStage={query.stage}
          onSelect={(stage) => {
            setActiveQuickAction(null);
            updateQuery({ stage, status: null });
          }}
        />

        <section
          className={styles.workspaceSection}
          id="material-requests"
          aria-labelledby="active-material-requests-title"
        >
          <div className={styles.workspaceSectionHeader}>
            <div>
              <h2 id="active-material-requests-title">
                Active material requests
              </h2>
              <p>Review live requirements, quotations and order progress.</p>
            </div>
          </div>
          <MaterialRequestToolbar
            projects={data.projects}
            query={query}
            searchInputRef={searchInputRef}
            onChange={updateQuery}
          />

          <div className={styles.mainWorkspaceGrid}>
            <div className={styles.requestsPanel}>
              <MaterialRequestTable
                requests={filteredRequests}
                selectedRequestId={selectedRequestId}
                totalRequestCount={data.requests.length}
                onSelectRequest={selectRequest}
                onClearFilters={clearFilters}
              />
            </div>
            <ProcurementAttentionPanel
              alerts={data.alerts}
              deliveries={data.deliveries}
              onSelectAlert={handleAlert}
              onSelectDelivery={handleDelivery}
            />
          </div>
        </section>

        <RecentSuppliers
          suppliers={data.suppliers}
          onSelectSupplier={(supplier: RecentSupplier) => {
            setLiveMessage(`${supplier.name} selected.`);
            scrollToElement("recent-suppliers");
          }}
        />

        <p className="sr-only" aria-live="polite">
          {liveMessage}
        </p>
      </div>
    </div>
  );
}

export function HubWorkspaceSkeleton() {
  return (
    <div className="workspace-container">
      <div
        className={`${styles.hubWorkspace} ${styles.skeleton}`}
        aria-label="Loading Hub procurement workspace"
        aria-busy="true"
      >
        <div className={styles.skeletonHeader}>
          <span />
          <span />
        </div>
        <div className={styles.skeletonOverview} />
        <div className={styles.skeletonCards}>
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className={styles.skeletonPipeline} />
        <div className={styles.skeletonWorkspace}>
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
