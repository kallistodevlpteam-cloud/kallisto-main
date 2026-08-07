"use client";

import { Copy, MoreHorizontal, Pause, Pencil, Trash2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { basicsRequirementRepository } from "../repositories/basics-repositories";
import type {
  BasicsRequirement,
  BasicsRequirementStatus,
  CreateRequirementInput,
} from "../types/basics.types";
import { formatDate } from "../utils/basics-formatters";
import {
  BasicsEmptyState,
  BasicsLoadingSkeleton,
  BasicsStateView,
  BasicsStatusBadge,
} from "./basics-shared";
import styles from "./basics-workspace.module.css";

const STATUS_TABS: { label: string; value?: BasicsRequirementStatus }[] = [
  { label: "All" },
  { label: "Draft", value: "draft" },
  { label: "Open", value: "open" },
  { label: "Reviewing", value: "reviewing" },
  { label: "Awarded", value: "awarded" },
  { label: "Closed", value: "closed" },
];

export function RequirementsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") as BasicsRequirementStatus | null) ?? undefined;
  const [requirements, setRequirements] = useState<BasicsRequirement[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "success" | "error" | "offline">("loading");
  const [refreshKey, setRefreshKey] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    void basicsRequirementRepository.listRequirements({ status, ownerId: "user-current" }).then(
      (items) => {
        if (!cancelled) {
          setRequirements(items);
          setLoadState("success");
        }
      },
      () => {
        if (!cancelled) {
          setLoadState(typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "error");
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [refreshKey, status]);

  const refresh = useCallback(() => setRefreshKey((current) => current + 1), []);

  async function duplicate(requirement: BasicsRequirement) {
    const input: CreateRequirementInput = {
      projectId: requirement.projectId,
      projectName: requirement.projectName,
      title: `${requirement.title} copy`,
      category: requirement.category,
      specialization: requirement.specialization,
      description: requirement.description,
      deliverables: requirement.deliverables,
      projectType: requirement.projectType,
      location: requirement.location,
      builtUpArea: requirement.builtUpArea,
      numberOfFloors: requirement.numberOfFloors,
      projectStage: requirement.projectStage,
      engagementMode: requirement.engagementMode,
      budgetMin: requirement.budgetMin,
      budgetMax: requirement.budgetMax,
      currency: requirement.currency,
      expectedStartDate: requirement.expectedStartDate,
      expectedCompletionDate: requirement.expectedCompletionDate,
      visibility: "private",
      status: "draft",
      ownerId: requirement.ownerId,
      invitedProviderIds: [],
      attachments: [...requirement.attachments],
    };
    await basicsRequirementRepository.createRequirement(input);
    setNotice("A private draft copy was created.");
    refresh();
  }

  async function updateStatus(
    requirement: BasicsRequirement,
    nextStatus: BasicsRequirementStatus,
    actionLabel: string,
  ) {
    if (
      ["closed", "cancelled"].includes(nextStatus) &&
      !window.confirm(
        `${actionLabel} "${requirement.title}"? Proposal history will be retained.`,
      )
    ) {
      return;
    }
    await basicsRequirementRepository.updateRequirement(requirement.id, {
      status: nextStatus,
    });
    setNotice(`${requirement.title} was ${actionLabel.toLowerCase()}.`);
    refresh();
  }

  async function deleteDraft(requirement: BasicsRequirement) {
    if (!window.confirm(`Delete the draft "${requirement.title}"? This cannot be undone.`)) return;
    await basicsRequirementRepository.deleteDraft(requirement.id);
    setNotice("The draft requirement was deleted.");
    refresh();
  }

  function updateStatusFilter(value?: BasicsRequirementStatus) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("status", value);
    else params.delete("status");
    router.push(params.toString() ? `/basics/requirements?${params.toString()}` : "/basics/requirements");
  }

  return (
    <>
      <div className={styles.statusTabs} aria-label="Requirement status filters">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            className={`${styles.filterChip} ${
              status === tab.value ? styles.filterChipActive : ""
            }`}
            aria-pressed={status === tab.value}
            onClick={() => updateStatusFilter(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {notice ? (
        <div className={`${styles.notice} ${styles.noticeSuccess}`} role="status">
          {notice}
          <button type="button" className={styles.tertiaryButton} onClick={() => setNotice("")}>
            Dismiss
          </button>
        </div>
      ) : null}

      {loadState === "loading" ? <BasicsLoadingSkeleton label="Loading requirements" /> : null}
      {loadState === "error" ? (
        <BasicsStateView state="error" title="Requirements could not be loaded" description="The requirement repository returned an unexpected error." retryHref="/basics/requirements" />
      ) : null}
      {loadState === "offline" ? (
        <BasicsStateView state="offline" title="You appear to be offline" description="Reconnect to load requirement and proposal counts." retryHref="/basics/requirements" />
      ) : null}
      {loadState === "success" && requirements.length === 0 ? (
        <BasicsEmptyState title="No requirements in this view" description="Create a structured professional service requirement or choose another status." actionLabel="Post a requirement" href="/basics/requirements/new" />
      ) : null}

      {loadState === "success" && requirements.length > 0 ? (
        <>
          <div className={`${styles.tableCard} ${styles.desktopTable}`}>
            <div className={`${styles.tableHeader} ${styles.requirementsColumns}`}>
              <span>Requirement</span><span>Category</span><span>Created</span><span>Proposals</span><span>Status</span><span />
            </div>
            {requirements.map((requirement) => (
              <div className={`${styles.tableRow} ${styles.requirementsColumns}`} key={requirement.id}>
                <Link className={styles.primaryCell} href={`/basics/requirements/${requirement.id}`}>
                  <strong>{requirement.title}</strong>
                  <span>{requirement.projectName ?? "No project"} · closes {formatDate(requirement.closesAt)}</span>
                </Link>
                <span className={styles.cellMuted}>{requirement.specialization}</span>
                <span className={styles.cellMuted}>{formatDate(requirement.createdAt)}</span>
                <span className={styles.numeric}>{requirement.proposalCount} · {requirement.shortlistedProposalIds.length} shortlisted</span>
                <span><BasicsStatusBadge status={requirement.status} /><span className={styles.cellMuted}>{requirement.visibility.replaceAll("_", " ")}</span></span>
                <RequirementActions
                  requirement={requirement}
                  onDuplicate={() => void duplicate(requirement)}
                  onUpdateStatus={(nextStatus, label) => void updateStatus(requirement, nextStatus, label)}
                  onDelete={() => void deleteDraft(requirement)}
                />
              </div>
            ))}
          </div>
          <div className={styles.mobileOnly}>
            {requirements.map((requirement) => (
              <article className={styles.mobileDataCard} key={requirement.id}>
                <div className={styles.sectionHeader}>
                  <div><strong className={styles.cardTitle}>{requirement.title}</strong><p>{requirement.projectName ?? "No project"}</p></div>
                  <BasicsStatusBadge status={requirement.status} />
                </div>
                <dl className={styles.detailList}>
                  <div><dt>Service</dt><dd>{requirement.specialization}</dd></div>
                  <div><dt>Proposals</dt><dd>{requirement.proposalCount}</dd></div>
                  <div><dt>Closes</dt><dd>{formatDate(requirement.closesAt)}</dd></div>
                </dl>
                <div className={styles.cardFooter}>
                  <Link className={styles.secondaryButton} href={`/basics/requirements/${requirement.id}`}>View</Link>
                  <RequirementActions
                    requirement={requirement}
                    onDuplicate={() => void duplicate(requirement)}
                    onUpdateStatus={(nextStatus, label) => void updateStatus(requirement, nextStatus, label)}
                    onDelete={() => void deleteDraft(requirement)}
                  />
                </div>
              </article>
            ))}
          </div>
        </>
      ) : null}
    </>
  );
}

function RequirementActions({
  requirement,
  onDuplicate,
  onUpdateStatus,
  onDelete,
}: {
  requirement: BasicsRequirement;
  onDuplicate: () => void;
  onUpdateStatus: (status: BasicsRequirementStatus, label: string) => void;
  onDelete: () => void;
}) {
  return (
    <details className={styles.actionMenu}>
      <summary className={styles.iconButton} aria-label={`Actions for ${requirement.title}`}>
        <MoreHorizontal size={14} aria-hidden="true" />
      </summary>
      <div className={styles.menuPopover}>
        <Link className={styles.menuItem} href={`/basics/requirements/new?edit=${requirement.id}`}>
          <Pencil size={12} aria-hidden="true" /> Edit
        </Link>
        <button type="button" className={styles.menuItem} onClick={onDuplicate}>
          <Copy size={12} aria-hidden="true" /> Duplicate
        </button>
        {requirement.status === "open" ? (
          <button type="button" className={styles.menuItem} onClick={() => onUpdateStatus("reviewing", "Paused for review")}>
            <Pause size={12} aria-hidden="true" /> Pause responses
          </button>
        ) : null}
        {!["closed", "cancelled", "awarded", "draft"].includes(requirement.status) ? (
          <button type="button" className={styles.menuItem} onClick={() => onUpdateStatus("closed", "Closed")}>
            <XCircle size={12} aria-hidden="true" /> Close
          </button>
        ) : null}
        {!["cancelled", "awarded", "closed"].includes(requirement.status) ? (
          <button type="button" className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={() => onUpdateStatus("cancelled", "Cancelled")}>
            <XCircle size={12} aria-hidden="true" /> Cancel
          </button>
        ) : null}
        {requirement.status === "draft" ? (
          <button type="button" className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={onDelete}>
            <Trash2 size={12} aria-hidden="true" /> Delete draft
          </button>
        ) : null}
      </div>
    </details>
  );
}
