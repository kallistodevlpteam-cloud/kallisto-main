"use client";

import React from "react";
import type { Deployment } from "../types/hands.types";
import { DeploymentProjectCard } from "./deployment-project-card";
import styles from "./hands-overview.module.css";

interface DeploymentCardsGridProps {
  deployments: Deployment[];
  onSelectDeployment: (deployment: Deployment) => void;
}

export function DeploymentCardsGrid({
  deployments,
  onSelectDeployment,
}: DeploymentCardsGridProps) {
  if (deployments.length === 0) {
    return null;
  }

  return (
    <div
      className={styles.deploymentCardsGrid}
      aria-label="Active deployment cards"
    >
      {deployments.map((deployment) => (
        <DeploymentProjectCard
          key={deployment.id}
          deployment={deployment}
          onSelect={onSelectDeployment}
        />
      ))}
    </div>
  );
}
