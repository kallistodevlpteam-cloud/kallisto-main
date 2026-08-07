"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import type {
  Deployment,
  DeploymentStatus,
  HandsTab,
} from "../types/hands.types";
import { DeploymentMobileCard } from "./deployment-mobile-card";
import { DeploymentTable } from "./deployment-table";
import styles from "./hands-overview.module.css";

interface ActiveDeploymentsCardProps {
  deployments: Deployment[];
  onSelectDeployment: (deployment: Deployment) => void;
  onNavigateTab: (tab: HandsTab) => void;
  onRequestWorkforce: () => void;
}

type StatusFilter = DeploymentStatus | "all";

export function ActiveDeploymentsCard({
  deployments,
  onSelectDeployment,
  onNavigateTab,
  onRequestWorkforce,
}: ActiveDeploymentsCardProps) {
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const projects = useMemo(
    () =>
      Array.from(
        new Map(
          deployments.map((deployment) => [
            deployment.projectId,
            deployment.projectName,
          ]),
        ),
      ),
    [deployments],
  );

  const filteredDeployments = useMemo(
    () =>
      deployments.filter(
        (deployment) =>
          (projectFilter === "all" ||
            deployment.projectId === projectFilter) &&
          (statusFilter === "all" || deployment.status === statusFilter),
      ),
    [deployments, projectFilter, statusFilter],
  );

  const hasFilters = projectFilter !== "all" || statusFilter !== "all";

  return (
    <section
      className={`${styles.sectionCard} ${styles.deploymentsCard}`}
      aria-labelledby="active-deployments-title"
    >
      <div className={styles.cardHeader}>
        <div>
          <h2 id="active-deployments-title">Active deployments</h2>
          <p>Workers currently assigned to project sites</p>
        </div>
        <button
          type="button"
          className={styles.textButton}
          onClick={() => onNavigateTab("deployments")}
        >
          View all
        </button>
      </div>

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
            <span className={styles.visuallyHidden}>Filter by status</span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
            >
              <option value="all">All statuses</option>
              <option value="Active">Active</option>
              <option value="Needs attention">Needs attention</option>
              <option value="Awaiting check-in">Awaiting check-in</option>
            </select>
            <ChevronDown size={13} aria-hidden="true" />
          </label>
        </div>
      </div>

      {filteredDeployments.length > 0 ? (
        <>
          <div className={styles.desktopDeployments}>
            <DeploymentTable
              deployments={filteredDeployments}
              onSelect={onSelectDeployment}
              onNavigateTab={onNavigateTab}
            />
          </div>
          <div className={styles.mobileDeployments}>
            {filteredDeployments.map((deployment) => (
              <DeploymentMobileCard
                key={deployment.id}
                deployment={deployment}
                onSelect={onSelectDeployment}
              />
            ))}
          </div>
        </>
      ) : (
        <div className={styles.compactEmptyState}>
          <h3>
            {hasFilters
              ? "No deployments match these filters"
              : "No active workforce deployments"}
          </h3>
          <p>
            {hasFilters
              ? "Change or clear the project and status filters."
              : "Request workers and assign them to a project site to begin tracking attendance and cost."}
          </p>
          {hasFilters ? (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => {
                setProjectFilter("all");
                setStatusFilter("all");
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
    </section>
  );
}
