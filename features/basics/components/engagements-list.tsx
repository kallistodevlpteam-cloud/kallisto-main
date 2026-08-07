"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  basicsEngagementRepository,
  basicsProviderRepository,
} from "../repositories/basics-repositories";
import type {
  BasicsEngagement,
  BasicsEngagementStatus,
  BasicsProvider,
} from "../types/basics.types";
import { formatDate } from "../utils/basics-formatters";
import {
  BasicsEmptyState,
  BasicsLoadingSkeleton,
  BasicsStateView,
  BasicsStatusBadge,
} from "./basics-shared";
import styles from "./basics-workspace.module.css";

const STATUS_FILTERS: { label: string; value?: BasicsEngagementStatus }[] = [
  { label: "All" },
  { label: "Not Started", value: "not_started" },
  { label: "Active", value: "active" },
  { label: "Awaiting Review", value: "awaiting_review" },
  { label: "Revision Requested", value: "revision_requested" },
  { label: "Completed", value: "completed" },
  { label: "Paused", value: "paused" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Disputed", value: "disputed" },
];

export function EngagementsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") as BasicsEngagementStatus | null) ?? undefined;
  const [engagements, setEngagements] = useState<BasicsEngagement[]>([]);
  const [providers, setProviders] = useState<BasicsProvider[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "success" | "error" | "offline">("loading");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      basicsEngagementRepository.listEngagements({ status }),
      basicsProviderRepository.listProviders(),
    ]).then(
      ([engagementItems, providerItems]) => {
        if (cancelled) return;
        setEngagements(engagementItems);
        setProviders(providerItems);
        setLoadState("success");
      },
      () => {
        if (!cancelled) setLoadState(typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "error");
      },
    );
    return () => {
      cancelled = true;
    };
  }, [status]);

  function updateFilter(value?: BasicsEngagementStatus) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("status", value);
    else params.delete("status");
    router.push(params.toString() ? `/basics/engagements?${params.toString()}` : "/basics/engagements");
  }

  if (loadState === "loading") return <BasicsLoadingSkeleton label="Loading engagements" />;
  if (loadState === "error") return <BasicsStateView state="error" title="Engagements could not be loaded" description="The engagement repository returned an unexpected error." retryHref="/basics/engagements" />;
  if (loadState === "offline") return <BasicsStateView state="offline" title="You appear to be offline" description="Reconnect to load deliverable, milestone and payment status." retryHref="/basics/engagements" />;

  return (
    <>
      <div className={styles.filterChips} aria-label="Engagement status filters">
        {STATUS_FILTERS.map((filter) => (
          <button key={filter.label} type="button" className={`${styles.filterChip} ${status === filter.value ? styles.filterChipActive : ""}`} aria-pressed={status === filter.value} onClick={() => updateFilter(filter.value)}>
            {filter.label}
          </button>
        ))}
      </div>
      {engagements.length === 0 ? (
        <BasicsEmptyState title="No engagements in this view" description="Accept a proposal to create a project-bound specialist engagement, or choose another status." actionLabel="Review proposals" href="/basics/proposals" />
      ) : (
        <>
          <div className={`${styles.tableCard} ${styles.desktopTable}`}>
            <div className={`${styles.tableHeader} ${styles.engagementColumns}`}>
              <span>Engagement</span><span>Provider</span><span>Dates</span><span>Progress</span><span>Status</span><span />
            </div>
            {engagements.map((engagement) => {
              const provider = providers.find((item) => item.id === engagement.providerId);
              const nextDeliverable = engagement.deliverables.find((item) => item.status !== "approved");
              return (
                <div className={`${styles.tableRow} ${styles.engagementColumns}`} key={engagement.id}>
                  <span className={styles.primaryCell}><strong>{engagement.title}</strong><span>{engagement.projectName} · {nextDeliverable?.name ?? "Scope complete"}</span></span>
                  <span className={styles.primaryCell}><strong>{provider?.name ?? "Provider"}</strong><span>{provider?.location.city}</span></span>
                  <span className={styles.cellMuted}>{formatDate(engagement.startDate)} to {formatDate(engagement.expectedCompletionDate)}</span>
                  <span><span className={styles.progressTrack}><span className={styles.progressFill} style={{ width: `${engagement.progress}%` }} /></span><span className={styles.cellMuted}>{engagement.progress}% · {engagement.paymentStatus.replaceAll("_", " ")}</span></span>
                  <span><BasicsStatusBadge status={engagement.status} /></span>
                  <Link className={styles.secondaryButton} href={`/basics/engagements/${engagement.id}`}>Open</Link>
                </div>
              );
            })}
          </div>
          <div className={styles.mobileOnly}>
            {engagements.map((engagement) => {
              const provider = providers.find((item) => item.id === engagement.providerId);
              const nextDeliverable = engagement.deliverables.find((item) => item.status !== "approved");
              return (
                <article className={styles.engagementCard} key={engagement.id}>
                  <div className={styles.sectionHeader}><div><h3>{engagement.title}</h3><p>{provider?.name} · {engagement.projectName}</p></div><BasicsStatusBadge status={engagement.status} /></div>
                  <div className={styles.engagementCardMeta}><span className={styles.metaItem}><strong>{nextDeliverable?.name ?? "Scope complete"}</strong></span><span className={styles.metaItem}>{formatDate(engagement.expectedCompletionDate)}</span></div>
                  <span className={styles.progressTrack}><span className={styles.progressFill} style={{ width: `${engagement.progress}%` }} /></span>
                  <div className={styles.cardFooter}><span className={styles.cellMuted}>{engagement.progress}% complete</span><Link className={styles.secondaryButton} href={`/basics/engagements/${engagement.id}`}>Open <ArrowRight size={12} aria-hidden="true" /></Link></div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

