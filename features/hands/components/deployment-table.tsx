"use client";

import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Deployment, HandsTab } from "../types/hands.types";
import {
  formatAttendance,
  formatInr,
} from "../utils/hands-formatters";
import styles from "./hands-overview.module.css";

interface DeploymentTableProps {
  deployments: Deployment[];
  onSelect: (deployment: Deployment) => void;
  onNavigateTab: (tab: HandsTab) => void;
}

const ROW_ACTIONS = [
  "View deployment",
  "Record attendance",
  "Contact supervisor",
  "Extend deployment",
  "End deployment",
] as const;

export function DeploymentTable({
  deployments,
  onSelect,
  onNavigateTab,
}: DeploymentTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const actionButtonRefs = useRef(new Map<string, HTMLButtonElement>());

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        tableRef.current &&
        !tableRef.current.contains(event.target as Node)
      ) {
        setOpenMenuId(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && openMenuId) {
        setOpenMenuId(null);
        actionButtonRefs.current.get(openMenuId)?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenuId]);

  function handleAction(
    action: (typeof ROW_ACTIONS)[number],
    deployment: Deployment,
  ) {
    setOpenMenuId(null);

    if (action === "Record attendance") {
      onNavigateTab("attendance");
      return;
    }

    onSelect(deployment);
  }

  return (
    <div className={styles.tableViewport} ref={tableRef}>
      <table className={styles.deploymentTable}>
        <caption className={styles.visuallyHidden}>
          Active field workforce deployments
        </caption>
        <colgroup>
          <col className={styles.projectColumn} />
          <col className={styles.workforceColumn} />
          <col className={styles.shiftColumn} />
          <col className={styles.attendanceColumn} />
          <col className={styles.supervisorColumn} />
          <col className={styles.costColumn} />
          <col className={styles.statusColumn} />
          <col className={styles.actionsColumn} />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Project / site</th>
            <th scope="col">Workforce</th>
            <th scope="col" className={styles.tabletOptional}>
              Shift
            </th>
            <th scope="col">Attendance</th>
            <th scope="col" className={styles.tabletOptional}>
              Supervisor
            </th>
            <th scope="col" className={styles.numericCell}>
              Daily cost
            </th>
            <th scope="col">Status</th>
            <th scope="col">
              <span className={styles.visuallyHidden}>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {deployments.map((deployment) => {
            const statusClass =
              deployment.status === "Active"
                ? styles.statusActive
                : deployment.status === "Needs attention"
                  ? styles.statusAttention
                  : styles.statusWaiting;

            return (
              <tr
                key={deployment.id}
                className={styles.deploymentRow}
                tabIndex={0}
                aria-label={`Open deployment for ${deployment.projectName}`}
                onClick={() => onSelect(deployment)}
                onKeyDown={(event) => {
                  if (
                    event.target === event.currentTarget &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    event.preventDefault();
                    onSelect(deployment);
                  }
                }}
              >
                <td>
                  <strong className={styles.projectName}>
                    {deployment.projectName}
                  </strong>
                  <span className={styles.projectLocation}>
                    {deployment.location}
                  </span>
                </td>
                <td>{deployment.workforce}</td>
                <td className={styles.tabletOptional}>{deployment.shift}</td>
                <td>
                  <span
                    className={
                      deployment.attendance.state === "pending"
                        ? styles.pendingText
                        : undefined
                    }
                  >
                    {formatAttendance(deployment.attendance)}
                  </span>
                </td>
                <td className={styles.tabletOptional}>
                  {deployment.supervisor}
                </td>
                <td className={styles.numericCell}>
                  {formatInr(deployment.dailyCost)}
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${statusClass}`}>
                    <span className={styles.statusDot} aria-hidden="true" />
                    {deployment.status}
                  </span>
                </td>
                <td
                  className={styles.rowActionCell}
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    ref={(button) => {
                      if (button) {
                        actionButtonRefs.current.set(deployment.id, button);
                      } else {
                        actionButtonRefs.current.delete(deployment.id);
                      }
                    }}
                    type="button"
                    className={styles.rowActionButton}
                    aria-label={`Actions for ${deployment.projectName}`}
                    aria-haspopup="menu"
                    aria-expanded={openMenuId === deployment.id}
                    onClick={() =>
                      setOpenMenuId((current) =>
                        current === deployment.id ? null : deployment.id,
                      )
                    }
                  >
                    <MoreHorizontal size={16} aria-hidden="true" />
                  </button>
                  {openMenuId === deployment.id ? (
                    <div className={styles.rowActionMenu} role="menu">
                      {ROW_ACTIONS.map((action) => (
                        <button
                          key={action}
                          type="button"
                          role="menuitem"
                          className={styles.menuItem}
                          onClick={() => handleAction(action, deployment)}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
