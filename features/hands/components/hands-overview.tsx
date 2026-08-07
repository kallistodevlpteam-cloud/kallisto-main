"use client";

import {
  AlertTriangle,
  ClipboardList,
  RefreshCw,
  ShieldAlert,
  WifiOff,
} from "lucide-react";
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
import { NeedsAttentionCard } from "./needs-attention-card";
import { OpenRequestsCard } from "./open-requests-card";
import { WorkforceDemandCard } from "./workforce-demand-card";
import { WorkforceRequestDrawer } from "./workforce-request-drawer";
import styles from "./hands-overview.module.css";

type LoadState =
  | "loading"
  | "success"
  | "error"
  | "forbidden"
  | "offline";

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

export function HandsOverview() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = parseHandsTab(searchParams);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [data, setData] = useState<HandsOverviewData | null>(null);
  const [requestDrawerOpen, setRequestDrawerOpen] = useState(false);
  const [selectedDeployment, setSelectedDeployment] =
    useState<Deployment | null>(null);
  const [headerNotice, setHeaderNotice] = useState("");

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

  const handleOpenRequest = useCallback(() => {
    setRequestDrawerOpen(true);
  }, []);

  const handleCloseRequest = useCallback(() => {
    setRequestDrawerOpen(false);
  }, []);

  const handleCloseDeployment = useCallback(() => {
    setSelectedDeployment(null);
  }, []);

  return (
    <div className={`workspace-container ${styles.page}`}>
      <HandsPageHeader
        onRequestWorkforce={handleOpenRequest}
        onOverflowAction={(action) =>
          setHeaderNotice(`${action} will open in the Hands settings workspace.`)
        }
      />

      <HandsPageTabs activeTab={activeTab} onSelect={handleTabChange} />

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
        {activeTab === "overview" ? (
          <>
            {loadState === "loading" ? <HandsOverviewSkeleton /> : null}
            {loadState === "success" && data ? (
              <HandsOverviewContent
                data={data}
                onSelectDeployment={setSelectedDeployment}
                onNavigateTab={handleTabChange}
                onRequestWorkforce={handleOpenRequest}
              />
            ) : null}
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
          </>
        ) : (
          <HandsTabPlaceholder
            tab={activeTab}
            onReturn={() => handleTabChange("overview")}
          />
        )}
      </div>

      {requestDrawerOpen ? (
        <WorkforceRequestDrawer onClose={handleCloseRequest} />
      ) : null}

      {selectedDeployment ? (
        <DeploymentDetailsDrawer
          deployment={selectedDeployment}
          onClose={handleCloseDeployment}
          onNavigateTab={handleTabChange}
        />
      ) : null}
    </div>
  );
}

interface HandsOverviewContentProps {
  data: HandsOverviewData;
  onSelectDeployment: (deployment: Deployment) => void;
  onNavigateTab: (tab: HandsTab) => void;
  onRequestWorkforce: () => void;
}

function HandsOverviewContent({
  data,
  onSelectDeployment,
  onNavigateTab,
  onRequestWorkforce,
}: HandsOverviewContentProps) {
  return (
    <div className={styles.overviewStack}>
      <section className={styles.metricsGrid} aria-label="Hands metrics">
        {data.metrics.map((metric) => (
          <HandsMetricCard key={metric.id} metric={metric} />
        ))}
      </section>

      <div className={styles.operationalGrid}>
        <ActiveDeploymentsCard
          deployments={data.deployments}
          onSelectDeployment={onSelectDeployment}
          onNavigateTab={onNavigateTab}
          onRequestWorkforce={onRequestWorkforce}
        />
        <OpenRequestsCard
          requests={data.requests}
          onNavigateTab={onNavigateTab}
          onRequestWorkforce={onRequestWorkforce}
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
